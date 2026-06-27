import prisma from '../lib/prisma.js';

export async function getAllAgents(req, res) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    const where = {
      status: 'online',
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ trustScore: 'desc' }, { rating: 'desc' }],
        include: {
          owner: { select: { name: true, avatar: true } },
          agentSkills: true,
        },
      }),
      prisma.agent.count({ where }),
    ]);

    res.json({
      agents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all agents error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAgentById(req, res) {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, avatar: true } },
        agentSkills: true,
        tasks: { select: { title: true, status: true, createdAt: true }, take: 5 },
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Get agent by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function createAgent(req, res) {
  try {
    const { name, avatar, title, description, systemPrompt, category, tags, skills } = req.body;

    if (!name || !systemPrompt || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        avatar,
        title,
        description,
        systemPrompt,
        category,
        tags: tags || '',
        ownerId: req.user.id,
        ...(skills && skills.length > 0 && {
          agentSkills: {
            create: skills.map((skill) => ({
              skillName: skill.name,
              level: skill.level || 0,
            })),
          },
        }),
      },
      include: {
        agentSkills: true,
      },
    });

    res.status(201).json(agent);
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateAgent(req, res) {
  try {
    const { id } = req.params;
    const { name, avatar, title, description, systemPrompt, category, tags, status } = req.body;

    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(title && { title }),
        ...(description && { description }),
        ...(systemPrompt && { systemPrompt }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(status && { status }),
      },
      include: {
        agentSkills: true,
      },
    });

    res.json(updatedAgent);
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteAgent(req, res) {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    await prisma.agent.delete({ where: { id } });

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getMyAgents(req, res) {
  try {
    const agents = await prisma.agent.findMany({
      where: { ownerId: req.user.id },
      include: {
        agentSkills: true,
        tasks: { select: { title: true, status: true }, take: 3 },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    res.json(agents);
  } catch (error) {
    console.error('Get my agents error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateAgentSkill(req, res) {
  try {
    const { id } = req.params;
    const { skillName, level } = req.body;

    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (agent.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const skill = await prisma.agentSkill.upsert({
      where: {
        id: id,
      },
      create: {
        agentId: id,
        skillName,
        level,
      },
      update: {
        skillName,
        level,
      },
    });

    res.json(skill);
  } catch (error) {
    console.error('Update agent skill error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}