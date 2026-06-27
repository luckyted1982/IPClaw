import express from 'express';
import { uploadKnowledgeFile, getKnowledgeBases, getKnowledgeBaseById, updateKnowledgeBase, deleteKnowledgeBase, queryKnowledge, queryKnowledgeStream } from '../controllers/knowledgeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getKnowledgeBases);
router.get('/:id', authenticateToken, getKnowledgeBaseById);
router.post('/', authenticateToken, uploadKnowledgeFile);
router.put('/:id', authenticateToken, updateKnowledgeBase);
router.delete('/:id', authenticateToken, deleteKnowledgeBase);
router.post('/query', authenticateToken, queryKnowledge);
router.post('/query/stream', authenticateToken, queryKnowledgeStream);

export default router;