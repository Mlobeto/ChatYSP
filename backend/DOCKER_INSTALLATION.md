# Instalación de Docker Desktop en Windows - Guía Rápida

## 🚀 Pasos de Instalación

### 1. Descargar Docker Desktop
- Ve a: https://www.docker.com/products/docker-desktop/
- Click en **"Download for Windows"**
- Descargará: `Docker Desktop Installer.exe` (~500 MB)

### 2. Instalar Docker Desktop
1. Ejecuta el instalador descargado
2. Acepta los términos de servicio
3. **Importante**: Asegúrate de marcar estas opciones:
   - ✅ Use WSL 2 instead of Hyper-V (recomendado)
   - ✅ Add shortcut to desktop
4. Click "Ok" y espera a que termine la instalación (~5 minutos)
5. Click "Close and restart" cuando te lo pida

### 3. Configurar Docker Desktop (Primer inicio)
1. Docker Desktop se abrirá automáticamente después del reinicio
2. Si pide actualizar WSL 2:
   - Sigue este link: https://aka.ms/wsl2kernel
   - Descarga e instala el paquete de actualización
   - Reinicia Docker Desktop
3. Acepta el Service Agreement
4. Opcionalmente: Salta el tutorial o crea una cuenta (no es obligatorio)

### 4. Verificar Instalación
Abre PowerShell o Git Bash y ejecuta:
```bash
docker --version
docker-compose --version
```

Deberías ver algo como:
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.23.x
```

### 5. Probar que funciona
```bash
docker run hello-world
```

Si ves el mensaje "Hello from Docker!" entonces está funcionando correctamente.

## ⚡ Inicio Rápido para ChatYSP

Una vez que Docker esté instalado, vuelve aquí y ejecuta:

```bash
cd C:/Users/merce/Desktop/ChatYSP/backend

# Inicia PostgreSQL con pgvector
docker-compose up -d

# Verifica que está corriendo
docker ps

# Inicializa la base de datos
node scripts/initNeonDB.js
```

## 🔧 Comandos Útiles

```bash
# Ver contenedores corriendo
docker ps

# Ver logs del contenedor PostgreSQL
docker logs chatysp-postgres-dev

# Detener el contenedor
docker-compose down

# Reiniciar el contenedor
docker-compose restart

# Conectarse al PostgreSQL del contenedor
docker exec -it chatysp-postgres-dev psql -U postgres -d chatysp
```

## ❓ Troubleshooting

### "WSL 2 installation is incomplete"
- Ejecuta en PowerShell como Admin:
```powershell
wsl --install
wsl --set-default-version 2
```
- Reinicia tu PC

### "Docker Desktop is starting..."  (se queda mucho tiempo)
- Espera 2-3 minutos la primera vez
- Si no arranca, reinicia Docker Desktop desde el ícono en la bandeja del sistema

### "Cannot connect to Docker daemon"
- Asegúrate de que Docker Desktop esté corriendo (ícono en bandeja del sistema)
- Si el ícono no aparece, abre Docker Desktop manualmente

### Puerto 5432 ya está en uso
Si tienes PostgreSQL instalado localmente:
- Opción A: Detén PostgreSQL local temporalmente
- Opción B: Cambia el puerto en `docker-compose.yml`:
  ```yaml
  ports:
    - "5433:5432"  # Usa puerto 5433 en tu máquina
  ```
  Y actualiza `.env`: `DB_PORT=5433`

## 📚 Más Info
- Documentación oficial: https://docs.docker.com/desktop/install/windows-install/
- WSL 2 setup: https://learn.microsoft.com/en-us/windows/wsl/install
