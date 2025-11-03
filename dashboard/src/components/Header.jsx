import React, { useState } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';

const Header = ({ user, onToggleSidebar, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Hook para gestionar notificaciones dinámicas
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refresh 
  } = useNotifications();

  const handleNotificationClick = (notification) => {
    // Aquí puedes agregar lógica para navegar a la página relacionada
    console.log('Notification clicked:', notification);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Lado izquierdo */}
        <div className="flex items-center flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Búsqueda - oculta en móvil muy pequeño, visible desde sm */}
          <div className="ml-2 sm:ml-4 relative hidden sm:block flex-1 max-w-xs lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Búsqueda móvil - solo visible en móvil */}
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 sm:hidden">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-[80vh] sm:max-h-96">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                      Notificaciones
                    </h3>
                    <button
                      onClick={refresh}
                      className="p-1 text-gray-400 hover:text-gray-500 rounded"
                      disabled={loading}
                    >
                      <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {unreadCount} sin leer
                    </p>
                  )}
                </div>

                <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                  {loading && notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Cargando notificaciones...
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">
                      <p className="text-sm">Error al cargar notificaciones</p>
                      <button
                        onClick={refresh}
                        className="text-xs text-blue-600 hover:text-blue-500 mt-1"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No tienes notificaciones</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onClick={handleNotificationClick}
                      />
                    ))
                  )}
                </div>

                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400"
                      disabled={unreadCount === 0}
                    >
                      Marcar todas como leídas
                    </button>
                    <button className="text-sm text-primary-600 hover:text-primary-500">
                      Ver todas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <div className="flex items-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
                <div className="ml-3 text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDownIcon className="ml-2 w-4 h-4 text-gray-400" />
              </div>
            </button>

            {/* Dropdown del usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mi Perfil
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Configuración
                  </button>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cerrar dropdowns al hacer click fuera */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;