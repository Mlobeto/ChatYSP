const express = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin middleware - check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.',
    });
  }
  next();
};

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array(),
    });
  }
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
    .isIn(['general', 'sports', 'history', 'science', 'entertainment', 'geography'])
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
router.put('/users/:userId/role', updateUserRoleValidation, validateRequest, adminController.updateUserRole);
router.delete('/users/:userId', userIdValidation, validateRequest, adminController.deactivateUser);

// Room management routes
router.get('/rooms', paginationValidation, validateRequest, adminController.getRooms);
router.delete('/rooms/:roomId', roomIdValidation, validateRequest, adminController.deactivateRoom);

// Message management routes
router.get('/messages', paginationValidation, validateRequest, adminController.getMessages);
router.delete('/messages/:messageId', messageIdValidation, validateRequest, adminController.deleteMessage);

// Question management routes
router.post('/questions', createQuestionValidation, validateRequest, adminController.createQuestion);
router.put('/questions/:questionId', updateQuestionValidation, validateRequest, adminController.updateQuestion);
router.delete('/questions/:questionId', questionIdValidation, validateRequest, adminController.deleteQuestion);

module.exports = router;
