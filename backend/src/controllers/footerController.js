const FooterTemplate = require('../models/FooterTemplate');
const { Op } = require('sequelize');

/**
 * Controlador para gestionar templates de footers
 */
const footerController = {
  /**
   * Obtener todos los footers
   */
  async getAll(req, res) {
    try {
      const footers = await FooterTemplate.findAll({
        order: [
          ['priority', 'DESC'],
          ['type', 'ASC'],
        ],
      });

      return res.json({
        success: true,
        footers,
      });
    } catch (error) {
      console.error('Error obteniendo footers:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo footers',
        error: error.message,
      });
    }
  },

  /**
   * Obtener footers activos para el sistema de tips
   */
  async getActive(req, res) {
    try {
      const footers = await FooterTemplate.findAll({
        where: {
          isActive: true,
        },
        order: [['probability', 'DESC']],
      });

      // Agrupar por tipo
      const footersByType = footers.reduce((acc, footer) => {
        if (!acc[footer.type]) {
          acc[footer.type] = [];
        }
        acc[footer.type].push({
          id: footer.id,
          template: footer.template,
          urls: footer.urls,
          probability: footer.probability,
        });
        return acc;
      }, {});

      return res.json({
        success: true,
        footers: footersByType,
        totalProbability: footers.reduce((sum, f) => sum + f.probability, 0),
      });
    } catch (error) {
      console.error('Error obteniendo footers activos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo footers activos',
        error: error.message,
      });
    }
  },

  /**
   * Obtener un footer por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const footer = await FooterTemplate.findByPk(id);

      if (!footer) {
        return res.status(404).json({
          success: false,
          message: 'Footer no encontrado',
        });
      }

      return res.json({
        success: true,
        footer,
      });
    } catch (error) {
      console.error('Error obteniendo footer:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo footer',
        error: error.message,
      });
    }
  },

  /**
   * Crear un nuevo footer
   */
  async create(req, res) {
    try {
      const { type, name, template, urls, probability, isActive, priority, notes } = req.body;

      // Validar que la probabilidad no exceda el límite
      const totalProbability = await FooterTemplate.sum('probability', {
        where: { isActive: true, id: { [Op.ne]: null } },
      });

      if (totalProbability + probability > 100) {
        return res.status(400).json({
          success: false,
          message: `La probabilidad total excedería el 100%. Actualmente: ${totalProbability}%`,
        });
      }

      const footer = await FooterTemplate.create({
        type,
        name,
        template,
        urls: urls || {},
        probability: probability || 10,
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 0,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Footer creado exitosamente',
        footer,
      });
    } catch (error) {
      console.error('Error creando footer:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creando footer',
        error: error.message,
      });
    }
  },

  /**
   * Actualizar un footer
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { type, name, template, urls, probability, isActive, priority, notes } = req.body;

      const footer = await FooterTemplate.findByPk(id);

      if (!footer) {
        return res.status(404).json({
          success: false,
          message: 'Footer no encontrado',
        });
      }

      // Si se está cambiando la probabilidad, validar el total
      if (probability !== undefined && probability !== footer.probability) {
        const totalProbability = await FooterTemplate.sum('probability', {
          where: {
            isActive: true,
            id: { [Op.ne]: id },
          },
        });

        if (totalProbability + probability > 100) {
          return res.status(400).json({
            success: false,
            message: `La probabilidad total excedería el 100%. Actualmente (sin este footer): ${totalProbability}%`,
          });
        }
      }

      await footer.update({
        type: type || footer.type,
        name: name || footer.name,
        template: template || footer.template,
        urls: urls !== undefined ? urls : footer.urls,
        probability: probability !== undefined ? probability : footer.probability,
        isActive: isActive !== undefined ? isActive : footer.isActive,
        priority: priority !== undefined ? priority : footer.priority,
        notes: notes !== undefined ? notes : footer.notes,
      });

      return res.json({
        success: true,
        message: 'Footer actualizado exitosamente',
        footer,
      });
    } catch (error) {
      console.error('Error actualizando footer:', error);
      return res.status(500).json({
        success: false,
        message: 'Error actualizando footer',
        error: error.message,
      });
    }
  },

  /**
   * Eliminar un footer
   */
  deleteFooter: async (req, res) => {
    try {
      const { id } = req.params;

      const footer = await FooterTemplate.findByPk(id);

      if (!footer) {
        return res.status(404).json({
          success: false,
          message: 'Footer no encontrado',
        });
      }

      await footer.destroy();

      return res.json({
        success: true,
        message: 'Footer eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error eliminando footer:', error);
      return res.status(500).json({
        success: false,
        message: 'Error eliminando footer',
        error: error.message,
      });
    }
  },

  /**
   * Obtener estadísticas de uso de footers
   */
  async getStats(req, res) {
    try {
      const stats = await FooterTemplate.findAll({
        attributes: [
          'type',
          'name',
          'usageCount',
          'lastUsedAt',
          'probability',
          'isActive',
        ],
        order: [['usageCount', 'DESC']],
      });

      const totalUsage = stats.reduce((sum, s) => sum + s.usageCount, 0);
      const totalProbability = stats
        .filter((s) => s.isActive)
        .reduce((sum, s) => sum + s.probability, 0);

      return res.json({
        success: true,
        stats,
        summary: {
          totalUsage,
          totalProbability,
          activeFooters: stats.filter((s) => s.isActive).length,
          inactiveFooters: stats.filter((s) => !s.isActive).length,
        },
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message,
      });
    }
  },
};

module.exports = footerController;
