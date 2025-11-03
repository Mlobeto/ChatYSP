import axios from 'axios';

// Base URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instancia de axios para el dashboard
const dashboardAPI = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token automáticamente
dashboardAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
dashboardAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardApi = {
  // Estadísticas del dashboard
  getStats: async () => {
    const response = await dashboardAPI.get('/admin/stats');
    return response;
  },

  // Gestión de usuarios
  getUsers: async (params = {}) => {
    const { page = 1, limit = 10, search = '' } = params;
    
    console.log('🌐 dashboardApi.getUsers - Enviando petición:', {
      url: '/admin/users',
      params: { page, limit, search },
      baseURL: dashboardAPI.defaults.baseURL
    });
    
    try {
      const response = await dashboardAPI.get('/admin/users', {
        params: { page, limit, search },
      });
      
      console.log('✅ dashboardApi.getUsers - Respuesta exitosa:', {
        status: response.status,
        data: response.data,
        url: response.config.url
      });
      
      return response;
    } catch (error) {
      console.error('❌ dashboardApi.getUsers - Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  createUser: async (userData) => {
    const response = await dashboardAPI.post('/admin/users', userData);
    return response;
  },

  getUserById: async (userId) => {
    const response = await dashboardAPI.get(`/admin/users/${userId}`);
    return response;
  },

  updateUser: async (userId, userData) => {
    const response = await dashboardAPI.put(`/admin/users/${userId}`, userData);
    return response;
  },

  deleteUser: async (userId) => {
    const response = await dashboardAPI.delete(`/admin/users/${userId}`);
    return response;
  },

  // Gestión de tips
  getTips: async (params = {}) => {
    const { page = 1, limit = 10, category = '' } = params;
    const response = await dashboardAPI.get('/admin/tips', {
      params: { page, limit, category },
    });
    return response;
  },

  getTipById: async (tipId) => {
    const response = await dashboardAPI.get(`/admin/tips/${tipId}`);
    return response;
  },

  createTip: async (tipData) => {
    const response = await dashboardAPI.post('/admin/tips', tipData);
    return response;
  },

  updateTip: async (tipId, tipData) => {
    const response = await dashboardAPI.put(`/admin/tips/${tipId}`, tipData);
    return response;
  },

  deleteTip: async (tipId) => {
    const response = await dashboardAPI.delete(`/admin/tips/${tipId}`);
    return response;
  },

  // Gestión de videos
  getVideos: async (params = {}) => {
    const { page = 1, limit = 10, category = '' } = params;
    const response = await dashboardAPI.get('/admin/videos', {
      params: { page, limit, category },
    });
    return response;
  },

  getVideoById: async (videoId) => {
    const response = await dashboardAPI.get(`/admin/videos/${videoId}`);
    return response;
  },

  createVideo: async (videoData) => {
    const response = await dashboardAPI.post('/admin/videos', videoData);
    return response;
  },

  updateVideo: async (videoId, videoData) => {
    const response = await dashboardAPI.put(`/admin/videos/${videoId}`, videoData);
    return response;
  },

  deleteVideo: async (videoId) => {
    const response = await dashboardAPI.delete(`/admin/videos/${videoId}`);
    return response;
  },

  // Gestión de salas
  getRooms: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await dashboardAPI.get('/admin/rooms', {
      params: { page, limit },
    });
    return response;
  },

  deleteRoom: async (roomId) => {
    const response = await dashboardAPI.delete(`/admin/rooms/${roomId}`);
    return response;
  },

  // Gestión del conocimiento IA
  getAiKnowledge: async () => {
    const response = await dashboardAPI.get('/admin/ai/knowledge');
    return response;
  },

  updateAiKnowledge: async (knowledgeData) => {
    const response = await dashboardAPI.put('/admin/ai/knowledge', knowledgeData);
    return response;
  },

  syncAiKnowledge: async () => {
    const response = await dashboardAPI.post('/admin/ai/sync');
    return response;
  },

  // Analíticas avanzadas
  getAnalytics: async (params = {}) => {
    const { timeRange = '30d', metrics = [] } = params;
    const response = await dashboardAPI.get('/admin/analytics', {
      params: { timeRange, metrics: metrics.join(',') },
    });
    return response;
  },

  getUserActivity: async (userId, params = {}) => {
    const { days = 7 } = params;
    const response = await dashboardAPI.get(`/admin/users/${userId}/activity`, {
      params: { days },
    });
    return response;
  },

  // Configuración del sistema
  getSystemConfig: async () => {
    const response = await dashboardAPI.get('/admin/config');
    return response;
  },

  updateSystemConfig: async (configData) => {
    const response = await dashboardAPI.put('/admin/config', configData);
    return response;
  },

  // Logs del sistema
  getSystemLogs: async (params = {}) => {
    const { page = 1, limit = 50, level = '', service = '' } = params;
    const response = await dashboardAPI.get('/admin/logs', {
      params: { page, limit, level, service },
    });
    return response;
  },

  // GameRooms - Salas de juego terapéuticas
  getGameRooms: async (params = {}) => {
    const response = await dashboardAPI.get('/gamerooms', { params });
    return response;
  },

  createGameRoom: async (gameRoomData) => {
    const response = await dashboardAPI.post('/gamerooms', gameRoomData);
    return response;
  },

  getGameRoomById: async (gameRoomId) => {
    const response = await dashboardAPI.get(`/gamerooms/${gameRoomId}`);
    return response;
  },

  updateGameRoom: async (gameRoomId, updateData) => {
    const response = await dashboardAPI.put(`/gamerooms/${gameRoomId}`, updateData);
    return response;
  },

  deleteGameRoom: async (gameRoomId) => {
    const response = await dashboardAPI.delete(`/gamerooms/${gameRoomId}`);
    return response;
  },

  joinGameRoom: async (gameRoomId) => {
    const response = await dashboardAPI.post(`/gamerooms/${gameRoomId}/join`);
    return response;
  },

  leaveGameRoom: async (gameRoomId) => {
    const response = await dashboardAPI.post(`/gamerooms/${gameRoomId}/leave`);
    return response;
  },

  startGame: async (gameRoomId) => {
    const response = await dashboardAPI.post(`/gamerooms/${gameRoomId}/start`);
    return response;
  },

  // Invitaciones a GameRooms
  sendGameRoomInvitation: async (gameRoomId, invitationData) => {
    const response = await dashboardAPI.post(`/gamerooms/${gameRoomId}/invitations`, invitationData);
    return response;
  },

  acceptGameRoomInvitation: async (invitationId) => {
    const response = await dashboardAPI.post(`/gamerooms/invitations/${invitationId}/accept`);
    return response;
  },

  declineGameRoomInvitation: async (invitationId) => {
    const response = await dashboardAPI.post(`/gamerooms/invitations/${invitationId}/decline`);
    return response;
  },
};

export default dashboardAPI;