import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiAPI } from '../services/api';

// Estado inicial
const initialState = {
  messages: [],
  isTyping: false,
  isLoading: false,
  error: null,
  conversationId: null,
  lastInteraction: null,
};

// Tipos de mensajes
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system'
};

// Acciones asíncronas
export const sendMessageToAI = createAsyncThunk(
  'chat/sendMessageToAI',
  async ({ message, context = {} }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      // Crear mensaje del usuario
      const userMessage = {
        id: Date.now().toString(),
        type: MESSAGE_TYPES.USER,
        content: message,
        timestamp: new Date().toISOString(),
        userId
      };
      
      // Enviar al backend
      const response = await aiAPI.sendMessage({
        message,
        userId,
        context: {
          ...context,
          conversationHistory: getState().chat.messages.slice(-10) // Últimos 10 mensajes
        }
      });
      
      // Crear respuesta de la IA
      const aiMessage = {
        id: response.data.messageId || (Date.now() + 1).toString(),
        type: MESSAGE_TYPES.AI,
        content: response.data.response,
        timestamp: new Date().toISOString(),
        metadata: response.data.metadata || {}
      };
      
      return { userMessage, aiMessage };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al comunicarse con la IA';
      return rejectWithValue(message);
    }
  }
);

export const loadConversationHistory = createAsyncThunk(
  'chat/loadConversationHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      if (!userId) {
        return [];
      }
      
      const response = await aiAPI.getConversationHistory(userId);
      return response.data.messages || [];
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cargar historial';
      return rejectWithValue(message);
    }
  }
);

export const clearConversation = createAsyncThunk(
  'chat/clearConversation',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      if (userId) {
        await aiAPI.clearConversation(userId);
      }
      
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al limpiar conversación';
      return rejectWithValue(message);
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      state.lastInteraction = new Date().toISOString();
    },
    
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearChat: (state) => {
      state.messages = [];
      state.conversationId = null;
      state.lastInteraction = null;
      state.error = null;
      state.isTyping = false;
    },
    
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
      }
    },
    
    deleteMessage: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.filter(msg => msg.id !== messageId);
    },
    
    addSystemMessage: (state, action) => {
      const systemMessage = {
        id: Date.now().toString(),
        type: MESSAGE_TYPES.SYSTEM,
        content: action.payload,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(systemMessage);
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Enviar mensaje a IA
      .addCase(sendMessageToAI.pending, (state) => {
        state.isLoading = true;
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        
        // Agregar mensaje del usuario
        state.messages.push(action.payload.userMessage);
        
        // Agregar respuesta de la IA
        state.messages.push(action.payload.aiMessage);
        
        state.lastInteraction = new Date().toISOString();
      })
      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.error = action.payload;
        
        // Agregar mensaje de error del sistema
        const errorMessage = {
          id: Date.now().toString(),
          type: MESSAGE_TYPES.SYSTEM,
          content: `Error: ${action.payload}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        state.messages.push(errorMessage);
      })
      
      // Cargar historial
      .addCase(loadConversationHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadConversationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(loadConversationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Limpiar conversación
      .addCase(clearConversation.fulfilled, (state) => {
        state.messages = [];
        state.conversationId = null;
        state.lastInteraction = null;
      });
  },
});

export const {
  addMessage,
  setTyping,
  clearError,
  clearChat,
  updateMessage,
  deleteMessage,
  addSystemMessage
} = chatSlice.actions;

// Selectores
export const selectChat = (state) => state.chat;
export const selectMessages = (state) => state.chat.messages;
export const selectIsTyping = (state) => state.chat.isTyping;
export const selectIsLoading = (state) => state.chat.isLoading;
export const selectChatError = (state) => state.chat.error;
export const selectLastInteraction = (state) => state.chat.lastInteraction;

// Selectores computados
export const selectUserMessages = (state) => 
  state.chat.messages.filter(msg => msg.type === MESSAGE_TYPES.USER);

export const selectAIMessages = (state) => 
  state.chat.messages.filter(msg => msg.type === MESSAGE_TYPES.AI);

export const selectRecentMessages = (state) => 
  state.chat.messages.slice(-20); // Últimos 20 mensajes

export default chatSlice.reducer;