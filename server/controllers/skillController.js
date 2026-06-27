import prisma from '../lib/prisma.js';

export async function createSkill(req, res) {
  try {
    const { name, description, icon, category, level, tags } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const skill = await prisma.agentSkill.create({
      data: {
        skillName: name,
        description: description || '',
        icon: icon || '',
        category: category || '',
        level: level || 0,
        tags: tags || '',
      },
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAllSkills(req, res) {
  try {
    const { category, search } = req.query;

    const where = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { skillName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skills = await prisma.agentSkill.findMany({
      where,
      orderBy: [{ skillName: 'asc' }],
    });

    res.json({ skills });
  } catch (error) {
    console.error('Get all skills error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getSkillById(req, res) {
  try {
    const { id } = req.params;

    const skill = await prisma.agentSkill.findUnique({ where: { id } });
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    console.error('Get skill by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateSkill(req, res) {
  try {
    const { id } = req.params;
    const { name, description, icon, category, level, tags } = req.body;

    const skill = await prisma.agentSkill.findUnique({ where: { id } });
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const updatedSkill = await prisma.agentSkill.update({
      where: { id },
      data: {
        ...(name && { skillName: name }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(category && { category }),
        ...(level !== undefined && { level }),
        ...(tags && { tags }),
      },
    });

    res.json(updatedSkill);
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteSkill(req, res) {
  try {
    const { id } = req.params;

    const skill = await prisma.agentSkill.findUnique({ where: { id } });
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await prisma.agentSkill.delete({ where: { id } });

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getSkillCategories(req, res) {
  try {
    const categories = await prisma.agentSkill.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.json({ categories: categories.map(c => c.category).filter(Boolean) });
  } catch (error) {
    console.error('Get skill categories error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}