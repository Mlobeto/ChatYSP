const express = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const gameRoomController = require('../controllers/gameRoomController');
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
const gameRoomIdValidation = [
  param('gameRoomId')
    .isUUID()
    .withMessage('ID de sala de juego inválido'),
];

const createGameRoomValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('gameType')
    .optional()
    .isIn(['trivia', 'quiz', 'challenge'])
    .withMessage('Tipo de juego inválido'),
  body('category')
    .optional()
    .isIn(['coaching', 'bienestar', 'general', 'tecnologia'])
    .withMessage('Categoría inválida'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Dificultad inválida'),
  body('maxPlayers')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('Número de jugadores debe estar entre 2 y 20'),
  body('questionCount')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Número de preguntas debe estar entre 5 y 50'),
  body('timePerQuestion')
    .optional()
    .isInt({ min: 10000, max: 120000 })
    .withMessage('Tiempo por pregunta debe estar entre 10 y 120 segundos'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate debe ser un booleano'),
];

const sendInvitationValidation = [
  ...gameRoomIdValidation,
  body('invitedUserId')
    .isUUID()
    .withMessage('ID de usuario invitado inválido'),
  body('message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('El mensaje no puede exceder 200 caracteres'),
];

const invitationIdValidation = [
  param('invitationId')
    .isUUID()
    .withMessage('ID de invitación inválido'),
];

const respondInvitationValidation = [
  ...invitationIdValidation,
  body('response')
    .isIn(['accepted', 'declined'])
    .withMessage('Respuesta debe ser "accepted" o "declined"'),
];

const submitAnswerValidation = [
  ...gameRoomIdValidation,
  body('answerIndex')
    .isInt({ min: 0, max: 5 })
    .withMessage('Índice de respuesta inválido'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
];

const leaderboardValidation = [
  query('timeframe')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'allTime'])
    .withMessage('Timeframe inválido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Límite debe estar entre 1 y 200'),
];

// Game Room Management Routes
router.post(
  '/',
  authMiddleware,
  createGameRoomValidation,
  validateRequest,
  gameRoomController.createGameRoom,
);

router.get(
  '/',
  authMiddleware,
  paginationValidation,
  validateRequest,
  gameRoomController.getGameRooms,
);

router.post(
  '/:gameRoomId/join',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameRoomController.joinGameRoom,
);

router.delete(
  '/:gameRoomId/leave',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameRoomController.leaveGameRoom,
);

router.get(
  '/:gameRoomId/members',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameRoomController.getGameRoomMembers,
);

// Invitation Routes
router.post(
  '/:gameRoomId/invite',
  authMiddleware,
  sendInvitationValidation,
  validateRequest,
  gameRoomController.sendInvitation,
);

router.get(
  '/invitations',
  authMiddleware,
  validateRequest,
  gameRoomController.getInvitations,
);

router.post(
  '/invitations/:invitationId/respond',
  authMiddleware,
  respondInvitationValidation,
  validateRequest,
  gameRoomController.respondToInvitation,
);

// Game Session Routes (within GameRooms)
router.post(
  '/:gameRoomId/games/create',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameController.createGame,
);

router.post(
  '/:gameRoomId/games/join',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameController.joinGame,
);

router.post(
  '/:gameRoomId/games/start',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameController.startGame,
);

router.post(
  '/:gameRoomId/games/answer',
  authMiddleware,
  submitAnswerValidation,
  validateRequest,
  gameController.submitAnswer,
);

router.post(
  '/:gameRoomId/games/next',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameController.nextQuestion,
);

router.get(
  '/:gameRoomId/games/status',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameController.getGameStatus,
);

router.delete(
  '/:gameRoomId/games',
  authMiddleware,
  gameRoomIdValidation,
  validateRequest,
  gameController.endGame,
);

// Leaderboard Routes
router.get(
  '/leaderboard',
  authMiddleware,
  leaderboardValidation,
  validateRequest,
  gameRoomController.getLeaderboard,
);

module.exports = router;
