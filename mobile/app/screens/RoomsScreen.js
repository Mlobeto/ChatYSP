import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { 
  loadRooms,
  joinRoom,
  leaveRoom,
  setActiveRoom,
  loadRoomMessages
} from '../redux/roomsSlice';
import RoomCard from '../components/RoomCard';
import socketService from '../services/socketService';

export default function RoomsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { 
    rooms, 
    activeRoom, 
    isLoading, 
    connectedUsers 
  } = useSelector((state) => state.rooms);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'joined', 'popular'

  useEffect(() => {
    // Cargar salas al montar el componente
    dispatch(loadRooms());

    // Configurar listeners de Socket.IO
    socketService.on('room_user_joined', (data) => {
      console.log('Usuario se unió a sala:', data);
    });

    socketService.on('room_user_left', (data) => {
      console.log('Usuario salió de sala:', data);
    });

    socketService.on('room_message', (message) => {
      // Este mensaje se manejará en el chat de la sala específica
      console.log('Nuevo mensaje en sala:', message);
    });

    return () => {
      // Limpiar listeners
      socketService.off('room_user_joined');
      socketService.off('room_user_left');
      socketService.off('room_message');
    };
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(loadRooms()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las salas');
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinRoom = async (room) => {
    try {
      // Unirse a la sala via Redux
      await dispatch(joinRoom(room.id)).unwrap();
      
      // Unirse a la sala via Socket.IO
      socketService.joinRoom(room.id);
      
      // Establecer como sala activa
      dispatch(setActiveRoom(room));
      
      // Cargar mensajes de la sala
      dispatch(loadRoomMessages(room.id));
      
      // Navegar al chat de la sala
      navigation.navigate('RoomChat', { 
        roomId: room.id, 
        roomName: room.name,
        roomCountry: room.country 
      });
    } catch (error) {
      Alert.alert(
        'Error', 
        error.message || 'No se pudo unir a la sala'
      );
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await dispatch(leaveRoom(roomId)).unwrap();
      socketService.leaveRoom(roomId);
      
      Alert.alert('Éxito', 'Has salido de la sala');
    } catch (error) {
      Alert.alert('Error', 'No se pudo salir de la sala');
    }
  };

  const getFilteredRooms = () => {
    let filtered = rooms;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por tipo
    switch (filter) {
      case 'joined':
        filtered = filtered.filter(room => room.isJoined);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'all':
      default:
        break;
    }

    return filtered;
  };

  const renderRoomItem = ({ item }) => (
    <RoomCard
      room={item}
      onJoin={() => handleJoinRoom(item)}
      onLeave={() => handleLeaveRoom(item.id)}
      connectedUsers={connectedUsers[item.id] || 0}
    />
  );

  const renderFilterButton = (filterType, label, icon) => (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
        filter === filterType ? 'bg-primary-500' : 'bg-gray-200'
      }`}
      onPress={() => setFilter(filterType)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={filter === filterType ? 'white' : '#6B7280'} 
      />
      <Text className={`ml-2 font-medium ${
        filter === filterType ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6">
        <Ionicons name="people" size={40} color="#6B7280" />
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {searchQuery ? 'No se encontraron salas' : 'No hay salas disponibles'}
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        {searchQuery 
          ? `No hay salas que coincidan con "${searchQuery}"`
          : 'Las salas aparecerán aquí cuando estén disponibles'
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity
          className="bg-primary-500 px-6 py-3 rounded-xl"
          onPress={() => setSearchQuery('')}
        >
          <Text className="text-white font-semibold">Limpiar búsqueda</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const filteredRooms = getFilteredRooms();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">Salas</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="add-circle-outline" size={24} color="#0ea5e9" />
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Buscar salas por país..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filtros */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { type: 'all', label: 'Todas', icon: 'apps' },
            { type: 'joined', label: 'Mis salas', icon: 'checkmark-circle' },
            { type: 'popular', label: 'Populares', icon: 'trending-up' },
          ]}
          renderItem={({ item }) => renderFilterButton(item.type, item.label, item.icon)}
          keyExtractor={(item) => item.type}
        />
      </View>

      {/* Lista de salas */}
      {filteredRooms.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0ea5e9']}
              tintColor="#0ea5e9"
            />
          }
        />
      )}

      {/* Información del usuario conectado */}
      {user?.country && (
        <View className="bg-primary-50 border-t border-primary-200 px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#0ea5e9" />
            <Text className="text-primary-700 font-medium ml-2">
              Conectado desde: {user.country}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}