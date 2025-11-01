# 🚀 Guía de Uso - Colección Insomnia ChatYSP

## 📋 Descripción

Esta colección de Insomnia contiene todas las rutas de la API de ChatYSP organizadas por funcionalidad, con ejemplos completos y variables de entorno configuradas.

## 📦 Importar la Colección

1. **Abrir Insomnia**
2. **Importar archivo**:
   - Ir a `Application` → `Preferences` → `Data` → `Import Data`
   - Seleccionar el archivo `insomnia-collection.json`
   - Confirmar importación

## ⚙️ Configuración Inicial

### 1. **Variables de Entorno**
La colección incluye estas variables predefinidas:
- `base_url`: http://localhost:5000
- `jwt_token`: (se completa después del login)
- `admin_token`: (se completa después del login de admin)

### 2. **Flujo de Autenticación**

#### **Paso 1: Registrar Usuario**
```
POST /api/auth/register
```
**Body ejemplo**:
```json
{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "Password123!",
  "avatar": "https://avatar.url/john.jpg"
}
```

#### **Paso 2: Hacer Login**
```
POST /api/auth/login
```
**Body ejemplo**:
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### **Paso 3: Copiar Token**
Después del login exitoso, copiar el `token` de la respuesta y pegarlo en la variable `jwt_token` del entorno.

## 📂 Estructura de la Colección

### 🔐 **Autenticación**
- **Registro de Usuario**: Crear nueva cuenta
- **Iniciar Sesión**: Obtener JWT token
- **Obtener Perfil**: Info del usuario actual
- **Actualizar Perfil**: Modificar datos del usuario

### 🏠 **Salas**
- **Listar Salas**: Ver todas las salas disponibles
- **Crear Sala**: Nueva sala de chat/juegos
- **Unirse a Sala**: Entrar a una sala existente

### 💬 **Chat**
- **Obtener Mensajes**: Historial de mensajes de una sala
- **Enviar Mensaje**: Mensaje normal de chat
- **Mensaje con IA (Coach)**: Activar respuesta del coach ontológico

### 🎮 **Juegos**
- **Crear Juego**: Nuevo juego de trivia
- **Unirse a Juego**: Participar en juego
- **Enviar Respuesta**: Responder pregunta de trivia

### ⚙️ **Administración**
- **Estadísticas del Sistema**: Métricas generales
- **Gestionar Usuarios**: Lista y administración de usuarios
- **Crear Pregunta**: Nueva pregunta para trivia

## 🎯 **Casos de Uso Principales**

### **1. Testear el Coach de IA**
1. Crear cuenta → Login → Crear/Unirse a sala
2. Usar "Mensaje con IA (Coach)" con ejemplos como:
   ```json
   {
     "content": "@coach Me siento perdido en mi carrera profesional",
     "messageType": "text",
     "mentionAI": true
   }
   ```

### **2. Probar Juegos de Trivia**
1. Crear sala tipo "game"
2. Crear juego con configuración personalizada
3. Unirse al juego
4. Enviar respuestas durante el juego

### **3. Gestión Administrativa**
1. Login con cuenta admin
2. Copiar token a `admin_token`
3. Acceder a estadísticas y gestión

## 📝 **Ejemplos de Payloads**

### **Crear Sala con IA Habilitada**
```json
{
  "name": "Sala de Coaching Personal",
  "description": "Espacio para crecimiento personal y reflexión",
  "roomType": "chat",
  "isPublic": true,
  "maxUsers": 10,
  "settings": {
    "aiEnabled": true,
    "allowFiles": false,
    "moderation": "auto"
  }
}
```

### **Mensaje para Activar Coach**
```json
{
  "content": "@coach No sé qué hacer con mi vida profesional, me siento estancado",
  "messageType": "text",
  "mentionAI": true
}
```

### **Configuración de Juego**
```json
{
  "gameType": "trivia",
  "settings": {
    "maxPlayers": 6,
    "questionsCount": 10,
    "timePerQuestion": 30,
    "difficulty": "medium",
    "category": "general"
  }
}
```

## 🔧 **Configuración Avanzada**

### **Cambiar Base URL**
Para probar contra servidor de producción:
1. Ir a `Environment` → `ChatYSP Environment`
2. Cambiar `base_url` a tu URL de producción
3. Guardar cambios

### **Headers Automáticos**
Los endpoints protegidos incluyen automáticamente:
- `Authorization: Bearer {{ _.jwt_token }}`
- `Content-Type: application/json`

## 🐛 **Solución de Problemas**

### **Error 401 Unauthorized**
- Verificar que `jwt_token` esté configurado
- Token puede haber expirado (hacer login nuevamente)

### **Error 404 Not Found**
- Verificar que el servidor esté corriendo en puerto 5000
- Comprobar `base_url` en variables de entorno

### **Error 500 Internal Server Error**
- Verificar logs del servidor
- Comprobar configuración de base de datos
- Verificar variables de entorno (.env)

## 📋 **Checklist de Testing**

### ✅ **Flujo Básico**
- [ ] Registro de usuario
- [ ] Login exitoso
- [ ] Crear sala con IA
- [ ] Enviar mensaje normal
- [ ] Activar coach con @coach
- [ ] Verificar respuesta empática

### ✅ **Flujo de Juegos**
- [ ] Crear sala de juegos
- [ ] Crear juego de trivia
- [ ] Unirse al juego
- [ ] Responder preguntas
- [ ] Ver resultados

### ✅ **Flujo Admin**
- [ ] Login como admin
- [ ] Ver estadísticas
- [ ] Gestionar usuarios
- [ ] Crear preguntas

## 💡 **Tips de Uso**

1. **Usar variables**: Aprovecha las variables `{{ _.jwt_token }}` para no copiar tokens manualmente
2. **Organizar por folders**: Los endpoints están organizados por funcionalidad
3. **Copiar y modificar**: Duplica requests para crear variaciones
4. **Probar errores**: Prueba con datos inválidos para verificar validaciones
5. **Monitorear logs**: Observa los logs del servidor durante las pruebas

¡Con esta colección puedes probar todas las funcionalidades de ChatYSP de manera sistemática! 🚀