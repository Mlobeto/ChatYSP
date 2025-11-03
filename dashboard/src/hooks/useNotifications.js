import { useState, useEffect, useCallback } from 'react';
import NotificationService from '../services/notificationService';

/**
 * Hook personalizado para gestionar notificaciones
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Cargar notificaciones
   */
  const loadNotifications = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await NotificationService.getUserNotifications(page, limit);
      
      if (response.success) {
        const formattedNotifications = response.data.notifications.map(
          NotificationService.formatNotificationForUI
        );
        
        setNotifications(formattedNotifications);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        throw new Error(response.message || 'Error al cargar notificaciones');
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marcar notificación como leída
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, unread: false }
              : notification
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, unread: false }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  /**
   * Recargar notificaciones
   */
  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Agregar nueva notificación (para actualizaciones en tiempo real)
   */
  const addNotification = useCallback((newNotification) => {
    const formattedNotification = NotificationService.formatNotificationForUI(newNotification);
    
    setNotifications(prev => [formattedNotification, ...prev]);
    
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  /**
   * Cargar notificaciones al montar el componente
   */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    refresh,
    addNotification,
  };
};