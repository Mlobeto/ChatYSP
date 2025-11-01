# 🎮 ChatYSP - Sistema de Minijuego Completo

[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Redux](https://img.shields.io/badge/Redux%20Toolkit-1.9-purple.svg)](https://redux-toolkit.js.org/)

Sistema de minijuego interactivo con quiz trivia para la aplicación ChatYSP. Incluye puntuación, niveles, logros y administración completa.

## 🚀 Características Principales

### 🎯 Sistema de Juego
- **Quiz Interactivo**: Preguntas de múltiple opción con timer
- **Categorías**: Coaching, Bienestar, General, Tecnología
- **Dificultades**: Fácil, Medio, Difícil
- **Sistema de Puntos**: Puntuación basada en tiempo y dificultad
- **Progresión**: Niveles y experiencia (XP)
- **Logros**: Sistema de achievements desbloqueables

### 🎨 Interfaz de Usuario
- **Animaciones**: React Native Reanimated + Lottie
- **Diseño**: NativeWind (Tailwind CSS nativo)
- **Feedback Visual**: Confetti, indicadores de progreso
- **Sonidos**: Efectos de audio para interacciones
- **Responsive**: Adaptado a diferentes tamaños de pantalla

### 📊 Persistencia de Datos
- **Estado Local**: Redux Toolkit + Redux Persist
- **Almacenamiento**: AsyncStorage para datos offline
- **Sincronización**: Backend API con fallback local
- **Estadísticas**: Tracking completo de partidas

### 🛠️ Panel de Administración
- **Gestión de Preguntas**: CRUD completo
- **Estadísticas**: Dashboard con métricas del juego
- **Configuración**: Ajustes de dificultad y puntuación
- **Exports**: Backup y restauración de datos

## 📱 Capturas de Pantalla

```
[Game Start Screen]    [Question Screen]    [Results Screen]
     🎮                    ❓                  🏆
  Select Category      Timer: 15s          Score: 850 pts
  Choose Difficulty    Progress: 3/10      Level Up! ⭐
  View Stats          Multiple Choice      Achievements
```

## 📋 Estructura del Proyecto

```
ChatYSP/
├── 📱 mobile/                 # Aplicación React Native
│   ├── app/
│   │   ├── 📺 screens/        # Pantallas del juego
│   │   │   ├── GameStartScreen.jsx
│   │   │   ├── GameQuestion.jsx
│   │   │   ├── GameResultScreen.jsx
│   │   │   └── MiniGameScreen.jsx
│   │   ├── 🔄 store/          # Redux Store
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       └── userStatsSlice.js
│   │   ├── 🛠️ services/       # API Services
│   │   │   └── miniGameAPI.js
│   │   └── 🎨 components/     # Componentes reutilizables
│   ├── package.json
│   ├── app.json
│   └── tailwind.config.js
├── 🖥️ backend/               # Servidor Node.js
│   ├── 🛣️ routes/            # Rutas API
│   │   └── minigame.js
│   ├── 📊 models/            # Modelos de datos
│   │   ├── Question.js
│   │   └── GameStats.js
│   └── package.json
├── 🌐 dashboard/             # Panel web de administración
│   └── components/
│       └── AdminGames.jsx
└── 📚 docs/                  # Documentación
    ├── MINIGAME_SYSTEM.md
    ├── QUESTIONS_BANK.md
    └── ADMIN_SCRIPTS.md
```

## 🛠️ Instalación Rápida

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI global
- iOS Simulator / Android Emulator

### 1. Clonar e Instalar
```bash
git clone https://github.com/tu-usuario/ChatYSP.git
cd ChatYSP

# Backend
cd backend
npm install
cp .env.example .env  # Configurar variables

# Mobile  
cd ../mobile
npm install

# Dashboard
cd ../dashboard  
npm install
```

### 2. Configurar Base de Datos
```bash
cd backend

# Crear DB y tablas
npx sequelize-cli db:create
npx sequelize-cli db:migrate

# Cargar preguntas demo
npm run load-questions demo-questions.json
```

### 3. Ejecutar Aplicación
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Mobile
cd mobile
npm start

# Terminal 3: Dashboard (opcional)
cd dashboard
npm start
```

### 4. Abrir App
- **iOS**: Presiona `i` en la terminal de Expo
- **Android**: Presiona `a` en la terminal de Expo
- **Web**: Presiona `w` en la terminal de Expo

## 🎮 Uso del Sistema

### Para Jugadores

1. **Iniciar Juego**: Selecciona categoría y dificultad
2. **Responder**: Elige la opción correcta antes que termine el tiempo
3. **Ver Progreso**: Revisa tu puntuación y nivel
4. **Desbloquear Logros**: Completa desafíos para ganar achievements

### Para Administradores

1. **Acceder Dashboard**: `http://localhost:3000/admin/games`
2. **Agregar Preguntas**: Usar formulario de creación
3. **Ver Estadísticas**: Dashboard con métricas de uso
4. **Exportar Datos**: Backup de preguntas y estadísticas

## 📊 API Endpoints

### Obtener Preguntas
```http
GET /api/minigame/questions?category=coaching&difficulty=easy
```

### Guardar Estadísticas
```http
POST /api/minigame/stats
Content-Type: application/json

{
  "userId": "user123",
  "score": 850,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "category": "coaching",
  "difficulty": "medium",
  "timeSpent": 120
}
```

### Obtener Ranking
```http
GET /api/minigame/leaderboard?category=coaching&limit=10
```

### Admin: Crear Pregunta
```http
POST /api/admin/questions
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "question": "¿Cuál es el objetivo del coaching?",
  "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
  "correctAnswer": 1,
  "category": "coaching",
  "difficulty": "medium",
  "explanation": "El coaching facilita..."
}
```

## 🔧 Configuración Avanzada

### Variables de Entorno (.env)
```env
# Backend
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=chatysp_dev
DB_USER=postgres
DB_PASS=password
JWT_SECRET=your-secret-key

# API URLs
API_BASE_URL=http://localhost:5000/api
SOCKET_URL=http://localhost:5000
```

### Configuración de Puntuación
```javascript
// mobile/app/utils/gameUtils.js
export const POINTS_CONFIG = {
  easy: { base: 10, timeBonus: 2 },
  medium: { base: 15, timeBonus: 3 },
  hard: { base: 25, timeBonus: 5 }
};

export const LEVEL_CONFIG = {
  xpPerLevel: 1000,
  maxLevel: 50
};
```

### Personalizar Categorías
```javascript
// mobile/app/store/slices/userStatsSlice.js
const CATEGORIES = {
  coaching: { icon: '🎯', color: '#3B82F6' },
  bienestar: { icon: '🌱', color: '#10B981' },
  general: { icon: '🌍', color: '#8B5CF6' },
  tecnologia: { icon: '💻', color: '#F59E0B' }
};
```

## 📈 Métricas y Analytics

### Métricas Tracked
- Partidas jugadas por categoría/dificultad
- Puntuación promedio por usuario
- Tiempo promedio por pregunta
- Tasa de acierto por categoría
- Progresión de niveles
- Logros desbloqueados

### Comandos de Estadísticas
```bash
# Ver estadísticas generales
npm run game-stats

# Limpiar datos antiguos (>30 días)
npm run clean-stats

# Backup de preguntas
npm run backup-questions

# Cargar nuevas preguntas
npm run load-questions preguntas.json
```

## 🧪 Testing

### Tests Unitarios
```bash
# Backend
cd backend
npm test

# Mobile
cd mobile  
npm test
```

### Tests de Integración
```bash
# Test conectividad API
npm run test-connection

# Test rendimiento
npm run test-performance
```

## 🚀 Deployment

### Desarrollo
```bash
# Expo Development Build
npm run build:dev

# Preview Build
npm run preview
```

### Producción
```bash
# EAS Build
eas build --platform all --profile production

# Submit to Stores
eas submit --platform all
```

### Docker
```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up

# Producción  
docker-compose up -d
```

## 📚 Documentación Detallada

- 📖 **[Documentación Técnica Completa](docs/MINIGAME_SYSTEM.md)**
- 🎯 **[Guía de Referencia Rápida](docs/MINIGAME_QUICK_REFERENCE.md)**
- ❓ **[Banco de Preguntas](docs/QUESTIONS_BANK.md)**
- 🛠️ **[Scripts de Administración](docs/ADMIN_SCRIPTS.md)**

## 🤝 Contribuir

### Agregar Nuevas Preguntas
1. Usar plantilla en `docs/QUESTIONS_BANK.md`
2. Validar formato JSON
3. Probar en desarrollo
4. Crear PR con descripción

### Reportar Bugs
1. Usar template de issue
2. Incluir logs y screenshots
3. Especificar dispositivo/OS
4. Pasos para reproducir

### Nuevas Características
1. Discutir en Issues primero
2. Fork del repo
3. Crear feature branch
4. Tests incluidos
5. Documentación actualizada

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- React Native Team
- Expo Team  
- Redux Toolkit
- Lottie Animations
- NativeWind
- Toda la comunidad open source

---

## 🆘 Soporte

### Issues Comunes

**🔧 Error de conexión API**
```bash
# Verificar que backend esté corriendo
curl http://localhost:5000/api/health

# Revisar variables de entorno
cat .env

# Test conectividad desde app
npm run test-connection
```

**📱 App no compila**
```bash
# Limpiar caché
expo r -c
rm -rf node_modules
npm install

# Verificar versiones
expo doctor
```

**🗄️ Error de base de datos**
```bash
# Recrear DB
npm run reset-db

# Verificar migración
npx sequelize-cli db:migrate:status
```

### Contacto

- 📧 Email: soporte@chatysp.com
- 💬 Discord: ChatYSP Community
- 📱 Telegram: @ChatYSPSupport

---

**ChatYSP Minigame System v1.0** - Desarrollado con ❤️ por el equipo ChatYSP