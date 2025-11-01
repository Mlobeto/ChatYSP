# ChatYSP Dashboard

Panel de administración moderno para la plataforma ChatYSP, construido con React, Redux Toolkit y Tailwind CSS.

## 🚀 Características

- **Panel de administración** moderno y responsivo
- **Gestión de usuarios** con roles y permisos
- **Gestión de contenido** (tips, videos)
- **Analíticas en tiempo real** 
- **Configuración del sistema IA**
- **Interfaz intuitiva** con Tailwind CSS
- **Estado global** con Redux Toolkit
- **Autenticación JWT** integrada

## 🛠️ Tecnologías

- **Framework**: React 18
- **Build Tool**: Vite
- **Estado**: Redux Toolkit
- **Estilos**: Tailwind CSS
- **Iconos**: Heroicons
- **Routing**: React Router v6
- **Notificaciones**: React Hot Toast
- **HTTP Client**: Axios

## 📁 Estructura

```
src/
├── components/      # Componentes reutilizables
│   ├── DashboardLayout.jsx
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   └── AppRouter.jsx
├── pages/          # Páginas principales
│   ├── DashboardHome.jsx
│   ├── LoginPage.jsx
│   ├── UsersPage.jsx
│   ├── TipsPage.jsx
│   ├── VideosPage.jsx
│   ├── AnalyticsPage.jsx
│   └── SettingsPage.jsx
├── redux/          # Estado global
│   ├── store.js
│   ├── authSlice.js
│   └── dashboardSlice.js
├── services/       # Servicios API
│   ├── authApi.js
│   ├── dashboardApi.js
│   └── uploadService.js
├── utils/          # Utilidades
├── main.jsx        # Punto de entrada
└── index.css       # Estilos globales
```

## 🚀 Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Configurar el archivo `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ChatYSP Dashboard
VITE_APP_VERSION=1.0.0
NODE_ENV=development
```

3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El dashboard estará disponible en: `http://localhost:5173`

## 📊 Funcionalidades del Dashboard

### 🏠 Dashboard Principal
- **Estadísticas generales** de la plataforma
- **Usuarios activos** en tiempo real
- **Métricas de uso** y actividad
- **Gráficos de actividad** reciente

### 👥 Gestión de Usuarios
- **Lista paginada** de usuarios
- **Búsqueda y filtros** avanzados
- **Gestión de roles** y permisos
- **Suspensión/activación** de cuentas
- **Historial de actividad** por usuario

### 💡 Gestión de Tips
- **CRUD completo** de tips
- **Categorización** por temas
- **Editor de contenido** enriquecido
- **Programación** de publicaciones
- **Estadísticas de visualización**

### 🎥 Gestión de Videos
- **Subida de videos** con progreso
- **Gestión de metadatos** (título, descripción, tags)
- **Thumbnails automáticos** y manuales
- **Encoding y optimización**
- **Estadísticas de reproducción**

### 📈 Analíticas
- **Métricas en tiempo real**
- **Gráficos interactivos**
- **Reportes personalizados**
- **Exportación de datos**
- **Alertas y notificaciones**

### 🤖 Configuración IA
- **Gestión del conocimiento** ontológico
- **Entrenamiento** de respuestas
- **Configuración de personalidad**
- **Estadísticas de uso** de IA
- **Logs de conversaciones**

### ⚙️ Configuración del Sistema
- **Configuración general** de la plataforma
- **Gestión de permisos**
- **Configuración de notificaciones**
- **Backup y restauración**
- **Logs del sistema**

## 🔐 Autenticación

### Flujo de Autenticación
1. Login con email/password
2. Verificación de rol de administrador
3. Token JWT almacenado en localStorage
4. Renovación automática de token
5. Logout seguro

### Protección de Rutas
```jsx
// Componente protegido
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

## 🎨 Sistema de Diseño

### Colores Principales
```css
:root {
  --primary-50: #f0f9ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
}
```

### Componentes Base
- **Botones**: Múltiples variantes y tamaños
- **Formularios**: Campos con validación
- **Tablas**: Responsivas con paginación
- **Modales**: Overlay con animaciones
- **Cards**: Contenedores de información

### Responsive Design
- **Mobile First**: Diseño adaptativo
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Grid System**: CSS Grid y Flexbox
- **Sidebar**: Colapsible en móviles

## 🔄 Estado Global (Redux)

### Slices Principales

#### Auth Slice
```javascript
// Estado de autenticación
{
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
}
```

#### Dashboard Slice
```javascript
// Estado del dashboard
{
  stats: {},
  users: [],
  tips: [],
  videos: [],
  loading: false,
  error: null,
  pagination: {}
}
```

### Acciones Asíncronas
- `loginAdmin` - Inicio de sesión
- `fetchUsers` - Obtener usuarios
- `createTip` - Crear tip
- `uploadVideo` - Subir video
- `fetchStats` - Obtener estadísticas

## 🌐 Servicios API

### Auth API
```javascript
// services/authApi.js
export const authApi = {
  login: (credentials) => authAPI.post('/auth/login', credentials),
  verifyToken: () => authAPI.get('/auth/me'),
  updateProfile: (data) => authAPI.put('/auth/profile', data)
};
```

### Dashboard API
```javascript
// services/dashboardApi.js
export const dashboardApi = {
  getStats: () => dashboardAPI.get('/admin/stats'),
  getUsers: (params) => dashboardAPI.get('/admin/users', { params }),
  createTip: (data) => dashboardAPI.post('/admin/tips', data)
};
```

### Upload Service
```javascript
// services/uploadService.js
export const uploadService = {
  uploadVideo: (file, data, onProgress) => {
    // Implementación de subida con progreso
  }
};
```

## 📱 Responsividad

### Breakpoints
- **sm**: 640px - Móviles grandes
- **md**: 768px - Tablets
- **lg**: 1024px - Laptops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Pantallas grandes

### Componentes Adaptativos
- **Sidebar**: Se colapsa en móviles
- **Tablas**: Scroll horizontal en móviles
- **Cards**: Grid adaptativo
- **Modales**: Fullscreen en móviles

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Herramientas de Testing
- **Vitest**: Framework de testing
- **Testing Library**: Utilidades de testing
- **MSW**: Mock Service Worker
- **Cypress**: Tests E2E (futuro)

## 📦 Build y Deployment

### Scripts Disponibles
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Configuración de Build
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
```

### Variables de Entorno por Ambiente

#### Desarrollo
```env
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
```

#### Producción
```env
VITE_API_URL=https://api.chatysp.com/api
NODE_ENV=production
```

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

### Servidor Estático
```bash
# Usando serve
npx serve dist

# Usando nginx
# Configurar nginx para servir archivos estáticos
```

### Netlify/Vercel
```bash
# Netlify
npm run build && netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

## 🔧 Configuración Avanzada

### Proxy de Desarrollo
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

### Optimizaciones
- **Code Splitting**: Lazy loading de rutas
- **Tree Shaking**: Eliminación de código muerto
- **Minificación**: Compresión de archivos
- **Caching**: Estrategias de cache

## 📊 Monitoreo

### Métricas del Frontend
- **Performance**: Core Web Vitals
- **Errores**: Error boundaries
- **Uso**: Analytics de navegación
- **API Calls**: Timing y errores

### Error Handling
```jsx
// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Algo salió mal.</h1>;
    }
    
    return this.props.children;
  }
}
```

## 🐛 Solución de Problemas

### Errores Comunes

**Proxy no funciona**
```bash
# Verificar configuración en vite.config.js
# Asegurar que el backend esté ejecutándose en el puerto correcto
```

**Problemas de CORS**
```bash
# Configurar CORS en el backend
# Verificar VITE_API_URL en .env
```

**Estados perdidos**
```bash
# Verificar Redux DevTools
# Comprobar persistencia en localStorage
```

## 🤝 Contribución

### Estándares de Código
- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **Husky**: Git hooks
- **Conventional Commits**: Mensajes estandarizados

### Workflow de Desarrollo
1. Crear branch desde `main`
2. Implementar feature
3. Escribir tests
4. Commit con conventional commits
5. Push y crear PR
6. Code review
7. Merge a `main`

---

Para más información, consulta la [documentación principal](../README.md) del proyecto.