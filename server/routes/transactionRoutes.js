import express from 'express';
import { createTransaction, getTransactions, getTransactionById, updateTransactionStatus, getUserBalance, updateUserBalance } from '../controllers/transactionController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getTransactions);
router.get('/:id', authenticateToken, getTransactionById);
router.post('/', authenticateToken, createTransaction);
router.put('/:id/status', authenticateToken, requireRole('admin'), updateTransactionStatus);
router.get('/user/balance', authenticateToken, getUserBalance);
router.post('/user/balance', authenticateToken, updateUserBalance);

export default router;