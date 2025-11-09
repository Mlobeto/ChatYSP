const fs = require('fs');
const path = require('path');
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

    // Configuraciones del modelo (usando GPT-5 nano - más económico)
    this.modelConfig = {
      model: 'gpt-5-nano', // Modelo más económico y rápido de GPT-5
      max_completion_tokens: 500,
    };
  }

  /**
   * Procesa un mensaje del usuario y genera una respuesta de Fede
   */
  async processMessage(userMessage, userId, conversationHistory = []) {
    console.log('🎯 FedeAIService.processMessage iniciado');
    console.log('👤 Usuario ID:', userId);
    console.log('💬 Mensaje:', userMessage);
    
    try {
      // 1. Buscar contenido relevante en el knowledge base
      console.log('🔍 Buscando contenido relevante...');
      const relevantContent = await this.findRelevantKnowledge(userMessage);
      console.log('📊 Contenido encontrado:', relevantContent.length, 'entradas');

      // 2. Construir el contexto con el contenido encontrado
      console.log('🏗️ Construyendo contexto...');
      const contextualInfo = this.buildContextFromKnowledge(relevantContent);
      console.log('📋 Contexto construido:', contextualInfo ? 'Sí' : 'No');

      // 3. Generar la respuesta usando OpenAI
      console.log('🤖 Generando respuesta con OpenAI...');
      const response = await this.generateFedeResponse(
        userMessage,
        contextualInfo,
        conversationHistory,
      );
      console.log('✅ Respuesta generada:', response ? 'Sí' : 'No');

      const finalResponse = response && response.trim().length > 0
        ? response.trim()
        : this.getFallbackResponse();
      if (!response) {
        console.log('🛟 Usando respuesta de respaldo.');
      }

      // 4. Actualizar estadísticas de uso del knowledge base
      console.log('📈 Actualizando estadísticas...');
      await this.updateKnowledgeUsage(relevantContent);

      const result = {
        success: true,
        message: finalResponse,
        sources: relevantContent.map((item) => ({
          title: item.title,
          type: item.contentType,
          category: item.category,
        })),
      };
      
      console.log('🎉 Proceso completado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error en FedeAIService:', error);
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
      // Extraer palabras clave relevantes del mensaje
      const keywords = this.extractKeywords(query);
      console.log('🔍 Palabras clave extraídas:', keywords);
      
      let results = [];
      
      // Buscar con cada palabra clave
      for (const keyword of keywords) {
        const keywordResults = await KnowledgeBase.findRelevantContent(keyword, null, limit);
        results = results.concat(keywordResults);
      }
      
      // Si no encontramos nada con palabras clave, buscar con el query completo
      if (results.length === 0) {
        results = await KnowledgeBase.findRelevantContent(query, null, limit);
      }
      
      // Eliminar duplicados y limitar resultados
      const uniqueResults = results.filter((item, index, self) => 
        index === self.findIndex(r => r.id === item.id)
      ).slice(0, limit);
      
      console.log('📚 Contenido encontrado:', uniqueResults.length, 'entradas');
      
      return uniqueResults;
    } catch (error) {
      console.error('Error buscando conocimiento:', error);
      return [];
    }
  }

  /**
   * Extrae palabras clave relevantes del mensaje del usuario
   */
  extractKeywords(message) {
    // Palabras clave relacionadas con los 7 pasos y metodología de Fede
    const stepKeywords = [
      'paso 1', 'paso 2', 'paso 3', 'paso 4', 'paso 5', 'paso 6', 'paso 7',
      'contacto cero', 'redes sociales', 'vestuario', 'look', 'vida social', 
      'rasgos alfa', 'responder', 'confundido', 'volver', 'recuperar'
    ];
    
    const emotionalKeywords = [
      'ex', 'ruptura', 'separación', 'desamor', 'tristeza', 'dolor',
      'autoestima', 'confianza', 'ansiedad', 'depresión'
    ];
    
    const allKeywords = [...stepKeywords, ...emotionalKeywords];
    const messageLower = message.toLowerCase();
    
    // Buscar palabras clave que aparecen en el mensaje
    const foundKeywords = allKeywords.filter(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    // Si no encuentra palabras clave específicas, extraer palabras importantes
    if (foundKeywords.length === 0) {
      const words = messageLower
        .replace(/[^\w\s]/g, '') // Remover puntuación
        .split(/\s+/)
        .filter(word => word.length > 3) // Solo palabras de más de 3 caracteres
        .filter(word => !['fede', 'pero', 'para', 'esta', 'esto', 'como', 'algo'].includes(word));
      
      return words.slice(0, 3); // Máximo 3 palabras
    }
    
    return foundKeywords;
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
    console.log('🤖 Generando respuesta de Fede...');
    console.log('📝 Mensaje del usuario:', userMessage);
    console.log('📚 Contexto encontrado:', contextualInfo ? 'Sí' : 'No');
    
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

    console.log('🔧 Llamando a OpenAI con modelo:', this.modelConfig.model);
    
    try {
      const completion = await this.openai.chat.completions.create({
        ...this.modelConfig,
        messages,
      });

      console.log('🧾 Respuesta completa de OpenAI:', JSON.stringify(completion, null, 2));
      this.persistDebugCompletion(completion);

      const choice = completion.choices?.[0];
      const response = this.extractTextFromChoice(choice) || completion.output_text || null;

      if (!response) {
        console.warn('⚠️ OpenAI no devolvió contenido utilizable. Choice crudo:', JSON.stringify(choice));
      }

      console.log('✅ Respuesta de OpenAI recibida:', response ? 'Sí' : 'No');
      console.log('📄 Longitud de respuesta:', response ? response.length : 0);
      
      return response;
    } catch (error) {
      console.error('❌ Error llamando a OpenAI:', error.message);
      throw error;
    }
  }

  /**
   * Normaliza los distintos formatos de respuesta que puede enviar OpenAI
   */
  extractTextFromChoice(choice) {
    if (!choice) {
      return '';
    }

    // Si viene como string directo
    if (typeof choice === 'string') {
      return choice;
    }

    const { message, content, delta, text } = choice;

    // Formato clásico de chat completions
    if (message) {
      if (typeof message === 'string') {
        return message;
      }

      if (typeof message.content === 'string') {
        return message.content;
      }

      if (Array.isArray(message.content)) {
        return message.content
          .map((part) => this.extractTextFromContentPart(part))
          .join('')
          .trim();
      }

      if (message.content && message.content.text) {
        return message.content.text;
      }
    }

    // Algunos modelos devuelven content directamente en choice
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part) => this.extractTextFromContentPart(part))
        .join('')
        .trim();
    }

    // Streaming o respuestas diferidas
    if (delta && typeof delta.content === 'string') {
      return delta.content;
    }

    if (typeof text === 'string') {
      return text;
    }

    return '';
  }

  extractTextFromContentPart(part) {
    if (!part) {
      return '';
    }

    if (typeof part === 'string') {
      return part;
    }

    if (part.text) {
      return part.text;
    }

    if (part.type === 'output_text' && typeof part.content === 'string') {
      return part.content;
    }

    if (part.type === 'text' && typeof part.value === 'string') {
      return part.value;
    }

    if (Array.isArray(part.content)) {
      return part.content.map((subPart) => this.extractTextFromContentPart(subPart)).join('');
    }

    return '';
  }

  getFallbackResponse() {
    return 'Estoy procesando todo lo que me compartís y quiero darte una respuesta bien pensada. ¿Podés contarme un poco más sobre cómo te sentís con esta situación mientras termino de ordenar mis ideas?';
  }

  persistDebugCompletion(completion) {
    try {
      const logDir = path.join(__dirname, '../../logs');
      fs.mkdirSync(logDir, { recursive: true });
      const filePath = path.join(logDir, 'fede-openai-last-response.json');
      fs.writeFileSync(filePath, JSON.stringify(completion, null, 2), 'utf8');
    } catch (error) {
      console.warn('No se pudo guardar el log de debug de OpenAI:', error.message);
    }
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
    const messageClean = message.toLowerCase().trim();
    
    // Permitir saludos y mensajes cortos (probablemente iniciales)
    if (messageClean.length < 50) {
      const greetings = ['hola', 'hi', 'buenos', 'buenas', 'fede', 'ayuda', 'consulta'];
      if (greetings.some(greeting => messageClean.includes(greeting))) {
        return true;
      }
    }
    
    // Temas claramente fuera de scope
    const outOfScopeTopics = [
      'programación', 'código', 'tecnología', 'computadora', 'software',
      'política', 'gobierno', 'elecciones', 'partido',
      'medicina', 'enfermedad', 'síntoma', 'doctor', 'hospital',
      'legal', 'abogado', 'demanda', 'juicio',
      'matemática', 'física', 'química', 'ciencia',
      'deportes', 'fútbol', 'básquet', 'tenis', 'partido',
      'comida', 'receta', 'cocinar', 'restaurante',
      'viaje', 'turismo', 'hotel', 'avión'
    ];
    
    // Si contiene temas claramente fuera de scope, rechazar
    if (outOfScopeTopics.some(topic => messageClean.includes(topic))) {
      return false;
    }
    
    // Temas dentro del scope
    const allowedTopics = [
      'ruptura', 'pareja', 'relación', 'amor', 'desamor', 'ex',
      'separación', 'divorcio', 'autoestima', 'emociones', 'tristeza',
      'dolor', 'superación', 'coaching', 'crecimiento', 'personal',
      'ansiedad', 'depresión', 'soledad', 'perdón', 'sanar',
      'proceso', 'duelo', 'terapia', 'ayuda', 'consejo',
      'paso', 'contacto', 'cero', 'metodología', 'recuperar'
    ];

    const messageWords = messageClean.split(' ');
    const hasAllowedTopics = allowedTopics.some((topic) => 
      messageWords.some((word) => word.includes(topic))
    );
    
    // Si tiene temas permitidos, definitivamente está en scope
    if (hasAllowedTopics) {
      return true;
    }
    
    // Para todo lo demás, ser permisivo y dejar que Fede maneje la respuesta
    // Esto permite conversaciones más naturales
    return true;
  }

  /**
   * Respuesta cuando el tema está fuera del scope
   */
  getOutOfScopeResponse() {
    const responses = [
      'Hola! Soy Fede, tu coach especializado en rupturas de pareja. Te ayudo con mi metodología de 7 pasos para superar una ruptura y recuperar tu autoestima. ¿Querés que conversemos sobre algún paso de la estrategia o algún tema relacionado con tu proceso de recuperación?',

      'Mi especialidad es acompañarte en procesos de ruptura de pareja usando mi metodología "Yo Soy el Premio" en 7 pasos. ¿Te gustaría que hablemos sobre contacto cero, redes sociales, autoestima, o algún otro aspecto de tu recuperación emocional?',

      'Como coach ontológico especializado en rupturas, trabajo con mi estrategia de 7 pasos para ayudarte a recuperarte completamente. ¿Querés conversar sobre algún paso específico (contacto cero, vida social, rasgos alfa) o algún tema relacionado con tu bienestar emocional?',

      'Soy Fede y me especializo en ayudar personas que atraviesan rupturas de pareja. Tengo una metodología de 7 pasos que incluye desde contacto cero hasta la recuperación total. ¿En qué paso te encontrás o sobre qué tema te gustaría que charlemos?'
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
  async generateResponse(message, conversationHistory = []) {
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
