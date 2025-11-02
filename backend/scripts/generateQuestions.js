const axios = require('axios');
require('dotenv').config();

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'tu_token_admin_aqui';

// Preguntas terapéuticas generadas por IA
const therapeuticQuestions = [
  {
    question: "¿Cuál es la técnica más efectiva para calmar la mente durante un episodio de ansiedad?",
    options: [
      "Respiración profunda y consciente (4-7-8)",
      "Pensar en todos los problemas pendientes",
      "Hacer ejercicio físico intenso inmediatamente",
      "Evitar cualquier tipo de estimulación"
    ],
    correctAnswer: 0,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["ansiedad", "respiración", "mindfulness"]
  },
  {
    question: "¿Qué significa practicar la autocompasión según la psicología positiva?",
    options: [
      "Ser muy permisivo con todos los errores",
      "Tratarse con la misma bondad que a un buen amigo",
      "Nunca reconocer las propias fallas",
      "Compararse constantemente con otros"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["autocompasión", "autoestima", "psicología positiva"]
  },
  {
    question: "¿Cuál es un síntoma común del estrés crónico en el cuerpo?",
    options: [
      "Mayor flexibilidad muscular",
      "Tensión muscular y dolores de cabeza",
      "Aumento significativo de energía",
      "Mejor calidad del sueño"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "easy",
    points: 10,
    tags: ["estrés", "síntomas", "salud física"]
  },
  {
    question: "¿Qué técnica de mindfulness ayuda a mantener la atención en el presente?",
    options: [
      "Planificar exhaustivamente el futuro",
      "Observar las sensaciones corporales sin juzgar",
      "Recordar constantemente el pasado",
      "Evitar cualquier pensamiento"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["mindfulness", "atención plena", "presente"]
  },
  {
    question: "¿Cuál es un hábito saludable para mejorar el bienestar emocional?",
    options: [
      "Aislarse completamente de otros",
      "Practicar gratitud diariamente",
      "Evitar expresar emociones",
      "Mantener un horario de sueño irregular"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "easy",
    points: 10,
    tags: ["gratitud", "hábitos", "bienestar emocional"]
  },
  {
    question: "¿Qué estrategia es más efectiva para manejar pensamientos negativos recurrentes?",
    options: [
      "Intentar suprimir todos los pensamientos",
      "Observar los pensamientos sin identificarse con ellos",
      "Creer automáticamente en todos los pensamientos",
      "Distraerse constantemente"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "hard",
    points: 20,
    tags: ["pensamientos", "reestructuración cognitiva", "mindfulness"]
  },
  {
    question: "¿Cuál es un beneficio comprobado de la meditación regular?",
    options: [
      "Eliminación completa del estrés",
      "Reducción de la actividad en la amígdala cerebral",
      "Aumento de la presión arterial",
      "Mayor reactividad emocional"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["meditación", "neurociencia", "cerebro"]
  },
  {
    question: "¿Qué es la 'ventana de tolerancia' en regulación emocional?",
    options: [
      "El tiempo que dura una emoción",
      "La zona donde podemos funcionar sin estar hiper o hipoactivados",
      "La capacidad de tolerar el dolor físico",
      "El momento del día con más energía"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "hard",
    points: 20,
    tags: ["regulación emocional", "sistema nervioso", "trauma"]
  },
  {
    question: "¿Cuál es una técnica efectiva para mejorar la comunicación asertiva?",
    options: [
      "Usar declaraciones en primera persona ('Yo siento...')",
      "Siempre evitar el conflicto",
      "Criticar directamente a la otra persona",
      "Hablar sin parar para convencer"
    ],
    correctAnswer: 0,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["comunicación", "asertividad", "relaciones"]
  },
  {
    question: "¿Qué actividad puede ayudar a reducir los niveles de cortisol (hormona del estrés)?",
    options: [
      "Ver noticias constantemente",
      "Trabajar sin descansos",
      "Pasar tiempo en la naturaleza",
      "Consumir grandes cantidades de cafeína"
    ],
    correctAnswer: 2,
    category: "bienestar",
    difficulty: "easy",
    points: 10,
    tags: ["cortisol", "naturaleza", "estrés"]
  },
  {
    question: "¿Cuál es un principio clave de la terapia cognitivo-conductual (TCC)?",
    options: [
      "Los pensamientos no influyen en las emociones",
      "Los pensamientos, emociones y comportamientos están interconectados",
      "Solo importa cambiar el comportamiento",
      "Las emociones no se pueden modificar"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["TCC", "pensamientos", "emociones", "comportamiento"]
  },
  {
    question: "¿Qué caracteriza a una relación saludable?",
    options: [
      "Dependencia emocional total",
      "Comunicación abierta y respeto mutuo",
      "Evitar cualquier tipo de conflicto",
      "Controlar las actividades del otro"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "easy",
    points: 10,
    tags: ["relaciones", "comunicación", "respeto"]
  },
  {
    question: "¿Cuál es una señal de que necesitas establecer límites personales?",
    options: [
      "Te sientes energizado después de cada interacción",
      "Constantemente te sientes agotado o resentido",
      "Siempre tienes tiempo para tus propias necesidades",
      "Las personas respetan automáticamente tu espacio"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["límites", "autocuidado", "relaciones"]
  },
  {
    question: "¿Qué es la 'higiene del sueño'?",
    options: [
      "Ducharse antes de dormir",
      "Prácticas que promueven un sueño reparador y regular",
      "Limpiar la habitación frecuentemente",
      "Usar productos de limpieza en la cama"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "easy",
    points: 10,
    tags: ["sueño", "higiene del sueño", "descanso"]
  },
  {
    question: "¿Cuál es un efecto positivo de la escritura terapéutica o journaling?",
    options: [
      "Elimina todas las emociones negativas",
      "Ayuda a procesar y clarificar pensamientos y emociones",
      "Garantiza la solución inmediata de problemas",
      "Evita la necesidad de hablar con otros"
    ],
    correctAnswer: 1,
    category: "bienestar",
    difficulty: "medium",
    points: 15,
    tags: ["escritura terapéutica", "journaling", "autoconocimiento"]
  }
];

// Función para crear una pregunta via API
async function createQuestion(questionData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/questions`, questionData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Pregunta creada: "${questionData.question.substring(0, 50)}..."`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error creando pregunta: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Función principal para generar todas las preguntas
async function generateAllQuestions() {
  console.log('🤖 Iniciando generación automática de preguntas terapéuticas...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < therapeuticQuestions.length; i++) {
    const question = therapeuticQuestions[i];
    console.log(`📝 Creando pregunta ${i + 1}/${therapeuticQuestions.length}...`);
    
    const result = await createQuestion(question);
    
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Pausa entre requests para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎯 Generación completada:');
  console.log(`✅ Preguntas creadas exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log('\n🎮 ¡Ahora puedes crear GameRooms terapéuticas!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateAllQuestions().catch(console.error);
}

module.exports = { generateAllQuestions, therapeuticQuestions };