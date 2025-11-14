const fs = require('fs').promises;
const path = require('path');

class AIKnowledgeService {
  constructor() {
    this.knowledgeData = null;
    this.lastLoadTime = null;
    this.cacheExpiration = 5 * 60 * 1000; // 5 minutos en memoria
  }

  /**
   * Carga el conocimiento del coach desde el archivo JSON
   */
  async loadKnowledge() {
    try {
      const now = Date.now();

      // Si ya tenemos datos en cache y no han expirado, los usamos
      if (this.knowledgeData && this.lastLoadTime && (now - this.lastLoadTime) < this.cacheExpiration) {
        return this.knowledgeData;
      }

      const knowledgePath = path.join(__dirname, '../../data/fede_complete_knowledge.json');
      const fileContent = await fs.readFile(knowledgePath, 'utf8');
      this.knowledgeData = JSON.parse(fileContent);
      this.lastLoadTime = now;

      console.log('✅ Conocimiento del coach cargado exitosamente');
      return this.knowledgeData;
    } catch (error) {
      console.error('❌ Error cargando conocimiento del coach:', error.message);

      // Devolver conocimiento básico por defecto si falla la carga
      return this.getDefaultKnowledge();
    }
  }

  /**
   * Obtiene contexto relevante basado en el prompt del usuario
   */
  async getContextFromKnowledge(userPrompt = '', category = null) {
    try {
      const knowledge = await this.loadKnowledge();

      if (!knowledge) {
        return this.getDefaultContext();
      }

      // Generar contexto personalizado
      let context = this.buildPersonaContext(knowledge);

      // Agregar tips relevantes
      const relevantTips = this.findRelevantTips(knowledge, userPrompt, category);
      if (relevantTips.length > 0) {
        context += '\n\nAlgunos insights del coach que podrían ser útiles:\n';
        relevantTips.forEach((tip, index) => {
          context += `- ${tip.content}\n`;
        });
      }

      // Agregar principios centrales
      context += '\n\nPrincipios guía del coaching ontológico:\n';
      knowledge.core_principles.slice(0, 3).forEach((principle) => {
        context += `• ${principle}\n`;
      });

      // Agregar frases empoderadoras si el contexto lo amerita
      if (this.needsEmpowerment(userPrompt)) {
        const empoweringPhrase = this.getRandomItem(knowledge.empowering_phrases);
        context += `\nRecordá: ${empoweringPhrase}\n`;
      }

      return context;
    } catch (error) {
      console.error('Error obteniendo contexto:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Encuentra tips relevantes basados en el prompt del usuario
   */
  findRelevantTips(knowledge, userPrompt, category = null) {
    const prompt = userPrompt.toLowerCase();
    let relevantTips = [];

    // Si se especifica una categoría, filtrar por ella
    if (category) {
      relevantTips = knowledge.coaching_tips.filter((tip) => tip.category === category);
    } else {
      // Buscar por palabras clave en el contenido
      const keywords = {
        relaciones: ['relación', 'pareja', 'amor', 'soltar', 'ex', 'separación', 'ruptura'],
        autoestima: ['autoestima', 'valor', 'autoconfianza', 'inseguridad', 'valgo'],
        miedos: ['miedo', 'ansiedad', 'pánico', 'temor', 'nervioso', 'preocupado'],
        propósito: ['propósito', 'sentido', 'dirección', 'camino', 'vocación', 'misión'],
        decisiones: ['decisión', 'elegir', 'opción', 'dilema', 'qué hacer'],
      };

      for (const [cat, words] of Object.entries(keywords)) {
        const hasKeyword = words.some((word) => prompt.includes(word));
        if (hasKeyword) {
          const categoryTips = knowledge.coaching_tips.filter((tip) => tip.category === cat);
          relevantTips.push(...categoryTips);
        }
      }
    }

    // Si no encontramos tips específicos, tomar algunos aleatorios
    if (relevantTips.length === 0) {
      relevantTips = this.getRandomItems(knowledge.coaching_tips, 2);
    }

    // Limitar a máximo 3 tips para no sobrecargar el contexto
    return relevantTips.slice(0, 3);
  }

  /**
   * Construye el contexto de la persona del coach
   */
  buildPersonaContext(knowledge) {
    const coachInfo = knowledge.coach_info;
    return `Eres ${coachInfo.name}, un ${coachInfo.specialty.toLowerCase()} con un enfoque ${coachInfo.approach.toLowerCase()}. 

Tu estilo se caracteriza por usar ${coachInfo.style.toLowerCase()}. No das consejos directos, sino que guías a las personas a encontrar sus propias respuestas a través de preguntas poderosas y reflexiones profundas.

Usás un lenguaje cercano, empático y auténtico. Hablás en segunda persona del singular (vos/tu) con un tono cálido pero profesional. Evitás el lenguaje técnico innecesario y te enfocás en generar insight y transformación.`;
  }

  /**
   * Determina si el usuario necesita palabras de empoderamiento
   */
  needsEmpowerment(prompt) {
    const negativeIndicators = [
      'no puedo', 'es imposible', 'no sirvo', 'soy un fracaso',
      'no vale la pena', 'me siento mal', 'estoy deprimido',
      'todo está mal', 'no tengo esperanza',
    ];

    return negativeIndicators.some((indicator) => prompt.toLowerCase().includes(indicator));
  }

  /**
   * Obtiene un elemento aleatorio de un array
   */
  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Obtiene varios elementos aleatorios de un array
   */
  getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Contexto por defecto si falla la carga del archivo
   */
  getDefaultContext() {
    return `Eres un coach ontológico empático y motivador. Evitás dar consejos directos; hacés preguntas abiertas, fomentás la introspección y te enfocás en ayudar a las personas a encontrar sus propias respuestas.

Principios básicos:
• La acción imperfecta vale más que la espera perfecta
• El progreso real no se mide en velocidad, sino en consistencia
• Cada obstáculo es una oportunidad disfrazada de aprendizaje

Usás un lenguaje cercano y empático, hablás en segunda persona del singular (vos/tu) y te enfocás en generar insight y transformación personal.`;
  }

  /**
   * Conocimiento básico por defecto
   */
  getDefaultKnowledge() {
    return {
      coach_info: {
        name: 'Coach YSP',
        specialty: 'Coaching Ontológico',
        approach: 'Empático, motivador, no directivo',
        style: 'Preguntas abiertas, introspección, transformación personal',
      },
      core_principles: [
        'La acción imperfecta vale más que la espera perfecta',
        'El progreso real no se mide en velocidad, sino en consistencia',
        'Cada obstáculo es una oportunidad disfrazada de aprendizaje',
      ],
      coaching_tips: [],
      empowering_phrases: [
        'Tu experiencia es válida y valiosa',
        'Tenés todo lo que necesitás dentro tuyo',
        'Este momento difícil también va a pasar',
      ],
    };
  }

  /**
   * Obtiene una pregunta iniciadora de conversación
   */
  async getConversationStarter() {
    try {
      const knowledge = await this.loadKnowledge();
      return this.getRandomItem(knowledge.conversation_starters || [
        '¿Qué te está moviendo hoy?',
        '¿En qué momento de tu día te sentís más conectado con vos mismo?',
      ]);
    } catch (error) {
      return '¿Qué te está moviendo hoy?';
    }
  }

  /**
   * Obtiene una pregunta de reflexión
   */
  async getReflectionPrompt() {
    try {
      const knowledge = await this.loadKnowledge();
      return this.getRandomItem(knowledge.reflection_prompts || [
        'Tomate un momento para respirar profundo y conectar con lo que realmente sentís',
        '¿Qué te diría tu yo más sabio sobre esta situación?',
      ]);
    } catch (error) {
      return '¿Qué te diría tu yo más sabio sobre esta situación?';
    }
  }

  /**
   * Obtiene información de videos relevantes
   */
  async getRelevantVideos(category = null) {
    try {
      const knowledge = await this.loadKnowledge();
      const videos = knowledge.videos || [];

      // Por ahora devolvemos todos, pero se podría filtrar por categoría
      return videos.slice(0, 3); // Máximo 3 videos
    } catch (error) {
      return [];
    }
  }

  /**
   * Invalida el cache para forzar recarga del conocimiento
   */
  invalidateCache() {
    this.knowledgeData = null;
    this.lastLoadTime = null;
    console.log('🔄 Cache de conocimiento invalidado');
  }
}

// Exportar instancia singleton
const aiKnowledgeService = new AIKnowledgeService();

module.exports = {
  getContextFromKnowledge: aiKnowledgeService.getContextFromKnowledge.bind(aiKnowledgeService),
  getConversationStarter: aiKnowledgeService.getConversationStarter.bind(aiKnowledgeService),
  getReflectionPrompt: aiKnowledgeService.getReflectionPrompt.bind(aiKnowledgeService),
  getRelevantVideos: aiKnowledgeService.getRelevantVideos.bind(aiKnowledgeService),
  invalidateCache: aiKnowledgeService.invalidateCache.bind(aiKnowledgeService),
};
