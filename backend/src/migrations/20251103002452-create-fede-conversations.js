'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fede_conversations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userMessage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fedeResponse: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      knowledgeSources: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      contextUsed: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      detectedCategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userRating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      userFeedback: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      wasSuccessful: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      processingTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Agregar índices para mejorar performance
    await queryInterface.addIndex('fede_conversations', ['userId']);
    await queryInterface.addIndex('fede_conversations', ['sessionId']);
    await queryInterface.addIndex('fede_conversations', ['userId', 'sessionId']);
    await queryInterface.addIndex('fede_conversations', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fede_conversations');
  },
};
