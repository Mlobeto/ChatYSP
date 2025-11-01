import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Vibration 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  withSequence,
  withSpring,
  withDelay,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { 
  selectMiniGameStats, 
  selectShowConfetti, 
  selectCurrentLevel,
  selectGameSettings 
} from '../redux/userStatsSlice';

const { width, height } = Dimensions.get('window');

const ConfettiPiece = ({ delay = 0 }) => {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(Math.random() * width);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(delay, withTiming(height + 100, { duration: 3000 }));
    rotation.value = withDelay(delay, withTiming(360 * 4, { duration: 3000 }));
    translateX.value = withDelay(
      delay, 
      withTiming(translateX.value + (Math.random() - 0.5) * 200, { duration: 3000 })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ]
  }));
  
  return (
    <Animated.View 
      style={[
        animatedStyle,
        {
          position: 'absolute',
          width: 8,
          height: 8,
          backgroundColor: color,
          borderRadius: 4,
        }
      ]} 
    />
  );
};

const ConfettiExplosion = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {Array.from({ length: 50 }).map((_, index) => (
        <ConfettiPiece key={index} delay={index * 50} />
      ))}
    </View>
  );
};

const GameResultScreen = ({ 
  score, 
  correctAnswers, 
  totalQuestions, 
  gameTime,
  category,
  difficulty,
  onPlayAgain, 
  onBackToMenu,
  answers = []
}) => {
  const miniGameStats = useSelector(selectMiniGameStats);
  const showConfetti = useSelector(selectShowConfetti);
  const currentLevel = useSelector(selectCurrentLevel);
  const gameSettings = useSelector(selectGameSettings);
  
  const [showDetails, setShowDetails] = useState(false);
  
  // Calcular estadísticas
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const isNewBestScore = score > miniGameStats.bestScore;
  const isPerfectScore = correctAnswers === totalQuestions;
  const averageTimePerQuestion = gameTime / totalQuestions;
  
  // Valores animados
  const cardScale = useSharedValue(0.8);
  const scoreCounterValue = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const achievementOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Animaciones de entrada
    cardScale.value = withSpring(1, { damping: 15 });
    
    // Contar puntuación
    scoreCounterValue.value = withDelay(500, withTiming(score, { duration: 1500 }));
    
    // Progreso de precisión
    progressValue.value = withDelay(1000, withTiming(accuracy, { duration: 1000 }));
    
    // Botones
    buttonOpacity.value = withDelay(2000, withTiming(1, { duration: 500 }));
    
    // Logros
    if (isNewBestScore || isPerfectScore) {
      achievementOpacity.value = withDelay(1500, withTiming(1, { duration: 500 }));
      
      if (gameSettings.hapticEnabled) {
        Vibration.vibrate([100, 50, 100]);
      }
    }
  }, []);
  
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  
  const animatedScoreStyle = useAnimatedStyle(() => ({
    // Animar contador de puntos
  }));
  
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));
  
  const animatedAchievementStyle = useAnimatedStyle(() => ({
    opacity: achievementOpacity.value,
    transform: [{ 
      scale: interpolate(achievementOpacity.value, [0, 1], [0.8, 1]) 
    }],
  }));

  const getScoreEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '🎉';
    if (accuracy >= 50) return '👍';
    return '💪';
  };
  
  const getScoreMessage = () => {
    if (isPerfectScore) return '¡Perfecto! 🌟';
    if (accuracy >= 90) return '¡Excelente trabajo!';
    if (accuracy >= 70) return '¡Muy bien!';
    if (accuracy >= 50) return '¡Buen intento!';
    return '¡Sigue practicando!';
  };
  
  const getRankText = () => {
    if (accuracy >= 90) return 'Maestro';
    if (accuracy >= 70) return 'Experto';
    if (accuracy >= 50) return 'Intermedio';
    return 'Principiante';
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Confeti */}
      <ConfettiExplosion visible={showConfetti} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <Text className="text-4xl font-bold text-white text-center mb-2">
            {getScoreEmoji()} ¡Juego Terminado!
          </Text>
          <Text className="text-xl text-indigo-200 text-center">
            {getScoreMessage()}
          </Text>
        </View>

        {/* Tarjeta principal de resultados */}
        <Animated.View style={animatedCardStyle} className="mx-6 mb-6">
          <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            {/* Puntuación principal */}
            <View className="items-center mb-6">
              <Text className="text-6xl font-bold text-white mb-2">
                {score}
              </Text>
              <Text className="text-indigo-200 text-lg">
                puntos obtenidos
              </Text>
              
              {isNewBestScore && (
                <Animated.View style={animatedAchievementStyle}>
                  <View className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-4 py-2 mt-3">
                    <Text className="text-white font-bold">
                      🏆 ¡Nuevo récord!
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Estadísticas */}
            <View className="space-y-4">
              {/* Precisión */}
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white font-semibold">Precisión</Text>
                  <Text className="text-white font-bold">
                    {correctAnswers}/{totalQuestions} ({accuracy.toFixed(1)}%)
                  </Text>
                </View>
                <View className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <Animated.View 
                    style={animatedProgressStyle}
                    className={`h-full rounded-full ${
                      accuracy >= 80 ? 'bg-green-500' :
                      accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </View>
              </View>

              {/* Rango */}
              <View className="flex-row justify-between items-center">
                <Text className="text-indigo-200">Rango obtenido</Text>
                <Text className="text-white font-bold text-lg">
                  {getRankText()}
                </Text>
              </View>

              {/* Tiempo */}
              <View className="flex-row justify-between items-center">
                <Text className="text-indigo-200">Tiempo promedio</Text>
                <Text className="text-white font-bold">
                  {averageTimePerQuestion.toFixed(1)}s por pregunta
                </Text>
              </View>

              {/* Categoría y dificultad */}
              <View className="flex-row justify-between items-center">
                <Text className="text-indigo-200">Categoría</Text>
                <Text className="text-white font-bold capitalize">
                  {category} • {difficulty}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Logros */}
        {(isNewBestScore || isPerfectScore) && (
          <Animated.View style={animatedAchievementStyle} className="mx-6 mb-6">
            <View className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-4">
              <Text className="text-yellow-300 font-bold text-lg mb-2">
                🏆 Logros desbloqueados
              </Text>
              <View className="space-y-2">
                {isNewBestScore && (
                  <Text className="text-white">
                    • ¡Nuevo récord personal!
                  </Text>
                )}
                {isPerfectScore && (
                  <Text className="text-white">
                    • Puntuación perfecta
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Progreso del nivel */}
        <View className="mx-6 mb-6">
          <View className="bg-white/10 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-semibold">
                Nivel {currentLevel}
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
        </View>

        {/* Detalles del juego */}
        <View className="mx-6 mb-6">
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            className="bg-white/10 rounded-2xl p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">
                Ver detalles de respuestas
              </Text>
              <Ionicons 
                name={showDetails ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="white" 
              />
            </View>
          </TouchableOpacity>
          
          {showDetails && (
            <View className="mt-4 space-y-3">
              {answers.map((answer, index) => (
                <View 
                  key={index}
                  className={`p-3 rounded-xl ${
                    answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-medium flex-1">
                      Pregunta {index + 1}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={answer.isCorrect ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={answer.isCorrect ? "#10b981" : "#ef4444"} 
                      />
                      <Text className="text-white ml-2">
                        {answer.points} pts
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white/70 text-sm mt-1">
                    Tiempo: {answer.timeToAnswer}s
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <Animated.View style={animatedButtonStyle} className="px-6 pb-8">
        <View className="space-y-3">
          <TouchableOpacity
            onPress={onPlayAgain}
            className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl py-4 px-8"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="refresh" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Jugar de nuevo
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onBackToMenu}
            className="bg-white/10 border border-white/20 rounded-2xl py-4 px-8"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="home" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Volver al menú
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default GameResultScreen;