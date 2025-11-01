# 🛠️ Scripts de Administración - Sistema de Minijuego

## Scripts del Backend

### 1. Cargar Preguntas desde JSON
*backend/scripts/loadQuestions.js*

```javascript
const fs = require('fs');
const { Question } = require('../models');

async function loadQuestionsFromJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    
    for (const question of questions) {
      await Question.findOrCreate({
        where: { id: question.id },
        defaults: {
          ...question,
          options: JSON.stringify(question.options),
          isActive: true
        }
      });
    }
    
    console.log(`✅ Cargadas ${questions.length} preguntas`);
  } catch (error) {
    console.error('❌ Error cargando preguntas:', error);
  }
}

// Uso:
// node scripts/loadQuestions.js questions.json
const filePath = process.argv[2];
if (filePath) {
  loadQuestionsFromJSON(filePath);
} else {
  console.log('Uso: node loadQuestions.js <archivo.json>');
}
```

### 2. Backup de Preguntas
*backend/scripts/backupQuestions.js*

```javascript
const fs = require('fs');
const { Question } = require('../models');

async function backupQuestions() {
  try {
    const questions = await Question.findAll({
      where: { isActive: true },
      raw: true
    });
    
    // Parsear options de string a array
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));
    
    const filename = `backup_questions_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(formattedQuestions, null, 2));
    
    console.log(`✅ Backup creado: ${filename}`);
    console.log(`📊 ${questions.length} preguntas respaldadas`);
  } catch (error) {
    console.error('❌ Error creando backup:', error);
  }
}

// node scripts/backupQuestions.js
backupQuestions();
```

### 3. Estadísticas del Sistema
*backend/scripts/gameStats.js*

```javascript
const { Question, GameStats, sequelize } = require('../models');

async function getGameStatistics() {
  try {
    // Estadísticas de preguntas
    const questionStats = await Question.findAll({
      attributes: [
        'category',
        'difficulty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category', 'difficulty'],
      raw: true
    });

    // Estadísticas de juegos
    const gameStats = await GameStats.aggregate([
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          avgScore: { $avg: '$score' },
          avgCorrect: { $avg: '$correctAnswers' },
          totalTime: { $sum: '$timeSpent' }
        }
      }
    ]);

    console.log('📊 ESTADÍSTICAS DEL SISTEMA\n');
    
    console.log('🎯 Preguntas por Categoría y Dificultad:');
    questionStats.forEach(stat => {
      console.log(`  ${stat.category} (${stat.difficulty}): ${stat.count}`);
    });
    
    console.log('\n🎮 Estadísticas de Juegos:');
    if (gameStats.length > 0) {
      const stats = gameStats[0];
      console.log(`  Total juegos: ${stats.totalGames}`);
      console.log(`  Puntuación promedio: ${stats.avgScore.toFixed(1)}`);
      console.log(`  Respuestas correctas promedio: ${stats.avgCorrect.toFixed(1)}`);
      console.log(`  Tiempo total jugado: ${(stats.totalTime / 60).toFixed(1)} minutos`);
    }

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// node scripts/gameStats.js
getGameStatistics();
```

### 4. Limpiar Estadísticas Antiguas
*backend/scripts/cleanOldStats.js*

```javascript
const { GameStats } = require('../models');

async function cleanOldStats(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const deleted = await GameStats.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });
    
    console.log(`🧹 Eliminadas ${deleted} estadísticas de más de ${daysOld} días`);
  } catch (error) {
    console.error('❌ Error limpiando estadísticas:', error);
  }
}

// node scripts/cleanOldStats.js [días]
const days = process.argv[2] || 30;
cleanOldStats(parseInt(days));
```

## Scripts del Frontend

### 5. Generar Build de Producción
*mobile/scripts/build.sh*

```bash
#!/bin/bash

echo "🚀 Iniciando build de producción..."

# Limpiar caché
expo r -c

# Actualizar dependencias
npm install

# Build para Android
echo "📱 Construyendo para Android..."
eas build --platform android --profile production

# Build para iOS
echo "🍎 Construyendo para iOS..."
eas build --platform ios --profile production

echo "✅ Builds completados!"
```

### 6. Resetear Datos Locales
*mobile/scripts/resetLocalData.js*

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function resetAllLocalData() {
  try {
    // Limpiar Redux persist
    await AsyncStorage.removeItem('persist:root');
    
    // Limpiar datos específicos del juego
    await AsyncStorage.removeItem('userStats');
    await AsyncStorage.removeItem('gameSettings');
    await AsyncStorage.removeItem('achievements');
    
    console.log('✅ Datos locales limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
}

// Para usar en dev mode:
// import { resetAllLocalData } from './scripts/resetLocalData';
// resetAllLocalData();
```

### 7. Test de Conectividad
*mobile/scripts/testConnection.js*

```javascript
import { testConnection, getMiniGameQuestions } from '../app/services/miniGameAPI';

export async function runConnectionTests() {
  console.log('🔍 Iniciando tests de conectividad...\n');
  
  // Test 1: Conectividad básica
  console.log('1. Test de conectividad básica:');
  const connected = await testConnection();
  console.log(connected ? '✅ Conectado' : '❌ Sin conexión');
  
  // Test 2: Obtener preguntas
  console.log('\n2. Test de obtención de preguntas:');
  try {
    const questions = await getMiniGameQuestions('coaching', 'easy');
    console.log(`✅ Obtenidas ${questions.length} preguntas`);
  } catch (error) {
    console.log('❌ Error obteniendo preguntas:', error.message);
  }
  
  // Test 3: Velocidad de respuesta
  console.log('\n3. Test de velocidad:');
  const start = Date.now();
  try {
    await getMiniGameQuestions('general', 'medium');
    const time = Date.now() - start;
    console.log(`✅ Respuesta en ${time}ms`);
  } catch (error) {
    console.log('❌ Error en test de velocidad');
  }
}
```

## Package.json Scripts

### Backend (backend/package.json)
```json
{
  "scripts": {
    "load-questions": "node scripts/loadQuestions.js",
    "backup-questions": "node scripts/backupQuestions.js", 
    "game-stats": "node scripts/gameStats.js",
    "clean-stats": "node scripts/cleanOldStats.js",
    "seed-demo": "npm run load-questions demo-questions.json",
    "reset-db": "npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate && npm run seed-demo"
  }
}
```

### Mobile (mobile/package.json)
```json
{
  "scripts": {
    "build-prod": "bash scripts/build.sh",
    "test-connection": "node -e \"require('./scripts/testConnection.js').runConnectionTests()\"",
    "reset-local": "node -e \"require('./scripts/resetLocalData.js').resetAllLocalData()\"",
    "build-android": "eas build --platform android",
    "build-ios": "eas build --platform ios",
    "preview": "expo start --dev-client"
  }
}
```

## Comandos de Administración

### Desarrollo Diario
```bash
# Backend
cd backend
npm run dev                    # Iniciar servidor desarrollo
npm run game-stats            # Ver estadísticas
npm run backup-questions      # Crear backup

# Mobile  
cd mobile
npm start                     # Iniciar Expo
npm run test-connection       # Test conectividad
npm run reset-local          # Limpiar datos locales
```

### Producción
```bash
# Deployment
cd backend
npm run start                 # Servidor producción
npm run clean-stats 7         # Limpiar stats > 7 días

cd mobile
npm run build-prod           # Build completo
eas submit                   # Subir a stores
```

### Mantenimiento
```bash
# Backup y restauración
npm run backup-questions
npm run load-questions backup.json

# Monitoreo
npm run game-stats
tail -f logs/app.log

# Updates
npm update
expo upgrade
```

## Archivos de Configuración

### 8. Docker para Desarrollo
*docker-compose.dev.yml*

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: chatysp_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 9. GitHub Actions
*.github/workflows/test.yml*

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd backend && npm install
      - run: cd backend && npm test
      
  mobile-test:
    runs-on: ubuntu-latest  
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd mobile && npm install
      - run: cd mobile && npm run test
```

## Uso de los Scripts

### Configuración Inicial
```bash
# 1. Hacer ejecutables los scripts
chmod +x mobile/scripts/build.sh

# 2. Instalar dependencias globales  
npm install -g @expo/cli eas-cli

# 3. Configurar ambiente
cp .env.example .env
```

### Flujo de Desarrollo
```bash
# Cada mañana
npm run game-stats              # Ver estado del sistema
npm run test-connection        # Verificar conectividad

# Durante desarrollo
npm run backup-questions       # Antes de cambios importantes
npm run load-questions new.json # Cargar nuevas preguntas

# Antes de deploy
npm run clean-stats           # Limpiar datos antiguos
npm run build-prod           # Build de producción
```

---

*Scripts de Administración v1.0 - Noviembre 2025*