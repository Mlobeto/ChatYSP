const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.phoneNumber = process.env.COACH_WHATSAPP_NUMBER || '5491151027942';
    this.provider = process.env.WHATSAPP_PROVIDER || 'simulated'; // 'meta', 'twilio', 'simulated'
    
    // Configuración para Meta (WhatsApp Business API)
    this.metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.metaPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.metaApiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.metaBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    // Configuración para Twilio (alternativa)
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM;
    
    // Verificar configuración según provider
    this.isConfigured = this._checkConfiguration();
    
    if (!this.isConfigured) {
      console.warn(`⚠️ WhatsApp (${this.provider}) no configurado. Modo simulado activado.`);
    } else {
      console.log(`✅ WhatsApp Service inicializado con provider: ${this.provider}`);
    }
  }

  _checkConfiguration() {
    switch (this.provider) {
    case 'meta':
      return Boolean(this.metaAccessToken && this.metaPhoneNumberId);
    case 'twilio':
      return Boolean(this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppFrom);
    case 'simulated':
    default:
      return false;
    }
  }

  async sendMessage(message, phoneNumber = null) {
    const targetNumber = phoneNumber || this.phoneNumber;
    
    console.log('📱 Enviando mensaje WhatsApp...');
    console.log(`   Provider: ${this.provider}`);
    console.log(`   Destino: ${targetNumber}`);
    console.log(`   Mensaje: ${message.substring(0, 100)}...`);

    if (!this.isConfigured || this.provider === 'simulated') {
      console.log('⚠️ Modo simulado - mensaje no enviado realmente');
      return {
        success: true,
        simulated: true,
        provider: 'simulated',
        phoneNumber: targetNumber,
        sentAt: new Date(),
      };
    }

    try {
      let result;
      
      switch (this.provider) {
      case 'meta':
        result = await this._sendViaMeta(message, targetNumber);
        break;
      case 'twilio':
        result = await this._sendViaTwilio(message, targetNumber);
        break;
      default:
        throw new Error(`Provider no soportado: ${this.provider}`);
      }

      console.log('✅ Mensaje enviado exitosamente');
      return result;
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error.message);
      return {
        success: false,
        error: error.message,
        provider: this.provider,
      };
    }
  }

  /**
   * Enviar mensaje via WhatsApp Business API (Meta)
   */
  async _sendViaMeta(message, phoneNumber) {
    const url = `https://graph.facebook.com/${this.metaApiVersion}/${this.metaPhoneNumberId}/messages`;
    
    // Formatear número: eliminar + y espacios, debe empezar con código de país
    const formattedNumber = phoneNumber.replace(/[+\s-]/g, '');
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedNumber,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${this.metaAccessToken}`,
        'Content-Type': 'application/json',
      }
    });

    return {
      success: true,
      provider: 'meta',
      messageId: response.data.messages[0]?.id,
      phoneNumber: formattedNumber,
      sentAt: new Date(),
      wabaId: response.data.contacts[0]?.wa_id,
    };
  }

  /**
   * Enviar mensaje via Twilio
   */
  async _sendViaTwilio(message, phoneNumber) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
    
    const formattedNumber = phoneNumber.startsWith('whatsapp:') 
      ? phoneNumber 
      : `whatsapp:+${phoneNumber.replace(/[+\s-]/g, '')}`;

    const params = new URLSearchParams();
    params.append('From', this.twilioWhatsAppFrom);
    params.append('To', formattedNumber);
    params.append('Body', message);

    const response = await axios.post(url, params, {
      auth: {
        username: this.twilioAccountSid,
        password: this.twilioAuthToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    return {
      success: true,
      provider: 'twilio',
      messageId: response.data.sid,
      phoneNumber: formattedNumber,
      sentAt: new Date(),
      status: response.data.status,
    };
  }

  async healthCheck() {
    return {
      configured: this.isConfigured,
      provider: this.provider,
      phoneNumber: this.phoneNumber,
      connected: this.isConfigured,
      details: {
        meta: this.provider === 'meta' ? {
          phoneNumberId: this.metaPhoneNumberId ? '✓' : '✗',
          accessToken: this.metaAccessToken ? '✓' : '✗',
          businessAccountId: this.metaBusinessAccountId ? '✓' : '✗',
        } : null,
        twilio: this.provider === 'twilio' ? {
          accountSid: this.twilioAccountSid ? '✓' : '✗',
          authToken: this.twilioAuthToken ? '✓' : '✗',
          whatsappFrom: this.twilioWhatsAppFrom ? '✓' : '✗',
        } : null,
      },
      status: this.isConfigured ? 'ready' : 'not_configured',
    };
  }
}

module.exports = WhatsAppService;
