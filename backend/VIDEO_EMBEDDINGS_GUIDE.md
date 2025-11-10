# Sistema de Videos con Embeddings Vectoriales

Sistema completo para almacenar y buscar videos de YouTube del coach usando búsqueda semántica con embeddings de OpenAI.

## 📋 Componentes

### 1. Migración de Base de Datos
**Archivo:** `backend/src/migrations/20251109000002-add-embedding-to-knowledge-base.js`

- Agrega columna `embedding` tipo `vector(1536)` a `knowledge_base`
- Habilita extensión `pgvector` en PostgreSQL
- Crea índice HNSW para búsquedas rápidas

### 2. Template JSON de Videos
**Archivo:** `backend/data/youtube_videos.json`

Estructura recomendada para almacenar información de los 500+ videos:

```json
{
  "videos": [
    {
      "id": "youtube_video_id",
      "title": "Título del video",
      "url": "https://youtube.com/watch?v=...",
      "category": "autoestima",
      "tags": ["tag1", "tag2"],
      "duration": "15:30",
      "publishedAt": "2024-01-15",
      "description": "Descripción...",
      "transcript": "Transcripción completa...",
      "summary": "Resumen breve...",
      "keyPoints": ["Punto 1", "Punto 2"]
    }
  ]
}
```

### 3. Script de Importación
**Archivo:** `backend/scripts/importYouTubeVideos.js`

**Uso:**
```bash
# Importar desde archivo por defecto
node scripts/importYouTubeVideos.js

# Especificar archivo personalizado
node scripts/importYouTubeVideos.js --file=ruta/al/archivo.json

# Saltar videos que ya existen
node scripts/importYouTubeVideos.js --skip-existing

# Procesar en lotes de 5 (default: 10)
node scripts/importYouTubeVideos.js --batch-size=5
```

**Qué hace:**
1. Lee el archivo JSON con los videos
2. Para cada video:
   - Genera embedding usando `text-embedding-3-small` de OpenAI
   - Guarda en `knowledge_base` con el embedding
3. Procesa en lotes para no saturar la API
4. Muestra estadísticas al finalizar

### 4. Búsqueda Semántica
**Archivo:** `backend/src/services/FedeAIService.js`

**Métodos nuevos:**

```javascript
// Buscar contenido similar por tema
const results = await fedeAI.findSimilarContent(
  'cómo superar una ruptura', 
  5,          // límite de resultados
  'video'     // filtrar solo videos
);

// Buscar videos relacionados
const videos = await fedeAI.findRelatedVideos(
  'autoestima y confianza', 
  3
);

// Recomendar video para un tip específico
const video = await fedeAI.recommendVideoForTip(
  tipContent, 
  tipCategory
);
```

### 5. Integración con Daily Tips
**Archivo:** `backend/src/services/DailyTipAIService.js`

El sistema ahora automáticamente:
- Busca videos relacionados al tip generado (30% probabilidad)
- Usa búsqueda semántica para encontrar el video más relevante
- Incluye el video en el footer del tip

**Ejemplo de tip con video:**

```
┏━━━━━━━━━━━━━━━┓
┃  🦁 TIP DEL DÍA  ┃
┗━━━━━━━━━━━━━━━┛

[Contenido del tip...]

━━━━━━━━━━━━━━━━━━━

💡 PD: La confianza se construye con pequeñas acciones diarias

📺 Video relacionado:
"Cómo construir autoestima en 21 días"
👉 https://youtube.com/watch?v=abc123

Fede Hirigoyen
Coach Ontológico Profesional
```

## 🚀 Instalación y Setup

### 1. Instalar pgvector en PostgreSQL

```bash
# Si usas Docker
docker exec -it tu_postgres_container psql -U usuario -d chatysp
CREATE EXTENSION IF NOT EXISTS vector;

# Si usas PostgreSQL local, instalar primero pgvector
# https://github.com/pgvector/pgvector#installation
```

### 2. Ejecutar migración

```bash
cd backend
npx sequelize-cli db:migrate
```

### 3. Preparar archivo de videos

Edita `backend/data/youtube_videos.json` con los 500+ videos del coach.

### 4. Importar videos

```bash
node scripts/importYouTubeVideos.js
```

⏱️ **Tiempo estimado:** 
- Con 500 videos: ~25-30 minutos
- Con 100 videos: ~5-7 minutos

💰 **Costo de embeddings:**
- Modelo: `text-embedding-3-small`
- Costo: ~$0.00002 por 1000 tokens
- 500 videos (promedio 500 tokens cada uno): ~$0.005 USD

## 📊 Búsqueda Semántica

### Cómo funciona

1. **Embeddings**: Cada video se convierte en un vector de 1536 dimensiones que captura su significado semántico

2. **Distancia Coseno**: Se usa para medir similitud entre el query y los videos
   - Similitud 1.0 = idéntico
   - Similitud 0.7 = bastante similar
   - Similitud < 0.5 = poco relacionado

3. **Índice HNSW**: Permite búsquedas extremadamente rápidas incluso con millones de vectores

### Ejemplos de búsquedas

```javascript
// El usuario pregunta sobre autoestima
const videos = await fedeAI.findRelatedVideos('cómo mejorar mi autoestima', 3);
// Retorna videos sobre autoestima, confianza, amor propio

// Buscar por concepto abstracto
const videos = await fedeAI.findRelatedVideos('sentimiento de abandono', 3);
// Retorna videos sobre dependencia emocional, ruptura, sanación

// El sistema no busca palabras exactas, sino significados
const videos = await fedeAI.findRelatedVideos('me siento solo', 3);
// Retorna videos sobre soledad, gestión emocional, apoyo
```

## 🔧 Solución de Problemas

### Error: "column embedding does not exist"
**Solución:** Ejecutar la migración
```bash
npx sequelize-cli db:migrate
```

### Error: "extension vector does not exist"
**Solución:** Instalar pgvector en PostgreSQL
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Error: "rate limit exceeded" de OpenAI
**Solución:** Reducir el batch size
```bash
node scripts/importYouTubeVideos.js --batch-size=5
```

### Los videos no aparecen en los tips
**Verificar:**
1. Que se ejecutó la migración
2. Que se importaron videos
3. Que los videos tienen embeddings (columna no es NULL)

```sql
-- Verificar videos con embeddings
SELECT COUNT(*) FROM knowledge_base 
WHERE "contentType" = 'video' AND embedding IS NOT NULL;
```

## 📈 Métricas y Monitoreo

### Verificar importación

```sql
-- Total de videos
SELECT COUNT(*) FROM knowledge_base WHERE "contentType" = 'video';

-- Videos por categoría
SELECT category, COUNT(*) 
FROM knowledge_base 
WHERE "contentType" = 'video' 
GROUP BY category;

-- Videos más usados
SELECT title, "usageCount", "lastUsed"
FROM knowledge_base
WHERE "contentType" = 'video'
ORDER BY "usageCount" DESC
LIMIT 10;
```

### Probar búsqueda

```javascript
// En consola de Node.js
const FedeAIService = require('./src/services/FedeAIService');
const fedeAI = new FedeAIService();

// Probar búsqueda
const results = await fedeAI.findRelatedVideos('autoestima', 5);
console.log(results.map(v => ({
  title: v.title,
  similarity: (v.similarity * 100).toFixed(1) + '%'
})));
```

## 🎯 Próximos Pasos

1. **Agregar transcripciones**: Usar YouTube Transcript API para obtener transcripciones automáticamente
2. **Actualización periódica**: Script para detectar nuevos videos del canal
3. **Dashboard**: Interfaz para gestionar videos, ver estadísticas de uso
4. **Mejores sugerencias**: Ajustar probabilidad de incluir videos según engagement
5. **A/B Testing**: Medir si los tips con videos tienen más apertura/respuesta

## 📚 Referencias

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [HNSW Algorithm](https://arxiv.org/abs/1603.09320)
