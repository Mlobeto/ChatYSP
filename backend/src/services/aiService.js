const { generateResponse } = require('../config/openai');
const { Message, User, Room } = require('../models');
const {
  getContextFromKnowledge,
  getConversationStarter,
  getReflectionPrompt,
} = require('./aiKnowledge');

class AIService {
  constructor() {
    this.conversationContexts = new Map(); // Store conversation contexts
    this.maxContextLength = 10; // Maximum messages to keep in context
  }

  /**
   * Generate AI response for a chat message
   */
  async generateChatResponse(content, roomId, userId) {
    try {
      // Get room context
      const room = await Room.findByPk(roomId, {
        attributes: ['name', 'description', 'settings'],
      });

      if (!room || !room.settings || !room.settings.aiEnabled) {
        throw new Error('AI no está habilitado en esta sala');
      }

      // Get user context
      const user = await User.findByPk(userId, {
        attributes: ['username', 'level'],
      });

      // Get recent conversation context
      const context = await this.getConversationContext(roomId);

      // Get coach knowledge context
      const coachContext = await getContextFromKnowledge(content);

      // Build enhanced system prompt with coach knowledge
      const systemPrompt = this.buildEnhancedSystemPrompt(room, user, context, coachContext);

      // Generate response
      const response = await generateResponse(content, systemPrompt);

      // Store this interaction in context
      this.updateConversationContext(roomId, {
        role: 'user',
        content,
        username: user.username,
      }, {
        role: 'assistant',
        content: response,
      });

      return {
        success: true,
        response,
        tokens: response.length, // Approximate token count
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message,
        response: 'Lo siento, no pude generar una respuesta en este momento.',
      };
    }
  }

  /**
   * Generate smart suggestions for message replies
   */
  // eslint-disable-next-line class-methods-use-this
  async generateSmartReplies(messageContent) {
    try {
      const prompt = `
        Basándote en este mensaje: "${messageContent}"
        
        Genera 3 respuestas sugeridas cortas y naturales en español estilo coaching ontológico.
        Las respuestas deben ser:
        - Máximo 50 caracteres cada una
        - Relevantes al contexto emocional
        - Una empática, una reflexiva, una motivadora
        
        Formato: respuesta1|respuesta2|respuesta3
      `;

      const response = await generateResponse(
        prompt,
        'Eres un coach ontológico que genera respuestas sugeridas empáticas.',
      );
      const suggestions = response.split('|').map((s) => s.trim()).slice(0, 3);

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      console.error('Smart replies error:', error);
      return {
        success: false,
        suggestions: ['👍', '¿Cómo te sentís?', 'Seguí adelante 💪'],
      };
    }
  }

  /**
   * Generate topic suggestions for conversations
   */
  // eslint-disable-next-line class-methods-use-this
  async generateTopicSuggestions() {
    try {
      // Get conversation starter from coach knowledge
      const starter = await getConversationStarter();

      const prompt = `
        Genera 4 temas de conversación inspiradores para un chat de crecimiento personal.
        Uno debe ser: "${starter}"
        
        Los otros 3 deben ser:
        - Preguntas que inviten a la reflexión profunda
        - Temas que conecten con el desarrollo personal
        - Formato: pregunta corta y directa
        
        Formato: tema1|tema2|tema3|tema4
      `;

      const response = await generateResponse(
        prompt,
        'Eres un facilitador de conversaciones de crecimiento personal.',
      );
      let topics = response.split('|').map((t) => t.trim());
      // Ensure we have at least some default topics
      if (topics.length < 4) {
        topics = [
          starter,
          '¿Qué te está enseñando este momento de tu vida?',
          '¿En qué área te gustaría crecer más?',
          '¿Qué hábito cambiarías si pudieras?',
        ];
      }

      return {
        success: true,
        topics: topics.slice(0, 4),
      };
    } catch (error) {
      console.error('Topic suggestions error:', error);
      return {
        success: false,
        topics: [
          '¿Qué te está moviendo hoy?',
          '¿Cuál fue tu mayor aprendizaje esta semana?',
          '¿En qué momento te sentís más conectado con vos mismo?',
          '¿Qué te gustaría que fuera diferente en tu vida?',
        ],
      };
    }
  }

  /**
   * Generate coaching-style reflection prompt
   */
  // eslint-disable-next-line class-methods-use-this
  async generateReflectionPrompt(userContent) {
    try {
      const reflectionBase = await getReflectionPrompt();

      const prompt = `
        Basándote en este mensaje: "${userContent}"
        Y usando esta base de reflexión: "${reflectionBase}"
        
        Genera una pregunta de coaching profunda que ayude a la persona a 
        reflexionar más allá de lo superficial.
        La pregunta debe:
        - Conectar con las emociones subyacentes
        - Invitar a ver desde una perspectiva más amplia
        - Generar insight personal
        - Ser específica al contexto pero universalmente humana
        
        Máximo 180 caracteres.
      `;

      const response = await generateResponse(
        prompt,
        'Eres un coach ontológico experto en generar preguntas transformadoras.',
      );

      return {
        success: true,
        reflection: response.trim(),
      };
    } catch (error) {
      console.error('Reflection prompt error:', error);
      return {
        success: false,
        reflection: '¿Qué te diría tu yo más sabio sobre esta situación?',
      };
    }
  }

  /**
   * Analyze emotional tone of a message
   */
  // eslint-disable-next-line class-methods-use-this
  async analyzeEmotionalTone(content) {
    try {
      const prompt = `
        Analiza el tono emocional de este mensaje: "${content}"
        
        Identifica:
        - Emoción principal (alegría, tristeza, miedo, enojo, confusión, esperanza, etc.)
        - Intensidad (baja, media, alta)
        - Necesidad subyacente (apoyo, validación, claridad, motivación, etc.)
        
        Formato: emocion,intensidad,necesidad
      `;

      const response = await generateResponse(
        prompt,
        'Eres un analista emocional experto en coaching ontológico.',
      );
      const [emotion, intensity, need] = response.split(',').map((s) => s.trim());

      const hasEmotionalContent = !['neutral', 'informativo', 'casual'].includes(
        emotion && emotion.toLowerCase ? emotion.toLowerCase() : 'neutral',
      );

      return {
        success: true,
        emotion,
        intensity,
        need,
        hasEmotionalContent,
      };
    } catch (error) {
      console.error('Emotional analysis error:', error);
      return {
        success: false,
        emotion: 'neutral',
        intensity: 'baja',
        need: 'conexión',
        hasEmotionalContent: false,
      };
    }
  }

  /**
   * Moderate message content
   */
  // eslint-disable-next-line class-methods-use-this
  async moderateContent(content) {
    try {
      const prompt = `
        Analiza este mensaje y determina si es apropiado para un chat de crecimiento personal:
        "${content}"
        
        Evalúa:
        - Lenguaje ofensivo o inapropiado
        - Spam o contenido repetitivo
        - Información personal sensible
        - Amenazas o acoso
        - Contenido que vaya contra principios de crecimiento personal
        
        Responde solo: APROPIADO o INAPROPIADO|razón
      `;

      const moderatorPrompt = 'Eres un moderador de contenido especializado en espacios '
        + 'de crecimiento personal.';
      const response = await generateResponse(prompt, moderatorPrompt);
      const [decision, reason] = response.split('|');

      return {
        isAppropriate: decision.trim().toUpperCase() === 'APROPIADO',
        reason: reason && reason.trim ? reason.trim() : null,
        confidence: 0.8,
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      // Default to allowing content if moderation fails
      return {
        isAppropriate: true,
        reason: null,
        confidence: 0.5,
      };
    }
  }

  /**
   * Get conversation context for a room
   */
  async getConversationContext(roomId) {
    try {
      // Try to get from memory first
      if (this.conversationContexts.has(roomId)) {
        return this.conversationContexts.get(roomId);
      }

      // Get recent messages from database
      const recentMessages = await Message.findAll({
        where: {
          roomId,
          isDeleted: false,
          messageType: ['text', 'ai'],
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['username'],
        }],
        order: [['createdAt', 'DESC']],
        limit: this.maxContextLength,
      });

      const context = recentMessages.reverse().map((msg) => ({
        role: msg.messageType === 'ai' ? 'assistant' : 'user',
        content: msg.content,
        username: msg.sender.username,
      }));

      this.conversationContexts.set(roomId, context);
      return context;
    } catch (error) {
      console.error('Get conversation context error:', error);
      return [];
    }
  }

  /**
   * Update conversation context
   */
  updateConversationContext(roomId, userMessage, aiMessage) {
    let context = this.conversationContexts.get(roomId) || [];

    // Add new messages
    context.push(userMessage, aiMessage);

    // Keep only recent messages
    if (context.length > this.maxContextLength) {
      context = context.slice(-this.maxContextLength);
    }

    this.conversationContexts.set(roomId, context);
  }

  /**
   * Build enhanced system prompt with coach knowledge
   */
  // eslint-disable-next-line class-methods-use-this
  buildEnhancedSystemPrompt(room, user, conversationContext, coachContext) {
    const basePrompt = `
      ${coachContext}
      
      Contexto actual de la sala:
      - Nombre: ${room.name}
      - Descripción: ${room.description || 'Espacio de conversación y crecimiento personal'}
      
      Usuario actual:
      - Nombre: ${user.username}
      - Nivel: ${user.level}
      
      Instrucciones para la interacción:
      - Mantené las respuestas entre 150-300 caracteres para facilitar la lectura en chat
      - Usá preguntas abiertas para fomentar la reflexión profunda
      - Evitá dar consejos directos; mejor ayudá a que la persona encuentre sus propias respuestas
      - Reconocé y validá las emociones de la persona antes de explorar perspectivas
      - Podés usar emojis con moderación para crear cercanía emocional
      - Si detectás que alguien necesita apoyo profesional especializado, sugerilo gentilmente
      - Enfocate en generar insight y transformación, no solo en resolver problemas superficiales
    `;

    // Add conversation context if available
    if (conversationContext.length > 0) {
      const contextStr = conversationContext
        .slice(-5) // Last 5 messages
        .map((msg) => `${msg.username || 'Coach'}: ${msg.content}`)
        .join('\n');

      const baseWithContext = `${basePrompt}\n\nFlujo de conversación reciente:\n${contextStr}\n\n`;
      const coherenceNote = 'Recordá mantener la coherencia con la personalidad del coach '
        + 'y el tono establecido.';
      return `${baseWithContext}${coherenceNote}`;
    }

    return basePrompt;
  }

  /**
   * Clear context for a room (useful for memory management)
   */
  clearRoomContext(roomId) {
    this.conversationContexts.delete(roomId);
  }

  /**
   * Get AI usage statistics
   */
  getUsageStats() {
    return {
      activeContexts: this.conversationContexts.size,
      totalContexts: Array.from(this.conversationContexts.values())
        .reduce((total, context) => total + context.length, 0),
    };
  }
}

// Create and export service instance
const aiService = new AIService();

module.exports = {
  generateChatResponse: aiService.generateChatResponse.bind(aiService),
  generateSmartReplies: aiService.generateSmartReplies.bind(aiService),
  generateTopicSuggestions: aiService.generateTopicSuggestions.bind(aiService),
  generateReflectionPrompt: aiService.generateReflectionPrompt.bind(aiService),
  analyzeEmotionalTone: aiService.analyzeEmotionalTone.bind(aiService),
  moderateContent: aiService.moderateContent.bind(aiService),
  clearRoomContext: aiService.clearRoomContext.bind(aiService),
  getUsageStats: aiService.getUsageStats.bind(aiService),
};
