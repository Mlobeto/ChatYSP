# ChatYSP - Plataforma de Chat con IA y Juegos

Una plataforma moderna de chat en tiempo real con funcionalidades de coaching con IA, juegos integrados y panel de administración.

## 🚀 Estructura del Proyecto

```
ChatYSP/
├── backend/          # Servidor Node.js + Express + Socket.IO
├── dashboard/        # Panel de administración React
├── mobile/          # Aplicación móvil Expo React Native
├── docs/            # Documentación del proyecto
├── .gitignore
└── README.md
```

## 📋 Características Principales

### Backend (Node.js + Express + Socket.IO)
- **Chat en tiempo real** con Socket.IO
- **Sistema de salas** públicas y privadas
- **Juegos integrados** (Piedra, Papel, Tijera; Trivial)
- **IA Coaching** con OpenAI GPT y conocimiento ontológico
- **Autenticación JWT** con roles de usuario
- **Base de datos PostgreSQL** con Sequelize ORM
- **API RESTful** completa
- **Logging avanzado** con Winston

### Dashboard (React + Redux + Tailwind)
- **Panel de administración** moderno y responsivo
- **Gestión de usuarios** con roles y permisos
- **Gestión de contenido** (tips, videos)
- **Analíticas en tiempo real**
- **Configuración del sistema IA**
- **Interfaz intuitiva** con Tailwind CSS

### Mobile (Expo React Native + Redux)
- **App móvil nativa** para iOS y Android
- **Chat con IA** personalizada del coach
- **Salas de chat** por país en tiempo real
- **Minijuegos** trivia multijugador
- **Tips y videos** del coach
- **Interfaz optimizada** para móviles con NativeWind

## 🛠️ Tecnologías Utilizadas

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSockets**: Socket.IO
- **Base de datos**: PostgreSQL + Sequelize
- **Autenticación**: JWT + bcrypt
- **IA**: OpenAI GPT-4
- **Logging**: Winston
- **Testing**: Jest
- **Validación**: Joi

### Dashboard
- **Framework**: React 18
- **Estado**: Redux Toolkit
- **Estilos**: Tailwind CSS
- **Build**: Vite
- **Iconos**: Heroicons
- **Notificaciones**: React Hot Toast
- **Routing**: React Router

### Mobile
- **Framework**: Expo React Native
- **Estado**: Redux Toolkit
- **Estilos**: NativeWind (Tailwind para RN)
- **Navegación**: React Navigation
- **WebSockets**: Socket.IO Client
- **Storage**: AsyncStorage
- **Iconos**: Ionicons
- **Video**: Expo AV

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+
- PostgreSQL 14+
- Expo CLI (para móvil)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/Mlobeto/ChatYSP.git
cd ChatYSP
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Configurar las variables de entorno y ejecutar:
```bash
npm run db:migrate
npm run db:seed
npm run dev
```

El backend estará disponible en: `http://localhost:5000`

### 3. Configurar Dashboard
```bash
cd ../dashboard
npm install
npm run dev
```

El dashboard estará disponible en: `http://localhost:5173`

### 4. Configurar App Móvil
```bash
cd ../mobile
npm install

# Instalar Expo CLI globalmente si no lo tienes
npm install -g @expo/cli

# Iniciar el proyecto
npm start
```

Escanea el código QR con la app Expo Go en tu dispositivo móvil.

## 📚 Documentación

- [Guía de API](backend/docs/API.md)
- [Configuración de IA](docs/AI_CONFIGURATION.md)
- [Guía de Deployment](docs/DEPLOYMENT.md)
- [Colección Insomnia](backend/INSOMNIA_GUIDE.md)

## 🤖 Sistema de IA

El sistema incluye un coach de IA avanzado con:
- **Conocimiento ontológico** especializado
- **Respuestas contextuales** personalizadas
- **Memoria de conversación** mejorada
- **Entrenamiento continuo** a través del dashboard

## 🎮 Juegos Integrados

- **Piedra, Papel, Tijera**: Multijugador en tiempo real
- **Trivial**: Preguntas categorizadas con puntuación
- **Sistema extensible** para nuevos juegos

## 🔐 Autenticación y Roles

- **Usuarios**: Acceso a chat y juegos
- **Moderadores**: Gestión de salas y usuarios
- **Administradores**: Acceso completo al dashboard

## 📊 Monitoreo y Analytics

- **Métricas en tiempo real** de usuarios y actividad
- **Logs estructurados** con Winston
- **Dashboard analítico** con visualizaciones
- **Reportes de uso** y rendimiento

## 🚀 Deployment

### Desarrollo
```bash
# Backend
cd backend && npm run dev

# Dashboard
cd dashboard && npm run dev
```

### Producción
```bash
# Backend
cd backend && npm start

# Dashboard
cd dashboard && npm run build
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal** - [@Mlobeto](https://github.com/Mlobeto)

## 🙏 Agradecimientos

- OpenAI por la API de GPT
- Socket.IO por la tecnología de WebSockets
- La comunidad de React y Node.js