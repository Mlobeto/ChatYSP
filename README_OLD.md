# ChatYSP 💬🎮

**Chat en tiempo real con juegos integrados y asistente de IA**

Una plataforma de chat moderna que combina mensajería instantánea, juegos de trivia en tiempo real y asistencia por inteligencia artificial, construida con Node.js, Socket.IO y PostgreSQL.

## ✨ Características

### 💬 **Chat en Tiempo Real**
- Mensajería instantánea con Socket.IO
- Salas públicas y privadas
- Reacciones a mensajes y respuestas
- Indicadores de escritura
- Edición y eliminación de mensajes
- Sistema de moderación

### 🎮 **Juegos Integrados**
- Juegos de trivia multijugador
- Sistema de puntuación y rankings
- Múltiples categorías y dificultades
- Estadísticas de jugadores
- Logros y niveles

### 🤖 **Asistente IA con Coaching Ontológico**
- **Coach Virtual Personalizado**: IA entrenada con conocimiento especializado en coaching ontológico
- **Respuestas Empáticas**: Genera respuestas que validan emociones y fomentan la reflexión profunda
- **Preguntas Transformadoras**: Utiliza técnicas de coaching para ayudar a encontrar respuestas propias
- **Análisis Emocional**: Detecta el tono emocional de los mensajes y responde apropiadamente
- **Base de Conocimiento Dinámica**: Sistema modular que carga tips, principios y recursos de coaching
- **Moderación Inteligente**: Filtra contenido inapropiado manteniendo el enfoque en crecimiento personal
- **Sugerencias Contextuales**: Propone respuestas empáticas, reflexivas y motivadoras

### 👥 **Gestión de Usuarios**
- Registro y autenticación JWT
- Perfiles de usuario personalizables
- Sistema de roles (usuario/admin)
- Estado en línea/desconectado

### 🔧 **Panel de Administración**
- Gestión completa de usuarios
- Moderación de salas y mensajes
- Estadísticas del sistema
- Gestión de preguntas de trivia

## 🏗️ Arquitectura

```
ChatYSP/
├── src/
│   ├── config/          # Configuraciones (DB, OpenAI)
│   ├── models/          # Modelos de Sequelize
│   ├── controllers/     # Lógica de controladores
│   ├── routes/          # Rutas de la API
│   ├── middlewares/     # Middlewares personalizados
│   ├── sockets/         # Manejadores de Socket.IO
│   ├── services/        # Servicios de negocio
│   └── server.js        # Punto de entrada
├── package.json
├── .env.example
└── README.md
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** >= 8.0.0
- Cuenta de **OpenAI** (opcional para IA)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Mlobeto/ChatYSP.git
cd ChatYSP
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Configurar base de datos PostgreSQL**
```bash
# Crear base de datos
createdb chatysp

# O usando psql
psql -U postgres
CREATE DATABASE chatysp;
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:5000`

## ⚙️ Configuración

### Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Base de Datos
DB_NAME=chatysp
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# OpenAI (opcional)
OPENAI_API_KEY=sk-your-api-key
```

### Base de Datos

El sistema utilizará **Sequelize** para manejar automáticamente las migraciones y la sincronización de la base de datos en desarrollo.

## 📡 API Endpoints

### Autenticación
```
POST /api/auth/register     # Registro de usuario
POST /api/auth/login        # Inicio de sesión
POST /api/auth/logout       # Cerrar sesión
GET  /api/auth/profile      # Obtener perfil
PUT  /api/auth/profile      # Actualizar perfil
```

### Salas
```
GET  /api/rooms             # Listar salas
POST /api/rooms             # Crear sala
GET  /api/rooms/:id         # Obtener sala
PUT  /api/rooms/:id         # Actualizar sala
POST /api/rooms/:id/join    # Unirse a sala
POST /api/rooms/:id/leave   # Salir de sala
```

### Chat
```
GET  /api/chat/rooms/:id/messages  # Obtener mensajes
POST /api/chat/rooms/:id/messages  # Enviar mensaje
PUT  /api/chat/messages/:id        # Editar mensaje
DELETE /api/chat/messages/:id      # Eliminar mensaje
```

### Juegos
```
POST /api/games/rooms/:id/games       # Crear juego
POST /api/games/rooms/:id/games/join  # Unirse a juego
POST /api/games/rooms/:id/games/start # Iniciar juego
POST /api/games/rooms/:id/games/answer # Enviar respuesta
GET  /api/games/rooms/:id/games/status # Estado del juego
```

### Administración
```
GET  /api/admin/stats        # Estadísticas del sistema
GET  /api/admin/users        # Gestionar usuarios
GET  /api/admin/rooms        # Gestionar salas
POST /api/admin/questions    # Crear preguntas
```

## 🔌 WebSocket Events

### Chat Namespace (`/chat`)
```javascript
// Cliente → Servidor
socket.emit('joinRoom', { roomId })
socket.emit('sendMessage', { roomId, content, messageType })
socket.emit('editMessage', { messageId, content })
socket.emit('startTyping', { roomId })

// Servidor → Cliente
socket.on('newMessage', (message))
socket.on('userJoinedRoom', (user))
socket.on('userTyping', (user))
socket.on('messageEdited', (message))
```

### Game Namespace (`/game`)
```javascript
// Cliente → Servidor
socket.emit('createGame', { roomId, settings })
socket.emit('joinGame', { roomId })
socket.emit('submitAnswer', { roomId, answerIndex })

// Servidor → Cliente
socket.on('gameCreated', (gameInfo))
socket.on('gameStarted', (question))
socket.on('nextQuestion', (question))
socket.on('gameFinished', (results))
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🎯 Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Desarrollo con nodemon
npm run dev:debug  # Desarrollo con debugger
npm test           # Ejecutar tests
npm run lint       # Linter ESLint
npm run lint:fix   # Corregir errores de lint
npm run format     # Formatear código con Prettier
npm run build      # Lint + Tests
```

## 🏗️ Modelos de Datos

### User
- `id`, `username`, `email`, `password`
- `avatar`, `isOnline`, `lastSeen`
- `role`, `points`, `level`
- `gamesWon`, `gamesPlayed`

### Room
- `id`, `name`, `description`, `roomType`
- `maxUsers`, `password`, `createdById`
- `isActive`, `settings`, `userCount`

### Message
- `id`, `content`, `senderId`, `roomId`
- `messageType`, `isEdited`, `editedAt`
- `replyToId`, `reactions`, `isDeleted`

### Question
- `id`, `question`, `options`, `correctAnswer`
- `category`, `difficulty`, `points`
- `isActive`, `timesUsed`, `correctAnswers`

## 🔧 Características Técnicas

- **Backend**: Node.js + Express
- **WebSockets**: Socket.IO
- **Base de Datos**: PostgreSQL + Sequelize ORM
- **Autenticación**: JWT
- **IA**: OpenAI GPT API
- **Validación**: Express-validator
- **Seguridad**: Helmet, CORS, Rate limiting
- **Logs**: Winston + Morgan
- **Tests**: Jest + Supertest

## 🚀 Deployment

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
# Build
npm run build

# Start
NODE_ENV=production npm start
```

### Docker (Opcional)
```dockerfile
# Dockerfile básico
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 5000
CMD ["npm", "start"]
```

## � Sistema de Coaching Ontológico

### Filosofía y Enfoque

ChatYSP integra un sistema de **Coaching Ontológico** que trasciende las respuestas tradicionales de IA para ofrecer una experiencia transformadora centrada en el crecimiento personal.

### Características del Coach Virtual

**🎯 Personalidad Definida**
- Coach empático especializado en ontología del ser
- Enfoque no directivo que fomenta el autodescubrimiento
- Uso de lenguaje cercano y auténtico (segunda persona singular)
- Validación emocional antes de explorar perspectivas

**🧠 Base de Conocimiento Especializada**
- **Tips de Coaching**: Consejos categorizados por áreas (relaciones, autoestima, miedos, propósito)
- **Principios Ontológicos**: Fundamentos del coaching ontológico aplicados
- **Frases Empoderadoras**: Afirmaciones para momentos de vulnerabilidad
- **Preguntas Reflexivas**: Herramientas para generar insight profundo

**🔄 Sistema Dinámico**
- Carga automática del conocimiento desde `data/coach_knowledge.json`
- Cache inteligente para optimizar rendimiento
- Actualización en tiempo real sin reiniciar el servidor
- Filtrado contextual según el estado emocional detectado

### Funcionalidades Técnicas

**📊 Análisis Emocional**
```javascript
// Detecta automáticamente
- Emoción principal (alegría, tristeza, miedo, etc.)
- Intensidad emocional (baja, media, alta)
- Necesidad subyacente (apoyo, validación, claridad)
```

**💬 Generación Contextual**
```javascript
// Tipos de respuesta adaptativa
generateChatResponse()     // Respuesta principal del coach
generateReflectionPrompt() // Pregunta de coaching profunda
generateSmartReplies()     // Sugerencias empáticas rápidas
analyzeEmotionalTone()     // Análisis del estado emocional
```

**🛡️ Moderación Especializada**
- Filtros específicos para espacios de crecimiento personal
- Detección de contenido que vaya contra principios del coaching
- Respuestas automáticas que reconducen hacia la reflexión constructiva

### Ejemplos de Interacción

**Usuario**: *"Me siento perdido en mi trabajo, no sé si es lo que realmente quiero"*

**Coach**: *"Escucho que hay una desconexión entre lo que hacés y lo que sentís. ¿Qué momentos de tu día laboral te generan mayor energía? ¿Y cuáles te la drenan? 🤔"*

**Usuario**: *"No puedo superar esta ruptura"*

**Coach**: *"El dolor que sentís es válido y parte de tu proceso. ¿Qué te enseñó esta relación sobre vos mismo? ¿Qué aspectos de quién eras en esa relación querés conservar y cuáles transformar?"*

### Estructura del Archivo de Conocimiento

```json
{
  "coach_info": {
    "name": "Coach YSP",
    "specialty": "Coaching Ontológico",
    "approach": "Empático, motivador, no directivo"
  },
  "coaching_tips": [
    {
      "category": "autoestima",
      "content": "Tu valor no depende de logros externos...",
      "context": "Cuando alguien se siente 'menos que' otros"
    }
  ],
  "core_principles": [
    "La acción imperfecta vale más que la espera perfecta",
    "El progreso se mide en consistencia, no en velocidad"
  ],
  "empowering_phrases": [
    "Tu experiencia es válida y valiosa",
    "Tenés todo lo que necesitás dentro tuyo"
  ],
  "reflection_prompts": [
    "¿Qué te diría tu yo más sabio sobre esta situación?",
    "¿Cómo cambiarías tu perspectiva si esto fuera temporal?"
  ]
}
```

### Configuración y Personalización

**Modificar el Conocimiento**
1. Editar `data/coach_knowledge.json`
2. El sistema recarga automáticamente cada 5 minutos
3. Usar `invalidateCache()` para forzar recarga inmediata

**Configurar Variables de Entorno**
```env
# OpenAI API para el servicio de coaching
OPENAI_API_KEY=tu-clave-api
OPENAI_MODEL=gpt-4  # Recomendado para mejor calidad
```

**Personalizar Respuestas**
- Ajustar `maxContextLength` en `aiService.js`
- Modificar prompts en `buildEnhancedSystemPrompt()`
- Añadir nuevas categorías en `findRelevantTips()`

## �🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Implementar Redis para scaling
- [ ] Añadir más tipos de juegos
- [ ] Sistema de notificaciones push
- [ ] Integración con redes sociales
- [ ] App móvil con React Native
- [ ] Voice chat
- [ ] Streaming de video

## 🐛 Problemas Conocidos

- En desarrollo, la base de datos se sincroniza automáticamente
- Los juegos se almacenan en memoria (usar Redis en producción)
- Rate limiting básico (considerar Redis para producción)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: ChatYSP Team
- **Repositorio**: [https://github.com/Mlobeto/ChatYSP](https://github.com/Mlobeto/ChatYSP)

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 🐛 [Reportar bug](https://github.com/Mlobeto/ChatYSP/issues)
- 💡 [Solicitar feature](https://github.com/Mlobeto/ChatYSP/issues)
- 📧 Email: support@chatysp.com

---

⭐ **¡Dale una estrella al proyecto si te gusta!** ⭐
