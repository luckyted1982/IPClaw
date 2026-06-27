import prisma from '../lib/prisma.js';

const DEFAULT_PLANS = [
  {
    name: 'free',
    displayName: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    pointsMonthly: 50,
    description: '适合初次体验的用户',
    features: JSON.stringify([
      '每日 50 积分',
      '基础模型调用',
      '3 个自定义Agent',
      '社区支持',
      '基础知识库',
    ]),
  },
  {
    name: 'pro',
    displayName: 'Pro 专业版',
    priceMonthly: 99,
    priceYearly: 999,
    pointsMonthly: 5000,
    description: '适合专业人士和小团队',
    features: JSON.stringify([
      '每月 5000 积分',
      '全部模型调用',
      '无限自定义Agent',
      '优先客服支持',
      '高级知识库',
      'API 访问',
      '数据分析报表',
    ]),
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise 企业版',
    priceMonthly: 999,
    priceYearly: 9999,
    pointsMonthly: 100000,
    description: '适合企业和大型团队',
    features: JSON.stringify([
      '每月 100,000 积分',
      '企业级模型',
      '团队协作功能',
      '专属客户经理',
      '定制化开发',
      '私有化部署',
      'SLA 保障',
    ]),
  },
];

export async function getPlans(req, res) {
  try {
    let plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    if (plans.length === 0) {
      for (const plan of DEFAULT_PLANS) {
        await prisma.subscriptionPlan.upsert({
          where: { name: plan.name },
          update: plan,
          create: plan,
        });
      }
      plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: 'asc' },
      });
    }

    const formattedPlans = plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features),
    }));

    res.json(formattedPlans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getMySubscription(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscription: true,
        subscriptionExpiresAt: true,
        balance: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { name: user.subscription },
    });

    res.json({
      plan: user.subscription,
      planName: plan?.displayName || user.subscription,
      expiresAt: user.subscriptionExpiresAt,
      isActive:
        !user.subscriptionExpiresAt ||
        new Date(user.subscriptionExpiresAt) > new Date(),
      pointsBalance: user.balance,
      monthlyPoints: plan?.pointsMonthly || 50,
      planDetails: plan
        ? {
            ...plan,
            features: JSON.parse(plan.features),
          }
        : null,
    });
  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function subscribe(req, res) {
  try {
    const { planId, billingCycle = 'monthly' } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = new Date();
    const endDate = new Date(now);
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: req.user.id },
        data: {
          subscription: plan.name,
          subscriptionExpiresAt: endDate,
          balance: { increment: plan.pointsMonthly },
        },
        select: {
          id: true,
          subscription: true,
          subscriptionExpiresAt: true,
          balance: true,
        },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          userId: req.user.id,
          type: 'earn',
          amount: plan.pointsMonthly,
          balanceAfter: updatedUser.balance,
          description: `订阅${plan.displayName}赠送积分`,
          category: 'subscription',
          referenceId: planId,
        },
      });

      return { user: updatedUser, transaction };
    });

    res.json({
      success: true,
      message: 'Subscription successful',
      plan: plan.name,
      expiresAt: result.user.subscriptionExpiresAt,
      newBalance: result.user.balance,
      pointsGranted: plan.pointsMonthly,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscription: 'free',
        subscriptionExpiresAt: null,
      },
      select: {
        id: true,
        subscription: true,
        subscriptionExpiresAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Subscription cancelled',
      plan: updatedUser.subscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
