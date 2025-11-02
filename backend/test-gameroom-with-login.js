const axios = require('axios');

async function loginAndTestGameRoom() {
    console.log('🔐 Iniciando sesión como john@example.com...\n');

    try {
        // Primero, hacer login para obtener un token válido
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'john@example.com',
            password: 'Password123!'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { token } = loginResponse.data;
        console.log('✅ Login exitoso. Token obtenido.');
        
        // Ahora probar crear GameRoom
        console.log('\n🧪 Probando creación de GameRoom terapéutica...\n');
        
        const gameRoomData = {
            name: 'Sala de Bienestar 🧘‍♀️',
            description: 'Sala terapéutica para trabajar técnicas de manejo de ansiedad y mindfulness',
            gameType: 'trivia',
            category: 'bienestar',
            difficulty: 'medium',
            maxPlayers: 6,
            questionCount: 5,
            timePerQuestion: 30000,
            isPrivate: false,
            allowChat: false,
            isGlobal: true
        };

        console.log('📤 Enviando solicitud POST a /api/gamerooms...');
        console.log('📋 Datos enviados:', JSON.stringify(gameRoomData, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/gamerooms', gameRoomData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('\n✅ ÉXITO! GameRoom creada:');
        console.log('📊 Status:', response.status);
        console.log('🎮 Datos de la sala:', JSON.stringify(response.data, null, 2));
        
        // Probar obtener la lista de GameRooms
        console.log('\n🔍 Obteniendo lista de GameRooms...');
        const listResponse = await axios.get('http://localhost:5000/api/gamerooms', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📋 GameRooms disponibles:', listResponse.data.length);
        console.log(JSON.stringify(listResponse.data, null, 2));
        
    } catch (error) {
        if (error.response) {
            console.error('❌ ERROR:', error.response.status, error.response.statusText);
            console.error('💬 Mensaje:', error.response?.data?.message || error.message);
            console.error('🔍 Detalles:', JSON.stringify(error.response?.data, null, 2));
        } else {
            console.error('❌ ERROR de conexión:', error.message);
            console.error('🌐 ¿Está el servidor corriendo en http://localhost:5000?');
        }
    }
}

loginAndTestGameRoom();