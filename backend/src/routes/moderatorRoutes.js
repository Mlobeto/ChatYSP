const express = require('express');
const { body, query, validationResult } = require('express-validator');
const moderatorController = require('../controllers/moderatorController');
const authMiddleware = require('../middlewares/authMiddleware');
const { moderatorMiddleware, countryMiddleware } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Apply auth and moderator middleware to all routes
router.use(authMiddleware);
router.use(moderatorMiddleware);

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
const reportValidation = [
  body('type')
    .isIn(['user', 'room', 'message'])
    .withMessage('Tipo de reporte debe ser user, room o message'),
  body('targetId').isUUID().withMessage('ID objetivo inválido'),
  body('reason')
    .isIn(['spam', 'inappropriate', 'harassment', 'other'])
    .withMessage('Razón debe ser spam, inappropriate, harassment u other'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
];

// Routes
router.post('/reports', reportValidation, validateRequest, moderatorController.createReport);

router.get(
  '/users',
  paginationValidation,
  validateRequest,
  countryMiddleware,
  moderatorController.getUsers,
);

router.get(
  '/rooms',
  paginationValidation,
  validateRequest,
  countryMiddleware,
  moderatorController.getRooms,
);

router.get(
  '/messages',
  paginationValidation,
  validateRequest,
  countryMiddleware,
  moderatorController.getMessages,
);

module.exports = router;
