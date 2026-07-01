import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  chatWithExternalAgent,
  listAvailableAgents,
  listAdapterTypes,
  saveExternalAgentConfig,
  getExternalAgentConfig,
  listExternalAgentConfigs,
  deleteExternalAgentConfig,
  updateExternalAgentConfig,
  verifyAgentConnection,
  healthCheckAgent,
  executeTask,
  listModels,
  getAgentInfo,
  getConfig,
  registerAgent,
  discoverAgents,
} from '../controllers/externalAgentController.js';

const router = express.Router();

router.post('/chat', authenticateToken, chatWithExternalAgent);
router.get('/agents', authenticateToken, listAvailableAgents);
router.get('/adapters', authenticateToken, listAdapterTypes);
router.post('/verify', authenticateToken, verifyAgentConnection);
router.post('/health', authenticateToken, healthCheckAgent);
router.post('/task', authenticateToken, executeTask);
router.get('/models', authenticateToken, listModels);
router.post('/agent-info', authenticateToken, getAgentInfo);
router.post('/config-info', authenticateToken, getConfig);
router.post('/register', authenticateToken, registerAgent);
router.post('/discover', authenticateToken, discoverAgents);

router.post('/configs', authenticateToken, saveExternalAgentConfig);
router.get('/configs', authenticateToken, listExternalAgentConfigs);
router.get('/configs/:name', authenticateToken, getExternalAgentConfig);
router.put('/configs/:name', authenticateToken, updateExternalAgentConfig);
router.delete('/configs/:name', authenticateToken, deleteExternalAgentConfig);

export default router;