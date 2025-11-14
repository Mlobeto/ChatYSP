const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Room, User, RoomParticipant } = require('../models');

const getRooms = async (req, res) => {
  try {
    console.log('📋 GET ROOMS - Iniciando petición:', {
      user: req.user?.email || 'NO USER',
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const {
      type = 'all', page = 1, limit = 20, search,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { isActive: true };

    // Filter by type
    if (type !== 'all') {
      whereClause.roomType = type;
    }

    // Search functionality
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // For private rooms, only show rooms where user is a participant
    if (type === 'private') {
      whereClause = {
        ...whereClause,
        '$participants.id$': req.user.id,
      };
    }

    console.log('🔍 WHERE CLAUSE:', JSON.stringify(whereClause, null, 2));

    const rooms = await Room.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'avatar', 'isOnline'],
          through: { attributes: ['role', 'joinedAt'] },
          required: type === 'private',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Hide password field and add participant count
    const roomsWithCount = rooms.rows.map((room) => {
      const roomData = room.toJSON();
      return {
        ...roomData,
        password: !!room.password, // Just indicate if password exists
        participantCount: room.participants ? room.participants.length : 0,
      };
    });

    console.log('✅ ROOMS ENCONTRADAS:', {
      total: rooms.count,
      returning: roomsWithCount.length,
      firstRoom: roomsWithCount[0]?.name || 'N/A'
    });

    res.json({
      success: true,
      rooms: roomsWithCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(rooms.count / limit),
        totalRooms: rooms.count,
        hasNext: offset + rooms.rows.length < rooms.count,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('❌ GET ROOMS ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const createRoom = async (req, res) => {
  try {
    const {
      name, description, roomType = 'public', maxUsers = 50, password,
    } = req.body;
    const userId = req.user.id;

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create room
    const room = await Room.create({
      name,
      description,
      roomType,
      maxUsers,
      password: hashedPassword,
      createdById: userId,
      userCount: 1,
    });

    // Add creator as first participant with admin role
    await RoomParticipant.create({
      userId,
      roomId: room.id,
      role: 'admin',
    });

    // Get room with creator info
    const fullRoom = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
      ],
    });

    const roomData = fullRoom.toJSON();
    res.status(201).json({
      success: true,
      message: 'Sala creada exitosamente',
      room: {
        ...roomData,
        password: !!room.password,
      },
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByPk(roomId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar'],
        },
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'username', 'avatar', 'isOnline', 'level'],
          through: { attributes: ['role', 'joinedAt'] },
        },
      ],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    const roomData = room.toJSON();
    res.json({
      success: true,
      room: {
        ...roomData,
        password: !!room.password,
      },
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;
    const userId = req.user.id;

    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'participants',
        through: { attributes: ['role'] },
      }],
    });

    if (!room || !room.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    // Check if user is already a participant
    const isParticipant = room.participants.some((p) => p.id === userId);
    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Ya eres participante de esta sala',
      });
    }

    // Check room capacity
    if (room.participants.length >= room.maxUsers) {
      return res.status(400).json({
        success: false,
        message: 'La sala está llena',
      });
    }

    // Check password for private rooms
    if (room.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Esta sala requiere contraseña',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, room.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta',
        });
      }
    }

    // Add user to room
    await RoomParticipant.create({
      userId,
      roomId: room.id,
      role: 'member',
    });

    // Update room user count
    await room.increment('userCount');

    res.json({
      success: true,
      message: 'Te has unido a la sala exitosamente',
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const participation = await RoomParticipant.findOne({
      where: { userId, roomId },
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'No eres participante de esta sala',
      });
    }

    // Remove participation
    await participation.destroy();

    // Update room user count
    const room = await Room.findByPk(roomId);
    if (room) {
      await room.decrement('userCount');
    }

    res.json({
      success: true,
      message: 'Has salido de la sala exitosamente',
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, maxUsers } = req.body;
    const userId = req.user.id;

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    // Check if user is creator or admin
    const participation = await RoomParticipant.findOne({
      where: { userId, roomId, role: ['admin', 'moderator'] },
    });

    if (room.createdById !== userId && !participation) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta sala',
      });
    }

    await room.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(maxUsers && { maxUsers }),
    });

    res.json({
      success: true,
      message: 'Sala actualizada exitosamente',
      room,
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  getRooms,
  createRoom,
  getRoomById,
  joinRoom,
  leaveRoom,
  updateRoom,
};
