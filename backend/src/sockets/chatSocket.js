const jwt = require('jsonwebtoken');
const {
  User, Message, Room, RoomParticipant,
} = require('../models');

const chatSocket = (io) => {
  // Socket authentication middleware
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

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected (${socket.id})`);

    // Update user online status
    await User.update(
      { isOnline: true, lastSeen: new Date() },
      { where: { id: socket.userId } },
    );

    // Join user to their rooms
    const userRooms = await Room.findAll({
      include: [{
        model: User,
        as: 'participants',
        where: { id: socket.userId },
        through: { attributes: ['role'] },
      }],
    });

    userRooms.forEach((room) => {
      socket.join(room.id);
      console.log(`User ${socket.user.username} joined room ${room.name}`);
    });

    // Broadcast user online status to all rooms
    userRooms.forEach((room) => {
      socket.to(room.id).emit('userOnline', {
        userId: socket.userId,
        username: socket.user.username,
        avatar: socket.user.avatar,
      });
    });

    // Handle joining a room
    socket.on('joinRoom', async (data) => {
      try {
        const { roomId } = data;

        // Check if user is participant of the room
        const participation = await RoomParticipant.findOne({
          where: { userId: socket.userId, roomId },
        });

        if (!participation) {
          socket.emit('error', { message: 'No tienes acceso a esta sala' });
          return;
        }

        socket.join(roomId);

        // Notify others in the room
        socket.to(roomId).emit('userJoinedRoom', {
          userId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar,
          timestamp: new Date(),
        });

        socket.emit('joinedRoom', { roomId });
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Error al unirse a la sala' });
      }
    });

    // Handle leaving a room
    socket.on('leaveRoom', async (data) => {
      try {
        const { roomId } = data;

        socket.leave(roomId);

        // Notify others in the room
        socket.to(roomId).emit('userLeftRoom', {
          userId: socket.userId,
          username: socket.user.username,
          timestamp: new Date(),
        });

        socket.emit('leftRoom', { roomId });
      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Error al salir de la sala' });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const {
          roomId, content, messageType = 'text', replyToId,
        } = data;

        // Verify user is in the room
        const rooms = Array.from(socket.rooms);
        if (!rooms.includes(roomId)) {
          socket.emit('error', { message: 'No estás en esta sala' });
          return;
        }

        // Create message in database
        const message = await Message.create({
          content,
          senderId: socket.userId,
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

        // Broadcast message to all users in the room
        io.to(roomId).emit('newMessage', fullMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Error al enviar mensaje' });
      }
    });

    // Handle message editing
    socket.on('editMessage', async (data) => {
      try {
        const { messageId, content } = data;

        const message = await Message.findOne({
          where: {
            id: messageId,
            senderId: socket.userId,
            isDeleted: false,
          },
        });

        if (!message) {
          socket.emit('error', { message: 'Mensaje no encontrado o sin permisos' });
          return;
        }

        // Check if message is older than 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (message.createdAt < fiveMinutesAgo) {
          socket.emit('error', { message: 'No puedes editar mensajes después de 5 minutos' });
          return;
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

        // Broadcast edited message
        io.to(message.roomId).emit('messageEdited', updatedMessage);
      } catch (error) {
        console.error('Edit message error:', error);
        socket.emit('error', { message: 'Error al editar mensaje' });
      }
    });

    // Handle message deletion
    socket.on('deleteMessage', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findOne({
          where: {
            id: messageId,
            senderId: socket.userId,
            isDeleted: false,
          },
        });

        if (!message) {
          socket.emit('error', { message: 'Mensaje no encontrado o sin permisos' });
          return;
        }

        await message.update({ isDeleted: true });

        // Broadcast deleted message
        io.to(message.roomId).emit('messageDeleted', { messageId });
      } catch (error) {
        console.error('Delete message error:', error);
        socket.emit('error', { message: 'Error al eliminar mensaje' });
      }
    });

    // Handle typing indicators
    socket.on('startTyping', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('userTyping', {
        userId: socket.userId,
        username: socket.user.username,
      });
    });

    socket.on('stopTyping', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('userStoppedTyping', {
        userId: socket.userId,
      });
    });

    // Handle message reactions
    socket.on('addReaction', async (data) => {
      try {
        const { messageId, emoji } = data;

        const message = await Message.findByPk(messageId);

        if (!message) {
          socket.emit('error', { message: 'Mensaje no encontrado' });
          return;
        }

        const reactions = message.reactions || [];

        // Check if user already reacted with this emoji
        const existingReactionIndex = reactions.findIndex(
          (reaction) => reaction.user === socket.userId && reaction.emoji === emoji,
        );

        if (existingReactionIndex > -1) {
          // Remove reaction
          reactions.splice(existingReactionIndex, 1);
        } else {
          // Add reaction
          reactions.push({ user: socket.userId, emoji });
        }

        await message.update({ reactions });

        // Broadcast reaction update
        io.to(message.roomId).emit('reactionUpdated', {
          messageId,
          reactions,
          userId: socket.userId,
          emoji,
          action: existingReactionIndex > -1 ? 'removed' : 'added',
        });
      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', { message: 'Error al añadir reacción' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected (${socket.id})`);

      // Update user offline status
      await User.update(
        { isOnline: false, lastSeen: new Date() },
        { where: { id: socket.userId } },
      );

      // Broadcast user offline status to all rooms
      userRooms.forEach((room) => {
        socket.to(room.id).emit('userOffline', {
          userId: socket.userId,
          username: socket.user.username,
        });
      });
    });
  });
};

module.exports = chatSocket;
