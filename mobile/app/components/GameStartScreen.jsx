import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert,
  Dimensions 
} from 'react-native';
import { useSelector } from 'react-redux';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { selectMiniGameStats, selectCurrentLevel } from '../redux/userStatsSlice';

const { width, height } = Dimensions.get('window');

const GameStartScreen = ({ onStartGame, categories = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  
  const miniGameStats = useSelector(selectMiniGameStats);
  const currentLevel = useSelector(selectCurrentLevel);
  
  // Animaciones
  const buttonScale = useSharedValue(1);
  const titleScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  
  React.useEffect(() => {
    // Animación de entrada
    cardOpacity.value = withTiming(1, { duration: 800 });
    titleScale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 400 })
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const handleStartPress = () => {
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    
    setTimeout(() => {
      onStartGame({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        questionCount: 10
      });
    }, 200);
  };

  const difficulties = [
    { id: 'easy', name: 'Fácil', color: '#10b981', icon: '😊' },
    { id: 'medium', name: 'Medio', color: '#f59e0b', icon: '🤔' },
    { id: 'hard', name: 'Difícil', color: '#ef4444', icon: '🔥' }
  ];

  const defaultCategories = [
    { 
      id: 'general', 
      name: 'General', 
      icon: '🧠', 
      color: '#6366f1',
      description: 'Conocimiento general'
    },
    { 
      id: 'coaching', 
      name: 'Coaching', 
      icon: '🎯', 
      color: '#8b5cf6',
      description: 'Técnicas y conceptos'
    },
    { 
      id: 'wellness', 
      name: 'Bienestar', 
      icon: '💪', 
      color: '#10b981',
      description: 'Salud y wellness'
    }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header con estadísticas */}
      <Animated.View 
        style={animatedCardStyle}
        className="px-6 pt-16 pb-8"
      >
        <Animated.View style={animatedTitleStyle}>
          <Text className="text-4xl font-bold text-white text-center mb-2">
            🎮 Quiz Challenge
          </Text>
          <Text className="text-lg text-indigo-200 text-center">
            ¡Pon a prueba tus conocimientos!
          </Text>
        </Animated.View>
        
        {/* Stats Card */}
        <View className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 mx-2">
          <View className="flex-row justify-between items-center">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-white">
                {currentLevel}
              </Text>
              <Text className="text-indigo-200 text-sm">Nivel</Text>
            </View>
            
            <View className="w-px h-12 bg-white/20" />
            
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-white">
                {miniGameStats.bestScore}
              </Text>
              <Text className="text-indigo-200 text-sm">Mejor Puntaje</Text>
            </View>
            
            <View className="w-px h-12 bg-white/20" />
            
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-white">
                {miniGameStats.totalGamesPlayed}
              </Text>
              <Text className="text-indigo-200 text-sm">Juegos</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Configuración del juego */}
      <Animated.View style={animatedCardStyle} className="flex-1 px-6">
        {/* Categorías */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-white mb-4">
            Categoría
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {displayCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`w-[30%] aspect-square rounded-2xl p-4 mb-4 items-center justify-center ${
                  selectedCategory === category.id
                    ? 'bg-white/20 border-2 border-white'
                    : 'bg-white/10'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id 
                    ? `${category.color}40` 
                    : 'rgba(255,255,255,0.1)'
                }}
              >
                <Text className="text-3xl mb-2">{category.icon}</Text>
                <Text className="text-white font-medium text-center text-sm">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dificultad */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-white mb-4">
            Dificultad
          </Text>
          <View className="flex-row justify-between">
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                onPress={() => setSelectedDifficulty(difficulty.id)}
                className={`flex-1 mx-1 rounded-xl p-4 items-center ${
                  selectedDifficulty === difficulty.id
                    ? 'bg-white/20 border-2 border-white'
                    : 'bg-white/10'
                }`}
              >
                <Text className="text-2xl mb-1">{difficulty.icon}</Text>
                <Text className="text-white font-medium">
                  {difficulty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Botón de inicio */}
      <Animated.View style={[animatedCardStyle, animatedButtonStyle]} className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleStartPress}
          className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl py-4 px-8 shadow-lg"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white text-xl font-bold ml-2">
              ¡Comenzar Juego!
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Indicador de XP hasta próximo nivel */}
      <Animated.View style={animatedCardStyle} className="px-6 pb-4">
        <View className="bg-white/10 rounded-xl p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white font-medium">
              Progreso al nivel {currentLevel + 1}
            </Text>
            <Text className="text-indigo-200 text-sm">
              {miniGameStats.experiencePoints} / {miniGameStats.nextLevelXP} XP
            </Text>
          </View>
          
          <View className="h-2 bg-white/20 rounded-full overflow-hidden">
            <View 
              className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
              style={{
                width: `${Math.min(100, (miniGameStats.experiencePoints / miniGameStats.nextLevelXP) * 100)}%`
              }}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default GameStartScreen;