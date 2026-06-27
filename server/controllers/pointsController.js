import prisma from '../lib/prisma.js';

const DAILY_CHECKIN_POINTS = 10;
const STREAK_BONUS_THRESHOLD = 7;
const STREAK_BONUS_POINTS = 50;
const WELCOME_BONUS_POINTS = 100;

function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isYesterday(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setDate(d1.getDate() + 1);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export async function getPointsBalance(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true,
        checkInStreak: true,
        totalCheckIns: true,
        lastCheckIn: true,
        subscription: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const hasCheckedInToday = isSameDay(user.lastCheckIn, today);

    res.json({
      balance: user.balance,
      checkInStreak: user.checkInStreak,
      totalCheckIns: user.totalCheckIns,
      hasCheckedInToday,
      lastCheckIn: user.lastCheckIn,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error('Get points balance error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function dailyCheckIn(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();

    if (isSameDay(user.lastCheckIn, today)) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const isConsecutive = isYesterday(user.lastCheckIn, today);
    const newStreak = isConsecutive ? user.checkInStreak + 1 : 1;

    let pointsEarned = DAILY_CHECKIN_POINTS;
    let bonusPoints = 0;
    let streakBonus = false;

    if (newStreak > 0 && newStreak % STREAK_BONUS_THRESHOLD === 0) {
      bonusPoints = STREAK_BONUS_POINTS;
      streakBonus = true;
    }

    const totalPoints = pointsEarned + bonusPoints;

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: req.user.id },
        data: {
          balance: { increment: totalPoints },
          lastCheckIn: today,
          checkInStreak: newStreak,
          totalCheckIns: { increment: 1 },
        },
        select: {
          id: true,
          balance: true,
          checkInStreak: true,
          totalCheckIns: true,
          lastCheckIn: true,
        },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          userId: req.user.id,
          type: 'earn',
          amount: totalPoints,
          balanceAfter: updatedUser.balance,
          description: streakBonus
            ? `每日签到 + 连续${STREAK_BONUS_THRESHOLD}天奖励`
            : '每日签到',
          category: 'checkin',
        },
      });

      return { user: updatedUser, transaction };
    });

    res.json({
      success: true,
      pointsEarned,
      bonusPoints,
      streakBonus,
      newStreak,
      totalPoints,
      newBalance: result.user.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Daily check-in error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getPointsHistory(req, res) {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;

    const where = {
      userId: req.user.id,
      ...(type && { type }),
      ...(category && { category }),
    };

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.pointTransaction.count({ where }),
    ]);

    const summary = await prisma.pointTransaction.aggregate({
      where: { userId: req.user.id, type: 'earn' },
      _sum: { amount: true },
    });

    const consumeSummary = await prisma.pointTransaction.aggregate({
      where: { userId: req.user.id, type: 'consume' },
      _sum: { amount: true },
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalEarned: summary._sum.amount || 0,
        totalConsumed: consumeSummary._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function addPoints(req, res) {
  try {
    const { amount, description, category = 'manual', referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: req.user.id },
        data: { balance: { increment: amount } },
        select: { id: true, balance: true },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          userId: req.user.id,
          type: 'earn',
          amount,
          balanceAfter: user.balance,
          description,
          category,
          referenceId,
        },
      });

      return { user, transaction };
    });

    res.json({
      success: true,
      newBalance: result.user.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function consumePoints(req, res) {
  try {
    const { amount, description, category = 'manual', referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient points balance' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: req.user.id },
        data: { balance: { decrement: amount } },
        select: { id: true, balance: true },
      });

      const transaction = await tx.pointTransaction.create({
        data: {
          userId: req.user.id,
          type: 'consume',
          amount,
          balanceAfter: updatedUser.balance,
          description,
          category,
          referenceId,
        },
      });

      return { user: updatedUser, transaction };
    });

    res.json({
      success: true,
      newBalance: result.user.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error('Consume points error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getCheckInStats(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        checkInStreak: true,
        totalCheckIns: true,
        lastCheckIn: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date();
    const hasCheckedInToday = isSameDay(user.lastCheckIn, today);

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isCheckedIn = user.lastCheckIn && isSameDay(user.lastCheckIn, date);
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
        checkedIn: isCheckedIn && i === 0 ? true : (i < user.checkInStreak ? true : false),
        points: isCheckedIn ? DAILY_CHECKIN_POINTS : 0,
      });
    }

    res.json({
      streak: user.checkInStreak,
      totalCheckIns: user.totalCheckIns,
      hasCheckedInToday,
      nextBonusAt: STREAK_BONUS_THRESHOLD - (user.checkInStreak % STREAK_BONUS_THRESHOLD),
      dailyPoints: DAILY_CHECKIN_POINTS,
      streakBonusPoints: STREAK_BONUS_POINTS,
      streakBonusThreshold: STREAK_BONUS_THRESHOLD,
      weeklyData,
    });
  } catch (error) {
    console.error('Get check-in stats error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getPointsRules(req, res) {
  const earnRules = [
    { id: 'daily_checkin', title: '每日签到', description: '每天登录签到获得积分', points: `${DAILY_CHECKIN_POINTS}/天`, category: 'checkin' },
    { id: 'streak_bonus', title: '连续签到奖励', description: `连续签到${STREAK_BONUS_THRESHOLD}天额外奖励`, points: `${STREAK_BONUS_POINTS}/7天`, category: 'checkin' },
    { id: 'welcome_bonus', title: '新用户注册', description: '注册并完成认证获得欢迎奖励', points: `${WELCOME_BONUS_POINTS}积分`, category: 'bonus' },
    { id: 'create_agent', title: '创建智能体', description: '创建并发布智能体获得积分', points: '20-100积分', category: 'create' },
    { id: 'create_skill', title: '创建技能', description: '创建并发布技能获得积分', points: '50-200积分', category: 'create' },
    { id: 'task_complete', title: '完成任务', description: '智能体完成任务获得积分收益', points: '按任务定价', category: 'earn' },
    { id: 'invite_friend', title: '邀请好友', description: '邀请好友注册并认证', points: '100/人', category: 'invite' },
    { id: 'subscription', title: '订阅奖励', description: '订阅套餐每月赠送积分', points: '500-5000/月', category: 'subscription' },
  ];

  const consumeRules = [
    { id: 'ai_chat', title: 'AI对话', description: '基础模型对话消耗积分', points: '1积分/次', category: 'chat' },
    { id: 'agent_call', title: 'Agent调用', description: '使用智能体服务', points: '10-100积分', category: 'agent' },
    { id: 'skill_use', title: '技能调用', description: '使用付费技能', points: '按技能定价', category: 'skill' },
    { id: 'expert_consult', title: '专家咨询', description: '预约专家服务', points: '按专家定价', category: 'expert' },
    { id: 'advanced_model', title: '高级模型', description: '使用GPT-4等高级模型', points: '5-20积分/次', category: 'model' },
    { id: 'file_process', title: '文件处理', description: '文档处理和分析', points: '2-10积分/页', category: 'file' },
    { id: 'task_publish', title: '发布任务', description: '在平台发布委托任务', points: '按任务预算', category: 'task' },
  ];

  res.json({
    earnRules,
    consumeRules,
    welcomeBonus: WELCOME_BONUS_POINTS,
    dailyCheckInPoints: DAILY_CHECKIN_POINTS,
    streakBonusThreshold: STREAK_BONUS_THRESHOLD,
    streakBonusPoints: STREAK_BONUS_POINTS,
  });
}

export { WELCOME_BONUS_POINTS };
