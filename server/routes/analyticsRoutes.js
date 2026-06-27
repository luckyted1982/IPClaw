import express from 'express';
import { getAgentPerformance, getTaskStatistics, getTransactionReport, getUserAnalytics, getDashboardData } from '../controllers/analyticsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/agent-performance', authenticateToken, getAgentPerformance);
router.get('/task-statistics', authenticateToken, getTaskStatistics);
router.get('/transaction-report', authenticateToken, getTransactionReport);
router.get('/user-analytics', authenticateToken, getUserAnalytics);
router.get('/dashboard', authenticateToken, requireRole('admin'), getDashboardData);

export default router;