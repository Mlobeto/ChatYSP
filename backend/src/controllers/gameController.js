const { Op } = require('sequelize');
const { Question, User, Room } = require('../models');

// Game session storage (in production, use Redis)
const gameSessions = new Map();

const createGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const {
      gameType = 'trivia', questionCount = 10, difficulty = 'medium', category,
    } = req.body;
    const userId = req.user.id;

    // Check if user is admin/moderator of the room
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'participants',
        where: { id: userId },
        through: {
          attributes: ['role'],
          where: { role: ['admin', 'moderator'] },
        },
        required: false,
      }],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    if (room.createdById !== userId && !room.participants.length) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear juegos en esta sala',
      });
    }

    // Check if there's already an active game
    if (gameSessions.has(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Ya hay un juego activo en esta sala',
      });
    }

    // Get questions based on criteria
    const whereClause = { isActive: true };
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;

    const questions = await Question.findAll({
      where: whereClause,
      order: [['timesUsed', 'ASC'], ['createdAt', 'DESC']],
      limit: questionCount,
    });

    if (questions.length < questionCount) {
      return res.status(400).json({
        success: false,
        message: `No hay suficientes preguntas disponibles. Solo hay ${questions.length} preguntas.`,
      });
    }

    // Create game session
    const gameSession = {
      id: `game_${Date.now()}`,
      roomId,
      gameType,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        category: q.category,
        difficulty: q.difficulty,
      })),
      currentQuestionIndex: 0,
      players: new Map(),
      scores: new Map(),
      status: 'waiting', // waiting, active, finished
      createdBy: userId,
      createdAt: new Date(),
      timePerQuestion: 30000, // 30 seconds
      currentQuestionStartTime: null,
    };

    gameSessions.set(roomId, gameSession);

    res.status(201).json({
      success: true,
      message: 'Juego creado exitosamente',
      game: {
        id: gameSession.id,
        roomId,
        gameType,
        questionCount: questions.length,
        status: gameSession.status,
        timePerQuestion: gameSession.timePerQuestion,
      },
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const joinGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(roomId);

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo en esta sala',
      });
    }

    if (gameSession.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'El juego ya ha comenzado',
      });
    }

    // Add player to game
    gameSession.players.set(userId, {
      id: userId,
      username: req.user.username,
      joinedAt: new Date(),
      answers: [],
    });

    gameSession.scores.set(userId, 0);

    res.json({
      success: true,
      message: 'Te has unido al juego exitosamente',
      playersCount: gameSession.players.size,
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const startGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(roomId);

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo en esta sala',
      });
    }

    if (gameSession.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador del juego puede iniciarlo',
      });
    }

    if (gameSession.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'El juego ya ha comenzado o terminado',
      });
    }

    if (gameSession.players.size < 1) {
      return res.status(400).json({
        success: false,
        message: 'Se necesita al menos un jugador para comenzar',
      });
    }

    // Start game
    gameSession.status = 'active';
    gameSession.currentQuestionStartTime = new Date();

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    res.json({
      success: true,
      message: 'Juego iniciado exitosamente',
      currentQuestion: {
        index: gameSession.currentQuestionIndex + 1,
        total: gameSession.questions.length,
        question: currentQuestion.question,
        options: currentQuestion.options,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        points: currentQuestion.points,
        timeLimit: gameSession.timePerQuestion,
      },
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { answerIndex } = req.body;
    const userId = req.user.id;

    const gameSession = gameSessions.get(roomId);

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo en esta sala',
      });
    }

    if (gameSession.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'El juego no está activo',
      });
    }

    const player = gameSession.players.get(userId);
    if (!player) {
      return res.status(403).json({
        success: false,
        message: 'No estás participando en este juego',
      });
    }

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    // Check if player already answered this question
    const questionIndex = gameSession.currentQuestionIndex;
    if (player.answers[questionIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Ya has respondido esta pregunta',
      });
    }

    // Check time limit
    const timeElapsed = Date.now() - gameSession.currentQuestionStartTime.getTime();
    if (timeElapsed > gameSession.timePerQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Tiempo agotado para esta pregunta',
      });
    }

    // Record answer
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    let points = 0;

    if (isCorrect) {
      // Calculate points based on speed (bonus for quick answers)
      const speedBonus = Math.max(0, (gameSession.timePerQuestion - timeElapsed) / 1000);
      points = Math.round(currentQuestion.points + (speedBonus * 0.1));
    }

    player.answers[questionIndex] = {
      answerIndex,
      isCorrect,
      points,
      timeElapsed,
      answeredAt: new Date(),
    };

    // Update score
    const currentScore = gameSession.scores.get(userId) || 0;
    gameSession.scores.set(userId, currentScore + points);

    // Update question usage count
    await Question.increment('timesUsed', { where: { id: currentQuestion.id } });
    if (isCorrect) {
      await Question.increment('correctAnswers', { where: { id: currentQuestion.id } });
    }

    res.json({
      success: true,
      isCorrect,
      points,
      correctAnswer: currentQuestion.correctAnswer,
      totalScore: gameSession.scores.get(userId),
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const nextQuestion = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(roomId);

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo en esta sala',
      });
    }

    if (gameSession.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador del juego puede avanzar preguntas',
      });
    }

    if (gameSession.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'El juego no está activo',
      });
    }

    // Move to next question
    gameSession.currentQuestionIndex++;

    // Check if game is finished
    if (gameSession.currentQuestionIndex >= gameSession.questions.length) {
      gameSession.status = 'finished';

      // Calculate final scores and rankings
      const finalScores = Array.from(gameSession.scores.entries())
        .map(([userId, score]) => ({
          userId,
          username: gameSession.players.get(userId).username,
          score,
          correctAnswers: gameSession.players.get(userId).answers.filter((a) => a && a.isCorrect).length,
        }))
        .sort((a, b) => b.score - a.score);

      // Update user stats
      for (const player of finalScores) {
        const isWinner = player === finalScores[0];
        await User.increment({
          gamesPlayed: 1,
          ...(isWinner && { gamesWon: 1 }),
          points: player.score,
        }, { where: { id: player.userId } });
      }

      return res.json({
        success: true,
        gameFinished: true,
        finalScores,
      });
    }

    // Start next question
    gameSession.currentQuestionStartTime = new Date();
    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    res.json({
      success: true,
      currentQuestion: {
        index: gameSession.currentQuestionIndex + 1,
        total: gameSession.questions.length,
        question: currentQuestion.question,
        options: currentQuestion.options,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        points: currentQuestion.points,
        timeLimit: gameSession.timePerQuestion,
      },
    });
  } catch (error) {
    console.error('Next question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getGameStatus = async (req, res) => {
  try {
    const { roomId } = req.params;

    const gameSession = gameSessions.get(roomId);

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo en esta sala',
      });
    }

    const currentScores = Array.from(gameSession.scores.entries())
      .map(([userId, score]) => ({
        userId,
        username: gameSession.players.get(userId).username,
        score,
      }))
      .sort((a, b) => b.score - a.score);

    let currentQuestion = null;
    if (gameSession.status === 'active' && gameSession.currentQuestionIndex < gameSession.questions.length) {
      const question = gameSession.questions[gameSession.currentQuestionIndex];
      currentQuestion = {
        index: gameSession.currentQuestionIndex + 1,
        total: gameSession.questions.length,
        question: question.question,
        options: question.options,
        category: question.category,
        difficulty: question.difficulty,
        points: question.points,
      };
    }

    res.json({
      success: true,
      game: {
        id: gameSession.id,
        roomId,
        status: gameSession.status,
        playersCount: gameSession.players.size,
        currentQuestionIndex: gameSession.currentQuestionIndex + 1,
        totalQuestions: gameSession.questions.length,
        currentQuestion,
        scores: currentScores,
      },
    });
  } catch (error) {
    console.error('Get game status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const endGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(roomId);

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        message: 'No hay juego activo en esta sala',
      });
    }

    if (gameSession.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador del juego puede terminarlo',
      });
    }

    // Remove game session
    gameSessions.delete(roomId);

    res.json({
      success: true,
      message: 'Juego terminado exitosamente',
    });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  createGame,
  joinGame,
  startGame,
  submitAnswer,
  nextQuestion,
  getGameStatus,
  endGame,
};
