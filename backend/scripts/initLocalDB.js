// Script para inicializar la base de datos LOCAL (Docker) con todas las tablas
// Uso: node scripts/initLocalDB.js

// Configurar variables de entorno para LOCAL (Docker en puerto 5433)
process.env.DB_NAME = 'chatysp';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = '7754';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433'; // Puerto del contenedor Docker
process.env.DB_SSL = 'false'; // Sin SSL para local

console.log('🚀 Inicializando base de datos LOCAL (Docker)...\n');
console.log('📊 Configuración:');
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   SSL: ${process.env.DB_SSL}\n`);

// Importar db.js con la configuración local
const { sequelize } = require('../src/config/db');

async function initDatabase() {
  try {
    // 1. Verificar conexión
    console.log('📡 Conectando a PostgreSQL local...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar que pgvector está habilitado
    console.log('🔍 Verificando extensión pgvector...');
    const [extensions] = await sequelize.query(
      "SELECT * FROM pg_extension WHERE extname = 'vector';"
    );
    
    if (extensions.length === 0) {
      console.log('⚠️  pgvector no encontrado. Habilitando...');
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('✅ pgvector habilitado');
    } else {
      console.log('✅ pgvector ya está habilitado');
    }
    console.log('');

    // 3. Importar todos los modelos
    console.log('📦 Cargando modelos...');
    require('../src/models');
    console.log('✅ Modelos cargados\n');

    // 4. Sincronizar modelos con la base de datos
    console.log('🔄 Sincronizando tablas con la base de datos...');
    console.log('   (Esto creará todas las tablas necesarias)\n');
    
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Sincronización completada\n');

    // 5. Verificar que la tabla knowledge_base tiene la columna embedding
    console.log('🔍 Verificando columna embedding en knowledge_base...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'knowledge_base' AND column_name = 'embedding';
    `);

    if (columns.length > 0) {
      console.log('✅ Columna embedding existe');
      
      // Si es tipo text, cambiar a vector
      if (columns[0].data_type === 'text') {
        console.log('⚠️  Columna embedding es tipo text, cambiando a vector(1536)...');
        await sequelize.query('ALTER TABLE knowledge_base DROP COLUMN embedding;');
        await sequelize.query('ALTER TABLE knowledge_base ADD COLUMN embedding vector(1536);');
        console.log('✅ Columna actualizada a vector(1536)');
      }
    } else {
      console.log('⚠️  Columna embedding NO encontrada. Agregando...');
      await sequelize.query('ALTER TABLE knowledge_base ADD COLUMN embedding vector(1536);');
      console.log('✅ Columna embedding agregada');
    }

    // 6. Verificar/crear índice HNSW
    console.log('\n🔍 Verificando índice HNSW...');
    const [indexes] = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'knowledge_base' AND indexname = 'knowledge_base_embedding_idx';
    `);

    if (indexes.length === 0) {
      console.log('⚠️  Índice no encontrado. Creando...');
      await sequelize.query(`
        CREATE INDEX knowledge_base_embedding_idx 
        ON knowledge_base 
        USING hnsw (embedding vector_cosine_ops);
      `);
      console.log('✅ Índice HNSW creado');
    } else {
      console.log('✅ Índice HNSW ya existe');
    }

    // 7. Listar todas las tablas creadas
    console.log('\n📊 Tablas en la base de datos:');
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });

    // 8. Verificar detalles de la tabla knowledge_base
    console.log('\n📋 Estructura de knowledge_base:');
    const [structure] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'knowledge_base' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n   Columnas importantes:');
    structure.forEach(col => {
      if (['id', 'title', 'content', 'contentType', 'category', 'embedding'].includes(col.column_name)) {
        console.log(`   - ${col.column_name.padEnd(15)} : ${col.data_type}`);
      }
    });

    console.log('\n🎉 ¡Base de datos local inicializada correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Conecta pgAdmin a localhost:5432');
    console.log('   2. Popula youtube_videos.json con tus videos');
    console.log('   3. Ejecuta: node scripts/importYouTubeVideos.js');
    console.log('   4. ¡Prueba la búsqueda semántica!\n');

  } catch (error) {
    console.error('\n❌ Error inicializando la base de datos:', error.message);
    console.error('\nDetalles:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
initDatabase()
  .then(() => {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  });
