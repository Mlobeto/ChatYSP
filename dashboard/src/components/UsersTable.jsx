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
} from '@heroicons/react/24/outline';
import { updateUser, deleteUser } from '../redux/dashboardSlice';

const UsersTable = ({ users, loading, onUserUpdate, onUserDelete }) => {
  const dispatch = useDispatch();
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handleEditStart = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      country: user.country || '',
      phone: user.phone || '',
    });
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleEditSave = async (userId) => {
    try {
      const result = await dispatch(updateUser({ 
        userId, 
        userData: editFormData 
      }));
      
      if (updateUser.fulfilled.match(result)) {
        toast.success('Usuario actualizado exitosamente');
        setEditingUser(null);
        setEditFormData({});
        onUserUpdate?.(userId, editFormData);
      }
    } catch (error) {
      toast.error('Error al actualizar usuario: ' + error.message);
    }
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
      try {
        const result = await dispatch(deleteUser(userId));
        
        if (deleteUser.fulfilled.match(result)) {
          toast.success('Usuario eliminado exitosamente');
          onUserDelete?.(userId);
        }
      } catch (error) {
        toast.error('Error al eliminar usuario: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white shadow rounded-lg overflow-hidden">
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
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron usuarios con los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
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
                    {formatDate(user.createdAt)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditing ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditSave(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Guardar cambios"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-gray-600 hover:text-gray-900"
                          title="Cancelar"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditStart(user)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar usuario"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar usuario"
                        >
                          <TrashIcon className="h-5 w-5" />
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
  );
};

export default UsersTable;