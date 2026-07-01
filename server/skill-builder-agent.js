import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// ════════════════════════════════════════════════
//  In-Memory Skill Store (生产环境应替换为数据库)
// ════════════════════════════════════════════════

const customSkillsStore = new Map();

// ════════════════════════════════════════════════
//  System Prompt - 技能架构师角色定义
// ════════════════════════════════════════════════

const SKILL_BUILDER_SYSTEM_PROMPT = `你是一个专业的**IP技能架构师**（Skill Architect），代号"IPClaw-Builder"。你的核心职责是通过多轮对话帮助用户创建高质量、可部署的AI技能。

## 你的能力

1. **需求分析** — 精准理解用户想创建什么类型的技能
2. **行为设计** — 设计技能的输入/输出格式、工作流程、边界条件
3. **提示词工程** — 生成专业、安全、高效的System Prompt
4. **元数据提取** — 从对话中自动提取技能名称、分类、描述、标签等
5. **迭代优化** — 根据用户反馈持续改进技能设计

## 工作流程

### 第一轮：需求探索
- 确认用户想创建的技能类型和用途
- 了解目标用户群体和使用场景
- 识别核心功能和边界情况

### 第二轮：设计确认
- 提出技能设计方案供用户确认
- 包括：输入输出格式、触发条件、异常处理策略
- 给出建议的分类和标签

### 第三轮：提示词生成
- 基于确认的设计方案，生成完整的System Prompt
- 提示词需包含：角色定义、能力描述、工作规则、输出格式、安全约束
- 使用Markdown代码块(\`\`\`prompt)包裹生成的提示词

### 后续轮次：优化迭代
- 根据用户反馈调整提示词细节
- 添加或修改特定功能模块
- 优化输出质量和安全性

## 输出规范

### 对话回复格式（普通对话）
使用自然语言，友好专业地与用户交流。

### 当生成System Prompt时，必须用以下JSON格式附加在消息末尾：
\`\`\`json
{
  "skillData": {
    "name": "技能名称",
    "category": "分类(专利/商标/版权/合规风控/估值分析/翻译通用)",
    "description": "功能描述",
    "systemPrompt": "完整的系统提示词内容..."
  }
}
\`\`\`

## 重要原则
1. 生成的System Prompt必须完整、可直接使用
2. 包含明确的安全约束和边界处理
3. 避免过于复杂，保持聚焦于核心功能
4. 使用中文作为主要语言
5. 尊重知识产权，不复制现有商业产品的提示词`;

// ════════════════════════════════════════════════
//  Main Handler
// ════════════════════════════════════════════════

/**
 * 技能构建器API - 处理两种操作：
 * 1. action='chat' — 多轮对话，生成技能提示词
 * 2. action='publish' — 发布技能到市场
 */
export async function skillBuilderHandler(req, res) {
  try {
    const { action } = req.body;

    if (action === 'chat') {
      return await handleChat(req, res);
    }

    if (action === 'publish') {
      return await handlePublish(req, res);
    }

    res.status(400).json({ error: '无效的操作类型', validActions: ['chat', 'publish'] });
  } catch (error) {
    console.error('[SkillBuilder] Error:', error.message);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
}

// ════════════════════════════════════════════════
//  Chat Handler - AI多轮对话
// ════════════════════════════════════════════════

async function handleChat(req, res) {
  const { messages, userInput, currentDraft } = req.body;

  // 构建消息历史
  const messagesWithSystem = [
    { role: 'system', content: SKILL_BUILDER_SYSTEM_PROMPT },
    ...(messages || []),
  ];

  // 如果有已存在的草稿信息，追加上下文
  if (currentDraft && (currentDraft.name || currentDraft.category)) {
    messagesWithSystem.push({
      role: 'system',
      content: `[当前草稿状态] 名称:${currentDraft.name || '未命名'} | 分类:${currentDraft.category || '未指定'} | 描述:${currentDraft.description || '无'}`,
    });
  }

  // 调用DeepSeek API
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: messagesWithSystem,
      temperature: 0.7,
      stream: true,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    console.error('[SkillBuilder] DeepSeek error:', response.status);
    // 返回降级响应流
    const fallbackContent = generateChatFallback(userInput);
    return createSSEStream(res, fallbackContent, null);
  }

  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 流式转发DeepSeek响应
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  return new Promise((resolve, reject) => {
    response.body.on('data', (chunk) => {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') {
          res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
          }
        } catch {
          // 忽略非JSON行
        }
      }
    });

    response.body.on('end', () => {
      try {
        // 处理最后剩余的数据
        if (buffer) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim();
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }

        // 尝试从完整响应中提取skillData
        const skillData = extractSkillData(fullContent);
        if (skillData) {
          res.write(`data: ${JSON.stringify({ skillData })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
        resolve();
      } catch (error) {
        console.error('[SkillBuilder] Stream end error:', error);
        res.end();
        resolve();
      }
    });

    response.body.on('error', (streamError) => {
      console.error('[SkillBuilder] Stream error:', streamError);
      res.end();
      resolve();
    });
  });
}

// ════════════════════════════════════════════════
//  Publish Handler - 发布技能到市场
// ════════════════════════════════════════════════

async function handlePublish(req, res) {
  const { skill } = req.body;

  if (!skill || !skill.name || !skill.systemPrompt) {
    return res.status(400).json({
      success: false,
      error: '缺少必要字段：name 和 systemPrompt 是必填项',
    });
  }

  // 生成唯一ID和时间戳
  const skillId = `custom_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const publishedAt = new Date().toISOString();

  // 构建完整的技能对象
  const publishedSkill = {
    id: skillId,
    name: skill.name,
    category: skill.category || '通用',
    description: skill.description || '',
    icon: skill.icon || 'wand-2',
    tags: skill.tags || [],
    installs: 0,
    installed: false,
    rating: 0,
    reviews: 0,
    owner: {
      name: skill.author || 'IPClaw 用户',
      title: '个人开发者',
      initials: (skill.author || 'I')[0],
      avatarColor: '#FACC15',
      verified: false,
    },
    featured: false,
    topRated: false,
    // 加密后的提示词（如果启用保护）
    encryptedPrompt: skill.encryptedPrompt || '',
    createdAt: publishedAt,
    isCustom: true, // 标记为用户自定义技能
  };

  // 存储到内存（生产环境替换为数据库）
  customSkillsStore.set(skillId, publishedSkill);

  console.log(`[SkillBuilder] Skill published: ${skill.name} (${skillId})`);

  res.json({
    success: true,
    skill: publishedSkill,
    message: `技能「${skill.name}」发布成功！`,
  });
}

// ════════════════════════════════════════════════
//  Utility Functions
// ════════════════════════════════════════════════

/**
 * 从AI响应中提取skillData JSON块
 */
function extractSkillData(content) {
  // 匹配 ```json ... ``` 中的skillData
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/i);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      if (parsed.skillData) return parsed.skillData;
    } catch {
      // 解析失败，继续尝试其他方式
    }
  }

  // 直接匹配skillData对象
  const skillDataMatch = content.match(/\{[\s\S]*?"skillData"[\s\S]*?\}[\s\S]*?\}/);
  if (skillDataMatch) {
    try {
      const parsed = JSON.parse(skillDataMatch[0]);
      if (parsed.skillData) return parsed.skillData;
    } catch {
      // 解析失败
    }
  }

  return null;
}

/**
 * 生成聊天降级响应（API不可用时）
 */
function generateChatFallback(userInput) {
  const input = (userInput || '').toLowerCase();

  // 尝试推断技能类别
  let category = '通用';
  let suggestedName = '自定义技能';
  let promptTemplate = '';

  if (/专利|patent|查新|检索|撰写|FTO|侵权/i.test(input)) {
    category = '专利';
    suggestedName = input.includes('查新') ? '智能专利查新分析师' :
                    input.includes('撰写') ? '专利撰写助手' :
                    input.includes('FTO') ? 'FTO防侵权专家' : '专利智能助手';
    promptTemplate = `你是一个专业的${suggestedName}。你的任务是${input.includes('查新') ? '对给定技术方案进行新颖性检索和分析' : input.includes('撰写') ? '根据技术交底书生成规范的专利申请文件' : '为用户提供专业的专利相关服务'}。

## 核心能力
- 深入理解技术方案的实质创新点
- 基于法律法规提供专业意见
- 结构化输出分析结果

## 工作规则
1. 首先确认用户的具体需求
2. 基于专业知识进行分析
3. 给出可执行的建议
4. 如有不确定之处主动询问

## 输出格式
使用Markdown结构化输出，包含必要的表格和列表。`;
  } else if (/商标|trademark|品牌|近似|注册|监测/i.test(input)) {
    category = '商标';
    suggestedName = '商标智能顾问';
    promptTemplate = `你是一个专业的商标智能顾问。你的任务是为用户提供商标相关的专业服务，包括商标近似查询、注册风险评估、商标监测预警等。

## 核心能力
- 商标近似度分析与评估
- 注册成功率预测
- 品牌保护策略建议

## 工作规则
1. 准确理解用户的商标需求
2. 基于尼斯分类体系进行分析
3. 提供具体可行的行动建议`;
  } else if (/版权|copyright|著作权|侵权|监测/i.test(input)) {
    category = '版权';
    suggestedName = '版权保护专家';
    promptTemplate = `你是一个专业的版权保护专家。你的任务是为用户提供版权登记、侵权监测、维权支持等服务。`;
  } else if (/合规|compliance|风险|扫描/i.test(input)) {
    category = '合规风控';
    suggestedName = 'IP合规审查员';
    promptTemplate = `你是一个专业的IP合规审查员。你的任务是为用户提供知识产权合规性检查和风险预警服务。`;
  } else if (/估值|valuation|价值|评估/i.test(input)) {
    category = '估值分析';
    suggestedName = 'IP价值评估师';
    promptTemplate = `你是一个专业的IP价值评估师。你的任务是为用户提供知识产权的价值评估服务，包括成本法、收益法、市场法等多种评估方法。`;
  } else if (/翻译|translation|语言/i.test(input)) {
    category = '翻译通用';
    suggestedName = 'IP翻译专家';
    promptTemplate = `你是一个专业的IP翻译专家。你的任务是为用户提供高质量的知识产权文档翻译服务，确保术语准确性和法律效力。`;
  } else {
    suggestedName = 'IP智能助手';
    promptTemplate = `你是一个专业的知识产权AI助手。请根据用户的需求提供专业的IP相关服务和建议。`;
  }

  return `感谢你的详细描述！基于你的需求，我为你生成了初步的技能方案：

## 技能概要
- **名称**: ${suggestedName}
- **分类**: ${category}
- **定位**: 基于"${input.slice(0, 50)}${input.length > 50 ? '...' : ''}"的需求定制

## 已生成的系统提示词如下：

\`\`\`prompt
${promptTemplate}
\`\`\`

> 你可以在下一步中调整和完善这个提示词。如需修改任何部分，请告诉我！

\`\`\`json
{
  "skillData": {
    "name": "${suggestedName}",
    "category": "${category}",
    "description": "基于用户需求定制的${category}类AI技能",
    "systemPrompt": ${JSON.stringify(promptTemplate)}
  }
}
\`\`\``;
}

/**
 * 创建SSE流式响应
 */
function createSSEStream(res, content, skillData) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // 分块发送内容以模拟流式效果
  const chunkSize = 20;
  let offset = 0;

  const interval = setInterval(() => {
    if (offset < content.length) {
      const chunk = content.slice(offset, offset + chunkSize);
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      offset += chunkSize;
    } else {
      if (skillData) {
        res.write(`data: ${JSON.stringify({ skillData })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
      clearInterval(interval);
    }
  }, 30);

  return res;
}

/**
 * 获取所有已发布的自定义技能（用于查询）
 */
export function getCustomSkills() {
  return Array.from(customSkillsStore.values());
}

export default skillBuilderHandler;
