const { Op } = require('sequelize');
const Tip = require('../models/Tip');
const User = require('../models/User');

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
};

module.exports = tipController;
