import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Estados iniciales
const initialState = {
  tips: [],
  categories: [
    { id: 'all', name: 'Todos' },
    { id: 'motivation', name: 'Motivación' },
    { id: 'productivity', name: 'Productividad' },
    { id: 'wellness', name: 'Bienestar' },
    { id: 'communication', name: 'Comunicación' },
    { id: 'leadership', name: 'Liderazgo' },
    { id: 'personal-growth', name: 'Crecimiento Personal' },
    { id: 'habits', name: 'Hábitos' },
    { id: 'mindset', name: 'Mentalidad' },
  ],
  selectedCategory: 'all',
  favorites: [],
  readTips: [],
  downloadedVideos: [],
  watchProgress: {},
  isLoading: false,
  error: null,
  searchHistory: [],
  recommendations: [],
};

// Async thunks
export const loadTips = createAsyncThunk(
  'tips/loadTips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tips');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando tips');
    }
  }
);

export const loadTipsByCategory = createAsyncThunk(
  'tips/loadTipsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tips/category/${category}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando tips por categoría');
    }
  }
);

export const searchTips = createAsyncThunk(
  'tips/searchTips',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await api.get('/tips/search', {
        params: {
          q: query,
          category: filters?.category,
          type: filters?.type,
          difficulty: filters?.difficulty,
        }
      });
      return { query, results: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error en la búsqueda');
    }
  }
);

export const getTipById = createAsyncThunk(
  'tips/getTipById',
  async (tipId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tips/${tipId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando tip');
    }
  }
);

export const markTipAsRead = createAsyncThunk(
  'tips/markTipAsRead',
  async (tipId, { getState, rejectWithValue }) => {
    try {
      // Marcar como leído en el servidor
      await api.post(`/tips/${tipId}/read`);
      
      // Guardar en AsyncStorage
      const { tips } = getState();
      const updatedReadTips = [...tips.readTips, tipId];
      await AsyncStorage.setItem('readTips', JSON.stringify(updatedReadTips));
      
      return tipId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error marcando como leído');
    }
  }
);

export const toggleTipFavorite = createAsyncThunk(
  'tips/toggleTipFavorite',
  async (tipId, { getState, rejectWithValue }) => {
    try {
      const { tips } = getState();
      const isFavorite = tips.favorites.includes(tipId);
      
      if (isFavorite) {
        await api.delete(`/tips/${tipId}/favorite`);
      } else {
        await api.post(`/tips/${tipId}/favorite`);
      }
      
      // Actualizar en AsyncStorage
      const updatedFavorites = isFavorite 
        ? tips.favorites.filter(id => id !== tipId)
        : [...tips.favorites, tipId];
      
      await AsyncStorage.setItem('favoriteTips', JSON.stringify(updatedFavorites));
      
      return { tipId, isFavorite: !isFavorite };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error actualizando favorito');
    }
  }
);

export const updateVideoProgress = createAsyncThunk(
  'tips/updateVideoProgress',
  async ({ tipId, progress, currentTime, duration }, { getState, rejectWithValue }) => {
    try {
      // Actualizar progreso en el servidor
      await api.post(`/tips/${tipId}/progress`, {
        progress,
        currentTime,
        duration
      });
      
      // Guardar en AsyncStorage
      const { tips } = getState();
      const updatedProgress = {
        ...tips.watchProgress,
        [tipId]: { progress, currentTime, duration, updatedAt: new Date().toISOString() }
      };
      
      await AsyncStorage.setItem('videoProgress', JSON.stringify(updatedProgress));
      
      return { tipId, progress, currentTime, duration };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error actualizando progreso');
    }
  }
);

export const loadRecommendations = createAsyncThunk(
  'tips/loadRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tips/recommendations');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando recomendaciones');
    }
  }
);

// Funciones auxiliares para AsyncStorage
export const loadLocalData = createAsyncThunk(
  'tips/loadLocalData',
  async (_, { rejectWithValue }) => {
    try {
      const [favoriteTips, readTips, videoProgress, searchHistory] = await Promise.all([
        AsyncStorage.getItem('favoriteTips'),
        AsyncStorage.getItem('readTips'),
        AsyncStorage.getItem('videoProgress'),
        AsyncStorage.getItem('searchHistory'),
      ]);
      
      return {
        favorites: favoriteTips ? JSON.parse(favoriteTips) : [],
        readTips: readTips ? JSON.parse(readTips) : [],
        watchProgress: videoProgress ? JSON.parse(videoProgress) : {},
        searchHistory: searchHistory ? JSON.parse(searchHistory) : [],
      };
    } catch (error) {
      return rejectWithValue('Error cargando datos locales');
    }
  }
);

// Slice
const tipsSlice = createSlice({
  name: 'tips',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    
    addToSearchHistory: (state, action) => {
      const query = action.payload;
      
      // Evitar duplicados y mantener solo los últimos 10
      state.searchHistory = [
        query,
        ...state.searchHistory.filter(q => q !== query)
      ].slice(0, 10);
      
      // Guardar en AsyncStorage
      AsyncStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      AsyncStorage.removeItem('searchHistory');
    },
    
    updateTipProgress: (state, action) => {
      const { tipId, progress } = action.payload;
      
      const tip = state.tips.find(t => t.id === tipId);
      if (tip) {
        tip.progress = progress;
      }
    },
    
    setVideoWatchProgress: (state, action) => {
      const { tipId, progress, currentTime, duration } = action.payload;
      
      state.watchProgress[tipId] = {
        progress,
        currentTime,
        duration,
        updatedAt: new Date().toISOString()
      };
    },
    
    addDownloadedVideo: (state, action) => {
      const { tipId, localPath } = action.payload;
      
      if (!state.downloadedVideos.includes(tipId)) {
        state.downloadedVideos.push(tipId);
      }
      
      const tip = state.tips.find(t => t.id === tipId);
      if (tip) {
        tip.localPath = localPath;
        tip.isDownloaded = true;
      }
    },
    
    removeDownloadedVideo: (state, action) => {
      const tipId = action.payload;
      
      state.downloadedVideos = state.downloadedVideos.filter(id => id !== tipId);
      
      const tip = state.tips.find(t => t.id === tipId);
      if (tip) {
        delete tip.localPath;
        tip.isDownloaded = false;
      }
    },
    
    updateTipRating: (state, action) => {
      const { tipId, rating } = action.payload;
      
      const tip = state.tips.find(t => t.id === tipId);
      if (tip) {
        tip.userRating = rating;
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetTipsState: (state) => {
      Object.assign(state, {
        ...initialState,
        favorites: state.favorites,
        readTips: state.readTips,
        watchProgress: state.watchProgress,
        searchHistory: state.searchHistory,
      });
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Load tips
      .addCase(loadTips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tips = action.payload.map(tip => ({
          ...tip,
          isRead: state.readTips.includes(tip.id),
          isFavorite: state.favorites.includes(tip.id),
          progress: state.watchProgress[tip.id]?.progress || 0,
          isDownloaded: state.downloadedVideos.includes(tip.id),
        }));
      })
      .addCase(loadTips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Load tips by category
      .addCase(loadTipsByCategory.fulfilled, (state, action) => {
        state.tips = action.payload.map(tip => ({
          ...tip,
          isRead: state.readTips.includes(tip.id),
          isFavorite: state.favorites.includes(tip.id),
          progress: state.watchProgress[tip.id]?.progress || 0,
          isDownloaded: state.downloadedVideos.includes(tip.id),
        }));
      })
      .addCase(loadTipsByCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Search tips
      .addCase(searchTips.fulfilled, (state, action) => {
        const { query, results } = action.payload;
        
        state.tips = results.map(tip => ({
          ...tip,
          isRead: state.readTips.includes(tip.id),
          isFavorite: state.favorites.includes(tip.id),
          progress: state.watchProgress[tip.id]?.progress || 0,
          isDownloaded: state.downloadedVideos.includes(tip.id),
        }));
        
        // Agregar a historial de búsqueda
        if (!state.searchHistory.includes(query)) {
          state.searchHistory = [query, ...state.searchHistory].slice(0, 10);
        }
      })
      .addCase(searchTips.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Mark tip as read
      .addCase(markTipAsRead.fulfilled, (state, action) => {
        const tipId = action.payload;
        
        if (!state.readTips.includes(tipId)) {
          state.readTips.push(tipId);
        }
        
        const tip = state.tips.find(t => t.id === tipId);
        if (tip) {
          tip.isRead = true;
        }
      })
      .addCase(markTipAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Toggle tip favorite
      .addCase(toggleTipFavorite.fulfilled, (state, action) => {
        const { tipId, isFavorite } = action.payload;
        
        if (isFavorite) {
          if (!state.favorites.includes(tipId)) {
            state.favorites.push(tipId);
          }
        } else {
          state.favorites = state.favorites.filter(id => id !== tipId);
        }
        
        const tip = state.tips.find(t => t.id === tipId);
        if (tip) {
          tip.isFavorite = isFavorite;
        }
      })
      .addCase(toggleTipFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update video progress
      .addCase(updateVideoProgress.fulfilled, (state, action) => {
        const { tipId, progress, currentTime, duration } = action.payload;
        
        state.watchProgress[tipId] = {
          progress,
          currentTime,
          duration,
          updatedAt: new Date().toISOString()
        };
        
        const tip = state.tips.find(t => t.id === tipId);
        if (tip) {
          tip.progress = progress;
        }
      })
      .addCase(updateVideoProgress.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Load recommendations
      .addCase(loadRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      .addCase(loadRecommendations.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Load local data
      .addCase(loadLocalData.fulfilled, (state, action) => {
        const { favorites, readTips, watchProgress, searchHistory } = action.payload;
        
        state.favorites = favorites;
        state.readTips = readTips;
        state.watchProgress = watchProgress;
        state.searchHistory = searchHistory;
        
        // Actualizar tips existentes con datos locales
        state.tips = state.tips.map(tip => ({
          ...tip,
          isRead: readTips.includes(tip.id),
          isFavorite: favorites.includes(tip.id),
          progress: watchProgress[tip.id]?.progress || 0,
        }));
      })
      .addCase(loadLocalData.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedCategory,
  addToSearchHistory,
  clearSearchHistory,
  updateTipProgress,
  setVideoWatchProgress,
  addDownloadedVideo,
  removeDownloadedVideo,
  updateTipRating,
  clearError,
  resetTipsState
} = tipsSlice.actions;

export default tipsSlice.reducer;