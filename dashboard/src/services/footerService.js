import api from './api';

/**
 * Servicio para gestionar footers de tips diarios
 */
const footerService = {
  /**
   * Obtener todos los footers
   */
  async getAll() {
    try {
      const response = await api.get('/footers');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo footers:', error);
      throw error;
    }
  },

  /**
   * Obtener footers activos
   */
  async getActive() {
    try {
      const response = await api.get('/footers/active');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo footers activos:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de uso
   */
  async getStats() {
    try {
      const response = await api.get('/footers/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtener un footer por ID
   */
  async getById(id) {
    try {
      const response = await api.get(`/footers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo footer:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo footer
   */
  async create(footerData) {
    try {
      const response = await api.post('/footers', footerData);
      return response.data;
    } catch (error) {
      console.error('Error creando footer:', error);
      throw error;
    }
  },

  /**
   * Actualizar footer
   */
  async update(id, footerData) {
    try {
      const response = await api.put(`/footers/${id}`, footerData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando footer:', error);
      throw error;
    }
  },

  /**
   * Eliminar footer
   */
  async delete(id) {
    try {
      const response = await api.delete(`/footers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando footer:', error);
      throw error;
    }
  },
};

export default footerService;
