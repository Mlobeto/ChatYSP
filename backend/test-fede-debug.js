const axios = require('axios');

async function testFedeDebug() {
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
        message: 'Hola Fede, ¿cómo estás?',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🤖 Respuesta completa de Fede:');
    console.log('================================');
    console.log(JSON.stringify(chatResponse.data, null, 2));
    console.log('================================');
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testFedeDebug();
