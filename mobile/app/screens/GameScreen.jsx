import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { useSelector } from 'react-redux';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  withDelay,
  withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { selectMiniGameStats, selectCurrentLevel } from '../redux/userStatsSlice';

const { width, height } = Dimensions.get('window');

const GameCard = ({ 
  title, 
  description, 
  icon, 
  gradient, 
  onPress, 
  stats = null,
  isComingSoon = false,
  delay = 0 
}) => {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  
  React.useEffect(() => {
    cardOpacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    cardScale.value = withDelay(delay, withSpring(1, { damping: 15 }));
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={isComingSoon ? null : onPress}
        disabled={isComingSoon}
        className={`rounded-3xl p-6 mb-6 mx-4 shadow-lg ${gradient} ${
          isComingSoon ? 'opacity-60' : ''
        }`}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-4xl mr-3">{icon}</Text>
            <View>
              <Text className="text-white text-xl font-bold">
                {title}
              </Text>
              {isComingSoon && (
                <Text className="text-white/60 text-sm">
                  Próximamente
                </Text>
              )}
            </View>
          </View>
          {!isComingSoon && (
            <Ionicons name="chevron-forward" size={24} color="white" />
          )}
        </View>
        
        <Text className="text-white/80 text-base mb-4">
          {description}
        </Text>
        
        {stats && (
          <View className="bg-white/10 rounded-2xl p-3">
            <View className="flex-row justify-between items-center">
              <View className="items-center">
                <Text className="text-white font-bold text-lg">
                  {stats.gamesPlayed}
                </Text>
                <Text className="text-white/60 text-xs">
                  Jugados
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-lg">
                  {stats.bestScore}
                </Text>
                <Text className="text-white/60 text-xs">
                  Mejor
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-lg">
                  {stats.accuracy}%
                </Text>
                <Text className="text-white/60 text-xs">
                  Precisión
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {isComingSoon && (
          <View className="bg-white/10 rounded-2xl p-3">
            <Text className="text-white/60 text-center">
              Este juego estará disponible pronto
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const GameScreen = ({ navigation }) => {
  const miniGameStats = useSelector(selectMiniGameStats);
  const currentLevel = useSelector(selectCurrentLevel);
  
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  
  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0, { damping: 15 });
  }, []);
  
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const navigateToMiniGame = () => {
    navigation.navigate('MiniGame');
  };

  const navigateToMultiplayerGame = () => {
    // Esta función se implementaría para navegar al juego multijugador existente
    console.log('Navegar a juego multijugador');
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <Animated.View style={animatedHeaderStyle} className="px-6 pt-16 pb-8">
        <Text className="text-4xl font-bold text-white text-center mb-2">
          🎮 Centro de Juegos
        </Text>
        <Text className="text-lg text-indigo-200 text-center">
          Entrena tu mente y diviértete
        </Text>
        
        {/* Stats del usuario */}
        <View className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4">
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
                {miniGameStats.totalPoints}
              </Text>
              <Text className="text-indigo-200 text-sm">Puntos Totales</Text>
            </View>
            
            <View className="w-px h-12 bg-white/20" />
            
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-white">
                {miniGameStats.totalGamesPlayed}
              </Text>
              <Text className="text-indigo-200 text-sm">Juegos</Text>
            </View>
          </View>
          
          {/* Barra de progreso de nivel */}
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white text-sm">
                Progreso al nivel {currentLevel + 1}
              </Text>
              <Text className="text-indigo-200 text-xs">
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
      </Animated.View>

      {/* Lista de juegos */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <GameCard
          title="Quiz Challenge"
          description="Pon a prueba tus conocimientos con preguntas de diferentes categorías. Gana puntos, sube de nivel y desbloquea logros."
          icon="🧠"
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          onPress={navigateToMiniGame}
          stats={{
            gamesPlayed: miniGameStats.totalGamesPlayed,
            bestScore: miniGameStats.bestScore,
            accuracy: Math.round(miniGameStats.accuracy)
          }}
          delay={200}
        />
        
        <GameCard
          title="Trivia Multijugador"
          description="Compite en tiempo real con otros jugadores en trivias por categorías. ¡Demuestra quién sabe más!"
          icon="🏆"
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          onPress={navigateToMultiplayerGame}
          isComingSoon={false}
          delay={400}
        />
        
        <GameCard
          title="Desafío Rápido"
          description="Responde el mayor número de preguntas correctas en 60 segundos. Modo intensivo para entrenar tu velocidad mental."
          icon="⚡"
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
          onPress={() => console.log('Desafío rápido')}
          isComingSoon={true}
          delay={600}
        />
        
        <GameCard
          title="Coaching Quiz"
          description="Especializado en conceptos de coaching, liderazgo y desarrollo personal. Perfecto para coaches profesionales."
          icon="🎯"
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          onPress={() => console.log('Coaching quiz')}
          isComingSoon={true}
          delay={800}
        />
        
        <GameCard
          title="Wellness Challenge"
          description="Preguntas sobre salud, bienestar, nutrición y fitness. Aprende mientras juegas sobre vida saludable."
          icon="💪"
          gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          onPress={() => console.log('Wellness challenge')}
          isComingSoon={true}
          delay={1000}
        />
        
        {/* Espacio adicional al final */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default GameScreen;