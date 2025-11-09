const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Modelo para almacenar el contenido del knowledge base de Federico
 * Incluye videos, libros, tips, metodología, etc.
 */
const KnowledgeBase = sequelize.define(
  'KnowledgeBase',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Título del contenido (ej: nombre del video, capítulo del libro)',
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Contenido completo (transcripción, texto, etc.)',
    },

    // Tipo de contenido
    contentType: {
      type: DataTypes.ENUM('video', 'book', 'tip', 'methodology', 'article', 'course'),
      allowNull: false,
      defaultValue: 'article',
      comment: 'Tipo de contenido para categorización',
    },

    // Categoría temática
    category: {
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
      ),
      allowNull: false,
      defaultValue: 'general',
      comment: 'Categoría temática del contenido',
    },

    // Metadatos específicos
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Metadatos adicionales (URL del video, ISBN del libro, fecha, etc.)',
    },

    // Para búsqueda y RAG
    embedding: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Vector embedding para búsqueda semántica',
    },

    // Tags para búsqueda
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Tags para facilitar búsquedas y categorización',
    },

    // Prioridad para el sistema RAG
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Prioridad del contenido (1-10, mayor es más importante)',
    },

    // Estado del contenido
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Si el contenido está activo para el sistema de IA',
    },

    // Información de la fuente
    sourceUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: 'URL de origen (YouTube, etc.)',
    },

    sourceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID externo (ID de YouTube, etc.)',
    },

    // Duración para videos
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duración en segundos para contenido de video',
    },

    // Fecha de publicación original
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de publicación original del contenido',
    },

    // Estadísticas de uso
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de veces que se ha usado en respuestas de IA',
    },

    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última vez que se usó en una respuesta',
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
    tableName: 'knowledge_base',
    timestamps: true,
    indexes: [
      {
        fields: ['contentType'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['tags'],
        using: 'gin',
      },
      {
        fields: ['title'],
      },
      {
        name: 'knowledge_base_search_idx',
        fields: ['title', 'content'],
        type: 'FULLTEXT',
      },
    ],
    comment: 'Almacena todo el knowledge base de Federico para el sistema de IA',
  },
);

// Método para búsqueda de contenido relevante
KnowledgeBase.findRelevantContent = async function (query, category = null, limit = 5) {
  const whereClause = {
    isActive: true,
  };

  if (category) {
    whereClause.category = category;
  }

  // Búsqueda básica por texto (luego implementaremos embedding search)
  if (query) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${query}%` } },
      { content: { [Op.iLike]: `%${query}%` } },
      { tags: { [Op.contains]: [query] } },
    ];
  }

  return await this.findAll({
    where: whereClause,
    order: [
      ['priority', 'DESC'],
      ['usageCount', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit,
  });
};

// Método para actualizar estadísticas de uso
KnowledgeBase.prototype.markAsUsed = async function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

module.exports = KnowledgeBase;
