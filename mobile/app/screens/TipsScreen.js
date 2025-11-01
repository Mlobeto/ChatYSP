import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { 
  loadTips,
  loadTipsByCategory,
  markTipAsRead,
  toggleTipFavorite,
  setSelectedCategory
} from '../redux/tipsSlice';
import TipCard from '../components/TipCard';

const { width, height } = Dimensions.get('window');

export default function TipsScreen() {
  const dispatch = useDispatch();
  const { 
    tips, 
    categories, 
    selectedCategory, 
    favorites,
    readTips,
    isLoading 
  } = useSelector((state) => state.tips);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'unread'
  const [selectedTip, setSelectedTip] = useState(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);

  useEffect(() => {
    // Cargar tips al montar el componente
    dispatch(loadTips());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(loadTips()).unwrap();
    } catch (error) {
      console.error('Error recargando tips:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
    if (category === 'all') {
      dispatch(loadTips());
    } else {
      dispatch(loadTipsByCategory(category));
    }
  };

  const handleTipPress = (tip) => {
    setSelectedTip(tip);
    
    // Marcar como leído si no está leído
    if (!readTips.includes(tip.id)) {
      dispatch(markTipAsRead(tip.id));
    }

    // Si es video, abrir modal
    if (tip.type === 'video') {
      setIsVideoModalVisible(true);
    }
  };

  const handleToggleFavorite = (tipId) => {
    dispatch(toggleTipFavorite(tipId));
  };

  const getFilteredTips = () => {
    let filtered = tips;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(tip => 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtrar por tipo
    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(tip => favorites.includes(tip.id));
        break;
      case 'unread':
        filtered = filtered.filter(tip => !readTips.includes(tip.id));
        break;
      case 'videos':
        filtered = filtered.filter(tip => tip.type === 'video');
        break;
      case 'all':
      default:
        break;
    }

    return filtered;
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      className={`px-4 py-2 rounded-full mr-3 ${
        selectedCategory === category.id ? 'bg-primary-500' : 'bg-gray-200'
      }`}
      onPress={() => handleCategorySelect(category.id)}
    >
      <Text className={`font-medium ${
        selectedCategory === category.id ? 'text-white' : 'text-gray-700'
      }`}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType, label, icon) => (
    <TouchableOpacity
      className={`flex-row items-center px-3 py-2 rounded-full mr-2 ${
        filter === filterType ? 'bg-primary-500' : 'bg-gray-200'
      }`}
      onPress={() => setFilter(filterType)}
    >
      <Ionicons 
        name={icon} 
        size={14} 
        color={filter === filterType ? 'white' : '#6B7280'} 
      />
      <Text className={`ml-1 text-sm font-medium ${
        filter === filterType ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTipItem = ({ item }) => (
    <TipCard
      tip={item}
      isRead={readTips.includes(item.id)}
      isFavorite={favorites.includes(item.id)}
      onPress={() => handleTipPress(item)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6">
        <Ionicons name="bulb" size={40} color="#6B7280" />
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {searchQuery ? 'No se encontraron tips' : 'No hay tips disponibles'}
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        {searchQuery 
          ? `No hay tips que coincidan con "${searchQuery}"`
          : 'Los tips y videos aparecerán aquí cuando estén disponibles'
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

  const renderVideoModal = () => (
    <Modal
      visible={isVideoModalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsVideoModalVisible(false)}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 px-4 bg-black/50">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
              onPress={() => setIsVideoModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
              onPress={() => handleToggleFavorite(selectedTip?.id)}
            >
              <Ionicons 
                name={favorites.includes(selectedTip?.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={favorites.includes(selectedTip?.id) ? "#ef4444" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video */}
        {selectedTip?.videoUrl && (
          <Video
            source={{ uri: selectedTip.videoUrl }}
            style={{
              width: width,
              height: height * 0.6,
              alignSelf: 'center',
              marginTop: height * 0.2,
            }}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
        )}

        {/* Información del video */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-6">
          <Text className="text-white font-bold text-lg mb-2">
            {selectedTip?.title}
          </Text>
          <Text className="text-gray-300 text-sm leading-5">
            {selectedTip?.content}
          </Text>
          
          {selectedTip?.tags && (
            <View className="flex-row flex-wrap mt-4">
              {selectedTip.tags.map((tag, index) => (
                <View key={index} className="bg-primary-500 px-2 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-white text-xs font-medium">{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const filteredTips = getFilteredTips();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Tips y Videos
        </Text>

        {/* Buscador */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Buscar tips, videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categorías */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'Todos' }, ...categories]}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item.id}
          className="mb-4"
        />

        {/* Filtros */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { type: 'all', label: 'Todos', icon: 'apps' },
            { type: 'favorites', label: 'Favoritos', icon: 'heart' },
            { type: 'unread', label: 'No leídos', icon: 'radio-button-off' },
            { type: 'videos', label: 'Videos', icon: 'play-circle' },
          ]}
          renderItem={({ item }) => renderFilterButton(item.type, item.label, item.icon)}
          keyExtractor={(item) => item.type}
        />
      </View>

      {/* Lista de tips */}
      {filteredTips.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTips}
          renderItem={renderTipItem}
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

      {/* Modal de video */}
      {renderVideoModal()}

      {/* Estadísticas */}
      <View className="bg-primary-50 border-t border-primary-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#0ea5e9" />
            <Text className="text-primary-700 font-medium ml-2">
              {readTips.length} tips leídos
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="heart" size={16} color="#ef4444" />
            <Text className="text-primary-700 font-medium ml-2">
              {favorites.length} favoritos
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}