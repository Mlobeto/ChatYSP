import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../redux/authSlice';
import * as Location from 'expo-location';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Detectar país automáticamente
  const detectCountry = async () => {
    try {
      setIsDetectingLocation(true);
      
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a la ubicación para detectar tu país automáticamente.'
        );
        return;
      }

      // Obtener ubicación
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Hacer geocodificación inversa
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const detectedCountry = geocode[0].country;
        setFormData(prev => ({
          ...prev,
          country: detectedCountry || ''
        }));
        
        Alert.alert(
          'País detectado',
          `Hemos detectado que estás en: ${detectedCountry}`
        );
      }
    } catch (error) {
      console.error('Error detectando país:', error);
      Alert.alert(
        'Error',
        'No pudimos detectar tu país automáticamente. Por favor ingrésalo manualmente.'
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword, country } = formData;

    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'El formato del email no es válido');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'La contraseña es requerida');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (!country.trim()) {
      Alert.alert('Error', 'El país es requerido');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        country: formData.country.trim(),
      })).unwrap();

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada correctamente. Ya puedes comenzar a usar ChatYSP.',
        [{ text: 'OK', onPress: () => navigation.replace('Main') }]
      );
    } catch (error) {
      Alert.alert(
        'Error en el registro',
        error.message || 'Ocurrió un error al crear tu cuenta. Intenta nuevamente.'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-primary-500 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="person-add" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Crear Cuenta
            </Text>
            <Text className="text-gray-600 text-center">
              Únete a ChatYSP y comienza tu journey
            </Text>
          </View>

          {/* Formulario */}
          <View className="space-y-4 mb-6">
            {/* Nombre */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Nombre completo</Text>
              <View className="bg-white rounded-xl px-4 py-4 flex-row items-center border border-gray-200">
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <View className="bg-white rounded-xl px-4 py-4 flex-row items-center border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Teléfono */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Teléfono</Text>
              <View className="bg-white rounded-xl px-4 py-4 flex-row items-center border border-gray-200">
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="+54 11 1234-5678"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* País con detección automática */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">País</Text>
              <View className="flex-row space-x-2">
                <View className="flex-1 bg-white rounded-xl px-4 py-4 flex-row items-center border border-gray-200">
                  <Ionicons name="location-outline" size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="Tu país"
                    value={formData.country}
                    onChangeText={(value) => handleInputChange('country', value)}
                    autoCapitalize="words"
                  />
                </View>
                <TouchableOpacity
                  className="bg-primary-500 rounded-xl px-4 justify-center"
                  onPress={detectCountry}
                  disabled={isDetectingLocation}
                >
                  <Ionicons 
                    name={isDetectingLocation ? "refresh" : "location"} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Toca el icono de ubicación para detectar automáticamente
              </Text>
            </View>

            {/* Contraseña */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Contraseña</Text>
              <View className="bg-white rounded-xl px-4 py-4 flex-row items-center border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">Confirmar contraseña</Text>
              <View className="bg-white rounded-xl px-4 py-4 flex-row items-center border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botón de registro */}
          <TouchableOpacity
            className={`rounded-xl py-4 px-6 mb-4 ${
              isLoading ? 'bg-gray-400' : 'bg-primary-500'
            }`}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-center text-lg">
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Link para login */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-primary-500 font-semibold">Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <Text className="text-red-700 text-center">{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}