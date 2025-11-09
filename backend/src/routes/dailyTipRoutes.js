const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dailyTipController = require('../controllers/dailyTipController');
const coachTipController = require('../controllers/coachTipController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Asegurar que el directorio de uploads existe
const uploadsDir = path.join(__dirname, '../../uploads/tips');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Directorio de uploads creado:', uploadsDir);
}

// Configuración de Multer para subida de archivos de tips base
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `daily-tips-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['text/plain', 'application/txt'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de texto (.txt)'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

// Todas las rutas requieren autenticación de admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * @route POST /api/daily-tips/generate
 * @desc Generar y enviar el tip del día
 * @access Admin
 */
router.post('/generate', dailyTipController.generateDailyTip);

/**
 * @route GET /api/daily-tips/today
 * @desc Obtener el tip de hoy
 * @access Admin
 */
router.get('/today', dailyTipController.getTodayTip);

/**
 * @route POST /api/daily-tips/regenerate
 * @desc Regenerar el tip de hoy
 * @access Admin
 */
router.post('/regenerate', dailyTipController.regenerateTodayTip);

/**
 * @route POST /api/daily-tips/resend
 * @desc Reenviar el tip de hoy por WhatsApp
 * @access Admin
 */
router.post('/resend', dailyTipController.resendTodayTip);

/**
 * @route GET /api/daily-tips/history
 * @desc Obtener historial de tips enviados
 * @access Admin
 */
router.get('/history', dailyTipController.getHistory);

/**
 * @route GET /api/daily-tips/stats
 * @desc Obtener estadísticas de tips diarios
 * @access Admin
 */
router.get('/stats', dailyTipController.getStats);

/**
 * @route GET /api/daily-tips/health
 * @desc Verificar estado del servicio
 * @access Admin
 */
router.get('/health', dailyTipController.healthCheck);

/**
 * @route POST /api/daily-tips/upload-multiple
 * @desc Cargar múltiples tips de coaching desde archivos TXT
 * @access Admin
 */
router.post(
  '/upload-multiple',
  upload.array('files', 200),
  coachTipController.uploadMultipleTipsFromFiles
);

/**
 * @route GET /api/daily-tips/coach-tips
 * @desc Obtener todos los tips de coaching (base)
 * @access Admin
 */
router.get('/coach-tips', coachTipController.getAllCoachTips);

module.exports = router;
