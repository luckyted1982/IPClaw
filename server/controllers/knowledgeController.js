import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callModel } from '../lib/modelGateway.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function uploadKnowledgeFile(req, res) {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await file.mv(filePath);

    const fileSize = fs.statSync(filePath).size;

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        title: file.name,
        fileName,
        filePath,
        fileSize,
        fileType: file.mimetype,
        userId: req.user.id,
        content: '',
      },
    });

    await extractContentFromFile(filePath, knowledge.id);

    res.status(201).json({
      id: knowledge.id,
      title: knowledge.title,
      fileName: knowledge.fileName,
      fileSize: knowledge.fileSize,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload knowledge file error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function extractContentFromFile(filePath, knowledgeId) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const truncatedContent = content.substring(0, 10000);

    await prisma.knowledgeBase.update({
      where: { id: knowledgeId },
      data: { content: truncatedContent },
    });
  } catch (error) {
    console.error('Extract content error:', error);
  }
}

export async function getKnowledgeBases(req, res) {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [knowledgeBases, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.knowledgeBase.count({ where }),
    ]);

    res.json({
      knowledgeBases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get knowledge bases error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getKnowledgeBaseById(req, res) {
  try {
    const { id } = req.params;

    const knowledge = await prisma.knowledgeBase.findUnique({ where: { id } });
    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    if (knowledge.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(knowledge);
  } catch (error) {
    console.error('Get knowledge base by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateKnowledgeBase(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const knowledge = await prisma.knowledgeBase.findUnique({ where: { id } });
    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    if (knowledge.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedKnowledge = await prisma.knowledgeBase.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
      },
    });

    res.json(updatedKnowledge);
  } catch (error) {
    console.error('Update knowledge base error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteKnowledgeBase(req, res) {
  try {
    const { id } = req.params;

    const knowledge = await prisma.knowledgeBase.findUnique({ where: { id } });
    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge base not found' });
    }

    if (knowledge.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (knowledge.filePath && fs.existsSync(knowledge.filePath)) {
      fs.unlinkSync(knowledge.filePath);
    }

    await prisma.knowledgeBase.delete({ where: { id } });

    res.json({ message: 'Knowledge base deleted successfully' });
  } catch (error) {
    console.error('Delete knowledge base error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function queryKnowledge(req, res) {
  try {
    const { query, knowledgeId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let relevantKnowledge = [];

    if (knowledgeId) {
      const knowledge = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeId } });
      if (knowledge) {
        relevantKnowledge = [knowledge];
      }
    } else {
      relevantKnowledge = await prisma.knowledgeBase.findMany({
        where: { userId: req.user.id },
        take: 5,
      });
    }

    const context = relevantKnowledge
      .map(k => `${k.title}\n${k.content.substring(0, 2000)}`)
      .join('\n\n');

    const prompt = `
      基于以下知识库内容回答用户问题：
      
      ${context || '无可用知识库'}
      
      用户问题：${query}
      
      请根据知识库内容进行回答。如果知识库中没有相关信息，请明确说明。
    `;

    const response = await callModel('default', prompt, { stream: false });
    const result = await response.json();

    res.json({
      answer: result.choices?.[0]?.message?.content || '暂无回答',
      sources: relevantKnowledge.map(k => k.title),
    });
  } catch (error) {
    console.error('Query knowledge error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function queryKnowledgeStream(req, res) {
  try {
    const { query, knowledgeId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let relevantKnowledge = [];

    if (knowledgeId) {
      const knowledge = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeId } });
      if (knowledge) {
        relevantKnowledge = [knowledge];
      }
    } else {
      relevantKnowledge = await prisma.knowledgeBase.findMany({
        where: { userId: req.user.id },
        take: 5,
      });
    }

    const context = relevantKnowledge
      .map(k => `${k.title}\n${k.content.substring(0, 2000)}`)
      .join('\n\n');

    const prompt = `
      基于以下知识库内容回答用户问题：
      
      ${context || '无可用知识库'}
      
      用户问题：${query}
      
      请根据知识库内容进行回答。如果知识库中没有相关信息，请明确说明。
    `;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = await callModel('default', prompt, { stream: true });

    for await (const chunk of stream) {
      if (chunk && chunk.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ sources: relevantKnowledge.map(k => k.title) })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Query knowledge stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}