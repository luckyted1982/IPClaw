import prisma from '../lib/prisma.js';

// 积分消耗类型枚举
export const CreditCategory = {
  CHAT: 'chat',
  SKILL: 'skill',
  EXPERT: 'expert',
  TASK: 'task',
  KNOWLEDGE: 'knowledge',
  DOCUMENT: 'document',
  SUBSCRIPTION: 'subscription',
  RECHARGE: 'recharge',
  SIGNUP_BONUS: 'signup_bonus',
  CHECKIN_BONUS: 'checkin_bonus',
  REFERRAL_BONUS: 'referral_bonus',
  REFUND: 'refund',
};

// 交易类型枚举
export const TransactionType = {
  REWARD: 'reward',
  PURCHASE: 'purchase',
  SUBSCRIBE: 'subscribe',
  CONSUME: 'consume',
  REFUND: 'refund',
  EXPIRED: 'expired',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
};

// 服务类型枚举
export const ServiceType = {
  AGENT_CHAT: 'agent_chat',
  SKILL_EXECUTION: 'skill_execution',
  EXPERT_CONSULT: 'expert_consult',
  TASK_EXECUTION: 'task_execution',
  DOCUMENT_GENERATION: 'document_generation',
  KNOWLEDGE_QUERY: 'knowledge_query',
};

// 默认消费规则 (积分)
const DEFAULT_CONSUMPTION_RULES = {
  [ServiceType.AGENT_CHAT]: {
    baseCredits: 1,
    perTokenCredits: 0.001, // 每千token 1积分
    perRequestMin: 1,
    perRequestMax: 50,
  },
  [ServiceType.SKILL_EXECUTION]: {
    baseCredits: 10,
    perMinuteCredits: 5,
    perRequestMin: 5,
    perRequestMax: 100,
  },
  [ServiceType.EXPERT_CONSULT]: {
    baseCredits: 20,
    perMinuteCredits: 10,
    perRequestMin: 20,
    perRequestMax: 500,
  },
  [ServiceType.TASK_EXECUTION]: {
    baseCredits: 10,
    perMinuteCredits: 3,
    perRequestMin: 10,
    perRequestMax: 200,
  },
  [ServiceType.DOCUMENT_GENERATION]: {
    baseCredits: 5,
    perTokenCredits: 0.002,
    perRequestMin: 5,
    perRequestMax: 100,
  },
  [ServiceType.KNOWLEDGE_QUERY]: {
    baseCredits: 2,
    perTokenCredits: 0.0005,
    perRequestMin: 1,
    perRequestMax: 30,
  },
};

// 模型定价倍数 (相对于 DeepSeek-V3)
const MODEL_PRICE_MULTIPLIERS = {
  'deepseek-chat': 1.0,
  'deepseek-v3': 1.0,
  'deepseek-r1': 3.0, // 推理模型更贵
  'gpt-4': 5.0,
  'gpt-4o': 4.0,
  'claude-3-opus': 4.5,
  'claude-3-sonnet': 2.5,
  'hunyuan': 1.2,
  'qwen-plus': 1.5,
};

class CreditService {
  /**
   * 获取或创建用户积分账户
   */
  async getOrCreateAccount(userId) {
    let account = await prisma.creditAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await prisma.creditAccount.create({
        data: {
          userId,
          totalCredits: 0,
          availableCredits: 0,
          frozenCredits: 0,
          spentCredits: 0,
          lifetimeSpent: 0,
          monthlyQuota: 0,
          monthlyUsed: 0,
          level: 1,
          totalPurchased: 0,
        },
      });
    }

    return account;
  }

  /**
   * 检查并重置月度配额
   */
  async checkAndResetMonthlyQuota(account) {
    const now = new Date();
    const resetTime = new Date(account.quotaResetAt);
    const monthDiff = now.getMonth() - resetTime.getMonth() +
                      (12 * (now.getFullYear() - resetTime.getFullYear()));

    if (monthDiff >= 1) {
      return await prisma.creditAccount.update({
        where: { id: account.id },
        data: {
          monthlyUsed: 0,
          quotaResetAt: now,
        },
      });
    }

    return account;
  }

  /**
   * 积分是否充足
   */
  async hasEnoughCredits(userId, amount) {
    const account = await this.getOrCreateAccount(userId);
    const accountWithQuota = await this.checkAndResetMonthlyQuota(account);

    // 优先使用月度配额，剩余用可用积分
    const totalAvailable = accountWithQuota.availableCredits + accountWithQuota.monthlyQuota;
    return totalAvailable >= amount;
  }

  /**
   * 消费积分
   * @param {string} userId - 用户ID
   * @param {number} amount - 消耗积分数量
   * @param {object} options - 消费详情
   */
  async consumeCredits(userId, amount, options = {}) {
    const {
      category = CreditCategory.CHAT,
      description = '积分消费',
      referenceId = null,
      serviceType = null,
      modelName = null,
      inputTokens = 0,
      outputTokens = 0,
    } = options;

    if (amount <= 0) {
      throw new Error('消费积分必须大于0');
    }

    const account = await this.getOrCreateAccount(userId);
    const accountWithQuota = await this.checkAndResetMonthlyQuota(account);

    // 计算实际可用积分
    let availableFromQuota = accountWithQuota.monthlyQuota - accountWithQuota.monthlyUsed;
    let remainingFromCredits = accountWithQuota.availableCredits;
    let quotaUsed = 0;
    let creditsUsed = 0;

    if (availableFromQuota > 0) {
      quotaUsed = Math.min(availableFromQuota, amount);
      remainingFromCredits = amount - quotaUsed;
    }

    if (remainingFromCredits > 0) {
      if (remainingFromCredits > accountWithQuota.availableCredits) {
        throw new Error('积分不足');
      }
      creditsUsed = remainingFromCredits;
    }

    const totalUsed = quotaUsed + creditsUsed;

    // 更新账户
    const updatedAccount = await prisma.creditAccount.update({
      where: { id: account.id },
      data: {
        availableCredits: accountWithQuota.availableCredits - creditsUsed,
        spentCredits: accountWithQuota.spentCredits + creditsUsed,
        lifetimeSpent: accountWithQuota.lifetimeSpent + creditsUsed,
        monthlyUsed: accountWithQuota.monthlyUsed + quotaUsed,
      },
    });

    // 记录交易
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.CONSUME,
        amount: -totalUsed,
        balanceBefore: accountWithQuota.availableCredits + accountWithQuota.monthlyQuota,
        balanceAfter: updatedAccount.availableCredits + (accountWithQuota.monthlyQuota - accountWithQuota.monthlyUsed - quotaUsed),
        category,
        description,
        referenceId,
        serviceType,
        modelName,
        inputTokens,
        outputTokens,
        status: 'completed',
      },
    });

    // 记录使用日志
    await prisma.serviceUsageLog.create({
      data: {
        userId,
        serviceType: serviceType || category,
        action: description,
        creditsConsumed: totalUsed,
        modelName,
        inputTokens,
        outputTokens,
        referenceId,
        referenceType: category,
        status: 'success',
      },
    });

    return {
      success: true,
      creditsConsumed: totalUsed,
      fromQuota: quotaUsed,
      fromCredits: creditsUsed,
      remainingCredits: updatedAccount.availableCredits,
      remainingQuota: accountWithQuota.monthlyQuota - accountWithQuota.monthlyUsed - quotaUsed,
    };
  }

  /**
   * 充值积分
   */
  async rechargeCredits(userId, amount, options = {}) {
    const {
      description = '积分充值',
      referenceId = null,
      expiresAt = null,
    } = options;

    if (amount <= 0) {
      throw new Error('充值积分必须大于0');
    }

    const account = await this.getOrCreateAccount(userId);

    const updatedAccount = await prisma.creditAccount.update({
      where: { id: account.id },
      data: {
        totalCredits: account.totalCredits + amount,
        availableCredits: account.availableCredits + amount,
        totalPurchased: account.totalPurchased + amount,
      },
    });

    // 记录交易
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.PURCHASE,
        amount: amount,
        balanceBefore: account.availableCredits,
        balanceAfter: updatedAccount.availableCredits,
        category: CreditCategory.RECHARGE,
        description: description || `积分充值 +${amount}`,
        referenceId,
        expiresAt,
        status: 'completed',
      },
    });

    return {
      success: true,
      creditsAdded: amount,
      totalCredits: updatedAccount.totalCredits,
      availableCredits: updatedAccount.availableCredits,
    };
  }

  /**
   * 发放奖励积分
   */
  async rewardCredits(userId, amount, options = {}) {
    const {
      description = '奖励发放',
      category = CreditCategory.REWARD,
      referenceId = null,
    } = options;

    if (amount <= 0) {
      throw new Error('奖励积分必须大于0');
    }

    const account = await this.getOrCreateAccount(userId);

    const updatedAccount = await prisma.creditAccount.update({
      where: { id: account.id },
      data: {
        totalCredits: account.totalCredits + amount,
        availableCredits: account.availableCredits + amount,
      },
    });

    // 记录交易
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.REWARD,
        amount: amount,
        balanceBefore: account.availableCredits,
        balanceAfter: updatedAccount.availableCredits,
        category,
        description,
        referenceId,
        status: 'completed',
      },
    });

    return {
      success: true,
      creditsRewarded: amount,
      availableCredits: updatedAccount.availableCredits,
    };
  }

  /**
   * 计算对话消耗积分
   * 基于 token 数量和模型
   */
  calculateChatCredits(modelName, inputTokens, outputTokens) {
    const rules = DEFAULT_CONSUMPTION_RULES[ServiceType.AGENT_CHAT];
    const multiplier = MODEL_PRICE_MULTIPLIERS[modelName] || 1.0;

    // 基础消耗 + token消耗 + 模型倍数
    const tokenCredits = Math.ceil((inputTokens + outputTokens) / 1000 * rules.perTokenCredits * 1000);
    const totalCredits = Math.max(
      rules.baseCredits,
      Math.min(
        Math.ceil(tokenCredits * multiplier),
        rules.perRequestMax
      )
    );

    return Math.max(totalCredits, rules.perRequestMin);
  }

  /**
   * 计算任务执行消耗积分
   */
  calculateTaskCredits(durationMinutes, complexity = 'medium') {
    const rules = DEFAULT_CONSUMPTION_RULES[ServiceType.TASK_EXECUTION];

    const complexityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 2.0,
      extreme: 3.0,
    }[complexity] || 1.0;

    const durationCredits = Math.ceil(durationMinutes * rules.perMinuteCredits * complexityMultiplier);
    return Math.max(
      Math.min(durationCredits, rules.perRequestMax),
      rules.perRequestMin
    );
  }

  /**
   * 计算文档生成消耗积分
   */
  calculateDocumentCredits(modelName, estimatedTokens) {
    const rules = DEFAULT_CONSUMPTION_RULES[ServiceType.DOCUMENT_GENERATION];
    const multiplier = MODEL_PRICE_MULTIPLIERS[modelName] || 1.0;

    const tokenCredits = Math.ceil(estimatedTokens / 1000 * rules.perTokenCredits * 1000);
    return Math.max(
      Math.min(Math.ceil(tokenCredits * multiplier), rules.perRequestMax),
      rules.perRequestMin
    );
  }

  /**
   * 获取用户积分账户信息
   */
  async getAccountInfo(userId) {
    const account = await this.getOrCreateAccount(userId);
    const accountWithQuota = await this.checkAndResetMonthlyQuota(account);

    // 获取最近交易
    const recentTransactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 获取等级信息
    const level = await this.calculateLevel(accountWithQuota.lifetimeSpent);

    return {
      userId: accountWithQuota.userId,
      totalCredits: accountWithQuota.totalCredits,
      availableCredits: accountWithQuota.availableCredits,
      frozenCredits: accountWithQuota.frozenCredits,
      spentCredits: accountWithQuota.spentCredits,
      lifetimeSpent: accountWithQuota.lifetimeSpent,
      monthlyQuota: accountWithQuota.monthlyQuota,
      monthlyUsed: accountWithQuota.monthlyUsed,
      monthlyRemaining: accountWithQuota.monthlyQuota - accountWithQuota.monthlyUsed,
      quotaResetAt: accountWithQuota.quotaResetAt,
      level: accountWithQuota.level,
      nextLevel: level.nextLevel,
      levelProgress: level.progress,
      recentTransactions,
    };
  }

  /**
   * 计算用户等级
   */
  async calculateLevel(lifetimeSpent) {
    const levels = [
      { level: 1, name: '青铜', minSpent: 0, discount: 0 },
      { level: 2, name: '白银', minSpent: 1000, discount: 0.02 },
      { level: 3, name: '黄金', minSpent: 5000, discount: 0.05 },
      { level: 4, name: '铂金', minSpent: 20000, discount: 0.08 },
      { level: 5, name: '钻石', minSpent: 50000, discount: 0.12 },
    ];

    let currentLevel = levels[0];
    let nextLevel = null;

    for (let i = 0; i < levels.length; i++) {
      if (lifetimeSpent >= levels[i].minSpent) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
      }
    }

    const progress = nextLevel
      ? ((lifetimeSpent - currentLevel.minSpent) / (nextLevel.minSpent - currentLevel.minSpent)) * 100
      : 100;

    return {
      level: currentLevel.level,
      name: currentLevel.name,
      discount: currentLevel.discount,
      nextLevel: nextLevel ? { level: nextLevel.level, name: nextLevel.name, minSpent: nextLevel.minSpent } : null,
      progress: Math.min(progress, 100),
    };
  }

  /**
   * 获取积分交易记录
   */
  async getTransactions(userId, options = {}) {
    const { page = 1, limit = 20, category = null, type = null } = options;

    const where = { userId };
    if (category) where.category = category;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.creditTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取消费规则
   */
  async getConsumptionRules() {
    let rules = await prisma.consumptionRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    // 如果没有预设规则，返回默认规则
    if (rules.length === 0) {
      const defaultRules = Object.entries(DEFAULT_CONSUMPTION_RULES).map(([serviceType, config]) => ({
        serviceType,
        ...config,
      }));

      // 插入默认规则
      for (const rule of defaultRules) {
        await prisma.consumptionRule.create({
          data: {
            name: this.getServiceTypeName(serviceType),
            serviceType: rule.serviceType,
            baseCredits: rule.baseCredits,
            perTokenCredits: rule.perTokenCredits,
            perMinuteCredits: rule.perMinuteCredits,
            perRequestMin: rule.perRequestMin,
            perRequestMax: rule.perRequestMax,
            isActive: true,
            priority: 0,
          },
        });
      }

      rules = await prisma.consumptionRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });
    }

    return rules;
  }

  /**
   * 获取服务类型名称
   */
  getServiceTypeName(serviceType) {
    const names = {
      [ServiceType.AGENT_CHAT]: 'Agent 对话',
      [ServiceType.SKILL_EXECUTION]: 'Skill 执行',
      [ServiceType.EXPERT_CONSULT]: '专家咨询',
      [ServiceType.TASK_EXECUTION]: '任务执行',
      [ServiceType.DOCUMENT_GENERATION]: '文档生成',
      [ServiceType.KNOWLEDGE_QUERY]: '知识库查询',
    };
    return names[serviceType] || serviceType;
  }

  /**
   * 退款
   */
  async refundCredits(userId, amount, options = {}) {
    const {
      description = '积分退款',
      referenceId = null,
    } = options;

    if (amount <= 0) {
      throw new Error('退款积分必须大于0');
    }

    const account = await this.getOrCreateAccount(userId);

    const updatedAccount = await prisma.creditAccount.update({
      where: { id: account.id },
      data: {
        availableCredits: account.availableCredits + amount,
        spentCredits: Math.max(0, account.spentCredits - amount),
      },
    });

    // 记录交易
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: TransactionType.REFUND,
        amount: amount,
        balanceBefore: account.availableCredits,
        balanceAfter: updatedAccount.availableCredits,
        category: CreditCategory.REFUND,
        description,
        referenceId,
        status: 'completed',
      },
    });

    return {
      success: true,
      creditsRefunded: amount,
      availableCredits: updatedAccount.availableCredits,
    };
  }
}

export default new CreditService();
