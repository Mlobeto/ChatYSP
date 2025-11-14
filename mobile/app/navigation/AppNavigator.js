import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import RoomsScreen from '../screens/RoomsScreen';
import GameRoomsScreen from '../screens/GameRoomsScreen';
import GameScreen from '../screens/GameScreen';
import MiniGameScreen from '../screens/MiniGameScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TipsScreen from '../screens/TipsScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

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
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
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

// Navegación principal (para usuarios autenticados)
function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ChatRooms" component={RoomsScreen} />
      <Stack.Screen name="GameRooms" component={GameRoomsScreen} />
      <Stack.Screen name="GameMenu" component={GamesNavigator} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
      <Stack.Screen name="Tips" component={TipsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

// Navegador principal de la app
export default function AppNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    // Solo intentar cargar sesión guardada si no está ya autenticado
    if (!isAuthenticated) {
      dispatch(loadStoredAuth());
    }
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
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // Usuario no autenticado - mostrar pantallas de login
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}