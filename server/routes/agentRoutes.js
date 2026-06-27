import express from 'express';
import { getAllAgents, getAgentById, createAgent, updateAgent, deleteAgent, getMyAgents, updateAgentSkill } from '../controllers/agentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllAgents);
router.get('/my', authenticateToken, getMyAgents);
router.get('/:id', getAgentById);
router.post('/', authenticateToken, createAgent);
router.put('/:id', authenticateToken, updateAgent);
router.delete('/:id', authenticateToken, deleteAgent);
router.put('/:id/skills', authenticateToken, updateAgentSkill);

export default router;