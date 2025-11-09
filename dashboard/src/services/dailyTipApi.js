import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// API de Daily Tips
// ============================================

/**
 * Generar un nuevo tip diario
 */
export const generateDailyTip = async () => {
  const response = await api.post('/daily-tips/generate');
  return response.data;
};

/**
 * Obtener el tip de hoy
 */
export const getTodayTip = async () => {
  const response = await api.get('/daily-tips/today');
  return response.data;
};

/**
 * Regenerar el tip de hoy
 */
export const regenerateTodayTip = async () => {
  const response = await api.post('/daily-tips/regenerate');
  return response.data;
};

/**
 * Reenviar el tip de hoy por WhatsApp
 */
export const resendTodayTip = async () => {
  const response = await api.post('/daily-tips/resend');
  return response.data;
};

/**
 * Obtener historial de tips
 */
export const getTipsHistory = async (limit = 30) => {
  const response = await api.get('/daily-tips/history', {
    params: { limit }
  });
  return response.data;
};

/**
 * Obtener estadísticas de tips
 */
export const getTipsStats = async () => {
  const response = await api.get('/daily-tips/stats');
  return response.data;
};

/**
 * Verificar salud del sistema de tips diarios
 */
export const checkDailyTipsHealth = async () => {
  const response = await api.get('/daily-tips/health');
  return response.data;
};

/**
 * Cargar múltiples archivos TXT de tips
 */
export const uploadMultipleTips = async (files) => {
  const formData = new FormData();
  
  // Agregar todos los archivos
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const response = await api.post('/daily-tips/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export default {
  generateDailyTip,
  getTodayTip,
  regenerateTodayTip,
  resendTodayTip,
  getTipsHistory,
  getTipsStats,
  checkDailyTipsHealth,
  uploadMultipleTips,
};
