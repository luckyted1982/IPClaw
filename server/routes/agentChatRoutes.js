import express from 'express';
import { executeAgentChat } from '../agent-engine/AgentExecutor.js';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.post('/:id/chat', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { messages, stream = false } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  try {
    const result = await executeAgentChat(id, messages, {
      stream,
      userId: req.user.id,
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      result.pipe(res);
    } else {
      res.json({ content: result });
    }
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({ error: 'Agent chat error', details: error.message });
  }
});

router.get('/:id/conversations', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const conversations = await prisma.conversation.findMany({
      where: { agentId: id, userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/:id/messages/:conversationId', authenticateToken, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
