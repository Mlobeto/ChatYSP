const axios = require('axios');

async function testAdminLogin() {
  console.log('🔐 Probando login de administrador...\n');

  try {
    const loginData = {
      email: 'admin@chatysp.com',
      password: 'AdminPassword123!'
    };

    console.log('📤 Enviando solicitud de login...');
    console.log('📋 Datos:', JSON.stringify(loginData, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ LOGIN EXITOSO!');
    console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
    
    const { token, user } = response.data;
    
    console.log('\n🎯 Información del usuario:');
    console.log(`👤 Username: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👑 Rol: ${user.role}`);
    console.log(`🌍 País: ${user.country}`);
    
    console.log('\n🔑 Token generado:', token);
    console.log('\n🌐 Ahora puedes usar estas credenciales en el dashboard:');
    console.log('📧 Email: admin@chatysp.com');
    console.log('🔒 Password: AdminPassword123!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ ERROR DE LOGIN:', error.response.status, error.response.statusText);
      console.error('💬 Mensaje:', error.response?.data?.message || error.message);
      console.error('🔍 Detalles:', JSON.stringify(error.response?.data, null, 2));
    } else {
      console.error('❌ ERROR de conexión:', error.message);
      console.error('🌐 ¿Está el servidor corriendo en http://localhost:5000?');
    }
  }
}

testAdminLogin().catch(console.error);