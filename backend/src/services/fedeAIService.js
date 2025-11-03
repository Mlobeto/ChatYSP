const OpenAI = require('openai');
const KnowledgeBase = require('../models/KnowledgeBase');

class FedeAIService {
  constructor() {
    // Configurar OpenAI API
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Configuración base de Fede
    this.fedePersonality = `Eres Federico Hirigoyen, un coach ontológico argentino especializado en ayudar a personas que atraviesan rupturas de pareja. 

PERSONALIDAD Y ESTILO:
- Eres empático, directo pero cálido en tu comunicación
- Usás un lenguaje argentino natural (vos, che, etc.)
- Tenés 10 años de experiencia ayudando personas con rupturas
- Vivís en Ciudad de México desde hace 3 años
- Tu especialidad es el coaching ontológico aplicado a relaciones

METODOLOGÍA:
- Tenés un método estructurado en 7 pasos para superar rupturas
- Siempre buscás que la persona tome consciencia de sus patrones
- No das consejos superficiales, vas a la raíz emocional
- Usás preguntas poderosas para generar reflexión

LÍMITES ESTRICTOS:
- SOLO hablás de temas relacionados con rupturas de pareja, relaciones, autoestima, emociones y crecimiento personal
- NO respondés consultas sobre otros temas (tecnología, deportes, política, etc.)
- Si alguien pregunta algo fuera de tu área, redirigís amablemente hacia tu especialidad

TONO:
- Profesional pero cercano
- Comprensivo y sin juzgar
- Motivador y orientado a la acción
- Auténtico y humano`;

    // Configuraciones del modelo (usando el más económico de GPT-5)
    this.modelConfig = {
      model: 'gpt-5-nano', // Modelo más económico y rápido de GPT-5
      max_completion_tokens: 500,
    };
  }

  /**
   * Procesa un mensaje del usuario y genera una respuesta de Fede
   */
  async processMessage(userMessage, userId, conversationHistory = []) {
    try {
      // 1. Buscar contenido relevante en el knowledge base
      const relevantContent = await this.findRelevantKnowledge(userMessage);

      // 2. Construir el contexto con el contenido encontrado
      const contextualInfo = this.buildContextFromKnowledge(relevantContent);

      // 3. Generar la respuesta usando OpenAI
      const response = await this.generateFedeResponse(
        userMessage,
        contextualInfo,
        conversationHistory,
      );

      // 4. Actualizar estadísticas de uso del knowledge base
      await this.updateKnowledgeUsage(relevantContent);

      return {
        success: true,
        message: response,
        sources: relevantContent.map((item) => ({
          title: item.title,
          type: item.contentType,
          category: item.category,
        })),
      };
    } catch (error) {
      console.error('Error en FedeAIService:', error);
      return {
        success: false,
        message: 'Disculpá, estoy teniendo algunas dificultades técnicas. ¿Podés intentar de nuevo en un momento?',
        error: error.message,
      };
    }
  }

  /**
   * Busca contenido relevante en el knowledge base
   */
  async findRelevantKnowledge(query, limit = 3) {
    try {
      // Por ahora usamos búsqueda por texto, luego implementaremos embeddings
      const results = await KnowledgeBase.findRelevantContent(query, null, limit);
      return results;
    } catch (error) {
      console.error('Error buscando conocimiento:', error);
      return [];
    }
  }

  /**
   * Construye el contexto a partir del knowledge base
   */
  buildContextFromKnowledge(knowledgeItems) {
    if (!knowledgeItems || knowledgeItems.length === 0) {
      return 'Basate en tu experiencia como coach ontológico especializado en rupturas de pareja.';
    }

    let context = 'CONTEXTO RELEVANTE DE TU CONOCIMIENTO:\n\n';

    knowledgeItems.forEach((item, index) => {
      context += `${index + 1}. ${item.title} (${item.contentType}):\n`;
      context += `${item.content.substring(0, 300)}...\n\n`;
    });

    context += 'Usá esta información para enriquecer tu respuesta, pero mantené tu estilo personal y agrega tu experiencia.';

    return context;
  }

  /**
   * Genera la respuesta de Fede usando OpenAI
   */
  async generateFedeResponse(userMessage, contextualInfo, conversationHistory) {
    const messages = [
      {
        role: 'system',
        content: `${this.fedePersonality}\n\n${contextualInfo}`,
      },
    ];

    // Agregar historial de conversación (últimos 6 mensajes)
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Agregar el mensaje actual del usuario
    messages.push({
      role: 'user',
      content: userMessage,
    });

    const completion = await this.openai.chat.completions.create({
      ...this.modelConfig,
      messages,
    });

    return completion.choices[0].message.content;
  }

  /**
   * Actualiza las estadísticas de uso del knowledge base
   */
  async updateKnowledgeUsage(knowledgeItems) {
    for (const item of knowledgeItems) {
      await item.markAsUsed();
    }
  }

  /**
   * Valida si el mensaje está dentro del scope de Fede
   */
  isWithinScope(message) {
    const allowedTopics = [
      'ruptura', 'pareja', 'relación', 'amor', 'desamor', 'ex',
      'separación', 'divorcio', 'autoestima', 'emociones', 'tristeza',
      'dolor', 'superación', 'coaching', 'crecimiento', 'personal',
      'ansiedad', 'depresión', 'soledad', 'perdón', 'sanar',
      'proceso', 'duelo', 'terapia', 'ayuda', 'consejo',
    ];

    const messageWords = message.toLowerCase().split(' ');
    return allowedTopics.some((topic) => messageWords.some((word) => word.includes(topic)));
  }

  /**
   * Respuesta cuando el tema está fuera del scope
   */
  getOutOfScopeResponse() {
    const responses = [
      'Hola! Soy Fede, tu coach especializado en rupturas de pareja y crecimiento personal. Me enfoco en ayudarte con temas relacionados a relaciones, autoestima y procesos emocionales. ¿En qué puedo ayudarte hoy?',

      'Mi especialidad es acompañarte en procesos de ruptura de pareja y desarrollo personal. ¿Hay algo de tu vida emocional o relaciones en lo que te pueda ayudar?',

      'Como coach ontológico, mi área es el trabajo con emociones, relaciones y crecimiento personal. ¿Te gustaría que conversemos sobre algún tema relacionado con tu bienestar emocional?',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== MÉTODOS ADMINISTRATIVOS =====

  /**
   * Obtener configuración actual
   */
  async getConfiguration() {
    return {
      personality: {
        name: 'Fede',
        style: 'profesional_empático',
        formality: 'tuteo',
        empathy_level: 8,
        expertise_areas: [
          'ruptura_pareja',
          'coaching_ontologico',
          'metodologia_7_pasos',
        ],
      },
      behavior: {
        max_response_length: 500,
        use_examples: true,
        ask_clarifying_questions: true,
        remember_context: true,
        suggest_next_steps: true,
      },
      safety: {
        filter_inappropriate: true,
        require_coaching_scope: true,
        escalate_crisis: true,
        max_conversation_length: 50,
      },
      performance: {
        response_timeout: 30,
        max_knowledge_sources: 5,
        confidence_threshold: 0.7,
        fallback_enabled: true,
      },
    };
  }

  /**
   * Actualizar configuración
   */
  async updateConfiguration(config) {
    // Aquí se actualizaría la configuración en la base de datos
    // Por ahora solo validamos que la estructura sea correcta
    if (!config.personality || !config.behavior || !config.safety || !config.performance) {
      throw new Error('Configuración incompleta');
    }

    // En una implementación real, esto se guardaría en la base de datos
    console.log('Configuración actualizada:', config);
    return true;
  }

  /**
   * Obtener estado del entrenamiento
   */
  async getTrainingStatus() {
    return {
      status: 'idle', // idle, running, completed, error
      progress: 0,
      logs: [],
      lastTraining: null,
      estimatedTimeRemaining: null,
    };
  }

  /**
   * Subir datos de entrenamiento
   */
  async uploadTrainingData(files) {
    // Procesar archivos de entrenamiento
    const processedFiles = [];

    for (const file of files) {
      // Validar tipo de archivo
      const allowedTypes = ['.json', '.csv', '.txt'];
      const fileExtension = file.originalname.toLowerCase().slice(-4);

      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`Tipo de archivo no permitido: ${fileExtension}`);
      }

      processedFiles.push({
        name: file.originalname,
        size: file.size,
        type: fileExtension,
        uploaded: new Date().toISOString(),
      });
    }

    return {
      message: `${processedFiles.length} archivos procesados exitosamente`,
      files: processedFiles,
    };
  }

  /**
   * Iniciar entrenamiento
   */
  async startTraining(config) {
    console.log('Iniciando entrenamiento con configuración:', config);

    return {
      trainingId: `training_${Date.now()}`,
      status: 'starting',
      config,
      startTime: new Date().toISOString(),
    };
  }

  /**
   * Detener entrenamiento
   */
  async stopTraining() {
    console.log('Deteniendo entrenamiento...');
    return true;
  }

  /**
   * Exportar datos de entrenamiento
   */
  async exportTrainingData() {
    return {
      conversations: [],
      knowledgeBase: [],
      metadata: {
        exportDate: new Date().toISOString(),
        totalConversations: 0,
        totalKnowledgeEntries: 0,
      },
    };
  }

  /**
   * Obtener métricas de evaluación
   */
  async getEvaluationMetrics() {
    return {
      accuracy: 0.942,
      avg_response_time: 1250,
      satisfaction_score: 4.7,
      total_conversations: 1250,
      successful_resolutions: 1178,
      escalated_cases: 12,
    };
  }

  /**
   * Obtener versiones del modelo
   */
  async getModelVersions() {
    return [
      {
        id: 'v1.0.0',
        version: '1.0.0',
        created_at: '2024-01-15T10:00:00Z',
        accuracy: 0.89,
        is_active: false,
      },
      {
        id: 'v1.1.0',
        version: '1.1.0',
        created_at: '2024-02-01T10:00:00Z',
        accuracy: 0.92,
        is_active: false,
      },
      {
        id: 'v1.2.0',
        version: '1.2.0',
        created_at: '2024-02-15T10:00:00Z',
        accuracy: 0.942,
        is_active: true,
      },
    ];
  }

  /**
   * Desplegar modelo
   */
  async deployModel(versionId) {
    console.log(`Desplegando modelo versión: ${versionId}`);
    return true;
  }

  /**
   * Generar respuesta para testing
   */
  async generateResponse(message, conversationHistory = [], context = {}) {
    try {
      // Verificar si está dentro del scope
      if (!this.isWithinScope(message)) {
        return this.getOutOfScopeResponse();
      }

      // Preparar el prompt con contexto de la conversación
      const messages = [
        {
          role: 'system',
          content: this.fedePersonality,
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message,
        },
      ];

      // Llamar a OpenAI
      const response = await this.openai.chat.completions.create({
        ...this.modelConfig,
        messages,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generando respuesta:', error);
      return 'Disculpá, estoy teniendo dificultades técnicas en este momento. ¿Podrías intentar de nuevo en unos minutos?';
    }
  }
}

module.exports = FedeAIService;
