# Guía de Configuración: WhatsApp Business API (Meta)

Esta guía te ayudará a configurar WhatsApp Business API de Meta para enviar los tips diarios automáticamente.

## 📋 Requisitos Previos

1. **Cuenta de Facebook Business Manager**
   - Si no tienes una, créala en: https://business.facebook.com

2. **Número de teléfono para WhatsApp Business**
   - Debe ser un número que NO esté registrado en WhatsApp actualmente
   - Puede recibir SMS o llamadas para verificación
   - El número objetivo: +54 9 11 5102-7942

3. **Aplicación de Facebook para Desarrolladores**

## 🚀 Paso 1: Crear Aplicación en Meta for Developers

1. Ve a https://developers.facebook.com/
2. Click en **"Mis Apps"** → **"Crear App"**
3. Selecciona tipo de app: **"Empresa"**
4. Completa:
   - **Nombre de la app**: ChatYSP WhatsApp Bot
   - **Email de contacto**: tu email
   - **Cuenta de Business Manager**: selecciona tu cuenta
5. Click en **"Crear app"**

## 📱 Paso 2: Agregar Producto WhatsApp

1. En el panel de tu app, busca **"WhatsApp"**
2. Click en **"Configurar"**
3. Acepta los términos de WhatsApp Business
4. Selecciona tu cuenta de Business Manager

## 🔑 Paso 3: Obtener Credenciales

### Token de Acceso Temporal (para pruebas)

1. En la sección **"WhatsApp" → "Introducción"**
2. Verás un **"Token de acceso temporal"** - cópialo
3. Este token dura 24 horas (útil para pruebas iniciales)

### Token de Acceso Permanente (para producción)

1. Ve a **"WhatsApp" → "Introducción"** → **"Configuración"**
2. Click en **"Generar token de sistema"**
3. Selecciona permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Copia el token y guárdalo en lugar seguro

### Phone Number ID

1. En **"WhatsApp" → "Introducción"**
2. Busca **"Phone number ID"** (un número largo)
3. Cópialo - lo necesitarás para enviar mensajes

### WhatsApp Business Account ID

1. En **"WhatsApp" → "Configuración"**
2. Busca **"WhatsApp Business Account ID"**
3. Cópialo

## 📞 Paso 4: Verificar Número de Teléfono

### Opción A: Usar número de prueba (recomendado para empezar)

Meta te da un número de prueba automáticamente. Puedes usarlo para enviar mensajes a números verificados.

1. En **"WhatsApp" → "Introducción"**
2. Verás **"Número de teléfono de prueba"**
3. Para agregar destinatarios de prueba:
   - Click en **"Administrar números de teléfono"**
   - Agrega +54 9 11 5102-7942
   - Enviarán código de verificación por WhatsApp

### Opción B: Usar tu propio número (producción)

1. En **"WhatsApp" → "Introducción"**
2. Click en **"Agregar número de teléfono"**
3. Ingresa el número en formato internacional: +5491151027942
4. Selecciona método de verificación (SMS o llamada)
5. Ingresa el código que recibes

## ⚙️ Paso 5: Configurar Variables de Entorno

Edita tu archivo `.env` en el backend:

```env
# WhatsApp Business API (Meta)
WHATSAPP_PROVIDER=meta
WHATSAPP_ACCESS_TOKEN=tu_token_permanente_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id_aqui
WHATSAPP_API_VERSION=v21.0
WHATSAPP_FROM_NUMBER=5491151027942

# Número destino para tips diarios
COACH_WHATSAPP_NUMBER=5491151027942
```

## 🧪 Paso 6: Probar la Conexión

1. Reinicia el servidor backend
2. Ve al dashboard: `/daily-tips`
3. Click en **"Generar Tip de Hoy"**
4. Verifica que el mensaje llegue a WhatsApp

## 📊 Paso 7: Webhook (Opcional pero Recomendado)

Para recibir notificaciones de estado de mensajes:

1. En **"WhatsApp" → "Configuración"**
2. Agrega URL de webhook: `https://tu-dominio.com/api/webhooks/whatsapp`
3. Token de verificación: crea uno aleatorio y guárdalo en `.env`:
   ```env
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_token_secreto_aqui
   ```
4. Suscríbete a eventos:
   - `messages` (mensajes recibidos)
   - `message_status` (estado de envío)

## 🚀 Paso 8: Pasar a Producción

Para enviar mensajes ilimitados:

1. **Verificación de Negocio**:
   - Ve a **Business Settings → Seguridad**
   - Completa verificación de negocio (tarda 1-3 días)

2. **Aprobar Plantillas de Mensaje**:
   - Los mensajes fuera de las 24 horas de conversación requieren plantillas aprobadas
   - Ve a **WhatsApp → Plantillas de mensajes**
   - Crea plantilla para el tip diario
   - Espera aprobación (24-48 horas)

3. **Aumentar Límites**:
   - Inicialmente: 1,000 conversaciones/día
   - Incrementa automáticamente con uso y calidad

## 🔍 Verificación de Estado

Puedes verificar el estado en el dashboard:
- Health Check mostrará: WhatsApp: ✅ Conectado (Meta)

## 📚 Recursos Adicionales

- **Documentación oficial**: https://developers.facebook.com/docs/whatsapp
- **Consola de API**: https://developers.facebook.com/apps
- **Business Manager**: https://business.facebook.com
- **Plantillas**: https://business.facebook.com/wa/manage/message-templates/

## ⚠️ Notas Importantes

1. **Límite de 24 horas**: Solo puedes enviar mensajes de texto libre dentro de las 24 horas después de que el usuario te escriba
2. **Plantillas**: Para envíos automáticos (como tips diarios), debes usar plantillas aprobadas
3. **Costos**: Meta cobra por conversación (aproximadamente $0.005-0.01 USD por mensaje)
4. **Número de prueba**: Límite de 5 destinatarios, solo para testing

## 🆘 Troubleshooting

### Error: "Invalid access token"
- Verifica que el token en `.env` sea correcto
- Regenera el token si expiró

### Error: "Phone number not found"
- Verifica el PHONE_NUMBER_ID
- Asegúrate de que el número esté verificado

### No llegan mensajes
- Verifica que el número destino esté en formato correcto (sin + ni espacios)
- Si usas número de prueba, agrega el destino como verificado
- Revisa los logs del backend para errores

### Error: "Template not found"
- Para envíos fuera de 24h, necesitas plantilla aprobada
- Mientras tanto, usa modo de prueba con números verificados
