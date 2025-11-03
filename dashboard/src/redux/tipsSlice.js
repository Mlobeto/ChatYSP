import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Estados iniciales
const initialState = {
  tips: [],
  currentTip: null,
  categories: [
    { id: 'chat', name: 'Chat', color: '#3B82F6' },
    { id: 'game', name: 'Juegos', color: '#10B981' },
    { id: 'general', name: 'General', color: '#8B5CF6' },
    { id: 'ai', name: 'IA', color: '#F59E0B' },
  ],
  difficulties: [
    { id: 'beginner', name: 'Principiante', color: '#10B981' },
    { id: 'intermediate', name: 'Intermedio', color: '#F59E0B' },
    { id: 'advanced', name: 'Avanzado', color: '#EF4444' },
  ],
  stats: {
    total: 0,
    byCategory: {},
    byDifficulty: {},
    recentlyCreated: 0,
  },
  filters: {
    category: 'all',
    difficulty: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  successMessage: null,
};

// Async thunks
export const loadTips = createAsyncThunk(
  'tips/loadTips',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { tips: { filters, pagination } } = getState();
      
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        category: params.category || filters.category,
        difficulty: params.difficulty || filters.difficulty,
        search: params.search || filters.search,
        sortBy: params.sortBy || filters.sortBy,
        sortOrder: params.sortOrder || filters.sortOrder,
      };

      // Remover parámetros 'all'
      if (queryParams.category === 'all') delete queryParams.category;
      if (queryParams.difficulty === 'all') delete queryParams.difficulty;
      if (!queryParams.search) delete queryParams.search;

      const response = await api.get('/tips', { params: queryParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando tips');
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

export const createTip = createAsyncThunk(
  'tips/createTip',
  async (tipData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tips', tipData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creando tip');
    }
  }
);

export const updateTip = createAsyncThunk(
  'tips/updateTip',
  async ({ tipId, tipData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tips/${tipId}`, tipData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error actualizando tip');
    }
  }
);

export const deleteTip = createAsyncThunk(
  'tips/deleteTip',
  async (tipId, { rejectWithValue }) => {
    try {
      await api.delete(`/tips/${tipId}`);
      return tipId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error eliminando tip');
    }
  }
);

export const getTipsStats = createAsyncThunk(
  'tips/getTipsStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tips/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando estadísticas');
    }
  }
);

export const getRandomTips = createAsyncThunk(
  'tips/getRandomTips',
  async (count = 5, { rejectWithValue }) => {
    try {
      const response = await api.get('/tips/random', { params: { count } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error cargando tips aleatorios');
    }
  }
);

// Slice
const tipsSlice = createSlice({
  name: 'tips',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset page when filters change
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    resetFilters: (state) => {
      state.filters = {
        category: 'all',
        difficulty: 'all',
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      state.pagination.page = 1;
    },
    
    clearCurrentTip: (state) => {
      state.currentTip = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
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
        
        // El backend devuelve { success: true, data: { tips: [...], pagination: {...} } }
        const responseData = action.payload.data || action.payload;
        state.tips = responseData.tips || action.payload.tips || action.payload;
        
        // Update pagination if response includes pagination info
        if (responseData.pagination || action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...(responseData.pagination || action.payload.pagination),
          };
        }
      })
      .addCase(loadTips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get tip by ID
      .addCase(getTipById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTipById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTip = action.payload;
      })
      .addCase(getTipById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create tip
      .addCase(createTip.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTip.fulfilled, (state, action) => {
        state.isCreating = false;
        state.tips.unshift(action.payload);
        state.successMessage = 'Tip creado exitosamente';
        state.stats.total += 1;
      })
      .addCase(createTip.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update tip
      .addCase(updateTip.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTip.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.tips.findIndex(tip => tip.id === action.payload.id);
        if (index !== -1) {
          state.tips[index] = action.payload;
        }
        state.currentTip = action.payload;
        state.successMessage = 'Tip actualizado exitosamente';
      })
      .addCase(updateTip.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete tip
      .addCase(deleteTip.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTip.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.tips = state.tips.filter(tip => tip.id !== action.payload);
        state.successMessage = 'Tip eliminado exitosamente';
        state.stats.total -= 1;
      })
      .addCase(deleteTip.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Get tips stats
      .addCase(getTipsStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getTipsStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Get random tips
      .addCase(getRandomTips.fulfilled, (state, action) => {
        // These could be used for previews or recommendations
        state.randomTips = action.payload;
      })
      .addCase(getRandomTips.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setPagination,
  resetFilters,
  clearCurrentTip,
  clearError,
  clearSuccessMessage,
  setSuccessMessage,
} = tipsSlice.actions;

export default tipsSlice.reducer;

// Selectors
export const selectAllTips = (state) => state.tips.tips;
export const selectCurrentTip = (state) => state.tips.currentTip;
export const selectTipsStats = (state) => state.tips.stats;
export const selectTipsFilters = (state) => state.tips.filters;
export const selectTipsPagination = (state) => state.tips.pagination;
export const selectTipsLoading = (state) => state.tips.isLoading;
export const selectTipsError = (state) => state.tips.error;
export const selectTipsSuccessMessage = (state) => state.tips.successMessage;
export const selectCategories = (state) => state.tips.categories;
export const selectDifficulties = (state) => state.tips.difficulties;