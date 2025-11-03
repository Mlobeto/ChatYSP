'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar el campo title
    await queryInterface.addColumn('tips', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Tip sin título',
    });

    // Agregar el campo video_url
    await queryInterface.addColumn('tips', 'video_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar el campo image_url
    await queryInterface.addColumn('tips', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Agregar el campo order_index
    await queryInterface.addColumn('tips', 'order_index', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    // Generar títulos para los tips existentes basados en el contenido
    const tips = await queryInterface.sequelize.query(
      'SELECT id, content FROM tips WHERE title = \'Tip sin título\'',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const tip of tips) {
      const title = tip.content.substring(0, 80).trim();
      const cleanTitle = title.endsWith('.') ? title : `${title}...`;
      
      await queryInterface.sequelize.query(
        'UPDATE tips SET title = :title WHERE id = :id',
        {
          replacements: { title: cleanTitle, id: tip.id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tips', 'title');
    await queryInterface.removeColumn('tips', 'video_url');
    await queryInterface.removeColumn('tips', 'image_url');
    await queryInterface.removeColumn('tips', 'order_index');
  },
};