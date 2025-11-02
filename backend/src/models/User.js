const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100],
    },
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin'),
    defaultValue: 'user',
  },
  country: {
    type: DataTypes.ENUM('AR', 'PE', 'MX', 'CO', 'ES'),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isPhoneNumber(value) {
        if (value && !value.match(/^\+[1-9]\d{1,14}$/)) {
          throw new Error('Formato de teléfono inválido. Use formato internacional: +54911234567');
        }
      },
    },
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  gamesWon: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  gamesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.setDataValue('password', await bcrypt.hash(user.password, salt));
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.setDataValue('password', await bcrypt.hash(user.password, salt));
      }
    },
  },
});

// Instance method to compare password
User.prototype.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
