import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout, updateProfile } from '../redux/authSlice';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { readTips, favorites } = useSelector((state) => state.tips);
  const { score: totalGameScore } = useSelector((state) => state.game);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile(editForm)).unwrap();
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const renderStatCard = (title, value, icon, color = 'primary') => (
    <View className="bg-white rounded-xl p-4 flex-1 items-center">
      <View className={`bg-${color}-100 w-12 h-12 rounded-full items-center justify-center mb-2`}>
        <Ionicons name={icon} size={24} color={color === 'primary' ? '#0ea5e9' : color === 'green' ? '#10b981' : '#f59e0b'} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-gray-600 text-sm text-center">{title}</Text>
    </View>
  );

  const renderMenuItem = (title, subtitle, icon, onPress, rightElement = null) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 flex-row items-center mb-3"
      onPress={onPress}
    >
      <View className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon} size={20} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900">{title}</Text>
        {subtitle && <Text className="text-gray-600 text-sm">{subtitle}</Text>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#6B7280" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-500 pt-12 pb-8 px-4">
        <View className="items-center">
          <View className="bg-white w-24 h-24 rounded-full items-center justify-center mb-4">
            <Text className="text-primary-500 font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-white font-bold text-xl mb-1">
            {user?.name}
          </Text>
          <Text className="text-blue-100">
            {user?.email}
          </Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="location" size={16} color="#bfdbfe" />
            <Text className="text-blue-100 ml-1">
              {user?.country}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 -mt-4">
        {/* Estadísticas */}
        <View className="flex-row space-x-3 mb-6">
          {renderStatCard('Tips leídos', readTips?.length || 0, 'bulb', 'primary')}
          {renderStatCard('Favoritos', favorites?.length || 0, 'heart', 'red')}
          {renderStatCard('Puntos totales', totalGameScore || 0, 'trophy', 'yellow')}
        </View>

        {/* Información personal */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Información personal
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isLoading}
            >
              <Text className="text-primary-500 font-semibold">
                {isEditing ? 'Guardar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {/* Nombre */}
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-600 text-sm mb-1">Nombre completo</Text>
              {isEditing ? (
                <TextInput
                  className="text-gray-900 font-medium"
                  value={editForm.name}
                  onChangeText={(value) => setEditForm(prev => ({ ...prev, name: value }))}
                  placeholder="Tu nombre completo"
                />
              ) : (
                <Text className="text-gray-900 font-medium">{user?.name}</Text>
              )}
            </View>

            {/* Email (no editable) */}
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-600 text-sm mb-1">Email</Text>
              <Text className="text-gray-900 font-medium">{user?.email}</Text>
            </View>

            {/* Teléfono */}
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-600 text-sm mb-1">Teléfono</Text>
              {isEditing ? (
                <TextInput
                  className="text-gray-900 font-medium"
                  value={editForm.phone}
                  onChangeText={(value) => setEditForm(prev => ({ ...prev, phone: value }))}
                  placeholder="Tu número de teléfono"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-gray-900 font-medium">{user?.phone}</Text>
              )}
            </View>

            {/* País */}
            <View className="bg-white rounded-xl p-4">
              <Text className="text-gray-600 text-sm mb-1">País</Text>
              {isEditing ? (
                <TextInput
                  className="text-gray-900 font-medium"
                  value={editForm.country}
                  onChangeText={(value) => setEditForm(prev => ({ ...prev, country: value }))}
                  placeholder="Tu país"
                />
              ) : (
                <Text className="text-gray-900 font-medium">{user?.country}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Configuración */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Configuración
          </Text>

          {renderMenuItem(
            'Notificaciones',
            'Recibir notificaciones push',
            'notifications',
            () => {},
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
            />
          )}

          {renderMenuItem(
            'Sonidos',
            'Reproducir sonidos en la app',
            'volume-high',
            () => {},
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }}
              thumbColor={soundEnabled ? '#ffffff' : '#ffffff'}
            />
          )}

          {renderMenuItem(
            'Cambiar contraseña',
            'Actualizar tu contraseña',
            'lock-closed',
            () => navigation.navigate('ChangePassword')
          )}

          {renderMenuItem(
            'Privacidad',
            'Configuración de privacidad',
            'shield-checkmark',
            () => navigation.navigate('Privacy')
          )}
        </View>

        {/* Aplicación */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Aplicación
          </Text>

          {renderMenuItem(
            'Ayuda y soporte',
            'Obtener ayuda o contactar soporte',
            'help-circle',
            () => navigation.navigate('Help')
          )}

          {renderMenuItem(
            'Acerca de',
            'Información de la aplicación',
            'information-circle',
            () => navigation.navigate('About')
          )}

          {renderMenuItem(
            'Términos y condiciones',
            'Leer términos de uso',
            'document-text',
            () => navigation.navigate('Terms')
          )}
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center justify-center mb-8"
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text className="text-red-600 font-semibold ml-2">
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        {/* Versión */}
        <View className="items-center pb-8">
          <Text className="text-gray-500 text-sm">
            ChatYSP Mobile v1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}