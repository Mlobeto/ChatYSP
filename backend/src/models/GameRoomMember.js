const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GameRoomMember = sequelize.define('GameRoomMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameRoomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'GameRooms',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('player', 'spectator'),
    defaultValue: 'player',
    allowNull: false,
  },
}, {
  tableName: 'game_room_members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['gameRoomId', 'userId'],
      name: 'unique_game_room_member',
    },
    {
      fields: ['gameRoomId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

module.exports = GameRoomMember;
