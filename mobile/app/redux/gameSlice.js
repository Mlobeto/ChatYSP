import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import socketService from '../services/socketService';

// Estados iniciales
const initialState = {
  currentGame: null,
  gameState: 'waiting', // 'waiting', 'playing', 'finished'
  currentQuestion: null,
  timeRemaining: 0,
  score: 0,
  totalScore: 0,
  leaderboard: [],
  availableGames: [],
  gameHistory: [],
  players: [],
  userAnswers: [],
  isLoading: false,
  error: null,
  categories: [
    { id: 'general', name: 'Conocimiento General' },
    { id: 'sports', name: 'Deportes' },
    { id: 'history', name: 'Historia' },
    { id: 'science', name: 'Ciencia' },
    { id: 'entertainment', name: 'Entretenimiento' },
    { id: 'geography', name: 'Geografía' },
    { id: 'art', name: 'Arte y Literatura' },
    { id: 'technology', name: 'Tecnología' },
  ],
  difficulties: [
    { id: 'easy', name: 'Fácil' },
    { id: 'medium', name: 'Medio' },
    { id: 'hard', name: 'Difícil' },
  ]
};

// Async thunks
export const startGame = createAsyncThunk(
  'game/startGame',
  async (gameConfig, { rejectWithValue }) => {
    try {
      const response = await api.post('/games/create', {
        category: gameConfig.category || 'general',
        difficulty: gameConfig.difficulty || 'medium',
        maxPlayers: gameConfig.maxPlayers || 10,
        questionsCount: gameConfig.questionsCount || 10,
        timePerQuestion: gameConfig.timePerQuestion || 30,
      });
      
      // Unirse al juego a través de Socket.IO
      socketService.createGame(response.data.id);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error iniciando el juego');
    }
  }
);

export const joinGame = createAsyncThunk(
  'game/joinGame',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error uniéndose al juego');
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'game/submitAnswer',
  async ({ gameId, questionId, answer, timeToAnswer }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/games/${gameId}/answer`, {
        questionId,
        answer,
        timeToAnswer
      });
      
      // Enviar respuesta a través de Socket.IO para tiempo real
      socketService.submitAnswer(gameId, {
        questionId,
        answer,
        timeToAnswer
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error enviando respuesta');
    }
  }
);

export const loadAvailableGames = createAsyncThunk(
  'game/loadAvailableGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/games/available');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando juegos');
    }
  }
);

export const loadGameHistory = createAsyncThunk(
  'game/loadGameHistory',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/games/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando historial');
    }
  }
);

export const loadLeaderboard = createAsyncThunk(
  'game/loadLeaderboard',
  async ({ category = 'all', period = 'month' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/games/leaderboard', {
        params: { category, period }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando ranking');
    }
  }
);

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action) => {
      const { state: newState, game, results } = action.payload;
      state.gameState = newState;
      
      if (game) {
        state.currentGame = game;
      }
      
      if (results) {
        state.leaderboard = results.leaderboard || [];
        state.score = results.playerScore || state.score;
      }
    },
    
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
      state.timeRemaining = action.payload.timeLimit || 30;
    },
    
    updateTimer: (state, action) => {
      state.timeRemaining = Math.max(0, action.payload);
    },
    
    addScore: (state, action) => {
      const points = action.payload;
      state.score += points;
      state.totalScore += points;
    },
    
    setScore: (state, action) => {
      state.score = action.payload;
    },
    
    updateLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    
    addPlayer: (state, action) => {
      const player = action.payload;
      const existingPlayer = state.players.find(p => p.id === player.id);
      
      if (!existingPlayer) {
        state.players.push(player);
      }
    },
    
    removePlayer: (state, action) => {
      const playerId = action.payload;
      state.players = state.players.filter(p => p.id !== playerId);
    },
    
    updatePlayerScore: (state, action) => {
      const { playerId, score: newScore } = action.payload;
      const player = state.players.find(p => p.id === playerId);
      
      if (player) {
        player.score = newScore;
      }
      
      // Actualizar en leaderboard también
      const leaderboardEntry = state.leaderboard.find(entry => entry.id === playerId);
      if (leaderboardEntry) {
        leaderboardEntry.score = newScore;
      }
      
      // Reordenar leaderboard
      state.leaderboard.sort((a, b) => b.score - a.score);
    },
    
    addUserAnswer: (state, action) => {
      const { questionId, answer, isCorrect, points, timeToAnswer } = action.payload;
      
      state.userAnswers.push({
        questionId,
        answer,
        isCorrect,
        points: points || 0,
        timeToAnswer,
        timestamp: new Date().toISOString()
      });
    },
    
    setGameResults: (state, action) => {
      const { finalScore, position, totalPlayers, correctAnswers, gameStats } = action.payload;
      
      state.score = finalScore;
      state.gameState = 'finished';
      
      // Agregar al historial
      if (state.currentGame) {
        const gameResult = {
          id: state.currentGame.id,
          category: state.currentGame.category,
          difficulty: state.currentGame.difficulty,
          finalScore,
          position,
          totalPlayers,
          correctAnswers,
          totalQuestions: state.currentGame.totalQuestions,
          playedAt: new Date().toISOString(),
          ...gameStats
        };
        
        state.gameHistory.unshift(gameResult);
        
        // Mantener solo los últimos 50 juegos
        if (state.gameHistory.length > 50) {
          state.gameHistory = state.gameHistory.slice(0, 50);
        }
      }
    },
    
    resetGame: (state) => {
      state.currentGame = null;
      state.gameState = 'waiting';
      state.currentQuestion = null;
      state.timeRemaining = 0;
      state.score = 0;
      state.leaderboard = [];
      state.players = [];
      state.userAnswers = [];
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetGameState: (state) => {
      Object.assign(state, {
        ...initialState,
        totalScore: state.totalScore,
        gameHistory: state.gameHistory,
      });
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Start game
      .addCase(startGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGame = action.payload;
        state.gameState = 'waiting';
        state.score = 0;
        state.userAnswers = [];
      })
      .addCase(startGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Join game
      .addCase(joinGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGame = action.payload;
        state.gameState = 'waiting';
        state.score = 0;
        state.userAnswers = [];
      })
      .addCase(joinGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Submit answer
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const { isCorrect, points, correctAnswer } = action.payload;
        
        if (isCorrect) {
          state.score += points || 0;
          state.totalScore += points || 0;
        }
        
        // Agregar respuesta del usuario
        if (state.currentQuestion) {
          state.userAnswers.push({
            questionId: state.currentQuestion.id,
            answer: action.meta.arg.answer,
            isCorrect,
            points: points || 0,
            correctAnswer,
            timeToAnswer: action.meta.arg.timeToAnswer,
            timestamp: new Date().toISOString()
          });
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Load available games
      .addCase(loadAvailableGames.fulfilled, (state, action) => {
        state.availableGames = action.payload;
      })
      .addCase(loadAvailableGames.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Load game history
      .addCase(loadGameHistory.fulfilled, (state, action) => {
        const { games, page } = action.payload;
        
        if (page === 1) {
          state.gameHistory = games;
        } else {
          state.gameHistory = [...state.gameHistory, ...games];
        }
      })
      .addCase(loadGameHistory.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Load leaderboard
      .addCase(loadLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      })
      .addCase(loadLeaderboard.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setGameState,
  setCurrentQuestion,
  updateTimer,
  addScore,
  setScore,
  updateLeaderboard,
  addPlayer,
  removePlayer,
  updatePlayerScore,
  addUserAnswer,
  setGameResults,
  resetGame,
  clearError,
  resetGameState
} = gameSlice.actions;

export default gameSlice.reducer;