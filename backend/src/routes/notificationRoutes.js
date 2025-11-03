const express = require('express');

const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotification,
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para usuarios normales
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

// Rutas para administradores
router.post('/', roleMiddleware(['admin']), createNotification);
router.post('/bulk', roleMiddleware(['admin']), createBulkNotification);

module.exports = router;