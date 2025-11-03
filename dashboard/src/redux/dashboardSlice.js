import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../services/dashboardApi';
import { uploadService } from '../services/uploadService';

// Estado inicial
const initialState = {
  // Estadísticas generales
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    totalRooms: 0,
    totalMessages: 0,
    totalTips: 0,
    totalVideos: 0,
  },
  
  // Usuarios
  users: [],
  usersLoading: false,
  usersError: null,
  usersPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  
  // Tips
  tips: [],
  tipsLoading: false,
  tipsError: null,
  tipsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  
  // Videos
  videos: [],
  videosLoading: false,
  videosError: null,
  videosPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  
  // Estado general
  loading: false,
  error: null,
  
  // Conocimiento IA
  aiKnowledge: null,
  aiKnowledgeLoading: false,
  aiKnowledgeError: null,
};

// Thunks para estadísticas
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getStats();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener estadísticas';
      return rejectWithValue(message);
    }
  }
);

// Thunks para usuarios
export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async ({ page = 1, limit = 10, search = '' }, { rejectWithValue }) => {
    try {
      console.log('🔄 fetchUsers thunk - Iniciando con parámetros:', { page, limit, search });
      
      const response = await dashboardApi.getUsers({ page, limit, search });
      
      console.log('✅ fetchUsers thunk - Respuesta exitosa:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ fetchUsers thunk - Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      const message = error.response?.data?.message || 'Error al obtener usuarios';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'dashboard/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.createUser(userData);
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear usuario';
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'dashboard/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.updateUser(userId, userData);
      return { userId, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      return rejectWithValue(message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'dashboard/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.updateUser(userId, { status });
      return { userId, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'dashboard/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await dashboardApi.deleteUser(userId);
      return userId;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar usuario';
      return rejectWithValue(message);
    }
  }
);

// Thunks para tips
export const fetchTips = createAsyncThunk(
  'dashboard/fetchTips',
  async ({ page = 1, limit = 10, category = '' }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getTips({ page, limit, category });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener tips';
      return rejectWithValue(message);
    }
  }
);

export const createTip = createAsyncThunk(
  'dashboard/createTip',
  async (tipData, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.createTip(tipData);
      return response.data.tip;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear tip';
      return rejectWithValue(message);
    }
  }
);

export const updateTip = createAsyncThunk(
  'dashboard/updateTip',
  async ({ tipId, tipData }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.updateTip(tipId, tipData);
      return response.data.tip;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar tip';
      return rejectWithValue(message);
    }
  }
);

export const deleteTip = createAsyncThunk(
  'dashboard/deleteTip',
  async (tipId, { rejectWithValue }) => {
    try {
      await dashboardApi.deleteTip(tipId);
      return tipId;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar tip';
      return rejectWithValue(message);
    }
  }
);

// Thunks para videos
export const fetchVideos = createAsyncThunk(
  'dashboard/fetchVideos',
  async ({ page = 1, limit = 10, category = '' }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getVideos({ page, limit, category });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener videos';
      return rejectWithValue(message);
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'dashboard/uploadVideo',
  async ({ videoFile, videoData, onProgress }, { rejectWithValue }) => {
    try {
      const response = await uploadService.uploadVideo(videoFile, videoData, onProgress);
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al subir video';
      return rejectWithValue(message);
    }
  }
);

export const updateVideo = createAsyncThunk(
  'dashboard/updateVideo',
  async ({ videoId, videoData }, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.updateVideo(videoId, videoData);
      return response.data.video;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar video';
      return rejectWithValue(message);
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'dashboard/deleteVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      await dashboardApi.deleteVideo(videoId);
      return videoId;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar video';
      return rejectWithValue(message);
    }
  }
);

// Thunks para conocimiento IA
export const fetchAiKnowledge = createAsyncThunk(
  'dashboard/fetchAiKnowledge',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAiKnowledge();
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener conocimiento IA';
      return rejectWithValue(message);
    }
  }
);

export const updateAiKnowledge = createAsyncThunk(
  'dashboard/updateAiKnowledge',
  async (knowledgeData, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.updateAiKnowledge(knowledgeData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar conocimiento IA';
      return rejectWithValue(message);
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.usersError = null;
      state.tipsError = null;
      state.videosError = null;
      state.aiKnowledgeError = null;
    },
    setUsersPage: (state, action) => {
      state.usersPagination.page = action.payload;
    },
    setTipsPage: (state, action) => {
      state.tipsPagination.page = action.payload;
    },
    setVideosPage: (state, action) => {
      state.videosPagination.page = action.payload;
    },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Estadísticas
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Usuarios
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.usersPagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.stats.totalUsers += 1;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.stats.totalUsers = Math.max(0, state.stats.totalUsers - 1);
      })
      
      // Tips
      .addCase(fetchTips.pending, (state) => {
        state.tipsLoading = true;
        state.tipsError = null;
      })
      .addCase(fetchTips.fulfilled, (state, action) => {
        state.tipsLoading = false;
        state.tips = action.payload.tips;
        state.tipsPagination = action.payload.pagination;
      })
      .addCase(fetchTips.rejected, (state, action) => {
        state.tipsLoading = false;
        state.tipsError = action.payload;
      })
      .addCase(createTip.fulfilled, (state, action) => {
        state.tips.unshift(action.payload);
        state.stats.totalTips += 1;
      })
      .addCase(updateTip.fulfilled, (state, action) => {
        const index = state.tips.findIndex(tip => tip.id === action.payload.id);
        if (index !== -1) {
          state.tips[index] = action.payload;
        }
      })
      .addCase(deleteTip.fulfilled, (state, action) => {
        state.tips = state.tips.filter(tip => tip.id !== action.payload);
        state.stats.totalTips = Math.max(0, state.stats.totalTips - 1);
      })
      
      // Videos
      .addCase(fetchVideos.pending, (state) => {
        state.videosLoading = true;
        state.videosError = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.videosLoading = false;
        state.videos = action.payload.videos;
        state.videosPagination = action.payload.pagination;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.videosLoading = false;
        state.videosError = action.payload;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.videos.unshift(action.payload);
        state.stats.totalVideos += 1;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        const index = state.videos.findIndex(video => video.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.videos = state.videos.filter(video => video.id !== action.payload);
        state.stats.totalVideos = Math.max(0, state.stats.totalVideos - 1);
      })
      
      // Conocimiento IA
      .addCase(fetchAiKnowledge.pending, (state) => {
        state.aiKnowledgeLoading = true;
        state.aiKnowledgeError = null;
      })
      .addCase(fetchAiKnowledge.fulfilled, (state, action) => {
        state.aiKnowledgeLoading = false;
        state.aiKnowledge = action.payload.knowledge;
      })
      .addCase(fetchAiKnowledge.rejected, (state, action) => {
        state.aiKnowledgeLoading = false;
        state.aiKnowledgeError = action.payload;
      })
      .addCase(updateAiKnowledge.fulfilled, (state, action) => {
        state.aiKnowledge = action.payload.knowledge;
      });
  },
});

export const { 
  clearError, 
  setUsersPage, 
  setTipsPage, 
  setVideosPage, 
  resetDashboard 
} = dashboardSlice.actions;

// Selectores
export const selectDashboard = (state) => state.dashboard;
export const selectStats = (state) => state.dashboard.stats;
export const selectUsers = (state) => state.dashboard.users;
export const selectUsersLoading = (state) => state.dashboard.usersLoading;
export const selectUsersPagination = (state) => state.dashboard.usersPagination;
export const selectTips = (state) => state.dashboard.tips;
export const selectTipsLoading = (state) => state.dashboard.tipsLoading;
export const selectTipsPagination = (state) => state.dashboard.tipsPagination;
export const selectVideos = (state) => state.dashboard.videos;
export const selectVideosLoading = (state) => state.dashboard.videosLoading;
export const selectVideosPagination = (state) => state.dashboard.videosPagination;
export const selectAiKnowledge = (state) => state.dashboard.aiKnowledge;
export const selectAiKnowledgeLoading = (state) => state.dashboard.aiKnowledgeLoading;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;