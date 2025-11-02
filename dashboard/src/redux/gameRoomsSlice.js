import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../services/dashboardApi';

// Estado inicial
const initialState = {
  gameRooms: [],
  currentGameRoom: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRooms: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    category: 'all',
    difficulty: 'all',
    status: 'all',
    gameType: 'all',
  },
};

// Thunks asíncronos para GameRooms

// Obtener lista de GameRooms
export const fetchGameRooms = createAsyncThunk(
  'gameRooms/fetchGameRooms',
  async ({ page = 1, limit = 10, ...filters } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.get('/gamerooms', {
        params: { page, limit, ...filters }
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener salas de juego';
      return rejectWithValue(message);
    }
  }
);

// Crear nueva GameRoom
export const createGameRoom = createAsyncThunk(
  'gameRooms/createGameRoom',
  async (gameRoomData, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.post('/gamerooms', gameRoomData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al crear sala de juego';
      return rejectWithValue(message);
    }
  }
);

// Obtener GameRoom específica
export const fetchGameRoomById = createAsyncThunk(
  'gameRooms/fetchGameRoomById',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.get(`/gamerooms/${gameRoomId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al obtener sala de juego';
      return rejectWithValue(message);
    }
  }
);

// Actualizar GameRoom
export const updateGameRoom = createAsyncThunk(
  'gameRooms/updateGameRoom',
  async ({ gameRoomId, updateData }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.put(`/gamerooms/${gameRoomId}`, updateData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar sala de juego';
      return rejectWithValue(message);
    }
  }
);

// Eliminar GameRoom
export const deleteGameRoom = createAsyncThunk(
  'gameRooms/deleteGameRoom',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      await dashboardApi.delete(`/gamerooms/${gameRoomId}`);
      return gameRoomId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar sala de juego';
      return rejectWithValue(message);
    }
  }
);

// Unirse a GameRoom
export const joinGameRoom = createAsyncThunk(
  'gameRooms/joinGameRoom',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.post(`/gamerooms/${gameRoomId}/join`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al unirse a la sala';
      return rejectWithValue(message);
    }
  }
);

// Salir de GameRoom
export const leaveGameRoom = createAsyncThunk(
  'gameRooms/leaveGameRoom',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.post(`/gamerooms/${gameRoomId}/leave`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al salir de la sala';
      return rejectWithValue(message);
    }
  }
);

// Iniciar juego
export const startGame = createAsyncThunk(
  'gameRooms/startGame',
  async (gameRoomId, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.post(`/gamerooms/${gameRoomId}/start`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al iniciar el juego';
      return rejectWithValue(message);
    }
  }
);

// Slice
const gameRoomsSlice = createSlice({
  name: 'gameRooms',
  initialState,
  reducers: {
    // Acciones síncronas
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGameRoom: (state) => {
      state.currentGameRoom = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: 'all',
        difficulty: 'all',
        status: 'all',
        gameType: 'all',
      };
    },
    // Para actualizaciones en tiempo real (WebSocket)
    updateGameRoomStatus: (state, action) => {
      const { gameRoomId, status } = action.payload;
      const gameRoom = state.gameRooms.find(room => room.id === gameRoomId);
      if (gameRoom) {
        gameRoom.status = status;
      }
      if (state.currentGameRoom && state.currentGameRoom.id === gameRoomId) {
        state.currentGameRoom.status = status;
      }
    },
    updatePlayerCount: (state, action) => {
      const { gameRoomId, currentPlayers } = action.payload;
      const gameRoom = state.gameRooms.find(room => room.id === gameRoomId);
      if (gameRoom) {
        gameRoom.currentPlayers = currentPlayers;
      }
      if (state.currentGameRoom && state.currentGameRoom.id === gameRoomId) {
        state.currentGameRoom.currentPlayers = currentPlayers;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch GameRooms
      .addCase(fetchGameRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.gameRooms = action.payload.gameRooms || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchGameRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create GameRoom
      .addCase(createGameRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGameRoom.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.gameRoom) {
          state.gameRooms.unshift(action.payload.gameRoom);
        }
      })
      .addCase(createGameRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch GameRoom by ID
      .addCase(fetchGameRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGameRoom = action.payload.gameRoom || action.payload;
      })
      .addCase(fetchGameRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update GameRoom
      .addCase(updateGameRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGameRoom.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRoom = action.payload.gameRoom || action.payload;
        
        // Actualizar en la lista
        const index = state.gameRooms.findIndex(room => room.id === updatedRoom.id);
        if (index !== -1) {
          state.gameRooms[index] = updatedRoom;
        }
        
        // Actualizar currentGameRoom si coincide
        if (state.currentGameRoom && state.currentGameRoom.id === updatedRoom.id) {
          state.currentGameRoom = updatedRoom;
        }
      })
      .addCase(updateGameRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete GameRoom
      .addCase(deleteGameRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGameRoom.fulfilled, (state, action) => {
        state.loading = false;
        const gameRoomId = action.payload;
        state.gameRooms = state.gameRooms.filter(room => room.id !== gameRoomId);
        
        if (state.currentGameRoom && state.currentGameRoom.id === gameRoomId) {
          state.currentGameRoom = null;
        }
      })
      .addCase(deleteGameRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Join GameRoom
      .addCase(joinGameRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinGameRoom.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar la sala actual con la nueva información
        if (action.payload.gameRoom) {
          state.currentGameRoom = action.payload.gameRoom;
        }
      })
      .addCase(joinGameRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Leave GameRoom
      .addCase(leaveGameRoom.fulfilled, (state, action) => {
        if (action.payload.gameRoom) {
          state.currentGameRoom = action.payload.gameRoom;
        }
      })
      
      // Start Game
      .addCase(startGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.gameRoom) {
          state.currentGameRoom = action.payload.gameRoom;
          
          // Actualizar en la lista también
          const index = state.gameRooms.findIndex(room => room.id === action.payload.gameRoom.id);
          if (index !== -1) {
            state.gameRooms[index] = action.payload.gameRoom;
          }
        }
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentGameRoom,
  setFilters,
  resetFilters,
  updateGameRoomStatus,
  updatePlayerCount,
} = gameRoomsSlice.actions;

export default gameRoomsSlice.reducer;

// Selectores
export const selectGameRooms = (state) => state.gameRooms.gameRooms;
export const selectCurrentGameRoom = (state) => state.gameRooms.currentGameRoom;
export const selectGameRoomsLoading = (state) => state.gameRooms.loading;
export const selectGameRoomsError = (state) => state.gameRooms.error;
export const selectGameRoomsPagination = (state) => state.gameRooms.pagination;
export const selectGameRoomsFilters = (state) => state.gameRooms.filters;