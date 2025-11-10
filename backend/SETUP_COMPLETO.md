# 🚀 Guía Rápida: Setup PostgreSQL Local con pgvector

## ✅ Estado Actual

### Neon (Producción) - COMPLETADO ✅
- ✅ pgvector 0.8.0 instalado
- ✅ 13 tablas creadas
- ✅ Columna `embedding vector(1536)` configurada
- ✅ Índice HNSW para búsquedas rápidas
- ✅ Listo para importar videos

### Local (Docker) - PENDIENTE ⏳
- ⏳ Docker necesita ser instalado
- ⏳ Contenedor PostgreSQL por crear
- ⏳ Base de datos por inicializar

---

## 📋 Pasos para Configurar Docker Local

### 1️⃣ Instalar Docker Desktop (10-15 minutos)

**Descarga e Instalación:**
```
1. Ve a: https://www.docker.com/products/docker-desktop/
2. Descarga "Docker Desktop for Windows"
3. Ejecuta el instalador
4. Marca: "Use WSL 2 instead of Hyper-V"
5. Reinicia cuando te lo pida
6. Abre Docker Desktop y acepta el acuerdo
```

**Verificar instalación:**
```bash
docker --version
docker-compose --version
```

Si tienes problemas, consulta: `DOCKER_INSTALLATION.md`

---

### 2️⃣ Iniciar PostgreSQL con pgvector (1 minuto)

**Opción A - Usando el script automático:**
```bash
# Doble click en:
C:\Users\merce\Desktop\ChatYSP\backend\start-postgres.bat
```

**Opción B - Manual:**
```bash
cd C:/Users/merce/Desktop/ChatYSP/backend
docker-compose up -d
```

**Verificar que está corriendo:**
```bash
docker ps
# Deberías ver: chatysp-postgres-dev
```

---

### 3️⃣ Inicializar la Base de Datos (30 segundos)

```bash
cd C:/Users/merce/Desktop/ChatYSP/backend
node scripts/initLocalDB.js
```

Esto creará:
- ✅ Todas las tablas del sistema
- ✅ Extensión pgvector
- ✅ Columna embedding vector(1536)
- ✅ Índice HNSW para búsquedas

---

### 4️⃣ Conectar pgAdmin (opcional)

1. Abre pgAdmin
2. Click derecho en "Servers" → "Create" → "Server"
3. **Pestaña General:**
   - Name: `ChatYSP Local (Docker)`
4. **Pestaña Connection:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `chatysp`
   - Username: `postgres`
   - Password: `7754`
   - Save password: ✅
5. Click "Save"

---

## 🎯 Próximos Pasos - Videos con Embeddings

Una vez que tengas Docker configurado (o si decides usar solo Neon):

### 1. Preparar los Videos

Edita `backend/data/youtube_videos.json` con tus 500+ videos:

```json
{
  "metadata": {
    "totalVideos": 500,
    "lastUpdated": "2024-11-09",
    "categories": ["Bienestar", "Coaching", "Metodología"]
  },
  "videos": [
    {
      "id": "1",
      "title": "Título del Video 1",
      "url": "https://youtube.com/watch?v=...",
      "category": "Bienestar",
      "tags": ["motivación", "crecimiento personal"],
      "duration": 600,
      "publishedAt": "2024-01-15",
      "description": "Descripción del video...",
      "summary": "Resumen de los puntos clave...",
      "keyPoints": [
        "Punto clave 1",
        "Punto clave 2"
      ]
    }
    // ... más videos
  ]
}
```

### 2. Importar Videos

**Para Neon (producción):**
```bash
cd C:/Users/merce/Desktop/ChatYSP/backend

# Configurar variables para Neon
set DB_NAME=neondb
set DB_USER=neondb_owner
set DB_PASSWORD=npg_2FCs9RNZYTau
set DB_HOST=ep-fancy-union-ad5vgh7r-pooler.c-2.us-east-1.aws.neon.tech
set DB_PORT=5432
set DB_SSL=true

# Importar
node scripts/importYouTubeVideos.js --file data/youtube_videos.json
```

**Para Local (Docker):**
```bash
cd C:/Users/merce/Desktop/ChatYSP/backend

# Asegúrate de que .env apunta a localhost
# Importar
node scripts/importYouTubeVideos.js --file data/youtube_videos.json
```

### 3. Probar Búsqueda Semántica

```bash
# Conecta a la base de datos y prueba:
psql "postgresql://..." -c "
SELECT 
  title,
  category,
  1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM knowledge_base
WHERE content_type = 'video'
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;
"
```

### 4. Los Daily Tips Automáticamente Incluirán Videos

El sistema ya está configurado para:
- ✅ Buscar videos relacionados con cada tip (30% probabilidad)
- ✅ Usar embeddings para encontrar el video más relevante
- ✅ Incluir el video en el footer del tip
- ✅ Formatear para WhatsApp y Telegram

---

## 🛠️ Comandos Útiles de Docker

```bash
# Ver contenedores corriendo
docker ps

# Ver logs
docker logs chatysp-postgres-dev

# Detener PostgreSQL
docker-compose down

# Reiniciar PostgreSQL
docker-compose restart

# Borrar TODO y empezar de cero (¡cuidado!)
docker-compose down -v

# Conectarse al PostgreSQL
docker exec -it chatysp-postgres-dev psql -U postgres -d chatysp
```

---

## 📊 Resumen de Archivos Creados

```
backend/
├── docker-compose.yml           # Configuración de Docker
├── init-pgvector.sql           # Script de inicialización automática
├── start-postgres.bat          # Script Windows para iniciar Docker
├── .env.neon                   # Variables de entorno para Neon
├── DOCKER_INSTALLATION.md      # Guía detallada de instalación
├── PGVECTOR_SETUP.md          # Guía de setup de pgvector
├── VIDEO_EMBEDDINGS_GUIDE.md  # Guía del sistema de embeddings
├── data/
│   └── youtube_videos.json    # Template para 500+ videos
└── scripts/
    ├── initNeonDB.js          # Inicializar Neon
    ├── initLocalDB.js         # Inicializar Docker local
    └── importYouTubeVideos.js # Importar videos con embeddings
```

---

## ❓ ¿Dudas?

- **¿Necesito Docker local?** No, puedes trabajar solo con Neon
- **¿Cuánto cuesta importar 500 videos?** ~$0.005 USD (embeddings de OpenAI)
- **¿Cuánto tiempo toma?** ~25-30 minutos para 500 videos
- **¿Funcionará con mi plan de Neon?** Sí, el plan gratuito soporta pgvector

---

## 🎊 Estás Listo!

Todo el código está implementado. Solo necesitas:
1. (Opcional) Instalar Docker para desarrollo local
2. Llenar youtube_videos.json con tus videos
3. Ejecutar el script de importación
4. ¡Disfrutar de búsqueda semántica en tus daily tips!
