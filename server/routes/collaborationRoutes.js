import express from 'express';
import { createAgentGroup, getAgentGroups, getAgentGroupById, addAgentToGroup, removeAgentFromGroup, assignTaskToGroup, initiateCollaboration } from '../controllers/collaborationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/groups', authenticateToken, getAgentGroups);
router.get('/groups/:id', authenticateToken, getAgentGroupById);
router.post('/groups', authenticateToken, createAgentGroup);
router.post('/groups/:id/agents', authenticateToken, addAgentToGroup);
router.delete('/groups/:id/agents/:agentId', authenticateToken, removeAgentFromGroup);
router.post('/groups/:id/tasks', authenticateToken, assignTaskToGroup);
router.post('/initiate', authenticateToken, initiateCollaboration);

export default router;