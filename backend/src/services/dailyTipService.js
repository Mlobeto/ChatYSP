const DailyTipAIService = require('./dailyTipAIService');
const EmailNotificationService = require('./emailNotificationService');
const DailyTipLog = require('../models/DailyTipLog');

class DailyTipService {
  constructor() {
    this.aiService = new DailyTipAIService();
    this.emailService = new EmailNotificationService();
  }

  async generateAndSendDailyTip() {
    try {
      console.log('🚀 Iniciando tip diario...');

      const hasLogToday = await DailyTipLog.hasLogForToday();
      if (hasLogToday) {
        const todayLog = await DailyTipLog.getTodayLog();
        return { success: true, alreadyExists: true, log: todayLog };
      }

      const usedTipIds = await DailyTipLog.getUsedTipIds(365);
      const generated = await this.aiService.generateDailyTip(usedTipIds);
      
      if (!generated.success) {
        throw new Error(`Error generando: ${generated.error}`);
      }

      // Generar título y extraer frase clave
      const title = await this.aiService.generateTitle(generated.content);
      const keyPhrase = await this.aiService.extractKeyPhrase(generated.content);
      
      // Generar footer aleatorio con la frase
      const footer = this.aiService.generateRandomFooter(keyPhrase);
      console.log(`📝 Footer tipo: ${footer.type}`);
      console.log(`💭 Frase clave: "${keyPhrase}"`);
      
      // Formatear con el footer personalizado
      const whatsappFormat = this.aiService.formatForWhatsApp(generated.content, footer);
      const telegramFormat = this.aiService.formatForTelegram(generated.content, footer);

      const today = new Date().toISOString().split('T')[0];
      const tipLog = await DailyTipLog.create({
        date: today,
        baseTipId: generated.baseTipId,
        generatedContent: generated.content,
        generatedTitle: title,
        whatsappFormat,
        telegramFormat,
        category: generated.category,
        metadata: { 
          baseTipTitle: generated.baseTipTitle,
          keyPhrase,
          footerType: footer.type,
        },
      });

      // Enviar notificación por email al coach
      const emailResult = await this.emailService.sendDailyTipNotification({
        title,
        whatsappFormat,
        telegramFormat,
        date: today,
      });
      
      if (emailResult.success) {
        tipLog.sentToWhatsApp = true; // Reutilizamos este campo para email
        tipLog.whatsappSentAt = new Date();
      }

      await tipLog.save();

      console.log('✅ Tip generado y notificación enviada al coach');

      return {
        success: true,
        tipLog,
        emailSent: emailResult.success,
      };
    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
  }

  async regenerateTodayTip() {
    const today = new Date().toISOString().split('T')[0];
    await DailyTipLog.destroy({ where: { date: today } });
    return await this.generateAndSendDailyTip();
  }

  async resendTodayTip() {
    const todayLog = await DailyTipLog.getTodayLog();
    if (!todayLog) throw new Error('No hay tip para hoy');

    // Reenviar email al coach
    const result = await this.emailService.sendDailyTipNotification({
      title: todayLog.generatedTitle,
      whatsappFormat: todayLog.whatsappFormat,
      telegramFormat: todayLog.telegramFormat,
      date: todayLog.date,
    });
    
    if (result.success) {
      todayLog.sentToWhatsApp = true; // Reutilizamos para email
      todayLog.whatsappSentAt = new Date();
      await todayLog.save();
    }

    return { success: result.success, tipLog: todayLog };
  }

  async getTodayTip() {
    return await DailyTipLog.getTodayLog();
  }

  async getStats() {
    return await DailyTipLog.getStats();
  }

  async getHistory(limit = 30) {
    return await DailyTipLog.getRecentHistory(limit);
  }

  isWorkday() {
    const dayOfWeek = new Date().getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  async healthCheck() {
    const emailHealth = await this.emailService.healthCheck();
    const schedulerStatus = require('./dailyTipScheduler').getStatus();
    
    return {
      healthy: emailHealth.configured && schedulerStatus.isRunning,
      dailyTipService: 'ready',
      email: emailHealth,
      aiService: 'ready',
      database: 'ready',
      scheduler: schedulerStatus,
      isWorkday: this.isWorkday(),
    };
  }
}

module.exports = DailyTipService;
