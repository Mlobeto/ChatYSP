const { Op } = require('sequelize');
const {
  User, Room, Message, Question, Tip, RoomParticipant,
} = require('../models');

const getStats = async (req, res) => {
  try {
    // Get general statistics
    const [
      totalUsers,
      totalRooms,
      totalMessages,
      totalQuestions,
      totalTips,
      onlineUsers,
    ] = await Promise.all([
      User.count(),
      Room.count(),
      Message.count({ where: { isDeleted: false } }),
      Question.count(),
      Tip.count(),
      User.count({ where: { isOnline: true } }),
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      newUsersLastWeek,
      newRoomsLastWeek,
      messagesLastWeek,
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Room.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Message.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo }, isDeleted: false } }),
    ]);

    // Get top users by points
    const topUsers = await User.findAll({
      attributes: ['id', 'username', 'points', 'level', 'gamesWon', 'gamesPlayed'],
      order: [['points', 'DESC']],
      limit: 10,
    });

    // Get most active rooms
    const mostActiveRooms = await Room.findAll({
      attributes: ['id', 'name', 'userCount'],
      include: [{
        model: Message,
        as: 'messages',
        attributes: [],
        where: {
          createdAt: { [Op.gte]: sevenDaysAgo },
          isDeleted: false,
        },
        required: false,
      }],
      group: ['Room.id'],
      order: [[{ model: Message, as: 'messages' }, 'createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      stats: {
        general: {
          totalUsers,
          totalRooms,
          totalMessages,
          totalQuestions,
          totalTips,
          onlineUsers,
        },
        lastWeek: {
          newUsers: newUsersLastWeek,
          newRooms: newRoomsLastWeek,
          messages: messagesLastWeek,
        },
        topUsers,
        mostActiveRooms,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, search, role, isOnline,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (isOnline !== undefined) {
      whereClause.isOnline = isOnline === 'true';
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      users: users.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit),
        totalUsers: users.count,
        hasNext: offset + users.rows.length < users.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Don't allow changing own role
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol',
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: 'Rol de usuario actualizado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Don't allow deactivating own account
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta',
      });
    }

    // Update user status
    await user.update({
      isOnline: false,
      // You might want to add an isActive field for proper deactivation
    });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getRooms = async (req, res) => {
  try {
    const {
      page = 1, limit = 20, search, roomType,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    if (roomType) {
      whereClause.roomType = roomType;
    }

    const rooms = await Room.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      rooms: rooms.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(rooms.count / limit),
        totalRooms: rooms.count,
        hasNext: offset + rooms.rows.length < rooms.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deactivateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    await room.update({ isActive: false });

    res.json({
      success: true,
      message: 'Sala desactivada exitosamente',
    });
  } catch (error) {
    console.error('Deactivate room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const {
      page = 1, limit = 50, roomId, messageType,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isDeleted: false };

    if (roomId) {
      whereClause.roomId = roomId;
    }

    if (messageType) {
      whereClause.messageType = messageType;
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      messages: messages.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(messages.count / limit),
        totalMessages: messages.count,
        hasNext: offset + messages.rows.length < messages.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
      });
    }

    await message.update({ isDeleted: true });

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const {
      question, options, correctAnswer, category, difficulty, points, tags,
    } = req.body;

    const newQuestion = await Question.create({
      question,
      options,
      correctAnswer,
      category,
      difficulty,
      points,
      tags,
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Pregunta creada exitosamente',
      question: newQuestion,
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      question, options, correctAnswer, category, difficulty, points, tags, isActive,
    } = req.body;

    const existingQuestion = await Question.findByPk(questionId);

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Pregunta no encontrada',
      });
    }

    await existingQuestion.update({
      ...(question && { question }),
      ...(options && { options }),
      ...(correctAnswer !== undefined && { correctAnswer }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(points !== undefined && { points }),
      ...(tags && { tags }),
      ...(isActive !== undefined && { isActive }),
    });

    res.json({
      success: true,
      message: 'Pregunta actualizada exitosamente',
      question: existingQuestion,
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Pregunta no encontrada',
      });
    }

    await question.destroy();

    res.json({
      success: true,
      message: 'Pregunta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deactivateUser,
  getRooms,
  deactivateRoom,
  getMessages,
  deleteMessage,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
