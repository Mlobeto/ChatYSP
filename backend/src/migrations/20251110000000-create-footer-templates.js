'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('footer_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM(
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
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      template: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      urls: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      probability: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Crear índices
    await queryInterface.addIndex('footer_templates', ['type']);
    await queryInterface.addIndex('footer_templates', ['isActive']);
    await queryInterface.addIndex('footer_templates', ['probability']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('footer_templates');
    
    // Eliminar el tipo enum
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_footer_templates_type";');
  },
};
