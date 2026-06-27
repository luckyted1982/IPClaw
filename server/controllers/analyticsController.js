import prisma from '../lib/prisma.js';

export async function getAgentPerformance(req, res) {
  try {
    const { agentId, period = 'month' } = req.query;

    const where = agentId ? { id: agentId } : {};

    const agents = await prisma.agent.findMany({
      where,
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    const performanceData = agents.map(agent => {
      const completedTasks = agent.tasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = agent.tasks.filter(t => t.status === 'in_progress').length;
      const totalEarnings = agent.tasks
        .filter(t => t.status === 'completed' && t.budget)
        .reduce((sum, t) => sum + t.budget, 0);

      return {
        agentId: agent.id,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        totalTasks: agent._count.tasks,
        completedTasks,
        inProgressTasks,
        successRate: agent._count.tasks > 0 ? (completedTasks / agent._count.tasks * 100).toFixed(1) : '0',
        totalEarnings,
        averageRating: agent.rating,
        trustScore: agent.trustScore,
      };
    });

    res.json({ performance: performanceData });
  } catch (error) {
    console.error('Get agent performance error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTaskStatistics(req, res) {
  try {
    const { period = 'month' } = req.query;

    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const categoryCounts = await prisma.task.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const totalBudget = await prisma.task.aggregate({
      _sum: { budget: true },
    });

    const avgBudget = await prisma.task.aggregate({
      _avg: { budget: true },
    });

    const completedCount = statusCounts.find(s => s.status === 'completed')?._count.id || 0;
    const totalCount = statusCounts.reduce((sum, s) => sum + s._count.id, 0);

    res.json({
      totalTasks: totalCount,
      completedTasks: completedCount,
      pendingTasks: statusCounts.find(s => s.status === 'pending')?._count.id || 0,
      inProgressTasks: statusCounts.find(s => s.status === 'in_progress')?._count.id || 0,
      cancelledTasks: statusCounts.find(s => s.status === 'cancelled')?._count.id || 0,
      successRate: totalCount > 0 ? (completedCount / totalCount * 100).toFixed(1) : '0',
      totalBudget: totalBudget._sum.budget || 0,
      averageBudget: (avgBudget._avg.budget || 0).toFixed(2),
      byCategory: categoryCounts.map(c => ({
        category: c.category,
        count: c._count.id,
      })),
    });
  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTransactionReport(req, res) {
  try {
    const { userId, period = 'month' } = req.query;

    const where = userId ? { userId } : {};

    const typeCounts = await prisma.transaction.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { amount: true },
    });

    const statusCounts = await prisma.transaction.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const totalAmount = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });

    const recentTransactions = await prisma.transaction.findMany({
      where,
      take: 10,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        task: { select: { title: true, status: true } },
      },
    });

    res.json({
      totalTransactions: typeCounts.reduce((sum, t) => sum + t._count.id, 0),
      totalAmount: totalAmount._sum.amount || 0,
      byType: typeCounts.map(t => ({
        type: t.type,
        count: t._count.id,
        totalAmount: t._sum.amount || 0,
      })),
      byStatus: statusCounts.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
      recentTransactions,
    });
  } catch (error) {
    console.error('Get transaction report error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getUserAnalytics(req, res) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        transactions: true,
        conversations: true,
        agents: true,
      },
    });

    const completedTasks = user.tasks.filter(t => t.status === 'completed').length;
    const totalSpent = user.transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalEarned = user.transactions
      .filter(t => t.type === 'earning')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      userId: user.id,
      userName: user.name,
      email: user.email,
      balance: user.balance,
      totalTasks: user.tasks.length,
      completedTasks,
      inProgressTasks: user.tasks.filter(t => t.status === 'in_progress').length,
      totalConversations: user.conversations.length,
      totalAgents: user.agents.length,
      totalSpent,
      totalEarned,
      totalTransactions: user.transactions.length,
      registrationDate: user.createdAt,
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getDashboardData(req, res) {
  try {
    const [taskStats, agentStats, transactionStats] = await Promise.all([
      prisma.task.aggregate({
        _count: { id: true },
        _sum: { budget: true },
      }),
      prisma.agent.aggregate({
        _count: { id: true },
        _avg: { rating: true, trustScore: true },
      }),
      prisma.transaction.aggregate({
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const userCount = await prisma.user.count();
    const activeAgents = await prisma.agent.count({ where: { status: 'online' } });

    res.json({
      overview: {
        totalUsers: userCount,
        totalAgents: agentStats._count.id,
        activeAgents,
        totalTasks: taskStats._count.id,
        totalTransactions: transactionStats._count.id,
        totalValue: taskStats._sum.budget || 0,
      },
      averages: {
        agentRating: (agentStats._avg.rating || 0).toFixed(2),
        agentTrustScore: Math.round(agentStats._avg.trustScore || 0),
        avgTransactionAmount: ((transactionStats._sum.amount || 0) / (transactionStats._count.id || 1)).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}