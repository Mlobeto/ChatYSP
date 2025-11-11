import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de Tips
export const tipsApi = {
  // Obtener todos los tips con filtros y paginación
  getAll: async (params = {}) => {
    const response = await api.get('/tips', { params });
    return response.data;
  },

  // Obtener un tip por ID
  getById: async (id) => {
    const response = await api.get(`/tips/${id}`);
    return response.data;
  },

  // Crear un nuevo tip
  create: async (tipData) => {
    const response = await api.post('/tips', tipData);
    return response.data;
  },

  // Actualizar un tip
  update: async (id, tipData) => {
    const response = await api.put(`/tips/${id}`, tipData);
    return response.data;
  },

  // Eliminar un tip
  delete: async (id) => {
    const response = await api.delete(`/tips/${id}`);
    return response.data;
  },

  // Buscar tips
  search: async (query, params = {}) => {
    const response = await api.get('/tips/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  }
};

// API de Usuarios (para obtener información del creador)
export const usersApi = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }
};

// API de Autenticación
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// API de Salas
export const roomsApi = {
  // Obtener todas las salas con filtros y paginación
  getAll: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    // El backend devuelve { success: true, rooms: [...], pagination: {...} }
    return response.data.rooms || [];
  },

  // Obtener una sala por ID
  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Crear nueva sala
  create: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Actualizar sala
  update: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Eliminar sala
  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },

  // Activar/desactivar sala
  toggleActive: async (id) => {
    const response = await api.patch(`/rooms/${id}/toggle-active`);
    return response.data;
  },

  // Unirse a una sala
  join: async (id, password = null) => {
    const response = await api.post(`/rooms/${id}/join`, { password });
    return response.data;
  },

  // Salir de una sala
  leave: async (id) => {
    const response = await api.post(`/rooms/${id}/leave`);
    return response.data;
  },

  // Obtener participantes de una sala
  getParticipants: async (id) => {
    const response = await api.get(`/rooms/${id}/participants`);
    return response.data;
  },

  // Obtener estadísticas de salas
  getStats: async () => {
    const response = await api.get('/rooms/stats');
    return response.data;
  }
};

// API de Salas de Juego
export const gameRoomsApi = {
  // Obtener todas las salas de juego con filtros y paginación
  getAll: async (params = {}) => {
    const response = await api.get('/gamerooms', { params });
    // El backend devuelve { success: true, gameRooms: [...], pagination: {...} }
    return response.data.gameRooms || [];
  },

  // Obtener una sala de juego por ID
  getById: async (id) => {
    const response = await api.get(`/gamerooms/${id}`);
    return response.data;
  },

  // Crear nueva sala de juego
  create: async (gameRoomData) => {
    const response = await api.post('/gamerooms', gameRoomData);
    return response.data;
  },

  // Actualizar sala de juego
  update: async (id, gameRoomData) => {
    const response = await api.put(`/gamerooms/${id}`, gameRoomData);
    return response.data;
  },

  // Eliminar sala de juego
  delete: async (id) => {
    const response = await api.delete(`/gamerooms/${id}`);
    return response.data;
  },

  // Unirse a una sala de juego
  join: async (id) => {
    const response = await api.post(`/gamerooms/${id}/join`);
    return response.data;
  },

  // Salir de una sala de juego
  leave: async (id) => {
    const response = await api.post(`/gamerooms/${id}/leave`);
    return response.data;
  },

  // Iniciar juego
  start: async (id) => {
    const response = await api.post(`/gamerooms/${id}/start`);
    return response.data;
  },

  // Obtener miembros de una sala de juego
  getMembers: async (id) => {
    const response = await api.get(`/gamerooms/${id}/members`);
    return response.data;
  },

  // Obtener estadísticas de salas de juego
  getStats: async (gameRoomId) => {
    const response = await api.get(`/gamerooms/${gameRoomId}/stats`);
    return response.data;
  }
};

// Exportar la instancia de axios por defecto
export default api;