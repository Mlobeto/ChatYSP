import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import roomsReducer from './roomsSlice';
import gameReducer from './gameSlice';
import tipsReducer from './tipsSlice';
import userStatsReducer from './userStatsSlice';

// Configuración de persistencia para userStats
const userStatsPersistConfig = {
  key: 'userStats',
  storage: AsyncStorage,
  whitelist: ['miniGameStats', 'categoryStats', 'achievements', 'gameSettings', 'recentGames']
};

// Configuración de persistencia para auth
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'token', 'isAuthenticated']
};

// Combinar reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  chat: chatReducer,
  rooms: roomsReducer,
  game: gameReducer,
  tips: tipsReducer,
  userStats: persistReducer(userStatsPersistConfig, userStatsReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas de Socket.IO y redux-persist
        ignoredActions: [
          'socket/connected', 
          'socket/disconnected',
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        // Ignorar rutas específicas en el estado
        ignoredPaths: ['socket.socket'],
      },
    }),
  devTools: __DEV__, // Solo en desarrollo
});

export const persistor = persistStore(store);
export default store;