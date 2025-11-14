import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/authSlice';

export default function HomeScreen({ navigation }) {
  const user = useSelector(selectUser);

  const menuOptions = [
    {
      id: 1,
      title: 'Chat con Fede',
      subtitle: 'Tu coach personal de IA',
      icon: 'chatbubbles',
      color: '#0ea5e9',
      gradient: 'from-sky-400 to-blue-500',
      route: 'Chat',
    },
    {
      id: 2,
      title: 'Salas de Chat',
      subtitle: 'Conecta con personas de tu país',
      icon: 'people',
      color: '#8b5cf6',
      gradient: 'from-purple-400 to-violet-500',
      route: 'ChatRooms',
    },
    {
      id: 3,
      title: 'Salas de Juego',
      subtitle: 'Pasa tiempo divirtiéndote',
      icon: 'game-controller',
      color: '#f59e0b',
      gradient: 'from-amber-400 to-orange-500',
      route: 'GameRooms',
    },
  ];

  const handleNavigation = (route) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500 mb-1">
                ¡Hola de nuevo!
              </Text>
              <Text className="text-2xl font-bold text-gray-900">
                {user?.name || 'Usuario'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Perfil')}
              className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center"
            >
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bienvenida */}
        <View className="px-6 py-6">
          <Text className="text-lg text-gray-700 mb-2">
            ¿Qué te gustaría hacer hoy?
          </Text>
          <Text className="text-sm text-gray-500">
            Elige una opción para comenzar
          </Text>
        </View>

        {/* Menu Options */}
        <View className="px-6 pb-6 space-y-4">
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleNavigation(option.route)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{
                shadowColor: option.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: option.color + '20' }}
                >
                  <Ionicons
                    name={option.icon}
                    size={32}
                    color={option.color}
                  />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    {option.title}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {option.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="#9ca3af"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View className="px-6 pb-6">
          <View className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6">
            <Text className="text-white text-lg font-semibold mb-2">
              💡 Consejo del día
            </Text>
            <Text className="text-white/90 text-sm">
              Recuerda: El crecimiento personal comienza con pequeños pasos diarios. 
              ¡Conecta con tu coach IA para comenzar!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
