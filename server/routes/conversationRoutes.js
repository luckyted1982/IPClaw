import express from 'express';
import { createConversation, getConversations, getConversationById, deleteConversation, sendMessage, sendMessageStream, getMessages } from '../controllers/conversationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getConversations);
router.post('/', authenticateToken, createConversation);
router.get('/:id', authenticateToken, getConversationById);
router.delete('/:id', authenticateToken, deleteConversation);
router.post('/:id/messages', authenticateToken, sendMessage);
router.post('/:id/messages/stream', authenticateToken, sendMessageStream);
router.get('/:id/messages', authenticateToken, getMessages);

export default router;