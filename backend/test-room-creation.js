const axios = require('axios');

const API_URL = 'https://chatysp.onrender.com/api';

// Credenciales de admin (ajustar según tu DB)
const ADMIN_CREDENTIALS = {
  email: 'admin@chatysp.com',
  password: 'AdminPassword123!'
};

async function login() {
  try {
    console.log('🔐 Intentando login...');
    const response = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    console.log('✅ Login exitoso');
    return response.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function testGameRoomCreation(token) {
  try {
    console.log('\n🎮 Probando creación de GameRoom...');
    const gameRoomData = {
      name: 'Test Quiz Bienestar',
      description: 'Sala de prueba para quiz de bienestar',
      gameType: 'quiz',
      category: 'bienestar',
      difficulty: 'medium',
      maxPlayers: 6,
      questionCount: 10,
      timePerQuestion: 30000,
      isPrivate: false,
      allowChat: false
    };

    console.log('📤 Enviando datos:', JSON.stringify(gameRoomData, null, 2));

    const response = await axios.post(`${API_URL}/gamerooms`, gameRoomData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ GameRoom creado exitosamente!');
    console.log('📋 Datos:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error creando GameRoom:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

async function testRoomCreation(token) {
  try {
    console.log('\n💬 Probando creación de Room (chat)...');
    const roomData = {
      name: 'Test Sala Argentina',
      description: 'Sala de prueba para chat',
      roomType: 'public',
      maxUsers: 50,
      isPrivate: false,
      country: 'AR'
      // password solo si isPrivate: true
    };

    console.log('📤 Enviando datos:', JSON.stringify(roomData, null, 2));

    const response = await axios.post(`${API_URL}/admin/rooms`, roomData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Room creado exitosamente!');
    console.log('📋 Datos:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error creando Room:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

async function runTests() {
  try {
    // Login
    const token = await login();

    // Test Room primero (no necesita preguntas)
    await testRoomCreation(token);

    // Test GameRoom (ahora con preguntas en la DB)
    await testGameRoomCreation(token);

    console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
  } catch (error) {
    console.error('\n❌ Las pruebas fallaron');
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests();
