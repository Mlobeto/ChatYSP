const crypto = require('crypto');

class PasswordUtils {
  // Generar contraseña temporal aleatoria
  static generateTempPassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';

    // Asegurar al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
    password += '!@#$%'[Math.floor(Math.random() * 5)]; // Símbolo

    // Rellenar el resto
    for (let i = password.length; i < length; i += 1) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Generar token de reset seguro
  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generar enlace de reset
  static generateResetLink(token) {
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3001';
    return `${frontendUrl}/reset-password?token=${token}`;
  }

  // Calcular tiempo de expiración
  static getExpirationTime(hours = 24) {
    return new Date(Date.now() + (hours * 60 * 60 * 1000));
  }
}

module.exports = PasswordUtils;
