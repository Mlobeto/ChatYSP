const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GameRoom = sequelize.define('GameRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [3, 100],
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  gameType: {
    type: DataTypes.ENUM('trivia', 'quiz', 'challenge'),
    defaultValue: 'trivia',
  },
  category: {
    type: DataTypes.ENUM('coaching', 'bienestar', 'general', 'tecnologia'),
    defaultValue: 'general',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium',
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
    validate: {
      min: 2,
      max: 20,
    },
  },
  currentPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  questionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 5,
      max: 50,
    },
  },
  timePerQuestion: {
    type: DataTypes.INTEGER,
    defaultValue: 30000, // 30 seconds in milliseconds
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allowChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Key: no chat during games
  },
  isGlobal: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Global access, no country restrictions
  },
  status: {
    type: DataTypes.ENUM('waiting', 'starting', 'active', 'finished', 'cancelled'),
    defaultValue: 'waiting',
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  finishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      autoStart: false,
      allowSpectators: true,
      showRankingLive: true,
      allowRejoining: false,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'game_rooms',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['gameType', 'difficulty'],
    },
    {
      fields: ['isPrivate', 'isActive'],
    },
    {
      fields: ['createdById'],
    },
  ],
});

module.exports = GameRoom;
