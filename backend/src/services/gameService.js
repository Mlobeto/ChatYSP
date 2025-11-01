const { Op } = require('sequelize');
const { Question, User, Room } = require('../models');

class GameService {
  constructor() {
    this.gameTemplates = new Map();
    this.difficultyMultipliers = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    };
    this.categoryBonuses = {
      general: 0,
      sports: 0.1,
      history: 0.15,
      science: 0.2,
      entertainment: 0.05,
      geography: 0.1,
    };
  }

  /**
   * Get questions for a game session
   */
  async getGameQuestions(options = {}) {
    try {
      const {
        category,
        difficulty = 'medium',
        count = 10,
        excludeIds = [],
        preferUnused = true,
      } = options;

      const whereClause = {
        isActive: true,
        id: { [Op.notIn]: excludeIds },
      };

      if (category && category !== 'all') {
        whereClause.category = category;
      }

      if (difficulty && difficulty !== 'all') {
        whereClause.difficulty = difficulty;
      }

      // Order by usage count to prefer less used questions
      const orderBy = preferUnused
        ? [['timesUsed', 'ASC'], ['createdAt', 'DESC']]
        : [['createdAt', 'DESC']];

      const questions = await Question.findAll({
        where: whereClause,
        order: orderBy,
        limit: count * 2, // Get more than needed for better randomization
      });

      if (questions.length < count) {
        throw new Error(`Solo hay ${questions.length} preguntas disponibles con los criterios especificados`);
      }

      // Randomize and select the required count
      const shuffled = this.shuffleArray([...questions]);
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Get game questions error:', error);
      throw error;
    }
  }

  /**
   * Calculate points for an answer
   */
  calculatePoints(question, timeElapsed, isCorrect, gameSettings = {}) {
    if (!isCorrect) return 0;

    const basePoints = question.points || 10;
    const difficultyMultiplier = this.difficultyMultipliers[question.difficulty] || 1;
    const categoryBonus = this.categoryBonuses[question.category] || 0;

    // Time bonus (faster answers get more points)
    const maxTime = gameSettings.timePerQuestion || 30000; // 30 seconds
    const timeBonus = Math.max(0, (maxTime - timeElapsed) / maxTime);

    // Streak bonus
    const streakMultiplier = gameSettings.streakMultiplier || 1;

    const totalPoints = Math.round(
      basePoints
      * difficultyMultiplier
      * (1 + categoryBonus)
      * (1 + timeBonus * 0.5)
      * streakMultiplier,
    );

    return Math.max(1, totalPoints); // Minimum 1 point
  }

  /**
   * Generate game statistics
   */
  async generateGameStats(gameSession) {
    try {
      const stats = {
        totalQuestions: gameSession.questions.length,
        totalPlayers: gameSession.players.size,
        averageScore: 0,
        highestScore: 0,
        lowestScore: Infinity,
        questionStats: [],
        playerStats: [],
      };

      // Calculate player statistics
      const scores = Array.from(gameSession.scores.entries());
      if (scores.length > 0) {
        stats.averageScore = scores.reduce((sum, [, score]) => sum + score, 0) / scores.length;
        stats.highestScore = Math.max(...scores.map(([, score]) => score));
        stats.lowestScore = Math.min(...scores.map(([, score]) => score));
      }

      // Player individual stats
      for (const [playerId, score] of gameSession.scores) {
        const player = gameSession.players.get(playerId);
        const correctAnswers = player.answers.filter((a) => a && a.isCorrect).length;
        const averageTime = player.answers
          .filter((a) => a && a.timeElapsed)
          .reduce((sum, a) => sum + a.timeElapsed, 0) / player.answers.length || 0;

        stats.playerStats.push({
          playerId,
          username: player.username,
          score,
          correctAnswers,
          totalAnswers: player.answers.length,
          accuracy: correctAnswers / player.answers.length * 100,
          averageResponseTime: Math.round(averageTime / 1000), // Convert to seconds
        });
      }

      // Question statistics
      gameSession.questions.forEach((question, index) => {
        const questionAnswers = Array.from(gameSession.players.values())
          .map((player) => player.answers[index])
          .filter((answer) => answer);

        const correctCount = questionAnswers.filter((a) => a.isCorrect).length;
        const totalAnswers = questionAnswers.length;

        stats.questionStats.push({
          questionIndex: index + 1,
          question: question.question,
          category: question.category,
          difficulty: question.difficulty,
          correctAnswers: correctCount,
          totalAnswers,
          accuracy: totalAnswers > 0 ? (correctCount / totalAnswers * 100) : 0,
          averageTime: questionAnswers.length > 0
            ? questionAnswers.reduce((sum, a) => sum + a.timeElapsed, 0) / questionAnswers.length / 1000
            : 0,
        });
      });

      // Sort player stats by score
      stats.playerStats.sort((a, b) => b.score - a.score);

      return stats;
    } catch (error) {
      console.error('Generate game stats error:', error);
      throw error;
    }
  }

  /**
   * Update player rankings and achievements
   */
  async updatePlayerRankings(gameStats) {
    try {
      const updates = [];

      for (const playerStat of gameStats.playerStats) {
        const { playerId, score, correctAnswers } = playerStat;
        const isWinner = playerStat === gameStats.playerStats[0];

        // Calculate level progression
        const user = await User.findByPk(playerId);
        if (!user) continue;

        const newTotalPoints = user.points + score;
        const newLevel = this.calculateLevel(newTotalPoints);
        const leveledUp = newLevel > user.level;

        // Prepare update
        const update = {
          where: { id: playerId },
          increment: {
            gamesPlayed: 1,
            points: score,
            ...(isWinner && { gamesWon: 1 }),
          },
          set: {
            level: newLevel,
          },
        };

        updates.push({
          userId: playerId,
          update,
          leveledUp,
          newLevel,
          achievements: this.checkAchievements(user, playerStat, isWinner),
        });
      }

      // Execute all updates
      for (const { userId, update } of updates) {
        await User.update(update.set, { where: update.where });
        for (const [field, value] of Object.entries(update.increment)) {
          await User.increment(field, { by: value, where: update.where });
        }
      }

      return updates.map((u) => ({
        userId: u.userId,
        leveledUp: u.leveledUp,
        newLevel: u.newLevel,
        achievements: u.achievements,
      }));
    } catch (error) {
      console.error('Update player rankings error:', error);
      throw error;
    }
  }

  /**
   * Calculate user level based on points
   */
  calculateLevel(points) {
    // Level progression: 100 points for level 2, then increases by 50 each level
    if (points < 100) return 1;

    let level = 2;
    let requiredPoints = 100;
    const increment = 50;

    while (points >= requiredPoints) {
      points -= requiredPoints;
      level++;
      requiredPoints = 100 + (increment * (level - 2));
    }

    return level - 1;
  }

  /**
   * Check for new achievements
   */
  checkAchievements(user, playerStat, isWinner) {
    const achievements = [];

    // First win
    if (isWinner && user.gamesWon === 0) {
      achievements.push({
        type: 'first_win',
        title: 'Primera Victoria',
        description: 'Ganaste tu primer juego',
        icon: '🏆',
      });
    }

    // Perfect score
    if (playerStat.accuracy === 100 && playerStat.totalAnswers >= 5) {
      achievements.push({
        type: 'perfect_score',
        title: 'Puntuación Perfecta',
        description: 'Respondiste todas las preguntas correctamente',
        icon: '💯',
      });
    }

    // Speed demon (average response time under 5 seconds)
    if (playerStat.averageResponseTime < 5) {
      achievements.push({
        type: 'speed_demon',
        title: 'Demonio de la Velocidad',
        description: 'Promedio de respuesta menor a 5 segundos',
        icon: '⚡',
      });
    }

    // Level milestones
    const newLevel = this.calculateLevel(user.points + playerStat.score);
    if (newLevel >= 10 && user.level < 10) {
      achievements.push({
        type: 'level_10',
        title: 'Veterano',
        description: 'Alcanzaste el nivel 10',
        icon: '🎖️',
      });
    }

    return achievements;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type = 'points', timeframe = 'all', limit = 10) {
    try {
      const whereClause = {};
      let orderBy = [];

      // Set timeframe
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate;

        switch (timeframe) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          whereClause.updatedAt = { [Op.gte]: startDate };
        }
      }

      // Set ordering
      switch (type) {
        case 'points':
          orderBy = [['points', 'DESC'], ['level', 'DESC']];
          break;
        case 'wins':
          orderBy = [['gamesWon', 'DESC'], ['points', 'DESC']];
          break;
        case 'winrate':
          orderBy = [
            [{ $col: 'gamesWon / NULLIF(gamesPlayed, 0)' }, 'DESC'],
            ['gamesWon', 'DESC'],
          ];
          break;
        default:
          orderBy = [['points', 'DESC']];
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: [
          'id', 'username', 'avatar', 'points', 'level',
          'gamesWon', 'gamesPlayed', 'lastSeen',
        ],
        order: orderBy,
        limit,
      });

      return users.map((user, index) => ({
        rank: index + 1,
        ...user.toJSON(),
        winRate: user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed * 100).toFixed(1) : '0.0',
      }));
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Create custom game template
   */
  createGameTemplate(name, settings) {
    const template = {
      id: `template_${Date.now()}`,
      name,
      settings: {
        questionCount: 10,
        timePerQuestion: 30000,
        category: 'all',
        difficulty: 'medium',
        allowSkip: false,
        showCorrectAnswer: true,
        ...settings,
      },
      createdAt: new Date(),
    };

    this.gameTemplates.set(template.id, template);
    return template;
  }

  /**
   * Utility function to shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Validate game settings
   */
  validateGameSettings(settings) {
    const errors = [];

    if (settings.questionCount < 1 || settings.questionCount > 50) {
      errors.push('El número de preguntas debe estar entre 1 y 50');
    }

    if (settings.timePerQuestion < 5000 || settings.timePerQuestion > 120000) {
      errors.push('El tiempo por pregunta debe estar entre 5 y 120 segundos');
    }

    const validCategories = ['all', 'general', 'sports', 'history', 'science', 'entertainment', 'geography'];
    if (!validCategories.includes(settings.category)) {
      errors.push('Categoría inválida');
    }

    const validDifficulties = ['all', 'easy', 'medium', 'hard'];
    if (!validDifficulties.includes(settings.difficulty)) {
      errors.push('Dificultad inválida');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
module.exports = new GameService();
