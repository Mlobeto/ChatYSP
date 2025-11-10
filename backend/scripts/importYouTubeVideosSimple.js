const { sequelize } = require('../src/config/db');
const KnowledgeBase = require('../src/models/KnowledgeBase');
const fs = require('fs').promises;
const path = require('path');

/**
 * Script SIMPLE para importar videos sin embeddings
 * Úsalo si no tienes pgvector instalado aún
 * 
 * Uso: node scripts/importYouTubeVideosSimple.js
 */

class SimpleVideoImporter {
  constructor() {
    this.stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: 0,
    };
  }

  async importVideo(video) {
    try {
      // Verificar si ya existe
      const existing = await KnowledgeBase.findOne({
        where: sequelize.literal(`metadata->>'youtubeId' = '${video.id}'`)
      });

      if (existing) {
        console.log(`⏭️  Video ya existe: ${video.title}`);
        this.stats.skipped++;
        return null;
      }

      // Crear entrada SIN embedding
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
          description: video.description
        },
        // NO SE AGREGA EMBEDDING
        priority: 7,
        isActive: true
      });

      console.log(`✅ Importado: ${video.title}`);
      this.stats.imported++;
      return knowledge;

    } catch (error) {
      console.error(`❌ Error: ${video.title}:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  async importFromFile(filePath) {
    try {
      console.log(`\n📚 Importando videos desde: ${filePath}\n`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      const videos = data.videos || [];
      this.stats.total = videos.length;
      
      console.log(`📊 Total de videos: ${videos.length}\n`);

      for (const video of videos) {
        await this.importVideo(video);
      }

      this.printStats();

    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  }

  printStats() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN');
    console.log('='.repeat(50));
    console.log(`✅ Importados: ${this.stats.imported}`);
    console.log(`⏭️  Saltados:   ${this.stats.skipped}`);
    console.log(`❌ Errores:    ${this.stats.errors}`);
    console.log(`📝 Total:      ${this.stats.total}`);
    console.log('='.repeat(50) + '\n');
  }
}

async function main() {
  try {
    const filePath = path.join(__dirname, '../data/youtube_videos.json');
    
    console.log('\n🚀 Importando videos (SIN embeddings)...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL\n');

    const importer = new SimpleVideoImporter();
    await importer.importFromFile(filePath);

    console.log('✅ Importación completada\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleVideoImporter;
