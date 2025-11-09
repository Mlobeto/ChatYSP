const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CoachTip = sequelize.define(
  'CoachTip',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'ruptura',
      comment: 'Categoría del tip de coaching: ruptura, sanacion, autoestima, etc.',
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    difficulty: {
      type: DataTypes.ENUM('basico', 'intermedio', 'avanzado'),
      defaultValue: 'intermedio',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del archivo TXT original o fuente del tip',
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Información adicional: libro relacionado, tema específico, etc.',
    },
  },
  {
    tableName: 'coach_tips',
    timestamps: true,
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['difficulty'],
      },
    ],
  }
);

module.exports = CoachTip;
