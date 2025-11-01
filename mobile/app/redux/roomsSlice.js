import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import socketService from '../services/socketService';

// Estados iniciales
const initialState = {
  rooms: [],
  activeRoom: null,
  roomMessages: {},
  connectedUsers: {},
  joinedRooms: [],
  isLoading: false,
  error: null,
  currentRoomId: null,
};

// Async thunks
export const loadRooms = createAsyncThunk(
  'rooms/loadRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/rooms');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando salas');
    }
  }
);

export const joinRoom = createAsyncThunk(
  'rooms/joinRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rooms/${roomId}/join`);
      return { roomId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error uniéndose a la sala');
    }
  }
);

export const leaveRoom = createAsyncThunk(
  'rooms/leaveRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rooms/${roomId}/leave`);
      return { roomId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error saliendo de la sala');
    }
  }
);

export const loadRoomMessages = createAsyncThunk(
  'rooms/loadRoomMessages',
  async ({ roomId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/rooms/${roomId}/messages`, {
        params: { page, limit }
      });
      return { roomId, messages: response.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando mensajes');
    }
  }
);

export const sendRoomMessage = createAsyncThunk(
  'rooms/sendRoomMessage',
  async ({ roomId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rooms/${roomId}/messages`, {
        content: message,
        type: 'text'
      });
      
      // Enviar a través de Socket.IO también
      socketService.sendRoomMessage(roomId, {
        ...response.data,
        content: message
      });
      
      return { roomId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error enviando mensaje');
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await api.post('/rooms', roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creando sala');
    }
  }
);

// Slice
const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.currentRoomId = action.payload?.id || null;
    },
    
    clearActiveRoom: (state) => {
      state.activeRoom = null;
      state.currentRoomId = null;
    },
    
    addRoomMessage: (state, action) => {
      const { roomId, message } = action.payload;
      
      if (!state.roomMessages[roomId]) {
        state.roomMessages[roomId] = [];
      }
      
      // Evitar duplicados
      const existingMessage = state.roomMessages[roomId].find(
        msg => msg.id === message.id
      );
      
      if (!existingMessage) {
        state.roomMessages[roomId].push({
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        });
        
        // Mantener solo los últimos 100 mensajes para performance
        if (state.roomMessages[roomId].length > 100) {
          state.roomMessages[roomId] = state.roomMessages[roomId].slice(-100);
        }
        
        // Actualizar último mensaje en la sala
        const room = state.rooms.find(r => r.id === roomId);
        if (room) {
          room.lastMessage = {
            content: message.content,
            senderName: message.user?.name || message.senderName,
            timestamp: message.timestamp
          };
          room.lastActivity = message.timestamp;
        }
      }
    },
    
    updateRoomUserCount: (state, action) => {
      const { roomId, count } = action.payload;
      state.connectedUsers[roomId] = count;
      
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.connectedUsers = count;
      }
    },
    
    markRoomAsJoined: (state, action) => {
      const roomId = action.payload;
      
      if (!state.joinedRooms.includes(roomId)) {
        state.joinedRooms.push(roomId);
      }
      
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.isJoined = true;
      }
    },
    
    markRoomAsLeft: (state, action) => {
      const roomId = action.payload;
      
      state.joinedRooms = state.joinedRooms.filter(id => id !== roomId);
      
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.isJoined = false;
      }
    },
    
    updateRoomStatus: (state, action) => {
      const { roomId, isActive } = action.payload;
      
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        room.isActive = isActive;
      }
    },
    
    setUserTyping: (state, action) => {
      const { roomId, userId, isTyping } = action.payload;
      
      // Manejar indicador de "escribiendo..."
      if (!state.roomMessages[roomId]) {
        state.roomMessages[roomId] = [];
      }
      
      // Esta información se podría usar para mostrar "Usuario X está escribiendo..."
      // Por ahora solo la almacenamos
    },
    
    clearRoomMessages: (state, action) => {
      const roomId = action.payload;
      delete state.roomMessages[roomId];
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetRoomsState: (state) => {
      Object.assign(state, initialState);
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Load rooms
      .addCase(loadRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.map(room => ({
          ...room,
          isJoined: state.joinedRooms.includes(room.id)
        }));
      })
      .addCase(loadRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Join room
      .addCase(joinRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roomId } = action.payload;
        
        if (!state.joinedRooms.includes(roomId)) {
          state.joinedRooms.push(roomId);
        }
        
        const room = state.rooms.find(r => r.id === roomId);
        if (room) {
          room.isJoined = true;
          room.memberCount = (room.memberCount || 0) + 1;
        }
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Leave room
      .addCase(leaveRoom.fulfilled, (state, action) => {
        const { roomId } = action.payload;
        
        state.joinedRooms = state.joinedRooms.filter(id => id !== roomId);
        
        const room = state.rooms.find(r => r.id === roomId);
        if (room) {
          room.isJoined = false;
          room.memberCount = Math.max((room.memberCount || 1) - 1, 0);
        }
        
        // Limpiar sala activa si es la que se dejó
        if (state.currentRoomId === roomId) {
          state.activeRoom = null;
          state.currentRoomId = null;
        }
      })
      .addCase(leaveRoom.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Load room messages
      .addCase(loadRoomMessages.fulfilled, (state, action) => {
        const { roomId, messages, page } = action.payload;
        
        if (page === 1) {
          // Primera página - reemplazar mensajes
          state.roomMessages[roomId] = messages;
        } else {
          // Páginas adicionales - agregar al principio (mensajes más antiguos)
          const existingMessages = state.roomMessages[roomId] || [];
          state.roomMessages[roomId] = [...messages, ...existingMessages];
        }
      })
      .addCase(loadRoomMessages.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Send room message
      .addCase(sendRoomMessage.fulfilled, (state, action) => {
        const { roomId, message } = action.payload;
        
        if (!state.roomMessages[roomId]) {
          state.roomMessages[roomId] = [];
        }
        
        state.roomMessages[roomId].push(message);
        
        // Actualizar último mensaje en la sala
        const room = state.rooms.find(r => r.id === roomId);
        if (room) {
          room.lastMessage = {
            content: message.content,
            senderName: message.user?.name || 'Tú',
            timestamp: message.timestamp
          };
          room.lastActivity = message.timestamp;
        }
      })
      .addCase(sendRoomMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Create room
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.unshift(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setActiveRoom,
  clearActiveRoom,
  addRoomMessage,
  updateRoomUserCount,
  markRoomAsJoined,
  markRoomAsLeft,
  updateRoomStatus,
  setUserTyping,
  clearRoomMessages,
  clearError,
  resetRoomsState
} = roomsSlice.actions;

export default roomsSlice.reducer;