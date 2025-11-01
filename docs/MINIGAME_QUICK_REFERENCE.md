# 🎮 Quick Reference - Sistema de Minijuego

## 🚀 Comandos Rápidos

### Iniciar Desarrollo
```bash
# Mobile
cd mobile && npm start

# Backend  
cd backend && npm run dev

# Dashboard
cd dashboard && npm run dev
```

### Estructura de Archivos Clave
```
mobile/app/
├── screens/
│   ├── GameScreen.jsx          # Menú juegos
│   └── MiniGameScreen.jsx      # Controlador principal
├── components/
│   ├── GameStartScreen.jsx     # Pantalla inicial
│   ├── GameQuestion.jsx        # Pregunta + timer
│   └── GameResultScreen.jsx    # Resultados + confeti
├── redux/
│   ├── userStatsSlice.js       # Estado estadísticas
│   └── store.js                # Redux + persist
└── services/
    └── miniGameAPI.js          # Cliente API + offline
```

## 🔧 Configuración Rápida

### 1. Agregar Nueva Pregunta (Local)
```javascript
// En miniGameAPI.js > LOCAL_QUESTIONS
{
  id: 999,
  question: "¿Tu pregunta aquí?",
  options: ["Opción A", "Opción B", "Opción C", "Opción D"],
  correctAnswer: 0, // Índice 0-3
  category: "general",
  difficulty: "medium",
  explanation: "Explicación de la respuesta..."
}
```

### 2. Modificar Puntos por Dificultad
```javascript
// En miniGameAPI.js > calculatePoints()
const pointsMap = {
  easy: 10,    // Cambiar aquí
  medium: 15,  // Cambiar aquí  
  hard: 20     // Cambiar aquí
};
```

### 3. Ajustar Tiempo por Pregunta
```javascript
// En userStatsSlice.js > initialState > gameSettings
timePerQuestion: 15,  // Cambiar aquí (segundos)
```

### 4. Cambiar Colores del Tema
```javascript
// En cualquier componente, cambiar className:
"bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
//                     ↑ Cambiar estos colores
```

## 📊 Redux Estado

### Selectores Útiles
```javascript
import { 
  selectMiniGameStats,    // Todas las estadísticas
  selectBestScore,        // Mejor puntuación
  selectCurrentLevel,     // Nivel actual
  selectShowConfetti,     // Flag confeti
  selectAchievements,     // Logros desbloqueados
  selectGameSettings      // Configuración
} from '../redux/userStatsSlice';
```

### Acciones Principales
```javascript
import { 
  updateGameStats,        // Actualizar tras juego
  updateGameSettings,     // Cambiar configuración
  hideConfetti,          // Ocultar confeti
  checkAchievements      // Verificar logros
} from '../redux/userStatsSlice';

// Ejemplo de uso
dispatch(updateGameStats({
  score: 150,
  correctAnswers: 8,
  totalQuestions: 10,
  category: 'coaching',
  timeTaken: 120,
  difficulty: 'medium'
}));
```

## 🎯 API Endpoints

### Frontend → Backend
```javascript
// Obtener preguntas
GET /api/minigame/questions?category=coaching&difficulty=medium&count=5

// Guardar estadísticas  
POST /api/minigame/stats
{
  "score": 150,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "category": "coaching"
}

// Ranking
GET /api/minigame/leaderboard?period=weekly&limit=10

// Categorías
GET /api/minigame/categories

// Stats usuario
GET /api/minigame/user-stats
```

## 🎨 Personalización UI

### Iconos por Categoría
```javascript
const categoryIcons = {
  'general': '🧠',
  'coaching': '🎯', 
  'bienestar': '💪',
  'geografia': '🌍',
  'historia': '📚',
  'ciencia': '🔬'
};
```

### Gradientes Disponibles
```css
/* Principales */
from-indigo-900 via-purple-900 to-pink-900
from-violet-500 to-purple-600
from-blue-500 to-cyan-600
from-green-500 to-emerald-600

/* Por dificultad */
from-green-500   /* Fácil */
from-yellow-500  /* Medio */  
from-red-500     /* Difícil */
```

## 🏆 Sistema de Logros

### Logros Disponibles
```javascript
const ACHIEVEMENTS = [
  'first_game',        // Primer juego
  'perfect_score',     // 100% aciertos
  'speed_demon',       // 5 respuestas < 30s
  'streak_5',          // 5 correctas seguidas
  'streak_10',         // 10 correctas seguidas
  'level_5',           // Nivel 5
  'level_10',          // Nivel 10
  'games_10',          // 10 juegos completados
  'games_50',          // 50 juegos completados
  'high_score_500'     // Más de 500 puntos
];
```

### Agregar Nuevo Logro
```javascript
// 1. Agregar a ACHIEVEMENTS array
{
  id: 'nuevo_logro',
  name: 'Nombre del Logro', 
  description: 'Descripción...',
  icon: '🏆'
}

// 2. Agregar lógica en checkAchievements
case 'nuevo_logro':
  shouldUnlock = /* tu condición */;
  break;
```

## 🎮 Flujo del Juego

### Estados del Juego
```javascript
// En MiniGameScreen.jsx
const [gameState, setGameState] = useState('start');
// Valores: 'start' | 'loading' | 'playing' | 'results'
```

### Navegación
```javascript
// Ir al minijuego desde cualquier pantalla
navigation.navigate('Juegos', { 
  screen: 'MiniGame' 
});

// Volver al menú de juegos
navigation.navigate('Juegos', { 
  screen: 'GameMenu' 
});
```

## 🔍 Debug

### Logs Útiles
```javascript
// Estado del juego
console.log('Game State:', gameState);

// Pregunta actual
console.log('Current Question:', questions[currentQuestionIndex]);

// Estadísticas
console.log('User Stats:', useSelector(selectMiniGameStats));

// API Response
console.log('Questions loaded:', questions.length);
```

### Resetear Datos
```javascript
// Resetear estadísticas (solo desarrollo)
import { resetAllStats } from '../redux/userStatsSlice';
dispatch(resetAllStats());

// Limpiar cache AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

## ⚡ Performance Tips

### Optimizaciones
```javascript
// Memoizar componentes pesados
export default React.memo(GameQuestion);

// Lazy imports
const GameScreen = React.lazy(() => import('./GameScreen'));

// Selectores memoizados
const userLevel = useSelector(selectCurrentLevel);
```

### Reducir Re-renders
```javascript
// Usar useCallback para funciones
const handleAnswer = useCallback((answer) => {
  // lógica
}, [dependencies]);

// useMemo para cálculos costosos
const sortedLeaderboard = useMemo(() => 
  leaderboard.sort((a, b) => b.score - a.score), 
  [leaderboard]
);
```

## 🚨 Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| Animaciones no funcionan | Verificar `react-native-reanimated` en babel.config.js |
| Estadísticas no persisten | Verificar Redux Persist config |
| Preguntas no cargan | Verificar conexión backend o usar modo offline |
| Confeti no aparece | Verificar `selectShowConfetti` selector |
| Navegación no funciona | Verificar Stack Navigator en AppNavigator |

## 📱 Testing

### Probar Flujo Completo
1. ✅ Abrir app → Tab "Juegos"  
2. ✅ Tap "Quiz Challenge"
3. ✅ Seleccionar categoría + dificultad
4. ✅ Tap "Comenzar Juego"
5. ✅ Responder preguntas (timer funciona)
6. ✅ Ver resultados + confeti si nuevo récord
7. ✅ Verificar estadísticas guardadas
8. ✅ Probar "Jugar de nuevo" y "Volver al menú"

### Casos Edge
- ⚠️ Sin conexión → Usar preguntas locales
- ⚠️ Timer = 0 → Auto-submit respuesta
- ⚠️ App en background → Pausar timer
- ⚠️ Respuesta duplicada → Ignorar segunda

---

*Quick Reference v1.0 - Noviembre 2025*