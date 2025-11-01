import React, { useState, useEffect } from 'react';
import { View, Alert, BackHandler, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import { 
  updateGameStats, 
  hideConfetti,
  loadUserStats,
  saveUserStats,
  selectGameSettings 
} from '../redux/userStatsSlice';
import miniGameAPI from '../services/miniGameAPI';
import GameStartScreen from '../components/GameStartScreen';
import GameQuestion from '../components/GameQuestion';
import GameResultScreen from '../components/GameResultScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const MiniGameScreen = ({ navigation }) => {
  // Estados del juego
  const [gameState, setGameState] = useState('start'); // 'start', 'loading', 'playing', 'results'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameEndTime, setGameEndTime] = useState(null);
  const [gameConfig, setGameConfig] = useState({});
  const [categories, setCategories] = useState([]);
  
  // Redux
  const dispatch = useDispatch();
  const gameSettings = useSelector(selectGameSettings);
  
  // Sonidos (opcional)
  const [sounds, setSounds] = useState({
    correct: null,
    incorrect: null,
    start: null,
    finish: null
  });

  useEffect(() => {
    // Cargar estadísticas del usuario al montar
    dispatch(loadUserStats());
    
    // Cargar categorías disponibles
    loadCategories();
    
    // Cargar sonidos si están habilitados
    if (gameSettings.soundEnabled) {
      loadSounds();
    }

    // Manejar botón de retroceso en Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
      unloadSounds();
    };
  }, []);

  useEffect(() => {
    // Ocultar confeti después de mostrarlo
    if (gameState === 'results') {
      setTimeout(() => {
        dispatch(hideConfetti());
      }, 3000);
    }
  }, [gameState]);

  const loadCategories = async () => {
    try {
      const categoriesList = await miniGameAPI.getCategories();
      setCategories(categoriesList);
    } catch (error) {
      console.warn('Error cargando categorías:', error);
    }
  };

  const loadSounds = async () => {
    try {
      const correctSound = new Audio.Sound();
      const incorrectSound = new Audio.Sound();
      const startSound = new Audio.Sound();
      const finishSound = new Audio.Sound();

      // Aquí cargarías archivos de sonido reales
      // await correctSound.loadAsync(require('../assets/sounds/correct.mp3'));
      // await incorrectSound.loadAsync(require('../assets/sounds/incorrect.mp3'));
      // await startSound.loadAsync(require('../assets/sounds/start.mp3'));
      // await finishSound.loadAsync(require('../assets/sounds/finish.mp3'));

      setSounds({
        correct: correctSound,
        incorrect: incorrectSound,
        start: startSound,
        finish: finishSound
      });
    } catch (error) {
      console.warn('Error cargando sonidos:', error);
    }
  };

  const unloadSounds = async () => {
    try {
      Object.values(sounds).forEach(async (sound) => {
        if (sound) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Error descargando sonidos:', error);
    }
  };

  const playSound = async (soundType) => {
    if (!gameSettings.soundEnabled || !sounds[soundType]) return;
    
    try {
      await sounds[soundType].replayAsync();
    } catch (error) {
      console.warn(`Error reproduciendo sonido ${soundType}:`, error);
    }
  };

  const handleBackPress = () => {
    if (gameState === 'playing') {
      Alert.alert(
        'Salir del juego',
        '¿Estás seguro de que quieres salir? Perderás tu progreso actual.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => setGameState('start') }
        ]
      );
      return true;
    }
    return false;
  };

  const startGame = async (config) => {
    setGameState('loading');
    setGameConfig(config);
    
    try {
      // Cargar preguntas
      const questionsList = await miniGameAPI.getQuestions({
        category: config.category,
        difficulty: config.difficulty,
        count: config.questionCount || 10
      });
      
      if (questionsList.length === 0) {
        Alert.alert(
          'Error',
          'No se pudieron cargar las preguntas. Intenta de nuevo.',
          [{ text: 'OK', onPress: () => setGameState('start') }]
        );
        return;
      }
      
      // Inicializar estado del juego
      setQuestions(questionsList);
      setCurrentQuestionIndex(0);
      setScore(0);
      setAnswers([]);
      setGameStartTime(new Date());
      
      // Reproducir sonido de inicio
      await playSound('start');
      
      // Cambiar a estado de juego
      setGameState('playing');
      
    } catch (error) {
      console.error('Error iniciando juego:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al iniciar el juego. Intenta de nuevo.',
        [{ text: 'OK', onPress: () => setGameState('start') }]
      );
    }
  };

  const handleAnswer = async (answerData) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Validar respuesta
    const result = miniGameAPI.validateAnswer(
      currentQuestion,
      answerData.selectedAnswer,
      answerData.timeToAnswer
    );
    
    // Actualizar puntuación
    const newScore = score + result.points;
    setScore(newScore);
    
    // Guardar respuesta
    const answerRecord = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer: answerData.selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: result.isCorrect,
      points: result.points,
      timeToAnswer: answerData.timeToAnswer,
      explanation: result.explanation,
      timeBonus: result.timeBonus
    };
    
    setAnswers(prev => [...prev, answerRecord]);
    
    // Reproducir sonido
    await playSound(result.isCorrect ? 'correct' : 'incorrect');
    
    // Verificar si es la última pregunta
    if (currentQuestionIndex >= questions.length - 1) {
      finishGame(newScore);
    } else {
      // Siguiente pregunta
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1000);
    }
  };

  const finishGame = async (finalScore) => {
    setGameEndTime(new Date());
    
    // Calcular estadísticas del juego
    const correctAnswers = answers.filter(a => a.isCorrect).length + 1; // +1 para la última respuesta
    const totalQuestions = questions.length;
    const gameTime = gameEndTime ? (gameEndTime - gameStartTime) / 1000 : 0;
    
    // Actualizar estadísticas en Redux
    const gameStats = {
      score: finalScore,
      correctAnswers,
      totalQuestions,
      category: gameConfig.category,
      difficulty: gameConfig.difficulty,
      timeTaken: gameTime
    };
    
    dispatch(updateGameStats(gameStats));
    
    // Guardar estadísticas
    const currentStats = {
      miniGameStats: {
        totalGamesPlayed: 1,
        bestScore: finalScore,
        totalPoints: finalScore,
        totalCorrectAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        // ... otras estadísticas se calculan en el reducer
      }
    };
    
    dispatch(saveUserStats(currentStats));
    
    // Reproducir sonido de finalización
    await playSound('finish');
    
    // Cambiar a pantalla de resultados
    setGameState('results');
  };

  const playAgain = () => {
    // Reiniciar con la misma configuración
    startGame(gameConfig);
  };

  const backToMenu = () => {
    setGameState('start');
    setQuestions([]);
    setAnswers([]);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const goToMainMenu = () => {
    navigation.goBack();
  };

  // Renderizado condicional según el estado del juego
  const renderCurrentScreen = () => {
    switch (gameState) {
      case 'start':
        return (
          <GameStartScreen
            onStartGame={startGame}
            categories={categories}
          />
        );
      
      case 'loading':
        return (
          <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 items-center justify-center">
            <LoadingSpinner />
            <Text className="text-white text-xl mt-4">
              Cargando preguntas...
            </Text>
          </View>
        );
      
      case 'playing':
        return (
          <GameQuestion
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            timeLimit={gameSettings.timePerQuestion}
            currentScore={score}
          />
        );
      
      case 'results':
        const gameTime = gameEndTime && gameStartTime 
          ? (gameEndTime - gameStartTime) / 1000 
          : 0;
        
        return (
          <GameResultScreen
            score={score}
            correctAnswers={answers.filter(a => a.isCorrect).length}
            totalQuestions={questions.length}
            gameTime={gameTime}
            category={gameConfig.category}
            difficulty={gameConfig.difficulty}
            answers={answers}
            onPlayAgain={playAgain}
            onBackToMenu={goToMainMenu}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      {renderCurrentScreen()}
    </View>
  );
};

export default MiniGameScreen;