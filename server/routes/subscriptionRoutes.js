import express from 'express';
import {
  getPlans,
  getMySubscription,
  subscribe,
  cancelSubscription,
} from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/plans', getPlans);
router.get('/my', authenticateToken, getMySubscription);
router.post('/subscribe', authenticateToken, subscribe);
router.post('/cancel', authenticateToken, cancelSubscription);

export default router;
