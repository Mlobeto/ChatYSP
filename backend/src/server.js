require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { connectDB, sequelize } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const roomRoutes = require('./routes/roomRoutes');
const gameRoutes = require('./routes/gameRoutes');
const gameRoomRoutes = require('./routes/gameRoomRoutes');
const adminRoutes = require('./routes/adminRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');
const minigameRoutes = require('./routes/minigame');
const tipRoutes = require('./routes/tipRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fedeRoutes = require('./routes/fedeRoutes');
const dailyTipRoutes = require('./routes/dailyTipRoutes');
const footerRoutes = require('./routes/footerRoutes');

// Import socket handlers
const chatSocket = require('./sockets/chatSocket');
const gameSocket = require('./sockets/gameSocket');

// Import scheduler
const dailyTipScheduler = require('./services/dailyTipScheduler');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware setup
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        scriptSrc: ['\'self\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
        connectSrc: ['\'self\'', 'wss:', 'ws:'],
      },
    },
  }),
);

app.use(compression());

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como Postman, apps móviles)
      if (!origin) return callback(null, true);
      
      // Lista de orígenes permitidos
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://chat-ysp.vercel.app',
        process.env.CLIENT_URL,
      ].filter(Boolean);
      
      // Permitir cualquier URL de Vercel (incluyendo preview deployments)
      const isVercelDomain = origin.includes('.vercel.app');
      
      if (allowedOrigins.includes(origin) || isVercelDomain) {
        callback(null, true);
      } else {
        console.warn('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General request logging middleware
app.use((req, res, next) => {
  console.log('📨 INCOMING REQUEST:', {
    method: req.method,
    url: req.url,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'No Auth',
      contentType: req.headers['content-type'] || 'No Content-Type',
    },
    body: req.method === 'POST' ? Object.keys(req.body || {}) : 'No Body',
    timestamp: new Date().toISOString(),
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar handler en lugar de onLimitReached (deprecado en v7)
  handler: (req, res) => {
    console.log('🚨 RATE LIMIT REACHED:', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    });
  },
  skip: (req) => {
    // Log all requests that pass through rate limiter
    console.log('🔄 RATE LIMITER - Request received:', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
    return false; // Don't skip any requests
  },
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for auth (increased for development)
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ChatYSP Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/gamerooms', gameRoomRoutes);
app.use('/api/minigame', minigameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/moderator', moderatorRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fede', fedeRoutes);
app.use('/api/daily-tips', dailyTipRoutes);
app.use('/api/footers', footerRoutes);

// API Documentation endpoint
app.get('/api', (req, res) => {
  const apiDocs = {
    name: 'ChatYSP API',
    version: '1.0.0',
    description: 'API para la plataforma ChatYSP - Comunidad de Bienestar y Crecimiento Personal',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      authentication: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        resetPassword: 'POST /auth/reset-password',
        forgotPassword: 'POST /auth/forgot-password',
        refreshToken: 'POST /auth/refresh',
        logout: 'POST /auth/logout',
      },
      users: {
        getCurrentUser: 'GET /auth/me',
        updateProfile: 'PUT /auth/profile',
      },
      chat: {
        getMessages: 'GET /chat/messages',
        sendMessage: 'POST /chat/messages',
        deleteMessage: 'DELETE /chat/messages/:id',
      },
      rooms: {
        getRooms: 'GET /rooms',
        createRoom: 'POST /rooms',
        joinRoom: 'POST /rooms/:id/join',
        leaveRoom: 'POST /rooms/:id/leave',
        getRoomDetails: 'GET /rooms/:id',
      },
      games: {
        getQuestions: 'GET /games/questions',
        submitAnswer: 'POST /games/answers',
        getStats: 'GET /games/stats',
      },
      gameRooms: {
        getGameRooms: 'GET /gamerooms',
        createGameRoom: 'POST /gamerooms',
        joinGameRoom: 'POST /gamerooms/:id/join',
        leaveGameRoom: 'POST /gamerooms/:id/leave',
      },
      admin: {
        getStats: 'GET /admin/stats',
        getUsers: 'GET /admin/users',
        createUser: 'POST /admin/users',
        updateUser: 'PUT /admin/users/:id',
        deleteUser: 'DELETE /admin/users/:id',
        getRooms: 'GET /admin/rooms',
        getTips: 'GET /admin/tips',
        createTip: 'POST /admin/tips',
      },
      moderator: {
        getReports: 'GET /moderator/reports',
        moderateContent: 'POST /moderator/moderate',
      },
      minigame: {
        start: 'POST /minigame/start',
        answer: 'POST /minigame/answer',
        getResults: 'GET /minigame/results',
      },
    },
    websockets: {
      chat: 'ws://localhost:5000/chat',
      game: 'ws://localhost:5000/game',
    },
    status: {
      health: 'GET /health',
      version: 'GET /version',
    },
    authentication: {
      note: 'La mayoría de endpoints requieren autenticación JWT',
      header: 'Authorization: Bearer <token>',
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      auth: '20 requests per 5 minutes',
    },
  };

  res.json({
    success: true,
    message: 'ChatYSP API Documentation',
    data: apiDocs,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ChatYSP API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Health check endpoint for production
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ChatYSP API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      errors: err.errors.map((e) => e.message),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'El recurso ya existe',
      field: err.errors && err.errors[0] ? err.errors[0].path : null,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
  });
});

// Socket.IO setup
const chatNamespace = io.of('/chat');
const gameNamespace = io.of('/game');

chatSocket(chatNamespace);
gameSocket(gameNamespace);

// Socket.IO error handling
io.engine.on('connection_error', (err) => {
  console.log('Socket connection error:', err.req);
  console.log('Error code:', err.code);
  console.log('Error message:', err.message);
  console.log('Error context:', err.context);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server
  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      // Close database connection
      await sequelize.close();
      console.log('Database connection closed.');

      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';

    server.listen(PORT, HOST, () => {
      console.log(`
🚀 ChatYSP Server started successfully!
📡 Server running on: http://${HOST}:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: PostgreSQL
🔌 Socket.IO: Enabled
📝 API Documentation: http://${HOST}:${PORT}/api
🏥 Health Check: http://${HOST}:${PORT}/health

Socket Namespaces:
💬 Chat: ws://${HOST}:${PORT}/chat
🎮 Game: ws://${HOST}:${PORT}/game
      `);

      // Start daily tip scheduler
      try {
        dailyTipScheduler.start();
        console.log('📅 Daily Tip Scheduler: Started');
      } catch (error) {
        console.error('⚠️  Daily Tip Scheduler: Failed to start', error);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();

module.exports = { app, server, io };
