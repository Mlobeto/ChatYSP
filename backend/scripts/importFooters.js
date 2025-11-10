require('dotenv').config();
const { sequelize } = require('../src/config/db');
const FooterTemplate = require('../src/models/FooterTemplate');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script para importar footers desde footer_options.json a la base de datos
 * 
 * Uso: node scripts/importFooters.js
 */

// Probabilidades por tipo
const PROBABILITIES = {
  'video_relacionado': 25,
  'app_descarga': 20,
  'playlists_youtube': 20,
  'membresia_youtube': 20,
  'llamada_coaching': 13,
  'reflexion': 5,  // Aumentado a 5%
  'libro': 7,
  'comunidad': 5   // Aumentado a 5%
};

async function importFooters() {
  try {
    console.log('📥 Importando footers a la base de datos...\n');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Leer archivo JSON
    const jsonPath = path.join(__dirname, '../data/footer_options.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const footerData = JSON.parse(jsonContent);

    // Limpiar tabla existente (opcional)
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      await FooterTemplate.destroy({ where: {} });
      console.log('🗑️  Footers existentes eliminados\n');
    }

    let importedCount = 0;
    let skippedCount = 0;

    // Importar cada tipo de footer
    for (const footerType of footerData.postData) {
      const { type, templates, note } = footerType;
      
      // Obtener probabilidad para este tipo
      const probability = PROBABILITIES[type];

      // Dividir probabilidad entre templates del mismo tipo
      const probabilityPerTemplate = Math.max(1, Math.floor(probability / templates.length));

      console.log(`📋 Importando tipo: ${type} (${templates.length} templates, ${probability}% total, ${probabilityPerTemplate}% cada uno)`);

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        
        try {
          await FooterTemplate.create({
            type,
            name: `${type.replace(/_/g, ' ')} #${i + 1}`,
            template,
            urls: {},  // Se llenarán manualmente desde el dashboard
            probability: probabilityPerTemplate,
            isActive: true,
            priority: PROBABILITIES[type] || 0,
            notes: note || `Template ${i + 1} de ${templates.length} para ${type}`,
          });

          importedCount++;
          console.log(`  ✅ Template #${i + 1} importado`);
        } catch (error) {
          console.log(`  ⚠️  Template #${i + 1} ya existe o error: ${error.message}`);
          skippedCount++;
        }
      }
      
      console.log('');
    }

    console.log('\n============================================================');
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('============================================================');
    console.log(`✅ Footers importados:    ${importedCount}`);
    console.log(`⏭️  Footers saltados:      ${skippedCount}`);
    console.log(`📝 Total procesados:     ${importedCount + skippedCount}`);
    console.log('============================================================\n');

    console.log('✅ Importación completada exitosamente');
    console.log('💡 Ahora puedes editar las URLs y probabilidades desde el dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en la importación:', error);
    process.exit(1);
  }
}

// Ejecutar
importFooters();
