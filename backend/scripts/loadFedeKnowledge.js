const { KnowledgeBase, sequelize } = require('../src/models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function loadFedeKnowledge() {
  try {
    console.log('🧠 Cargando conocimiento base de Fede...');
    
    // Asegurar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Leer el archivo JSON
    const knowledgeFile = path.join(__dirname, '../data/fede_complete_knowledge.json');
    const knowledgeData = JSON.parse(fs.readFileSync(knowledgeFile, 'utf8'));
    
    // Crear entradas en el knowledge base
    const knowledgeEntries = [];
    
    // 1. Identidad y filosofía del coach
    knowledgeEntries.push({
      title: 'Identidad y Filosofía de Fede',
      content: JSON.stringify(knowledgeData.coach_identity, null, 2),
      contentType: 'article',
      category: 'coaching_ontologico',
      tags: ['filosofia', 'identidad', 'ayn-rand', 'objetivismo'],
      metadata: {
        importance: 'high',
        type: 'core_identity'
      }
    });
    
    // 2. Los 7 Pasos (resumen de metodología)
    knowledgeEntries.push({
      title: 'Los 7 Pasos de la Recuperación - Resumen',
      content: JSON.stringify({
        name: knowledgeData.methodology.name,
        description: knowledgeData.methodology.description,
        steps_summary: knowledgeData.methodology.steps.map(step => ({
          step: step.step,
          concept: step.concept,
          description: step.description
        }))
      }, null, 2),
      contentType: 'methodology',
      category: 'metodologia_7_pasos',
      tags: ['7-pasos', 'metodologia', 'proceso', 'recovery'],
      metadata: {
        importance: 'critical',
        type: 'methodology_summary'
      }
    });
    
    // 3. Cada paso individual (para búsquedas específicas)
    knowledgeData.methodology.steps.forEach((step, index) => {
      knowledgeEntries.push({
        title: `Paso ${step.step}: ${step.concept}`,
        content: JSON.stringify(step, null, 2),
        contentType: 'methodology',
        category: 'metodologia_7_pasos',
        tags: [`paso-${step.step}`, step.concept.toLowerCase().replace(/ /g, '-'), 'metodologia'],
        metadata: {
          importance: 'high',
          type: 'methodology_step',
          step_number: step.step
        }
      });
    });
    
    // 4. Frases motivacionales
    knowledgeEntries.push({
      title: 'Frases Motivacionales de Fede',
      content: knowledgeData.phrases_motivacionales.join('\\n'),
      contentType: 'article',
      category: 'autoestima',
      tags: ['motivacion', 'frases', 'autoestima'],
      metadata: {
        importance: 'medium',
        type: 'motivational_content'
      }
    });
    
    // 5. Citas de Ayn Rand
    knowledgeEntries.push({
      title: 'Citas de Ayn Rand y Aplicaciones',
      content: JSON.stringify(knowledgeData.ayn_rand_quotes, null, 2),
      contentType: 'article',
      category: 'crecimiento_personal',
      tags: ['ayn-rand', 'filosofia', 'objetivismo', 'citas'],
      metadata: {
        importance: 'medium',
        type: 'philosophical_content'
      }
    });
    
    // 6. Metáforas futbolísticas
    knowledgeEntries.push({
      title: 'Metáforas Futbolísticas Argentinas',
      content: JSON.stringify(knowledgeData.football_metaphors, null, 2),
      contentType: 'article',
      category: 'comunicacion',
      tags: ['futbol', 'metaforas', 'argentina', 'cultural'],
      metadata: {
        importance: 'medium',
        type: 'cultural_content'
      }
    });
    
    // 7. Situaciones comunes
    knowledgeEntries.push({
      title: 'Situaciones Comunes en Rupturas',
      content: JSON.stringify(knowledgeData.common_situations, null, 2),
      contentType: 'article',
      category: 'ruptura_pareja',
      tags: ['situaciones', 'problemas-comunes', 'respuestas'],
      metadata: {
        importance: 'high',
        type: 'situational_guidance'
      }
    });
    
    // 8. Red flags e indicadores
    knowledgeEntries.push({
      title: 'Red Flags e Indicadores de Éxito',
      content: JSON.stringify({
        red_flags: knowledgeData.red_flags,
        success_indicators: knowledgeData.success_indicators
      }, null, 2),
      contentType: 'article',
      category: 'ruptura_pareja',
      tags: ['red-flags', 'success-indicators', 'warning-signs'],
      metadata: {
        importance: 'high',
        type: 'progress_indicators'
      }
    });
    
    // 9. Expresiones argentinas
    knowledgeEntries.push({
      title: 'Expresiones y Lenguaje Argentino',
      content: knowledgeData.argentine_expressions.join('\\n'),
      contentType: 'article',
      category: 'comunicacion',
      tags: ['expresiones', 'argentina', 'lenguaje', 'cultural'],
      metadata: {
        importance: 'low',
        type: 'language_style'
      }
    });
    
    // Limpiar conocimiento existente de Fede (opcional)
    console.log('🧹 Limpiando conocimiento previo...');
    await KnowledgeBase.destroy({
      where: {
        title: {
          [Op.like]: '%Fede%'
        }
      }
    });
    
    // Insertar todas las entradas
    console.log(`📚 Insertando ${knowledgeEntries.length} entradas de conocimiento...`);
    
    for (const entry of knowledgeEntries) {
      await KnowledgeBase.create(entry);
      console.log(`✅ Creado: ${entry.title}`);
    }
    
    console.log('🎉 ¡Conocimiento base de Fede cargado exitosamente!');
    console.log(`📊 Total de entradas: ${knowledgeEntries.length}`);
    
    // Mostrar estadísticas
    const stats = await KnowledgeBase.count({
      group: ['category']
    });
    
    console.log('\\n📈 Estadísticas por categoría:');
    stats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} entradas`);
    });
    
  } catch (error) {
    console.error('❌ Error cargando conocimiento:', error);
    throw error;
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  loadFedeKnowledge()
    .then(() => {
      console.log('\\n🚀 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { loadFedeKnowledge };