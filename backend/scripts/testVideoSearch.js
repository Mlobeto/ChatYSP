require('dotenv').config();
const FedeAIService = require('../src/services/FedeAIService');

/**
 * Script de prueba para búsqueda semántica de videos
 */

async function testVideoSearch() {
  console.log('🔍 Probando búsqueda semántica de videos...\n');

  // Crear instancia del servicio
  const fedeService = new FedeAIService();

  // Prueba 1: Buscar videos sobre contacto cero
  console.log(`\n=== Prueba 1: Buscar videos sobre "contacto cero" ===`);
  // Usar findSimilarContent con threshold más bajo para ver todos los resultados
  const allResults = await fedeService.findSimilarContent('contacto cero', 3, 'video');
  console.log(`📊 Total resultados: ${allResults.length}`);
  if (allResults.length > 0) {
    allResults.forEach((video, i) => {
      console.log(`\n${i + 1}. ${video.title}`);
      console.log(`   Similitud: ${(video.similarity * 100).toFixed(1)}%`);
      console.log(`   Categoría: ${video.category}`);
      console.log(`   URL: ${video.sourceUrl}`);
    });
  }
  
  console.log(`\n💡 Nota: Con solo 3 videos de prueba, las similitudes pueden ser bajas.`);
  console.log(`   Cuando tengas los 500+ videos, las similitudes serán mucho más altas.\n`);

  // Prueba 2: Buscar videos sobre "responder mensajes de mi ex"
  console.log('\n=== Prueba 2: Buscar videos sobre "responder mensajes de mi ex" ===');
  const videos2 = await fedeService.findRelatedVideos('responder mensajes de mi ex', 5);
  console.log(`Encontrados: ${videos2.length} videos`);
  videos2.forEach((v, i) => {
    console.log(`${i + 1}. ${v.title}`);
    console.log(`   Categoría: ${v.category}`);
    console.log(`   Similitud: ${v.similarity}`);
    console.log(`   URL: ${v.url}\n`);
  });

  // Prueba 3: Buscar videos sobre "superar una ruptura"
  console.log('\n=== Prueba 3: Buscar videos sobre "superar una ruptura" ===');
  const videos3 = await fedeService.findRelatedVideos('superar una ruptura', 5);
  console.log(`Encontrados: ${videos3.length} videos`);
  videos3.forEach((v, i) => {
    console.log(`${i + 1}. ${v.title}`);
    console.log(`   Categoría: ${v.category}`);
    console.log(`   Similitud: ${v.similarity}`);
    console.log(`   URL: ${v.url}\n`);
  });

  // Prueba 4: Recomendar video para un tip específico
  console.log('\n=== Prueba 4: Recomendar video para un tip sobre ruptura ===');
  const tipContent = 'Después de una ruptura es importante darte espacio para sanar. No contactes a tu ex por un tiempo.';
  const recommendedVideo = await fedeService.recommendVideoForTip(tipContent, 'paso_1_contacto_cero');
  if (recommendedVideo) {
    console.log('Video recomendado:');
    console.log(`Título: ${recommendedVideo.title}`);
    console.log(`Categoría: ${recommendedVideo.category}`);
    console.log(`URL: ${recommendedVideo.url}`);
    console.log(`Similitud: ${recommendedVideo.similarity}`);
  } else {
    console.log('No se encontró video relacionado');
  }

  console.log('\n✅ Pruebas completadas');
  process.exit(0);
}

testVideoSearch().catch(error => {
  console.error('❌ Error en las pruebas:', error);
  process.exit(1);
});
