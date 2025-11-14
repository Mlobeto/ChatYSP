const express = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

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
const roomIdValidation = [
  param('roomId')
    .isUUID()
    .withMessage('ID de sala inválido'),
];

// Room creation validation removed - now handled in admin routes

const updateRoomValidation = [
  ...roomIdValidation,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre de la sala debe tener entre 2 y 50 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('maxUsers')
    .optional()
    .isInt({ min: 2, max: 500 })
    .withMessage('Número máximo de usuarios debe estar entre 2 y 500'),
];

const joinRoomValidation = [
  ...roomIdValidation,
  body('password')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contraseña inválida'),
];

const getRoomsValidation = [
  query('type')
    .optional()
    .isIn(['all', 'public', 'private', 'game', 'chat'])
    .withMessage('Tipo de sala inválido'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número de página inválido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite inválido (máximo 50)'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Término de búsqueda inválido'),
];

// Routes
router.get(
  '/',
  authMiddleware,
  getRoomsValidation,
  validateRequest,
  roomController.getRooms,
);

// Note: Room creation moved to admin routes for security
// Only administrators can create rooms now

router.get(
  '/:roomId',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  roomController.getRoomById,
);

router.put(
  '/:roomId',
  authMiddleware,
  updateRoomValidation,
  validateRequest,
  roomController.updateRoom,
);

router.post(
  '/:roomId/join',
  authMiddleware,
  joinRoomValidation,
  validateRequest,
  roomController.joinRoom,
);

router.post(
  '/:roomId/leave',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  roomController.leaveRoom,
);

module.exports = router;
