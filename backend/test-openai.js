const OpenAI = require('openai');
require('dotenv').config();

/**
 * Test script para verificar la conexión con OpenAI
 */
async function testOpenAIConnection() {
  try {
    console.log('🔄 Verificando conexión con OpenAI...');
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-tu-api-key-aqui') {
      throw new Error('❌ API Key de OpenAI no configurada. Revisa tu archivo .env');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Test simple de conexión con GPT-5 nano
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'Eres Fede, un coach ontológico argentino. Responde solo: Hola, soy Fede y estoy funcionando correctamente con GPT-5 nano.',
        },
        {
          role: 'user',
          content: 'Test de conexión',
        }
      ],
      max_completion_tokens: 50
    });

    console.log('✅ Conexión exitosa con OpenAI!');
    console.log('🤖 Respuesta de Fede:', response.choices[0].message.content);
    console.log('📊 Tokens usados:', response.usage.total_tokens);
    
    return true;

  } catch (error) {
    console.error('❌ Error en la conexión:', error.message);
    
    if (error.code === 'insufficient_quota') {
      console.log('💳 Tu cuenta de OpenAI no tiene créditos suficientes');
      console.log('💡 Ve a https://platform.openai.com/account/billing para agregar créditos');
    } else if (error.code === 'invalid_api_key') {
      console.log('🔑 API Key inválida. Verifica que sea correcta');
    }
    
    return false;
  }
}

// Ejecutar test
testOpenAIConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 ¡Todo listo! Fede puede funcionar correctamente');
    } else {
      console.log('\n🔧 Configura tu API Key y ejecuta el test nuevamente');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });