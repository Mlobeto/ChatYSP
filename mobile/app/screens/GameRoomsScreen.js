import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import socketService from '../services/socketService';

export default function GameRoomsScreen({ navigation }) {
  const { user } = useSelector((state) => state.auth);
  
  const [gameRooms, setGameRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'waiting'

  useEffect(() => {
    loadGameRooms();
    
    // Socket listeners para actualizaciones en tiempo real
    socketService.on('gameroom_created', (room) => {
      setGameRooms(prev => [room, ...prev]);
    });

    socketService.on('gameroom_updated', (room) => {
      setGameRooms(prev => 
        prev.map(r => r.id === room.id ? room : r)
      );
    });

    socketService.on('gameroom_deleted', ({ roomId }) => {
      setGameRooms(prev => prev.filter(r => r.id !== roomId));
    });

    return () => {
      socketService.off('gameroom_created');
      socketService.off('gameroom_updated');
      socketService.off('gameroom_deleted');
    };
  }, []);

  const loadGameRooms = async () => {
    try {
      // Aquí llamarías a tu API para cargar las salas de juego
      // Por ahora simulamos datos
      const mockRooms = [
        {
          id: '1',
          name: 'Quiz Challenge - Argentina',
          description: 'Sala de preguntas y respuestas',
          gameType: 'quiz',
          country: 'AR',
          maxPlayers: 10,
          currentPlayers: 5,
          status: 'waiting', // 'waiting', 'active', 'finished'
          host: {
            id: 'user1',
            name: 'Juan Pérez'
          },
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Trivia Mundial',
          description: 'Trivia de cultura general',
          gameType: 'trivia',
          country: 'All',
          maxPlayers: 20,
          currentPlayers: 12,
          status: 'active',
          host: {
            id: 'user2',
            name: 'María García'
          },
          createdAt: new Date(),
        },
      ];
      
      setGameRooms(mockRooms);
    } catch (error) {
      console.error('Error loading game rooms:', error);
      Alert.alert('Error', 'No se pudieron cargar las salas de juego');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGameRooms();
    setRefreshing(false);
  };

  const handleJoinRoom = (room) => {
    if (room.currentPlayers >= room.maxPlayers) {
      Alert.alert('Sala llena', 'Esta sala ya alcanzó el máximo de jugadores');
      return;
    }

    if (room.status === 'finished') {
      Alert.alert('Juego terminado', 'Este juego ya finalizó');
      return;
    }

    // Navegar a la sala de juego
    navigation.navigate('GameMenu', { roomId: room.id, room });
  };

  const handleCreateRoom = () => {
    navigation.navigate('CreateGameRoom');
  };

  const filterRooms = () => {
    let filtered = gameRooms;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filter === 'active') {
      filtered = filtered.filter(room => room.status === 'active');
    } else if (filter === 'waiting') {
      filtered = filtered.filter(room => room.status === 'waiting');
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return '#f59e0b';
      case 'active':
        return '#10b981';
      case 'finished':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return 'Esperando';
      case 'active':
        return 'En juego';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const getGameTypeIcon = (gameType) => {
    switch (gameType) {
      case 'quiz':
        return 'help-circle';
      case 'trivia':
        return 'bulb';
      case 'puzzle':
        return 'extension-puzzle';
      default:
        return 'game-controller';
    }
  };

  const renderGameRoom = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleJoinRoom(item)}
      className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#f59e0b20' }}
            >
              <Ionicons
                name={getGameTypeIcon(item.gameType)}
                size={20}
                color="#f59e0b"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Por {item.host.name}
              </Text>
            </View>
          </View>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text className="text-sm text-gray-600 mb-3">
          {item.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {item.currentPlayers}/{item.maxPlayers} jugadores
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="flag" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {item.country === 'All' ? 'Global' : item.country}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="game-controller-outline" size={48} color="#9ca3af" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        No hay salas de juego
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        {searchQuery ? 
          'No se encontraron salas con ese criterio' : 
          'Sé el primero en crear una sala de juego'}
      </Text>
      <TouchableOpacity
        onPress={handleCreateRoom}
        className="bg-primary-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">
          Crear Sala
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Salas de Juego
          </Text>
          <TouchableOpacity
            onPress={handleCreateRoom}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="add-circle" size={28} color="#f59e0b" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Buscar salas..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View className="flex-row mt-3 space-x-2">
          {['all', 'waiting', 'active'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              onPress={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg ${
                filter === filterOption
                  ? 'bg-primary-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === filterOption
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
              >
                {filterOption === 'all' ? 'Todas' : 
                 filterOption === 'waiting' ? 'Esperando' : 'Activas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Game Rooms List */}
      <FlatList
        data={filterRooms()}
        renderItem={renderGameRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#f59e0b"
          />
        }
      />
    </SafeAreaView>
  );
}
