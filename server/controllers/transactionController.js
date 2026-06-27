import prisma from '../lib/prisma.js';

export async function createTransaction(req, res) {
  try {
    const { taskId, amount, type } = req.body;

    if (!taskId || !amount || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        taskId,
        amount: parseFloat(amount),
        type,
        userId: req.user.id,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTransactions(req, res) {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const where = {
      ...(type && { type }),
      ...(status && { status }),
      userId: req.user.id,
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ createdAt: 'desc' }],
        include: {
          task: { select: { title: true, status: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTransactionById(req, res) {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        task: { select: { title: true, status: true, client: { select: { name: true } } } },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateTransactionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin only' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getUserBalance(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { balance: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Get user balance error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateUserBalance(req, res) {
  try {
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        balance: {
          increment: parseFloat(amount),
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { balance: true },
    });

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Update user balance error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}