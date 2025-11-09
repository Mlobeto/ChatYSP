const axios = require('axios');

async function testFedeChat() {
  try {
    console.log('🔑 Haciendo login con credenciales existentes...');

    // 1. Login con credenciales existentes
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mercedeslobeto@gmail.com',
      password: 'Admin*7754',
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido exitosamente');

    // 2. Probamos el chat con Fede
    console.log('💬 Enviando mensaje a Fede...');
    console.log('Pregunta: "Paso 1 contacto cero"');
    console.log('');

    const chatResponse = await axios.post(
      'http://localhost:5000/api/fede/chat',
      {
        message: 'Paso 1 contacto cero',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🤖 Respuesta de Fede:');
    console.log('================================');
    console.log(chatResponse.data.response);
    console.log('================================');
    console.log('');
    console.log('📊 Información adicional:');
    if (chatResponse.data.knowledgeUsed) {
      console.log('📚 Conocimiento utilizado:', chatResponse.data.knowledgeUsed.length, 'fuentes');
      chatResponse.data.knowledgeUsed.forEach((source, i) => {
        console.log(`   ${i + 1}. ${source.title}`);
      });
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testFedeChat();
