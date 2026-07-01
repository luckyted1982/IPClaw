import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { WebSocketServer } from 'ws';

import { patentAgentChat } from './patent-agent.js';
import { patentLayoutAgentChat } from './patent-layout-agent.js';
import { patentDraftingAgentChat } from './patent-drafting-agent.js';
import { ftoAgentChat } from './fto-agent.js';
import { patentNavigationAgentChat } from './patent-navigation-agent.js';
import { patentFeeAgentChat } from './patent-fee-agent.js';
import { patentRightsAgentChat } from './patent-rights-agent.js';
import { trademarkSearchAgentChat } from './trademark-search-agent.js';
import { trademarkRegistrationAgentChat } from './trademark-registration-agent.js';
import { trademarkMonitoringAgentChat } from './trademark-monitoring-agent.js';
import { trademarkRightsAgentChat } from './trademark-rights-agent.js';
import { dataipRegistrationAgentChat } from './dataip-registration-agent.js';
import { dataipRightsAgentChat } from './dataip-rights-agent.js';
import { dataipComplianceAgentChat } from './dataip-compliance-agent.js';
import { dataipTradingAgentChat } from './dataip-trading-agent.js';
import { copyrightRegistrationAgentChat } from './copyright-registration-agent.js';
import { copyrightMonitoringAgentChat } from './copyright-monitoring-agent.js';
import { copyrightRightsAgentChat } from './copyright-rights-agent.js';
import { copyrightOperationAgentChat } from './copyright-operation-agent.js';
import { tradeSecretIdentificationAgentChat } from './trade-secret-identification-agent.js';
import { tradeSecretProtectionAgentChat } from './trade-secret-protection-agent.js';
import { tradeSecretInvestigationAgentChat } from './trade-secret-investigation-agent.js';
import { tradeSecretLitigationAgentChat } from './trade-secret-litigation-agent.js';
import { ipValuationAgentChat } from './ip-valuation-agent.js';
import { ipSecuritizationAgentChat } from './ip-securitization-agent.js';
import { ipPledgeAgentChat } from './ip-pledge-agent.js';
import { ipEquityAgentChat } from './ip-equity-agent.js';
import { ipInsuranceAgentChat } from './ip-insurance-agent.js';
import { ipDealAgentChat } from './ip-deal-agent.js';
import { skillMarketAgentChat } from './skill-market-agent.js';
import { skillBuilderHandler } from './skill-builder-agent.js';

import authRoutes from './routes/authRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import agentChatRoutes from './routes/agentChatRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import taskExecutionRoutes from './routes/taskExecutionRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import adminCreditRoutes from './routes/adminCreditRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import orchestrationRoutes from './routes/orchestrationRoutes.js';
import externalAgentRoutes from './routes/externalAgentRoutes.js';
import officeActionRoutes from './routes/officeActionRoutes.js';
import { callModel, listModels, addModelConfig, updateModelConfig, deleteModelConfig } from './lib/modelGateway.js';
import { registerClient, unregisterClient, createNotification } from './controllers/notificationController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import { setupCommunityWebSocket } from './community-websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3002;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://43.163.125.222', 'https://43.163.125.222'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3004', 'http://localhost:3006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(limiter);
app.use(logger);

import fileUpload from 'express-fileupload';
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const PATSEEK_API_KEY = process.env.PATSEEK_API_KEY || 'ps_0931e2efa48df3aa2596de57c27d9449';

if (!DEEPSEEK_API_KEY) {
  console.error('Error: DEEPSEEK_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('PatSeek API Key:', PATSEEK_API_KEY.substring(0, 10) + '...');

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/agents', agentChatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-executions', taskExecutionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/admin/credits', adminCreditRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/orchestration', orchestrationRoutes);
app.use('/api/external-agents', externalAgentRoutes);
app.use('/api/office-action', officeActionRoutes);

app.get('/api/models', async (req, res) => {
  try {
    const models = await listModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/models', async (req, res) => {
  try {
    const config = await addModelConfig(req.body);
    res.status(201).json(config);
  } catch (error) {
    console.error('Error adding model:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/models/:name', async (req, res) => {
  try {
    const config = await updateModelConfig(req.params.name, req.body);
    res.json(config);
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/models/:name', async (req, res) => {
  try {
    await deleteModelConfig(req.params.name);
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { messages, model, temperature = 0.7, stream = true } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  try {
    const response = await callModel(model || 'deepseek', messages, {
      temperature,
      stream,
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      response.body.pipe(res);

      response.body.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/patent-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await patentAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Patent agent error:', error); res.status(500).json({ error: 'Patent agent error', details: error.message }); }
});

app.post('/api/patent-layout-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await patentLayoutAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Patent layout agent error:', error); res.status(500).json({ error: 'Patent layout agent error', details: error.message }); }
});

app.post('/api/patent-drafting-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await patentDraftingAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Patent drafting agent error:', error); res.status(500).json({ error: 'Patent drafting agent error', details: error.message }); }
});

app.post('/api/fto-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ftoAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('FTO agent error:', error); res.status(500).json({ error: 'FTO agent error', details: error.message }); }
});

app.post('/api/patent-navigation-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await patentNavigationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Patent navigation agent error:', error); res.status(500).json({ error: 'Patent navigation agent error', details: error.message }); }
});

app.post('/api/patent-fee-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await patentFeeAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Patent fee agent error:', error); res.status(500).json({ error: 'Patent fee agent error', details: error.message }); }
});

app.post('/api/patent-rights-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await patentRightsAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Patent rights agent error:', error); res.status(500).json({ error: 'Patent rights agent error', details: error.message }); }
});

app.post('/api/trademark-search-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await trademarkSearchAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trademark search agent error:', error); res.status(500).json({ error: 'Trademark search agent error', details: error.message }); }
});

app.post('/api/trademark-registration-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await trademarkRegistrationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trademark registration agent error:', error); res.status(500).json({ error: 'Trademark registration agent error', details: error.message }); }
});

app.post('/api/trademark-monitoring-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await trademarkMonitoringAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trademark monitoring agent error:', error); res.status(500).json({ error: 'Trademark monitoring agent error', details: error.message }); }
});

app.post('/api/trademark-rights-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await trademarkRightsAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trademark rights agent error:', error); res.status(500).json({ error: 'Trademark rights agent error', details: error.message }); }
});

app.post('/api/dataip-registration-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await dataipRegistrationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('DataIP registration agent error:', error); res.status(500).json({ error: 'DataIP registration agent error', details: error.message }); }
});

app.post('/api/dataip-rights-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await dataipRightsAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('DataIP rights agent error:', error); res.status(500).json({ error: 'DataIP rights agent error', details: error.message }); }
});

app.post('/api/dataip-compliance-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await dataipComplianceAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('DataIP compliance agent error:', error); res.status(500).json({ error: 'DataIP compliance agent error', details: error.message }); }
});

app.post('/api/dataip-trading-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await dataipTradingAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('DataIP trading agent error:', error); res.status(500).json({ error: 'DataIP trading agent error', details: error.message }); }
});

app.post('/api/copyright-registration-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await copyrightRegistrationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Copyright registration agent error:', error); res.status(500).json({ error: 'Copyright registration agent error', details: error.message }); }
});

app.post('/api/copyright-monitoring-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await copyrightMonitoringAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Copyright monitoring agent error:', error); res.status(500).json({ error: 'Copyright monitoring agent error', details: error.message }); }
});

app.post('/api/copyright-rights-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await copyrightRightsAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Copyright rights agent error:', error); res.status(500).json({ error: 'Copyright rights agent error', details: error.message }); }
});

app.post('/api/copyright-operation-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await copyrightOperationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Copyright operation agent error:', error); res.status(500).json({ error: 'Copyright operation agent error', details: error.message }); }
});

app.post('/api/trade-secret-identification-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await tradeSecretIdentificationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trade secret identification agent error:', error); res.status(500).json({ error: 'Trade secret identification agent error', details: error.message }); }
});

app.post('/api/trade-secret-protection-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await tradeSecretProtectionAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trade secret protection agent error:', error); res.status(500).json({ error: 'Trade secret protection agent error', details: error.message }); }
});

app.post('/api/trade-secret-investigation-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await tradeSecretInvestigationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trade secret investigation agent error:', error); res.status(500).json({ error: 'Trade secret investigation agent error', details: error.message }); }
});

app.post('/api/trade-secret-litigation-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await tradeSecretLitigationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Trade secret litigation agent error:', error); res.status(500).json({ error: 'Trade secret litigation agent error', details: error.message }); }
});

app.post('/api/ip-valuation-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ipValuationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('IP valuation agent error:', error); res.status(500).json({ error: 'IP valuation agent error', details: error.message }); }
});

app.post('/api/ip-securitization-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ipSecuritizationAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('IP securitization agent error:', error); res.status(500).json({ error: 'IP securitization agent error', details: error.message }); }
});

app.post('/api/ip-pledge-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ipPledgeAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('IP pledge agent error:', error); res.status(500).json({ error: 'IP pledge agent error', details: error.message }); }
});

app.post('/api/ip-equity-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ipEquityAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('IP equity agent error:', error); res.status(500).json({ error: 'IP equity agent error', details: error.message }); }
});

app.post('/api/ip-insurance-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ipInsuranceAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('IP insurance agent error:', error); res.status(500).json({ error: 'IP insurance agent error', details: error.message }); }
});

app.post('/api/ip-deal-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await ipDealAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('IP deal agent error:', error); res.status(500).json({ error: 'IP deal agent error', details: error.message }); }
});

app.post('/api/skill-market-agent', async (req, res) => {
  const { messages, stream = false } = req.body;
  if (!messages || !Array.isArray(messages)) { return res.status(400).json({ error: 'messages must be an array' }); }
  try {
    const result = await skillMarketAgentChat(messages, stream);
    if (stream) { res.setHeader('Content-Type', 'text/event-stream'); res.setHeader('Cache-Control', 'no-cache'); res.setHeader('Connection', 'keep-alive'); result.pipe(res); }
    else { res.json({ content: result }); }
  } catch (error) { console.error('Skill market agent error:', error); res.status(500).json({ error: 'Skill market agent error', details: error.message }); }
});

app.post('/api/skill-builder', skillBuilderHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

setupCommunityWebSocket(wss);

wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url.slice(1));
  const userId = urlParams.get('userId');

  if (userId) {
    registerClient(userId, ws);
    console.log(`WebSocket client connected: ${userId}`);
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        registerClient(data.userId, ws);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (userId) {
      unregisterClient(userId, ws);
      console.log(`WebSocket client disconnected: ${userId}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`IPClaw server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Using DeepSeek model: ${DEEPSEEK_MODEL}`);
});