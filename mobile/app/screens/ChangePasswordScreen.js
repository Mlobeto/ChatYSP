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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, selectIsLoading } from '../redux/authSlice';

export default function ChangePasswordScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const isFirstLogin = route?.params?.isFirstLogin || false;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassword = () => {
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Ingresa tu contraseña actual');
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert('Error', 'Ingresa tu nueva contraseña');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      const result = await dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }));

      if (changePassword.fulfilled.match(result)) {
        Alert.alert(
          'Éxito',
          'Contraseña cambiada correctamente',
          [
            {
              text: 'OK',
              onPress: () => {
                if (isFirstLogin) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                } else {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.payload || 'No se pudo cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Ocurrió un error al cambiar la contraseña');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="bg-white px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center">
              {!isFirstLogin && (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="w-10 h-10 items-center justify-center mr-3"
                >
                  <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
              )}
              <Text className="text-xl font-bold text-gray-900">
                Cambiar Contraseña
              </Text>
            </View>
          </View>

          <View className="flex-1 px-6 py-8">
            {isFirstLogin && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={24} color="#f59e0b" />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-yellow-900 mb-1">
                      Contraseña temporal
                    </Text>
                    <Text className="text-sm text-yellow-800">
                      Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Form */}
            <View className="space-y-5">
              {/* Current Password */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-base pr-12"
                    placeholder="Ingresa tu contraseña actual"
                    value={formData.currentPassword}
                    onChangeText={(text) => handleInputChange('currentPassword', text)}
                    secureTextEntry={!showCurrentPassword}
                    autoComplete="password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-base pr-12"
                    placeholder="Ingresa tu nueva contraseña"
                    value={formData.newPassword}
                    onChangeText={(text) => handleInputChange('newPassword', text)}
                    secureTextEntry={!showNewPassword}
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Mínimo 6 caracteres
                </Text>
              </View>

              {/* Confirm Password */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-base pr-12"
                    placeholder="Confirma tu nueva contraseña"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password-new"
                    textContentType="newPassword"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9ca3af"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`w-full py-4 rounded-xl items-center mt-4 ${
                  isLoading ? 'bg-gray-400' : 'bg-primary-500'
                }`}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <Text className="text-white font-semibold text-base">
                  {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Text>
              </TouchableOpacity>

              {!isFirstLogin && (
                <TouchableOpacity
                  className="w-full py-4 items-center"
                  onPress={() => navigation.goBack()}
                >
                  <Text className="text-gray-600 font-medium text-base">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
