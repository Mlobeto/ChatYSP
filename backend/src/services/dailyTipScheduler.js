const cron = require('node-cron');
const DailyTipService = require('./dailyTipService');

class DailyTipScheduler {
  constructor() {
    this.dailyTipService = new DailyTipService();
    this.cronJob = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Daily Tip Scheduler ya está corriendo');
      return;
    }

    // Soporte para formato "HH:MM" o formato cron completo
    const sendTime = process.env.DAILY_TIP_SEND_TIME || '0 9 * * 1-5';
    
    let cronExpression;
    if (sendTime.includes(' ')) {
      // Ya es formato cron completo (ej: "0 9 * * 1-5")
      cronExpression = sendTime;
    } else {
      // Es formato HH:MM, convertir a cron
      const [hour, minute] = sendTime.split(':');
      cronExpression = `${minute || 0} ${hour} * * 1-5`;
    }

    console.log(`📅 Scheduler configurado: ${cronExpression}`);

    // Validar que el cron expression sea válido
    if (!cron.validate(cronExpression)) {
      console.error('❌ Cron expression inválido:', cronExpression);
      throw new Error(`Cron expression inválido: ${cronExpression}`);
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Ejecutando Daily Tip Scheduler...');
      console.log(`📅 Fecha: ${new Date().toLocaleString('es-AR')}`);

      try {
        if (!this.dailyTipService.isWorkday()) {
          console.log('⏭️ Hoy no es día hábil, omitiendo envío');
          return;
        }

        const result = await this.dailyTipService.generateAndSendDailyTip();

        if (result.success) {
          if (result.alreadyExists) {
            console.log('✅ Ya existía un tip para hoy');
          } else {
            console.log('✅ Tip generado y enviado exitosamente');
            console.log(`📱 WhatsApp: ${result.whatsappSent ? 'Enviado' : 'No enviado'}`);
          }
        } else {
          console.error('❌ Error generando tip:', result.error);
        }
      } catch (error) {
        console.error('❌ Error en Daily Tip Scheduler:', error);
      }
    }, {
      timezone: 'America/Argentina/Buenos_Aires',
    });

    this.cronJob.start();
    this.isRunning = true;

    console.log('✅ Daily Tip Scheduler iniciado exitosamente');
    console.log(`⏰ Próximo envío: ${this.getNextExecutionTime()}`);
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('🛑 Daily Tip Scheduler detenido');
    }
  }

  getNextExecutionTime() {
    const now = new Date();
    const sendTime = process.env.DAILY_TIP_SEND_TIME || '09:00';
    const [hour, minute] = sendTime.split(':');

    const next = new Date(now);
    next.setHours(parseInt(hour, 10));
    next.setMinutes(parseInt(minute, 10));
    next.setSeconds(0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const dayOfWeek = next.getDay();
    if (dayOfWeek === 0) {
      next.setDate(next.getDate() + 1);
    } else if (dayOfWeek === 6) {
      next.setDate(next.getDate() + 2);
    }

    return next.toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async runNow() {
    console.log('🚀 Ejecutando envío manual de Daily Tip...');
    try {
      const result = await this.dailyTipService.generateAndSendDailyTip();
      return result;
    } catch (error) {
      console.error('❌ Error en ejecución manual:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextExecution: this.isRunning ? this.getNextExecutionTime() : null,
      sendTime: process.env.DAILY_TIP_SEND_TIME || '09:00',
      timezone: 'America/Argentina/Buenos_Aires',
    };
  }
}

module.exports = new DailyTipScheduler();
