const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Modelo para registrar tips diarios generados y enviados
 * Evita repetición de tips durante el año
 */
const DailyTipLog = sequelize.define(
  'DailyTipLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
      comment: 'Fecha del tip enviado',
    },
    baseTipId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID del tip original usado como base',
      references: {
        model: 'coach_tips',
        key: 'id',
      },
    },
    generatedContent: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Contenido generado por IA',
    },
    generatedTitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Título generado automáticamente',
    },
    whatsappFormat: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Contenido formateado para WhatsApp',
    },
    telegramFormat: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Contenido formateado para Telegram',
    },
    sentToWhatsApp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si se envió por WhatsApp',
    },
    sentToTelegram: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si se envió por Telegram',
    },
    whatsappSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de envío a WhatsApp',
    },
    telegramSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de envío a Telegram',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría del tip',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Metadata adicional',
    },
  },
  {
    tableName: 'daily_tip_logs',
    timestamps: true,
    indexes: [
      {
        fields: ['date'],
        unique: true,
      },
      {
        fields: ['baseTipId'],
      },
      {
        fields: ['sentToWhatsApp'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

// Métodos estáticos
DailyTipLog.getUsedTipIds = async function (days = 365) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await this.findAll({
    where: {
      date: {
        [sequelize.Sequelize.Op.gte]: startDate,
      },
      baseTipId: {
        [sequelize.Sequelize.Op.ne]: null,
      },
    },
    attributes: ['baseTipId'],
  });

  return logs.map((log) => log.baseTipId).filter((id) => id !== null);
};

DailyTipLog.hasLogForToday = async function () {
  const today = new Date().toISOString().split('T')[0];
  const log = await this.findOne({
    where: { date: today },
  });
  return log !== null;
};

DailyTipLog.getTodayLog = async function () {
  const today = new Date().toISOString().split('T')[0];
  return await this.findOne({
    where: { date: today },
  });
};

DailyTipLog.getStats = async function () {
  const totalSent = await this.count();
  const sentToWhatsApp = await this.count({
    where: { sentToWhatsApp: true },
  });

  const byCategory = await this.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['category'],
    raw: true,
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const lastMonth = await this.count({
    where: {
      createdAt: {
        [sequelize.Sequelize.Op.gte]: thirtyDaysAgo,
      },
    },
  });

  return {
    total: totalSent,
    sentToWhatsApp,
    byCategory: byCategory.reduce((acc, item) => {
      acc[item.category] = parseInt(item.count, 10);
      return acc;
    }, {}),
    lastMonth,
  };
};

DailyTipLog.getRecentHistory = async function (limit = 30) {
  return await this.findAll({
    order: [['date', 'DESC']],
    limit,
  });
};

module.exports = DailyTipLog;
