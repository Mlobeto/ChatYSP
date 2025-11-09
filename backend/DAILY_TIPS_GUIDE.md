# 📱 Sistema de Tips Diarios - Guía de Uso

## 🎯 Cómo Funciona

El sistema genera **automáticamente un tip diario** de lunes a viernes a las 9 AM (configurable).

### Flujo de Trabajo:

```
1. ⏰ Scheduler ejecuta a las 9 AM (L-V)
        ↓
2. 🤖 IA genera tip único basado en tu banco de tips
        ↓
3. ✨ Se formatean 2 versiones:
   - WhatsApp (con negritas *)
   - Telegram (con HTML)
        ↓
4. 📧 Te llega email con ambos formatos
        ↓
5. 📋 TÚ copias y pegas en tus redes
```

## ⚙️ Configuración Inicial

### 1. Configurar Email

Edita tu archivo `.env`:

```env
# Email del servicio (desde donde se envía)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion  # Ver nota abajo

# Email del coach (donde recibes los tips)
COACH_EMAIL=coach@ejemplo.com
```

**⚠️ Importante:** Si usas Gmail, necesitas una "Contraseña de Aplicación":
1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una para "Correo"
5. Usa esa contraseña en `EMAIL_PASS`

### 2. Configurar Hora de Envío

```env
# Formato cron: minuto hora * * día-semana
# 0 9 * * 1-5 = Lunes a Viernes a las 9:00 AM
DAILY_TIP_SEND_TIME=0 9 * * 1-5

# Zona horaria
TZ=America/Argentina/Buenos_Aires
```

### 3. Cargar tus Tips

1. Ve al dashboard: http://localhost:3000/daily-tips
2. Click en pestaña "Cargar Tips"
3. Selecciona tus 180+ archivos .txt
4. Espera la confirmación de carga

## 📊 Uso del Dashboard

### Panel Principal (`/daily-tips`)

**Pestaña "Tip de Hoy":**
- Ver el tip generado hoy
- 📋 **Botón "Copiar"** para WhatsApp
- 📋 **Botón "Copiar"** para Telegram
- 🔄 Regenerar si no te gusta
- 📧 Reenviar email

**Pestaña "Cargar Tips":**
- Subir múltiples archivos .txt
- Ver progreso de carga
- Estadísticas de importación

**Pestaña "Historial":**
- Ver todos los tips generados
- Fechas de envío
- Estado de notificaciones

**Pestaña "Estadísticas":**
- Total de tips enviados
- Tips del mes/semana
- Tips únicos usados

## 🎨 Formato del Tip

### WhatsApp (copia y pega directo):
```
┏━━━━━━━━━━━━━━━┓
┃  *🦁 TIP DEL DÍA* ┃
┗━━━━━━━━━━━━━━━┛

[Contenido del tip con formato]

━━━━━━━━━━━━━━━━━━━
_Fede - Tu Coach de Rupturas_
🦁 Método *"Yo Soy el Premio"*

💪 ¿Te sirvió este tip?
📱 Compartilo con quien lo necesite
```

### Telegram (copia y pega directo):
```
╔═══════════════════╗
║  🦁 TIP DEL DÍA  ║
╚═══════════════════╝

[Contenido del tip con HTML]

━━━━━━━━━━━━━━━━━━━
Fede - Tu Coach de Rupturas
🦁 Método "Yo Soy el Premio"

💪 ¿Te sirvió este tip?
📱 Compartilo con quien lo necesite
```

## 📧 Email que Recibirás

Cada mañana recibirás un email con:
- ✅ Título del tip
- ✅ Versión formateada para WhatsApp (lista para copiar)
- ✅ Versión formateada para Telegram (lista para copiar)
- ✅ Instrucciones de uso
- ✅ Link al dashboard

## 🚀 Cómo Enviar los Tips

### Opción 1: Desde el Email
1. Abres el email
2. Copias el formato que necesites
3. Pegas en WhatsApp o Telegram
4. ¡Listo!

### Opción 2: Desde el Dashboard
1. Abres http://localhost:3000/daily-tips
2. Click en "Copiar" (WhatsApp o Telegram)
3. Pegas en tu app
4. ¡Listo!

## 🔧 Comandos Útiles

### Generar tip manualmente (si necesitas uno extra):
```bash
curl -X POST http://localhost:5000/api/daily-tips/generate \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

### Ver el tip de hoy:
```bash
curl http://localhost:5000/api/daily-tips/today \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

### Regenerar el tip de hoy:
```bash
curl -X POST http://localhost:5000/api/daily-tips/regenerate \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

## ❓ Preguntas Frecuentes

### ¿Puedo cambiar la hora de envío?
Sí, edita `DAILY_TIP_SEND_TIME` en `.env` y reinicia el servidor.

### ¿Se repiten los tips?
No, el sistema evita repetir tips durante todo un año (365 días).

### ¿Puedo editar un tip antes de enviarlo?
Sí, en el dashboard puedes regenerarlo hasta que te guste.

### ¿Funciona los fines de semana?
Por defecto no (solo L-V). Puedes cambiarlo en `DAILY_TIP_SEND_TIME`:
```env
# Para todos los días:
DAILY_TIP_SEND_TIME=0 9 * * *
```

### ¿Puedo agregar más tips?
Sí, en cualquier momento desde el dashboard → "Cargar Tips".

### ¿Qué pasa si no llega el email?
- Verifica que `EMAIL_USER` y `EMAIL_PASS` sean correctos
- Revisa spam/correo no deseado
- Usa el dashboard para ver y copiar el tip

## 🆘 Troubleshooting

### No recibo emails
1. Verifica configuración en `.env`
2. Prueba con este comando:
```bash
curl http://localhost:5000/api/daily-tips/health \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```
3. Revisa logs del servidor

### El formato se ve mal en WhatsApp
- Asegúrate de copiar TODO el texto
- No modifiques el formato
- Los asteriscos (*) son para negritas en WhatsApp

### El scheduler no ejecuta
- Verifica que el servidor esté corriendo
- Revisa la hora configurada en `DAILY_TIP_SEND_TIME`
- Revisa logs del servidor: `📅 Daily Tip Scheduler: Started`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica el health check: `/api/daily-tips/health`
3. Contacta al desarrollador
