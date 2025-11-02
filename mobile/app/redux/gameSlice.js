import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import socketService from '../services/socketService';

// Estados iniciales
const initialState = {
  // GameRooms terapéuticas
  gameRooms: [],
  currentGameRoom: null,
  joinedGameRooms: [],
  invitations: [],
  
  // Estado del juego en progreso
  currentGame: null,
  gameState: 'waiting', // 'waiting', 'playing', 'finished'
  currentQuestion: null,
  timeRemaining: 0,
  score: 0,
  totalScore: 0,
  leaderboard: [],
  players: [],
  userAnswers: [],
  
  // Disponibilidad y configuración
  availableGames: [],
  gameHistory: [],
  
  // Categorías terapéuticas actualizadas
  categories: [
    { id: 'bienestar', name: 'Bienestar Emocional', description: 'Técnicas para el manejo de ansiedad y mindfulness', icon: '🧘‍♀️' },
    { id: 'coaching', name: 'Coaching Personal', description: 'Crecimiento personal y desarrollo', icon: '🌱' },
    { id: 'general', name: 'Conocimiento General', description: 'Cultura general y entretenimiento', icon: '🧠' },
    { id: 'sports', name: 'Deportes', description: 'Deportes y actividad física', icon: '⚽' },
    { id: 'science', name: 'Ciencia', description: 'Ciencias y tecnología', icon: '🔬' },
    { id: 'history', name: 'Historia', description: 'Historia y cultura', icon: '📚' },
  ],
  difficulties: [
    { id: 'easy', name: 'Fácil', points: 10 },
    { id: 'medium', name: 'Medio', points: 15 },
    { id: 'hard', name: 'Difícil', points: 20 },
  ],
  
  // Estados de carga y error
  isLoading: false,
  error: null,
  
  // Filtros y búsqueda
  filters: {
    category: 'all',
    difficulty: 'all',
    status: 'all',
  },
};

// Async thunks para GameRooms

// Obtener lista de GameRooms disponibles
export const fetchGameRooms = createAsyncThunk(
  'game/fetchGameRooms',
  async ({ page = 1, limit = 10, ...filters } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamerooms', {
        params: { page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando salas de juego');
    }
  }
);

// Crear nueva GameRoom
export const createGameRoom = createAsyncThunk(
  'game/createGameRoom',
  async (gameRoomData, { rejectWithValue }) => {
    try {
      const response = await api.post('/gamerooms', gameRoomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creando sala de juego');
    }
  }
);

// Unirse a una GameRoom
export const joinGameRoom = createAsyncThunk(
  'game/joinGameRoom',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/gamerooms/${gameRoomId}/join`);
      
      // Conectar a la sala via socket
      socketService.joinGameRoom(gameRoomId);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error uniéndose a la sala');
    }
  }
);

// Salir de una GameRoom
export const leaveGameRoom = createAsyncThunk(
  'game/leaveGameRoom',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/gamerooms/${gameRoomId}/leave`);
      
      // Desconectar de la sala via socket
      socketService.leaveGameRoom(gameRoomId);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error saliendo de la sala');
    }
  }
);

// Obtener detalles de una GameRoom específica
export const fetchGameRoomDetails = createAsyncThunk(
  'game/fetchGameRoomDetails',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/gamerooms/${gameRoomId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error obteniendo detalles de la sala');
    }
  }
);

// Iniciar juego en GameRoom
export const startGameRoomGame = createAsyncThunk(
  'game/startGameRoomGame',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/gamerooms/${gameRoomId}/start`);
      
      // Notificar via socket que el juego ha iniciado
      socketService.startGame(gameRoomId);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error iniciando el juego');
    }
  }
);

// Obtener invitaciones a GameRooms
export const fetchGameRoomInvitations = createAsyncThunk(
  'game/fetchGameRoomInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamerooms/invitations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error obteniendo invitaciones');
    }
  }
);

// Aceptar invitación a GameRoom
export const acceptGameRoomInvitation = createAsyncThunk(
  'game/acceptGameRoomInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/gamerooms/invitations/${invitationId}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error aceptando invitación');
    }
  }
);

// Declinar invitación a GameRoom
export const declineGameRoomInvitation = createAsyncThunk(
  'game/declineGameRoomInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/gamerooms/invitations/${invitationId}/decline`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error declinando invitación');
    }
  }
);

// Async thunks existentes (mantener compatibilidad)
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
    },
    
    // Nuevos reducers para GameRooms
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearCurrentGameRoom: (state) => {
      state.currentGameRoom = null;
    },
    
    updateGameRoomStatus: (state, action) => {
      const { gameRoomId, status } = action.payload;
      
      // Actualizar en la lista de GameRooms
      const gameRoom = state.gameRooms.find(room => room.id === gameRoomId);
      if (gameRoom) {
        gameRoom.status = status;
      }
      
      // Actualizar GameRoom actual si coincide
      if (state.currentGameRoom && state.currentGameRoom.id === gameRoomId) {
        state.currentGameRoom.status = status;
      }
    },
    
    updateGameRoomPlayers: (state, action) => {
      const { gameRoomId, players, currentPlayers } = action.payload;
      
      // Actualizar en la lista de GameRooms
      const gameRoom = state.gameRooms.find(room => room.id === gameRoomId);
      if (gameRoom) {
        gameRoom.currentPlayers = currentPlayers || players?.length || gameRoom.currentPlayers;
      }
      
      // Actualizar GameRoom actual si coincide
      if (state.currentGameRoom && state.currentGameRoom.id === gameRoomId) {
        state.currentGameRoom.currentPlayers = currentPlayers || players?.length || state.currentGameRoom.currentPlayers;
        if (players) {
          state.players = players;
        }
      }
    },
    
    addGameRoomInvitation: (state, action) => {
      const invitation = action.payload;
      const existingInvitation = state.invitations.find(inv => inv.id === invitation.id);
      
      if (!existingInvitation) {
        state.invitations.unshift(invitation);
      }
    },
    
    removeGameRoomInvitation: (state, action) => {
      const invitationId = action.payload;
      state.invitations = state.invitations.filter(inv => inv.id !== invitationId);
    },
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
      })
      
      // Nuevos casos para GameRooms
      // Fetch GameRooms
      .addCase(fetchGameRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGameRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gameRooms = action.payload.gameRooms || action.payload;
      })
      .addCase(fetchGameRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create GameRoom
      .addCase(createGameRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGameRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const newGameRoom = action.payload.gameRoom || action.payload;
        state.gameRooms.unshift(newGameRoom);
        state.currentGameRoom = newGameRoom;
      })
      .addCase(createGameRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Join GameRoom
      .addCase(joinGameRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinGameRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const gameRoom = action.payload.gameRoom || action.payload;
        state.currentGameRoom = gameRoom;
        
        // Agregar a salas unidas si no está ya
        const isAlreadyJoined = state.joinedGameRooms.find(room => room.id === gameRoom.id);
        if (!isAlreadyJoined) {
          state.joinedGameRooms.push(gameRoom);
        }
        
        // Actualizar en la lista general
        const index = state.gameRooms.findIndex(room => room.id === gameRoom.id);
        if (index !== -1) {
          state.gameRooms[index] = gameRoom;
        }
      })
      .addCase(joinGameRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Leave GameRoom
      .addCase(leaveGameRoom.fulfilled, (state, action) => {
        const gameRoom = action.payload.gameRoom || action.payload;
        
        // Remover de salas unidas
        state.joinedGameRooms = state.joinedGameRooms.filter(room => room.id !== gameRoom.id);
        
        // Limpiar GameRoom actual si es la misma
        if (state.currentGameRoom && state.currentGameRoom.id === gameRoom.id) {
          state.currentGameRoom = null;
        }
        
        // Actualizar en la lista general
        const index = state.gameRooms.findIndex(room => room.id === gameRoom.id);
        if (index !== -1) {
          state.gameRooms[index] = gameRoom;
        }
      })
      .addCase(leaveGameRoom.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch GameRoom Details
      .addCase(fetchGameRoomDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGameRoomDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const gameRoom = action.payload.gameRoom || action.payload;
        state.currentGameRoom = gameRoom;
        
        // Actualizar en la lista si existe
        const index = state.gameRooms.findIndex(room => room.id === gameRoom.id);
        if (index !== -1) {
          state.gameRooms[index] = gameRoom;
        }
      })
      .addCase(fetchGameRoomDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Start GameRoom Game
      .addCase(startGameRoomGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startGameRoomGame.fulfilled, (state, action) => {
        state.isLoading = false;
        const gameRoom = action.payload.gameRoom || action.payload;
        
        state.currentGameRoom = gameRoom;
        state.gameState = 'playing';
        state.score = 0;
        state.userAnswers = [];
        
        // Actualizar en la lista
        const index = state.gameRooms.findIndex(room => room.id === gameRoom.id);
        if (index !== -1) {
          state.gameRooms[index] = gameRoom;
        }
      })
      .addCase(startGameRoomGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch GameRoom Invitations
      .addCase(fetchGameRoomInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload.invitations || action.payload;
      })
      .addCase(fetchGameRoomInvitations.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Accept GameRoom Invitation
      .addCase(acceptGameRoomInvitation.fulfilled, (state, action) => {
        const { invitation, gameRoom } = action.payload;
        
        // Remover invitación aceptada
        if (invitation) {
          state.invitations = state.invitations.filter(inv => inv.id !== invitation.id);
        }
        
        // Agregar GameRoom a salas unidas
        if (gameRoom) {
          const isAlreadyJoined = state.joinedGameRooms.find(room => room.id === gameRoom.id);
          if (!isAlreadyJoined) {
            state.joinedGameRooms.push(gameRoom);
          }
        }
      })
      .addCase(acceptGameRoomInvitation.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Decline GameRoom Invitation
      .addCase(declineGameRoomInvitation.fulfilled, (state, action) => {
        const invitationId = action.meta.arg;
        state.invitations = state.invitations.filter(inv => inv.id !== invitationId);
      })
      .addCase(declineGameRoomInvitation.rejected, (state, action) => {
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
  resetGameState,
  // Nuevas acciones para GameRooms
  setFilters,
  clearCurrentGameRoom,
  updateGameRoomStatus,
  updateGameRoomPlayers,
  addGameRoomInvitation,
  removeGameRoomInvitation,
} = gameSlice.actions;

export default gameSlice.reducer;

// Selectores
export const selectGameRooms = (state) => state.game.gameRooms;
export const selectCurrentGameRoom = (state) => state.game.currentGameRoom;
export const selectJoinedGameRooms = (state) => state.game.joinedGameRooms;
export const selectGameRoomInvitations = (state) => state.game.invitations;
export const selectGameFilters = (state) => state.game.filters;

export const selectCurrentGame = (state) => state.game.currentGame;
export const selectGameState = (state) => state.game.gameState;
export const selectCurrentQuestion = (state) => state.game.currentQuestion;
export const selectTimeRemaining = (state) => state.game.timeRemaining;
export const selectScore = (state) => state.game.score;
export const selectTotalScore = (state) => state.game.totalScore;
export const selectLeaderboard = (state) => state.game.leaderboard;
export const selectPlayers = (state) => state.game.players;
export const selectUserAnswers = (state) => state.game.userAnswers;
export const selectAvailableGames = (state) => state.game.availableGames;
export const selectGameHistory = (state) => state.game.gameHistory;
export const selectGameLoading = (state) => state.game.isLoading;
export const selectGameError = (state) => state.game.error;
export const selectGameCategories = (state) => state.game.categories;
export const selectGameDifficulties = (state) => state.game.difficulties;

// Selectores computados
export const selectTherapeuticCategories = (state) => 
  state.game.categories.filter(cat => ['bienestar', 'coaching'].includes(cat.id));

export const selectActiveGameRooms = (state) => 
  state.game.gameRooms.filter(room => room.status === 'waiting' || room.status === 'playing');

export const selectGameRoomsByCategory = (state, category) => 
  state.game.gameRooms.filter(room => 
    category === 'all' || room.category === category
  );

export const selectPendingInvitations = (state) => 
  state.game.invitations.filter(inv => inv.status === 'pending');