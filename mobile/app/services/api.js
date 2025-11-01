import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuración de la API
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' // Desarrollo
  : 'https://api.chatysp.com/api'; // Producción

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      // Aquí podrías disparar una acción para redirigir al login
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData) => 
    apiClient.post('/auth/register', userData),
  
  verifyToken: (token) => 
    apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  updateProfile: (profileData) => 
    apiClient.put('/auth/profile', profileData),
  
  changePassword: (passwordData) => 
    apiClient.put('/auth/change-password', passwordData),
  
  deleteAccount: () => 
    apiClient.delete('/auth/account'),
};

// Servicios de IA
export const aiAPI = {
  sendMessage: (messageData) => 
    apiClient.post('/ai/chat', messageData),
  
  getConversationHistory: (userId) => 
    apiClient.get(`/ai/conversation/${userId}`),
  
  clearConversation: (userId) => 
    apiClient.delete(`/ai/conversation/${userId}`),
  
  getCoachingTips: (params = {}) => 
    apiClient.get('/ai/tips', { params }),
};

// Servicios de salas
export const roomsAPI = {
  getRooms: (params = {}) => 
    apiClient.get('/rooms', { params }),
  
  getRoomsByCountry: (country) => 
    apiClient.get(`/rooms/country/${country}`),
  
  createRoom: (roomData) => 
    apiClient.post('/rooms', roomData),
  
  joinRoom: (roomId) => 
    apiClient.post(`/rooms/${roomId}/join`),
  
  leaveRoom: (roomId) => 
    apiClient.post(`/rooms/${roomId}/leave`),
  
  getRoomMessages: (roomId, params = {}) => 
    apiClient.get(`/rooms/${roomId}/messages`, { params }),
};

// Servicios de juegos
export const gamesAPI = {
  // Trivial
  startTrivia: (roomId) => 
    apiClient.post(`/games/trivia/start`, { roomId }),
  
  answerTrivia: (gameId, answer) => 
    apiClient.post(`/games/trivia/answer`, { gameId, answer }),
  
  getTriviaLeaderboard: (params = {}) => 
    apiClient.get('/games/trivia/leaderboard', { params }),
  
  // Piedra, Papel, Tijera
  inviteToRPS: (opponentId) => 
    apiClient.post('/games/rps/invite', { opponentId }),
  
  respondRPSInvite: (gameId, accept) => 
    apiClient.post('/games/rps/respond', { gameId, accept }),
  
  playRPS: (gameId, move) => 
    apiClient.post('/games/rps/play', { gameId, move }),
  
  // Estadísticas de juegos
  getGameStats: (userId) => 
    apiClient.get(`/games/stats/${userId}`),
};

// Servicios de contenido
export const contentAPI = {
  getTips: (params = {}) => 
    apiClient.get('/tips', { params }),
  
  getTipById: (tipId) => 
    apiClient.get(`/tips/${tipId}`),
  
  getVideos: (params = {}) => 
    apiClient.get('/videos', { params }),
  
  getVideoById: (videoId) => 
    apiClient.get(`/videos/${videoId}`),
  
  markTipAsRead: (tipId) => 
    apiClient.post(`/tips/${tipId}/read`),
  
  markVideoAsWatched: (videoId) => 
    apiClient.post(`/videos/${videoId}/watched`),
  
  getFavorites: () => 
    apiClient.get('/content/favorites'),
  
  addToFavorites: (contentId, contentType) => 
    apiClient.post('/content/favorites', { contentId, contentType }),
  
  removeFromFavorites: (contentId) => 
    apiClient.delete(`/content/favorites/${contentId}`),
};

// Servicios de usuario
export const userAPI = {
  getProfile: () => 
    apiClient.get('/user/profile'),
  
  updateProfile: (profileData) => 
    apiClient.put('/user/profile', profileData),
  
  getActivity: (params = {}) => 
    apiClient.get('/user/activity', { params }),
  
  getNotifications: (params = {}) => 
    apiClient.get('/user/notifications', { params }),
  
  markNotificationAsRead: (notificationId) => 
    apiClient.put(`/user/notifications/${notificationId}/read`),
  
  updatePushToken: (pushToken) => 
    apiClient.put('/user/push-token', { pushToken }),
  
  reportUser: (userId, reason) => 
    apiClient.post('/user/report', { userId, reason }),
  
  blockUser: (userId) => 
    apiClient.post('/user/block', { userId }),
  
  unblockUser: (userId) => 
    apiClient.delete(`/user/block/${userId}`),
};

// Servicios de ubicación
export const locationAPI = {
  detectCountry: () => 
    apiClient.get('/location/detect-country'),
  
  getCountries: () => 
    apiClient.get('/location/countries'),
  
  updateUserLocation: (locationData) => 
    apiClient.put('/user/location', locationData),
};

// Inicialización de la app
export const initializeApp = async () => {
  try {
    // Verificar conectividad
    const healthCheck = await apiClient.get('/health');
    console.log('✅ Conexión con backend establecida');
    
    return true;
  } catch (error) {
    console.warn('⚠️ Error conectando con backend:', error.message);
    return false;
  }
};

// Helper para manejar errores de red
export const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de error
    return {
      message: error.response.data?.message || 'Error del servidor',
      status: error.response.status,
      type: 'server_error'
    };
  } else if (error.request) {
    // La petición se hizo pero no hubo respuesta
    return {
      message: 'Sin conexión a internet',
      type: 'network_error'
    };
  } else {
    // Error en la configuración de la petición
    return {
      message: 'Error interno de la aplicación',
      type: 'client_error'
    };
  }
};

// Exportar cliente para uso directo si es necesario
export default apiClient;