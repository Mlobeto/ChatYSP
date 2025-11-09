const express = require('express');
const { body, query, param } = require('express-validator');
const multer = require('multer');
const path = require('path');
const tipController = require('../controllers/tipController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { validate } = require('../utils/validation');

const router = express.Router();

// Configuración de Multer para subida de archivos
const fs = require('fs');

// Asegurar que el directorio existe
const uploadDir = path.join(__dirname, '../../uploads/tips');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `tips-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir archivos de texto
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

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// Validaciones
const validateTipCreation = [
  body('content')
    .isLength({ min: 10, max: 500 })
    .withMessage('El contenido debe tener entre 10 y 500 caracteres'),
  body('category')
    .optional()
    .isIn(['game', 'chat', 'general', 'ai'])
    .withMessage('Categoría inválida'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Dificultad inválida'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada tag debe ser un string de 1-50 caracteres'),
];

const validateTipUpdate = [
  body('content')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('El contenido debe tener entre 10 y 500 caracteres'),
  body('category')
    .optional()
    .isIn(['game', 'chat', 'general', 'ai'])
    .withMessage('Categoría inválida'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Dificultad inválida'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada tag debe ser un string de 1-50 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
];

const validateTipQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100'),
  query('category')
    .optional()
    .isIn(['game', 'chat', 'general', 'ai'])
    .withMessage('Categoría inválida'),
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Dificultad inválida'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  query('search')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe ser un string entre 1 y 100 caracteres'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'createdAt', 'views', 'likes', 'content', 'title'])
    .withMessage('Campo de ordenación inválido'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('Orden inválido'),
];

const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
];

// Rutas públicas (solo lectura)
/**
 * @route GET /api/tips
 * @desc Obtener todos los tips con filtros
 * @access Private
 */
router.get('/', validateTipQuery, validate, tipController.getAllTips);

/**
 * @route GET /api/tips/random
 * @desc Obtener tips aleatorios
 * @access Private
 */
router.get(
  '/random',
  query('category').optional().isIn(['game', 'chat', 'general', 'ai']),
  query('limit').optional().isInt({ min: 1, max: 10 }),
  validate,
  tipController.getRandomTips,
);

/**
 * @route GET /api/tips/stats
 * @desc Obtener estadísticas de tips
 * @access Private (Admin/Moderator)
 */
router.get(
  '/stats',
  roleMiddleware(['admin', 'moderator']),
  tipController.getTipsStats,
);

/**
 * @route GET /api/tips/:id
 * @desc Obtener un tip por ID
 * @access Private
 */
router.get('/:id', validateUUID, validate, tipController.getTipById);

// Rutas de escritura (requieren permisos)
/**
 * @route POST /api/tips
 * @desc Crear un nuevo tip
 * @access Private (Admin/Moderator)
 */
router.post(
  '/',
  roleMiddleware(['admin', 'moderator']),
  validateTipCreation,
  validate,
  tipController.createTip,
);

/**
 * @route PUT /api/tips/:id
 * @desc Actualizar un tip
 * @access Private (Admin/Moderator/Owner)
 */
router.put(
  '/:id',
  validateUUID,
  validateTipUpdate,
  validate,
  tipController.updateTip,
);

/**
 * @route DELETE /api/tips/:id
 * @desc Eliminar un tip
 * @access Private (Admin/Owner)
 */
router.delete(
  '/:id',
  validateUUID,
  validate,
  tipController.deleteTip,
);

/**
 * @route POST /api/tips/:id/like
 * @desc Dar like a un tip
 * @access Private
 */
router.post(
  '/:id/like',
  validateUUID,
  validate,
  tipController.likeTip,
);

/**
 * @route POST /api/tips/upload
 * @desc Cargar tips desde archivo TXT
 * @access Private (Admin)
 */
router.post(
  '/upload',
  roleMiddleware(['admin']),
  upload.single('file'),
  tipController.uploadTipsFromFile,
);

/**
 * @route POST /api/tips/upload-multiple
 * @desc Cargar múltiples tips desde archivos TXT
 * @access Private (Admin)
 */
router.post(
  '/upload-multiple',
  roleMiddleware(['admin']),
  upload.array('files', 200), // Hasta 200 archivos
  tipController.uploadMultipleTipsFromFiles,
);

module.exports = router;
