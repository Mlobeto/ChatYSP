import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Share,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  toggleTipFavorite,
  markTipAsRead,
  updateVideoProgress,
} from '../redux/tipsSlice';

const { width, height } = Dimensions.get('window');

const TipDetailScreen = ({ route, navigation }) => {
  const { tip } = route.params;
  const dispatch = useDispatch();
  const { favorites, readTips, watchProgress } = useSelector((state) => state.tips);
  
  const videoRef = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [showFullContent, setShowFullContent] = useState(false);

  const isFavorite = favorites.includes(tip.id);
  const isRead = readTips.includes(tip.id);
  const progress = watchProgress[tip.id];

  React.useEffect(() => {
    // Marcar como leído cuando se abre el detalle
    if (!isRead) {
      dispatch(markTipAsRead(tip.id));
    }
  }, [tip.id, isRead, dispatch]);

  const handleToggleFavorite = () => {
    dispatch(toggleTipFavorite(tip.id));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${tip.title}\n\n${tip.content}`,
        title: tip.title,
      });
    } catch (error) {
      console.error('Error sharing tip:', error);
    }
  };

  const handleVideoProgress = (status) => {
    if (status.isLoaded && status.durationMillis) {
      const progressPercent = (status.positionMillis / status.durationMillis) * 100;
      
      // Guardar progreso cada 5 segundos
      if (Math.floor(status.positionMillis / 5000) !== Math.floor((progress?.currentTime || 0) / 5000)) {
        dispatch(updateVideoProgress({
          tipId: tip.id,
          progress: progressPercent,
          currentTime: status.positionMillis,
          duration: status.durationMillis,
        }));
      }
    }
    setVideoStatus(status);
  };

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Video/Image */}
        {tip.video_url ? (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: tip.video_url }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              onPlaybackStatusUpdate={handleVideoProgress}
              shouldPlay={false}
            />
            
            {/* Progress Bar */}
            {progress && progress.progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${progress.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(progress.progress)}% completado
                </Text>
              </View>
            )}
          </View>
        ) : tip.image_url ? (
          <Image source={{ uri: tip.image_url }} style={styles.image} />
        ) : null}

        {/* Content */}
        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badges}>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(tip.category) }
            ]}>
              <Ionicons
                name={getCategoryIcon(tip.category)}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.categoryText}>
                {tip.category}
              </Text>
            </View>

            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(tip.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {getDifficultyText(tip.difficulty)}
              </Text>
            </View>

            {isRead && (
              <View style={styles.readBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.readText}>Leído</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{tip.title}</Text>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>
              {showFullContent ? tip.content : `${tip.content.substring(0, 200)}${tip.content.length > 200 ? '...' : ''}`}
            </Text>
            
            {tip.content.length > 200 && (
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => setShowFullContent(!showFullContent)}
              >
                <Text style={styles.readMoreText}>
                  {showFullContent ? 'Ver menos' : 'Ver más'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tags */}
          {tip.tags && tip.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsTitle}>Etiquetas</Text>
              <View style={styles.tagsContainer}>
                {tip.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metadataText}>
                Creado el {new Date(tip.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>

            {tip.updated_at && tip.updated_at !== tip.created_at && (
              <View style={styles.metadataItem}>
                <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                <Text style={styles.metadataText}>
                  Actualizado el {new Date(tip.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.bottomButton, styles.favoriteBottomButton]}
          onPress={handleToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#FFFFFF' : '#EF4444'}
          />
          <Text style={[
            styles.bottomButtonText,
            isFavorite ? styles.favoriteButtonTextActive : styles.favoriteButtonText
          ]}>
            {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, styles.shareBottomButton]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bottomButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  videoContainer: {
    backgroundColor: '#000000',
  },
  video: {
    width: width,
    height: width * 0.5625, // 16:9 aspect ratio
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  image: {
    width: width,
    height: width * 0.6,
  },
  content: {
    padding: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    marginRight: 8,
    marginBottom: 8,
  },
  readText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 32,
  },
  contentContainer: {
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  favoriteBottomButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  shareBottomButton: {
    backgroundColor: '#3B82F6',
  },
  bottomButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButtonText: {
    color: '#EF4444',
  },
  favoriteButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default TipDetailScreen;