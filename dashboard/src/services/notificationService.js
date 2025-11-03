import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar notificaciones en el frontend
 */
class NotificationService {
  /**
   * Obtener notificaciones del usuario actual
   */
  static async getUserNotifications(page = 1, limit = 10, onlyUnread = false) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (onlyUnread) {
        params.append('unread', 'true');
      }

      const response = await api.get(`/notifications?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Marcar una notificación como leída
   */
  static async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Formatear el tiempo de una notificación
   */
  static formatTime(dateString) {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Ahora mismo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    } else {
      return notificationDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  }

  /**
   * Formatear notificación para el UI
   */
  static formatNotificationForUI(notification) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      time: NotificationService.formatTime(notification.createdAt),
      unread: !notification.isRead,
      priority: notification.priority,
      type: notification.type,
      relatedId: notification.relatedId,
      relatedType: notification.relatedType,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    };
  }

  /**
   * Obtener el icono según el tipo de notificación
   */
  static getNotificationIcon(type) {
    const icons = {
      user_registered: '👤',
      tip_created: '💡',
      tip_updated: '✏️',
      system: '⚙️',
      general: '📢',
    };
    
    return icons[type] || '📢';
  }

  /**
   * Obtener el color según la prioridad
   */
  static getPriorityColor(priority) {
    const colors = {
      low: 'text-gray-500',
      normal: 'text-blue-600',
      high: 'text-orange-500',
      urgent: 'text-red-600',
    };

    return colors[priority] || 'text-blue-600';
  }
}

export default NotificationService;