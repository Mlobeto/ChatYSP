'use strict';

/**
 * Migración para actualizar el enum de categorías
 * Agrega los 7 pasos de la estrategia de Federico
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // En PostgreSQL necesitamos recrear el enum con los nuevos valores
    await queryInterface.sequelize.query(`
      -- Crear el nuevo enum con todos los valores
      DO $$ 
      BEGIN
        -- Crear enum temporal con los nuevos valores
        CREATE TYPE enum_knowledge_base_category_new AS ENUM (
          'paso_1_contacto_cero',
          'paso_2_redes_sociales',
          'paso_3_look_vestuario',
          'paso_4_vida_social_alfa',
          'paso_5_responder_alfa',
          'paso_6_confundido',
          'paso_7_volver_alfa',
          'ruptura_pareja',
          'autoestima',
          'comunicacion',
          'emociones',
          'crecimiento_personal',
          'relaciones',
          'coaching_ontologico',
          'mindfulness',
          'general'
        );

        -- Actualizar la columna para usar el nuevo enum
        ALTER TABLE knowledge_base 
          ALTER COLUMN category TYPE enum_knowledge_base_category_new 
          USING category::text::enum_knowledge_base_category_new;

        -- Eliminar el enum viejo y renombrar el nuevo
        DROP TYPE IF EXISTS enum_knowledge_base_category;
        ALTER TYPE enum_knowledge_base_category_new RENAME TO enum_knowledge_base_category;
      END $$;
    `);

    console.log('✅ Enum de categorías actualizado con los 7 pasos');
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir al enum original
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        CREATE TYPE enum_knowledge_base_category_old AS ENUM (
          'ruptura_pareja',
          'metodologia_7_pasos',
          'autoestima',
          'comunicacion',
          'emociones',
          'crecimiento_personal',
          'relaciones',
          'coaching_ontologico',
          'mindfulness',
          'general'
        );

        ALTER TABLE knowledge_base 
          ALTER COLUMN category TYPE enum_knowledge_base_category_old 
          USING category::text::enum_knowledge_base_category_old;

        DROP TYPE IF EXISTS enum_knowledge_base_category;
        ALTER TYPE enum_knowledge_base_category_old RENAME TO enum_knowledge_base_category;
      END $$;
    `);
  }
};
