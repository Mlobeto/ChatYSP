import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RoomCard({ room, onJoin, onLeave, connectedUsers = 0 }) {
  const isJoined = room.isJoined;
  const memberCount = room.memberCount || 0;
  const lastActivity = room.lastActivity ? new Date(room.lastActivity) : null;
  
  const getTimeAgo = (date) => {
    if (!date) return 'Sin actividad';
    
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Ahora' : `Hace ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  const getCountryFlag = (countryName) => {
    const flags = {
      'Argentina': '🇦🇷',
      'Brasil': '🇧🇷',
      'Mexico': '🇲🇽',
      'España': '🇪🇸',
      'Colombia': '🇨🇴',
      'Chile': '🇨🇱',
      'Peru': '🇵🇪',
      'Venezuela': '🇻🇪',
      'Uruguay': '🇺🇾',
      'Paraguay': '🇵🇾',
      'Ecuador': '🇪🇨',
      'Bolivia': '🇧🇴',
      'Costa Rica': '🇨🇷',
      'Panama': '🇵🇦',
      'Guatemala': '🇬🇹',
      'Honduras': '🇭🇳',
      'El Salvador': '🇸🇻',
      'Nicaragua': '🇳🇮',
      'Dominican Republic': '🇩🇴',
      'Cuba': '🇨🇺',
      'Puerto Rico': '🇵🇷',
    };
    return flags[countryName] || '🌍';
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">
            {getCountryFlag(room.country)}
          </Text>
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-lg">
              {room.name}
            </Text>
            <Text className="text-gray-600 text-sm">
              {room.country}
            </Text>
          </View>
        </View>
        
        {/* Estado de la sala */}
        <View className={`px-2 py-1 rounded-full ${
          room.isActive ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <Text className={`text-xs font-medium ${
            room.isActive ? 'text-green-700' : 'text-gray-600'
          }`}>
            {room.isActive ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      {room.description && (
        <Text className="text-gray-600 text-sm mb-3 leading-5">
          {room.description}
        </Text>
      )}

      {/* Estadísticas */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-4">
          {/* Usuarios conectados */}
          <View className="flex-row items-center">
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-1 font-medium">
              {memberCount} miembros
            </Text>
          </View>

          {/* Usuarios en línea */}
          {connectedUsers > 0 && (
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              <Text className="text-green-600 text-sm font-medium">
                {connectedUsers} en línea
              </Text>
            </View>
          )}
        </View>

        {/* Última actividad */}
        <Text className="text-gray-500 text-xs">
          {getTimeAgo(lastActivity)}
        </Text>
      </View>

      {/* Último mensaje */}
      {room.lastMessage && (
        <View className="bg-gray-50 rounded-lg p-3 mb-4">
          <View className="flex-row items-start">
            <Text className="font-medium text-gray-900 text-sm">
              {room.lastMessage.senderName}:
            </Text>
            <Text className="text-gray-600 text-sm ml-2 flex-1">
              {room.lastMessage.content}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs mt-1">
            {getTimeAgo(new Date(room.lastMessage.timestamp))}
          </Text>
        </View>
      )}

      {/* Tags/Temas */}
      {room.tags && room.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-4">
          {room.tags.slice(0, 3).map((tag, index) => (
            <View key={index} className="bg-primary-100 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-primary-700 text-xs font-medium">
                #{tag}
              </Text>
            </View>
          ))}
          {room.tags.length > 3 && (
            <View className="bg-gray-100 px-2 py-1 rounded-full">
              <Text className="text-gray-600 text-xs font-medium">
                +{room.tags.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Botones de acción */}
      <View className="flex-row space-x-3">
        {isJoined ? (
          <>
            <TouchableOpacity
              className="flex-1 bg-primary-500 py-3 rounded-xl"
              onPress={onJoin}
            >
              <Text className="text-white font-semibold text-center">
                Abrir chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-200 px-4 py-3 rounded-xl"
              onPress={onLeave}
            >
              <Ionicons name="exit-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            className="flex-1 bg-primary-500 py-3 rounded-xl"
            onPress={onJoin}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="enter-outline" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">
                Unirse
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Indicador de sala privada */}
      {room.isPrivate && (
        <View className="absolute top-4 right-4">
          <Ionicons name="lock-closed" size={16} color="#f59e0b" />
        </View>
      )}
    </View>
  );
}