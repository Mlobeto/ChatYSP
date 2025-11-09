const CoachTip = require('../models/CoachTip');
const { parseTipFromText, validateParsedTip } = require('../utils/tipParser');
const fs = require('fs');

const coachTipController = {
  /**
   * Cargar múltiples tips de coaching desde archivos TXT
   */
  async uploadMultipleTipsFromFiles(req, res) {
    try {
      console.log('📤 Subiendo tips de coaching desde archivos...');
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron archivos',
        });
      }

      const files = req.files;
      console.log(`📄 Archivos recibidos: ${files.length}`);

      let totalInserted = 0;
      let totalSkipped = 0;
      let totalErrors = 0;
      const processingResults = [];

      // Procesar cada archivo
      for (const file of files) {
        try {
          console.log(`\n📂 Procesando: ${file.originalname}`);
          
          // Leer contenido del archivo
          const fileContent = fs.readFileSync(file.path, 'utf-8');
          
          // Parsear el tip
          const parsedTip = parseTipFromText(fileContent, file.originalname);
          
          // Validar el tip parseado
          const validation = validateParsedTip(parsedTip);
          
          if (!validation.valid) {
            console.log(`❌ Archivo inválido: ${file.originalname}`);
            console.log('   Errores:', validation.errors);
            totalErrors++;
            processingResults.push({
              file: file.originalname,
              status: 'error',
              errors: validation.errors
            });
            
            // Eliminar archivo temporal
            fs.unlinkSync(file.path);
            continue;
          }

          // Verificar si ya existe un tip con el mismo título
          const existingTip = await CoachTip.findOne({
            where: { title: parsedTip.title },
          });

          if (existingTip) {
            console.log(`⏭️ Tip duplicado: "${parsedTip.title}"`);
            totalSkipped++;
            processingResults.push({
              file: file.originalname,
              status: 'skipped',
              reason: 'Título duplicado'
            });
            
            // Eliminar archivo temporal
            fs.unlinkSync(file.path);
            continue;
          }

          // Crear el tip de coaching en la base de datos
          await CoachTip.create({
            title: parsedTip.title,
            content: parsedTip.content,
            category: parsedTip.category || 'ruptura',
            tags: parsedTip.tags || [],
            difficulty: parsedTip.difficulty || 'intermedio',
            source: file.originalname,
            isActive: true,
          });

          console.log(`✅ Tip creado: "${parsedTip.title}"`);
          totalInserted++;
          processingResults.push({
            file: file.originalname,
            status: 'success',
            title: parsedTip.title
          });

          // Eliminar archivo temporal después de procesarlo
          fs.unlinkSync(file.path);

        } catch (error) {
          console.error(`❌ Error procesando ${file.originalname}:`, error);
          totalErrors++;
          processingResults.push({
            file: file.originalname,
            status: 'error',
            error: error.message
          });
          
          // Intentar eliminar archivo temporal
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (unlinkError) {
            console.error('Error eliminando archivo temporal:', unlinkError);
          }
        }
      }

      console.log('\n📊 Resumen de carga:');
      console.log(`   ✅ Insertados: ${totalInserted}`);
      console.log(`   ⏭️ Omitidos: ${totalSkipped}`);
      console.log(`   ❌ Errores: ${totalErrors}`);

      return res.status(200).json({
        success: true,
        message: 'Carga de tips completada',
        data: {
          total: files.length,
          inserted: totalInserted,
          skipped: totalSkipped,
          errors: totalErrors,
          results: processingResults,
        },
      });

    } catch (error) {
      console.error('❌ Error en uploadMultipleTipsFromFiles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error procesando archivos',
        error: error.message,
      });
    }
  },

  /**
   * Obtener todos los tips de coaching
   */
  async getAllCoachTips(req, res) {
    try {
      const { page = 1, limit = 20, category, isActive } = req.query;
      const offset = (page - 1) * limit;
      const where = {};

      if (category) where.category = category;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const { count, rows } = await CoachTip.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        success: true,
        data: {
          tips: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error en getAllCoachTips:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tips de coaching',
        error: error.message,
      });
    }
  },
};

module.exports = coachTipController;
