const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GameInvitation = sequelize.define('GameInvitation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameRoomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'game_rooms',
      key: 'id',
    },
  },
  inviterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  invitedId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 200],
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired'),
    defaultValue: 'pending',
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => {
      // Expire invitation after 5 minutes
      const expireTime = new Date();
      expireTime.setMinutes(expireTime.getMinutes() + 5);
      return expireTime;
    },
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'game_invitations',
  timestamps: true,
  indexes: [
    {
      fields: ['invitedId', 'status'],
    },
    {
      fields: ['gameRoomId'],
    },
    {
      fields: ['inviterId'],
    },
    {
      fields: ['expiresAt'],
    },
    {
      unique: true,
      fields: ['gameRoomId', 'inviterId', 'invitedId'],
      name: 'unique_game_invitation',
    },
  ],
});

module.exports = GameInvitation;
