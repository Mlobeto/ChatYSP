import React from 'react';
import NotificationService from '../services/notificationService';

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onClick 
}) => {
  const handleClick = () => {
    if (notification.unread) {
      onMarkAsRead(notification.id);
    }
    
    if (onClick) {
      onClick(notification);
    }
  };

  const icon = NotificationService.getNotificationIcon(notification.type);
  const priorityColor = NotificationService.getPriorityColor(notification.priority);

  return (
    <div
      onClick={handleClick}
      className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        notification.unread ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icono del tipo de notificación */}
        <div className="flex-shrink-0">
          <span className="text-lg" role="img" aria-label={notification.type}>
            {icon}
          </span>
        </div>

        {/* Contenido de la notificación */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className={`text-sm font-medium truncate ${
                notification.unread ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            
            {/* Indicador de no leída */}
            {notification.unread && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0 ml-2"></div>
            )}
          </div>

          {/* Tiempo y prioridad */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">{notification.time}</p>
            
            {notification.priority !== 'normal' && (
              <span className={`text-xs font-medium ${priorityColor}`}>
                {notification.priority === 'high' && '⚠️ Alta'}
                {notification.priority === 'urgent' && '🚨 Urgente'}
                {notification.priority === 'low' && '📌 Baja'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;