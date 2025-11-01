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
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'blue',
    },
    {
      name: 'Usuarios Activos',
      value: stats.activeUsers,
      change: '+8%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'green',
    },
    {
      name: 'Total Salas',
      value: stats.totalRooms,
      change: '-2%',
      changeType: 'decrease',
      icon: ChatBubbleLeftRightIcon,
      color: 'purple',
    },
    {
      name: 'Mensajes',
      value: stats.totalMessages,
      change: '+24%',
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'indigo',
    },
    {
      name: 'Tips Publicados',
      value: stats.totalTips,
      change: '+5%',
      changeType: 'increase',
      icon: LightBulbIcon,
      color: 'yellow',
    },
    {
      name: 'Videos Subidos',
      value: stats.totalVideos,
      change: '+15%',
      changeType: 'increase',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general de la plataforma ChatYSP</p>
        </div>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-md ${getColorClasses(stat.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className={`flex items-center text-sm ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="font-medium">{stat.change}</span>
                  </div>
                  <span className="text-gray-500 text-sm ml-2">vs mes anterior</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios recientes */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Usuarios Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Usuario {i + 1}
                    </p>
                    <p className="text-sm text-gray-500">
                      Registrado hace {i + 1} hora{i !== 0 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Activo
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actividad del sistema */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actividad del Sistema</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Nuevo tip creado</p>
                  <p className="text-sm text-gray-500">hace 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Usuario conectado</p>
                  <p className="text-sm text-gray-500">hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Video subido</p>
                  <p className="text-sm text-gray-500">hace 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Sala creada</p>
                  <p className="text-sm text-gray-500">hace 30 minutos</p>
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