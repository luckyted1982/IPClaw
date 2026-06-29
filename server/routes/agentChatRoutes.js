import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { executeAgentChat } from '../agent-engine/AgentExecutor.js';

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

router.get('/:id/export/conversation/:conversationId/docx', authenticateToken, async (req, res) => {
  const { id: agentId, conversationId } = req.params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        agent: true,
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doc = new Document({
      title: `对话记录 - ${conversation.agent.name}`,
      creator: conversation.user.name,
      description: `与 ${conversation.agent.name} 的对话记录`,
    });

    doc.addSection({
      properties: {},
      children: [
        new Paragraph({
          text: `对话记录 - ${conversation.agent.name}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: `智能体：${conversation.agent.name}`,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `智能体：${conversation.agent.name}`,
              bold: true,
            }),
            new TextRun({
              text: ` (${conversation.agent.title || conversation.agent.category})`,
            }),
          ],
        }),

        new Paragraph({
          text: `用户：${conversation.user.name}`,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `用户：${conversation.user.name}`,
              bold: true,
            }),
          ],
        }),

        new Paragraph({
          text: `创建时间：${new Date(conversation.createdAt).toLocaleString('zh-CN')}`,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `创建时间：${new Date(conversation.createdAt).toLocaleString('zh-CN')}`,
              bold: true,
            }),
          ],
        }),

        new Paragraph({
          text: '对话内容',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
      ],
    });

    for (const message of conversation.messages) {
      const roleText = message.role === 'user' ? '用户' : '智能体';
      const bgColor = message.role === 'user' ? 'FFFFFF' : 'F5F5F5';

      doc.addSection({
        properties: {},
        children: [
          new Paragraph({
            text: `${roleText}`,
            bold: true,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${roleText}`,
                bold: true,
                color: message.role === 'user' ? '0000FF' : 'FF6600',
              }),
              new TextRun({
                text: ` - ${new Date(message.createdAt).toLocaleTimeString('zh-CN')}`,
              }),
            ],
          }),

          new Paragraph({
            text: message.content,
            spacing: { after: 300 },
            indent: { left: 400 },
          }),
        ],
      });
    }

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="对话记录_${conversation.agent.name}_${new Date().toISOString().split('T')[0]}.docx"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Export conversation error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

router.get('/:id/export/all-docx', authenticateToken, async (req, res) => {
  const { id: agentId } = req.params;

  try {
    const conversations = await prisma.conversation.findMany({
      where: { agentId, userId: req.user.id },
      include: {
        agent: true,
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (conversations.length === 0) {
      return res.status(404).json({ error: 'No conversations found' });
    }

    const doc = new Document({
      title: `全部对话记录 - ${conversations[0].agent.name}`,
      creator: conversations[0].user.name,
      description: `与 ${conversations[0].agent.name} 的全部对话记录`,
    });

    doc.addSection({
      properties: {},
      children: [
        new Paragraph({
          text: `全部对话记录 - ${conversations[0].agent.name}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        new Paragraph({
          text: `智能体：${conversations[0].agent.name}`,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: `智能体：${conversations[0].agent.name}`,
              bold: true,
            }),
            new TextRun({
              text: ` (${conversations[0].agent.title || conversations[0].agent.category})`,
            }),
          ],
        }),

        new Paragraph({
          text: `用户：${conversations[0].user.name}`,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `用户：${conversations[0].user.name}`,
              bold: true,
            }),
          ],
        }),

        new Paragraph({
          text: `导出时间：${new Date().toLocaleString('zh-CN')}`,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `导出时间：${new Date().toLocaleString('zh-CN')}`,
              bold: true,
            }),
          ],
        }),

        new Paragraph({
          text: `共 ${conversations.length} 条对话`,
          spacing: { after: 400 },
        }),
      ],
    });

    let conversationIndex = 1;
    for (const conversation of conversations) {
      doc.addSection({
        properties: {},
        children: [
          new Paragraph({
            text: `对话 ${conversationIndex++}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: `创建时间：${new Date(conversation.createdAt).toLocaleString('zh-CN')}`,
            spacing: { after: 300 },
          }),
        ],
      });

      for (const message of conversation.messages) {
        const roleText = message.role === 'user' ? '用户' : '智能体';

        doc.addSection({
          properties: {},
          children: [
            new Paragraph({
              text: `${roleText}`,
              bold: true,
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `${roleText}`,
                  bold: true,
                  color: message.role === 'user' ? '0000FF' : 'FF6600',
                }),
                new TextRun({
                  text: ` - ${new Date(message.createdAt).toLocaleTimeString('zh-CN')}`,
                }),
              ],
            }),

            new Paragraph({
              text: message.content,
              spacing: { after: 200 },
              indent: { left: 400 },
            }),
          ],
        });
      }
    }

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="全部对话记录_${conversations[0].agent.name}_${new Date().toISOString().split('T')[0]}.docx"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Export all conversations error:', error);
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

router.get('/:id/conversations', authenticateToken, async (req, res) => {
  const { id: agentId } = req.params;

  try {
    const conversations = await prisma.conversation.findMany({
      where: { agentId, userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
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
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

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
