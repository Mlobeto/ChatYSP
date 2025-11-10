require('dotenv').config();
const { sequelize } = require('../src/config/db');
const KnowledgeBase = require('../src/models/KnowledgeBase');
const { openai } = require('../src/config/openai');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script para importar videos de YouTube con embeddings vectoriales
 * 
 * Uso:
 * node scripts/importYouTubeVideos.js
 * 
 * Opciones:
 * --file=ruta/al/archivo.json    Especifica archivo JSON personalizado
 * --skip-existing                No procesa videos que ya existen
 * --batch-size=10               Procesa videos en lotes (default: 10)
 */

class YouTubeVideoImporter {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.skipExisting = options.skipExisting || false;
    this.stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Genera embedding usando OpenAI text-embedding-3-small
   */
  async generateEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generando embedding:', error.message);
      throw error;
    }
  }

  /**
   * Prepara el texto para embedding
   * Combina título, descripción, resumen y puntos clave
   */
  prepareTextForEmbedding(video) {
    const parts = [
      `Título: ${video.title}`,
      `Descripción: ${video.description || ''}`,
      `Resumen: ${video.summary || ''}`,
      `Puntos clave: ${(video.keyPoints || []).join('. ')}`,
      `Categoría: ${video.category}`,
      `Tags: ${(video.tags || []).join(', ')}`
    ];
    
    return parts.filter(p => p).join('\n');
  }

  /**
   * Verifica si un video ya existe en la BD
   */
  async videoExists(youtubeId) {
    const existing = await KnowledgeBase.findOne({
      where: sequelize.literal(`metadata->>'youtubeId' = '${youtubeId}'`)
    });
    return !!existing;
  }

  /**
   * Importa un video a la base de conocimiento
   */
  async importVideo(video) {
    try {
      // Verificar si ya existe
      if (this.skipExisting && await this.videoExists(video.id)) {
        console.log(`⏭️  Saltando video existente: ${video.title}`);
        this.stats.skipped++;
        return null;
      }

      // Preparar texto para embedding
      const textForEmbedding = this.prepareTextForEmbedding(video);
      
      console.log(`🔄 Generando embedding para: ${video.title}...`);
      const embedding = await this.generateEmbedding(textForEmbedding);

      // Crear entrada en knowledge base
      const knowledge = await KnowledgeBase.create({
        title: video.title,
        content: video.summary || video.description,
        contentType: 'video',
        category: video.category || 'general',
        tags: video.tags || [],
        metadata: {
          youtubeId: video.id,
          url: video.url,
          duration: video.duration,
          publishedAt: video.publishedAt,
          keyPoints: video.keyPoints || [],
          transcript: video.transcript ? video.transcript.substring(0, 5000) : null // Limitar transcript
        },
        embedding: JSON.stringify(embedding), // Sequelize lo convertirá al tipo vector de PostgreSQL
        priority: 7, // Videos del coach tienen alta prioridad
        isActive: true
      });

      console.log(`✅ Importado: ${video.title}`);
      this.stats.imported++;
      return knowledge;

    } catch (error) {
      console.error(`❌ Error importando video "${video.title}":`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Procesa videos en lotes para no saturar la API de OpenAI
   */
  async processBatch(videos) {
    const results = [];
    for (const video of videos) {
      const result = await this.importVideo(video);
      results.push(result);
      
      // Pequeña pausa entre videos para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return results;
  }

  /**
   * Importa todos los videos del archivo JSON
   */
  async importFromFile(filePath) {
    try {
      this.stats.startTime = new Date();
      
      console.log(`\n📚 Leyendo videos desde: ${filePath}\n`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      const videos = data.videos || [];
      this.stats.total = videos.length;
      
      console.log(`📊 Total de videos a procesar: ${videos.length}\n`);

      // Procesar en lotes
      for (let i = 0; i < videos.length; i += this.batchSize) {
        const batch = videos.slice(i, i + this.batchSize);
        const batchNumber = Math.floor(i / this.batchSize) + 1;
        const totalBatches = Math.ceil(videos.length / this.batchSize);
        
        console.log(`\n📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} videos)...`);
        await this.processBatch(batch);
      }

      this.stats.endTime = new Date();
      this.printStats();

    } catch (error) {
      console.error('❌ Error en importación:', error);
      throw error;
    }
  }

  /**
   * Imprime estadísticas finales
   */
  printStats() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Videos importados:    ${this.stats.imported}`);
    console.log(`⏭️  Videos saltados:      ${this.stats.skipped}`);
    console.log(`❌ Errores:              ${this.stats.errors}`);
    console.log(`📝 Total procesados:     ${this.stats.total}`);
    console.log(`⏱️  Tiempo total:         ${duration.toFixed(2)}s`);
    console.log(`⚡ Promedio por video:   ${(duration / this.stats.total).toFixed(2)}s`);
    console.log('='.repeat(60) + '\n');
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    // Parsear argumentos
    const args = process.argv.slice(2);
    const options = {
      batchSize: 10,
      skipExisting: false,
      file: path.join(__dirname, '../data/youtube_videos.json')
    };

    args.forEach(arg => {
      if (arg.startsWith('--file=')) {
        options.file = arg.split('=')[1];
      } else if (arg === '--skip-existing') {
        options.skipExisting = true;
      } else if (arg.startsWith('--batch-size=')) {
        options.batchSize = parseInt(arg.split('=')[1]);
      }
    });

    console.log('\n🚀 Iniciando importación de videos de YouTube...\n');
    console.log('⚙️  Configuración:');
    console.log(`   - Archivo: ${options.file}`);
    console.log(`   - Tamaño de lote: ${options.batchSize}`);
    console.log(`   - Saltar existentes: ${options.skipExisting ? 'Sí' : 'No'}`);
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL\n');

    // Importar videos
    const importer = new YouTubeVideoImporter(options);
    await importer.importFromFile(options.file);

    console.log('✅ Importación completada exitosamente\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = YouTubeVideoImporter;
