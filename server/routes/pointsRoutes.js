import express from 'express';
import {
  getPointsBalance,
  dailyCheckIn,
  getPointsHistory,
  addPoints,
  consumePoints,
  getCheckInStats,
  getPointsRules,
} from '../controllers/pointsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/balance', authenticateToken, getPointsBalance);
router.post('/checkin', authenticateToken, dailyCheckIn);
router.get('/history', authenticateToken, getPointsHistory);
router.post('/add', authenticateToken, addPoints);
router.post('/consume', authenticateToken, consumePoints);
router.get('/checkin-stats', authenticateToken, getCheckInStats);
router.get('/rules', getPointsRules);

export default router;
