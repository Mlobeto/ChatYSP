const axios = require('axios');

async function testFedeDetailed() {
  try {
    console.log('🔑 Haciendo login...');

    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mercedeslobeto@gmail.com',
      password: 'Admin*7754',
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    console.log('💬 Enviando mensaje a Fede...');

    const chatResponse = await axios.post(
      'http://localhost:5000/api/fede/chat',
      {
        message: 'Hola Fede',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🤖 Respuesta completa del servidor:');
    console.log('================================');
    console.log('Status:', chatResponse.status);
    console.log('Headers:', chatResponse.headers);
    console.log('Data completa:');
    console.log(JSON.stringify(chatResponse.data, null, 2));
    console.log('================================');

    // Verificar específicamente el campo message
    console.log('');
    console.log('🔍 Análisis de la respuesta:');
    console.log('- success:', chatResponse.data.success);
    console.log('- message existe:', 'message' in chatResponse.data);
    console.log('- message tipo:', typeof chatResponse.data.message);
    console.log('- message valor:', chatResponse.data.message);
    console.log(
      '- message length:',
      chatResponse.data.message ? chatResponse.data.message.length : 'N/A'
    );
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testFedeDetailed();
