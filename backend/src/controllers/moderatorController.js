const { Op } = require('sequelize');
const { User, Room, Message } = require('../models');

// Create report to admin
const createReport = async (req, res) => {
  try {
    const {
      type, targetId, reason, description,
    } = req.body;
    const reporterId = req.user.id;

    // Validate report type
    const validTypes = ['user', 'room', 'message'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reporte inválido',
      });
    }

    // Create report (you might want to create a Report model)
    const reportData = {
      type,
      targetId,
      reason,
      description,
      reporterId,
      country: req.user.country,
      status: 'pending',
      createdAt: new Date(),
    };

    // For now, we'll store reports in a simple way
    // In production, you'd want a dedicated Report model
    console.log('New moderation report:', reportData);

    res.json({
      success: true,
      message: 'Reporte enviado a administradores exitosamente',
      reportId: `${type}_${targetId}_${Date.now()}`,
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

// Get users for moderation (country-specific)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Moderators can only see users from their country
    if (req.user.role === 'moderator') {
      whereClause.country = req.user.country;
    }

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'email', 'role', 'country', 'isOnline', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      users: users.rows,
      pagination: {
        currentPage: parseInt(page, 10),
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

// Get rooms for moderation (only assigned rooms)
const getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Moderators can only see rooms assigned to them
    if (req.user.role === 'moderator') {
      whereClause.moderatorId = req.user.id;
    }

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
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
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      rooms: rooms.rows,
      pagination: {
        currentPage: parseInt(page, 10),
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

// Get messages for moderation (only from assigned rooms)
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, roomId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isDeleted: false };

    // Get rooms assigned to this moderator
    const moderatorRooms = await Room.findAll({
      where: { moderatorId: req.user.id },
      attributes: ['id'],
    });

    const roomIds = moderatorRooms.map((room) => room.id);

    if (roomIds.length === 0) {
      return res.json({
        success: true,
        messages: [],
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: 0,
          totalMessages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // Filter by specific room if provided, but only if it's assigned to this moderator
    if (roomId) {
      if (!roomIds.includes(roomId)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para moderar esta sala',
        });
      }
      whereClause.roomId = roomId;
    } else {
      whereClause.roomId = { [Op.in]: roomIds };
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'country'],
          required: true,
        },
        {
          model: Room,
          attributes: ['id', 'name', 'country'],
          required: true,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      messages: messages.rows,
      pagination: {
        currentPage: parseInt(page, 10),
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

module.exports = {
  createReport,
  getUsers,
  getRooms,
  getMessages,
};
