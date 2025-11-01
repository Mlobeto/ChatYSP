# 🎮 Sistema de Minijuego - ChatYSP

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Frontend](#componentes-frontend)
4. [Sistema de Estado (Redux)](#sistema-de-estado-redux)
5. [Backend API](#backend-api)
6. [Configuración e Instalación](#configuración-e-instalación)
7. [Guía de Uso](#guía-de-uso)
8. [Personalización](#personalización)
9. [Troubleshooting](#troubleshooting)

---

## Descripción General

El Sistema de Minijuego de ChatYSP es una funcionalidad completa de quiz interactivo diseñada para motivar a los usuarios a completar desafíos de conocimiento. Incluye:

- **Quiz Challenge**: Preguntas de opción múltiple por categorías
- **Sistema de puntos y niveles**: Progresión basada en XP
- **Logros desbloqueables**: Achievement system
- **Estadísticas persistentes**: Guardado local con AsyncStorage
- **Modo offline**: Preguntas locales como fallback
- **UI moderna**: Animaciones fluidas y diseño atractivo
- **Dashboard admin**: Gestión completa de preguntas

### Características Técnicas
- **Frontend**: React Native + Expo
- **Estilo**: NativeWind (Tailwind CSS)
- **Animaciones**: react-native-reanimated
- **Estado**: Redux Toolkit + Redux Persist
- **Backend**: Node.js + Express + Sequelize
- **Base de datos**: PostgreSQL/MySQL

---

## Arquitectura del Sistema

```
📱 MOBILE APP
├── screens/
│   ├── GameScreen.jsx           # Menú principal de juegos
│   └── MiniGameScreen.jsx       # Controlador del minijuego
├── components/
│   ├── GameStartScreen.jsx      # Pantalla inicial
│   ├── GameQuestion.jsx         # Pantalla de pregunta
│   └── GameResultScreen.jsx     # Pantalla de resultados
├── redux/
│   ├── userStatsSlice.js        # Estado de estadísticas
│   └── store.js                 # Configuración Redux
└── services/
    └── miniGameAPI.js           # Cliente API

💻 BACKEND
├── routes/
│   └── minigame.js              # Endpoints API
├── models/
│   ├── Question.js              # Modelo de preguntas
│   └── GameStats.js             # Modelo de estadísticas
└── controllers/
    └── minigameController.js    # Lógica de negocio

🖥️ DASHBOARD
└── components/
    └── GameManagementDashboard.jsx  # Admin panel
```

---

## Componentes Frontend

### 1. GameStartScreen.jsx
**Propósito**: Pantalla de configuración inicial del juego.

**Características**:
- Selector de categoría (General, Coaching, Bienestar)
- Selector de dificultad (Fácil, Medio, Difícil)
- Visualización de estadísticas del usuario
- Barra de progreso de nivel con XP
- Animaciones de entrada suaves

**Props**:
```javascript
{
  onStartGame: Function,     // Callback al iniciar juego
  categories: Array         // Lista de categorías disponibles
}
```

**Uso**:
```javascript
<GameStartScreen
  onStartGame={(config) => startGame(config)}
  categories={categoriesList}
/>
```

### 2. GameQuestion.jsx
**Propósito**: Pantalla de pregunta individual con timer.

**Características**:
- Timer visual animado (15 segundos por defecto)
- 4 opciones de respuesta con letras A-D
- Feedback visual al seleccionar respuesta
- Indicador de progreso del juego
- Animaciones de entrada y selección

**Props**:
```javascript
{
  question: Object,          // Objeto pregunta
  questionNumber: Number,    // Número actual de pregunta
  totalQuestions: Number,    // Total de preguntas
  onAnswer: Function,        // Callback al responder
  timeLimit: Number,         // Tiempo límite en segundos
  currentScore: Number       // Puntuación actual
}
```

**Estructura de Question**:
```javascript
{
  id: String,
  question: String,
  options: [String, String, String, String],
  correctAnswer: Number,     // Índice 0-3
  category: String,
  difficulty: String,        // 'easy', 'medium', 'hard'
  explanation: String,
  timeLimit: Number,
  points: Number
}
```

### 3. GameResultScreen.jsx
**Propósito**: Pantalla de resultados finales con estadísticas.

**Características**:
- Puntuación final con animación
- Estadísticas detalladas (precisión, tiempo promedio)
- Confeti animado para nuevos récords
- Logros desbloqueados
- Botones para jugar de nuevo o volver al menú
- Detalles expandibles de respuestas

**Props**:
```javascript
{
  score: Number,             // Puntuación final
  correctAnswers: Number,    // Respuestas correctas
  totalQuestions: Number,    // Total de preguntas
  gameTime: Number,          // Tiempo total en segundos
  category: String,          // Categoría jugada
  difficulty: String,        // Dificultad jugada
  answers: Array,            // Detalle de respuestas
  onPlayAgain: Function,     // Callback jugar de nuevo
  onBackToMenu: Function     // Callback volver al menú
}
```

---

## Sistema de Estado (Redux)

### userStatsSlice.js

**Estado Inicial**:
```javascript
{
  miniGameStats: {
    totalGamesPlayed: 0,
    bestScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    averageScore: 0,
    accuracy: 0,
    level: 1,
    experiencePoints: 0,
    nextLevelXP: 100
  },
  categoryStats: {},         // Estadísticas por categoría
  achievements: [],          // Logros desbloqueados
  gameSettings: {
    soundEnabled: true,
    hapticEnabled: true,
    animationsEnabled: true,
    difficulty: 'medium',
    timePerQuestion: 15
  },
  recentGames: [],          // Histórico de juegos recientes
  showConfetti: false       // Flag para mostrar confeti
}
```

**Acciones Principales**:

#### updateGameStats(payload)
Actualiza estadísticas después de completar un juego.
```javascript
dispatch(updateGameStats({
  score: 150,
  correctAnswers: 8,
  totalQuestions: 10,
  category: 'coaching',
  timeTaken: 120,
  difficulty: 'medium'
}));
```

#### updateGameSettings(payload)
Actualiza configuración del juego.
```javascript
dispatch(updateGameSettings({
  soundEnabled: false,
  timePerQuestion: 20
}));
```

**Selectores**:
```javascript
import { 
  selectMiniGameStats,
  selectBestScore,
  selectCurrentLevel,
  selectShowConfetti,
  selectAchievements,
  selectGameSettings
} from '../redux/userStatsSlice';

const bestScore = useSelector(selectBestScore);
const currentLevel = useSelector(selectCurrentLevel);
```

### Persistencia con Redux Persist

**Configuración en store.js**:
```javascript
const userStatsPersistConfig = {
  key: 'userStats',
  storage: AsyncStorage,
  whitelist: ['miniGameStats', 'categoryStats', 'achievements', 'gameSettings']
};
```

**Datos Persistidos**:
- Estadísticas del minijuego
- Estadísticas por categoría
- Logros desbloqueados
- Configuración del juego
- Historial de juegos recientes

---

## Backend API

### Endpoints Disponibles

#### GET /api/minigame/questions
Obtiene preguntas para el minijuego.

**Query Parameters**:
- `category` (string): Categoría de preguntas ('general', 'coaching', 'bienestar')
- `difficulty` (string): Dificultad ('easy', 'medium', 'hard')
- `count` (number): Número de preguntas (default: 5)

**Respuesta**:
```javascript
{
  success: true,
  questions: [
    {
      id: "uuid",
      question: "¿Cuál es la capital de Francia?",
      options: ["Londres", "Berlín", "París", "Madrid"],
      correctAnswer: 2,
      category: "general",
      difficulty: "easy",
      explanation: "París es la capital de Francia...",
      timeLimit: 15,
      points: 10
    }
  ],
  total: 5
}
```

#### POST /api/minigame/stats
Guarda estadísticas de un juego completado.

**Body**:
```javascript
{
  score: 150,
  correctAnswers: 8,
  totalQuestions: 10,
  category: "coaching",
  difficulty: "medium",
  timeTaken: 120,
  answers: [
    {
      questionId: "uuid",
      selectedAnswer: 2,
      isCorrect: true,
      timeToAnswer: 12
    }
  ]
}
```

#### GET /api/minigame/leaderboard
Obtiene tabla de clasificación.

**Query Parameters**:
- `category` (string): Filtrar por categoría
- `period` (string): 'daily', 'weekly', 'monthly', 'all-time'
- `limit` (number): Número de resultados (default: 10)

#### GET /api/minigame/categories
Obtiene categorías disponibles con metadata.

#### GET /api/minigame/user-stats
Obtiene estadísticas detalladas del usuario autenticado.

### Modelos de Base de Datos

#### Question
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  options JSON NOT NULL,           -- Array de 4 opciones
  correct_answer INTEGER NOT NULL, -- Índice 0-3
  category VARCHAR(50) NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard'),
  explanation TEXT,
  time_limit INTEGER DEFAULT 15,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### GameStats
```sql
CREATE TABLE game_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  game_type ENUM('minigame', 'trivia', 'challenge'),
  score INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  category VARCHAR(50),
  difficulty ENUM('easy', 'medium', 'hard'),
  time_taken INTEGER DEFAULT 0,
  answers JSON,                    -- Detalle de respuestas
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Configuración e Instalación

### Dependencias Frontend

```bash
# En el directorio mobile/
npm install react-native-reanimated
npm install redux-persist
npm install react-native-animatable
npm install lottie-react-native
```

### Configuración Redux Persist

**App.js**:
```javascript
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/redux/store';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
```

### Navegación

**Estructura en AppNavigator.js**:
```javascript
function GamesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GameMenu" component={GameScreen} />
      <Stack.Screen name="MiniGame" component={MiniGameScreen} />
    </Stack.Navigator>
  );
}

// En MainTabNavigator
<Tab.Screen name="Juegos" component={GamesNavigator} />
```

### Backend Setup

1. **Instalar dependencias**:
```bash
npm install express sequelize
```

2. **Configurar rutas en server.js**:
```javascript
const minigameRoutes = require('./routes/minigame');
app.use('/api/minigame', minigameRoutes);
```

3. **Migración de base de datos**:
```bash
npx sequelize-cli model:generate --name Question --attributes question:string,options:json,correctAnswer:integer
npx sequelize-cli model:generate --name GameStats --attributes userId:uuid,score:integer,accuracy:decimal
npx sequelize-cli db:migrate
```

---

## Guía de Uso

### Para Desarrolladores

#### 1. Agregar Nueva Categoría

**Frontend** - Actualizar `miniGameAPI.js`:
```javascript
getDefaultCategories() {
  return [
    // ... categorías existentes
    {
      id: 'nueva-categoria',
      name: 'Nueva Categoría',
      description: 'Descripción de la categoría',
      icon: '🎯',
      color: '#10b981'
    }
  ];
}
```

**Backend** - Actualizar enum en modelo:
```javascript
category: {
  type: DataTypes.ENUM('general', 'coaching', 'bienestar', 'nueva-categoria'),
  // ...
}
```

#### 2. Modificar Sistema de Puntos

**En `miniGameAPI.js`**:
```javascript
calculatePoints(difficulty) {
  const pointsMap = {
    easy: 15,      // Aumentar puntos fácil
    medium: 20,    // Aumentar puntos medio
    hard: 30       // Aumentar puntos difícil
  };
  return pointsMap[difficulty] || 20;
}
```

**En `userStatsSlice.js`**:
```javascript
// Modificar cálculo de XP
let xpGained = correctAnswers * 15; // Cambiar base XP
if (correctAnswers === totalQuestions) {
  xpGained += 100; // Cambiar bonus perfecto
}
```

#### 3. Agregar Nuevo Logro

**En `userStatsSlice.js`**:
```javascript
const ACHIEVEMENTS = [
  // ... logros existentes
  {
    id: 'nuevo_logro',
    name: 'Nombre del Logro',
    description: 'Descripción del logro',
    icon: '🏆'
  }
];

// En checkAchievements reducer
case 'nuevo_logro':
  shouldUnlock = /* condición del logro */;
  break;
```

### Para Administradores

#### 1. Gestión de Preguntas via Dashboard

1. **Acceder al dashboard** en `/admin/games`
2. **Crear nueva pregunta**: Click en "Nueva Pregunta"
3. **Rellenar formulario**:
   - Pregunta (máximo 500 caracteres)
   - 4 opciones de respuesta
   - Seleccionar respuesta correcta
   - Categoría y dificultad
   - Explicación opcional

4. **Filtrar preguntas**: Usar filtros de categoría/dificultad
5. **Editar/Eliminar**: Usar botones de acción en tabla

#### 2. Monitoreo de Estadísticas

- **Tab Analíticas**: Ver gráficos de uso
- **Distribuición por dificultad**: Pie chart
- **Juegos por día**: Bar chart
- **Rendimiento por categoría**: Comparativa

---

## Personalización

### Temas y Colores

**Modificar gradientes en componentes**:
```javascript
// En GameStartScreen.jsx
className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"

// En GameQuestion.jsx  
className="bg-gradient-to-br from-indigo-900 via-violet-900 to-pink-900"
```

### Configuración de Tiempo

**Por defecto en `userStatsSlice.js`**:
```javascript
gameSettings: {
  timePerQuestion: 15,    // Cambiar tiempo por pregunta
  // ...
}
```

**Por pregunta en base de datos**:
```javascript
timeLimit: 20           // Tiempo específico por pregunta
```

### Animaciones

**Desactivar animaciones**:
```javascript
dispatch(updateGameSettings({
  animationsEnabled: false
}));
```

**Modificar duración**:
```javascript
// En GameQuestion.jsx
progressWidth.value = withTiming((newTime / timeLimit) * 100, { 
  duration: 500  // Cambiar duración de animación
});
```

### Sonidos y Hápticos

**Configurar en settings**:
```javascript
gameSettings: {
  soundEnabled: true,     // Sonidos on/off
  hapticEnabled: true,    // Vibración on/off
}
```

**Agregar sonidos personalizados**:
```javascript
// En MiniGameScreen.jsx
const loadSounds = async () => {
  const correctSound = new Audio.Sound();
  await correctSound.loadAsync(require('../assets/sounds/correct.mp3'));
  // ...
};
```

---

## Troubleshooting

### Problemas Comunes

#### 1. Las estadísticas no se guardan
**Causa**: Problema con Redux Persist
**Solución**:
```bash
# Limpiar cache
npx expo r -c
```

#### 2. Animaciones no funcionan
**Causa**: react-native-reanimated no configurado
**Solución**:
```javascript
// babel.config.js
module.exports = {
  plugins: ['react-native-reanimated/plugin'],
};
```

#### 3. Error al cargar preguntas
**Causa**: Backend no disponible
**Comportamiento**: Usar preguntas locales automáticamente
**Verificar**: Console log "usando preguntas locales"

#### 4. Confeti no aparece
**Causa**: Estado `showConfetti` no se actualiza
**Verificar**:
```javascript
const showConfetti = useSelector(selectShowConfetti);
console.log('showConfetti:', showConfetti);
```

### Debug Tips

#### Redux DevTools
```javascript
// En store.js
devTools: __DEV__,
```

#### Logs de API
```javascript
// En miniGameAPI.js
console.log('API Response:', response.data);
```

#### Estado del juego
```javascript
// En MiniGameScreen.jsx
console.log('Game State:', gameState);
console.log('Current Question:', currentQuestionIndex);
```

### Performance

#### Optimizaciones React Native
```javascript
// Usar memo para componentes pesados
export default React.memo(GameQuestion);

// Lazy loading de pantallas
const GameScreen = React.lazy(() => import('./GameScreen'));
```

#### Optimizaciones Redux
```javascript
// Usar selectores memoizados
const selectUserLevel = createSelector(
  [selectMiniGameStats],
  (stats) => stats.level
);
```

---

## Logs de Cambios

### v1.0.0 (2025-11-01)
- ✅ Implementación inicial del sistema de minijuego
- ✅ Componentes completos frontend
- ✅ Sistema Redux con persistencia
- ✅ API backend con endpoints completos
- ✅ Dashboard de administración
- ✅ Sistema de logros y niveles
- ✅ Modo offline con preguntas locales

### Roadmap Futuro

#### v1.1.0
- [ ] Modo multijugador en tiempo real
- [ ] Chat durante partidas
- [ ] Torneos programados

#### v1.2.0
- [ ] Preguntas con imágenes
- [ ] Modo supervivencia
- [ ] Rankings globales

#### v1.3.0
- [ ] IA para generar preguntas
- [ ] Análisis de dificultad automático
- [ ] Recomendaciones personalizadas

---

## Contacto y Soporte

Para dudas sobre esta documentación o el sistema de minijuego:

- **Desarrollador**: GitHub Copilot Assistant
- **Proyecto**: ChatYSP
- **Repositorio**: [ChatYSP Repository]
- **Documentación**: Este archivo

---

*Documentación generada el 1 de noviembre de 2025*