'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coach_tips', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        defaultValue: 'ruptura',
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      difficulty: {
        type: Sequelize.ENUM('basico', 'intermedio', 'avanzado'),
        defaultValue: 'intermedio',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Índices
    await queryInterface.addIndex('coach_tips', ['category']);
    await queryInterface.addIndex('coach_tips', ['isActive']);
    await queryInterface.addIndex('coach_tips', ['difficulty']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('coach_tips');
  },
};
