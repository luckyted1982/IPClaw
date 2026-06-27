import prisma from '../lib/prisma.js';
import { callModel } from '../lib/modelGateway.js';

export async function createConversation(req, res) {
  try {
    const { agentId, title } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: title || agent.name,
        userId: req.user.id,
        agentId,
        messages: JSON.stringify([]),
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getConversations(req, res) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.id },
      include: {
        agent: { select: { name: true, avatar: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getConversationById(req, res) {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        agent: { select: { name: true, avatar: true } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteConversation(req, res) {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.conversation.delete({ where: { id } });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let messages = [];
    try {
      messages = conversation.messages ? JSON.parse(conversation.messages) : [];
    } catch {
      messages = [];
    }

    messages.push({
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    });

    await prisma.conversation.update({
      where: { id },
      data: {
        messages: JSON.stringify(messages),
        updatedAt: new Date(),
      },
    });

    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function sendMessageStream(req, res) {
  try {
    const { id } = req.params;
    const { content, model = 'default' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let messages = [];
    try {
      messages = conversation.messages ? JSON.parse(conversation.messages) : [];
    } catch {
      messages = [];
    }

    messages.push({
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    });

    const systemPrompt = conversation.agent.systemPrompt || '';

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let assistantContent = '';

    const stream = await callModel(model, content, {
      systemPrompt,
      history: messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk && chunk.content) {
        assistantContent += chunk.content;
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      }
    }

    messages.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assistantContent,
      timestamp: new Date().toISOString(),
    });

    await prisma.conversation.update({
      where: { id },
      data: {
        messages: JSON.stringify(messages),
        updatedAt: new Date(),
      },
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Send message stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}

export async function getMessages(req, res) {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let messages = [];
    try {
      messages = conversation.messages ? JSON.parse(conversation.messages) : [];
    } catch {
      messages = [];
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}