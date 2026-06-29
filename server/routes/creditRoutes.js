import express from 'express';
import creditService from '../services/CreditService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * 获取当前用户的积分账户信息
 * GET /api/credits/account
 */
router.get('/account', authenticateToken, async (req, res) => {
  try {
    const accountInfo = await creditService.getAccountInfo(req.user.id);
    res.json(accountInfo);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: '获取账户信息失败', details: error.message });
  }
});

/**
 * 获取积分交易记录
 * GET /api/credits/transactions
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;
    const result = await creditService.getTransactions(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      type,
    });
    res.json(result);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: '获取交易记录失败', details: error.message });
  }
});

/**
 * 获取消费规则
 * GET /api/credits/rules
 */
router.get('/rules', authenticateToken, async (req, res) => {
  try {
    const rules = await creditService.getConsumptionRules();
    res.json(rules);
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: '获取消费规则失败', details: error.message });
  }
});

/**
 * 计算积分消耗（预览，不实际扣费）
 * POST /api/credits/calculate
 */
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { serviceType, modelName, inputTokens, outputTokens, durationMinutes, complexity } = req.body;

    let estimatedCredits = 0;
    let description = '';

    switch (serviceType) {
      case 'agent_chat':
        estimatedCredits = creditService.calculateChatCredits(modelName || 'deepseek-chat', inputTokens || 0, outputTokens || 0);
        description = `Agent 对话 (${inputTokens + outputTokens} tokens)`;
        break;
      case 'task_execution':
        estimatedCredits = creditService.calculateTaskCredits(durationMinutes || 1, complexity || 'medium');
        description = `任务执行 (${durationMinutes} 分钟)`;
        break;
      case 'document_generation':
        estimatedCredits = creditService.calculateDocumentCredits(modelName || 'deepseek-chat', inputTokens || 1000);
        description = `文档生成 (${inputTokens} tokens)`;
        break;
      default:
        return res.status(400).json({ error: '未知服务类型' });
    }

    res.json({
      estimatedCredits,
      serviceType,
      description,
      modelName,
      inputTokens,
      outputTokens,
    });
  } catch (error) {
    console.error('Calculate credits error:', error);
    res.status(500).json({ error: '计算积分失败', details: error.message });
  }
});

/**
 * 模拟消费积分（仅用于测试）
 * POST /api/credits/deduct
 */
router.post('/deduct', authenticateToken, async (req, res) => {
  try {
    const { amount, description, serviceType, modelName, inputTokens, outputTokens } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: '请提供有效的积分数量' });
    }

    const result = await creditService.consumeCredits(req.user.id, amount, {
      category: 'chat',
      description: description || '积分消费',
      serviceType,
      modelName,
      inputTokens,
      outputTokens,
    });

    res.json({
      success: true,
      message: `成功消耗 ${result.creditsConsumed} 积分`,
      ...result,
    });
  } catch (error) {
    console.error('Deduct credits error:', error);
    res.status(400).json({ error: error.message || '扣费失败' });
  }
});

export default router;
