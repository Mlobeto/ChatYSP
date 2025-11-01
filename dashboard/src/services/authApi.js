import axios from 'axios';

// Base URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instancia de axios para autenticación
const authAPI = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token automáticamente
authAPI.interceptors.request.use(
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
authAPI.interceptors.response.use(
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

export const authApi = {
  // Login de administrador
  login: async (credentials) => {
    const response = await authAPI.post('/auth/login', credentials);
    return response;
  },

  // Registro (solo para desarrollo)
  register: async (userData) => {
    const response = await authAPI.post('/auth/register', userData);
    return response;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await authAPI.get('/auth/me');
    return response;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await authAPI.put('/auth/profile', profileData);
    return response;
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    const response = await authAPI.put('/auth/change-password', passwordData);
    return response;
  },

  // Logout (opcional - solo limpia el token del lado del cliente)
  logout: () => {
    localStorage.removeItem('admin_token');
    return Promise.resolve();
  },
};

export default authAPI;