import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  // Inicializar conexión Socket.IO
  async connect(userId = null) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('No hay token para conectar socket');
        return false;
      }

      const SOCKET_URL = __DEV__ 
        ? 'http://localhost:5000' 
        : 'https://api.chatysp.com';

      // Configuración del socket
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
          userId
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      // Eventos de conexión
      this.socket.on('connect', () => {
        console.log('✅ Socket conectado:', this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('socket_connected', { socketId: this.socket.id });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket desconectado:', reason);
        this.isConnected = false;
        this.emit('socket_disconnected', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión socket:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('socket_error', { 
            error: 'No se pudo conectar al servidor',
            maxAttemptsReached: true 
          });
        }
      });

      // Eventos de autenticación
      this.socket.on('auth_error', (error) => {
        console.error('❌ Error de autenticación socket:', error);
        this.disconnect();
        this.emit('auth_error', error);
      });

      this.socket.on('auth_success', (data) => {
        console.log('✅ Autenticación socket exitosa:', data);
        this.emit('auth_success', data);
      });

      return true;
    } catch (error) {
      console.error('Error inicializando socket:', error);
      return false;
    }
  }

  // Desconectar socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket desconectado manualmente');
    }
  }

  // Emitir evento
  emit(event, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`No se puede emitir evento ${event}: socket no conectado`);
    }
  }

  // Escuchar evento
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Guardar referencia para poder remover después
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remover listener específico
  off(event, callback = null) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
        
        // Remover de la lista de listeners
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
          const index = eventListeners.indexOf(callback);
          if (index > -1) {
            eventListeners.splice(index, 1);
          }
        }
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  // Métodos específicos para chat
  joinRoom(roomId) {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId) {
    this.emit('leave_room', { roomId });
  }

  sendMessage(roomId, message) {
    this.emit('send_message', {
      roomId,
      message,
      timestamp: new Date().toISOString()
    });
  }

  startTyping(roomId) {
    this.emit('typing_start', { roomId });
  }

  stopTyping(roomId) {
    this.emit('typing_stop', { roomId });
  }

  // Métodos específicos para juegos
  joinGame(gameId, gameType) {
    this.emit('join_game', { gameId, gameType });
  }

  leaveGame(gameId) {
    this.emit('leave_game', { gameId });
  }

  sendGameMove(gameId, move) {
    this.emit('game_move', { gameId, move });
  }

  inviteToGame(userId, gameType) {
    this.emit('game_invite', { userId, gameType });
  }

  respondGameInvite(inviteId, accept) {
    this.emit('game_invite_response', { inviteId, accept });
  }

  // Configurar listeners comunes para Redux
  setupReduxListeners(dispatch) {
    // Eventos de chat
    this.on('new_message', (data) => {
      dispatch({ type: 'rooms/addMessage', payload: data });
    });

    this.on('user_joined', (data) => {
      dispatch({ type: 'rooms/userJoined', payload: data });
    });

    this.on('user_left', (data) => {
      dispatch({ type: 'rooms/userLeft', payload: data });
    });

    this.on('typing_start', (data) => {
      dispatch({ type: 'rooms/setTyping', payload: { ...data, isTyping: true } });
    });

    this.on('typing_stop', (data) => {
      dispatch({ type: 'rooms/setTyping', payload: { ...data, isTyping: false } });
    });

    // Eventos de juegos
    this.on('game_started', (data) => {
      dispatch({ type: 'game/gameStarted', payload: data });
    });

    this.on('game_move', (data) => {
      dispatch({ type: 'game/moveMade', payload: data });
    });

    this.on('game_ended', (data) => {
      dispatch({ type: 'game/gameEnded', payload: data });
    });

    this.on('game_invite', (data) => {
      dispatch({ type: 'game/inviteReceived', payload: data });
    });

    // Eventos de notificaciones
    this.on('notification', (data) => {
      dispatch({ type: 'notifications/add', payload: data });
    });

    // Eventos de errores
    this.on('error', (data) => {
      dispatch({ type: 'app/setError', payload: data });
    });
  }

  // Limpiar todos los listeners
  clearListeners() {
    if (this.socket) {
      for (const [event, callbacks] of this.listeners) {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      }
      this.listeners.clear();
    }
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Instancia singleton
const socketService = new SocketService();

export default socketService;