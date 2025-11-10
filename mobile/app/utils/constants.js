// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://chatysp.onrender.com/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://chatysp.onrender.com';

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  FAVORITE_TIPS: 'favoriteTips',
  READ_TIPS: 'readTips',
  VIDEO_PROGRESS: 'videoProgress',
  SEARCH_HISTORY: 'searchHistory',
  GAME_STATS: 'gameStats',
  APP_SETTINGS: 'appSettings',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'ChatYSP',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@chatysp.com',
  WEBSITE: 'https://chatysp.com',
  PRIVACY_POLICY: 'https://chatysp.com/privacy',
  TERMS_OF_SERVICE: 'https://chatysp.com/terms',
};

// UI Constants
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    500: '#10b981',
    600: '#059669',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  info: {
    500: '#0ea5e9',
    600: '#0284c7',
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SIZES = {
  // Padding & Margin
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,

  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
};

// Animation Durations
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_TIMEOUT: 3000,
  MESSAGE_LIMIT_PER_PAGE: 50,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

// Game Configuration
export const GAME_CONFIG = {
  CATEGORIES: [
    { id: 'general', name: 'Conocimiento General', icon: 'library' },
    { id: 'sports', name: 'Deportes', icon: 'football' },
    { id: 'history', name: 'Historia', icon: 'time' },
    { id: 'science', name: 'Ciencia', icon: 'flask' },
    { id: 'entertainment', name: 'Entretenimiento', icon: 'musical-notes' },
    { id: 'geography', name: 'Geografía', icon: 'earth' },
    { id: 'art', name: 'Arte y Literatura', icon: 'color-palette' },
    { id: 'technology', name: 'Tecnología', icon: 'laptop' },
  ],
  DIFFICULTIES: [
    { id: 'easy', name: 'Fácil', color: '#10b981', multiplier: 1 },
    { id: 'medium', name: 'Medio', color: '#f59e0b', multiplier: 1.5 },
    { id: 'hard', name: 'Difícil', color: '#ef4444', multiplier: 2 },
  ],
  DEFAULT_TIME_PER_QUESTION: 30,
  DEFAULT_QUESTIONS_COUNT: 10,
  MAX_PLAYERS: 20,
  POINTS_PER_CORRECT_ANSWER: 100,
  TIME_BONUS_MULTIPLIER: 0.1,
};

// Rooms Configuration
export const ROOMS_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MESSAGE_LIMIT_PER_PAGE: 30,
  MAX_ROOM_NAME_LENGTH: 50,
  MAX_ROOM_DESCRIPTION_LENGTH: 200,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
};

// Tips Configuration
export const TIPS_CONFIG = {
  CATEGORIES: [
    { id: 'motivation', name: 'Motivación', icon: 'flame', color: '#ef4444' },
    { id: 'productivity', name: 'Productividad', icon: 'trending-up', color: '#10b981' },
    { id: 'wellness', name: 'Bienestar', icon: 'heart', color: '#f59e0b' },
    { id: 'communication', name: 'Comunicación', icon: 'chatbubbles', color: '#3b82f6' },
    { id: 'leadership', name: 'Liderazgo', icon: 'people', color: '#8b5cf6' },
    { id: 'personal-growth', name: 'Crecimiento Personal', icon: 'trending-up', color: '#06b6d4' },
    { id: 'habits', name: 'Hábitos', icon: 'checkmark-circle', color: '#84cc16' },
    { id: 'mindset', name: 'Mentalidad', icon: 'bulb', color: '#f97316' },
  ],
  MAX_FAVORITES: 100,
  VIDEO_PROGRESS_THRESHOLD: 0.8, // 80% para marcar como visto
  MAX_SEARCH_HISTORY: 10,
};

// Countries with flags (for rooms)
export const COUNTRIES = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  USER_NOT_FOUND: 'Usuario no encontrado.',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado.',
  WEAK_PASSWORD: 'La contraseña es muy débil.',
  INVALID_EMAIL: 'Email inválido.',
  REQUIRED_FIELD: 'Este campo es requerido.',
  FILE_TOO_LARGE: 'El archivo es muy grande.',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido.',
  PERMISSION_DENIED: 'Permiso denegado.',
  LOCATION_UNAVAILABLE: 'Ubicación no disponible.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
  REGISTER_SUCCESS: 'Cuenta creada exitosamente.',
  PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  MESSAGE_SENT: 'Mensaje enviado.',
  ROOM_JOINED: 'Te has unido a la sala.',
  ROOM_LEFT: 'Has salido de la sala.',
  GAME_STARTED: 'Juego iniciado.',
  TIP_FAVORITED: 'Tip agregado a favoritos.',
  TIP_UNFAVORITED: 'Tip removido de favoritos.',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  
  // Chat
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  
  // Rooms
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  ROOM_MESSAGE: 'room_message',
  ROOM_USER_COUNT: 'room_user_count',
  
  // Games
  CREATE_GAME: 'create_game',
  JOIN_GAME: 'join_game',
  GAME_STARTED: 'game_started',
  NEW_QUESTION: 'new_question',
  SUBMIT_ANSWER: 'submit_answer',
  QUESTION_RESULTS: 'question_results',
  GAME_ENDED: 'game_ended',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  
  // General
  ERROR: 'error',
  USER_CONNECTED: 'user_connected',
  USER_DISCONNECTED: 'user_disconnected',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  ROOM_MESSAGE: 'room_message',
  GAME_INVITATION: 'game_invitation',
  GAME_START: 'game_start',
  TIP_REMINDER: 'tip_reminder',
  ACHIEVEMENT: 'achievement',
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  IMAGE_COMPRESSION_QUALITY: 0.8,
  VIDEO_COMPRESSION_QUALITY: 'medium',
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  STORAGE_KEYS,
  APP_CONFIG,
  COLORS,
  FONTS,
  SIZES,
  ANIMATIONS,
  CHAT_CONFIG,
  GAME_CONFIG,
  ROOMS_CONFIG,
  TIPS_CONFIG,
  COUNTRIES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SOCKET_EVENTS,
  NOTIFICATION_TYPES,
  UPLOAD_CONFIG,
};