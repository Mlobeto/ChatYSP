import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Vibration 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle,
  withSequence,
  withSpring,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectGameSettings } from '../redux/userStatsSlice';

const { width, height } = Dimensions.get('window');

const GameQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer, 
  timeLimit = 15,
  currentScore = 0 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const gameSettings = useSelector(selectGameSettings);
  
  // Valores animados
  const progressWidth = useSharedValue(100);
  const questionScale = useSharedValue(0.8);
  const optionScales = useSharedValue([1, 1, 1, 1]);
  const timerColor = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Animación de entrada
    cardOpacity.value = withTiming(1, { duration: 500 });
    questionScale.value = withSpring(1, { damping: 15 });
    
    // Iniciar timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Actualizar progreso del timer
        progressWidth.value = withTiming((newTime / timeLimit) * 100, { duration: 1000 });
        
        // Cambiar color cuando queda poco tiempo
        if (newTime <= 5) {
          timerColor.value = withTiming(1, { duration: 300 });
          if (gameSettings.hapticEnabled) {
            Vibration.vibrate(100);
          }
        }
        
        // Tiempo agotado
        if (newTime <= 0) {
          clearInterval(timer);
          if (!isAnswered) {
            handleTimeUp();
          }
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [question.id]);

  const handleTimeUp = () => {
    setIsAnswered(true);
    onAnswer({
      selectedAnswer: null,
      timeToAnswer: timeLimit,
      isCorrect: false
    });
  };

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    // Animación de selección
    const newScales = [1, 1, 1, 1];
    newScales[answerIndex] = 1.05;
    optionScales.value = withSpring(newScales);
    
    // Haptic feedback
    if (gameSettings.hapticEnabled) {
      Vibration.vibrate(50);
    }
    
    // Delay para mostrar la selección antes de continuar
    setTimeout(() => {
      onAnswer({
        selectedAnswer: answerIndex,
        timeToAnswer: timeLimit - timeLeft,
        isCorrect: answerIndex === question.correctAnswer
      });
    }, 500);
  };

  // Estilos animados
  const animatedQuestionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: questionScale.value }],
    opacity: cardOpacity.value,
  }));

  const animatedTimerStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    backgroundColor: interpolateColor(
      timerColor.value,
      [0, 1],
      ['#10b981', '#ef4444']
    ),
  }));

  const animatedTimerContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      timerColor.value,
      [0, 1],
      ['rgba(16, 185, 129, 0.2)', 'rgba(239, 68, 68, 0.2)']
    ),
  }));

  const getOptionStyle = (index) => {
    if (!isAnswered) {
      return "bg-white/10 border-2 border-white/20";
    }
    
    if (index === question.correctAnswer) {
      return "bg-green-500/30 border-2 border-green-400";
    }
    
    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      return "bg-red-500/30 border-2 border-red-400";
    }
    
    return "bg-white/5 border-2 border-white/10";
  };

  const getOptionTextStyle = (index) => {
    if (!isAnswered) {
      return "text-white";
    }
    
    if (index === question.correctAnswer) {
      return "text-green-100";
    }
    
    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      return "text-red-100";
    }
    
    return "text-white/60";
  };

  const getOptionIcon = (index) => {
    if (!isAnswered) return null;
    
    if (index === question.correctAnswer) {
      return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
    }
    
    if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      return <Ionicons name="close-circle" size={24} color="#ef4444" />;
    }
    
    return null;
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-lg font-medium">
            Pregunta {questionNumber} de {totalQuestions}
          </Text>
          <Text className="text-indigo-200 text-lg font-bold">
            {currentScore} pts
          </Text>
        </View>
        
        {/* Progress bar */}
        <View className="h-2 bg-white/20 rounded-full mb-4">
          <View 
            className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </View>
        
        {/* Timer */}
        <Animated.View 
          style={animatedTimerContainerStyle}
          className="rounded-xl p-3 mb-4"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white font-semibold">
              ⏱️ Tiempo restante
            </Text>
            <Text className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-300' : 'text-white'}`}>
              {timeLeft}s
            </Text>
          </View>
          
          <View className="h-2 bg-white/20 rounded-full overflow-hidden">
            <Animated.View 
              style={animatedTimerStyle}
              className="h-full rounded-full"
            />
          </View>
        </Animated.View>
      </View>

      {/* Question */}
      <Animated.View style={animatedQuestionStyle} className="flex-1 px-6">
        <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <Text className="text-white text-xl font-semibold text-center leading-7">
            {question.question}
          </Text>
        </View>

        {/* Options */}
        <View className="space-y-4">
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`rounded-xl p-4 ${getOptionStyle(index)}`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                    <Text className="text-white font-bold">
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text className={`text-lg font-medium flex-1 ${getOptionTextStyle(index)}`}>
                    {option}
                  </Text>
                </View>
                {getOptionIcon(index)}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulty indicator */}
        <View className="mt-8 items-center">
          <View className="flex-row items-center bg-white/10 rounded-full px-4 py-2">
            <Text className="text-white/60 text-sm mr-2">Dificultad:</Text>
            <Text className={`text-sm font-semibold ${
              question.difficulty === 'easy' ? 'text-green-300' :
              question.difficulty === 'medium' ? 'text-yellow-300' :
              'text-red-300'
            }`}>
              {question.difficulty === 'easy' ? '🟢 Fácil' :
               question.difficulty === 'medium' ? '🟡 Medio' :
               '🔴 Difícil'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default GameQuestion;