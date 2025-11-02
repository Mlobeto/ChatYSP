import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import authReducer from './authSlice';
import gameRoomsReducer from './gameRoomsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    auth: authReducer,
    gameRooms: gameRoomsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});