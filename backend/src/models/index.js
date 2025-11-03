const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Message = require('./Message');
const Room = require('./Room');
const Tip = require('./Tip');
const Question = require('./Question');
const GameStats = require('./GameStats');
const GameRoom = require('./GameRoom');
const GameInvitation = require('./GameInvitation');
const GameRoomMember = require('./GameRoomMember');
const Notification = require('./Notification');

// Define associations
// User associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
User.hasMany(Room, { foreignKey: 'createdById', as: 'createdRooms' });
User.hasMany(Tip, { foreignKey: 'createdById', as: 'tips' });
User.hasMany(Question, { foreignKey: 'createdById', as: 'questions' });
User.hasMany(GameStats, { foreignKey: 'userId', as: 'gameStats' });
User.hasMany(GameRoom, { foreignKey: 'createdById', as: 'createdGameRooms' });
User.hasMany(GameInvitation, { foreignKey: 'inviterId', as: 'sentInvitations' });
User.hasMany(GameInvitation, { foreignKey: 'invitedId', as: 'receivedInvitations' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });
Message.belongsTo(Message, { foreignKey: 'replyToId', as: 'replyTo' });
Message.hasMany(Message, { foreignKey: 'replyToId', as: 'replies' });

// Room associations
Room.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
Room.hasMany(Message, { foreignKey: 'roomId', as: 'messages' });

// Tip associations
Tip.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Question associations
Question.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// GameStats associations
GameStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// GameRoom associations
GameRoom.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });
GameRoom.hasMany(GameInvitation, { foreignKey: 'gameRoomId', as: 'invitations' });

// GameInvitation associations
GameInvitation.belongsTo(User, { foreignKey: 'inviterId', as: 'inviter' });
GameInvitation.belongsTo(User, { foreignKey: 'invitedId', as: 'invited' });
GameInvitation.belongsTo(GameRoom, { foreignKey: 'gameRoomId', as: 'gameRoom' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// GameRoomMember associations
GameRoomMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
GameRoomMember.belongsTo(GameRoom, { foreignKey: 'gameRoomId', as: 'gameRoom' });

// Many-to-many associations through GameRoomMember
User.belongsToMany(GameRoom, {
  through: GameRoomMember,
  foreignKey: 'userId',
  otherKey: 'gameRoomId',
  as: 'joinedGameRooms',
});

GameRoom.belongsToMany(User, {
  through: GameRoomMember,
  foreignKey: 'gameRoomId',
  otherKey: 'userId',
  as: 'members',
});

// Many-to-many association for Room participants
const RoomParticipant = sequelize.define('RoomParticipant', {
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
  roomId: {
    type: DataTypes.UUID,
    references: {
      model: Room,
      key: 'id',
    },
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  role: {
    type: DataTypes.ENUM('member', 'moderator', 'admin'),
    defaultValue: 'member',
  },
  isMuted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'room_participants',
  timestamps: true,
});

User.belongsToMany(Room, {
  through: RoomParticipant,
  foreignKey: 'userId',
  otherKey: 'roomId',
  as: 'rooms',
});

Room.belongsToMany(User, {
  through: RoomParticipant,
  foreignKey: 'roomId',
  otherKey: 'userId',
  as: 'participants',
});

module.exports = {
  sequelize,
  User,
  Message,
  Room,
  Tip,
  Question,
  GameStats,
  GameRoom,
  GameInvitation,
  GameRoomMember,
  RoomParticipant,
  Notification,
};
