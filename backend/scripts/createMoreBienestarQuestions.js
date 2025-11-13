const axios = require('axios');

const API_BASE = process.env.API_URL || 'https://chatysp.onrender.com/api';

// Credenciales de admin
const ADMIN_CREDENTIALS = {
  email: 'admin@chatysp.com',
  password: 'AdminPassword123!'
};

// Login function
async function login() {
  console.log('🔐 Obteniendo token de administrador...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    console.log('✅ Login exitoso\n');
    return response.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

const additionalBienestarQuestions = [
  {
    question: '¿Cuál es una forma efectiva de manejar el estrés diario?',
    options: [
      'Ignorar el estrés completamente',
      'Practicar técnicas de relajación como la meditación',
      'Trabajar más horas para evitar pensar',
      'Evitar todas las responsabilidades',
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'easy',
    points: 10,
    tags: ['estrés', 'relajación', 'manejo'],
  },
  {
    question: '¿Qué es importante para mantener un equilibrio emocional?',
    options: [
      'Reprimir todas las emociones negativas',
      'Reconocer, aceptar y procesar las emociones',
      'Estar siempre feliz',
      'Evitar situaciones que generen emociones',
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['equilibrio', 'emociones', 'aceptación'],
  },
  {
    question: '¿Cuál es un beneficio de una rutina de ejercicio regular?',
    options: [
      'Solo mejora la apariencia física',
      'Reduce el estrés y mejora el estado de ánimo',
      'No tiene efectos en la salud mental',
      'Solo es útil para deportistas profesionales',
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'easy',
    points: 10,
    tags: ['ejercicio', 'bienestar', 'endorfinas'],
  },
  {
    question: '¿Qué es la higiene del sueño?',
    options: [
      'Ducharse antes de dormir',
      'Mantener hábitos y ambiente que favorezcan un sueño reparador',
      'Limpiar la habitación cada noche',
      'Tomar pastillas para dormir',
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['sueño', 'descanso', 'hábitos'],
  },
  {
    question: '¿Cuál es una técnica efectiva para la regulación emocional?',
    options: [
      'Explotar emocionalmente cuando sea necesario',
      'La técnica STOP: parar, respirar, observar, proceder',
      'Ignorar las emociones hasta que desaparezcan',
      'Actuar impulsivamente según como te sientes',
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['regulación', 'emociones', 'técnica'],
  },
  {
    question: '¿Qué es la alimentación consciente o mindful eating?',
    options: [
      'Contar todas las calorías obsesivamente',
      'Prestar atención plena al proceso de comer',
      'Comer solo alimentos orgánicos',
      'Seguir dietas estrictas siempre',
    ],
    correctAnswer: 1,
    category: 'bienestar',
    difficulty: 'medium',
    points: 15,
    tags: ['alimentación', 'mindfulness', 'consciencia'],
  },
];

async function createAdditionalQuestions() {
  console.log('🎯 Creando preguntas adicionales de bienestar...\n');

  // Obtener token de admin
  const ADMIN_TOKEN = await login();

  let success = 0;
  let errors = 0;

  for (let i = 0; i < additionalBienestarQuestions.length; i++) {
    const question = additionalBienestarQuestions[i];

    try {
      console.log(
        `📝 Creando pregunta 
        ${i + 1}/${additionalBienestarQuestions.length}: "${question.question.substring(0, 50)}..."`,
      );

      const response = await axios.post(`${API_BASE}/admin/questions`, question, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(
        `✅ Pregunta creada exitosamente (ID: ${response.data.question ? response.data.question.id : 'N/A'})`,
      );
      success++;
    } catch (error) {
      console.log(
        `❌ Error creando pregunta: ${error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message}`,
      );
      if (error.response && error.response.data && error.response.data.errors) {
        console.log('   Detalles:', error.response.data.errors);
      }
      errors++;
    }

    // Pequeña pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n🎯 Resumen:');
  console.log(`✅ Preguntas adicionales creadas: ${success}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📊 Total procesadas: ${additionalBienestarQuestions.length}`);

  if (success > 0) {
    console.log(
      '\n🎮 ¡Ahora deberías tener suficientes preguntas de bienestar para crear GameRooms!',
    );
  }
}

createAdditionalQuestions().catch(console.error);
