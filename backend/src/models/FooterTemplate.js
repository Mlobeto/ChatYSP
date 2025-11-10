const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Modelo para gestionar templates de footers de tips diarios
 * Permite editar desde el dashboard: templates, URLs, probabilidades, etc.
 */
const FooterTemplate = sequelize.define(
  'FooterTemplate',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    // Tipo de footer
    type: {
      type: DataTypes.ENUM(
        'video_relacionado',
        'app_descarga',
        'playlists_youtube',
        'membresia_youtube',
        'llamada_coaching',
        'reflexion',
        'libro',
        'comunidad'
      ),
      allowNull: false,
      comment: 'Tipo de footer para categorización',
    },
    
    // Nombre descriptivo
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre descriptivo del footer (ej: "Video relacionado", "App descarga")',
    },
    
    // Template del texto
    template: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Template del PD con placeholders: {frase}, {video_url}, {video_title}, etc.',
    },
    
    // URLs asociadas (JSON)
    urls: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'URLs reales: { app_ios: "...", app_android: "...", playlists: [...], etc. }',
    },
    
    // Probabilidad de selección (0-100)
    probability: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 0,
        max: 100,
      },
      comment: 'Probabilidad de ser seleccionado (0-100). Total debe sumar 100%',
    },
    
    // Estado activo/inactivo
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Si está activo para ser usado en footers',
    },
    
    // Orden de prioridad
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Orden de prioridad (mayor = más importante)',
    },
    
    // Notas adicionales
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas para el administrador sobre cuándo usar este footer',
    },
    
    // Estadísticas de uso
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Contador de veces que se ha usado',
    },
    
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última vez que se usó este footer',
    },
  },
  {
    tableName: 'footer_templates',
    timestamps: true,
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['probability'],
      },
    ],
  }
);

module.exports = FooterTemplate;
