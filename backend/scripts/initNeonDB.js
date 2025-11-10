// Script para inicializar la base de datos de Neon con todas las tablas
// Uso: DATABASE_URL="postgresql://..." node scripts/initNeonDB.js

// Configurar variables de entorno para Neon ANTES de importar db.js
process.env.DB_NAME = 'neondb';
process.env.DB_USER = 'neondb_owner';
process.env.DB_PASSWORD = 'npg_2FCs9RNZYTau';
process.env.DB_HOST = 'ep-fancy-union-ad5vgh7r-pooler.c-2.us-east-1.aws.neon.tech';
process.env.DB_PORT = '5432';
process.env.DB_SSL = 'true';

console.log('🚀 Inicializando base de datos Neon...\n');
console.log('📊 Configuración:');
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   SSL: ${process.env.DB_SSL}\n`);

// Ahora importar db.js con la configuración de Neon
const { sequelize } = require('../src/config/db');

async function initDatabase() {
  try {
    // 1. Verificar conexión
    console.log('📡 Conectando a Neon...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Habilitar extensión pgvector si no está habilitada
    console.log('🔧 Habilitando extensión pgvector...');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector habilitado\n');

    // 3. Importar todos los modelos (esto los registra con sequelize)
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
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'knowledge_base' AND column_name = 'embedding';
    `);

    if (results.length > 0) {
      console.log('✅ Columna embedding existe:', results[0]);
    } else {
      console.log('⚠️  Columna embedding NO encontrada. Ejecutando migración...');
      
      // Ejecutar el SQL de la migración manualmente
      await sequelize.query(`
        ALTER TABLE "knowledge_base" 
        ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS "knowledge_base_embedding_idx" 
        ON "knowledge_base" USING hnsw ("embedding" vector_cosine_ops);
      `);
      
      console.log('✅ Columna embedding agregada');
    }

    // 6. Listar todas las tablas creadas
    console.log('\n📊 Tablas creadas:');
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });

    console.log('\n🎉 ¡Base de datos inicializada correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Popula youtube_videos.json con tus 500+ videos');
    console.log('   2. Ejecuta: node scripts/importYouTubeVideos.js');
    console.log('   3. ¡Listo para usar búsqueda semántica!\n');

  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
