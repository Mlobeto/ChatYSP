import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { loginUser, selectIsLoading, selectError, clearError } from '../redux/authSlice';
import TestConnection from '../components/TestConnection';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Limpiar errores al montar el componente
  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Mostrar errores
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error de Inicio de Sesión', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    console.log('🔵 handleLogin iniciado');
    
    if (!formData.email || !formData.password) {
      Alert.alert('Campos Requeridos', 'Por favor, completa todos los campos');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Email Inválido', 'Por favor, ingresa un email válido');
      return;
    }

    console.log('🔵 Validaciones pasadas, llamando dispatch');

    try {
      const result = await dispatch(loginUser({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      }));
      
      console.log('🔵 Resultado del dispatch:', result);

      if (loginUser.fulfilled.match(result)) {
        // Login exitoso
        console.log('✅ Login exitoso');
        
        // Verificar si es contraseña temporal
        const user = result.payload.user;
        if (user && user.isTemporaryPassword) {
          Alert.alert(
            'Cambio de Contraseña Requerido',
            'Por seguridad, debes cambiar tu contraseña temporal antes de continuar.',
            [
              {
                text: 'Cambiar Ahora',
                onPress: () => navigation.navigate('ChangePassword', { isFirstLogin: true })
              }
            ],
            { cancelable: false }
          );
        }
      } else {
        console.log('❌ Login rechazado:', result);
      }
    } catch (err) {
      console.error('❌ Error capturado en handleLogin:', err);
      Alert.alert('Error', 'Error inesperado: ' + err.message);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" backgroundColor="#f9fafb" />
      
      <ScrollView 
        className="flex-1 bg-gray-50" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-primary-500 rounded-3xl justify-center items-center mb-6 shadow-lg">
              <Ionicons name="chatbubbles" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido!</Text>
            <Text className="text-gray-600 text-center text-base">
              Inicia sesión para conectar con tu coach personal de IA
            </Text>
          </View>

          {/* TEST DE CONEXIÓN - TEMPORAL */}
          <TestConnection />

          {/* Formulario */}
          <View className="space-y-6">
            
            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-base"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#9ca3af" 
                  style={{ position: 'absolute', right: 16, top: 16 }}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-base pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Recordar sesión */}
            <View className="flex-row items-center justify-between">
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  rememberMe ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                }`}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <Text className="text-sm text-gray-700">Recordar sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text className="text-sm text-primary-600 font-medium">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botón de inicio de sesión */}
            <TouchableOpacity
              className={`w-full py-4 rounded-xl items-center ${
                isLoading ? 'bg-gray-400' : 'bg-primary-500'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Iniciando sesión...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-base">
                  Iniciar Sesión
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divisor */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-4 text-sm text-gray-500">o</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Registro */}
          <TouchableOpacity
            className="w-full py-4 border-2 border-primary-500 rounded-xl items-center"
            onPress={goToRegister}
          >
            <Text className="text-primary-600 font-semibold text-base">
              Crear Nueva Cuenta
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-8">
            <Text className="text-xs text-gray-500 text-center">
              Al iniciar sesión, aceptas nuestros{' '}
              <Text className="text-primary-600">Términos de Servicio</Text>
              {' '}y{' '}
              <Text className="text-primary-600">Política de Privacidad</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}