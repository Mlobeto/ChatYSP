const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({
    to, subject, html, text,
  }) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email enviado exitosamente:', {
        messageId: info.messageId,
        to,
        subject,
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  async sendWelcomeEmail({
    to, username, tempPassword, resetLink,
  }) {
    const subject = '¡Bienvenido/a a la Comunidad YSP! 🎉';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; 
                  padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">¡Bienvenido/a a ChatYSP!</h1>
            <p style="color: #6B7280; margin: 10px 0 0 0; font-size: 16px;">
              Tu cuenta ha sido creada exitosamente
            </p>
          </div>

          <!-- Welcome Content -->
          <div style="margin-bottom: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hola <strong>${username}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Tu cuenta en Comunidad YSP ha sido creada por un administrador. Para tu seguridad, 
              es importante que cambies tu contraseña temporal por una de tu elección.
            </p>
          </div>

          <!-- Credentials Box -->
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; 
                      border-left: 4px solid #3B82F6;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">
              📋 Tus credenciales temporales:
            </h3>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Usuario:</strong> ${username}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Email:</strong> ${to}
            </p>
            <p style="margin: 8px 0; color: #374151;">
              <strong>Contraseña temporal:</strong> 
              <code style="background-color: #E5E7EB; padding: 4px 8px; border-radius: 4px; 
                           font-family: monospace;">${tempPassword}</code>
            </p>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #3B82F6; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      font-size: 16px; display: inline-block; 
                      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
              🔒 Cambiar Contraseña
            </a>
          </div>

          <!-- Instructions -->
          <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; 
                      border-left: 4px solid #F59E0B;">
            <h4 style="color: #92400E; margin: 0 0 10px 0; font-size: 16px;">⚠️ Importante:</h4>
            <ul style="color: #92400E; margin: 0; padding-left: 20px;">
              <li>Esta contraseña es temporal y debe ser cambiada en tu primer inicio de sesión</li>
              <li>El enlace de cambio de contraseña expira en 24 horas</li>
              <li>Si tienes problemas, contacta al administrador</li>
            </ul>
          </div>

          <!-- Features -->
          <div style="margin: 30px 0;">
            <h3 style="color: #374151; margin-bottom: 15px;">✨ ¿Qué puedes hacer en ChatYSP?</h3>
            <ul style="color: #6B7280; line-height: 1.8; padding-left: 20px;">
              <li>Participar en salas de chat temáticas</li>
              <li>Unirte a juegos interactivos de bienestar</li>
              <li>Acceder a contenido de desarrollo personal</li>
              <li>Conectar con una comunidad de crecimiento</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; 
                      margin-top: 30px; text-align: center;">
            <p style="color: #9CA3AF; font-size: 14px; margin: 0;">
              la Comunidad YSP - Plataforma de Bienestar y Crecimiento Personal
            </p>
            <p style="color: #9CA3AF; font-size: 12px; margin: 10px 0 0 0;">
              Si no solicitaste esta cuenta, puedes ignorar este email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
    ¡Bienvenido/a a la Comunidad YSP!

    Hola ${username},

    Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales temporales:

    Usuario: ${username}
    Email: ${to}
    Contraseña temporal: ${tempPassword}

    Por favor, cambia tu contraseña accediendo a: ${resetLink}

    ¡Gracias por unirte a nuestra comunidad!

    la Comunidad YSP
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  async sendPasswordResetEmail({
    to, username, resetLink, expirationTime,
  }) {
    const subject = '🔒 Restablecer contraseña - ChatYSP';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; 
                  padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Restablecer Contraseña</h1>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hola <strong>${username}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en ChatYSP.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #3B82F6; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      font-size: 16px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>

          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; 
                      margin: 20px 0;">
            <p style="color: #92400E; margin: 0; font-size: 14px;">
              ⏰ Este enlace expirará en ${expirationTime} horas.
            </p>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            Si no solicitaste este cambio, puedes ignorar este email de forma segura.
          </p>
        </div>
      </div>
    `;

    const text = `
    Restablecer Contraseña - ChatYSP

    Hola ${username},

    Recibimos una solicitud para restablecer tu contraseña.
    
    Usa este enlace para crear una nueva contraseña: ${resetLink}
    
    Este enlace expirará en ${expirationTime} horas.
    
    Si no solicitaste este cambio, ignora este email.

    Comunidad YSP
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  // Método para probar la configuración
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en conexión SMTP:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
