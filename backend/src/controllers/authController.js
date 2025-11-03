const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { validatePhoneForCountry, getCountryFromPhone } = require('../utils/phoneValidation');
const emailService = require('../services/emailService');
const PasswordUtils = require('../utils/passwordUtils');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const register = async (req, res) => {
  try {
    const {
      username, email, password, phone, country,
    } = req.body;

    // Validate phone and country if provided
    if (phone && country) {
      const phoneValidation = validatePhoneForCountry(phone, country);
      if (!phoneValidation.success) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message,
        });
      }
    } else if (phone && !country) {
      // Try to detect country from phone
      const detectedCountry = getCountryFromPhone(phone);
      if (!detectedCountry) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo determinar el país del teléfono. Especifica el país.',
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe',
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      phone: phone || null,
      country: country || (phone ? getCountryFromPhone(phone) : null),
    });

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user.toJSON();

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', { email, password: password ? '[HIDDEN]' : 'NO PASSWORD' });

    // Find user by email
    const user = await User.findOne({ where: { email } });
    console.log('👤 User found:', user
      ? { id: user.id, email: user.email, role: user.role } : 'NOT FOUND');

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password validation:', isPasswordValid ? 'VALID' : 'INVALID');

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Update user status
    await user.update({
      isOnline: true,
      lastSeen: new Date(),
    });

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user.toJSON();

    // Generate token
    const token = generateToken(user.id);
    console.log('🎫 Token generated successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user status
    await User.update(
      {
        isOnline: false,
        lastSeen: new Date(),
      },
      { where: { id: userId } },
    );

    res.json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatar } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Op.ne]: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso',
        });
      }
    }

    // Update user
    await user.update({
      ...(username && { username }),
      ...(avatar !== undefined && { avatar }),
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const {
      username, email, password, adminKey,
    } = req.body;

    // Verify admin registration key (you should set this in your .env file)
    const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || 'ChatYSP-Admin-2024';
    if (!adminKey || adminKey !== ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Clave de administrador inválida',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe',
      });
    }

    // Create new admin user
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin', // Set role as admin
    });

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user.toJSON();

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Administrador registrado exitosamente',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Generate reset token
    const resetToken = PasswordUtils.generateResetToken();
    const resetExpires = PasswordUtils.getExpirationTime(24); // 24 horas

    // Save reset token
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    // Send reset email
    try {
      const resetLink = PasswordUtils.generateResetLink(resetToken);
      await emailService.sendPasswordResetEmail({
        to: email,
        username: user.username,
        resetLink,
        expirationTime: 24,
      });

      res.json({
        success: true,
        message: 'Email de recuperación enviado',
      });
    } catch (emailError) {
      console.error('❌ Error enviando email de reset:', emailError);
      res.status(500).json({
        success: false,
        message: 'Error enviando email de recuperación',
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('🔧 resetPassword - Datos recibidos:', {
      token: token ? `${token.substring(0, 10)}...` : 'no token',
      passwordLength: newPassword ? newPassword.length : 0,
    });

    if (!token || !newPassword) {
      console.log('❌ resetPassword - Faltan datos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos',
      });
    }

    if (newPassword.length < 6) {
      console.log('❌ resetPassword - Contraseña muy corta');
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    console.log('🔍 resetPassword - Buscando usuario con token...');
    console.log('Token recibido:', token);
    console.log('Fecha actual:', new Date());

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    console.log('👤 resetPassword - Usuario encontrado:', !!user);
    // También busquemos sin la restricción de fecha para ver si el token existe
    const userWithoutDateCheck = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });
    console.log('🕐 Usuario con token (sin verificar fecha):', !!userWithoutDateCheck);
    if (userWithoutDateCheck) {
      console.log('🕐 Token expira:', userWithoutDateCheck.resetPasswordExpires);
      const isExpired = userWithoutDateCheck.resetPasswordExpires < new Date();
      console.log('🕐 ¿Token expirado?:', isExpired);
    }

    if (!user) {
      console.log('❌ resetPassword - Token inválido o expirado');
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado',
      });
    }

    console.log('🔄 resetPassword - Actualizando contraseña...');
    // Update password and clear reset fields
    await user.update({
      password: newPassword, // Será hasheada por el hook
      resetPasswordToken: null,
      resetPasswordExpires: null,
      isTemporaryPassword: false,
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  registerAdmin,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
