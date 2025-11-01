const { Op } = require('sequelize');
const { Message, User, Room } = require('../models');

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is participant of the room
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'participants',
        where: { id: req.user.id },
        required: false,
      }],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    if (room.roomType === 'private' && !room.participants.length) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sala',
      });
    }

    const messages = await Message.findAndCountAll({
      where: {
        roomId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar', 'level'],
        },
        {
          model: Message,
          as: 'replyTo',
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username'],
          }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      messages: messages.rows.reverse(), // Reverse to show oldest first
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

const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, messageType = 'text', replyToId } = req.body;

    // Check if user is participant of the room
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'participants',
        where: { id: req.user.id },
        required: false,
      }],
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala no encontrada',
      });
    }

    if (room.roomType === 'private' && !room.participants.length) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta sala',
      });
    }

    // Create message
    const message = await Message.create({
      content,
      senderId: req.user.id,
      roomId,
      messageType,
      replyToId: replyToId || null,
    });

    // Get message with sender info
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar', 'level'],
        },
        {
          model: Message,
          as: 'replyTo',
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username'],
          }],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: fullMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: {
        id: messageId,
        senderId: userId,
        isDeleted: false,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado o no tienes permisos para editarlo',
      });
    }

    // Check if message is older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'No puedes editar mensajes después de 5 minutos',
      });
    }

    await message.update({
      content,
      isEdited: true,
      editedAt: new Date(),
    });

    const updatedMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar', 'level'],
      }],
    });

    res.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error('Edit message error:', error);
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
    const userId = req.user.id;

    const message = await Message.findOne({
      where: {
        id: messageId,
        senderId: userId,
        isDeleted: false,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado o no tienes permisos para eliminarlo',
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

const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado',
      });
    }

    const reactions = message.reactions || [];

    // Check if user already reacted with this emoji
    const existingReactionIndex = reactions.findIndex(
      (reaction) => reaction.user === userId && reaction.emoji === emoji,
    );

    if (existingReactionIndex > -1) {
      // Remove reaction
      reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction
      reactions.push({ user: userId, emoji });
    }

    await message.update({ reactions });

    res.json({
      success: true,
      reactions,
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
};
