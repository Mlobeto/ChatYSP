const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000],
    },
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id',
    },
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'system', 'game', 'ai'),
    defaultValue: 'text',
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editedAt: {
    type: DataTypes.DATE,
  },
  replyToId: {
    type: DataTypes.UUID,
    references: {
      model: 'messages',
      key: 'id',
    },
  },
  reactions: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['roomId', 'createdAt'],
    },
    {
      fields: ['senderId'],
    },
  ],
});

module.exports = Message;
