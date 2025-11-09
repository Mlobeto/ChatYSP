const { Tip, User, sequelize } = require('../src/models');
const fs = require('fs');
const path = require('path');

/**
 * Script para cargar tips desde un archivo TXT
 * 
 * Formato esperado del archivo TXT:
 * ---
 * TITLE: Título del tip
 * CATEGORY: game|chat|general|ai
 * DIFFICULTY: beginner|intermediate|advanced
 * TAGS: tag1, tag2, tag3
 * CONTENT:
 * Contenido del tip en múltiples líneas...
 * Puede tener varios párrafos.
 * ---
 */

async function parseTxtFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tips = [];
  
  // Dividir por el separador de tips (---)
  const tipBlocks = content.split('---').filter(block => block.trim().length > 0);
  
  for (const block of tipBlocks) {
    const lines = block.trim().split('\n');
    const tip = {
      title: '',
      category: 'general',
      difficulty: 'beginner',
      tags: [],
      content: '',
    };
    
    let inContentSection = false;
    let contentLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('TITLE:')) {
        tip.title = trimmedLine.replace('TITLE:', '').trim();
      } else if (trimmedLine.startsWith('CATEGORY:')) {
        const category = trimmedLine.replace('CATEGORY:', '').trim().toLowerCase();
        if (['game', 'chat', 'general', 'ai'].includes(category)) {
          tip.category = category;
        }
      } else if (trimmedLine.startsWith('DIFFICULTY:')) {
        const difficulty = trimmedLine.replace('DIFFICULTY:', '').trim().toLowerCase();
        if (['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
          tip.difficulty = difficulty;
        }
      } else if (trimmedLine.startsWith('TAGS:')) {
        const tagsStr = trimmedLine.replace('TAGS:', '').trim();
        tip.tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (trimmedLine.startsWith('CONTENT:')) {
        inContentSection = true;
      } else if (inContentSection && trimmedLine.length > 0) {
        contentLines.push(trimmedLine);
      }
    }
    
    tip.content = contentLines.join('\n').trim();
    
    // Validar que el tip tenga los campos mínimos requeridos
    if (tip.title && tip.content) {
      tips.push(tip);
    } else {
      console.warn('⚠️ Tip incompleto encontrado, omitiendo:', tip.title || 'Sin título');
    }
  }
  
  return tips;
}

async function loadTipsFromTxt(filePath, userId = null) {
  try {
    console.log('📝 Cargando tips desde archivo TXT...');
    console.log('📄 Archivo:', filePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Si no se proporciona userId, buscar un admin
    let creatorId = userId;
    if (!creatorId) {
      const adminUser = await User.findOne({
        where: { role: 'admin' }
      });
      
      if (!adminUser) {
        throw new Error('No se encontró un usuario admin. Proporciona un userId.');
      }
      
      creatorId = adminUser.id;
      console.log('👤 Usuario creador:', adminUser.username);
    }
    
    // Parsear el archivo TXT
    console.log('🔍 Parseando archivo TXT...');
    const tips = await parseTxtFile(filePath);
    console.log(`📊 Tips encontrados: ${tips.length}`);
    
    if (tips.length === 0) {
      console.log('⚠️ No se encontraron tips válidos en el archivo');
      return { success: false, count: 0 };
    }
    
    // Insertar los tips en la base de datos
    console.log('💾 Guardando tips en la base de datos...');
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const tipData of tips) {
      try {
        // Verificar si ya existe un tip con el mismo título
        const existingTip = await Tip.findOne({
          where: { title: tipData.title }
        });
        
        if (existingTip) {
          console.log(`⏭️ Omitiendo tip duplicado: "${tipData.title}"`);
          skippedCount++;
          continue;
        }
        
        await Tip.create({
          ...tipData,
          createdById: creatorId,
          isActive: true,
          views: 0,
          likes: 0,
        });
        
        console.log(`✅ Tip creado: "${tipData.title}"`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error creando tip "${tipData.title}":`, error.message);
      }
    }
    
    console.log('\n📈 Resumen:');
    console.log(`   ✅ Tips insertados: ${insertedCount}`);
    console.log(`   ⏭️ Tips omitidos (duplicados): ${skippedCount}`);
    console.log(`   📊 Total procesados: ${tips.length}`);
    
    return {
      success: true,
      count: insertedCount,
      skipped: skippedCount,
      total: tips.length,
    };
    
  } catch (error) {
    console.error('❌ Error cargando tips:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0] || path.join(__dirname, '../data/tips.txt');
  const userId = args[1] || null;
  
  loadTipsFromTxt(filePath, userId)
    .then((result) => {
      console.log('\n🚀 Script completado exitosamente');
      console.log('Resultado:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { loadTipsFromTxt, parseTxtFile };
