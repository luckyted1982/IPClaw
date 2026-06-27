import prisma from '../lib/prisma.js';

export async function createTask(req, res) {
  try {
    const { title, description, category, budget, deadline, requirements, agentId } = req.body;

    if (!title || !description || !category || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        category,
        budget: parseFloat(budget),
        deadline: deadline ? new Date(deadline) : null,
        tags: '',
        creatorId: req.user.id,
        ...(agentId && { agentId }),
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAllTasks(req, res) {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;

    const where = {
      ...(category && { category }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ createdAt: 'desc' }],
        include: {
          creator: { select: { name: true, avatar: true } },
          agent: { select: { name: true, avatar: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, avatar: true } },
        agent: { select: { name: true, avatar: true } },
        bids: {
          include: { agent: { select: { name: true, avatar: true } } },
          orderBy: [{ createdAt: 'desc' }],
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getMyTasks(req, res) {
  try {
    const { role = 'client' } = req.query;

    const where = role === 'agent'
      ? { agentId: req.user.id }
      : { creatorId: req.user.id };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        creator: { select: { name: true, avatar: true } },
        agent: { select: { name: true, avatar: true } },
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.creatorId !== req.user.id && task.agentId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the creator' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete task that is not pending' });
    }

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function submitBid(req, res) {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot bid on non-pending tasks' });
    }

    if (task.creatorId === req.user.id) {
      return res.status(400).json({ error: 'Cannot bid on your own task' });
    }

    const agent = await prisma.agent.findFirst({ where: { ownerId: req.user.id } });
    if (!agent) {
      return res.status(400).json({ error: 'You need to create an agent first' });
    }

    const bid = await prisma.bid.create({
      data: {
        taskId: id,
        agentId: agent.id,
        amount: parseFloat(amount),
        message: message || '',
      },
    });

    res.status(201).json(bid);
  } catch (error) {
    console.error('Submit bid error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function acceptBid(req, res) {
  try {
    const { id } = req.params;
    const { bidId } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Not the client' });
    }

    if (task.status !== 'pending') {
      return res.status(400).json({ error: 'Task is not pending' });
    }

    const bid = await prisma.bid.findUnique({ where: { id: bidId } });
    if (!bid || bid.taskId !== id) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: {
          status: 'in_progress',
          agentId: bid.agentId,
          budget: bid.amount,
        },
      }),
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'accepted' },
      }),
    ]);

    res.json({ message: 'Bid accepted successfully' });
  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}