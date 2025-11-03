import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  UserIcon,
  CogIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { updateUser, deleteUser } from '../redux/dashboardSlice';

const UsersTableResponsive = ({ users, loading, onUserUpdate, onUserDelete }) => {
  const dispatch = useDispatch();
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [openMenus, setOpenMenus] = useState({});

  const roles = [
    { value: 'user', label: 'Usuario', icon: UserIcon, color: 'text-gray-600' },
    { value: 'moderator', label: 'Moderador', icon: ShieldCheckIcon, color: 'text-blue-600' },
    { value: 'admin', label: 'Administrador', icon: CogIcon, color: 'text-red-600' },
  ];

  const countries = [
    { code: 'AR', name: 'Argentina' },
    { code: 'PE', name: 'Perú' },
    { code: 'MX', name: 'México' },
    { code: 'CO', name: 'Colombia' },
    { code: 'ES', name: 'España' },
  ];

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[0];
  };

  const getCountryName = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const toggleMenu = (userId) => {
    setOpenMenus(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleEditStart = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      country: user.country || '',
      phone: user.phone || '',
    });
    setOpenMenus({});
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleEditSave = async () => {
    try {
      const result = await dispatch(updateUser({
        id: editingUser,
        userData: editFormData
      })).unwrap();
      
      toast.success('Usuario actualizado correctamente');
      setEditingUser(null);
      setEditFormData({});
      onUserUpdate(editingUser, editFormData);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success('Usuario eliminado correctamente');
        onUserDelete(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
      }
    }
    setOpenMenus({});
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Mobile Loading */}
        <div className="block sm:hidden space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Loading */}
        <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron usuarios con los criterios de búsqueda.
        </p>
      </div>
    );
  }

  // Mobile Card View
  const MobileCard = ({ user }) => {
    const roleInfo = getRoleInfo(user.role);
    const isEditing = editingUser === user.id;
    const isMenuOpen = openMenus[user.id];

    if (isEditing) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Editar Usuario</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleEditSave}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleEditCancel}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={editFormData.username}
                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
              <select
                value={editFormData.country}
                onChange={(e) => setEditFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Sin país</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => toggleMenu(user.id)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => handleEditStart(user)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} bg-gray-100`}>
            <roleInfo.icon className="w-3 h-3 mr-1" />
            {roleInfo.label}
          </span>
          
          {user.country && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
              {getCountryName(user.country)}
            </span>
          )}
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            user.isOnline ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'
          }`}>
            {user.isOnline ? 'En línea' : 'Desconectado'}
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Registrado: {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile View */}
      <div className="block sm:hidden">
        <div className="mb-4 text-sm text-gray-700">
          {users.length} usuario{users.length !== 1 ? 's' : ''}
        </div>
        <div className="space-y-3">
          {users.map((user) => (
            <MobileCard key={user.id} user={user} />
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Usuarios ({users.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const isEditing = editingUser === user.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.username}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            ) : (
                              user.username
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isEditing ? (
                              <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              />
                            ) : (
                              user.email
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={editFormData.role}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                          className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color} bg-gray-100`}>
                          <roleInfo.icon className="w-4 h-4 mr-1" />
                          {roleInfo.label}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <select
                          value={editFormData.country}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, country: e.target.value }))}
                          className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="">Sin país</option>
                          {countries.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        user.country ? getCountryName(user.country) : '-'
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isOnline 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isOnline ? 'En línea' : 'Desconectado'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={handleEditSave}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditStart(user)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UsersTableResponsive;