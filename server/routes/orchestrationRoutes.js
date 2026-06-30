import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  startOrchestration,
  getExecutionStatus,
  cancelExecution,
  listCollaborationPatterns,
} from '../controllers/orchestrationController.js';

const router = express.Router();

router.post('/execute', authenticateToken, startOrchestration);
router.get('/executions/:executionId', authenticateToken, getExecutionStatus);
router.post('/executions/:executionId/cancel', authenticateToken, cancelExecution);
router.get('/patterns', authenticateToken, listCollaborationPatterns);

export default router;