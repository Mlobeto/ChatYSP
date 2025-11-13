import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

// Tipos de usuario
const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  country: null,
  deviceId: null,
};

// Acciones asíncronas
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔐 Intentando login:', { email, API: 'https://chatysp.onrender.com/api' });
      
      const response = await authAPI.login(email, password);
      
      console.log('✅ Login response:', response.data);
      
      const { user, token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      console.log('💾 Token y datos guardados');
      
      return { user, token };
    } catch (error) {
      console.error('❌ Login error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        }
      });
      
      const message = error.response?.data?.message || 'Error de autenticación';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, name, phone, country }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register({
        email,
        password,
        name,
        phone,
        country
      });
      
      const { user, token } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      return rejectWithValue(message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verificar que el token siga siendo válido
        const response = await authAPI.verifyToken(token);
        
        return { user: response.data.user, token };
      }
      
      return rejectWithValue('No hay sesión guardada');
    } catch (error) {
      // Limpiar datos inválidos
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      return rejectWithValue('Sesión expirada');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      // Actualizar datos guardados
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue, getState }) => {
    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });
      
      const { user, message } = response.data;
      
      // Actualizar usuario en AsyncStorage si vino actualizado
      if (user) {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        return { user, message };
      }
      
      return { message };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      
      // Limpiar otros estados
      dispatch(chatSlice.actions.clearChat());
      dispatch(roomsSlice.actions.clearRooms());
      
      return true;
    } catch (error) {
      console.error('Error durante logout:', error);
      return true; // Continuar con logout aunque haya errores
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCountry: (state, action) => {
      state.country = action.payload;
    },
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Registro
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Cargar sesión guardada
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Actualizar perfil
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Cambiar contraseña
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        return initialState;
      });
  },
});

export const { clearError, setCountry, setDeviceId, updateUserData } = authSlice.actions;

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectUserCountry = (state) => state.auth.user?.country || state.auth.country;
export const selectUserRole = (state) => state.auth.user?.role || USER_ROLES.USER;

export default authSlice.reducer;