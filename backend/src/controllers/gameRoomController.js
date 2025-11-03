const { Op } = require('sequelize');
const {
  GameRoom, GameInvitation, User, Question, GameRoomMember,
} = require('../models');

// Create a new game room
const createGameRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      gameType = 'trivia',
      category = 'general',
      difficulty = 'medium',
      maxPlayers = 8,
      questionCount = 10,
      timePerQuestion = 30000,
      isPrivate = false,
      settings = {},
    } = req.body;
    const userId = req.user.id;

    // Validate that we have enough questions for this configuration
    const availableQuestions = await Question.count({
      where: {
        isActive: true,
        ...(category && { category }),
        ...(difficulty && { difficulty }),
      },
    });

    if (availableQuestions < questionCount) {
      return res.status(400).json({
        success: false,
        message: `Preguntas insuficientes. Solo hay ${availableQuestions} disponibles.`,
      });
    }

    const gameRoom = await GameRoom.create({
      name,
      description,
      gameType,
      category,
      difficulty,
      maxPlayers,
      questionCount,
      timePerQuestion,
      isPrivate,
      createdById: userId,
      settings: {
        autoStart: false,
        allowSpectators: true,
        showRankingLive: true,
        allowRejoining: false,
        ...settings,
      },
    });

    const fullGameRoom = await GameRoom.findByPk(gameRoom.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'country'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Sala de juego creada exitosamente',
      gameRoom: fullGameRoom,
    });
  } catch (error) {
    console.error('Create game room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Get available game rooms
const getGameRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      gameType,
      difficulty,
      category,
      status = 'waiting',
      search,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: true,
      isPrivate: false, // Only show public rooms
    };

    if (gameType) whereClause.gameType = gameType;
    if (difficulty) whereClause.difficulty = difficulty;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const gameRooms = await GameRoom.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'country'],
        },
      ],
      order: [
        ['status', 'ASC'], // waiting rooms first
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      gameRooms: gameRooms.rows,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(gameRooms.count / limit),
        totalRooms: gameRooms.count,
        hasNext: offset + gameRooms.rows.length < gameRooms.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get game rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Join a game room
const joinGameRoom = async (req, res) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameRoom = await GameRoom.findByPk(gameRoomId);

    if (!gameRoom || !gameRoom.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sala de juego no encontrada',
      });
    }

    if (gameRoom.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Esta sala ya ha comenzado o terminado',
      });
    }

    // Check if user is already in the room
    const existingMember = await GameRoomMember.findOne({
      where: {
        gameRoomId,
        userId,
        isActive: true,
      },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás en esta sala de juego',
      });
    }

    // Check current players count
    const currentPlayersCount = await GameRoomMember.count({
      where: {
        gameRoomId,
        isActive: true,
        role: 'player',
      },
    });

    if (currentPlayersCount >= gameRoom.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'La sala está llena',
      });
    }

    // Add user to game room
    await GameRoomMember.create({
      gameRoomId,
      userId,
      role: 'player',
    });

    // Update current players count in game room
    await gameRoom.update({
      currentPlayers: currentPlayersCount + 1,
    });

    res.json({
      success: true,
      message: 'Te has unido a la sala de juego exitosamente',
      gameRoom: {
        id: gameRoom.id,
        name: gameRoom.name,
        currentPlayers: currentPlayersCount + 1,
        maxPlayers: gameRoom.maxPlayers,
        status: gameRoom.status,
      },
    });
  } catch (error) {
    console.error('Join game room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Leave a game room
const leaveGameRoom = async (req, res) => {
  try {
    const { gameRoomId } = req.params;
    const userId = req.user.id;

    const gameRoom = await GameRoom.findByPk(gameRoomId);

    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Sala de juego no encontrada',
      });
    }

    // Find and remove user from game room
    const member = await GameRoomMember.findOne({
      where: {
        gameRoomId,
        userId,
        isActive: true,
      },
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'No estás en esta sala de juego',
      });
    }

    // Mark member as inactive (leave room)
    await member.update({ isActive: false });

    // Update current players count
    const currentPlayersCount = await GameRoomMember.count({
      where: {
        gameRoomId,
        isActive: true,
        role: 'player',
      },
    });

    await gameRoom.update({
      currentPlayers: currentPlayersCount,
    });

    res.json({
      success: true,
      message: 'Has salido de la sala de juego',
    });
  } catch (error) {
    console.error('Leave game room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Get game room members
const getGameRoomMembers = async (req, res) => {
  try {
    const { gameRoomId } = req.params;

    const gameRoom = await GameRoom.findByPk(gameRoomId);

    if (!gameRoom) {
      return res.status(404).json({
        success: false,
        message: 'Sala de juego no encontrada',
      });
    }

    const members = await GameRoomMember.findAll({
      where: {
        gameRoomId,
        isActive: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'country', 'level'],
        },
      ],
      order: [['joinedAt', 'ASC']],
    });

    res.json({
      success: true,
      members: members.map((member) => ({
        id: member.user.id,
        username: member.user.username,
        country: member.user.country,
        level: member.user.level,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      totalMembers: members.length,
    });
  } catch (error) {
    console.error('Get game room members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Send game invitation
const sendInvitation = async (req, res) => {
  try {
    const { gameRoomId } = req.params;
    const { invitedUserId, message } = req.body;
    const inviterId = req.user.id;

    // Validate game room exists and is active
    const gameRoom = await GameRoom.findByPk(gameRoomId);
    if (!gameRoom || !gameRoom.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sala de juego no encontrada',
      });
    }

    if (gameRoom.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden enviar invitaciones para esta sala',
      });
    }

    // Validate invited user exists
    const invitedUser = await User.findByPk(invitedUserId);
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario invitado no encontrado',
      });
    }

    if (invitedUserId === inviterId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes invitarte a ti mismo',
      });
    }

    // Check if invitation already exists
    const existingInvitation = await GameInvitation.findOne({
      where: {
        gameRoomId,
        inviterId,
        invitedId: invitedUserId,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Ya has enviado una invitación a este usuario para esta sala',
      });
    }

    const invitation = await GameInvitation.create({
      gameRoomId,
      inviterId,
      invitedId: invitedUserId,
      message: message || '¡Ven a jugar conmigo! Te ayudará a relajarte 😊',
    });

    res.status(201).json({
      success: true,
      message: 'Invitación enviada exitosamente',
      invitation: {
        id: invitation.id,
        invitedUser: {
          id: invitedUser.id,
          username: invitedUser.username,
        },
        gameRoom: {
          id: gameRoom.id,
          name: gameRoom.name,
        },
      },
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Get user's invitations
const getInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'pending' } = req.query;

    const invitations = await GameInvitation.findAll({
      where: {
        invitedId: userId,
        status,
        expiresAt: { [Op.gt]: new Date() }, // Not expired
      },
      include: [
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'username', 'country'],
        },
        {
          model: GameRoom,
          as: 'gameRoom',
          attributes: ['id', 'name', 'gameType', 'difficulty', 'maxPlayers', 'currentPlayers'],
        },
      ],
      order: [['sentAt', 'DESC']],
    });

    res.json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Respond to invitation
const respondToInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { response } = req.body; // 'accepted' or 'declined'
    const userId = req.user.id;

    const invitation = await GameInvitation.findOne({
      where: {
        id: invitationId,
        invitedId: userId,
        status: 'pending',
        expiresAt: { [Op.gt]: new Date() },
      },
      include: [
        {
          model: GameRoom,
          as: 'gameRoom',
        },
      ],
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitación no encontrada o expirada',
      });
    }

    await invitation.update({
      status: response,
      respondedAt: new Date(),
    });

    let message = '';
    if (response === 'accepted') {
      // Check if game room is still available
      if (invitation.gameRoom.currentPlayers >= invitation.gameRoom.maxPlayers) {
        await invitation.update({ status: 'expired' });
        return res.status(400).json({
          success: false,
          message: 'La sala está llena',
        });
      }

      if (invitation.gameRoom.status !== 'waiting') {
        await invitation.update({ status: 'expired' });
        return res.status(400).json({
          success: false,
          message: 'El juego ya ha comenzado',
        });
      }

      message = 'Invitación aceptada. ¡Únete al juego!';
    } else {
      message = 'Invitación rechazada';
    }

    res.json({
      success: true,
      message,
      invitation: {
        id: invitation.id,
        status: invitation.status,
        gameRoom: invitation.gameRoom,
      },
    });
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Get global leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'allTime', limit = 50 } = req.query;
    let dateFilter = {};
    const now = new Date();
    switch (timeframe) {
    case 'daily':
      dateFilter = {
        updatedAt: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      };
      break;
    case 'weekly': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      dateFilter = { updatedAt: { [Op.gte]: weekStart } };
      break;
    }
    case 'monthly':
      dateFilter = {
        updatedAt: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      };
      break;
    default:
      // allTime - no filter
      break;
    }

    const users = await User.findAll({
      where: {
        ...dateFilter,
        gamesPlayed: { [Op.gt]: 0 },
      },
      attributes: [
        'id',
        'username',
        'country',
        'points',
        'gamesPlayed',
        'gamesWon',
        'level',
      ],
      order: [
        ['points', 'DESC'],
        ['gamesWon', 'DESC'],
        ['gamesPlayed', 'ASC'],
      ],
      limit: parseInt(limit, 10),
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      country: user.country,
      points: user.points,
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      winRate: user.gamesPlayed > 0
        ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0,
      level: user.level,
    }));

    res.json({
      success: true,
      leaderboard,
      timeframe,
      total: users.length,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  createGameRoom,
  getGameRooms,
  joinGameRoom,
  leaveGameRoom,
  getGameRoomMembers,
  sendInvitation,
  getInvitations,
  respondToInvitation,
  getLeaderboard,
};
