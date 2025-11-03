const { v4: uuidv4 } = require('uuid');
const FedeAIService = require('../services/fedeAIService');
const FedeConversation = require('../models/FedeConversation');

class FedeController {
  constructor() {
    this.fedeService = new FedeAIService();
  }

  /**
   * Procesar mensaje enviado a Fede
   */
  async sendMessage(req, res) {
    const startTime = Date.now();

    try {
      const { message, sessionId } = req.body;
      const userId = req.user.id;

      // Validaciones
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje no puede estar vacío',
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje es demasiado largo (máximo 1000 caracteres)',
        });
      }

      // Generar sessionId si no existe
      const currentSessionId = sessionId || uuidv4();

      // Obtener historial de conversación
      const conversationHistory = await this.getConversationHistory(userId, currentSessionId);

      // Verificar si el mensaje está dentro del scope de Fede
      if (!this.fedeService.isWithinScope(message)) {
        const outOfScopeResponse = this.fedeService.getOutOfScopeResponse();

        // Guardar la conversación
        await this.saveConversation({
          userId,
          userMessage: message,
          fedeResponse: outOfScopeResponse,
          sessionId: currentSessionId,
          detectedCategory: 'fuera_de_scope',
          wasSuccessful: true,
          processingTime: Date.now() - startTime,
        });

        return res.json({
          success: true,
          message: outOfScopeResponse,
          sessionId: currentSessionId,
          isOutOfScope: true,
        });
      }

      // Procesar mensaje con Fede AI
      const aiResponse = await this.fedeService.processMessage(
        message,
        userId,
        conversationHistory,
      );

      if (!aiResponse.success) {
        return res.status(500).json({
          success: false,
          error: 'Error procesando el mensaje',
          details: aiResponse.error,
        });
      }

      // Guardar la conversación
      const conversation = await this.saveConversation({
        userId,
        userMessage: message,
        fedeResponse: aiResponse.message,
        sessionId: currentSessionId,
        knowledgeSources: aiResponse.sources || [],
        contextUsed: aiResponse.context,
        wasSuccessful: true,
        processingTime: Date.now() - startTime,
      });

      res.json({
        success: true,
        message: aiResponse.message,
        sessionId: currentSessionId,
        conversationId: conversation.id,
        sources: aiResponse.sources,
        processingTime: Date.now() - startTime,
      });
    } catch (error) {
      console.error('Error en sendMessage:', error);

      // Intentar guardar el error
      try {
        const userIdSafe = req.user && req.user.id ? req.user.id : null;
        const messageSafe = req.body && req.body.message ? req.body.message : '';
        const sessionIdSafe = req.body && req.body.sessionId ? req.body.sessionId : null;

        await this.saveConversation({
          userId: userIdSafe,
          userMessage: messageSafe,
          fedeResponse: 'Error procesando el mensaje',
          sessionId: sessionIdSafe,
          wasSuccessful: false,
          processingTime: Date.now() - startTime,
          metadata: { error: error.message },
        });
      } catch (saveError) {
        console.error('Error guardando conversación con error:', saveError);
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Disculpá, estoy teniendo dificultades técnicas. Intentá de nuevo en un momento.',
      });
    }
  }

  /**
   * Obtener historial de conversaciones
   */
  async getConversationHistory(userId, sessionId = null, limit = 10) {
    try {
      const conversations = await FedeConversation.getConversationHistory(
        userId,
        sessionId,
        limit,
      );

      return conversations.flatMap((conv) => conv.toHistoryFormat());
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Obtener historial para el frontend
   */
  async getHistory(req, res) {
    try {
      const { sessionId, limit = 20 } = req.query;
      const userId = req.user.id;

      const conversations = await FedeConversation.getConversationHistory(
        userId,
        sessionId,
        parseInt(limit, 10),
      );

      const formattedHistory = conversations.map((conv) => ({
        id: conv.id,
        userMessage: conv.userMessage,
        fedeResponse: conv.fedeResponse,
        timestamp: conv.createdAt,
        sessionId: conv.sessionId,
        rating: conv.userRating,
        category: conv.detectedCategory,
        sources: conv.knowledgeSources,
      }));

      res.json({
        success: true,
        history: formattedHistory,
        total: formattedHistory.length,
      });
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo historial de conversaciones',
      });
    }
  }

  /**
   * Calificar una respuesta de Fede
   */
  async rateResponse(req, res) {
    try {
      const { conversationId } = req.params;
      const { rating, feedback } = req.body;
      const userId = req.user.id;

      // Validaciones
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'La calificación debe ser entre 1 y 5',
        });
      }

      // Buscar la conversación
      const conversation = await FedeConversation.findOne({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Conversación no encontrada',
        });
      }

      // Actualizar calificación
      conversation.userRating = rating;
      if (feedback) {
        conversation.userFeedback = feedback;
      }
      await conversation.save();

      res.json({
        success: true,
        message: 'Calificación guardada exitosamente',
      });
    } catch (error) {
      console.error('Error calificando respuesta:', error);
      res.status(500).json({
        success: false,
        error: 'Error guardando calificación',
      });
    }
  }

  /**
   * Obtener estadísticas de una sesión
   */
  async getSessionStats(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      // Verificar que la sesión pertenece al usuario
      const sessionExists = await FedeConversation.findOne({
        where: { sessionId, userId },
      });

      if (!sessionExists) {
        return res.status(404).json({
          success: false,
          error: 'Sesión no encontrada',
        });
      }

      const stats = await FedeConversation.getSessionStats(sessionId);

      res.json({
        success: true,
        sessionId,
        stats,
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas de sesión',
      });
    }
  }

  /**
   * Crear nueva sesión de conversación
   */
  async createSession(req, res) {
    try {
      const sessionId = uuidv4();

      res.json({
        success: true,
        sessionId,
        message: 'Nueva sesión creada exitosamente',
      });
    } catch (error) {
      console.error('Error creando sesión:', error);
      res.status(500).json({
        success: false,
        error: 'Error creando nueva sesión',
      });
    }
  }

  /**
   * Guardar conversación en la base de datos
   */
  async saveConversation(data) {
    try {
      return await FedeConversation.create(data);
    } catch (error) {
      console.error('Error guardando conversación:', error);
      throw error;
    }
  }

  // ===== MÉTODOS ADMIN =====

  /**
   * Obtener configuración de Fede
   */
  async getConfiguration(req, res) {
    try {
      const config = await this.fedeService.getConfiguration();
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo configuración'
      });
    }
  }

  /**
   * Actualizar configuración de Fede
   */
  async updateConfiguration(req, res) {
    try {
      const { body: config } = req;
      await this.fedeService.updateConfiguration(config);
      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error actualizando configuración'
      });
    }
  }

  /**
   * Obtener estado del entrenamiento
   */
  async getTrainingStatus(req, res) {
    try {
      const status = await this.fedeService.getTrainingStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error obteniendo estado de entrenamiento:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estado de entrenamiento'
      });
    }
  }

  /**
   * Subir datos de entrenamiento
   */
  async uploadTrainingData(req, res) {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se han proporcionado archivos'
        });
      }

      const result = await this.fedeService.uploadTrainingData(files);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error subiendo datos de entrenamiento:', error);
      res.status(500).json({
        success: false,
        error: 'Error subiendo datos de entrenamiento'
      });
    }
  }

  /**
   * Iniciar entrenamiento
   */
  async startTraining(req, res) {
    try {
      const config = req.body;
      const result = await this.fedeService.startTraining(config);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error iniciando entrenamiento:', error);
      res.status(500).json({
        success: false,
        error: 'Error iniciando entrenamiento'
      });
    }
  }

  /**
   * Detener entrenamiento
   */
  async stopTraining(req, res) {
    try {
      await this.fedeService.stopTraining();
      res.json({
        success: true,
        message: 'Entrenamiento detenido exitosamente'
      });
    } catch (error) {
      console.error('Error deteniendo entrenamiento:', error);
      res.status(500).json({
        success: false,
        error: 'Error deteniendo entrenamiento'
      });
    }
  }

  /**
   * Exportar datos de entrenamiento
   */
  async exportTrainingData(req, res) {
    try {
      const data = await this.fedeService.exportTrainingData();
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({
        success: false,
        error: 'Error exportando datos'
      });
    }
  }

  /**
   * Obtener métricas de evaluación
   */
  async getEvaluationMetrics(req, res) {
    try {
      const metrics = await this.fedeService.getEvaluationMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo métricas'
      });
    }
  }

  /**
   * Obtener versiones del modelo
   */
  async getModelVersions(req, res) {
    try {
      const versions = await this.fedeService.getModelVersions();
      res.json({
        success: true,
        data: versions
      });
    } catch (error) {
      console.error('Error obteniendo versiones:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo versiones'
      });
    }
  }

  /**
   * Desplegar modelo
   */
  async deployModel(req, res) {
    try {
      const { versionId } = req.params;
      await this.fedeService.deployModel(versionId);
      res.json({
        success: true,
        message: 'Modelo desplegado exitosamente'
      });
    } catch (error) {
      console.error('Error desplegando modelo:', error);
      res.status(500).json({
        success: false,
        error: 'Error desplegando modelo'
      });
    }
  }

  /**
   * Probar mensaje
   */
  async testMessage(req, res) {
    try {
      const { message } = req.body;
      const startTime = Date.now();
      
      const response = await this.fedeService.generateResponse(message, [], {
        userId: 'test-admin',
        sessionId: 'test-session'
      });

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        message: response,
        processingTime
      });
    } catch (error) {
      console.error('Error probando mensaje:', error);
      res.status(500).json({
        success: false,
        error: 'Error probando mensaje'
      });
    }
  }
}

module.exports = new FedeController();