'use strict';

/**
 * Migración para agregar columna de embeddings vectoriales a knowledge_base
 * Usa pgvector para búsqueda semántica eficiente
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Habilitar extensión pgvector si no está habilitada
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');

    // Agregar columna embedding (vector de 1536 dimensiones para text-embedding-3-small de OpenAI)
    await queryInterface.addColumn('knowledge_base', 'embedding', {
      type: 'vector(1536)',
      allowNull: true,
      comment: 'Vector embedding del contenido para búsqueda semántica'
    });

    // Crear índice para búsqueda rápida usando HNSW (Hierarchical Navigable Small World)
    // Este índice permite búsquedas muy rápidas de vecinos más cercanos
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
      ON knowledge_base 
      USING hnsw (embedding vector_cosine_ops);
    `);

    console.log('✅ Migración completada: columna embedding agregada con índice HNSW');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS knowledge_base_embedding_idx;');
    
    // Eliminar columna
    await queryInterface.removeColumn('knowledge_base', 'embedding');
    
    console.log('✅ Rollback completado: columna embedding eliminada');
  }
};
