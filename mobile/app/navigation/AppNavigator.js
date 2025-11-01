import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatScreen from '../screens/ChatScreen';
import RoomsScreen from '../screens/RoomsScreen';
import GameScreen from '../screens/GameScreen';
import MiniGameScreen from '../screens/MiniGameScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TipsScreen from '../screens/TipsScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Redux
import { loadStoredAuth, selectIsAuthenticated, selectIsLoading } from '../redux/authSlice';
import socketService from '../services/socketService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de autenticación (para usuarios no autenticados)
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f9fafb' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegación de juegos con stack
function GamesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4f46e5',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="GameMenu" 
        component={GameScreen} 
        options={{
          title: 'Juegos',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="MiniGame" 
        component={MiniGameScreen} 
        options={{
          title: 'Quiz Challenge',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

// Navegación principal con tabs (para usuarios autenticados)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Salas') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Juegos') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Tips') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1f2937',
        },
        headerTintColor: '#1f2937',
      })}
    >
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{
          title: 'Coach IA',
          headerTitle: 'Conversación con el Coach'
        }}
      />
      <Tab.Screen 
        name="Salas" 
        component={RoomsScreen} 
        options={{
          title: 'Salas',
          headerTitle: 'Salas por País'
        }}
      />
      <Tab.Screen 
        name="Juegos" 
        component={GamesNavigator} 
        options={{
          title: 'Juegos',
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Tips" 
        component={TipsScreen} 
        options={{
          title: 'Tips',
          headerTitle: 'Tips y Videos'
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil'
        }}
      />
    </Tab.Navigator>
  );
}

// Navegador principal de la app
export default function AppNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    // Intentar cargar sesión guardada al iniciar la app
    dispatch(loadStoredAuth());
  }, [dispatch]);

  useEffect(() => {
    // Configurar socket cuando el usuario está autenticado
    if (isAuthenticated) {
      const initializeSocket = async () => {
        const connected = await socketService.connect();
        if (connected) {
          // Configurar listeners de Redux
          socketService.setupReduxListeners(dispatch);
        }
      };
      
      initializeSocket();
    } else {
      // Desconectar socket cuando no está autenticado
      socketService.disconnect();
    }

    // Cleanup al desmontar
    return () => {
      if (!isAuthenticated) {
        socketService.clearListeners();
      }
    };
  }, [isAuthenticated, dispatch]);

  // Mostrar pantalla de carga mientras verifica autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {isAuthenticated ? (
        // Usuario autenticado - mostrar app principal
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        // Usuario no autenticado - mostrar pantallas de login
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}