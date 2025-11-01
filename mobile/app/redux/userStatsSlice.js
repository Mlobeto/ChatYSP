import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Estados iniciales
const initialState = {
  // Estadísticas del minijuego
  miniGameStats: {
    totalGamesPlayed: 0,
    bestScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    averageScore: 0,
    accuracy: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
    level: 1,
    experiencePoints: 0,
    nextLevelXP: 100,
  },
  
  // Estadísticas por categoría
  categoryStats: {},
  
  // Logros desbloqueados
  achievements: [],
  
  // Configuración del juego
  gameSettings: {
    soundEnabled: true,
    hapticEnabled: true,
    animationsEnabled: true,
    difficulty: 'medium',
    timePerQuestion: 15,
  },
  
  // Estado de carga
  isLoading: false,
  error: null,
  
  // Flag para mostrar confeti
  showConfetti: false,
  
  // Histórico reciente para análisis
  recentGames: [],
};

// Async thunks para persistencia
export const loadUserStats = createAsyncThunk(
  'userStats/loadUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await AsyncStorage.getItem('userStats');
      return stats ? JSON.parse(stats) : initialState;
    } catch (error) {
      return rejectWithValue('Error cargando estadísticas del usuario');
    }
  }
);

export const saveUserStats = createAsyncThunk(
  'userStats/saveUserStats',
  async (stats, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem('userStats', JSON.stringify(stats));
      return stats;
    } catch (error) {
      return rejectWithValue('Error guardando estadísticas del usuario');
    }
  }
);

// Función auxiliar para calcular nivel
const calculateLevel = (xp) => {
  // Cada nivel requiere 100 XP más que el anterior
  // Nivel 1: 0-99 XP, Nivel 2: 100-299 XP, Nivel 3: 300-599 XP, etc.
  let level = 1;
  let totalXPNeeded = 100;
  let currentXP = xp;
  
  while (currentXP >= totalXPNeeded) {
    currentXP -= totalXPNeeded;
    level++;
    totalXPNeeded += 100; // Incrementa la dificultad
  }
  
  return {
    level,
    currentXP,
    nextLevelXP: totalXPNeeded,
  };
};

// Logros disponibles
const ACHIEVEMENTS = [
  { id: 'first_game', name: 'Primer Juego', description: 'Completa tu primer minijuego', icon: '🎮' },
  { id: 'perfect_score', name: 'Perfecto', description: 'Obtén 100% de aciertos en un juego', icon: '🏆' },
  { id: 'speed_demon', name: 'Rayo', description: 'Responde 5 preguntas en menos de 30 segundos', icon: '⚡' },
  { id: 'streak_5', name: 'Racha x5', description: 'Consigue 5 respuestas correctas seguidas', icon: '🔥' },
  { id: 'streak_10', name: 'Racha x10', description: 'Consigue 10 respuestas correctas seguidas', icon: '🔥🔥' },
  { id: 'level_5', name: 'Novato Avanzado', description: 'Alcanza el nivel 5', icon: '⭐' },
  { id: 'level_10', name: 'Experto', description: 'Alcanza el nivel 10', icon: '🌟' },
  { id: 'games_10', name: 'Persistente', description: 'Completa 10 minijuegos', icon: '💪' },
  { id: 'games_50', name: 'Dedicado', description: 'Completa 50 minijuegos', icon: '🎯' },
  { id: 'high_score_500', name: 'Puntuación Alta', description: 'Obtén más de 500 puntos en un juego', icon: '🚀' },
];

const userStatsSlice = createSlice({
  name: 'userStats',
  initialState,
  reducers: {
    // Actualizar estadísticas después de un juego
    updateGameStats: (state, action) => {
      const { 
        score, 
        correctAnswers, 
        totalQuestions, 
        category, 
        timeTaken,
        difficulty 
      } = action.payload;
      
      const stats = state.miniGameStats;
      
      // Estadísticas generales
      stats.totalGamesPlayed += 1;
      stats.totalPoints += score;
      stats.totalCorrectAnswers += correctAnswers;
      stats.totalQuestions += totalQuestions;
      
      // Calcular precisión
      if (stats.totalQuestions > 0) {
        stats.accuracy = (stats.totalCorrectAnswers / stats.totalQuestions) * 100;
      }
      
      // Promedio de puntuación
      stats.averageScore = stats.totalPoints / stats.totalGamesPlayed;
      
      // Verificar nuevo mejor puntaje
      const isNewBestScore = score > stats.bestScore;
      if (isNewBestScore) {
        stats.bestScore = score;
        state.showConfetti = true;
      }
      
      // Actualizar racha
      if (correctAnswers === totalQuestions) {
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        stats.currentStreak = 0;
      }
      
      // Calcular XP ganado
      let xpGained = correctAnswers * 10; // 10 XP por respuesta correcta
      if (correctAnswers === totalQuestions) {
        xpGained += 50; // Bonus por juego perfecto
      }
      
      // Bonus por dificultad
      const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
      xpGained = Math.floor(xpGained * (difficultyMultiplier[difficulty] || 1));
      
      stats.experiencePoints += xpGained;
      
      // Calcular nuevo nivel
      const levelInfo = calculateLevel(stats.experiencePoints);
      const oldLevel = stats.level;
      stats.level = levelInfo.level;
      stats.nextLevelXP = levelInfo.nextLevelXP;
      
      // Verificar si subió de nivel
      if (stats.level > oldLevel) {
        // Aquí podrías disparar una notificación de nivel subido
        console.log(`¡Nivel subido! Ahora eres nivel ${stats.level}`);
      }
      
      // Estadísticas por categoría
      if (!state.categoryStats[category]) {
        state.categoryStats[category] = {
          gamesPlayed: 0,
          totalScore: 0,
          bestScore: 0,
          accuracy: 0,
          correctAnswers: 0,
          totalQuestions: 0,
        };
      }
      
      const catStats = state.categoryStats[category];
      catStats.gamesPlayed += 1;
      catStats.totalScore += score;
      catStats.correctAnswers += correctAnswers;
      catStats.totalQuestions += totalQuestions;
      
      if (score > catStats.bestScore) {
        catStats.bestScore = score;
      }
      
      if (catStats.totalQuestions > 0) {
        catStats.accuracy = (catStats.correctAnswers / catStats.totalQuestions) * 100;
      }
      
      // Agregar al histórico reciente
      const gameRecord = {
        id: Date.now(),
        score,
        correctAnswers,
        totalQuestions,
        category,
        difficulty,
        timeTaken,
        xpGained,
        playedAt: new Date().toISOString(),
      };
      
      state.recentGames.unshift(gameRecord);
      
      // Mantener solo los últimos 20 juegos
      if (state.recentGames.length > 20) {
        state.recentGames = state.recentGames.slice(0, 20);
      }
      
      // Verificar logros
      userStatsSlice.caseReducers.checkAchievements(state);
    },
    
    // Verificar y desbloquear logros
    checkAchievements: (state) => {
      const stats = state.miniGameStats;
      const unlockedAchievements = new Set(state.achievements.map(a => a.id));
      
      ACHIEVEMENTS.forEach(achievement => {
        if (unlockedAchievements.has(achievement.id)) return;
        
        let shouldUnlock = false;
        
        switch (achievement.id) {
          case 'first_game':
            shouldUnlock = stats.totalGamesPlayed >= 1;
            break;
          case 'perfect_score':
            shouldUnlock = state.recentGames.some(game => 
              game.correctAnswers === game.totalQuestions && game.totalQuestions > 0
            );
            break;
          case 'speed_demon':
            shouldUnlock = state.recentGames.some(game => 
              game.correctAnswers >= 5 && game.timeTaken <= 30
            );
            break;
          case 'streak_5':
            shouldUnlock = stats.longestStreak >= 5;
            break;
          case 'streak_10':
            shouldUnlock = stats.longestStreak >= 10;
            break;
          case 'level_5':
            shouldUnlock = stats.level >= 5;
            break;
          case 'level_10':
            shouldUnlock = stats.level >= 10;
            break;
          case 'games_10':
            shouldUnlock = stats.totalGamesPlayed >= 10;
            break;
          case 'games_50':
            shouldUnlock = stats.totalGamesPlayed >= 50;
            break;
          case 'high_score_500':
            shouldUnlock = stats.bestScore >= 500;
            break;
        }
        
        if (shouldUnlock) {
          state.achievements.push({
            ...achievement,
            unlockedAt: new Date().toISOString(),
          });
        }
      });
    },
    
    // Actualizar configuración del juego
    updateGameSettings: (state, action) => {
      state.gameSettings = { ...state.gameSettings, ...action.payload };
    },
    
    // Reset del confeti después de mostrarlo
    hideConfetti: (state) => {
      state.showConfetti = false;
    },
    
    // Reset completo de estadísticas (para testing o reset manual)
    resetAllStats: (state) => {
      return { ...initialState };
    },
    
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Load user stats
      .addCase(loadUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge con el estado actual para mantener compatibilidad
        const loadedStats = action.payload;
        if (loadedStats && loadedStats.miniGameStats) {
          Object.assign(state, loadedStats);
        }
      })
      .addCase(loadUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Save user stats
      .addCase(saveUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveUserStats.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(saveUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateGameStats,
  checkAchievements,
  updateGameSettings,
  hideConfetti,
  resetAllStats,
  clearError,
} = userStatsSlice.actions;

export default userStatsSlice.reducer;

// Selectores útiles
export const selectMiniGameStats = (state) => state.userStats.miniGameStats;
export const selectBestScore = (state) => state.userStats.miniGameStats.bestScore;
export const selectCurrentLevel = (state) => state.userStats.miniGameStats.level;
export const selectShowConfetti = (state) => state.userStats.showConfetti;
export const selectAchievements = (state) => state.userStats.achievements;
export const selectGameSettings = (state) => state.userStats.gameSettings;
export const selectRecentGames = (state) => state.userStats.recentGames;
export const selectCategoryStats = (state) => state.userStats.categoryStats;