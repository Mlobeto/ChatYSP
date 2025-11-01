import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { store, persistor } from './app/redux/store';
import AppNavigator from './app/navigation/AppNavigator';
import { initializeApp } from './app/services/api';
import LoadingScreen from './app/screens/LoadingScreen';

// Mantener splash screen mientras carga
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Cargar fuentes personalizadas si las hay
        await Font.loadAsync({
          // 'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          // 'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          // 'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
        });

        // Inicializar servicios de la app
        await initializeApp();

        // Simular tiempo de carga mínimo para mostrar splash
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error durante la inicialización:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Ocultar splash screen cuando la app esté lista
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <NavigationContainer>
            <StatusBar style="auto" backgroundColor="#f3f4f6" />
            <AppNavigator />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}