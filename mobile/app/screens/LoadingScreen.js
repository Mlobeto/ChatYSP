import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoadingScreen() {
  return (
    <View className="flex-1 bg-gray-50 justify-center items-center px-6">
      <StatusBar style="light" backgroundColor="#1f2937" />
      
      {/* Logo o icono */}
      <View className="mb-8">
        <View className="w-20 h-20 bg-primary-500 rounded-2xl justify-center items-center mb-4">
          <Text className="text-white text-2xl font-bold">C</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center">ChatYSP</Text>
        <Text className="text-gray-600 text-center mt-2">Tu coach personal de IA</Text>
      </View>

      {/* Indicador de carga */}
      <View className="items-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-gray-600 mt-4 text-center">
          Cargando tu experiencia...
        </Text>
      </View>

      {/* Información adicional */}
      <View className="mt-12 px-4">
        <Text className="text-xs text-gray-400 text-center">
          Conectando con el coaching inteligente
        </Text>
      </View>
    </View>
  );
}