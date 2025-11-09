const axios = require('axios');

async function testFedeChat() {
  try {
    // 1. Primero registramos un usuario de prueba
    console.log('🔐 Registrando usuario de prueba...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'testuser_fede',
      email: 'test@fede.com',
      password: 'Test123!',
      fullName: 'Usuario de Prueba',
    });

    console.log('✅ Usuario registrado');

    // 2. Hacemos login para obtener el token
    console.log('🔑 Haciendo login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'testuser_fede',
      password: 'Test123!',
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    // 3. Probamos el chat con Fede
    console.log('💬 Enviando mensaje a Fede...');
    const chatResponse = await axios.post(
      'http://localhost:5000/api/fede/chat',
      {
        message:
          'Fede, apliqué el Paso 1 pero mi ex no reacciona. Ya llevo 3 semanas de contacto cero y ella no me ha escrito ni nada. ¿Estoy haciendo algo mal?',
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
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testFedeChat();
