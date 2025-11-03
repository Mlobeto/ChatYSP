const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

/**
 * Modelo para almacenar conversaciones con Fede (IA)
 */
const FedeConversation = sequelize.define(
  'FedeConversation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Usuario que conversa con Fede
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // Mensaje del usuario
    userMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Mensaje enviado por el usuario',
    },

    // Respuesta de Fede (IA)
    fedeResponse: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Respuesta generada por Fede (IA)',
    },

    // Contexto usado para generar la respuesta
    contextUsed: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Información del knowledge base usada para la respuesta',
    },

    // Fuentes consultadas del knowledge base
    knowledgeSources: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Referencias del knowledge base utilizadas',
    },

    // Metadatos de la conversación
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Metadatos adicionales (tiempo de respuesta, modelo usado, etc.)',
    },

    // Calificación de la respuesta por parte del usuario
    userRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Calificación de 1-5 de la respuesta de Fede',
    },

    // Feedback del usuario sobre la respuesta
    userFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentario del usuario sobre la respuesta',
    },

    // Sesión de conversación (para agrupar conversaciones relacionadas)
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID de sesión para agrupar conversaciones relacionadas',
    },

    // Categoría detectada automáticamente
    detectedCategory: {
      type: DataTypes.ENUM(
        'ruptura_pareja',
        'metodologia_7_pasos',
        'autoestima',
        'comunicacion',
        'emociones',
        'crecimiento_personal',
        'relaciones',
        'coaching_ontologico',
        'mindfulness',
        'general',
        'fuera_de_scope',
      ),
      allowNull: true,
      comment: 'Categoría detectada automáticamente del mensaje',
    },

    // Sentimiento detectado en el mensaje del usuario
    userSentiment: {
      type: DataTypes.ENUM('positive', 'negative', 'neutral'),
      allowNull: true,
      comment: 'Sentimiento detectado en el mensaje del usuario',
    },

    // Puntuación de confianza de la respuesta
    confidenceScore: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      comment: 'Puntuación de confianza de la respuesta (0.00 - 1.00)',
    },

    // Si la respuesta fue exitosa
    wasSuccessful: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Si la respuesta se generó exitosamente',
    },

    // Tiempo de procesamiento en milisegundos
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo de procesamiento en milisegundos',
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'fede_conversations',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['sessionId'],
      },
      {
        fields: ['detectedCategory'],
      },
      {
        fields: ['userSentiment'],
      },
      {
        fields: ['wasSuccessful'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['userRating'],
      },
    ],
    comment: 'Almacena todas las conversaciones entre usuarios y Fede (IA)',
  }
);

// Asociaciones
FedeConversation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Métodos estáticos útiles
FedeConversation.getConversationHistory = async function (userId, sessionId = null, limit = 10) {
  const whereClause = { userId };

  if (sessionId) {
    whereClause.sessionId = sessionId;
  }

  return await this.findAll({
    where: whereClause,
    order: [['createdAt', 'ASC']],
    limit,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'country'],
      },
    ],
  });
};

FedeConversation.getSessionStats = async function (sessionId) {
  const conversations = await this.findAll({
    where: { sessionId },
    attributes: ['userRating', 'detectedCategory', 'userSentiment', 'processingTime'],
  });

  const totalMessages = conversations.length;
  const avgRating =
    conversations.filter((c) => c.userRating).reduce((sum, c) => sum + c.userRating, 0) /
      conversations.filter((c) => c.userRating).length || 0;

  const avgProcessingTime =
    conversations.filter((c) => c.processingTime).reduce((sum, c) => sum + c.processingTime, 0) /
      conversations.filter((c) => c.processingTime).length || 0;

  return {
    totalMessages,
    avgRating: parseFloat(avgRating.toFixed(2)),
    avgProcessingTime: Math.round(avgProcessingTime),
    categories: conversations.reduce((acc, c) => {
      if (c.detectedCategory) {
        acc[c.detectedCategory] = (acc[c.detectedCategory] || 0) + 1;
      }
      return acc;
    }, {}),
    sentiments: conversations.reduce((acc, c) => {
      if (c.userSentiment) {
        acc[c.userSentiment] = (acc[c.userSentiment] || 0) + 1;
      }
      return acc;
    }, {}),
  };
};

// Método de instancia para formatear para el historial
FedeConversation.prototype.toHistoryFormat = function () {
  return [
    {
      role: 'user',
      content: this.userMessage,
      timestamp: this.createdAt,
    },
    {
      role: 'assistant',
      content: this.fedeResponse,
      timestamp: this.createdAt,
    },
  ];
};

module.exports = FedeConversation;
