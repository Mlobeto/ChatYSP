# Desplegar Backend en Render# Desplegar Backend en Render



## Pasos para Deploy en Render## Pasos para Deploy en Render



### 1. Crear cuenta en Render### 1. Crear cuenta en Render

- Ve a [https://render.com](https://render.com)- Ve a [https://render.com](https://render.com)

- Regístrate o inicia sesión- Regístrate o inicia sesión



### 2. Crear nuevo Web Service### 2. Crear nuevo Web Service

1. Click en **"New +"** → **"Web Service"**1. Click en **"New +"** → **"Web Service"**

2. Conecta tu repositorio de GitHub2. Conecta tu repositorio de GitHub

3. Selecciona el repositorio **ChatYSP**3. Selecciona el repositorio **ChatYSP**

4. Configura el servicio:4. Configura el servicio:

   - **Name**: `chatysp-backend`   - **Name**: `chatysp-backend`

   - **Region**: Elige el más cercano (US East recomendado)   - **Region**: Elige el más cercano (US East recomendado)

   - **Branch**: `development` (o `main` según tu rama principal)   - **Branch**: `development` (o `main` según tu rama principal)

   - **Root Directory**: `backend`   - **Root Directory**: `backend`

   - **Environment**: `Node`   - **Environment**: `Node`

   - **Build Command**: `npm install`   - **Build Command**: `npm install`

   - **Start Command**: `npm start`   - **Start Command**: `npm start`

   - **Plan**: Free (o el que prefieras)   - **Plan**: Free (o el que prefieras)



### 3. Variables de Entorno### 3. Variables de Entorno

En la sección **"Environment"**, agrega las siguientes variables:En la sección **"Environment"**, agrega las siguientes variables:



**IMPORTANTE:** Reemplaza todos los valores de ejemplo con tus credenciales reales.```env

NODE_ENV=production

```envPORT=10000

NODE_ENV=productionCLIENT_URL=https://tu-dashboard.onrender.com

PORT=10000

CLIENT_URL=https://tu-dashboard.onrender.com# Database - NEON

DB_NAME=tu-db-name

# Database - NEON (Obtén estos valores de tu dashboard de Neon)DB_USER=tu-db-user

DB_NAME=tu-database-nameDB_PASSWORD=tu-db-password

DB_USER=tu-database-userDB_HOST=tu-neon-host.aws.neon.tech

DB_PASSWORD=tu-database-passwordDB_PORT=5432

DB_HOST=tu-neon-host.aws.neon.techDB_SSL=true

DB_PORT=5432

DB_SSL=true# JWT

JWT_SECRET=tu-jwt-secret-muy-largo-y-seguro-generado-aleatoriamente

# JWT (Genera un string aleatorio largo y seguro)JWT_EXPIRES_IN=7d

JWT_SECRET=genera-un-string-muy-largo-aleatorio-y-seguro-aqui

JWT_EXPIRES_IN=7d# Admin

ADMIN_REGISTRATION_KEY=TU_ADMIN_KEY_AQUI

# Admin (Crea tu propia clave de admin)

ADMIN_REGISTRATION_KEY=Tu-Clave-Admin-Segura# OpenAI

OPENAI_API_KEY=TU_OPENAI_API_KEY_AQUI

# OpenAI (Obtén tu API key de https://platform.openai.com/api-keys)

OPENAI_API_KEY=sk-proj-tu-openai-api-key-aqui# Email

EMAIL_HOST=smtp.gmail.com

# Email (Configuración de Gmail con contraseña de aplicación)EMAIL_PORT=587

EMAIL_HOST=smtp.gmail.comEMAIL_USER=tu-email@gmail.com

EMAIL_PORT=587EMAIL_PASS=tu-password-de-aplicacion

EMAIL_USER=tu-email@gmail.comEMAIL_FROM_NAME=ChatYSP Community

EMAIL_PASS=tu-app-password-de-16-caracteresEMAIL_FROM_EMAIL=tu-email@gmail.com

EMAIL_FROM_NAME=ChatYSP CommunityCOACH_EMAIL=tu-email@gmail.com

EMAIL_FROM_EMAIL=tu-email@gmail.com

COACH_EMAIL=tu-email@gmail.com# File Upload

MAX_FILE_SIZE=10485760

# File UploadUPLOAD_PATH=/tmp/uploads/

MAX_FILE_SIZE=10485760

UPLOAD_PATH=/tmp/uploads/# Rate Limiting

RATE_LIMIT_WINDOW_MS=300000

# Rate LimitingRATE_LIMIT_MAX_REQUESTS=100

RATE_LIMIT_WINDOW_MS=300000RATE_LIMIT_AUTH_MAX=20

RATE_LIMIT_MAX_REQUESTS=100

RATE_LIMIT_AUTH_MAX=20# Socket.IO

SOCKET_PING_TIMEOUT=60000

# Socket.IOSOCKET_PING_INTERVAL=25000

SOCKET_PING_TIMEOUT=60000

SOCKET_PING_INTERVAL=25000# Logging

LOG_LEVEL=info

# Logging```

LOG_LEVEL=info

```### 4. Health Check

Render verificará automáticamente el endpoint `/health` para comprobar que el servicio está funcionando.

### 4. Health Check

Render verificará automáticamente el endpoint `/health` para comprobar que el servicio está funcionando.### 5. Deploy

1. Click en **"Create Web Service"**

### 5. Deploy2. Render comenzará a construir y desplegar automáticamente

1. Click en **"Create Web Service"**3. El proceso tarda aproximadamente 5-10 minutos

2. Render comenzará a construir y desplegar automáticamente

3. El proceso tarda aproximadamente 5-10 minutos### 6. Obtener la URL

Una vez completado, Render te dará una URL tipo:

### 6. Obtener la URL```

Una vez completado, Render te dará una URL tipo:https://chatysp-backend.onrender.com

``````

https://chatysp-backend.onrender.com

```### 7. Configurar en la App Móvil

Actualiza el archivo `mobile/app/utils/constants.js`:

### 7. Configurar en la App Móvil

Actualiza el archivo `mobile/app/utils/constants.js`:```javascript

export const API_URL = 'https://chatysp-backend.onrender.com/api';

```javascriptexport const SOCKET_URL = 'https://chatysp-backend.onrender.com';

export const API_URL = 'https://chatysp-backend.onrender.com/api';```

export const SOCKET_URL = 'https://chatysp-backend.onrender.com';

```### 8. Rebuild de la App

Después de actualizar la URL, reconstruye la app:

### 8. Rebuild de la App```bash

Después de actualizar la URL, reconstruye la app:cd mobile

```bashnpx eas build --platform android --profile preview

cd mobile```

npx eas build --platform android --profile preview

```## Notas Importantes



## Notas Importantes### Plan Free de Render

- ⚠️ El servicio se duerme después de 15 minutos de inactividad

### Plan Free de Render- La primera petición después de dormir tarda ~30 segundos en responder

- ⚠️ El servicio se duerme después de 15 minutos de inactividad- Para mantenerlo activo 24/7, necesitas el plan Starter ($7/mes)

- La primera petición después de dormir tarda ~30 segundos en responder

- Para mantenerlo activo 24/7, necesitas el plan Starter ($7/mes)### CORS

El backend ya está configurado para aceptar peticiones de cualquier origen en producción.

### Seguridad

- ⚠️ **NUNCA** commites archivos `.env` o credenciales al repositorio### Base de Datos

- Usa variables de entorno en Render para todas las credencialesYa estás usando Neon (PostgreSQL en la nube), que está optimizado para producción.

- Genera JWT_SECRET aleatorio: puedes usar `openssl rand -hex 64`

### Logs

### CORSPuedes ver los logs en tiempo real en el dashboard de Render:

El backend ya está configurado para aceptar peticiones de cualquier origen en producción.- Click en tu servicio

- Tab "Logs"

### Base de Datos

Ya estás usando Neon (PostgreSQL en la nube), que está optimizado para producción.## Troubleshooting



### Logs### Error de conexión a DB

Puedes ver los logs en tiempo real en el dashboard de Render:- Verifica que las credenciales de Neon sean correctas

- Click en tu servicio- Asegúrate de que `DB_SSL=true` esté configurado

- Tab "Logs"

### App móvil no se conecta

## Troubleshooting- Verifica que la URL en `constants.js` sea correcta (HTTPS, sin barra final)

- Confirma que el backend responda en `/health`

### Error de conexión a DB

- Verifica que las credenciales de Neon sean correctas### WebSocket no funciona

- Asegúrate de que `DB_SSL=true` esté configurado- Render soporta WebSocket automáticamente

- Verifica que uses HTTPS en la URL del socket

### App móvil no se conecta

- Verifica que la URL en `constants.js` sea correcta (HTTPS, sin barra final)## Comandos Útiles

- Confirma que el backend responda en `/health`

```bash

### WebSocket no funciona# Ver logs en vivo

- Render soporta WebSocket automáticamente# (Desde el dashboard de Render)

- Verifica que uses HTTPS en la URL del socket

# Forzar redeploy

## Comandos Útiles# Click en "Manual Deploy" → "Clear build cache & deploy"



```bash# Ver variables de entorno

# Ver logs en vivo# Settings → Environment → Environment Variables

# (Desde el dashboard de Render)```



# Forzar redeploy## Siguiente Paso

# Click en "Manual Deploy" → "Clear build cache & deploy"

Después del deploy:

# Ver variables de entorno1. Copia la URL de Render

# Settings → Environment → Environment Variables2. Actualiza `mobile/app/utils/constants.js`

```3. Reconstruye la app con EAS

4. Descarga e instala el APK

## Siguiente Paso5. ¡Prueba todo el flujo!


Después del deploy:
1. Copia la URL de Render
2. Actualiza `mobile/app/utils/constants.js`
3. Reconstruye la app con EAS
4. Descarga e instala el APK
5. ¡Prueba todo el flujo!
