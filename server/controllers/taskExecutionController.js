import prisma from '../lib/prisma.js';

export async function createTaskExecution(req, res) {
  try {
    const { taskId, agentId, input } = req.body;

    if (!taskId || !agentId) {
      return res.status(400).json({ error: 'taskId and agentId are required' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const existingExecution = await prisma.taskExecution.findFirst({
      where: { taskId, agentId },
    });

    if (existingExecution) {
      return res.status(400).json({ error: 'Execution already exists for this task and agent' });
    }

    const execution = await prisma.taskExecution.create({
      data: {
        taskId,
        agentId,
        input,
        status: 'assigned',
        step: 'accepted',
        progress: 0,
      },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { agentId, status: 'assigned' },
    });

    res.status(201).json(execution);
  } catch (error) {
    console.error('Create task execution error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function startTaskExecution(req, res) {
  try {
    const { id } = req.params;

    const execution = await prisma.taskExecution.findUnique({ where: { id } });
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.step !== 'accepted') {
      return res.status(400).json({ error: 'Execution cannot be started from current step' });
    }

    const updated = await prisma.taskExecution.update({
      where: { id },
      data: {
        status: 'in_progress',
        step: 'started',
        progress: 10,
        startedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Start task execution error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateTaskExecutionProgress(req, res) {
  try {
    const { id } = req.params;
    const { progress, output, step } = req.body;

    const execution = await prisma.taskExecution.findUnique({ where: { id } });
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status !== 'in_progress') {
      return res.status(400).json({ error: 'Execution is not in progress' });
    }

    const updated = await prisma.taskExecution.update({
      where: { id },
      data: {
        ...(progress !== undefined && { progress: Math.min(90, Math.max(10, progress)) }),
        ...(output !== undefined && { output }),
        ...(step !== undefined && { step }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update task execution progress error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function submitTaskExecution(req, res) {
  try {
    const { id } = req.params;
    const { result } = req.body;

    const execution = await prisma.taskExecution.findUnique({ where: { id } });
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status !== 'in_progress') {
      return res.status(400).json({ error: 'Execution is not in progress' });
    }

    const updated = await prisma.taskExecution.update({
      where: { id },
      data: {
        status: 'submitted',
        step: 'submitted',
        progress: 95,
        result,
        completedAt: new Date(),
      },
    });

    await prisma.task.update({
      where: { id: execution.taskId },
      data: { status: 'submitted' },
    });

    res.json(updated);
  } catch (error) {
    console.error('Submit task execution error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function completeTaskExecution(req, res) {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const execution = await prisma.taskExecution.findUnique({ where: { id } });
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    if (execution.status !== 'submitted') {
      return res.status(400).json({ error: 'Execution has not been submitted' });
    }

    const updated = await prisma.taskExecution.update({
      where: { id },
      data: {
        status: approved ? 'completed' : 'rejected',
        step: approved ? 'completed' : 'rejected',
        progress: approved ? 100 : 0,
      },
    });

    await prisma.task.update({
      where: { id: execution.taskId },
      data: {
        status: approved ? 'completed' : 'rejected',
        tasksCompleted: approved ? { increment: 1 } : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Complete task execution error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTaskExecution(req, res) {
  try {
    const { id } = req.params;

    const execution = await prisma.taskExecution.findUnique({
      where: { id },
      include: {
        task: true,
        agent: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error) {
    console.error('Get task execution error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAgentExecutions(req, res) {
  try {
    const { agentId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const where = {
      agentId,
      ...(status && { status }),
    };

    const [executions, total] = await Promise.all([
      prisma.taskExecution.findMany({
        where,
        include: {
          task: true,
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.taskExecution.count({ where }),
    ]);

    res.json({
      executions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get agent executions error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}