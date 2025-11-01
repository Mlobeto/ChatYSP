const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GameStats = sequelize.define('GameStats', {
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
  },
  gameType: {
    type: DataTypes.ENUM('minigame', 'trivia', 'challenge'),
    allowNull: false,
    defaultValue: 'minigame',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 1,
    },
  },
  accuracy: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
  },
  timeTaken: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Tiempo en segundos',
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array con detalles de cada respuesta',
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información adicional del juego',
  },
}, {
  tableName: 'game_stats',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['gameType'],
    },
    {
      fields: ['category'],
    },
    {
      fields: ['completedAt'],
    },
    {
      fields: ['userId', 'gameType'],
    },
    {
      fields: ['category', 'difficulty'],
    },
  ],
});

// Hooks
GameStats.beforeCreate((gameStats) => {
  // Calcular precisión automáticamente
  if (gameStats.totalQuestions > 0) {
    const calculatedAccuracy = (gameStats.correctAnswers / gameStats.totalQuestions) * 100;
    gameStats.set('accuracy', calculatedAccuracy);
  }
});

GameStats.beforeUpdate((gameStats) => {
  // Recalcular precisión si cambian las respuestas
  if (gameStats.changed('correctAnswers') || gameStats.changed('totalQuestions')) {
    if (gameStats.totalQuestions > 0) {
      const calculatedAccuracy = (gameStats.correctAnswers / gameStats.totalQuestions) * 100;
      gameStats.set('accuracy', calculatedAccuracy);
    }
  }
});

// Métodos de instancia
GameStats.prototype.getPerformanceLevel = function getPerformanceLevel() {
  if (this.accuracy >= 90) return 'excelente';
  if (this.accuracy >= 75) return 'bueno';
  if (this.accuracy >= 50) return 'regular';
  return 'necesita_mejora';
};

GameStats.prototype.getSpeedRating = function getSpeedRating() {
  if (this.totalQuestions === 0) return 'sin_datos';

  const avgTimePerQuestion = this.timeTaken / this.totalQuestions;

  if (avgTimePerQuestion <= 10) return 'muy_rapido';
  if (avgTimePerQuestion <= 15) return 'rapido';
  if (avgTimePerQuestion <= 25) return 'normal';
  return 'lento';
};

// Métodos estáticos
GameStats.getUserStats = async function getUserStats(userId, options = {}) {
  const {
    gameType = 'minigame',
    category = null,
    startDate = null,
    endDate = null,
  } = options;

  const whereClause = { userId, gameType };

  if (category) {
    whereClause.category = category;
  }

  if (startDate || endDate) {
    whereClause.completedAt = {};
    if (startDate) whereClause.completedAt[sequelize.Op.gte] = startDate;
    if (endDate) whereClause.completedAt[sequelize.Op.lte] = endDate;
  }

  const stats = await this.findAll({
    where: whereClause,
    order: [['completedAt', 'DESC']],
  });

  // Calcular estadísticas agregadas
  if (stats.length === 0) {
    return {
      totalGames: 0,
      bestScore: 0,
      averageScore: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      overallAccuracy: 0,
      totalTimePlayed: 0,
      games: [],
    };
  }

  const totalGames = stats.length;
  const bestScore = Math.max(...stats.map((s) => s.score));
  const averageScore = stats.reduce((sum, s) => sum + s.score, 0) / totalGames;
  const totalCorrectAnswers = stats.reduce((sum, s) => sum + s.correctAnswers, 0);
  const totalQuestions = stats.reduce((sum, s) => sum + s.totalQuestions, 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;
  const totalTimePlayed = stats.reduce((sum, s) => sum + s.timeTaken, 0);

  return {
    totalGames,
    bestScore,
    averageScore: Math.round(averageScore * 100) / 100,
    totalCorrectAnswers,
    totalQuestions,
    overallAccuracy: Math.round(overallAccuracy * 100) / 100,
    totalTimePlayed,
    games: stats,
  };
};

GameStats.getLeaderboard = async function getLeaderboard(options = {}) {
  const {
    gameType = 'minigame',
    category = null,
    period = 'weekly',
    limit = 10,
  } = options;

  // Calcular fecha de inicio según el período
  const now = new Date();
  let startDate;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0); // Todos los tiempos
  }

  const whereClause = {
    gameType,
    completedAt: {
      [sequelize.Op.gte]: startDate,
    },
  };

  if (category) {
    whereClause.category = category;
  }

  const leaderboard = await this.findAll({
    attributes: [
      'userId',
      [sequelize.fn('MAX', sequelize.col('score')), 'bestScore'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalGames'],
      [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
      [sequelize.fn('SUM', sequelize.col('correctAnswers')), 'totalCorrectAnswers'],
      [sequelize.fn('SUM', sequelize.col('totalQuestions')), 'totalQuestions'],
    ],
    where: whereClause,
    group: ['userId'],
    order: [[sequelize.fn('MAX', sequelize.col('score')), 'DESC']],
    limit,
    include: [{
      model: sequelize.models.User,
      attributes: ['username', 'name', 'avatar'],
    }],
  });

  // Calcular accuracy y agregar posiciones
  return leaderboard.map((entry, index) => {
    const totalCorrect = parseInt(entry.dataValues.totalCorrectAnswers, 10) || 0;
    const totalQuestions = parseInt(entry.dataValues.totalQuestions, 10) || 0;
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return {
      position: index + 1,
      userId: entry.userId,
      user: entry.User,
      bestScore: parseInt(entry.dataValues.bestScore, 10) || 0,
      totalGames: parseInt(entry.dataValues.totalGames, 10) || 0,
      averageScore: Math.round((parseFloat(entry.dataValues.averageScore) || 0) * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  });
};

GameStats.getCategoryStats = async function getCategoryStats(userId = null) {
  const whereClause = {};
  if (userId) {
    whereClause.userId = userId;
  }

  return this.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'gamesPlayed'],
      [sequelize.fn('MAX', sequelize.col('score')), 'bestScore'],
      [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
      [sequelize.fn('AVG', sequelize.col('accuracy')), 'averageAccuracy'],
      [sequelize.fn('SUM', sequelize.col('timeTaken')), 'totalTime'],
    ],
    where: whereClause,
    group: ['category'],
    order: [['category', 'ASC']],
  });
};

module.exports = GameStats;
