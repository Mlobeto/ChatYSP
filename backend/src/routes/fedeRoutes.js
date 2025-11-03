const express = require('express');

const router = express.Router();
const fedeController = require('../controllers/fedeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/fede/chat
 * @description Enviar mensaje a Fede AI
 * @access Private
 */
router.post('/chat', fedeController.sendMessage);

/**
 * @route GET /api/fede/history
 * @description Obtener historial de conversaciones
 * @access Private
 */
router.get('/history', fedeController.getHistory);

/**
 * @route POST /api/fede/rate/:conversationId
 * @description Calificar una respuesta de Fede
 * @access Private
 */
router.post('/rate/:conversationId', fedeController.rateResponse);

/**
 * @route GET /api/fede/session/:sessionId/stats
 * @description Obtener estadísticas de una sesión
 * @access Private
 */
router.get('/session/:sessionId/stats', fedeController.getSessionStats);

/**
 * @route POST /api/fede/session/new
 * @description Crear nueva sesión de conversación
 * @access Private
 */
router.post('/session/new', fedeController.createSession);

// ===== RUTAS ADMINISTRATIVAS =====
// Requieren permisos de administrador

/**
 * @route GET /api/fede/admin/configuration
 * @description Obtener configuración de Fede
 * @access Admin
 */
router.get('/admin/configuration', roleMiddleware(['admin']), fedeController.getConfiguration);

/**
 * @route PUT /api/fede/admin/configuration
 * @description Actualizar configuración de Fede
 * @access Admin
 */
router.put('/admin/configuration', roleMiddleware(['admin']), fedeController.updateConfiguration);

/**
 * @route GET /api/fede/admin/training/status
 * @description Obtener estado del entrenamiento
 * @access Admin
 */
router.get('/admin/training/status', roleMiddleware(['admin']), fedeController.getTrainingStatus);

/**
 * @route POST /api/fede/admin/training/upload
 * @description Subir datos de entrenamiento
 * @access Admin
 */
router.post('/admin/training/upload', roleMiddleware(['admin']), fedeController.uploadTrainingData);

/**
 * @route POST /api/fede/admin/training/start
 * @description Iniciar entrenamiento
 * @access Admin
 */
router.post('/admin/training/start', roleMiddleware(['admin']), fedeController.startTraining);

/**
 * @route POST /api/fede/admin/training/stop
 * @description Detener entrenamiento
 * @access Admin
 */
router.post('/admin/training/stop', roleMiddleware(['admin']), fedeController.stopTraining);

/**
 * @route GET /api/fede/admin/training/export
 * @description Exportar datos de entrenamiento
 * @access Admin
 */
router.get('/admin/training/export', roleMiddleware(['admin']), fedeController.exportTrainingData);

/**
 * @route GET /api/fede/admin/metrics/evaluation
 * @description Obtener métricas de evaluación
 * @access Admin
 */
router.get('/admin/metrics/evaluation', roleMiddleware(['admin']), fedeController.getEvaluationMetrics);

/**
 * @route GET /api/fede/admin/models/versions
 * @description Obtener versiones del modelo
 * @access Admin
 */
router.get('/admin/models/versions', roleMiddleware(['admin']), fedeController.getModelVersions);

/**
 * @route POST /api/fede/admin/models/:versionId/deploy
 * @description Desplegar modelo
 * @access Admin
 */
router.post('/admin/models/:versionId/deploy', roleMiddleware(['admin']), fedeController.deployModel);

/**
 * @route POST /api/fede/admin/test-message
 * @description Probar mensaje con Fede
 * @access Admin
 */
router.post('/admin/test-message', roleMiddleware(['admin']), fedeController.testMessage);

module.exports = router;
