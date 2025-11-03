import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TipCard = ({ tip, isRead, isFavorite, onPress, onToggleFavorite }) => {
  const getCategoryColor = (category) => {
    const colors = {
      chat: '#3B82F6',
      game: '#10B981',
      general: '#8B5CF6',
      ai: '#F59E0B',
    };
    return colors[category] || '#6B7280';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      chat: 'chatbubbles-outline',
      game: 'game-controller-outline',
      general: 'flash-outline',
      ai: 'hardware-chip-outline',
    };
    return icons[category] || 'flash-outline';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444',
    };
    return colors[difficulty] || '#6B7280';
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    };
    return texts[difficulty] || difficulty;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRead && styles.readContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      {tip.image_url && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: tip.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
          {tip.video_url && (
            <View style={styles.playIconContainer}>
              <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badges}>
            {/* Category Badge */}
            <View style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(tip.category) }
            ]}>
              <Ionicons
                name={getCategoryIcon(tip.category)}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.categoryText}>
                {tip.category}
              </Text>
            </View>

            {/* Difficulty Badge */}
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(tip.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {getDifficultyText(tip.difficulty)}
              </Text>
            </View>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[
          styles.title,
          isRead && styles.readTitle,
        ]}>
          {tip.title}
        </Text>

        {/* Content Preview */}
        <Text style={styles.preview} numberOfLines={2}>
          {tip.content}
        </Text>

        {/* Tags */}
        {tip.tags && tip.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tip.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {tip.tags.length > 3 && (
              <Text style={styles.moreTagsText}>
                +{tip.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.indicators}>
            {/* Read Indicator */}
            {isRead && (
              <View style={styles.readIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.readText}>Leído</Text>
              </View>
            )}

            {/* Video Indicator */}
            {tip.video_url && (
              <View style={styles.videoIndicator}>
                <Ionicons name="play-circle-outline" size={16} color="#6B7280" />
                <Text style={styles.videoText}>Video</Text>
              </View>
            )}
          </View>

          {/* Date */}
          <Text style={styles.date}>
            {new Date(tip.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
            })}
          </Text>
        </View>
      </View>

      {/* New Badge */}
      {!isRead && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>Nuevo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  readContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  readTitle: {
    color: '#6B7280',
  },
  preview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#9CA3AF',
    alignSelf: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  readText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  videoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TipCard;