const {
  Question, User, GameRoom,
} = require('../models');

// Game session storage (in production, use Redis)
const gameSessions = new Map();

// Quick create: Create GameRoom and start game in one step (for mobile app)
const quickCreateGame = async (req, res) => {
  try {
    console.log('🎮 QUICK CREATE GAME - Iniciando:', {
      user: req.user?.email || 'NO USER',
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const userId = req.user.id;
    const {
      category = 'general',
      difficulty = 'medium',
      maxPlayers = 6,
      questionsCount = 10,
      timePerQuestion = 30,
    } = req.body;

    // 1. Create GameRoom
    const gameRoom = await GameRoom.create({
      name: `Partida de ${req.user.username}`,
      description: `Juego ${difficulty} de ${category}`,
      gameType: 'quiz',
      maxPlayers: parseInt(maxPlayers),
      difficulty,
      category,
      questionCount: parseInt(questionsCount),
      timePerQuestion: parseInt(timePerQuestion),
      createdById: userId,
      status: 'waiting',
      isActive: true,
    });

    console.log('✅ GameRoom creado:', gameRoom.id);

    // 2. Get questions
    const whereClause = { isActive: true };
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;

    const questions = await Question.findAll({
      where: whereClause,
      order: [
        ['timesUsed', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(questionsCount),
    });

    console.log('📝 Preguntas encontradas:', questions.length);

    if (questions.length < questionsCount) {
      await gameRoom.destroy(); // Rollback
      return res.status(400).json({
        success: false,
        message: `Preguntas insuficientes. Solo hay ${questions.length} disponibles para ${category}/${difficulty}.`,
      });
    }

    // 3. Create game session
    const gameSession = {
      id: `game_${Date.now()}`,
      gameRoomId: gameRoom.id,
      gameType: 'quiz',
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
      players: new Map([[userId, {
        id: userId,
        username: req.user.username,
        score: 0,
        answers: [],
      }]]),
      startedAt: new Date(),
      status: 'active',
      timePerQuestion: parseInt(timePerQuestion),
    };

    gameSessions.set(gameRoom.id, gameSession);

    // Update game room status
    await gameRoom.update({ status: 'active' });

    console.log('🎉 Juego iniciado exitosamente');

    res.status(201).json({
      success: true,
      message: 'Juego creado e iniciado exitosamente',
      id: gameRoom.id,
      gameRoom: gameRoom.toJSON(),
      session: {
        id: gameSession.id,
        currentQuestionIndex: 0,
        totalQuestions: questions.length,
        timePerQuestion: parseInt(timePerQuestion),
      },
    });
  } catch (error) {
    console.error('❌ QUICK CREATE GAME ERROR:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error creando el juego',
      error: error.message,
    });
  }
};

const createGame = async (req, res) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    // Check if user has joined the game room
    const gameRoom = await GameRoom.findByPk(gameRoomId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username'],
        },
      ],
    });

    if (!gameRoom || !gameRoom.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sala de juego no encontrada',
      });
    }

    if (gameRoom.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Esta sala de juego ya ha comenzado o terminado',
      });
    }

    // Only creator can start the game
    if (gameRoom.createdById !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador puede iniciar el juego',
      });
    }

    // Check if there's already an active game session
    if (gameSessions.has(gameRoomId)) {
      return res.status(400).json({
        success: false,
        message: 'Ya hay un juego activo en esta sala',
      });
    }

    // Get questions based on game room configuration
    const whereClause = { isActive: true };
    if (gameRoom.difficulty) whereClause.difficulty = gameRoom.difficulty;
    if (gameRoom.category) whereClause.category = gameRoom.category;

    const questions = await Question.findAll({
      where: whereClause,
      order: [
        ['timesUsed', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit: gameRoom.questionCount,
    });

    if (questions.length < gameRoom.questionCount) {
      return res.status(400).json({
        success: false,
        message: `Preguntas insuficientes. Solo hay ${questions.length} disponibles.`,
      });
    }

    // Create game session
    const gameSession = {
      id: `game_${Date.now()}`,
      gameRoomId,
      gameType: gameRoom.gameType,
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
      timePerQuestion: gameRoom.timePerQuestion,
      currentQuestionStartTime: null,
    };

    gameSessions.set(gameRoomId, gameSession);

    // Update game room status
    await gameRoom.update({ status: 'starting' });

    res.status(201).json({
      success: true,
      message: 'Juego creado exitosamente',
      game: {
        id: gameSession.id,
        gameRoomId,
        gameType: gameRoom.gameType,
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
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(gameRoomId);

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
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(gameRoomId);

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
    const { gameRoomId } = req.params;
    const { answerIndex } = req.body;
    const userId = req.user.id;

    const gameSession = gameSessions.get(gameRoomId);

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
      points = Math.round(currentQuestion.points + speedBonus * 0.1);
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
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(gameRoomId);

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
    gameSession.currentQuestionIndex += 1;

    // Check if game is finished
    if (gameSession.currentQuestionIndex >= gameSession.questions.length) {
      gameSession.status = 'finished';

      // Calculate final scores and rankings
      const finalScores = Array.from(gameSession.scores.entries())
        .map(([playerId, score]) => ({
          userId: playerId,
          username: gameSession.players.get(playerId).username,
          score,
          correctAnswers: gameSession.players.get(playerId).answers.filter((a) => a && a.isCorrect)
            .length,
        }))
        .sort((a, b) => b.score - a.score);

      // Update user stats
      await Promise.all(finalScores.map(async (player) => {
        const isWinner = player === finalScores[0];
        return User.increment(
          {
            gamesPlayed: 1,
            ...(isWinner && { gamesWon: 1 }),
            points: player.score,
          },
          { where: { id: player.userId } },
        );
      }));

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
    const { gameRoomId } = req.params;

    const gameSession = gameSessions.get(gameRoomId);

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
    if (
      gameSession.status === 'active'
      && gameSession.currentQuestionIndex < gameSession.questions.length
    ) {
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
        gameRoomId,
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
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameSession = gameSessions.get(gameRoomId);

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
    gameSessions.delete(gameRoomId);

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
  quickCreateGame,
  createGame,
  joinGame,
  startGame,
  submitAnswer,
  nextQuestion,
  getGameStatus,
  endGame,
};
