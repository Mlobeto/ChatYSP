import api from './api';

/**
 * Servicio para gestionar Fede AI desde el dashboard
 */
export const fedeApi = {
  // Estadísticas y métricas
  async getStats() {
    try {
      const response = await api.get('/fede/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de Fede:', error);
      throw error;
    }
  },

  // Gestión de conversaciones
  async getConversations(params = {}) {
    try {
      const response = await api.get('/fede/admin/conversations', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      throw error;
    }
  },

  async getConversationDetails(conversationId) {
    try {
      const response = await api.get(`/fede/admin/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo detalles de conversación:', error);
      throw error;
    }
  },

  // Knowledge Base
  async getKnowledgeBase(params = {}) {
    try {
      const response = await api.get('/fede/admin/knowledge', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo knowledge base:', error);
      throw error;
    }
  },

  async uploadKnowledge(data) {
    try {
      const response = await api.post('/fede/admin/knowledge', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error subiendo contenido:', error);
      throw error;
    }
  },

  async updateKnowledge(id, data) {
    try {
      const response = await api.put(`/fede/admin/knowledge/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error actualizando contenido:', error);
      throw error;
    }
  },

  async deleteKnowledge(id) {
    try {
      const response = await api.delete(`/fede/admin/knowledge/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando contenido:', error);
      throw error;
    }
  },

  // Configuración de Fede
  async getConfiguration() {
    try {
      const response = await api.get('/fede/admin/config');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      throw error;
    }
  },

  async updateConfiguration(config) {
    try {
      const response = await api.put('/fede/admin/config', config);
      return response.data;
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw error;
    }
  },

  // Entrenamiento
  async uploadTrainingData(formData) {
    try {
      const response = await api.post('/fede/admin/training/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error subiendo datos de entrenamiento:', error);
      throw error;
    }
  },

  async trainModel(data) {
    try {
      const response = await api.post('/fede/admin/train', data);
      return response.data;
    } catch (error) {
      console.error('Error entrenando modelo:', error);
      throw error;
    }
  },

  async getTrainingStatus() {
    try {
      const response = await api.get('/fede/admin/training/status');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado de entrenamiento:', error);
      throw error;
    }
  },

  async getModelVersions() {
    try {
      const response = await api.get('/fede/admin/models');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo versiones de modelos:', error);
      throw error;
    }
  },

  async getEvaluationMetrics() {
    try {
      const response = await api.get('/fede/admin/metrics/evaluation');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo métricas de evaluación:', error);
      throw error;
    }
  },

  // Respuestas y ratings
  async getResponseAnalytics(params = {}) {
    try {
      const response = await api.get('/fede/admin/analytics/responses', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo analíticas de respuestas:', error);
      throw error;
    }
  },

  async getUserFeedback(params = {}) {
    try {
      const response = await api.get('/fede/admin/feedback', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo feedback de usuarios:', error);
      throw error;
    }
  },

  // Pruebas y testing
  async testMessage(message, sessionId = null) {
    try {
      const response = await api.post('/fede/admin/test', {
        message,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error('Error probando mensaje:', error);
      throw error;
    }
  },

  // Herramientas de diagnóstico
  async getDiagnostics() {
    try {
      const response = await api.get('/fede/admin/diagnostics');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo diagnósticos:', error);
      throw error;
    }
  },

  async checkHealth() {
    try {
      const response = await api.get('/fede/admin/health');
      return response.data;
    } catch (error) {
      console.error('Error verificando salud del sistema:', error);
      throw error;
    }
  },
};

export default fedeApi;