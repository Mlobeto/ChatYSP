# ChatYSP Mobile

Aplicación móvil nativa para iOS y Android construida con Expo React Native, Redux Toolkit y NativeWind.

## 🚀 Características

- **Chat con IA** personalizada del coach
- **Salas de chat** por país en tiempo real
- **Minijuegos** trivia multijugador
- **Tips y videos** del coach
- **Autenticación JWT** integrada
- **Notificaciones push** (próximamente)
- **Interfaz optimizada** para móviles

## 🛠️ Tecnologías

- **Framework**: Expo React Native
- **Estado**: Redux Toolkit
- **Estilos**: NativeWind (Tailwind CSS para React Native)
- **Navegación**: React Navigation v6
- **WebSockets**: Socket.IO Client
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Iconos**: Ionicons
- **Video**: Expo AV

## 📁 Estructura

```
app/
├── screens/         # Pantallas principales
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ChatScreen.js
│   ├── RoomsScreen.js
│   ├── GameScreen.js
│   ├── ProfileScreen.js
│   ├── TipsScreen.js
│   └── LoadingScreen.js
├── components/      # Componentes reutilizables
│   ├── ChatBubble.jsx
│   ├── MessageInput.jsx
│   ├── RoomCard.jsx
│   ├── TipCard.jsx
│   └── LoadingSpinner.jsx
├── redux/          # Estado global
│   ├── store.js
│   ├── authSlice.js
│   ├── chatSlice.js
│   ├── roomsSlice.js
│   ├── gameSlice.js
│   └── tipsSlice.js
├── services/       # Servicios API
│   ├── api.js
│   ├── socketService.js
│   └── locationService.js
├── navigation/     # Configuración de navegación
│   └── AppNavigator.js
└── utils/          # Utilidades
    ├── constants.js
    ├── helpers.js
    └── validators.js
```

## 🚀 Instalación

### Prerequisitos
- Node.js 18+
- Expo CLI
- Dispositivo móvil con Expo Go instalado

### 1. Instalar dependencias
```bash
npm install
```

### 2. Instalar Expo CLI globalmente
```bash
npm install -g @expo/cli
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Iniciar el proyecto
```bash
npm start
```

### 5. Ejecutar en dispositivo
- Escanea el código QR con la app **Expo Go** en tu dispositivo
- O usa un emulador:
  ```bash
  npm run android  # Android
  npm run ios      # iOS (solo en macOS)
  ```

## 📱 Pantallas de la App

### 🔐 Autenticación
- **LoginScreen**: Inicio de sesión con email/contraseña
- **RegisterScreen**: Registro con detección automática de país

### 💬 Chat con IA
- **ChatScreen**: Conversación con el coach IA
  - Burbujas de mensajes personalizadas
  - Indicador "escribiendo..."
  - Historial persistente
  - Respuestas contextuales

### 🌍 Salas por País
- **RoomsScreen**: Salas de chat organizadas por país
  - Lista de salas activas
  - Contador de usuarios conectados
  - Chat en tiempo real con Socket.IO
  - Emojis y reacciones

### 🎮 Minijuegos
- **GameScreen**: Trivia multijugador
  - Preguntas categorizadas
  - Tiempo límite por pregunta
  - Puntuación en tiempo real
  - Leaderboard global

### 💡 Tips y Videos
- **TipsScreen**: Contenido del coach
  - Tips organizados por categorías
  - Videos embebidos
  - Marcado como leído/visto
  - Sistema de favoritos

### 👤 Perfil
- **ProfileScreen**: Información del usuario
  - Edición de perfil
  - Estadísticas de actividad
  - Configuración de la app
  - Cerrar sesión

## 🔧 Configuración

### NativeWind Setup
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
          600: '#0284c7',
          // ...
        }
      }
    },
  },
  plugins: [],
}
```

### Redux Store
```javascript
// app/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
// ...

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    // ...
  },
});
```

### Socket.IO Client
```javascript
// app/services/socketService.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: userToken },
  transports: ['websocket', 'polling'],
});
```

## 🌐 API Integration

### Autenticación
```javascript
// Login
const response = await authAPI.login(email, password);
await AsyncStorage.setItem('userToken', response.data.token);

// Registro
const response = await authAPI.register({
  email, password, name, phone, country
});
```

### Chat con IA
```javascript
// Enviar mensaje
dispatch(sendMessageToAI({
  message: userInput,
  context: { userId, conversationHistory }
}));
```

### Salas de Chat
```javascript
// Unirse a sala
socketService.joinRoom(roomId);
socketService.on('new_message', (message) => {
  dispatch(addMessage(message));
});
```

## 🎨 Diseño y UI

### Paleta de Colores
```javascript
const colors = {
  primary: '#0ea5e9',    // Azul principal
  secondary: '#a855f7',  // Púrpura
  gray: '#6b7280',       // Gris neutro
  success: '#10b981',    // Verde
  error: '#ef4444',      // Rojo
  warning: '#f59e0b',    // Amarillo
};
```

### Componentes Estilizados
```jsx
// Botón principal
<TouchableOpacity className="bg-primary-500 py-4 px-6 rounded-xl">
  <Text className="text-white font-semibold text-center">
    Enviar
  </Text>
</TouchableOpacity>

// Card de sala
<View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
  <Text className="font-semibold text-gray-900">
    Sala Argentina
  </Text>
  <Text className="text-gray-600 text-sm">
    12 usuarios conectados
  </Text>
</View>
```

## 🔄 Estado Global (Redux)

### Auth Slice
```javascript
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  },
  // ...
});
```

### Chat Slice
```javascript
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    isTyping: false,
    conversationId: null,
  },
  // ...
});
```

## 📱 Características Móviles

### Notificaciones Push
```javascript
import * as Notifications from 'expo-notifications';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### Geolocalización
```javascript
import * as Location from 'expo-location';

// Detectar país automáticamente
const location = await Location.getCurrentPositionAsync({});
const country = await Location.reverseGeocodeAsync(location.coords);
```

### Almacenamiento Local
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar datos
await AsyncStorage.setItem('userToken', token);

// Leer datos
const token = await AsyncStorage.getItem('userToken');
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

### Herramientas de Testing
- **Jest**: Framework de testing
- **React Native Testing Library**: Utilidades
- **Detox**: Tests E2E (próximamente)

## 📦 Build y Deployment

### Development Build
```bash
# Crear build de desarrollo
npx expo run:android
npx expo run:ios
```

### Production Build con EAS
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar EAS
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

### Variables de Entorno para Producción
```env
EXPO_PUBLIC_API_URL=https://api.chatysp.com/api
EXPO_PUBLIC_SOCKET_URL=https://api.chatysp.com
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar Expo
npm run android        # Ejecutar en Android
npm run ios           # Ejecutar en iOS
npm run web           # Ejecutar en web

# Build
npm run build:android  # Build Android
npm run build:ios     # Build iOS

# Testing
npm test              # Ejecutar tests
npm run lint          # Linter
```

## 🌟 Características Avanzadas

### Animaciones
```javascript
import { useSharedValue, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### Gestos
```javascript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    // Manejar gesto
  });
```

### Cámara y Media
```javascript
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Tomar foto
const result = await ImagePicker.launchCameraAsync();
```

## 🐛 Solución de Problemas

### Metro Bundle Error
```bash
# Limpiar cache
npx expo r -c

# Reinstalar node_modules
rm -rf node_modules && npm install
```

### Android Build Issues
```bash
# Limpiar build
cd android && ./gradlew clean

# Verificar JAVA_HOME
echo $JAVA_HOME
```

### iOS Build Issues
```bash
# Limpiar DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstalar pods
cd ios && pod install
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-feature`)
3. Ejecuta tests (`npm test`)
4. Commit cambios (`git commit -am 'Add: nueva feature'`)
5. Push a la rama (`git push origin feature/nueva-feature`)
6. Crea un Pull Request

### Estándares de Código
- **ESLint**: Configuración para React Native
- **Prettier**: Formateo automático
- **Conventional Commits**: Mensajes estandarizados

---

Para más información, consulta la [documentación principal](../README.md) del proyecto.