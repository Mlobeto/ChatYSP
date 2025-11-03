const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Tu token de admin - reemplaza con el token real
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0ZWQ2NjJhYi03YTcxLTRlNmYtYWRhYi1hNWM4NzNlMWQ1NDgiLCJpYXQiOjE3NjIwNDk1OTgsImV4cCI6MTc2MjY1NDM5OH0.N7pA_H5LxH9zviredf2TiJmu9DHHwJGBhuRC6EVjzdE';

const therapeuticQuestions = [
  {
    question: '¿Cuál es una técnica efectiva para manejar la ansiedad en el momento presente?',
    options: [
      'Pensar en todos los problemas futuros',
      'Respiración profunda y consciente', 
      'Evitar cualquier situación estresante',
      'Tomar decisiones impulsivas'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['ansiedad', 'mindfulness', 'respiración']
  },
  {
    question: '¿Qué significa practicar la autocompasión?',
    options: [
      'Criticarse constantemente para mejorar',
      'Tratarse con la misma amabilidad que a un buen amigo',
      'Ignorar todos los errores propios', 
      'Compararse siempre con otros'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium', 
    points: 15,
    tags: ['autocompasión', 'autoestima', 'mindfulness']
  },
  {
    question: '¿Cuál es el primer paso para establecer límites saludables?',
    options: [
      'Evitar el conflicto a toda costa',
      'Identificar tus necesidades y valores',
      'Hacer todo lo que otros piden',
      'Nunca decir que no'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['límites', 'autoestima', 'relaciones']
  },
  {
    question: '¿Qué es la técnica de grounding 5-4-3-2-1?',
    options: [
      'Un ejercicio de matemáticas',
      'Identificar 5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas',
      'Una rutina de ejercicio físico',
      'Un método para organizar tareas'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'easy',
    points: 10,
    tags: ['grounding', 'ansiedad', 'mindfulness']
  },
  {
    question: '¿Cuál es una característica de un pensamiento catastrófico?',
    options: [
      'Pensar en soluciones prácticas',
      'Imaginar el peor escenario posible',
      'Mantenerse en el presente',
      'Buscar evidencia objetiva'
    ],
    correctAnswer: 1,
    category: 'coaching',
    difficulty: 'medium',
    points: 15,
    tags: ['pensamiento', 'ansiedad', 'cognitivo']
  },
  {
    question: '¿Qué es la ventana de tolerancia emocional?',
    options: [
      'El tiempo que puedes estar enojado',
      'La zona de activación óptima donde puedes manejar emociones efectivamente',
      'El límite de cuánto puedes llorar',
      'La cantidad de estrés que puedes tener'
    ],
    correctAnswer: 1,
    category: 'coaching',
    difficulty: 'hard',
    points: 20,
    tags: ['emociones', 'regulación', 'trauma']
  },
  {
    question: '¿Cuál es un beneficio de la práctica regular de mindfulness?',
    options: [
      'Eliminar completamente el estrés',
      'Mejorar la capacidad de observar pensamientos sin juzgar',
      'Nunca sentir emociones negativas',
      'Resolver todos los problemas automáticamente'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'easy',
    points: 10,
    tags: ['mindfulness', 'meditación', 'conciencia']
  },
  {
    question: '¿Qué significa tener una mentalidad de crecimiento?',
    options: [
      'Creer que las habilidades son fijas',
      'Creer que se puede desarrollar y mejorar con esfuerzo',
      'Evitar desafíos para no fallar',
      'Competir constantemente con otros'
    ],
    correctAnswer: 1,
    category: 'coaching',
    difficulty: 'medium',
    points: 15,
    tags: ['crecimiento', 'mentalidad', 'desarrollo']
  },
  {
    question: '¿Cuál es una técnica efectiva para manejar el diálogo interno negativo?',
    options: [
      'Ignorar completamente los pensamientos',
      'Cuestionar la evidencia y buscar perspectivas alternativas',
      'Reprimir todas las emociones',
      'Distraerse constantemente'
    ],
    correctAnswer: 1,
    category: 'coaching',
    difficulty: 'medium',
    points: 15,
    tags: ['autodiálogo', 'pensamientos', 'cognitivo']
  },
  {
    question: '¿Qué es la resiliencia emocional?',
    options: [
      'Nunca sentirse triste o estresado',
      'La capacidad de adaptarse y recuperarse de adversidades',
      'Evitar todos los problemas',
      'Ser siempre optimista'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['resiliencia', 'adaptación', 'fortaleza']
  },
  {
    question: '¿Cuál es el objetivo principal de una comunicación asertiva?',
    options: [
      'Ganar siempre las discusiones',
      'Expresar necesidades y opiniones de manera clara y respetuosa',
      'Evitar cualquier conflicto',
      'Hacer que otros cambien de opinión'
    ],
    correctAnswer: 1,
    category: 'coaching',
    difficulty: 'easy',
    points: 10,
    tags: ['comunicación', 'asertividad', 'relaciones']
  },
  {
    question: '¿Qué es la práctica de gratitud consciente?',
    options: [
      'Fingir que todo está bien',
      'Reconocer y apreciar intencionalmente aspectos positivos de la vida',
      'Ignorar los problemas reales',
      'Compararse con otros menos afortunados'
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'easy',
    points: 10,
    tags: ['gratitud', 'bienestar', 'positivo']
  }
];

async function createQuestions() {
  console.log('🎯 Creando preguntas terapéuticas...\n');
  
  let success = 0;
  let errors = 0;
  
  for (let i = 0; i < therapeuticQuestions.length; i++) {
    const question = therapeuticQuestions[i];
    
    try {
      console.log(`📝 Creando pregunta ${i + 1}/${therapeuticQuestions.length}: "${question.question.substring(0, 50)}..."`);
      
      const response = await axios.post(
        `${API_BASE}/admin/questions`,
        question,
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Pregunta creada exitosamente (ID: ${response.data.question?.id})`);
      success++;
      
    } catch (error) {
      console.log(`❌ Error creando pregunta: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.errors) {
        console.log('   Detalles:', error.response.data.errors);
      }
      errors++;
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎯 Resumen de creación:');
  console.log(`✅ Preguntas creadas exitosamente: ${success}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📊 Total procesadas: ${therapeuticQuestions.length}`);
  
  if (success > 0) {
    console.log('\n🎮 ¡Ahora puedes crear GameRooms terapéuticas!');
    console.log('   Las preguntas están disponibles en las categorías: bienestar, coaching');
  }
}

// Verificar que el servidor esté corriendo
async function checkServerHealth() {
  try {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    console.log('✅ Servidor corriendo correctamente\n');
    return true;
  } catch (error) {
    console.log('❌ Error: El servidor no está corriendo en http://localhost:5000');
    console.log('   Por favor, inicia el servidor con: npm run dev\n');
    return false;
  }
}

async function main() {
  console.log('🤖 Script de creación de preguntas terapéuticas\n');
  
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    process.exit(1);
  }
  
  await createQuestions();
}

main().catch(console.error);