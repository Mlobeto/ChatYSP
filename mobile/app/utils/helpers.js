import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { COUNTRIES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

// ===============================
// Date & Time Helpers
// ===============================

/**
 * Formatea una fecha relativa (ej: "hace 5 minutos", "ayer", etc.)
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Ahora';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays}d`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  }

  const years = Math.floor(diffInDays / 365);
  return `Hace ${years} año${years > 1 ? 's' : ''}`;
};

/**
 * Formatea tiempo de duración (ej: "5:30" para 5 minutos 30 segundos)
 */
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formatea fecha para mostrar (ej: "15 de marzo, 2024")
 */
export const formatDisplayDate = (date) => {
  const targetDate = new Date(date);
  return targetDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formatea hora para mostrar (ej: "14:30")
 */
export const formatDisplayTime = (date) => {
  const targetDate = new Date(date);
  return targetDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ===============================
// String Helpers
// ===============================

/**
 * Trunca un texto a una longitud específica
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Limpia y formatea un texto de entrada
 */
export const cleanText = (text) => {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Extrae initiales de un nombre
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// ===============================
// Validation Helpers
// ===============================

/**
 * Valida formato de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida fortaleza de contraseña
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength,
    strength: {
      length: password.length >= minLength,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      numbers: hasNumbers,
      specialChar: hasSpecialChar,
    },
    score: [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length,
  };
};

/**
 * Valida número de teléfono básico
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone);
};

// ===============================
// Storage Helpers
// ===============================

/**
 * Guarda datos en AsyncStorage de forma segura
 */
export const saveToStorage = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
};

/**
 * Lee datos de AsyncStorage
 */
export const getFromStorage = async (key, defaultValue = null) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : defaultValue;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return defaultValue;
  }
};

/**
 * Elimina datos de AsyncStorage
 */
export const removeFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
};

/**
 * Limpia todo el AsyncStorage
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// ===============================
// UI Helpers
// ===============================

/**
 * Muestra alerta de éxito
 */
export const showSuccessAlert = (message = SUCCESS_MESSAGES.DEFAULT) => {
  Alert.alert('Éxito', message, [{ text: 'OK' }]);
};

/**
 * Muestra alerta de error
 */
export const showErrorAlert = (message = ERROR_MESSAGES.SERVER_ERROR) => {
  Alert.alert('Error', message, [{ text: 'OK' }]);
};

/**
 * Muestra alerta de confirmación
 */
export const showConfirmAlert = (title, message, onConfirm, onCancel = null) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancelar', style: 'cancel', onPress: onCancel },
      { text: 'Confirmar', style: 'destructive', onPress: onConfirm },
    ]
  );
};

/**
 * Genera un color basado en un string (para avatares)
 */
export const generateColorFromString = (str) => {
  if (!str) return '#6b7280';
  
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// ===============================
// Geography Helpers
// ===============================

/**
 * Obtiene información de país por código
 */
export const getCountryInfo = (countryCode) => {
  return COUNTRIES.find(country => country.code === countryCode);
};

/**
 * Obtiene información de país por nombre
 */
export const getCountryByName = (countryName) => {
  return COUNTRIES.find(country => 
    country.name.toLowerCase() === countryName.toLowerCase()
  );
};

/**
 * Obtiene emoji de bandera por país
 */
export const getCountryFlag = (countryName) => {
  const country = getCountryByName(countryName);
  return country ? country.flag : '🌍';
};

// ===============================
// File Helpers
// ===============================

/**
 * Formatea tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtiene extensión de archivo
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Verifica si es archivo de imagen
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * Verifica si es archivo de video
 */
export const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'];
  const extension = getFileExtension(filename).toLowerCase();
  return videoExtensions.includes(extension);
};

// ===============================
// Array Helpers
// ===============================

/**
 * Mezcla array aleatoriamente
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Elimina duplicados de un array
 */
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  return array.filter((item, index, self) =>
    index === self.findIndex(t => t[key] === item[key])
  );
};

/**
 * Ordena array por múltiples criterios
 */
export const sortByMultiple = (array, ...sortKeys) => {
  return array.sort((a, b) => {
    for (const key of sortKeys) {
      const direction = key.startsWith('-') ? -1 : 1;
      const prop = key.replace(/^-/, '');
      
      if (a[prop] < b[prop]) return -1 * direction;
      if (a[prop] > b[prop]) return 1 * direction;
    }
    return 0;
  });
};

// ===============================
// Game Helpers
// ===============================

/**
 * Calcula puntuación basada en tiempo y dificultad
 */
export const calculateScore = (isCorrect, timeToAnswer, maxTime, difficulty = 'medium') => {
  if (!isCorrect) return 0;
  
  const basePoints = 100;
  const timeBonus = Math.max(0, ((maxTime - timeToAnswer) / maxTime) * 50);
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  }[difficulty] || 1;
  
  return Math.round((basePoints + timeBonus) * difficultyMultiplier);
};

/**
 * Determina nivel basado en puntuación total
 */
export const getUserLevel = (totalScore) => {
  const levels = [
    { min: 0, max: 999, name: 'Novato', icon: 'leaf' },
    { min: 1000, max: 4999, name: 'Aprendiz', icon: 'school' },
    { min: 5000, max: 14999, name: 'Competente', icon: 'checkmark-circle' },
    { min: 15000, max: 29999, name: 'Experto', icon: 'star' },
    { min: 30000, max: 49999, name: 'Maestro', icon: 'trophy' },
    { min: 50000, max: Infinity, name: 'Leyenda', icon: 'flame' },
  ];
  
  return levels.find(level => totalScore >= level.min && totalScore <= level.max);
};

// ===============================
// Error Handling
// ===============================

/**
 * Maneja errores de API de forma uniforme
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    const message = error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR;
    return { message, status: error.response.status };
  } else if (error.request) {
    // Error de red
    return { message: ERROR_MESSAGES.NETWORK_ERROR, status: 0 };
  } else {
    // Error general
    return { message: ERROR_MESSAGES.SERVER_ERROR, status: -1 };
  }
};

/**
 * Log de errores para debugging
 */
export const logError = (error, context = '') => {
  if (__DEV__) {
    console.error(`Error in ${context}:`, error);
  }
  
  // Aquí podrías enviar el error a un servicio de logging como Sentry
  // Sentry.captureException(error, { tags: { context } });
};

// ===============================
// Device Helpers
// ===============================

/**
 * Detecta si es tablet
 */
export const isTablet = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const aspectRatio = width / height;
  return Math.min(width, height) >= 600 && (aspectRatio > 1.2 && aspectRatio < 2.0);
};

/**
 * Obtiene orientación del dispositivo
 */
export const getOrientation = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  return width > height ? 'landscape' : 'portrait';
};

// ===============================
// Export all helpers
// ===============================

export default {
  // Date & Time
  formatRelativeTime,
  formatDuration,
  formatDisplayDate,
  formatDisplayTime,
  
  // String
  truncateText,
  capitalizeWords,
  cleanText,
  getInitials,
  
  // Validation
  isValidEmail,
  validatePassword,
  isValidPhone,
  
  // Storage
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearStorage,
  
  // UI
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
  generateColorFromString,
  
  // Geography
  getCountryInfo,
  getCountryByName,
  getCountryFlag,
  
  // File
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  
  // Array
  shuffleArray,
  removeDuplicates,
  sortByMultiple,
  
  // Game
  calculateScore,
  getUserLevel,
  
  // Error
  handleApiError,
  logError,
  
  // Device
  isTablet,
  getOrientation,
};