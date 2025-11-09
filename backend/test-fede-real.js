const axios = require('axios');

async function testFedeReal() {
  try {
    console.log('🔑 Haciendo login...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mercedeslobeto@gmail.com',
      password: 'Admin*7754'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');
    
    console.log('💬 Enviando pregunta sobre Paso 1...');
    
    const chatResponse = await axios.post('http://localhost:5000/api/fede/chat', {
      message: 'Fede, apliqué el Paso 1 pero mi ex no reacciona. Ya llevo 3 semanas de contacto cero y ella no me ha escrito ni nada. ¿Estoy haciendo algo mal?'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🤖 Respuesta de Fede:');
    console.log('================================');
    console.log('Success:', chatResponse.data.success);
    console.log('Is Out of Scope:', chatResponse.data.isOutOfScope || false);
    console.log('');
    console.log('Mensaje:');
    console.log(chatResponse.data.message);
    console.log('================================');
    
    if (chatResponse.data.sources && chatResponse.data.sources.length > 0) {
      console.log('');
      console.log('📚 Fuentes de conocimiento utilizadas:');
      chatResponse.data.sources.forEach((source, i) => {
        console.log(`${i+1}. ${source.title} (${source.category})`);
      });
    }
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testFedeReal();