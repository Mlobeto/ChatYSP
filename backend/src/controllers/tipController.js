const { Op } = require('sequelize');
const Tip = require('../models/Tip');
const User = require('../models/User');
const { parseTxtFile } = require('../../scripts/loadTipsFromTxt');
const { parseTipFromText, validateParsedTip } = require('../utils/tipParser');
const fs = require('fs');
const path = require('path');

const tipController = {
  // Obtener todos los tips con filtros opcionales
  async getAllTips(req, res) {
    try {
      console.log('📝 getAllTips - Query params:', req.query);

      const {
        page = 1,
        limit = 10,
        category,
        difficulty,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      console.log('📝 getAllTips - Parsed params:', {
        page, limit, category, difficulty, isActive, search, sortBy, sortOrder,
      });

      const offset = (page - 1) * limit;
      const where = {};

      // Mapear nombres de campo del frontend al backend
      let finalSortBy = sortBy;
      if (sortBy === 'created_at') {
        finalSortBy = 'createdAt';
      }

      console.log('📝 getAllTips - Final sortBy:', finalSortBy);

      // Filtros
      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      // Búsqueda por título, contenido o tags
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.contains]: [search] } },
        ];
      }

      const { count, rows: tips } = await Tip.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order: [[finalSortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      res.json({
        success: true,
        data: {
          tips,
          pagination: {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            limit: parseInt(limit, 10),
          },
        },
      });
    } catch (error) {
      console.error('Error obteniendo tips:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Obtener un tip por ID
  async getTipById(req, res) {
    try {
      const { id } = req.params;

      const tip = await Tip.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email'],
          },
        ],
      });

      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip no encontrado',
        });
      }

      // Incrementar contador de vistas
      await tip.increment('views');

      res.json({
        success: true,
        data: tip,
      });
    } catch (error) {
      console.error('Error obteniendo tip:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Crear un nuevo tip
  async createTip(req, res) {
    try {
      const {
        title,
        content,
        category = 'general',
        difficulty = 'beginner',
        tags = [],
        videoUrl,
        imageUrl,
        orderIndex = 0,
      } = req.body;

      const tip = await Tip.create({
        title,
        content,
        category,
        difficulty,
        tags,
        video_url: videoUrl,
        image_url: imageUrl,
        order_index: orderIndex,
        createdById: req.user.id,
      });

      const createdTip = await Tip.findByPk(tip.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email'],
          },
        ],
      });

      console.log(`📝 Nuevo tip creado por ${req.user.username}:`, {
        id: tip.id,
        category: tip.category,
        difficulty: tip.difficulty,
      });

      res.status(201).json({
        success: true,
        message: 'Tip creado exitosamente',
        data: createdTip,
      });
    } catch (error) {
      console.error('Error creando tip:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Datos de tip inválidos',
          errors: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Actualizar un tip
  async updateTip(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        category,
        difficulty,
        tags,
        isActive,
        videoUrl,
        imageUrl,
        orderIndex,
      } = req.body;

      const tip = await Tip.findByPk(id);

      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip no encontrado',
        });
      }

      // Verificar permisos (solo el creador o admin pueden editar)
      if (tip.createdById !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar este tip',
        });
      }

      await tip.update({
        title: title || tip.title,
        content: content || tip.content,
        category: category || tip.category,
        difficulty: difficulty || tip.difficulty,
        tags: tags || tip.tags,
        isActive: isActive !== undefined ? isActive : tip.isActive,
        video_url: videoUrl || tip.video_url,
        image_url: imageUrl || tip.image_url,
        order_index: orderIndex !== undefined ? orderIndex : tip.order_index,
      });

      const updatedTip = await Tip.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email'],
          },
        ],
      });

      console.log(`✏️ Tip actualizado por ${req.user.username}:`, {
        id: tip.id,
        changes: Object.keys(req.body),
      });

      res.json({
        success: true,
        message: 'Tip actualizado exitosamente',
        data: updatedTip,
      });
    } catch (error) {
      console.error('Error actualizando tip:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Datos de tip inválidos',
          errors: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Eliminar un tip
  async deleteTip(req, res) {
    try {
      const { id } = req.params;

      const tip = await Tip.findByPk(id);

      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip no encontrado',
        });
      }

      // Verificar permisos (solo el creador o admin pueden eliminar)
      if (tip.createdById !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este tip',
        });
      }

      await tip.destroy();

      console.log(`🗑️ Tip eliminado por ${req.user.username}:`, {
        id: tip.id,
        content: `${tip.content.substring(0, 50)}...`,
      });

      res.json({
        success: true,
        message: 'Tip eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error eliminando tip:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Dar like a un tip
  async likeTip(req, res) {
    try {
      const { id } = req.params;

      const tip = await Tip.findByPk(id);

      if (!tip) {
        return res.status(404).json({
          success: false,
          message: 'Tip no encontrado',
        });
      }

      await tip.increment('likes');

      res.json({
        success: true,
        message: 'Like agregado',
        data: {
          id: tip.id,
          likes: tip.likes + 1,
        },
      });
    } catch (error) {
      console.error('Error agregando like:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Obtener tips aleatorios por categoría
  async getRandomTips(req, res) {
    try {
      const { category, limit = 3 } = req.query;

      const where = { isActive: true };
      if (category) where.category = category;

      const tips = await Tip.findAll({
        where,
        order: [
          ['views', 'ASC'],
          ['createdAt', 'DESC'],
        ],
        limit: parseInt(limit, 10),
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username'],
          },
        ],
      });

      res.json({
        success: true,
        data: tips,
      });
    } catch (error) {
      console.error('Error obteniendo tips aleatorios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Obtener estadísticas de tips
  async getTipsStats(req, res) {
    try {
      const totalTips = await Tip.count();
      const activeTips = await Tip.count({ where: { isActive: true } });

      const tipsByCategory = await Tip.findAll({
        attributes: ['category', [Tip.sequelize.fn('COUNT', Tip.sequelize.col('id')), 'count']],
        group: ['category'],
        raw: true,
      });

      const tipsByDifficulty = await Tip.findAll({
        attributes: ['difficulty', [Tip.sequelize.fn('COUNT', Tip.sequelize.col('id')), 'count']],
        group: ['difficulty'],
        raw: true,
      });

      const mostViewedTips = await Tip.findAll({
        order: [['views', 'DESC']],
        limit: 5,
        attributes: ['id', 'content', 'views', 'category'],
        where: { isActive: true },
      });

      res.json({
        success: true,
        data: {
          totalTips,
          activeTips,
          inactiveTips: totalTips - activeTips,
          byCategory: tipsByCategory.reduce((acc, item) => {
            acc[item.category] = parseInt(item.count, 10);
            return acc;
          }, {}),
          byDifficulty: tipsByDifficulty.reduce((acc, item) => {
            acc[item.difficulty] = parseInt(item.count, 10);
            return acc;
          }, {}),
          mostViewed: mostViewedTips,
        },
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Cargar tips desde archivo TXT
  async uploadTipsFromFile(req, res) {
    try {
      console.log('📤 Subiendo tips desde archivo...');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo',
        });
      }

      const userId = req.user.id;
      const filePath = req.file.path;

      console.log('📄 Archivo recibido:', req.file.originalname);
      console.log('📂 Path temporal:', filePath);

      // Parsear el archivo TXT
      const tips = await parseTxtFile(filePath);
      console.log(`📊 Tips parseados: ${tips.length}`);

      if (tips.length === 0) {
        // Eliminar archivo temporal
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: 'No se encontraron tips válidos en el archivo',
        });
      }

      // Insertar los tips en la base de datos
      let insertedCount = 0;
      let skippedCount = 0;
      const errors = [];

      for (const tipData of tips) {
        try {
          // Verificar si ya existe un tip con el mismo título
          const existingTip = await Tip.findOne({
            where: { title: tipData.title },
          });

          if (existingTip) {
            console.log(`⏭️ Omitiendo tip duplicado: "${tipData.title}"`);
            skippedCount++;
            continue;
          }

          await Tip.create({
            ...tipData,
            createdById: userId,
            isActive: true,
            views: 0,
            likes: 0,
          });

          console.log(`✅ Tip creado: "${tipData.title}"`);
          insertedCount++;
        } catch (error) {
          console.error(`❌ Error creando tip "${tipData.title}":`, error.message);
          errors.push({
            title: tipData.title,
            error: error.message,
          });
        }
      }

      // Eliminar archivo temporal
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Tips cargados exitosamente',
        data: {
          inserted: insertedCount,
          skipped: skippedCount,
          total: tips.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      });
    } catch (error) {
      console.error('Error cargando tips desde archivo:', error);
      
      // Intentar eliminar archivo temporal si existe
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },

  // Cargar múltiples tips desde archivos TXT
  async uploadMultipleTipsFromFiles(req, res) {
    try {
      console.log('📤 Subiendo múltiples tips desde archivos...');
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron archivos',
        });
      }

      const userId = req.user.id;
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
            continue;
          }

          // Verificar si ya existe un tip con el mismo título
          const existingTip = await Tip.findOne({
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
            continue;
          }

          // Crear el tip en la base de datos
          await Tip.create({
            title: parsedTip.title,
            content: parsedTip.content,
            category: parsedTip.category,
            difficulty: parsedTip.difficulty,
            tags: parsedTip.tags,
            createdById: userId,
            isActive: true,
            views: 0,
            likes: 0,
          });

          console.log(`✅ Tip creado: "${parsedTip.title}"`);
          totalInserted++;
          processingResults.push({
            file: file.originalname,
            status: 'success',
            title: parsedTip.title
          });

        } catch (error) {
          console.error(`❌ Error procesando ${file.originalname}:`, error.message);
          totalErrors++;
          processingResults.push({
            file: file.originalname,
            status: 'error',
            errors: [error.message]
          });
        } finally {
          // Eliminar archivo temporal
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error(`Error eliminando archivo ${file.originalname}:`, unlinkError);
          }
        }
      }

      console.log('\n📊 Resumen final:');
      console.log(`   ✅ Insertados: ${totalInserted}`);
      console.log(`   ⏭️ Omitidos: ${totalSkipped}`);
      console.log(`   ❌ Errores: ${totalErrors}`);

      res.json({
        success: true,
        message: `Procesamiento completado: ${totalInserted} tips creados, ${totalSkipped} omitidos, ${totalErrors} errores`,
        data: {
          inserted: totalInserted,
          skipped: totalSkipped,
          errors: totalErrors,
          total: files.length,
          details: processingResults
        },
      });

    } catch (error) {
      console.error('Error cargando múltiples tips:', error);
      
      // Intentar eliminar archivos temporales
      if (req.files) {
        for (const file of req.files) {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkError) {
            console.error('Error eliminando archivo temporal:', unlinkError);
          }
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
      });
    }
  },
};

module.exports = tipController;
