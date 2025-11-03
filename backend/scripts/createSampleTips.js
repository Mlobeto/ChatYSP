const axios = require('axios');

const sampleTips = [
  // Tips de Chat
  {
    content: 'Usa emojis para expresar mejor tus emociones en el chat, pero sin excederte. Un equilibrio perfecto hace que tus mensajes sean más amigables y claros.',
    category: 'chat',
    difficulty: 'beginner',
    tags: ['comunicacion', 'emojis', 'etiqueta']
  },
  {
    content: 'Evita escribir todo en mayúsculas, ya que puede interpretarse como gritar. Usa mayúsculas solo para enfatizar palabras importantes ocasionalmente.',
    category: 'chat',
    difficulty: 'beginner', 
    tags: ['comunicacion', 'etiqueta', 'respeto']
  },
  {
    content: 'Cuando respondas a un mensaje específico, usa la función de respuesta para mantener el contexto de la conversación y evitar confusiones.',
    category: 'chat',
    difficulty: 'intermediate',
    tags: ['contexto', 'conversacion', 'respuestas']
  },

  // Tips de Juegos
  {
    content: 'En los juegos de trivia, lee todas las opciones antes de responder. A veces la primera opción que parece correcta no es la mejor respuesta.',
    category: 'game',
    difficulty: 'beginner',
    tags: ['estrategia', 'trivia', 'concentracion']
  },
  {
    content: 'Practica la gestión del tiempo en los juegos cronometrados. No te quedes demasiado tiempo en una pregunta difícil si hay otras más fáciles pendientes.',
    category: 'game', 
    difficulty: 'intermediate',
    tags: ['tiempo', 'estrategia', 'eficiencia']
  },
  {
    content: 'En juegos grupales, colabora y comparte conocimientos. El objetivo es aprender juntos, no solo ganar individualmente.',
    category: 'game',
    difficulty: 'intermediate',
    tags: ['colaboracion', 'teamwork', 'aprendizaje']
  },
  {
    content: 'Analiza tus estadísticas de juego para identificar áreas de mejora. ¿En qué categorías tienes menor precisión? Enfócate en esas áreas.',
    category: 'game',
    difficulty: 'advanced',
    tags: ['analisis', 'mejora', 'estadisticas']
  },

  // Tips Generales de Bienestar
  {
    content: 'Toma descansos regulares entre sesiones de juego o chat. Tu mente funciona mejor cuando está descansada y te ayuda a mantener una perspectiva positiva.',
    category: 'general',
    difficulty: 'beginner',
    tags: ['bienestar', 'descanso', 'salud-mental']
  },
  {
    content: 'Practica la escucha activa en las conversaciones. Esto significa prestar atención completa a lo que otros dicen antes de formular tu respuesta.',
    category: 'general',
    difficulty: 'intermediate', 
    tags: ['comunicacion', 'escucha', 'empatia']
  },
  {
    content: 'Celebra tanto tus victorias como las de otros. Una mentalidad positiva y de apoyo crea un ambiente más agradable para todos.',
    category: 'general',
    difficulty: 'beginner',
    tags: ['positividad', 'celebracion', 'comunidad']
  },
  {
    content: 'Establece metas de aprendizaje personal. Cada interacción en la plataforma puede ser una oportunidad para crecer y desarrollarte.',
    category: 'general',
    difficulty: 'intermediate',
    tags: ['crecimiento', 'metas', 'desarrollo-personal']
  },
  {
    content: 'Mantén una mentalidad de crecimiento: los errores son oportunidades de aprendizaje, no fracasos. Cada equivocación te acerca más al éxito.',
    category: 'general',
    difficulty: 'advanced',
    tags: ['mentalidad-crecimiento', 'resiliencia', 'aprendizaje']
  },

  // Tips de IA
  {
    content: 'Sé específico en tus preguntas al asistente de IA. En lugar de \'ayúdame\', di \'necesito consejos sobre manejo del estrés en situaciones laborales\'.',
    category: 'ai',
    difficulty: 'beginner',
    tags: ['ia', 'preguntas', 'especificidad']
  },
  {
    content: 'Proporciona contexto en tus consultas a la IA. Mientras más información relevante des, mejores y más personalizadas serán las respuestas.',
    category: 'ai',
    difficulty: 'intermediate',
    tags: ['contexto', 'ia', 'personalizacion']
  },
  {
    content: 'Experimenta con diferentes formas de hacer la misma pregunta a la IA. Pequeños cambios en la formulación pueden generar perspectivas completamente nuevas.',
    category: 'ai',
    difficulty: 'intermediate',
    tags: ['experimentacion', 'ia', 'perspectivas']
  },
  {
    content: 'Usa la IA como un compañero de reflexión. Pídele que te ayude a analizar situaciones desde diferentes ángulos antes de tomar decisiones importantes.',
    category: 'ai',
    difficulty: 'advanced',
    tags: ['reflexion', 'analisis', 'decision-making']
  },

  // Tips adicionales de Chat
  {
    content: 'Respeta los tiempos de respuesta de otros. No todas las personas pueden responder inmediatamente, y eso está perfectamente bien.',
    category: 'chat',
    difficulty: 'beginner',
    tags: ['paciencia', 'respeto', 'tiempo']
  },
  {
    content: 'Usa hilos de conversación para temas largos. Esto ayuda a mantener el chat principal organizado y permite conversaciones más profundas.',
    category: 'chat',
    difficulty: 'advanced',
    tags: ['organizacion', 'hilos', 'conversaciones']
  },

  // Tips adicionales de Bienestar
  {
    content: 'Practica la gratitud diaria. Al final de cada sesión, reflexiona sobre una cosa positiva que aprendiste o experimentaste.',
    category: 'general',
    difficulty: 'beginner',
    tags: ['gratitud', 'reflexion', 'positividad']
  },
  {
    content: 'Desarrolla tu inteligencia emocional observando y nombrando tus emociones durante las interacciones. Esto mejora tu autoconocimiento.',
    category: 'general',
    difficulty: 'advanced',
    tags: ['inteligencia-emocional', 'autoconocimiento', 'emociones']
  },

  // Tips adicionales de Juegos
  {
    content: 'Crea un ambiente de juego óptimo: buena iluminación, sin distracciones, y una postura cómoda te ayudarán a rendir mejor.',
    category: 'game',
    difficulty: 'beginner',
    tags: ['ambiente', 'comodidad', 'rendimiento']
  },
  {
    content: 'Después de cada juego, reflexiona brevemente sobre tu desempeño. ¿Qué funcionó bien? ¿Qué podrías mejorar la próxima vez?',
    category: 'game',
    difficulty: 'intermediate',
    tags: ['reflexion', 'mejora-continua', 'autoevaluacion']
  }
];

async function loginAsAdmin() {
  try {
    console.log('🔐 Intentando hacer login como admin...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@chatysp.com',
      password: 'AdminPassword123!'
    });
    
    console.log('📋 Respuesta del login:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Login exitoso como admin');
      
      // Verificar la estructura de la respuesta
      const token = response.data.token || (response.data.data && response.data.data.token);
      
      if (!token) {
        console.error('❌ No se encontró token en la respuesta:', response.data);
        throw new Error('Token no encontrado en la respuesta del login');
      }
      
      return token;
    } else {
      throw new Error('Login fallido: ' + response.data.message);
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function createSampleTips() {
  try {
    console.log('🚀 Iniciando creación de tips de ejemplo...');
    
    // Verificar que el servidor esté corriendo
    try {
      await axios.get('http://localhost:5000/health');
      console.log('✅ Servidor backend disponible');
    } catch (error) {
      console.error('❌ Error: El servidor backend no está corriendo en http://localhost:5000');
      console.log('💡 Asegúrate de ejecutar "npm run dev" en el directorio backend primero');
      process.exit(1);
    }

    // Hacer login como admin
    const adminToken = await loginAsAdmin();

    // Verificar si ya existen tips
    console.log('📊 Verificando tips existentes...');
    try {
      const statsResponse = await axios.get('http://localhost:5000/api/tips/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const existingTipsCount = statsResponse.data.data.totalTips;
      console.log(`📊 Tips existentes en la base de datos: ${existingTipsCount}`);

      if (existingTipsCount > 0) {
        console.log('⚠️  Ya existen tips en la base de datos.');
        console.log('ℹ️  Procediendo a agregar más tips...');
      }
    } catch (error) {
      console.log('ℹ️  No se pudieron obtener estadísticas, continuando...');
    }

    // Crear los tips
    console.log(`📝 Creando ${sampleTips.length} tips de ejemplo...`);
    
    const createdTips = [];
    let successCount = 0;
    let errorCount = 0;

    for (const [index, tipData] of sampleTips.entries()) {
      try {
        const response = await axios.post('http://localhost:5000/api/tips', tipData, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const tip = response.data.data;
          createdTips.push(tip);
          successCount++;
          console.log(`✅ [${index + 1}/${sampleTips.length}] Tip creado: "${tip.content.substring(0, 50)}..." (${tip.category})`);
        } else {
          errorCount++;
          console.log(`❌ [${index + 1}/${sampleTips.length}] Error: ${response.data.message}`);
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error.response?.data?.message || error.message;
        console.log(`❌ [${index + 1}/${sampleTips.length}] Error creando tip: ${errorMessage}`);
      }

      // Pequeña pausa para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Estadísticas finales
    console.log('\n📊 Resumen de la creación de tips:');
    console.log(`✅ Tips creados exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📁 Total procesados: ${sampleTips.length}`);

    if (successCount > 0) {
      const tipsByCategory = createdTips.reduce((acc, tip) => {
        acc[tip.category] = (acc[tip.category] || 0) + 1;
        return acc;
      }, {});

      const tipsByDifficulty = createdTips.reduce((acc, tip) => {
        acc[tip.difficulty] = (acc[tip.difficulty] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Estadísticas de tips creados:');
      console.log('Por categoría:', tipsByCategory);
      console.log('Por dificultad:', tipsByDifficulty);
      
      // Mostrar algunos tips de ejemplo
      console.log('\n📋 Ejemplos de tips creados:');
      createdTips.slice(0, 3).forEach((tip, index) => {
        console.log(`\n${index + 1}. [${tip.category.toUpperCase()}] - ${tip.difficulty}`);
        console.log(`   "${tip.content}"`);
        console.log(`   Tags: ${tip.tags.join(', ')}`);
      });

      console.log('\n✨ Tips listos para usar en el sistema!');
      console.log('🔗 Puedes verlos en: http://localhost:5000/api/tips');
    }

    if (successCount === sampleTips.length) {
      console.log('\n🎉 ¡Todos los tips se crearon exitosamente!');
    } else if (successCount > 0) {
      console.log('\n⚠️  Algunos tips se crearon, pero hubo errores. Revisa los mensajes arriba.');
    } else {
      console.log('\n❌ No se pudo crear ningún tip. Revisa la configuración del servidor.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error general creando tips de ejemplo:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  createSampleTips();
}

module.exports = { createSampleTips, sampleTips };