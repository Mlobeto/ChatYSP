@echo off
REM Script para iniciar PostgreSQL local con pgvector usando Docker
REM Uso: Doble click o ejecuta desde CMD/PowerShell

echo.
echo ========================================
echo   ChatYSP - PostgreSQL con pgvector
echo ========================================
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado
    echo.
    echo Por favor instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    echo Sigue la guia en: DOCKER_INSTALLATION.md
    echo.
    pause
    exit /b 1
)

echo [OK] Docker instalado
echo.

REM Verificar si Docker está corriendo
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta corriendo
    echo.
    echo Por favor abre Docker Desktop y espera a que inicie
    echo Luego ejecuta este script nuevamente
    echo.
    pause
    exit /b 1
)

echo [OK] Docker corriendo
echo.

REM Iniciar el contenedor
echo Iniciando PostgreSQL con pgvector...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] No se pudo iniciar el contenedor
    pause
    exit /b 1
)

echo.
echo [OK] Contenedor iniciado exitosamente!
echo.

REM Esperar a que PostgreSQL esté listo
echo Esperando a que PostgreSQL este listo...
timeout /t 5 /nobreak >nul

REM Verificar que el contenedor está corriendo
docker ps | findstr "chatysp-postgres-dev" >nul
if %errorlevel% neq 0 (
    echo [ERROR] El contenedor no esta corriendo
    echo.
    echo Ver logs con: docker logs chatysp-postgres-dev
    pause
    exit /b 1
)

echo [OK] PostgreSQL esta listo!
echo.

REM Mostrar información del contenedor
echo ========================================
echo   Informacion de Conexion
echo ========================================
echo.
echo   Host:     localhost
echo   Puerto:   5432
echo   Database: chatysp
echo   Usuario:  postgres
echo   Password: 7754
echo.
echo ========================================
echo   Proximos Pasos
echo ========================================
echo.
echo 1. Inicializa la base de datos:
echo    node scripts/initNeonDB.js
echo.
echo 2. Conecta pgAdmin:
echo    - Servidor: localhost
echo    - Puerto: 5432
echo    - Database: chatysp
echo.
echo 3. Ver logs:
echo    docker logs chatysp-postgres-dev
echo.
echo 4. Detener:
echo    docker-compose down
echo.

pause
