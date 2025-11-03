const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// Obtener notificaciones del usuario
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    let whereClause = { userId };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Filtrar notificaciones no expiradas
    whereClause[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } }
    ];

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Obtener contador de notificaciones no leídas
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.count({
      where: {
        userId,
        isRead: false,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ],
      },
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contador de notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar la notificación como leída',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false,
        },
      }
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Eliminar notificación
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notificación eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la notificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Crear notificación (para admins)
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, priority, relatedId, relatedType, metadata, expiresAt } = req.body;

    // Validar campos requeridos
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'UserId, título y mensaje son requeridos',
      });
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const notification = await Notification.create({
      userId,
      type: type || 'general',
      title,
      message,
      priority: priority || 'normal',
      relatedId,
      relatedType,
      metadata,
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Notificación creada correctamente',
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la notificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Crear notificación masiva (para admins)
const createBulkNotification = async (req, res) => {
  try {
    const { userIds, type, title, message, priority, relatedId, relatedType, metadata, expiresAt } = req.body;

    // Validar campos requeridos
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'UserIds (array), título y mensaje son requeridos',
      });
    }

    // Verificar que los usuarios existen
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id'],
    });

    if (users.length !== userIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Algunos usuarios no fueron encontrados',
      });
    }

    // Crear notificaciones para todos los usuarios
    const notificationsData = userIds.map(userId => ({
      userId,
      type: type || 'general',
      title,
      message,
      priority: priority || 'normal',
      relatedId,
      relatedType,
      metadata,
      expiresAt,
    }));

    const notifications = await Notification.bulkCreate(notificationsData);

    res.status(201).json({
      success: true,
      message: `${notifications.length} notificaciones creadas correctamente`,
      data: { count: notifications.length },
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear las notificaciones masivas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotification,
};