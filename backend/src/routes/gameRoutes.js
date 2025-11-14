const express = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const gameController = require('../controllers/gameController');
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

const createGameValidation = [
  ...roomIdValidation,
  body('gameType')
    .optional()
    .isIn(['trivia', 'quiz', 'challenge'])
    .withMessage('Tipo de juego inválido'),
  body('questionCount')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Número de preguntas debe estar entre 5 y 50'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificultad inválida'),
  body('category')
    .optional()
    .isIn(['general', 'sports', 'history', 'science', 'entertainment', 'geography'])
    .withMessage('Categoría inválida'),
];

const submitAnswerValidation = [
  ...roomIdValidation,
  body('answerIndex')
    .isInt({ min: 0, max: 5 })
    .withMessage('Índice de respuesta inválido'),
];

const quickCreateGameValidation = [
  body('category')
    .optional()
    .isString()
    .withMessage('Categoría inválida'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificultad inválida'),
  body('maxPlayers')
    .optional()
    .isInt({ min: 2, max: 10 })
    .withMessage('Número de jugadores debe estar entre 2 y 10'),
  body('questionsCount')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Número de preguntas debe estar entre 5 y 50'),
  body('timePerQuestion')
    .optional()
    .isInt({ min: 10, max: 120 })
    .withMessage('Tiempo por pregunta debe estar entre 10 y 120 segundos'),
];

// Routes
// Quick create: Create GameRoom and start game in one step
router.post(
  '/create',
  authMiddleware,
  quickCreateGameValidation,
  validateRequest,
  gameController.quickCreateGame,
);

router.post(
  '/rooms/:roomId/games',
  authMiddleware,
  createGameValidation,
  validateRequest,
  gameController.createGame,
);

router.post(
  '/rooms/:roomId/games/join',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  gameController.joinGame,
);

router.post(
  '/rooms/:roomId/games/start',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  gameController.startGame,
);

router.post(
  '/rooms/:roomId/games/answer',
  authMiddleware,
  submitAnswerValidation,
  validateRequest,
  gameController.submitAnswer,
);

router.post(
  '/rooms/:roomId/games/next',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  gameController.nextQuestion,
);

router.get(
  '/rooms/:roomId/games/status',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  gameController.getGameStatus,
);

router.delete(
  '/rooms/:roomId/games',
  authMiddleware,
  roomIdValidation,
  validateRequest,
  gameController.endGame,
);

module.exports = router;
