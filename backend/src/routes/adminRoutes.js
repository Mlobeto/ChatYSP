const express = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin middleware - check if user is admin
const adminMiddleware = (req, res, next) => {
  console.log('🔐 [ADMIN MIDDLEWARE] Verificando permisos de admin...');
  console.log('👤 Usuario actual:', {
    id: req.user ? req.user.id : 'undefined',
    username: req.user ? req.user.username : 'undefined',
    role: req.user ? req.user.role : 'undefined',
  });

  if (req.user.role !== 'admin') {
    console.log('❌ [ADMIN MIDDLEWARE] Acceso denegado - no es admin');
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.',
    });
  }

  console.log('✅ [ADMIN MIDDLEWARE] Usuario admin verificado');
  next();
};

// Validation middleware
const validateRequest = (req, res, next) => {
  console.log('📝 [VALIDATION MIDDLEWARE] Validando request...');
  console.log('📋 Body a validar:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ [VALIDATION MIDDLEWARE] Errores de validación:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array(),
    });
  }

  console.log('✅ [VALIDATION MIDDLEWARE] Validación exitosa');
  next();
};

// Validation rules
const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('ID de usuario inválido'),
];

const roomIdValidation = [
  param('roomId')
    .isUUID()
    .withMessage('ID de sala inválido'),
];

const messageIdValidation = [
  param('messageId')
    .isUUID()
    .withMessage('ID de mensaje inválido'),
];

const questionIdValidation = [
  param('questionId')
    .isUUID()
    .withMessage('ID de pregunta inválido'),
];

const updateUserRoleValidation = [
  ...userIdValidation,
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Rol inválido'),
];

const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username debe tener entre 3 y 20 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  body('role')
    .optional()
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Rol inválido'),
  body('country')
    .optional()
    .isIn(['AR', 'PE', 'MX', 'CO', 'ES'])
    .withMessage('País inválido'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Número de teléfono inválido'),
  body('sendWelcomeEmail')
    .optional()
    .isBoolean()
    .withMessage('sendWelcomeEmail debe ser booleano'),
];

const updateUserValidation = [
  ...userIdValidation,
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username debe tener entre 3 y 20 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido'),
  body('role')
    .optional()
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Rol inválido'),
  body('country')
    .optional()
    .isIn(['AR', 'PE', 'MX', 'CO', 'ES'])
    .withMessage('País inválido'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Número de teléfono inválido'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número de página inválido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite inválido (máximo 100)'),
];

const createQuestionValidation = [
  body('question')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La pregunta debe tener entre 10 y 500 caracteres'),
  body('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Debe haber entre 2 y 6 opciones'),
  body('correctAnswer')
    .isInt({ min: 0, max: 5 })
    .withMessage('Respuesta correcta inválida'),
  body('category')
    .isIn(['coaching', 'bienestar', 'general', 'tecnologia'])
    .withMessage('Categoría inválida'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificultad inválida'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Puntos deben estar entre 1 y 100'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
];

const updateQuestionValidation = [
  ...questionIdValidation,
  body('question')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La pregunta debe tener entre 10 y 500 caracteres'),
  body('options')
    .optional()
    .isArray({ min: 2, max: 6 })
    .withMessage('Debe haber entre 2 y 6 opciones'),
  body('correctAnswer')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Respuesta correcta inválida'),
  body('category')
    .optional()
    .isIn(['general', 'sports', 'history', 'science', 'entertainment', 'geography'])
    .withMessage('Categoría inválida'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificultad inválida'),
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Puntos deben estar entre 1 y 100'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser booleano'),
];

// Apply middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Statistics routes
router.get('/stats', adminController.getStats);

// User management routes
router.get('/users', paginationValidation, validateRequest, adminController.getUsers);
router.post(
  '/users',
  createUserValidation,
  validateRequest,
  adminController.createUser,
);
router.put(
  '/users/:userId',
  updateUserValidation,
  validateRequest,
  adminController.updateUser,
);
router.put(
  '/users/:userId/role',
  updateUserRoleValidation,
  validateRequest,
  adminController.updateUserRole,
);
router.delete('/users/:userId', userIdValidation, validateRequest, adminController.deleteUser);

// Room management routes
router.get('/rooms', paginationValidation, validateRequest, adminController.getRooms);
router.post('/rooms', [
  (req, res, next) => {
    console.log('🚀 [ADMIN ROUTES] POST /api/admin/rooms - Request recibida');
    console.log('📥 Headers:', req.headers);
    console.log('📦 Body raw:', req.body);
    next();
  },
  body('name')
    .notEmpty()
    .withMessage('El nombre de la sala es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('roomType')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Tipo de sala debe ser public o private'),
  body('maxUsers')
    .optional()
    .isInt({ min: 2, max: 500 })
    .withMessage('Máximo de usuarios debe estar entre 2 y 500'),
  body('country')
    .optional()
    .isIn(['AR', 'PE', 'MX', 'CO', 'ES'])
    .withMessage('País debe ser AR, PE, MX, CO o ES'),
  body('password')
    .optional()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe tener entre 4 y 20 caracteres'),
], validateRequest, adminController.createRoom);

// Moderator management routes
router.put('/users/:userId/moderator', [
  param('userId').isUUID().withMessage('ID de usuario inválido'),
  body('country')
    .isIn(['AR', 'PE', 'MX', 'CO', 'ES'])
    .withMessage('País debe ser AR, PE, MX, CO o ES'),
], validateRequest, adminController.assignModerator);

// Get rooms without moderator assigned
router.get('/rooms/unassigned', [
  query('country')
    .optional()
    .isIn(['AR', 'PE', 'MX', 'CO', 'ES'])
    .withMessage('País debe ser AR, PE, MX, CO o ES'),
], validateRequest, adminController.getUnassignedRooms);

// Country room creation
router.post('/rooms/country', [
  body('name')
    .notEmpty()
    .withMessage('El nombre de la sala es requerido')
    .isLength({ min: 3, max: 40 })
    .withMessage('El nombre debe tener entre 3 y 40 caracteres'),
  body('country')
    .isIn(['AR', 'PE', 'MX', 'CO', 'ES'])
    .withMessage('País debe ser AR, PE, MX, CO o ES'),
  body('moderatorId')
    .optional()
    .isUUID()
    .withMessage('ID de moderador inválido'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
], validateRequest, adminController.createCountryRoom);

router.delete('/rooms/:roomId', roomIdValidation, validateRequest, adminController.deactivateRoom);

// Message management routes
router.get('/messages', paginationValidation, validateRequest, adminController.getMessages);
router.delete(
  '/messages/:messageId',
  messageIdValidation,
  validateRequest,
  adminController.deleteMessage,
);

// Question management routes
router.post(
  '/questions',
  createQuestionValidation,
  validateRequest,
  adminController.createQuestion,
);
router.put(
  '/questions/:questionId',
  updateQuestionValidation,
  validateRequest,
  adminController.updateQuestion,
);
router.delete(
  '/questions/:questionId',
  questionIdValidation,
  validateRequest,
  adminController.deleteQuestion,
);

module.exports = router;
