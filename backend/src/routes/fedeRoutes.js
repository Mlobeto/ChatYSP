const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const fedeController = require('../controllers/fedeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

// Asegurar que el directorio de uploads existe
const uploadsDir = path.join(__dirname, '../../uploads/training');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio de uploads de entrenamiento creado:', uploadsDir);
}

// Configuración de Multer para archivos de entrenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `training-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /txt|json|csv|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/octet-stream' ||
                     file.mimetype === 'text/plain';
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos TXT, JSON, CSV o PDF'));
  },
});

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
 * @route DELETE /api/fede/history
 * @description Limpiar historial de conversaciones
 * @access Private
 */
router.delete('/history', fedeController.clearHistory);

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
router.post('/admin/training/upload', roleMiddleware(['admin']), upload.array('files', 10), fedeController.uploadTrainingData);

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
 * @route GET /api/fede/admin/models
 * @description Obtener versiones de modelos
 * @access Admin
 */
router.get('/admin/models', roleMiddleware(['admin']), fedeController.getModelVersions);

/**
 * @route POST /api/fede/admin/models/deploy
 * @description Desplegar modelo
 * @access Admin
 */
router.post('/admin/models/deploy', roleMiddleware(['admin']), fedeController.deployModel);

/**
 * @route POST /api/fede/admin/test
 * @description Probar mensaje con Fede
 * @access Admin
 */
router.post('/admin/test', roleMiddleware(['admin']), fedeController.testMessage);

// ===== RUTAS DE KNOWLEDGE BASE =====

/**
 * @route GET /api/fede/stats
 * @description Obtener estadísticas generales de Fede
 * @access Private
 */
router.get('/stats', fedeController.getStats);

/**
 * @route GET /api/fede/admin/knowledge
 * @description Obtener base de conocimiento
 * @access Admin
 */
router.get('/admin/knowledge', roleMiddleware(['admin']), fedeController.getKnowledgeBase);

/**
 * @route POST /api/fede/admin/knowledge
 * @description Subir contenido a la base de conocimiento
 * @access Admin
 */
router.post('/admin/knowledge', roleMiddleware(['admin']), fedeController.uploadKnowledge);

/**
 * @route PUT /api/fede/admin/knowledge/:id
 * @description Actualizar entrada de conocimiento
 * @access Admin
 */
router.put('/admin/knowledge/:id', roleMiddleware(['admin']), fedeController.updateKnowledge);

/**
 * @route DELETE /api/fede/admin/knowledge/:id
 * @description Eliminar entrada de conocimiento
 * @access Admin
 */
router.delete('/admin/knowledge/:id', roleMiddleware(['admin']), fedeController.deleteKnowledge);

/**
 * @route GET /api/fede/admin/conversations
 * @description Obtener lista de conversaciones
 * @access Admin
 */
router.get('/admin/conversations', roleMiddleware(['admin']), fedeController.getConversations);

/**
 * @route GET /api/fede/admin/conversations/:id
 * @description Obtener detalles de una conversación
 * @access Admin
 */
router.get('/admin/conversations/:id', roleMiddleware(['admin']), fedeController.getConversationDetails);

module.exports = router;

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
