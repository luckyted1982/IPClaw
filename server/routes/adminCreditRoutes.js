import express from 'express';
import creditService from '../services/CreditService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * 获取所有用户的积分账户列表
 * GET /api/admin/credits/accounts
 */
router.get('/accounts', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;

    const { page = 1, limit = 20, search } = req.query;

    const where = search ? {
      user: {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      },
    } : {};

    const [accounts, total] = await Promise.all([
      prisma.creditAccount.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { totalCredits: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.creditAccount.count({ where }),
    ]);

    res.json({
      accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: '获取账户列表失败', details: error.message });
  }
});

/**
 * 为用户充值积分
 * POST /api/admin/credits/recharge
 */
router.post('/recharge', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: '请提供有效的用户ID和积分数量' });
    }

    // 验证用户存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const result = await creditService.rechargeCredits(userId, amount, {
      description: description || `管理员充值 +${amount}`,
      referenceId: `admin_${req.user.id}_${Date.now()}`,
    });

    res.json({
      success: true,
      message: `成功为用户 ${user.name} 充值 ${amount} 积分`,
      userId,
      userName: user.name,
      ...result,
    });
  } catch (error) {
    console.error('Admin recharge error:', error);
    res.status(500).json({ error: '充值失败', details: error.message });
  }
});

/**
 * 批量充值积分
 * POST /api/admin/credits/batch-recharge
 */
router.post('/batch-recharge', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;
    const { userIds, amount, description } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: '请提供有效的用户ID列表' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: '请提供有效的积分数量' });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          errors.push({ userId, error: '用户不存在' });
          continue;
        }

        const result = await creditService.rechargeCredits(userId, amount, {
          description: description || `管理员批量充值 +${amount}`,
          referenceId: `admin_${req.user.id}_batch_${Date.now()}`,
        });

        results.push({
          userId,
          userName: user.name,
          ...result,
        });
      } catch (err) {
        errors.push({ userId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `成功充值 ${results.length} 个用户，失败 ${errors.length} 个`,
      results,
      errors,
    });
  } catch (error) {
    console.error('Batch recharge error:', error);
    res.status(500).json({ error: '批量充值失败', details: error.message });
  }
});

/**
 * 为所有用户充值积分（全员福利）
 * POST /api/admin/credits/recharge-all
 */
router.post('/recharge-all', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;
    const { amount, description, excludeUserIds } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: '请提供有效的积分数量' });
    }

    const where = excludeUserIds && excludeUserIds.length > 0
      ? { id: { notIn: excludeUserIds } }
      : {};

    const users = await prisma.user.findMany({ where });
    const results = [];
    const errors = [];

    for (const user of users) {
      try {
        const result = await creditService.rechargeCredits(user.id, amount, {
          description: description || `全员福利充值 +${amount}`,
          referenceId: `admin_${req.user.id}_all_${Date.now()}`,
        });

        results.push({
          userId: user.id,
          userName: user.name,
          ...result,
        });
      } catch (err) {
        errors.push({ userId: user.id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `成功为 ${results.length} 个用户充值积分`,
      totalRecharged: results.length,
      totalErrors: errors.length,
      amountEach: amount,
      results: results.slice(0, 10), // 只返回前10个
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Recharge all error:', error);
    res.status(500).json({ error: '全员充值失败', details: error.message });
  }
});

/**
 * 扣除用户积分
 * POST /api/admin/credits/deduct
 */
router.post('/deduct', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: '请提供有效的用户ID和积分数量' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const result = await creditService.consumeCredits(userId, amount, {
      category: 'admin_deduct',
      description: description || `管理员扣除 -${amount}`,
      referenceId: `admin_${req.user.id}_${Date.now()}`,
    });

    res.json({
      success: true,
      message: `成功扣除用户 ${user.name} ${result.creditsConsumed} 积分`,
      userId,
      userName: user.name,
      ...result,
    });
  } catch (error) {
    console.error('Admin deduct error:', error);
    res.status(400).json({ error: error.message || '扣费失败' });
  }
});

/**
 * 获取指定用户的积分详情
 * GET /api/admin/credits/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const accountInfo = await creditService.getAccountInfo(userId);

    res.json({
      user,
      ...accountInfo,
    });
  } catch (error) {
    console.error('Get user credits error:', error);
    res.status(500).json({ error: '获取用户积分信息失败', details: error.message });
  }
});

/**
 * 获取积分统计数据
 * GET /api/admin/credits/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;

    const [
      totalAccounts,
      totalCredits,
      totalSpent,
      recentTransactions,
      topSpenders,
    ] = await Promise.all([
      prisma.creditAccount.count(),
      prisma.creditAccount.aggregate({ _sum: { totalCredits: true } }),
      prisma.creditAccount.aggregate({ _sum: { spentCredits: true } }),
      prisma.creditTransaction.findMany({
        where: { type: 'consume' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.creditAccount.findMany({
        orderBy: { spentCredits: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    res.json({
      totalAccounts,
      totalCredits: totalCredits._sum.totalCredits || 0,
      totalSpent: totalSpent._sum.spentCredits || 0,
      averageCredits: totalAccounts > 0 ? Math.round((totalCredits._sum.totalCredits || 0) / totalAccounts) : 0,
      recentTransactions,
      topSpenders,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: '获取统计数据失败', details: error.message });
  }
});

/**
 * 创建或更新消费规则
 * POST /api/admin/credits/rules
 */
router.post('/rules', async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).default;
    const { rules } = req.body;

    if (!rules || !Array.isArray(rules)) {
      return res.status(400).json({ error: '请提供规则数组' });
    }

    const results = [];
    for (const rule of rules) {
      const { serviceType, ...data } = rule;

      const existing = await prisma.consumptionRule.findUnique({
        where: { serviceType },
      });

      if (existing) {
        const updated = await prisma.consumptionRule.update({
          where: { serviceType },
          data,
        });
        results.push({ serviceType, action: 'updated', rule: updated });
      } else {
        const created = await prisma.consumptionRule.create({
          data: { serviceType, ...data },
        });
        results.push({ serviceType, action: 'created', rule: created });
      }
    }

    res.json({
      success: true,
      message: `成功处理 ${results.length} 条规则`,
      results,
    });
  } catch (error) {
    console.error('Update rules error:', error);
    res.status(500).json({ error: '更新规则失败', details: error.message });
  }
});

export default router;
