const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/roleMiddleware');

/**
 * Rutas para gestión de footers (solo admins)
 */

// Obtener todos los footers
router.get('/', authMiddleware, adminMiddleware, footerController.getAll);

// Obtener footers activos (para el sistema)
router.get('/active', authMiddleware, footerController.getActive);

// Obtener estadísticas de uso
router.get('/stats', authMiddleware, adminMiddleware, footerController.getStats);

// Obtener un footer por ID
router.get('/:id', authMiddleware, adminMiddleware, footerController.getById);

// Crear nuevo footer
router.post('/', authMiddleware, adminMiddleware, footerController.create);

// Actualizar footer
router.put('/:id', authMiddleware, adminMiddleware, footerController.update);

// Eliminar footer
router.delete('/:id', authMiddleware, adminMiddleware, footerController.deleteFooter);

module.exports = router;
