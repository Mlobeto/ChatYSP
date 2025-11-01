const jwt = require('jsonwebtoken');
const {
  User, Room, Question, RoomParticipant,
} = require('../models');

// Game sessions storage (in production, use Redis)
const gameSessions = new Map();

const gameSocket = (io) => {
  // Socket authentication middleware (same as chat)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected to game socket (${socket.id})`);

    // Join game room
    socket.on('joinGameRoom', async (data) => {
      try {
        const { roomId } = data;

        // Verify user is participant of the room
        const participation = await RoomParticipant.findOne({
          where: { userId: socket.userId, roomId },
        });

        if (!participation) {
          socket.emit('error', { message: 'No tienes acceso a esta sala' });
          return;
        }

        socket.join(`game_${roomId}`);
        socket.roomId = roomId;

        // Check if there's an active game
        const gameSession = gameSessions.get(roomId);
        if (gameSession) {
          socket.emit('gameStatus', {
            gameId: gameSession.id,
            status: gameSession.status,
            currentQuestionIndex: gameSession.currentQuestionIndex,
            totalQuestions: gameSession.questions.length,
            playersCount: gameSession.players.size,
          });
        }

        socket.emit('joinedGameRoom', { roomId });
      } catch (error) {
        console.error('Join game room error:', error);
        socket.emit('error', { message: 'Error al unirse a la sala de juego' });
      }
    });

    // Create game
    socket.on('createGame', async (data) => {
      try {
        const {
          roomId, gameType = 'trivia', questionCount = 10, difficulty = 'medium', category,
        } = data;

        // Check if user can create games in this room
        const room = await Room.findByPk(roomId, {
          include: [{
            model: User,
            as: 'participants',
            where: { id: socket.userId },
            through: {
              attributes: ['role'],
              where: { role: ['admin', 'moderator'] },
            },
            required: false,
          }],
        });

        if (!room || (room.createdById !== socket.userId && !room.participants.length)) {
          socket.emit('error', { message: 'No tienes permisos para crear juegos' });
          return;
        }

        // Check if there's already an active game
        if (gameSessions.has(roomId)) {
          socket.emit('error', { message: 'Ya hay un juego activo en esta sala' });
          return;
        }

        // Get questions
        const whereClause = { isActive: true };
        if (difficulty) whereClause.difficulty = difficulty;
        if (category) whereClause.category = category;

        const questions = await Question.findAll({
          where: whereClause,
          order: [['timesUsed', 'ASC'], ['createdAt', 'DESC']],
          limit: questionCount,
        });

        if (questions.length < questionCount) {
          socket.emit('error', {
            message: `No hay suficientes preguntas. Solo hay ${questions.length} disponibles.`,
          });
          return;
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
          status: 'waiting',
          createdBy: socket.userId,
          createdAt: new Date(),
          timePerQuestion: 30000,
          currentQuestionStartTime: null,
          questionTimer: null,
        };

        gameSessions.set(roomId, gameSession);

        // Broadcast game created
        io.to(`game_${roomId}`).emit('gameCreated', {
          gameId: gameSession.id,
          gameType,
          questionCount: questions.length,
          difficulty,
          category,
          createdBy: socket.user.username,
        });
      } catch (error) {
        console.error('Create game error:', error);
        socket.emit('error', { message: 'Error al crear juego' });
      }
    });

    // Join game
    socket.on('joinGame', (data) => {
      try {
        const { roomId } = data;
        const gameSession = gameSessions.get(roomId);

        if (!gameSession) {
          socket.emit('error', { message: 'No hay juego activo' });
          return;
        }

        if (gameSession.status !== 'waiting') {
          socket.emit('error', { message: 'El juego ya ha comenzado' });
          return;
        }

        // Add player
        gameSession.players.set(socket.userId, {
          id: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar,
          joinedAt: new Date(),
          answers: [],
        });

        gameSession.scores.set(socket.userId, 0);

        // Broadcast player joined
        io.to(`game_${roomId}`).emit('playerJoined', {
          playerId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar,
          playersCount: gameSession.players.size,
        });

        socket.emit('gameJoined', { gameId: gameSession.id });
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Error al unirse al juego' });
      }
    });

    // Start game
    socket.on('startGame', (data) => {
      try {
        const { roomId } = data;
        const gameSession = gameSessions.get(roomId);

        if (!gameSession) {
          socket.emit('error', { message: 'No hay juego activo' });
          return;
        }

        if (gameSession.createdBy !== socket.userId) {
          socket.emit('error', { message: 'Solo el creador puede iniciar el juego' });
          return;
        }

        if (gameSession.players.size < 1) {
          socket.emit('error', { message: 'Se necesita al menos un jugador' });
          return;
        }

        // Start game
        gameSession.status = 'active';
        gameSession.currentQuestionStartTime = new Date();

        const currentQuestion = gameSession.questions[0];

        // Set question timer
        gameSession.questionTimer = setTimeout(() => {
          handleQuestionTimeout(roomId);
        }, gameSession.timePerQuestion);

        // Broadcast game started
        io.to(`game_${roomId}`).emit('gameStarted', {
          currentQuestion: {
            index: 1,
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
        socket.emit('error', { message: 'Error al iniciar juego' });
      }
    });

    // Submit answer
    socket.on('submitAnswer', async (data) => {
      try {
        const { roomId, answerIndex } = data;
        const gameSession = gameSessions.get(roomId);

        if (!gameSession || gameSession.status !== 'active') {
          socket.emit('error', { message: 'Juego no activo' });
          return;
        }

        const player = gameSession.players.get(socket.userId);
        if (!player) {
          socket.emit('error', { message: 'No estás en este juego' });
          return;
        }

        const questionIndex = gameSession.currentQuestionIndex;
        const currentQuestion = gameSession.questions[questionIndex];

        // Check if already answered
        if (player.answers[questionIndex]) {
          socket.emit('error', { message: 'Ya has respondido esta pregunta' });
          return;
        }

        // Check time limit
        const timeElapsed = Date.now() - gameSession.currentQuestionStartTime.getTime();
        if (timeElapsed > gameSession.timePerQuestion) {
          socket.emit('error', { message: 'Tiempo agotado' });
          return;
        }

        // Record answer
        const isCorrect = answerIndex === currentQuestion.correctAnswer;
        let points = 0;

        if (isCorrect) {
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
        const currentScore = gameSession.scores.get(socket.userId) || 0;
        gameSession.scores.set(socket.userId, currentScore + points);

        // Update question stats
        await Question.increment('timesUsed', { where: { id: currentQuestion.id } });
        if (isCorrect) {
          await Question.increment('correctAnswers', { where: { id: currentQuestion.id } });
        }

        // Send answer result
        socket.emit('answerResult', {
          isCorrect,
          points,
          correctAnswer: currentQuestion.correctAnswer,
          totalScore: gameSession.scores.get(socket.userId),
        });

        // Broadcast player answered (without revealing if correct)
        socket.to(`game_${roomId}`).emit('playerAnswered', {
          playerId: socket.userId,
          username: socket.user.username,
        });
      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', { message: 'Error al enviar respuesta' });
      }
    });

    // Next question (only game creator)
    socket.on('nextQuestion', (data) => {
      try {
        const { roomId } = data;
        handleNextQuestion(roomId, socket.userId);
      } catch (error) {
        console.error('Next question error:', error);
        socket.emit('error', { message: 'Error al avanzar pregunta' });
      }
    });

    // End game
    socket.on('endGame', (data) => {
      try {
        const { roomId } = data;
        const gameSession = gameSessions.get(roomId);

        if (!gameSession) {
          socket.emit('error', { message: 'No hay juego activo' });
          return;
        }

        if (gameSession.createdBy !== socket.userId) {
          socket.emit('error', { message: 'Solo el creador puede terminar el juego' });
          return;
        }

        // Clear timer
        if (gameSession.questionTimer) {
          clearTimeout(gameSession.questionTimer);
        }

        // Remove session
        gameSessions.delete(roomId);

        // Broadcast game ended
        io.to(`game_${roomId}`).emit('gameEnded', {
          reason: 'ended_by_creator',
        });
      } catch (error) {
        console.error('End game error:', error);
        socket.emit('error', { message: 'Error al terminar juego' });
      }
    });

    // Get game status
    socket.on('getGameStatus', (data) => {
      try {
        const { roomId } = data;
        const gameSession = gameSessions.get(roomId);

        if (!gameSession) {
          socket.emit('gameStatus', { active: false });
          return;
        }

        const currentScores = Array.from(gameSession.scores.entries())
          .map(([userId, score]) => ({
            userId,
            username: gameSession.players.get(userId).username,
            score,
          }))
          .sort((a, b) => b.score - a.score);

        socket.emit('gameStatus', {
          active: true,
          gameId: gameSession.id,
          status: gameSession.status,
          currentQuestionIndex: gameSession.currentQuestionIndex + 1,
          totalQuestions: gameSession.questions.length,
          playersCount: gameSession.players.size,
          scores: currentScores,
        });
      } catch (error) {
        console.error('Get game status error:', error);
        socket.emit('error', { message: 'Error al obtener estado del juego' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected from game socket`);
    });
  });

  // Helper functions
  const handleQuestionTimeout = (roomId) => {
    const gameSession = gameSessions.get(roomId);
    if (!gameSession) return;

    // Auto advance to next question
    handleNextQuestion(roomId, gameSession.createdBy, true);
  };

  const handleNextQuestion = async (roomId, userId, isTimeout = false) => {
    const gameSession = gameSessions.get(roomId);

    if (!gameSession || (gameSession.createdBy !== userId && !isTimeout)) {
      return;
    }

    // Clear existing timer
    if (gameSession.questionTimer) {
      clearTimeout(gameSession.questionTimer);
    }

    // Move to next question
    gameSession.currentQuestionIndex++;

    // Check if game finished
    if (gameSession.currentQuestionIndex >= gameSession.questions.length) {
      gameSession.status = 'finished';

      // Calculate final scores
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

      // Broadcast game finished
      io.to(`game_${roomId}`).emit('gameFinished', {
        finalScores,
        winner: finalScores[0],
      });

      // Remove session
      gameSessions.delete(roomId);
      return;
    }

    // Start next question
    gameSession.currentQuestionStartTime = new Date();
    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

    // Set new timer
    gameSession.questionTimer = setTimeout(() => {
      handleQuestionTimeout(roomId);
    }, gameSession.timePerQuestion);

    // Broadcast next question
    io.to(`game_${roomId}`).emit('nextQuestion', {
      index: gameSession.currentQuestionIndex + 1,
      total: gameSession.questions.length,
      question: currentQuestion.question,
      options: currentQuestion.options,
      category: currentQuestion.category,
      difficulty: currentQuestion.difficulty,
      points: currentQuestion.points,
      timeLimit: gameSession.timePerQuestion,
    });
  };
};

module.exports = gameSocket;
