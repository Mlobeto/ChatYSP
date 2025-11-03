const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  type: {
    type: DataTypes.ENUM(
      'user_registered',
      'tip_created',
      'tip_updated',
      'video_uploaded',
      'system',
      'general',
    ),
    allowNull: false,
    defaultValue: 'general',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID del objeto relacionado (tip, user, etc.)',
  },
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tipo del objeto relacionado (tip, user, etc.)',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Datos adicionales de la notificación',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración de la notificación',
  },
}, {
  tableName: 'notifications',
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['isRead'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['userId', 'isRead'],
    },
  ],
});

module.exports = Notification;
