import express from 'express';
import { createTask, getAllTasks, getTaskById, getMyTasks, updateTaskStatus, deleteTask, submitBid, acceptBid } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCreateTask, sanitizeRequestBody } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getAllTasks);
router.get('/my', authenticateToken, getMyTasks);
router.get('/:id', authenticateToken, getTaskById);
router.post('/', authenticateToken, sanitizeRequestBody, validateCreateTask, createTask);
router.put('/:id/status', authenticateToken, updateTaskStatus);
router.delete('/:id', authenticateToken, deleteTask);
router.post('/:id/bids', authenticateToken, submitBid);
router.post('/:id/bids/accept', authenticateToken, acceptBid);

export default router;