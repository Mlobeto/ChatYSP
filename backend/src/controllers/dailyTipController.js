const DailyTipService = require('../services/dailyTipService');

class DailyTipController {
  constructor() {
    this.dailyTipService = new DailyTipService();
  }

  generateDailyTip = async (req, res) => {
    try {
      const result = await this.dailyTipService.generateAndSendDailyTip();

      if (result.success) {
        return res.json({
          success: true,
          message: result.alreadyExists 
            ? 'Ya existe un tip para hoy' 
            : 'Tip generado y enviado exitosamente',
          data: {
            tipLog: result.tipLog,
            whatsappSent: result.whatsappSent,
            alreadyExists: result.alreadyExists,
          },
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error generando tip diario',
        error: result.error,
      });
    } catch (error) {
      console.error('Error en generateDailyTip:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };

  getTodayTip = async (req, res) => {
    try {
      console.log('📝 GET TODAY TIP - Request received:', {
        user: req.user?.email || 'NO USER',
        role: req.user?.role || 'NO ROLE',
        timestamp: new Date().toISOString(),
      });
      
      const tip = await this.dailyTipService.getTodayTip();

      if (!tip) {
        console.log('⚠️ No hay tip para hoy');
        return res.status(404).json({
          success: false,
          message: 'No hay tip generado para hoy',
        });
      }

      console.log('✅ Tip encontrado:', tip.generatedTitle);
      res.json({
        success: true,
        data: tip,
      });
    } catch (error) {
      console.error('❌ Error en getTodayTip:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };

  regenerateTodayTip = async (req, res) => {
    try {
      const result = await this.dailyTipService.regenerateTodayTip();

      if (result.success) {
        return res.json({
          success: true,
          message: 'Tip regenerado exitosamente',
          data: {
            tipLog: result.tipLog,
            whatsappSent: result.whatsappSent,
          },
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error regenerando tip',
        error: result.error,
      });
    } catch (error) {
      console.error('Error en regenerateTodayTip:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };

  resendTodayTip = async (req, res) => {
    try {
      const result = await this.dailyTipService.resendTodayTip();

      if (result.success) {
        return res.json({
          success: true,
          message: 'Tip reenviado exitosamente',
          data: result.tipLog,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error reenviando tip',
        error: result.error,
      });
    } catch (error) {
      console.error('Error en resendTodayTip:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };

  getHistory = async (req, res) => {
    try {
      const { limit = 30 } = req.query;
      const history = await this.dailyTipService.getHistory(parseInt(limit, 10));

      res.json({
        success: true,
        data: history,
        total: history.length,
      });
    } catch (error) {
      console.error('Error en getHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };

  getStats = async (req, res) => {
    try {
      const stats = await this.dailyTipService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };

  healthCheck = async (req, res) => {
    try {
      const health = await this.dailyTipService.healthCheck();

      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      console.error('Error en healthCheck:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  };
}

module.exports = new DailyTipController();
