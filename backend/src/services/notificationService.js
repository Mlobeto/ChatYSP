const { Op } = require('sequelize');
const { Notification, User } = require('../models');

/**
 * Servicio para crear y gestionar notificaciones
 */
class NotificationService {
  /**
   * Crear una notificación para un usuario específico
   */
  static async createUserNotification({
    userId,
    type = 'general',
    title,
    message,
    priority = 'normal',
    relatedId = null,
    relatedType = null,
    metadata = null,
    expiresAt = null,
  }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        priority,
        relatedId,
        relatedType,
        metadata,
        expiresAt,
      });

      return { success: true, notification };
    } catch (error) {
      console.error('Error creating user notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear notificaciones masivas para múltiples usuarios
   */
  static async createBulkNotifications({
    userIds,
    type = 'general',
    title,
    message,
    priority = 'normal',
    relatedId = null,
    relatedType = null,
    metadata = null,
    expiresAt = null,
  }) {
    try {
      const notificationsData = userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        priority,
        relatedId,
        relatedType,
        metadata,
        expiresAt,
      }));

      const notifications = await Notification.bulkCreate(notificationsData);

      return { success: true, notifications, count: notifications.length };
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificar cuando un nuevo usuario se registra
   */
  static async notifyUserRegistration(newUser) {
    try {
      // Obtener todos los administradores
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id'],
      });

      if (admins.length === 0) return { success: true, message: 'No admins to notify' };

      const adminIds = admins.map((admin) => admin.id);

      return await this.createBulkNotifications({
        userIds: adminIds,
        type: 'user_registered',
        title: 'Nuevo usuario registrado',
        message: `${newUser.username} se ha registrado en la plataforma`,
        priority: 'normal',
        relatedId: newUser.id,
        relatedType: 'user',
        metadata: {
          username: newUser.username,
          email: newUser.email,
          registrationDate: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error('Error notifying user registration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificar cuando se crea un tip
   */
  static async notifyTipCreated(tip, creator) {
    try {
      // Obtener todos los administradores excepto el creador
      const admins = await User.findAll({
        where: {
          role: 'admin',
          id: { [Op.ne]: creator.id },
        },
        attributes: ['id'],
      });

      if (admins.length === 0) return { success: true, message: 'No admins to notify' };

      const adminIds = admins.map((admin) => admin.id);

      return await this.createBulkNotifications({
        userIds: adminIds,
        type: 'tip_created',
        title: 'Tip creado',
        message: `Se ha creado un nuevo tip: "${tip.title}"`,
        priority: 'normal',
        relatedId: tip.id,
        relatedType: 'tip',
        metadata: {
          tipTitle: tip.title,
          category: tip.category,
          creatorUsername: creator.username,
          createdAt: tip.createdAt,
        },
      });
    } catch (error) {
      console.error('Error notifying tip creation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificar cuando se actualiza un tip
   */
  static async notifyTipUpdated(tip, updater) {
    try {
      // Obtener todos los administradores excepto el actualizador
      const admins = await User.findAll({
        where: {
          role: 'admin',
          id: { [Op.ne]: updater.id },
        },
        attributes: ['id'],
      });

      if (admins.length === 0) return { success: true, message: 'No admins to notify' };

      const adminIds = admins.map((admin) => admin.id);

      return await this.createBulkNotifications({
        userIds: adminIds,
        type: 'tip_updated',
        title: 'Tip actualizado',
        message: `El tip "${tip.title}" ha sido actualizado`,
        priority: 'normal',
        relatedId: tip.id,
        relatedType: 'tip',
        metadata: {
          tipTitle: tip.title,
          category: tip.category,
          updaterUsername: updater.username,
          updatedAt: tip.updatedAt,
        },
      });
    } catch (error) {
      console.error('Error notifying tip update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificar eventos del sistema
   */
  static async notifySystemEvent({
    title,
    message,
    priority = 'normal',
    targetRoles = ['admin'],
    metadata = null,
    expiresAt = null,
  }) {
    try {
      // Obtener usuarios con los roles especificados
      const users = await User.findAll({
        where: { role: targetRoles },
        attributes: ['id'],
      });

      if (users.length === 0) return { success: true, message: 'No users to notify' };

      const userIds = users.map((user) => user.id);

      return await this.createBulkNotifications({
        userIds,
        type: 'system',
        title,
        message,
        priority,
        relatedId: null,
        relatedType: 'system',
        metadata,
        expiresAt,
      });
    } catch (error) {
      console.error('Error notifying system event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Limpiar notificaciones expiradas
   */
  static async cleanExpiredNotifications() {
    try {
      const deletedCount = await Notification.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      });

      console.log(`Cleaned ${deletedCount} expired notifications`);
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error cleaning expired notifications:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;
