require('dotenv').config();
const { sequelize } = require('../src/config/db');

async function populateTitles() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    // Obtener tips sin título
    const tips = await sequelize.query('SELECT id, content FROM tips WHERE title IS NULL', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`📝 Encontrados ${tips.length} tips sin título`);
    
    for (const tip of tips) {
      // Generar título basado en el contenido
      let title = tip.content.substring(0, 80).trim();
      if (!title.endsWith('.') && !title.endsWith('!') && !title.endsWith('?')) {
        title += '...';
      }
      
      // Actualizar el tip con el título
      await sequelize.query('UPDATE tips SET title = :title WHERE id = :id', {
        replacements: { title, id: tip.id },
        type: sequelize.QueryTypes.UPDATE
      });
      
      console.log(`✅ Título generado: ${title.substring(0, 50)}...`);
    }
    
    // Verificar que todos tengan título
    const remainingNullTitles = await sequelize.query('SELECT COUNT(*) as count FROM tips WHERE title IS NULL', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log(`📊 Tips sin título restantes: ${remainingNullTitles[0].count}`);
    
    // Mostrar algunos ejemplos
    const examples = await sequelize.query('SELECT id, title, content FROM tips LIMIT 3', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('\n📋 Ejemplos actualizados:');
    examples.forEach((tip, index) => {
      console.log(`  ${index + 1}. ${tip.title}`);
      console.log(`     Content: ${tip.content.substring(0, 50)}...`);
    });
    
    console.log('\n🎉 Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

populateTitles();