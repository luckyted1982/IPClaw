import express from 'express';
import {
  createTaskExecution,
  startTaskExecution,
  updateTaskExecutionProgress,
  submitTaskExecution,
  completeTaskExecution,
  getTaskExecution,
  getAgentExecutions,
} from '../controllers/taskExecutionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createTaskExecution);
router.get('/:id', authenticateToken, getTaskExecution);
router.post('/:id/start', authenticateToken, startTaskExecution);
router.put('/:id/progress', authenticateToken, updateTaskExecutionProgress);
router.post('/:id/submit', authenticateToken, submitTaskExecution);
router.post('/:id/complete', authenticateToken, completeTaskExecution);
router.get('/agent/:agentId', authenticateToken, getAgentExecutions);

export default router;