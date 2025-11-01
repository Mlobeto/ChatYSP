# ChatYSP Backend

Backend del sistema ChatYSP - Servidor Node.js con Express, Socket.IO y PostgreSQL.

## 🚀 Características

- **API RESTful** completa con Express.js
- **WebSockets** en tiempo real con Socket.IO
- **Base de datos PostgreSQL** con Sequelize ORM
- **Autenticación JWT** con bcrypt
- **Sistema de IA** con OpenAI GPT-4
- **Logging estructurado** con Winston
- **Testing** con Jest
- **Validación de datos** con Joi

## 📁 Estructura

```
src/
├── config/         # Configuraciones (DB, JWT, OpenAI)
├── controllers/    # Lógica de controladores de API
├── middleware/     # Middlewares personalizados
├── models/         # Modelos de base de datos (Sequelize)
├── routes/         # Definición de rutas de API
├── services/       # Servicios de negocio (IA, juegos, etc.)
├── sockets/        # Manejo de eventos WebSocket
├── utils/          # Utilidades y helpers
└── server.js       # Punto de entrada del servidor

data/
├── coaching/       # Base de conocimiento IA
└── games/          # Datos de juegos (preguntas, etc.)
```

## 🛠️ Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=tu-clave-secreta-muy-segura
JWT_EXPIRES_IN=7d

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatysp
DB_USER=tu-usuario
DB_PASSWORD=tu-password

# OpenAI para IA
OPENAI_API_KEY=tu-clave-openai

# Configuración de archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50MB
```

3. **Configurar PostgreSQL**
```bash
# Crear base de datos
createdb chatysp

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeds (opcional)
npm run db:seed
```

4. **Iniciar servidor**
```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start
```

## 📡 API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `GET /me` - Perfil del usuario autenticado
- `PUT /profile` - Actualizar perfil
- `PUT /change-password` - Cambiar contraseña

### Salas (`/api/rooms`)
- `GET /` - Listar salas públicas
- `POST /` - Crear nueva sala
- `GET /:id` - Obtener sala específica
- `PUT /:id` - Actualizar sala (solo creador/admin)
- `DELETE /:id` - Eliminar sala (solo creador/admin)
- `POST /:id/join` - Unirse a sala
- `POST /:id/leave` - Abandonar sala

### Chat (`/api/chat`)
- `GET /:roomId/messages` - Historial de mensajes
- `POST /:roomId/messages` - Enviar mensaje
- `DELETE /messages/:id` - Eliminar mensaje (solo autor/admin)

### Juegos (`/api/games`)
- `POST /rps/invite` - Invitar a Piedra, Papel, Tijera
- `POST /rps/respond` - Responder invitación RPS
- `POST /rps/play` - Hacer jugada RPS
- `POST /trivia/start` - Iniciar sesión de trivial
- `POST /trivia/answer` - Responder pregunta
- `GET /trivia/leaderboard` - Ranking de trivial

### IA (`/api/ai`)
- `POST /chat` - Chat con asistente IA
- `GET /knowledge` - Obtener conocimiento disponible
- `POST /knowledge/reload` - Recargar base de conocimiento

### Admin (`/api/admin`) - Solo administradores
- `GET /stats` - Estadísticas del sistema
- `GET /users` - Gestión de usuarios
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /logs` - Logs del sistema

## 🔌 Eventos Socket.IO

### Namespace: `/chat`
- `join_room` - Unirse a sala
- `leave_room` - Abandonar sala
- `send_message` - Enviar mensaje
- `new_message` - Nuevo mensaje recibido
- `user_joined` - Usuario se unió
- `user_left` - Usuario abandonó
- `typing_start` - Usuario escribiendo
- `typing_stop` - Usuario dejó de escribir

### Namespace: `/games`
- `rps_invite` - Invitación a RPS
- `rps_response` - Respuesta a invitación
- `rps_play` - Jugada realizada
- `rps_result` - Resultado del juego
- `trivia_question` - Nueva pregunta
- `trivia_answer` - Respuesta enviada
- `trivia_result` - Resultado de pregunta

## 🤖 Sistema de IA

### Arquitectura
El sistema de IA utiliza OpenAI GPT-4 con una base de conocimiento especializada:

```
data/coaching/
├── core_knowledge.json       # Conocimiento fundamental
├── conversation_patterns.json # Patrones de conversación
├── coaching_techniques.json   # Técnicas de coaching
└── personality_traits.json    # Rasgos de personalidad
```

### Características
- **Carga dinámica** de conocimiento
- **Contextualización** automática
- **Memoria de conversación** por usuario
- **Respuestas personalizadas** según el historial

### Configuración
```javascript
// services/aiService.js
const AI_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 500,
  system_role: 'coaching_assistant'
};
```

## 🎮 Sistema de Juegos

### Piedra, Papel, Tijera
- Invitaciones en tiempo real
- Sistema de puntuación
- Estadísticas de victorias
- Múltiples partidas simultáneas

### Trivial
- Preguntas categorizadas
- Niveles de dificultad
- Puntuación por tiempo
- Ranking global

### Extensibilidad
Para agregar nuevos juegos:
1. Crear servicio en `services/games/`
2. Definir eventos Socket.IO
3. Agregar rutas API
4. Implementar lógica de puntuación

## 🔐 Autenticación y Autorización

### Roles de Usuario
- `user` - Usuario básico (chat, juegos)
- `moderator` - Moderador (gestión de salas)
- `admin` - Administrador (acceso completo)

### Middleware de Autenticación
```javascript
// middleware/auth.js
const requireAuth = (req, res, next) => {
  // Verificar JWT token
};

const requireRole = (role) => (req, res, next) => {
  // Verificar rol específico
};
```

## 📊 Logging

### Configuración Winston
```javascript
// config/logger.js
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Niveles de Log
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `debug` - Información de depuración

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Generar coverage
npm run test:coverage
```

### Estructura de Tests
```
tests/
├── unit/           # Tests unitarios
├── integration/    # Tests de integración
├── fixtures/       # Datos de prueba
└── helpers/        # Utilidades de testing
```

## 🚀 Scripts NPM

- `npm start` - Iniciar en producción
- `npm run dev` - Desarrollo con nodemon
- `npm run dev:debug` - Desarrollo con debugger
- `npm test` - Ejecutar tests
- `npm run lint` - Linter ESLint
- `npm run format` - Formatear código con Prettier
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Ejecutar seeds
- `npm run db:reset` - Resetear base de datos

## 🔧 Configuración de Producción

### Variables de Entorno
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=clave-super-secreta-para-produccion

# Base de datos
DB_HOST=tu-servidor-db
DB_NAME=chatysp_prod
DB_USER=chatysp_user
DB_PASSWORD=password-seguro

# OpenAI
OPENAI_API_KEY=clave-produccion

# Configuración adicional
CORS_ORIGIN=https://tu-dominio.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Optimizaciones
- Activar compresión gzip
- Configurar rate limiting
- Habilitar CORS específico
- Logging optimizado para producción

## 📈 Monitoreo

### Métricas Disponibles
- Usuarios conectados
- Mensajes por minuto
- Respuestas de IA
- Errores del sistema
- Uso de memoria y CPU

### Endpoints de Health Check
- `GET /health` - Estado básico del servidor
- `GET /health/db` - Estado de la base de datos
- `GET /health/ai` - Estado del servicio de IA

## 🐛 Solución de Problemas

### Errores Comunes

**Error de conexión a PostgreSQL**
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Verificar configuración en .env
echo $DB_HOST $DB_NAME $DB_USER
```

**Error de OpenAI API**
```bash
# Verificar clave API
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**Problemas de WebSocket**
- Verificar configuración de CORS
- Comprobar configuración del proxy
- Revisar logs de conexión

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Ejecuta tests (`npm test`)
4. Commit cambios (`git commit -am 'Add: nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/nueva-funcionalidad`)
6. Crea un Pull Request

### Estándares de Código
- ESLint para linting
- Prettier para formateo
- Conventional Commits para mensajes
- Jest para testing

---

Para más información, consulta la [documentación principal](../README.md) del proyecto.