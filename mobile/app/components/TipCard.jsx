import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TipCard({ tip, isRead, isFavorite, onPress, onToggleFavorite }) {
  const isVideo = tip.type === 'video';
  const readingTime = tip.readingTime || Math.ceil(tip.content.length / 200); // Estimación de tiempo de lectura
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'fácil':
        return 'bg-green-100 text-green-700';
      case 'medium':
      case 'medio':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
      case 'difícil':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Medio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty || 'General';
    }
  };

  return (
    <TouchableOpacity
      className={`bg-white rounded-xl p-4 mb-3 shadow-sm border ${
        isRead ? 'border-gray-100' : 'border-primary-200'
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-2">
            {/* Tipo de contenido */}
            <View className={`px-2 py-1 rounded-full mr-2 ${
              isVideo ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <View className="flex-row items-center">
                <Ionicons 
                  name={isVideo ? 'play-circle' : 'bulb'} 
                  size={12} 
                  color={isVideo ? '#dc2626' : '#2563eb'} 
                />
                <Text className={`text-xs font-medium ml-1 ${
                  isVideo ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {isVideo ? 'Video' : 'Tip'}
                </Text>
              </View>
            </View>

            {/* Indicador de no leído */}
            {!isRead && (
              <View className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </View>

          <Text className="font-bold text-gray-900 text-lg leading-6 mb-1">
            {tip.title}
          </Text>
          
          <Text className="text-gray-600 text-sm leading-5" numberOfLines={3}>
            {tip.content}
          </Text>
        </View>

        {/* Thumbnail para videos o imagen */}
        {(isVideo && tip.thumbnail) || tip.image ? (
          <View className="relative">
            <Image
              source={{ uri: tip.thumbnail || tip.image }}
              className="w-20 h-20 rounded-lg"
              resizeMode="cover"
            />
            {isVideo && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black/50 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="play" size={16} color="white" />
                </View>
              </View>
            )}
          </View>
        ) : (
          <View className={`w-20 h-20 rounded-lg items-center justify-center ${
            isVideo ? 'bg-red-100' : 'bg-primary-100'
          }`}>
            <Ionicons 
              name={isVideo ? 'play-circle' : 'bulb'} 
              size={32} 
              color={isVideo ? '#dc2626' : '#0ea5e9'} 
            />
          </View>
        )}
      </View>

      {/* Metadata */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center space-x-3">
          {/* Tiempo de lectura/duración */}
          <View className="flex-row items-center">
            <Ionicons 
              name={isVideo ? 'time' : 'reader'} 
              size={14} 
              color="#6B7280" 
            />
            <Text className="text-gray-600 text-xs ml-1">
              {isVideo 
                ? `${tip.duration || '5:00'} min` 
                : `${readingTime} min lectura`
              }
            </Text>
          </View>

          {/* Dificultad */}
          {tip.difficulty && (
            <View className={`px-2 py-1 rounded-full ${getDifficultyColor(tip.difficulty)}`}>
              <Text className="text-xs font-medium">
                {getDifficultyLabel(tip.difficulty)}
              </Text>
            </View>
          )}

          {/* Fecha */}
          <Text className="text-gray-500 text-xs">
            {formatDate(tip.createdAt)}
          </Text>
        </View>

        {/* Botón de favorito */}
        <TouchableOpacity
          onPress={onToggleFavorite}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#ef4444' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {tip.tags && tip.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {tip.tags.slice(0, 4).map((tag, index) => (
            <View key={index} className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
              <Text className="text-gray-600 text-xs">
                #{tag}
              </Text>
            </View>
          ))}
          {tip.tags.length > 4 && (
            <View className="bg-gray-100 px-2 py-1 rounded-full">
              <Text className="text-gray-600 text-xs">
                +{tip.tags.length - 4}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <View className="bg-primary-500 w-6 h-6 rounded-full items-center justify-center mr-2">
            <Ionicons name="person" size={12} color="white" />
          </View>
          <Text className="text-gray-600 text-sm">
            Coach YSP
          </Text>
        </View>

        <View className="flex-row items-center space-x-3">
          {/* Rating/valoración */}
          {tip.rating && (
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-gray-600 text-sm ml-1">
                {tip.rating.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Indicador de progreso */}
          {isRead && (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text className="text-green-600 text-sm ml-1">
                Completado
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Barra de progreso para videos */}
      {isVideo && tip.progress && tip.progress > 0 && (
        <View className="mt-3">
          <View className="bg-gray-200 h-1 rounded-full overflow-hidden">
            <View 
              className="bg-primary-500 h-full rounded-full"
              style={{ width: `${tip.progress}%` }}
            />
          </View>
          <Text className="text-gray-500 text-xs mt-1">
            {tip.progress}% completado
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}