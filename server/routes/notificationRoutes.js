import express from 'express';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getUnreadCount } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getUserNotifications);
router.get('/unread-count', authenticateToken, getUnreadCount);
router.put('/:id/read', authenticateToken, markNotificationAsRead);
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);
router.delete('/:id', authenticateToken, deleteNotification);

export default router;