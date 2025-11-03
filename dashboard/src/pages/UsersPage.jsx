import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  fetchUsers,
  selectUsers,
  selectUsersLoading,
  selectUsersPagination,
} from '../redux/dashboardSlice';
import Tabs from '../components/Tabs';
import UsersTableResponsive from '../components/UsersTableResponsive';
import CreateUserModal from '../components/CreateUserModal';

const UsersPage = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const pagination = useSelector(selectUsersPagination);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');

  // Configuración de pestañas
  const tabs = [
    {
      id: 'all',
      label: 'Todos los Usuarios',
      icon: UserIcon,
      count: users?.length || 0,
    },
    {
      id: 'admins',
      label: 'Administradores',
      icon: Cog6ToothIcon,
      count: users?.filter(user => user.role === 'admin').length || 0,
    },
    {
      id: 'moderators',
      label: 'Moderadores',
      icon: ChartBarIcon,
      count: users?.filter(user => user.role === 'moderator').length || 0,
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: UserIcon,
      count: users?.filter(user => user.role === 'user').length || 0,
    },
  ];

  // Filtrar usuarios según la pestaña activa
  const getFilteredUsers = () => {
    if (!users) return [];
    
    let filtered = users;
    
    // Filtrar por pestaña
    switch (activeTab) {
      case 'admins':
        filtered = users.filter(user => user.role === 'admin');
        break;
      case 'moderators':
        filtered = users.filter(user => user.role === 'moderator');
        break;
      case 'users':
        filtered = users.filter(user => user.role === 'user');
        break;
      default:
        filtered = users;
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Debugging logs
  console.log('🐛 UsersPage - Estado actual:', {
    users,
    loading,
    pagination,
    searchTerm,
    activeTab,
    usersLength: users?.length || 0,
    filteredUsersLength: filteredUsers?.length || 0,
  });

  useEffect(() => {
    console.log('🔄 UsersPage - Dispatching fetchUsers con parámetros:', {
      page: 1,
      limit: 50, // Aumentamos el límite para obtener más usuarios
      search: '',
    });
    
    dispatch(fetchUsers({ page: 1, limit: 50, search: '' }))
      .then((result) => {
        console.log('✅ fetchUsers - Resultado:', result);
      })
      .catch((error) => {
        console.error('❌ fetchUsers - Error:', error);
      });
  }, [dispatch]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleUserCreated = () => {
    // Recargar la lista de usuarios
    dispatch(fetchUsers({ page: 1, limit: 50, search: '' }));
  };

  const handleUserUpdate = (userId, userData) => {
    // TODO: Implementar actualización en Redux
    console.log('Usuario actualizado:', userId, userData);
    dispatch(fetchUsers({ page: 1, limit: 50, search: '' }));
  };

  const handleUserDelete = (userId) => {
    // TODO: Implementar eliminación en Redux
    console.log('Usuario eliminado:', userId);
    dispatch(fetchUsers({ page: 1, limit: 50, search: '' }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        </div>
        
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full sm:w-auto"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Crear Usuario
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Pestañas - Responsive */}
        <div className="px-3 sm:px-6 pt-4 sm:pt-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Barra de búsqueda - Responsive */}
        <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
          <div className="w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Contenido de la pestaña - Responsive */}
        <div className="px-3 sm:p-6">
          <UsersTableResponsive
            users={filteredUsers}
            loading={loading}
            onUserUpdate={handleUserUpdate}
            onUserDelete={handleUserDelete}
          />
        </div>
      </div>

      {/* Modal de crear usuario */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default UsersPage;