const express = require('express');
const { Question, GameStats, User } = require('../models');

const router = express.Router();

/**
 * @route GET /api/minigame/questions
 * @desc Get questions by category and difficulty
 * @query {string} category - coaching, bienestar, general, tecnologia
 * @query {string} difficulty - easy, medium, hard
 * @query {number} limit - number of questions (default: 10)
 */
router.get('/questions', async (req, res) => {
  try {
    const { category = 'general', difficulty = 'medium', limit = 10 } = req.query;

    // Validate category
    const validCategories = ['coaching', 'bienestar', 'general', 'tecnologia'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories,
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        error: 'Invalid difficulty',
        validDifficulties,
      });
    }

    const questions = await Question.findAll({
      where: {
        category,
        difficulty,
        isActive: true,
      },
      attributes: [
        'id',
        'question',
        'options',
        'correctAnswer',
        'category',
        'difficulty',
        'points',
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
    });

    res.json({
      questions,
      count: questions.length,
      category,
      difficulty,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      error: 'Failed to fetch questions',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/minigame/stats
 * @desc Save game statistics
 */
router.post('/stats', async (req, res) => {
  try {
    const {
      userId,
      score,
      correctAnswers,
      totalQuestions,
      category,
      difficulty,
      timeSpent,
      questionsAnswered = [],
    } = req.body;

    // Validate required fields
    if (!userId || score === undefined || !correctAnswers || !totalQuestions) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'score', 'correctAnswers', 'totalQuestions'],
      });
    }

    // Calculate accuracy
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const gameStats = await GameStats.create({
      userId,
      gameType: 'minigame',
      score,
      correctAnswers,
      totalQuestions,
      accuracy: accuracy.toFixed(2),
      category: category || 'general',
      difficulty: difficulty || 'medium',
      timeSpent: timeSpent || 0,
      questionsAnswered,
      completedAt: new Date(),
    });

    res.status(201).json({
      message: 'Game statistics saved successfully',
      stats: gameStats,
    });
  } catch (error) {
    console.error('Error saving game stats:', error);
    res.status(500).json({
      error: 'Failed to save game statistics',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/minigame/leaderboard
 * @desc Get leaderboard for a category
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;

    const whereClause = { gameType: 'minigame' };
    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;

    const leaderboard = await GameStats.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['score', 'DESC']],
      limit: parseInt(limit, 10),
    });

    res.json({
      leaderboard,
      filters: { category, difficulty },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/minigame/user-stats/:userId
 * @desc Get user statistics
 */
router.get('/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userStats = await GameStats.findAll({
      where: {
        userId,
        gameType: 'minigame',
      },
      order: [['createdAt', 'DESC']],
    });

    // Calculate aggregated stats
    const totalGames = userStats.length;
    const totalScore = userStats.reduce((sum, stat) => sum + stat.score, 0);
    const totalCorrect = userStats.reduce((sum, stat) => sum + stat.correctAnswers, 0);
    const totalQuestions = userStats.reduce((sum, stat) => sum + stat.totalQuestions, 0);

    const avgScore = totalGames > 0 ? (totalScore / totalGames).toFixed(1) : 0;
    const avgAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;

    // Stats by category
    const categoryStats = {};
    userStats.forEach((stat) => {
      if (!categoryStats[stat.category]) {
        categoryStats[stat.category] = {
          games: 0,
          totalScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
        };
      }
      categoryStats[stat.category].games += 1;
      categoryStats[stat.category].totalScore += stat.score;
      categoryStats[stat.category].totalCorrect += stat.correctAnswers;
      categoryStats[stat.category].totalQuestions += stat.totalQuestions;
    });

    // Calculate averages for each category
    Object.keys(categoryStats).forEach((categoryKey) => {
      const stats = categoryStats[categoryKey];
      stats.avgScore = (stats.totalScore / stats.games).toFixed(1);
      stats.accuracy = stats.totalQuestions > 0
        ? ((stats.totalCorrect / stats.totalQuestions) * 100).toFixed(1)
        : 0;
    });

    res.json({
      userId,
      summary: {
        totalGames,
        totalScore,
        avgScore,
        avgAccuracy,
        totalCorrect,
        totalQuestions,
      },
      categoryStats,
      recentGames: userStats.slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/minigame/categories
 * @desc Get available categories with question counts
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Question.findAll({
      attributes: [
        'category',
        'difficulty',
        [Question.sequelize.fn('COUNT', Question.sequelize.col('id')), 'count'],
      ],
      where: { isActive: true },
      group: ['category', 'difficulty'],
      raw: true,
    });

    // Format the response
    const formattedCategories = {};
    categories.forEach((item) => {
      if (!formattedCategories[item.category]) {
        formattedCategories[item.category] = {
          total: 0,
          difficulties: {},
        };
      }
      formattedCategories[item.category].difficulties[item.difficulty] = parseInt(item.count, 10);
      formattedCategories[item.category].total += parseInt(item.count, 10);
    });

    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message,
    });
  }
});

module.exports = router;
