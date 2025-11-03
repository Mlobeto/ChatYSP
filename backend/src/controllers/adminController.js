const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const {
  User, Room, Message, Question, Tip,
} = require('../models');
const emailService = require('../services/emailService');
const PasswordUtils = require('../utils/passwordUtils');

const getStats = async (req, res) => {
  try {
    // Get general statistics
    const [
      totalUsers,
      totalRooms,
      totalMessages,
      totalQuestions,
      totalTips,
      onlineUsers,
    ] = await Promise.all([
      User.count(),
      Room.count(),
      Message.count({ where: { isDeleted: false } }),
      Question.count(),
      Tip.count(),
      User.count({ where: { isOnline: true } }),
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      newUsersLastWeek,
      newRoomsLastWeek,
      messagesLastWeek,
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Room.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Message.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo }, isDeleted: false } }),
    ]);

    // Get top users by points
    const topUsers = await User.findAll({
      attributes: ['id', 'username', 'points', 'level', 'gamesWon', 'gamesPlayed'],
      order: [['points', 'DESC']],
      limit: 10,
    });

    // Get most active rooms
    const mostActiveRooms = await Room.findAll({
      attributes: ['id', 'name', 'userCount'],
      include: [{
        model: Message,
        as: 'messages',
        attributes: [],
        where: {
          createdAt: { [Op.gte]: sevenDaysAgo },
          isDeleted: false,
        },
        required: false,
      }],
      group: ['Room.id'],
      order: [[{ model: Message, as: 'messages' }, 'createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      stats: {
        general: {
          totalUsers,
          totalRooms,
          totalMessages,
          totalQuestions,
          totalTips,
          onlineUsers,
        },
        lastWeek: {
          newUsers: newUsersLastWeek,
          newRooms: newRoomsLastWeek,
          messages: messagesLastWeek,
        },
        topUsers,
        mostActiveRooms,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, search, role, isOnline,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (isOnline !== undefined) {
      whereClause.isOnline = isOnline === 'true';
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      users: users.rows,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(users.count / limit),
        totalUsers: users.count,
        hasNext: offset + users.rows.length < users.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Don't allow changing own role
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol',
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: 'Rol de usuario actualizado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Don't allow deactivating own account
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta',
      });
    }

    // Update user status
    await user.update({
      isOnline: false,
      // You might want to add an isActive field for proper deactivation
    });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      username, email, role = 'user', country, phone, sendWelcomeEmail = true,
    } = req.body;

    // Validation
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username y email son requeridos',
      });
    }

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
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

    // Generate temporary password and reset token
    const tempPassword = PasswordUtils.generateTempPassword();
    const resetToken = PasswordUtils.generateResetToken();
    const resetExpires = PasswordUtils.getExpirationTime(24); // 24 horas

    console.log('🔧 createUser - Datos generados:', {
      tempPassword: `${tempPassword.substring(0, 4)}...`,
      resetToken: `${resetToken.substring(0, 10)}...`,
      resetExpires,
    });

    // Create new user
    const user = await User.create({
      username,
      email,
      password: tempPassword, // Será hasheada automáticamente por el hook
      role,
      country: country || null,
      phone: phone || null,
      isTemporaryPassword: true,
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    console.log('👤 createUser - Usuario creado:', {
      id: user.id,
      username: user.username,
      resetPasswordToken: user.resetPasswordToken ? 'Sí guardado' : 'NO guardado',
      resetPasswordExpires: user.resetPasswordExpires,
    });

    // Send welcome email if requested
    if (sendWelcomeEmail) {
      try {
        const resetLink = PasswordUtils.generateResetLink(resetToken);

        await emailService.sendWelcomeEmail({
          to: email,
          username,
          tempPassword,
          resetLink,
        });

        console.log(`📧 Email de bienvenida enviado a: ${email}`);
      } catch (emailError) {
        console.error('❌ Error enviando email de bienvenida:', emailError);
        // No fallar la creación del usuario por un error de email
      }
    }

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user.toJSON();

    res.status(201).json({
      success: true,
      message: sendWelcomeEmail
        ? 'Usuario creado exitosamente. Email de bienvenida enviado.'
        : 'Usuario creado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      username, email, role, country, phone,
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Don't allow changing own role to non-admin
    if (user.id === req.user.id && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol de administrador',
      });
    }

    // Validate role
    if (role && !['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
      });
    }

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const whereClause = {
        id: { [Op.ne]: userId },
        [Op.or]: [],
      };

      if (username) whereClause[Op.or].push({ username });
      if (email) whereClause[Op.or].push({ email });

      if (whereClause[Op.or].length > 0) {
        const existingUser = await User.findOne({ where: whereClause });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'El username o email ya existe',
          });
        }
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (country !== undefined) updateData.country = country || null;
    if (phone !== undefined) updateData.phone = phone || null;

    await user.update(updateData);

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user.toJSON();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Don't allow deleting own account
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta',
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getRooms = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, search, roomType,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    if (roomType) {
      whereClause.roomType = roomType;
    }

    const rooms = await Room.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      rooms: rooms.rows,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(rooms.count / limit),
        totalRooms: rooms.count,
        hasNext: offset + rooms.rows.length < rooms.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deactivateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    await room.update({ isActive: false });

    res.json({
      success: true,
      message: 'Sala desactivada exitosamente',
    });
  } catch (error) {
    console.error('Deactivate room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Create Room (Admin Only)
const createRoom = async (req, res) => {
  try {
    console.log('🏠 [ADMIN CREATE ROOM] Iniciando creación de sala...');
    console.log('📋 Body recibido:', req.body);
    console.log('👤 Usuario admin:', {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });

    const {
      name, description, roomType = 'public', maxUsers = 50, password, country,
    } = req.body;
    const userId = req.user.id;

    console.log('🔧 Datos procesados:', {
      name,
      description,
      roomType,
      maxUsers,
      hasPassword: !!password,
      country,
      userId,
    });

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      console.log('🔐 Hasheando contraseña...');
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      console.log('✅ Contraseña hasheada exitosamente');
    }

    console.log('💾 Creando sala en base de datos...');
    // Create room with country assignment
    const room = await Room.create({
      name,
      description,
      roomType,
      maxUsers,
      password: hashedPassword,
      createdById: userId,
      userCount: 0, // Admin doesn't auto-join
      country: country || null, // Country-specific room
    });

    console.log('✅ Sala creada con ID:', room.id);
    console.log('🔍 Obteniendo datos completos de la sala...');

    // Get room with creator info
    const fullRoom = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    console.log('📊 Sala completa obtenida:', fullRoom ? 'SÍ' : 'NO');

    const roomData = fullRoom.toJSON();

    console.log('📤 Enviando respuesta exitosa...');
    res.status(201).json({
      success: true,
      message: 'Sala creada exitosamente por administrador',
      room: {
        ...roomData,
        password: !!room.password,
      },
    });

    console.log('🎉 [ADMIN CREATE ROOM] Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ [ADMIN CREATE ROOM] Error:', error);
    console.error('📍 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Assign moderator role to user
const assignModerator = async (req, res) => {
  try {
    const { userId } = req.params;
    const { country, roomId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // If roomId is provided, validate the room and check if it already has a moderator
    if (roomId) {
      const room = await Room.findByPk(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Sala no encontrada',
        });
      }

      if (room.moderatorId) {
        return res.status(400).json({
          success: false,
          message: 'Esta sala ya tiene un moderador asignado',
        });
      }

      // Verify that the room country matches the moderator country
      if (room.country && room.country !== country) {
        return res.status(400).json({
          success: false,
          message: 'El país del moderador debe coincidir con el país de la sala',
        });
      }

      // Update room with moderator
      await room.update({ moderatorId: userId });
    }

    // Update user role and country
    await user.update({
      role: 'moderator',
      country,
    });

    const successMessage = `Usuario ${user.username} asignado como moderador para ${country}`;
    const roomMessage = roomId ? ' y asignado a la sala especificada' : '';

    res.json({
      success: true,
      message: successMessage + roomMessage,
    });
  } catch (error) {
    console.error('Assign moderator error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Create country-specific room with moderator
const createCountryRoom = async (req, res) => {
  try {
    const {
      name, description, country, moderatorId,
    } = req.body;
    const userId = req.user.id;

    // Validate moderator if provided
    if (moderatorId) {
      const moderator = await User.findByPk(moderatorId);
      if (!moderator || moderator.role !== 'moderator' || moderator.country !== country) {
        return res.status(400).json({
          success: false,
          message: 'Moderador inválido para este país',
        });
      }

      // Check if moderator is already assigned to another room
      const existingRoom = await Room.findOne({
        where: { moderatorId, isActive: true },
      });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Este moderador ya está asignado a otra sala activa',
        });
      }
    }

    // Create country-specific room
    const room = await Room.create({
      name: `${name} (${country})`,
      description: description || `Sala oficial para ${country}`,
      roomType: 'public',
      maxUsers: 100,
      createdById: userId,
      userCount: 0,
      country,
      moderatorId: moderatorId || null,
    });

    // Get room with creator info
    const fullRoom = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: `Sala para ${country} creada exitosamente`,
      room: fullRoom,
    });
  } catch (error) {
    console.error('Create country room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const {
      page = 1, limit = 50, roomId, messageType,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isDeleted: false };

    if (roomId) {
      whereClause.roomId = roomId;
    }

    if (messageType) {
      whereClause.messageType = messageType;
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      messages: messages.rows,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(messages.count / limit),
        totalMessages: messages.count,
        hasNext: offset + messages.rows.length < messages.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
      });
    }

    await message.update({ isDeleted: true });

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const {
      question, options, correctAnswer, category, difficulty, points, tags,
    } = req.body;

    const newQuestion = await Question.create({
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      points,
      tags,
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Pregunta creada exitosamente',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      question, options, correctAnswer, category, difficulty, points, tags, isActive,
    } = req.body;

    const existingQuestion = await Question.findByPk(questionId);

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Pregunta no encontrada',
      });
    }

    await existingQuestion.update({
      ...(question && { question }),
      ...(options && { options }),
      ...(correctAnswer !== undefined && { correctAnswer }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(points !== undefined && { points }),
      ...(tags && { tags }),
      ...(isActive !== undefined && { isActive }),
    });

    res.json({
      success: true,
      message: 'Pregunta actualizada exitosamente',
      question: existingQuestion,
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Pregunta no encontrada',
      });
    }

    await question.destroy();

    res.json({
      success: true,
      message: 'Pregunta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Get rooms without moderator assigned
const getUnassignedRooms = async (req, res) => {
  try {
    const { country } = req.query;

    const whereClause = {
      moderatorId: null,
      isActive: true,
    };

    if (country) {
      whereClause.country = country;
    }

    const rooms = await Room.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      rooms,
      message: `${rooms.length} salas sin moderador asignado`,
    });
  } catch (error) {
    console.error('Get unassigned rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  deactivateUser,
  getRooms,
  createRoom,
  assignModerator,
  createCountryRoom,
  getUnassignedRooms,
  deactivateRoom,
  getMessages,
  deleteMessage,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
