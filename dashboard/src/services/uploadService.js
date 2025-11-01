import axios from 'axios';

// Base URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instancia de axios para uploads
const uploadAPI = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token automáticamente
uploadAPI.interceptors.request.use(
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

export const uploadService = {
  // Upload de video con progreso
  uploadVideo: async (videoFile, videoData = {}, onProgress = null) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    
    // Agregar metadatos del video
    Object.keys(videoData).forEach(key => {
      if (videoData[key] !== undefined && videoData[key] !== null) {
        formData.append(key, videoData[key]);
      }
    });

    const response = await uploadAPI.post('/admin/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response;
  },

  // Upload de imagen/thumbnail
  uploadImage: async (imageFile, type = 'general', onProgress = null) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('type', type);

    const response = await uploadAPI.post('/admin/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response;
  },

  // Upload de archivo general
  uploadFile: async (file, type = 'document', onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await uploadAPI.post('/admin/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response;
  },

  // Eliminar archivo
  deleteFile: async (fileUrl) => {
    const response = await uploadAPI.delete('/admin/uploads/file', {
      data: { fileUrl },
    });
    return response;
  },

  // Obtener información de archivos subidos
  getUploadedFiles: async (params = {}) => {
    const { page = 1, limit = 20, type = '' } = params;
    const response = await uploadAPI.get('/admin/uploads', {
      params: { page, limit, type },
    });
    return response;
  },

  // Validar archivo antes de subir
  validateFile: (file, maxSize = 100 * 1024 * 1024, allowedTypes = []) => {
    const errors = [];

    // Validar tamaño
    if (file.size > maxSize) {
      errors.push(`El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`);
    }

    // Validar tipo
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Tipos de archivo permitidos
  allowedTypes: {
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },

  // Tamaños máximos recomendados
  maxSizes: {
    video: 500 * 1024 * 1024, // 500MB
    image: 10 * 1024 * 1024,  // 10MB
    document: 50 * 1024 * 1024, // 50MB
  },
};

export default uploadService;