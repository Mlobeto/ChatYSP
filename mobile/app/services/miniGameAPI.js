import api from './api';

// Preguntas locales por si no hay conexión
const LOCAL_QUESTIONS = {
  general: [
    {
      id: 1,
      question: "¿Cuál es la capital de Francia?",
      options: ["Londres", "Berlin", "París", "Madrid"],
      correctAnswer: 2,
      category: "general",
      difficulty: "easy",
      explanation: "París es la capital y ciudad más poblada de Francia."
    },
    {
      id: 2,
      question: "¿En qué año llegó el hombre a la luna?",
      options: ["1967", "1969", "1971", "1973"],
      correctAnswer: 1,
      category: "general",
      difficulty: "medium",
      explanation: "Neil Armstrong y Buzz Aldrin llegaron a la luna el 20 de julio de 1969."
    },
    {
      id: 3,
      question: "¿Cuál es el planeta más grande del sistema solar?",
      options: ["Saturno", "Júpiter", "Urano", "Neptuno"],
      correctAnswer: 1,
      category: "general",
      difficulty: "easy",
      explanation: "Júpiter es el planeta más grande con un diámetro de aproximadamente 142,984 km."
    },
    {
      id: 4,
      question: "¿Quién escribió 'Cien años de soledad'?",
      options: ["Mario Vargas Llosa", "Gabriel García Márquez", "Pablo Neruda", "Jorge Luis Borges"],
      correctAnswer: 1,
      category: "general",
      difficulty: "medium",
      explanation: "Gabriel García Márquez escribió esta obra maestra del realismo mágico en 1967."
    },
    {
      id: 5,
      question: "¿Cuál es la fórmula química del agua?",
      options: ["CO2", "H2O", "O2", "NaCl"],
      correctAnswer: 1,
      category: "general",
      difficulty: "easy",
      explanation: "El agua está compuesta por dos átomos de hidrógeno y uno de oxígeno (H2O)."
    }
  ],
  
  coaching: [
    {
      id: 6,
      question: "¿Cuál es la primera regla del coaching efectivo?",
      options: ["Dar consejos", "Escuchar activamente", "Resolver problemas", "Juzgar al cliente"],
      correctAnswer: 1,
      category: "coaching",
      difficulty: "medium",
      explanation: "La escucha activa es fundamental para entender las necesidades del cliente."
    },
    {
      id: 7,
      question: "¿Qué significa SMART en los objetivos de coaching?",
      options: ["Inteligente", "Específico, Medible, Alcanzable, Relevante, Temporal", "Simple", "Sistemático"],
      correctAnswer: 1,
      category: "coaching",
      difficulty: "hard",
      explanation: "SMART es un acrónimo para objetivos bien definidos y alcanzables."
    },
    {
      id: 8,
      question: "¿Cuál es el principal beneficio de hacer preguntas poderosas?",
      options: ["Mostrar conocimiento", "Facilitar la reflexión", "Acelerar el proceso", "Controlar la conversación"],
      correctAnswer: 1,
      category: "coaching",
      difficulty: "medium",
      explanation: "Las preguntas poderosas ayudan al cliente a reflexionar y encontrar sus propias respuestas."
    }
  ],
  
  wellness: [
    {
      id: 9,
      question: "¿Cuántos minutos de ejercicio recomienda la OMS por semana?",
      options: ["75 minutos", "150 minutos", "200 minutos", "300 minutos"],
      correctAnswer: 1,
      category: "wellness",
      difficulty: "medium",
      explanation: "La OMS recomienda al menos 150 minutos de actividad física moderada por semana."
    },
    {
      id: 10,
      question: "¿Qué porcentaje del cuerpo humano es agua?",
      options: ["50%", "60%", "70%", "80%"],
      correctAnswer: 1,
      category: "wellness",
      difficulty: "easy",
      explanation: "Aproximadamente el 60% del cuerpo humano adulto está compuesto por agua."
    }
  ]
};

class MiniGameAPI {
  /**
   * Obtiene preguntas para el minijuego
   * @param {Object} config - Configuración del juego
   * @param {string} config.category - Categoría de preguntas
   * @param {string} config.difficulty - Dificultad (easy, medium, hard)
   * @param {number} config.count - Número de preguntas
   * @returns {Promise<Array>} Array de preguntas
   */
  async getQuestions(config = {}) {
    const {
      category = 'general',
      difficulty = 'medium',
      count = 5
    } = config;

    try {
      // Intentar obtener preguntas del backend
      const response = await api.get('/minigame/questions', {
        params: {
          category,
          difficulty,
          count
        }
      });

      if (response.data && response.data.questions) {
        return this.formatQuestions(response.data.questions);
      }
    } catch (error) {
      console.warn('No se pudieron cargar preguntas del servidor, usando preguntas locales:', error.message);
    }

    // Fallback a preguntas locales
    return this.getLocalQuestions(category, difficulty, count);
  }

  /**
   * Obtiene preguntas locales
   * @param {string} category - Categoría
   * @param {string} difficulty - Dificultad
   * @param {number} count - Número de preguntas
   * @returns {Array} Array de preguntas
   */
  getLocalQuestions(category = 'general', difficulty = 'medium', count = 5) {
    let questions = LOCAL_QUESTIONS[category] || LOCAL_QUESTIONS.general;
    
    // Filtrar por dificultad si se especifica
    if (difficulty !== 'all') {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    
    // Si no hay suficientes preguntas de esa dificultad, usar todas
    if (questions.length < count) {
      questions = LOCAL_QUESTIONS[category] || LOCAL_QUESTIONS.general;
    }
    
    // Mezclar y seleccionar
    const shuffled = this.shuffleArray([...questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Formatea las preguntas para asegurar consistencia
   * @param {Array} questions - Preguntas sin formato
   * @returns {Array} Preguntas formateadas
   */
  formatQuestions(questions) {
    return questions.map(q => ({
      id: q.id || Date.now() + Math.random(),
      question: q.question || q.text,
      options: q.options || q.answers || [],
      correctAnswer: q.correctAnswer || q.correct || 0,
      category: q.category || 'general',
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || '',
      timeLimit: q.timeLimit || 15, // 15 segundos por defecto
      points: this.calculatePoints(q.difficulty || 'medium')
    }));
  }

  /**
   * Calcula puntos según la dificultad
   * @param {string} difficulty - Dificultad de la pregunta
   * @returns {number} Puntos por respuesta correcta
   */
  calculatePoints(difficulty) {
    const pointsMap = {
      easy: 10,
      medium: 15,
      hard: 20
    };
    return pointsMap[difficulty] || 15;
  }

  /**
   * Mezcla un array usando el algoritmo Fisher-Yates
   * @param {Array} array - Array a mezclar
   * @returns {Array} Array mezclado
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Envía estadísticas del juego al backend
   * @param {Object} gameStats - Estadísticas del juego
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async submitGameStats(gameStats) {
    try {
      const response = await api.post('/minigame/stats', gameStats);
      return response.data;
    } catch (error) {
      console.warn('No se pudieron enviar estadísticas al servidor:', error.message);
      return null;
    }
  }

  /**
   * Obtiene el ranking global del minijuego
   * @param {string} category - Categoría (opcional)
   * @param {string} period - Período (daily, weekly, monthly, all-time)
   * @returns {Promise<Array>} Ranking de jugadores
   */
  async getLeaderboard(category = 'all', period = 'weekly') {
    try {
      const response = await api.get('/minigame/leaderboard', {
        params: { category, period }
      });
      return response.data.leaderboard || [];
    } catch (error) {
      console.warn('No se pudo cargar el ranking:', error.message);
      return [];
    }
  }

  /**
   * Obtiene las categorías disponibles
   * @returns {Promise<Array>} Lista de categorías
   */
  async getCategories() {
    try {
      const response = await api.get('/minigame/categories');
      return response.data.categories || this.getDefaultCategories();
    } catch (error) {
      console.warn('No se pudieron cargar categorías del servidor, usando categorías por defecto');
      return this.getDefaultCategories();
    }
  }

  /**
   * Obtiene las categorías por defecto
   * @returns {Array} Categorías por defecto
   */
  getDefaultCategories() {
    return [
      {
        id: 'general',
        name: 'Conocimiento General',
        description: 'Preguntas variadas de cultura general',
        icon: '🧠',
        color: '#6366f1'
      },
      {
        id: 'coaching',
        name: 'Coaching',
        description: 'Conceptos y técnicas de coaching',
        icon: '🎯',
        color: '#8b5cf6'
      },
      {
        id: 'wellness',
        name: 'Bienestar',
        description: 'Salud y bienestar personal',
        icon: '💪',
        color: '#10b981'
      }
    ];
  }

  /**
   * Valida una respuesta
   * @param {Object} question - Pregunta
   * @param {number} userAnswer - Respuesta del usuario
   * @param {number} timeToAnswer - Tiempo en responder
   * @returns {Object} Resultado de la validación
   */
  validateAnswer(question, userAnswer, timeToAnswer) {
    const isCorrect = userAnswer === question.correctAnswer;
    let points = 0;

    if (isCorrect) {
      points = question.points || this.calculatePoints(question.difficulty);
      
      // Bonus por velocidad (si responde en menos de 5 segundos)
      if (timeToAnswer < 5) {
        points = Math.floor(points * 1.5);
      }
    }

    return {
      isCorrect,
      points,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      timeBonus: timeToAnswer < 5,
    };
  }
}

export default new MiniGameAPI();