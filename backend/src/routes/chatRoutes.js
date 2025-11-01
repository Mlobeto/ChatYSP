const express = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const chatController = require('../controllers/chatController');
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

const messageIdValidation = [
  param('messageId')
    .isUUID()
    .withMessage('ID de mensaje inválido'),
];

const sendMessageValidation = [
  ...roomIdValidation,
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'system', 'game', 'ai'])
    .withMessage('Tipo de mensaje inválido'),
  body('replyToId')
    .optional()
    .isUUID()
    .withMessage('ID de mensaje de respuesta inválido'),
];

const editMessageValidation = [
  ...messageIdValidation,
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
];

const addReactionValidation = [
  ...messageIdValidation,
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji inválido'),
];

const getMessagesValidation = [
  ...roomIdValidation,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número de página inválido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite inválido (máximo 100)'),
];

// Routes
router.get(
  '/rooms/:roomId/messages',
  authMiddleware,
  getMessagesValidation,
  validateRequest,
  chatController.getMessages,
);

router.post(
  '/rooms/:roomId/messages',
  authMiddleware,
  sendMessageValidation,
  validateRequest,
  chatController.sendMessage,
);

router.put(
  '/messages/:messageId',
  authMiddleware,
  editMessageValidation,
  validateRequest,
  chatController.editMessage,
);

router.delete(
  '/messages/:messageId',
  authMiddleware,
  messageIdValidation,
  validateRequest,
  chatController.deleteMessage,
);

router.post(
  '/messages/:messageId/reactions',
  authMiddleware,
  addReactionValidation,
  validateRequest,
  chatController.addReaction,
);

module.exports = router;
