const nodemailer = require('nodemailer');

class EmailNotificationService {
  constructor() {
    this.coachEmail = process.env.COACH_EMAIL || process.env.EMAIL_USER;
    this.enabled = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log('✅ Servicio de email configurado correctamente');
    } else {
      console.warn('⚠️ Email no configurado. Notificaciones desactivadas.');
    }
  }

  /**
   * Envía el tip diario por email al coach
   */
  async sendDailyTipNotification(tipData) {
    if (!this.enabled) {
      console.log('⚠️ Email desactivado - notificación no enviada');
      return { success: false, reason: 'Email no configurado' };
    }

    try {
      const { title, whatsappFormat, telegramFormat, date } = tipData;
      
      const htmlContent = this._generateEmailHTML(title, whatsappFormat, telegramFormat, date);
      
      const mailOptions = {
        from: `"ChatYSP Coach Assistant" <${process.env.EMAIL_USER}>`,
        to: this.coachEmail,
        subject: `🦁 Tip del Día - ${new Date(date).toLocaleDateString('es-AR')}`,
        html: htmlContent,
        text: this._generateEmailText(title, whatsappFormat, telegramFormat),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email enviado al coach:', this.coachEmail);
      console.log('   Message ID:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        recipient: this.coachEmail,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Error enviando email:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Genera el HTML del email con el tip formateado
   */
  _generateEmailHTML(title, whatsappFormat, telegramFormat, date) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #f97316;
    }
    .header h1 {
      color: #f97316;
      margin: 0;
      font-size: 28px;
    }
    .date {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .tip-section {
      margin: 25px 0;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .tip-section h2 {
      color: #3b82f6;
      font-size: 18px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .tip-content {
      background-color: white;
      padding: 15px;
      border-radius: 6px;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.8;
      border: 1px solid #e5e7eb;
    }
    .copy-note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .copy-note strong {
      color: #92400e;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 13px;
    }
    .whatsapp {
      border-left-color: #25d366;
    }
    .whatsapp h2 {
      color: #25d366;
    }
    .telegram {
      border-left-color: #0088cc;
    }
    .telegram h2 {
      color: #0088cc;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦁 Tip del Día Generado</h1>
      <p class="date">${new Date(date).toLocaleDateString(
    'es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
    </div>

    <div class="copy-note">
      <strong>📋 Instrucciones:</strong><br>
      Copia el formato que necesites y pégalo directamente en WhatsApp o Telegram.
      El texto ya viene formateado y listo para enviar.
    </div>

    <div class="tip-section whatsapp">
      <h2>📱 Formato para WhatsApp</h2>
      <div class="tip-content">${whatsappFormat.replace(/\n/g, '<br>')}</div>
    </div>

    <div class="tip-section telegram">
      <h2>✈️ Formato para Telegram</h2>
      <div class="tip-content">${telegramFormat.replace(/\n/g, '<br>')}</div>
    </div>

    <div class="footer">
      <p>Este tip fue generado automáticamente por ChatYSP</p>
      <p>Puedes verlo también en el dashboard: <a href="http://localhost:3000/daily-tips">Ver Dashboard</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Genera la versión de texto plano del email
   */
  _generateEmailText(title, whatsappFormat, telegramFormat) {
    return `
🦁 TIP DEL DÍA GENERADO

${title}

═══════════════════════════════
📱 FORMATO PARA WHATSAPP:
═══════════════════════════════

${whatsappFormat}

═══════════════════════════════
✈️ FORMATO PARA TELEGRAM:
═══════════════════════════════

${telegramFormat}

═══════════════════════════════

📋 Copia el formato que necesites y pégalo en WhatsApp o Telegram.

---
ChatYSP - Asistente del Coach
    `;
  }

  /**
   * Verifica la configuración del servicio
   */
  async healthCheck() {
    if (!this.enabled) {
      return {
        configured: false,
        status: 'not_configured',
        recipient: null,
      };
    }

    try {
      await this.transporter.verify();
      return {
        configured: true,
        status: 'ready',
        recipient: this.coachEmail,
      };
    } catch (error) {
      return {
        configured: true,
        status: 'error',
        error: error.message,
        recipient: this.coachEmail,
      };
    }
  }
}

module.exports = EmailNotificationService;
