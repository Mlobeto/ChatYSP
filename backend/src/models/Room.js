const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  roomType: {
    type: DataTypes.ENUM('public', 'private', 'game'),
    defaultValue: 'public',
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      allowImages: true,
      allowVoice: false,
      slowMode: 0,
      aiEnabled: true,
    },
  },
  userCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'rooms',
  timestamps: true,
});

module.exports = Room;
