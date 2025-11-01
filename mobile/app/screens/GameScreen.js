import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { 
  startGame,
  joinGame,
  submitAnswer,
  setGameState,
  resetGame
} from '../redux/gameSlice';
import socketService from '../services/socketService';

const { width } = Dimensions.get('window');

export default function GameScreen({ navigation }) {
  const dispatch = useDispatch();
  const { 
    currentGame,
    gameState,
    currentQuestion,
    timeRemaining,
    score,
    leaderboard,
    isLoading
  } = useSelector((state) => state.game);
  const { user } = useSelector((state) => state.auth);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Configurar listeners de Socket.IO para el juego
    socketService.on('game_started', (gameData) => {
      dispatch(setGameState({ state: 'playing', game: gameData }));
    });

    socketService.on('new_question', (questionData) => {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResults(false);
      
      // Animar la transición
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Iniciar timer de progreso
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: questionData.timeLimit * 1000,
        useNativeDriver: false,
      }).start();
    });

    socketService.on('question_results', (results) => {
      setShowResults(true);
      setIsAnswered(true);
    });

    socketService.on('game_ended', (finalResults) => {
      dispatch(setGameState({ state: 'finished', results: finalResults }));
    });

    socketService.on('player_joined', (playerData) => {
      console.log('Jugador se unió:', playerData);
    });

    return () => {
      socketService.off('game_started');
      socketService.off('new_question');
      socketService.off('question_results');
      socketService.off('game_ended');
      socketService.off('player_joined');
    };
  }, [dispatch, fadeAnim, progressAnim]);

  const handleStartGame = async () => {
    try {
      await dispatch(startGame({
        category: 'general',
        difficulty: 'medium',
        maxPlayers: 10,
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el juego');
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      await dispatch(joinGame(gameId)).unwrap();
      socketService.joinGame(gameId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo unir al juego');
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    // Enviar respuesta
    dispatch(submitAnswer({
      gameId: currentGame.id,
      questionId: currentQuestion.id,
      answer: answerIndex,
      timeToAnswer: 30 - timeRemaining, // Tiempo que tardó en responder
    }));

    // Detener animación de progreso
    progressAnim.stopAnimation();
  };

  const renderWaitingScreen = () => (
    <View className="flex-1 items-center justify-center px-6 bg-gradient-to-b from-primary-500 to-primary-600">
      <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
        <View className="bg-primary-100 w-20 h-20 rounded-full items-center justify-center mb-6">
          <Ionicons name="game-controller" size={32} color="#0ea5e9" />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
          ¡Hora de jugar!
        </Text>
        
        <Text className="text-gray-600 text-center mb-8 leading-6">
          Pon a prueba tus conocimientos en nuestro trivia multijugador. 
          Compite con otros usuarios y alcanza el primer lugar.
        </Text>

        <TouchableOpacity
          className="bg-primary-500 w-full py-4 rounded-xl mb-4"
          onPress={handleStartGame}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-center text-lg">
            {isLoading ? 'Iniciando...' : 'Crear partida'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 w-full py-4 rounded-xl"
          onPress={() => {/* Buscar partidas disponibles */}}
        >
          <Text className="text-gray-700 font-semibold text-center">
            Buscar partida
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGameplay = () => (
    <View className="flex-1 bg-gradient-to-b from-primary-500 to-primary-600">
      {/* Header con progreso */}
      <View className="pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => dispatch(resetGame())}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold">
            Pregunta {currentQuestion?.number || 1} de {currentGame?.totalQuestions || 10}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={20} color="white" />
            <Text className="text-white font-bold ml-1">{score}</Text>
          </View>
        </View>

        {/* Barra de progreso de tiempo */}
        <View className="bg-white/20 h-2 rounded-full overflow-hidden">
          <Animated.View
            className="bg-white h-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
      </View>

      {/* Pregunta */}
      <Animated.View 
        className="flex-1 px-4"
        style={{ opacity: fadeAnim }}
      >
        <View className="bg-white rounded-3xl p-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 text-center leading-7">
            {currentQuestion?.question}
          </Text>
        </View>

        {/* Opciones */}
        <View className="space-y-3 mb-6">
          {currentQuestion?.options?.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = showResults && index === currentQuestion.correctAnswer;
            const isWrong = showResults && isSelected && index !== currentQuestion.correctAnswer;
            
            let buttonStyle = 'bg-white border-2 border-gray-200';
            let textStyle = 'text-gray-900';
            
            if (isCorrect) {
              buttonStyle = 'bg-green-500 border-green-500';
              textStyle = 'text-white';
            } else if (isWrong) {
              buttonStyle = 'bg-red-500 border-red-500';
              textStyle = 'text-white';
            } else if (isSelected) {
              buttonStyle = 'bg-primary-500 border-primary-500';
              textStyle = 'text-white';
            }

            return (
              <TouchableOpacity
                key={index}
                className={`p-4 rounded-xl ${buttonStyle}`}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <Text className={`font-semibold text-center ${textStyle}`}>
                  {option}
                </Text>
                {isCorrect && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color="white" 
                    style={{ position: 'absolute', right: 16, top: 16 }}
                  />
                )}
                {isWrong && (
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color="white" 
                    style={{ position: 'absolute', right: 16, top: 16 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tiempo restante */}
        <View className="items-center">
          <Text className="text-white font-bold text-lg">
            {timeRemaining}s
          </Text>
        </View>
      </Animated.View>

      {/* Leaderboard mini */}
      {leaderboard && leaderboard.length > 0 && (
        <View className="bg-white/10 mx-4 mb-4 rounded-xl p-4">
          <Text className="text-white font-bold text-center mb-2">
            Clasificación
          </Text>
          <View className="space-y-1">
            {leaderboard.slice(0, 3).map((player, index) => (
              <View key={player.id} className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-white font-bold w-6">
                    {index + 1}.
                  </Text>
                  <Text className="text-white">
                    {player.name}
                  </Text>
                </View>
                <Text className="text-white font-bold">
                  {player.score}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderFinishedScreen = () => (
    <View className="flex-1 items-center justify-center px-6 bg-gradient-to-b from-primary-500 to-primary-600">
      <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
        <View className="bg-yellow-100 w-20 h-20 rounded-full items-center justify-center mb-6">
          <Ionicons name="trophy" size={32} color="#f59e0b" />
        </View>
        
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          ¡Juego terminado!
        </Text>
        
        <Text className="text-gray-600 text-center mb-6">
          Puntuación final: {score} puntos
        </Text>

        {/* Leaderboard final */}
        {leaderboard && (
          <View className="w-full mb-6">
            <Text className="font-bold text-gray-900 text-center mb-4">
              Clasificación final
            </Text>
            <View className="space-y-2">
              {leaderboard.map((player, index) => (
                <View 
                  key={player.id} 
                  className={`flex-row items-center justify-between p-3 rounded-xl ${
                    player.id === user.id ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="font-bold w-6 text-gray-900">
                      {index + 1}.
                    </Text>
                    <Text className="text-gray-900">
                      {player.name}
                    </Text>
                  </View>
                  <Text className="font-bold text-gray-900">
                    {player.score}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          className="bg-primary-500 w-full py-4 rounded-xl mb-3"
          onPress={handleStartGame}
        >
          <Text className="text-white font-bold text-center">
            Jugar de nuevo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full py-4"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-600 font-semibold text-center">
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar según el estado del juego
  switch (gameState) {
    case 'playing':
      return renderGameplay();
    case 'finished':
      return renderFinishedScreen();
    case 'waiting':
    default:
      return renderWaitingScreen();
  }
}