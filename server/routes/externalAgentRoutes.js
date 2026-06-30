import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  chatWithExternalAgent,
  listAvailableAgents,
  listAdapterTypes,
  saveExternalAgentConfig,
  getExternalAgentConfig,
  listExternalAgentConfigs,
  deleteExternalAgentConfig,
} from '../controllers/externalAgentController.js';

const router = express.Router();

router.post('/chat', authenticateToken, chatWithExternalAgent);
router.get('/agents', authenticateToken, listAvailableAgents);
router.get('/adapters', authenticateToken, listAdapterTypes);

router.post('/configs', authenticateToken, saveExternalAgentConfig);
router.get('/configs', authenticateToken, listExternalAgentConfigs);
router.get('/configs/:name', authenticateToken, getExternalAgentConfig);
router.delete('/configs/:name', authenticateToken, deleteExternalAgentConfig);

export default router;