const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function createAdminUser() {
  console.log('👤 Creando usuario administrador...\n');
  
  const adminData = {
    username: 'admin',
    email: 'admin@chatysp.com',
    password: 'Admin123!',
    role: 'admin',
    country: 'AR'
  };

  try {
    console.log('📤 Enviando solicitud de registro...');
    console.log('📋 Datos del admin:', JSON.stringify(adminData, null, 2));
    
    const response = await axios.post(`${API_BASE}/auth/register`, adminData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Usuario admin creado exitosamente!');
    console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
    console.log('\n🔑 Credenciales de acceso:');
    console.log('📧 Email: admin@chatysp.com');
    console.log('🔒 Password: Admin123!');
    console.log('👑 Rol: admin');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ ERROR:', error.response.status, error.response.statusText);
      console.error('💬 Mensaje:', error.response?.data?.message || error.message);
      console.error('🔍 Detalles:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.data?.message?.includes('Email ya está en uso')) {
        console.log('\n🎉 El usuario admin ya existe. Puedes usar las siguientes credenciales:');
        console.log('📧 Email: admin@chatysp.com');
        console.log('🔒 Password: Admin123!');
      }
    } else {
      console.error('❌ ERROR de conexión:', error.message);
      console.error('🌐 ¿Está el servidor corriendo en http://localhost:5000?');
    }
  }
}

// Verificar que el servidor esté corriendo
async function checkServerHealth() {
  try {
    console.log('🔍 Verificando estado del servidor...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Servidor corriendo correctamente\n');
    return true;
  } catch (error) {
    console.log('❌ Error: El servidor no está corriendo en http://localhost:5000');
    console.log('   Por favor, inicia el servidor con: npm run dev\n');
    return false;
  }
}

async function main() {
  console.log('🤖 Script de creación de usuario administrador\n');
  
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    process.exit(1);
  }
  
  await createAdminUser();
}

main().catch(console.error);