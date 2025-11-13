const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();

const API_BASE = process.env.API_URL || 'https://chatysp.onrender.com/api';

// Credenciales de admin
const ADMIN_CREDENTIALS = {
  email: 'admin@chatysp.com',
  password: 'AdminPassword123!'
};

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Generar preguntas con IA
async function generateQuestionsWithAI(category, difficulty, count = 10) {
  console.log(`🤖 Generando ${count} preguntas de ${category} (${difficulty}) con IA...\n`);

  const prompt = `Genera ${count} preguntas de opción múltiple sobre ${category} con dificultad ${difficulty}.

IMPORTANTE: Devuelve SOLO un array JSON válido, sin texto adicional, comentarios ni markdown.

Cada pregunta debe tener exactamente esta estructura:
{
  "question": "texto de la pregunta",
  "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
  "correctAnswer": índice_numérico_de_0_a_3,
  "category": "${category}",
  "difficulty": "${difficulty}",
  "points": ${difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20},
  "tags": ["tag1", "tag2", "tag3"]
}

Criterios:
- Las preguntas deben ser educativas y relevantes para ${category}
- Dificultad ${difficulty}: ${difficulty === 'easy' ? 'conceptos básicos y claros' : difficulty === 'medium' ? 'requiere comprensión y análisis' : 'avanzado, requiere conocimiento profundo'}
- Cada pregunta debe tener EXACTAMENTE 4 opciones
- Solo UNA opción es correcta (índice 0, 1, 2 o 3)
- Las opciones incorrectas deben ser plausibles pero claramente incorrectas
- Tags deben ser palabras clave relevantes (3-5 tags por pregunta)

Devuelve SOLO el array JSON, sin explicaciones ni formato markdown.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en crear preguntas educativas de opción múltiple. Respondes SOLO con JSON válido, sin texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content.trim();
    
    // Limpiar el contenido si viene con markdown
    let jsonContent = content;
    if (content.startsWith('```')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const questions = JSON.parse(jsonContent);
    console.log(`✅ ${questions.length} preguntas generadas por IA\n`);
    return questions;
  } catch (error) {
    console.error('❌ Error generando preguntas con IA:', error.message);
    if (error.response?.data) {
      console.error('Detalles:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Crear preguntas en la base de datos
async function createQuestions(questions, token) {
  console.log(`📤 Subiendo ${questions.length} preguntas a la base de datos...\n`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    try {
      console.log(`📝 Creando pregunta ${i + 1}/${questions.length}: "${question.question.substring(0, 60)}..."`);

      const response = await axios.post(`${API_BASE}/admin/questions`, question, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`   ✅ Creada (ID: ${response.data.question?.id || 'N/A'})`);
      success++;
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.errors) {
        console.log('   Detalles:', error.response.data.errors);
      }
      errors++;
    }

    // Pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return { success, errors };
}

// Función principal
async function main() {
  try {
    // Configuración
    const category = process.argv[2] || 'bienestar';
    const difficulty = process.argv[3] || 'medium';
    const count = parseInt(process.argv[4]) || 10;

    console.log('🎮 Generador de Preguntas con IA\n');
    console.log(`📋 Categoría: ${category}`);
    console.log(`⚡ Dificultad: ${difficulty}`);
    console.log(`🔢 Cantidad: ${count}\n`);
    console.log('━'.repeat(60) + '\n');

    // Login
    const token = await login();

    // Generar preguntas con IA
    const questions = await generateQuestionsWithAI(category, difficulty, count);

    // Crear preguntas en la DB
    const { success, errors } = await createQuestions(questions, token);

    // Resumen
    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`✅ Preguntas creadas exitosamente: ${success}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📈 Total procesadas: ${questions.length}`);
    
    if (success > 0) {
      console.log('\n🎉 ¡Preguntas cargadas exitosamente! Ya puedes crear GameRooms.');
    }

  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  console.log('💡 Uso: node generateQuestionsWithAI.js [categoria] [dificultad] [cantidad]');
  console.log('   Ejemplo: node generateQuestionsWithAI.js bienestar medium 15\n');
  console.log('   Categorías: bienestar, coaching, general, tecnologia');
  console.log('   Dificultad: easy, medium, hard');
  console.log('   Cantidad: 1-50\n');
  
  main();
}

module.exports = { generateQuestionsWithAI, createQuestions };
