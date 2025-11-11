import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

export default function TestConnection() {
  const [result, setResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testDirectConnection = async () => {
    setTesting(true);
    setResult('Probando...');
    
    try {
      console.log('🧪 TEST: Iniciando prueba de conexión directa');
      
      // Test 1: Health check
      console.log('🧪 TEST 1: Health check');
      const healthResponse = await axios.get('https://chatysp.onrender.com/health', {
        timeout: 30000,
      });
      console.log('✅ TEST 1 OK:', healthResponse.data);
      
      // Test 2: Login endpoint
      console.log('🧪 TEST 2: Login endpoint');
      const loginResponse = await axios.post(
        'https://chatysp.onrender.com/api/auth/login',
        {
          email: 'test@test.com',
          password: 'test123'
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
      
      console.log('✅ TEST 2 OK:', loginResponse.data);
      setResult('✅ Conexión OK! Ver consola para detalles');
      Alert.alert('Éxito', 'La conexión funciona correctamente. Ver consola.');
      
    } catch (error) {
      console.error('❌ TEST ERROR:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        isTimeout: error.code === 'ECONNABORTED',
        isNetworkError: error.message === 'Network Error',
      });
      
      let errorMsg = '';
      if (error.code === 'ECONNABORTED') {
        errorMsg = '⏱️ Timeout - El servidor tardó mucho';
      } else if (error.message === 'Network Error') {
        errorMsg = '🌐 Error de red - Sin conexión a internet';
      } else if (error.response) {
        errorMsg = `📡 Respuesta del servidor: ${error.response.status}`;
      } else {
        errorMsg = `❌ ${error.message}`;
      }
      
      setResult(errorMsg);
      Alert.alert('Error de Prueba', errorMsg + '\n\nVer consola para más detalles.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <View className="bg-yellow-100 p-4 rounded-lg mb-4">
      <Text className="text-sm font-bold mb-2">🧪 Test de Conexión</Text>
      <TouchableOpacity
        className="bg-yellow-500 py-2 px-4 rounded"
        onPress={testDirectConnection}
        disabled={testing}
      >
        <Text className="text-white text-center font-semibold">
          {testing ? 'Probando...' : 'Probar Conexión al Backend'}
        </Text>
      </TouchableOpacity>
      {result ? (
        <Text className="text-xs mt-2">{result}</Text>
      ) : null}
    </View>
  );
}
