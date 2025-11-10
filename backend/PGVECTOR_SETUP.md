# Instalación de pgvector - Paso a Paso

## 🌐 Paso 1: Neon (Producción) - 2 minutos

### Opción A: Usar la UI de Neon (Más fácil)
1. Ve a https://console.neon.tech/
2. Selecciona tu proyecto ChatYSP
3. Ve a la pestaña **SQL Editor**
4. Ejecuta este comando:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
5. Verifica que funcionó:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```
Deberías ver una fila con el nombre 'vector'.

### Opción B: Usar psql desde terminal
1. Copia tu connection string de Neon (Dashboard > Connection Details)
   - Debería verse como: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/chatysp?sslmode=require`
2. En tu terminal bash, ejecuta:
```bash
# Instala psql si no lo tienes (solo primera vez)
# En Windows con WSL o Git Bash:
# Descarga desde: https://www.postgresql.org/download/windows/

# Conecta a Neon (reemplaza con tu connection string)
psql "postgresql://your-user:your-password@your-neon-host/chatysp?sslmode=require"

# Una vez conectado, ejecuta:
CREATE EXTENSION IF NOT EXISTS vector;

# Verifica:
SELECT * FROM pg_extension WHERE extname = 'vector';

# Sal de psql:
\q
```

---

## 🐳 Paso 2: Docker Local con pgvector - 10 minutos

### ¿Por qué Docker?
- pgvector viene preinstalado
- No necesitas compilar nada
- Fácil de configurar
- Aislado de tu sistema

### Instalación

#### 1. Instala Docker Desktop para Windows
- Descarga: https://www.docker.com/products/docker-desktop/
- Instala y reinicia si es necesario
- Verifica: `docker --version`

#### 2. Crea archivo docker-compose para PostgreSQL + pgvector

En `C:\Users\merce\Desktop\ChatYSP\backend\`, crea el archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres-dev:
    image: pgvector/pgvector:pg16
    container_name: chatysp-postgres-dev
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 7754
      POSTGRES_DB: chatysp
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-pgvector.sql:/docker-entrypoint-initdb.d/init-pgvector.sql

volumes:
  postgres-data:
```

#### 3. Crea archivo init-pgvector.sql

En `C:\Users\merce\Desktop\ChatYSP\backend\init-pgvector.sql`:

```sql
-- Habilita la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'pgvector extension installed successfully!';
END $$;
```

#### 4. Inicia el contenedor

Abre PowerShell o Git Bash en `C:\Users\merce\Desktop\ChatYSP\backend\`:

```bash
# Inicia el contenedor
docker-compose up -d

# Verifica que esté corriendo
docker ps

# Deberías ver algo como:
# CONTAINER ID   IMAGE                    STATUS         PORTS
# abc123def      pgvector/pgvector:pg16   Up 2 seconds   0.0.0.0:5432->5432/tcp
```

#### 5. Verifica que pgvector está instalado

```bash
# Conéctate al contenedor
docker exec -it chatysp-postgres-dev psql -U postgres -d chatysp

# Dentro de psql, verifica:
SELECT * FROM pg_extension WHERE extname = 'vector';

# Deberías ver:
#  extname | extowner | extnamespace | ...
# ---------+----------+--------------+-----
#  vector  |       10 |         2200 | ...

# Sal de psql:
\q
```

#### 6. Conecta pgAdmin al contenedor Docker

1. Abre pgAdmin
2. Click derecho en "Servers" → "Create" → "Server"
3. Pestaña **General**:
   - Name: `ChatYSP Local (Docker)`
4. Pestaña **Connection**:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `chatysp`
   - Username: `postgres`
   - Password: `7754`
   - Save password: ✅
5. Click "Save"

Ya deberías poder ver tu base de datos en pgAdmin con pgvector instalado.

---

## ✅ Paso 3: Ejecutar la Migración

Una vez que pgvector esté instalado EN AMBOS ENTORNOS:

### Para Local (Docker):
```bash
cd C:\Users\merce\Desktop\ChatYSP\backend

# Asegúrate de que .env apunta a localhost
# DB_HOST=localhost
# DB_PORT=5432

npx sequelize-cli db:migrate
```

### Para Producción (Neon):
1. Crea un archivo `.env.production` con tus credenciales de Neon:
```env
DB_NAME=chatysp
DB_USER=tu-neon-user
DB_PASSWORD=tu-neon-password
DB_HOST=ep-xxx.us-east-1.aws.neon.tech
DB_PORT=5432
```

2. Ejecuta la migración en producción:
```bash
# Opción A: Cambiar temporalmente .env
# Reemplaza las variables DB_* con las de Neon y ejecuta:
npx sequelize-cli db:migrate

# Opción B: Usar la UI de Neon SQL Editor
# Copia y pega el contenido de la migración manualmente
```

---

## 🧪 Paso 4: Verificar Todo

### Verifica la columna embedding existe:

**En local:**
```bash
docker exec -it chatysp-postgres-dev psql -U postgres -d chatysp -c "\d knowledge_base"
```

**En Neon (SQL Editor):**
```sql
\d knowledge_base
```

Deberías ver:
```
Column    |     Type      | ...
----------+---------------+-----
embedding | vector(1536)  | ...
```

### Verifica el índice HNSW:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'knowledge_base' 
AND indexname LIKE '%embedding%';
```

Deberías ver:
```
indexname: knowledge_base_embedding_idx
indexdef: CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)
```

---

## 🎯 Próximos Pasos

Una vez que pgvector esté instalado y la migración ejecutada:

1. **Popula youtube_videos.json** con tus 500+ videos
2. **Ejecuta el script de importación**:
```bash
cd C:\Users\merce\Desktop\ChatYSP\backend
node scripts/importYouTubeVideos.js --file data/youtube_videos.json
```
3. **Prueba la búsqueda semántica** (ver VIDEO_EMBEDDINGS_GUIDE.md)

---

## 📝 Comandos Útiles de Docker

```bash
# Ver logs del contenedor
docker logs chatysp-postgres-dev

# Detener el contenedor
docker-compose down

# Detener Y borrar los datos (¡cuidado!)
docker-compose down -v

# Reiniciar el contenedor
docker-compose restart

# Ver estadísticas de uso
docker stats chatysp-postgres-dev
```

---

## ❓ Troubleshooting

### Error: "Cannot connect to Docker daemon"
- Asegúrate de que Docker Desktop esté corriendo

### Error: "Port 5432 is already in use"
- Detén tu PostgreSQL local si está corriendo
- O cambia el puerto en docker-compose.yml: `"5433:5432"`
- Y actualiza .env: `DB_PORT=5433`

### Error: "relation knowledge_base does not exist"
- Asegúrate de haber corrido todas las migraciones previas:
```bash
npx sequelize-cli db:migrate
```

### No veo la extensión vector
```sql
-- Instálala manualmente:
CREATE EXTENSION IF NOT EXISTS vector;

-- Verifica la versión:
SELECT extversion FROM pg_extension WHERE extname = 'vector';
```

---

## 🎊 ¡Listo!

Con esto deberías tener:
- ✅ Neon con pgvector habilitado
- ✅ PostgreSQL local en Docker con pgvector
- ✅ Conexión desde pgAdmin al contenedor
- ✅ Migración ejecutada con columna embedding
- ✅ Índice HNSW creado para búsquedas rápidas
