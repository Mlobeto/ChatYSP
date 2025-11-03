import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  FilmIcon,
  LightBulbIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  fetchDashboardStats,
  selectStats,
  selectDashboardLoading,
  selectDashboardError,
} from '../redux/dashboardSlice';

const DashboardHome = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectStats);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statsCards = [
    {
      name: 'Total Usuarios',
      value: stats?.general?.totalUsers || 0,
      change: `+${stats?.lastWeek?.newUsers || 0} esta semana`,
      changeType: 'increase',
      icon: UsersIcon,
      color: 'blue',
    },
    {
      name: 'Usuarios Activos',
      value: stats?.general?.onlineUsers || 0,
      change: 'Conectados ahora',
      changeType: 'neutral',
      icon: UsersIcon,
      color: 'green',
    },
    {
      name: 'Total Salas',
      value: stats?.general?.totalRooms || 0,
      change: `+${stats?.lastWeek?.newRooms || 0} esta semana`,
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'purple',
    },
    {
      name: 'Mensajes',
      value: stats?.general?.totalMessages || 0,
      change: `+${stats?.lastWeek?.messages || 0} esta semana`,
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'indigo',
    },
    {
      name: 'Tips Publicados',
      value: stats?.general?.totalTips || 0,
      change: 'Tips disponibles',
      changeType: 'neutral',
      icon: LightBulbIcon,
      color: 'yellow',
    },
    {
      name: 'Preguntas',
      value: stats?.general?.totalQuestions || 0,
      change: 'Banco de preguntas',
      changeType: 'neutral',
      icon: FilmIcon,
      color: 'red',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-100',
      green: 'bg-green-500 text-green-100',
      purple: 'bg-purple-500 text-purple-100',
      indigo: 'bg-indigo-500 text-indigo-100',
      yellow: 'bg-yellow-500 text-yellow-100',
      red: 'bg-red-500 text-red-100',
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-medium mb-2">
          Error al cargar las estadísticas
        </div>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Resumen general de la plataforma ChatYSP</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Tarjetas de estadísticas responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className={`p-2 sm:p-3 rounded-md ${getColorClasses(stat.color)}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </p>
                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                      {(stat.value || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center">
                  <div className={`flex items-center text-xs sm:text-sm ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600' 
                      : stat.changeType === 'decrease'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : null}
                    <span className="font-medium">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actividad reciente responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Usuarios por Puntos */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">🏆 Top Usuarios por Puntos</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {stats?.topUsers?.length > 0 ? (
                stats.topUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        Nivel {user.level} • {user.gamesWon}/{user.gamesPlayed} juegos
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 font-bold flex-shrink-0">
                      {user.points.toLocaleString()} pts
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">
                  No hay usuarios registrados aún
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de Actividad Semanal */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">📊 Actividad Esta Semana</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Nuevos Usuarios</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-blue-600 flex-shrink-0">
                  {stats?.lastWeek?.newUsers || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Nuevas Salas</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-purple-600 flex-shrink-0">
                  {stats?.lastWeek?.newRooms || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">Mensajes Enviados</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-green-600 flex-shrink-0">
                  {stats?.lastWeek?.messages?.toLocaleString() || 0}
                </span>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Datos de los últimos 7 días
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;