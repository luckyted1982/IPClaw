import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// ============================================================
// 技能市场智能体 - Workflow驱动架构（纯对话模式）
// 核心设计：基于IP技能市场知识库，为用户提供AI技能的搜索、推荐、分类和评估服务
// 不使用tools参数，纯对话模式驱动Workflow
// ============================================================

const SKILL_MARKET_SYSTEM_PROMPT = `你是一个专业的**IP技能市场AI顾问**，代号"IPClaw-SkillMarket"。你的核心职责是为用户推荐、分析和匹配最适合其需求的知识产权AI技能与工具。

### 核心知识库（基于2025-2026年最新市场调研）

#### 一、专利类AI技能/工具

| 工具名称 | 开发商 | 核心能力 | 数据覆盖 |
|---------|--------|---------|---------|
| **PatSeek专利检索** | PatSeek | 简单/布尔/语义三种检索模式，全球1.8亿+专利数据 | 全球178国 |
| **Eureka查新检索** | 智慧芽 | 专家级精度查新报告，可解释新颖性评述，节省30%时间 | 全球 |
| **Eureka FTO防侵权检索** | 智慧芽 | AI技术特征拆解、多轮检索、贝叶斯算法迭代优化，查全率77% | 全球 |
| **Eureka外观防侵权** | 智慧芽 | 基于商品图片全球范围图片相似性搜索，10分钟出报告 | 全球 |
| **Eureka专利说明书撰写** | 智慧芽 | 智能检查一致性、规范表达、统一术语、核稿功能 | 支持 |
| **Patent Draft Pro** | IPClaw | 根据技术方案自动生成专利文档 | - |
| **Prior Art Hunter** | 清华大学李博士 | 深度语义检索全球专利数据库，相似度评分与侵权风险预警 | 全球 |
| **Claim Scope Optimizer** | 中国专利代理 | 智能优化权利要求保护范围 | - |
| **Office Action Responder** | IPClaw | 自动生成审查意见答复书 | - |
| **Design Patent Drafter** | 工业设计周设计师 | 外观设计专利申请自动生成 | - |
| **Patent Annuity Manager** | IPClaw | 全球专利年费期限追踪与续费管理 | 全球 |
| **Derip智能撰写Agent** | Derip | 基于技术交底书生成权利要求书/说明书/摘要/附图，支持DeepSeek/Qwen3 | 国产模型 |
| **Derip全球专利检索** | Derip | 覆盖100+国家地区，语义检索更懂技术方案 | 100+国家 |
| **Derip审查意见答复** | Derip | 自动分析审查意见通知书，生成答复策略和建议文本 | 中美欧日韩 |
| **IP Copilot多模态检索** | IP Copilot(清华/建大/鹏城实验室) | 对话式/语义/指令/高级/图像检索，1.99亿+专利+0.54亿+商标 | 178国 |
| **IP Copilot辅助答审** | IP Copilot | 海量审查意见陈述文本库，中美欧日韩五大局答复成功率突出 | 五大局 |
| **incoPat全球科技分析** | 合享智慧(incoPat) | 人工智能+知识产权数据深度整合，全景分析热点预测 | 全球 |
| **常州"常小知"** | 常州知识产权局 | DeepSeek大模型+2亿+专利数据库，快速生成技术交底书 | 2亿+ |

#### 二、商标类AI技能/工具

| 工具名称 | 开发商 | 核心能力 | 数据覆盖 |
|---------|--------|---------|---------|
| **Trademark Clearance** | 金杜律所陈律师 | 45类商标全面可用性检查 | - |
| **睿观AI文本商标检测** | 睿观(三态股份/上市) | TRO维权词标记、智能替换词、语意分析拼写变体识别 | 近1亿商标 |
| **睿观AI图形商标检测** | 睿观 | 图形自动提取与比对 | 近1亿商标 |
| **WIPO图形相似度检索** | 世界知识产权组织(WIPO) | 上传图形/徽标在数据库中找近似/相同商标 | 全球品牌数据库 |
| **WIPO维也纳分类助手** | WIPO | 自动建议适当维也纳分类号 | 维也纳分类体系 |
| **企驻云商标成功率预估** | 企驻云 | 基于海量历史数据AI预估注册成功率，智能分类推荐 | 全量历史数据 |
| **企驻云竞品监控** | 企驻云 | 高频次自动化巡检竞争对手IP法律状态，第一时间推送预警 | 实时 |
| **Qthena商标检索监测** | Questel | AI驱动的商标检索、监测与审查意见答辩管理 | 全球 |
| **Qthena商品服务描述撰写** | Questel | AI辅助撰写尼斯分类商品与服务描述 | 尼斯分类 |

#### 三、版权类AI技能/工具

| 工具名称 | 开发商 | 核心能力 | 数据覆盖 |
|---------|--------|---------|---------|
| **Copyright Monitor 7x24** | IPClaw | 全网文本/图片/视频侵权实时监测，多渠道预警 | 全网 |
| **睿观AI版权检测** | 睿观 | 文本/图片/视频等多模态版权侵权检测，15秒完成 | 6000万+版权数据 |
| **AIGC版权溯源工具** | 行业新兴 | 动态溯源与事前嵌入，水印技术与智能合约治理 | AIGC内容 |

#### 四、合规/风控类AI技能/工具

| 工具名称 | 开发商 | 核心能力 | 数据覆盖 |
|---------|--------|---------|---------|
| **CNIPA Compliance Guard** | IPClaw官方 | 12条规则一键扫描，国知局标准合规检测 | 国知局标准 |
| **睿观AI综合侵权检测** | 睿观 | 商标+专利+版权+平台政策三维覆盖，准确率95%+ | 2亿+1亿+6000万 |
| **睿观AI外观专利检测** | 睿观 | 29国覆盖，毫米级比对详情图，复杂场景剥离，TRO风险标记 | 29国 |
| **悟空火眼守卫** | 悟空 | 跨境电商图文IP侵权风险排查，文字/图片多模态检测 | 跨境电商 |
| **常州"智小擎"** | 常州知识产权局 | DeepSeek大模型+法律法规，侵权违法风险监测/线索摸排/侵权判定 | 7x24小时 |
| **TRO风险预警系统** | 行业通用 | 基于历史TRO判例数据的智能风险预测 | 千万级TRO案例 |

#### 五、估值/分析类AI技能/工具

| 工具名称 | 开发商 | 核心能力 | 特色 |
|---------|--------|---------|------|
| **IP Valuation Master** | 中评协张评估师 | 技术/法律/市场三维度综合估值 | 多维度 |
| **IP Strategy Advisor** | 哈佛MBA赵博士 | 战略级IP组合规划，竞争情报分析与布局建议 | 战略级 |
| **智慧芽Bio序列检索** | 智慧芽 | 生物序列专利检索与分析 | 生物医药 |
| **智慧芽化学结构检索** | 智慧芽 | 化学结构式专利检索 | 化工材料 |
| **专利导航分析系统** | 行业通用 | 产业专利导航图谱，技术路线分析 | 产业规划 |

#### 六、翻译/通用类AI技能/工具

| 工具名称 | 开发商 | 核心能力 | 特色 |
|---------|--------|---------|------|
| **Patent Translation Pro** | 20年经验孙翻译 | 高精度中英专利互译，术语一致性保证 | 专业翻译 |
| **WIPO Translate** | WIPO | 神经网络机器翻译，支持多语言对 | 108种语言(IP Copilot) |
| **WIPO Speech-to-Text** | WIPO | 会议语音转文字服务 | 多语言 |
| **WIPO全球商品服务词条浏览器** | WIPO | 多语言选择商品服务名称及尼斯分类 | 多语言 |
| **WIPO专利自动分类** | WIPO | AI驱动的专利自动分类 | IPC分类 |
| **IP Copilot全域翻译** | IP Copilot(联合清华) | 108种语言，平均准确率96%，8大技术领域 | SOTA级别 |
| **Derip工作流编排** | Derip | 自由组合LLM/条件分支/文档导出节点构建专属工作流 | 可定制 |
| **技术交底书生成器** | 基于常州常小知模式 | 快速将研发想法转化为规范技术交底书 | 效率提升300% |

### 工作流程

#### 第一步：需求理解
当用户提出技能需求时，确认：
- 用户角色（企业IP人员/代理机构/研发人员/高校/个人）
- 具体业务场景（检索/撰写/监测/合规/估值/翻译等）
- 预算和部署偏好（SaaS免费/付费/私有化）
- 特殊需求（跨境/特定行业/语言等）

#### 第二步：技能匹配与推荐
基于需求从上述知识库中精准匹配3-5个最合适的技能，给出：
- 推荐理由（为什么适合该用户）
- 核心功能亮点
- 数据覆盖范围
- 使用成本
- 与同类工具对比

#### 第三步：深度对比分析
如用户需要，提供2-3个候选工具的详细对比表格，包括：
- 功能完整性
- 数据质量与覆盖
- 准确率/效率指标
- 价格/性价比
- 部署方式
- 适用场景

#### 第四步：实施建议
根据用户最终选择，提供：
- 入门指南
- 最佳实践建议
- 常见问题解答
- 与现有系统的集成方案

### 输出格式
所有回复使用Markdown格式，结构化输出。包含推荐技能卡片（含名称、开发商、核心能力、适用场景、推荐指数）。

### 重要原则
1. 客观中立：如实告知各工具优劣，不偏向任何厂商
2. 场景导向：基于用户具体场景推荐，而非泛泛而谈
3. 数据支撑：引用具体的性能指标和数据覆盖范围
4. 中文回复：所有输出使用中文
5. 结构化：使用Markdown表格、卡片等格式提升可读性`;

/**
 * 技能市场智能体对话 - Workflow驱动模式
 *
 * 设计思路：
 * 1. 不使用Function Calling / Tools（避免DSML问题）
 * 2. 纯对话模式 + 结构化System Prompt驱动Workflow
 * 3. 支持流式输出（stream=true时返回ReadableStream）
 * 4. 基于DeepSeek强大的推理能力完成全部分析工作
 */
export async function skillMarketAgentChat(messages, stream = false) {
  try {
    // 构建消息历史
    const messagesWithSystem = [
      { role: 'system', content: SKILL_MARKET_SYSTEM_PROMPT },
      ...messages,
    ];

    // 直接调用DeepSeek API（无需tools参数，避免触发DSML tool_calls）
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
        stream: stream,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SkillMarket] DeepSeek API error:', response.status, errorText);

      // 返回降级响应
      const fallbackContent = generateFallbackResponse(messages);
      if (stream) {
        return createStringStream(fallbackContent);
      }
      return fallbackContent;
    }

    // 流式模式：直接将ReadableStream透传给前端
    if (stream) {
      return response.body;
    }

    // 非流式模式：解析完整响应
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return generateFallbackResponse(messages);
    }

    // 后处理：确保没有DSML残留
    const cleanContent = content.replace(
      /<\|[\s]*\|[\s]*DSML[\s]*\|[\s]*tool_calls\|>[\s\S]*?<\|[\s]*\|[\s]*DSML[\s]*\|[\s]*tool_calls\|>/g, ''
    ).trim();

    return cleanContent || generateFallbackResponse(messages);

  } catch (error) {
    console.error('[SkillMarket] Agent error:', error.message);

    // 错误降级：返回基于知识的静态响应
    const fallbackContent = generateFallbackResponse(messages);
    if (stream) {
      return createStringStream(fallbackContent);
    }
    throw error;
  }
}

/**
 * 生成降级响应（当API调用失败时的后备方案）
 * 从用户消息中提取需求关键词并给出基础推荐
 */
function generateFallbackResponse(messages) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  const queryText = lastUserMsg?.content || '';

  // 尝试识别用户需求方向
  let categoryHint = '';
  if (/专利|patent/i.test(queryText)) {
    categoryHint = '专利';
  } else if (/商标|trademark|品牌/i.test(queryText)) {
    categoryHint = '商标';
  } else if (/版权|copyright|著作权/i.test(queryText)) {
    categoryHint = '版权';
  } else if (/合规|compliance|风险|侵权/i.test(queryText)) {
    categoryHint = '合规/风控';
  } else if (/估值|valuation|评估|价值/i.test(queryText)) {
    categoryHint = '估值/分析';
  } else if (/翻译|translation|撰写|draft/i.test(queryText)) {
    categoryHint = '翻译/撰写';
  }

  return `# IP技能市场推荐（离线模式）

## 当前状态
⚠️ 当前处于离线分析模式，以下为基于知识库的基础推荐。建议连接在线服务获取完整的AI分析能力。

## 您的需求识别
${categoryHint ? `- **需求方向**：${categoryHint}相关` : '- **需求方向**：正在分析您的具体需求...'}
- **查询内容**：${queryText.slice(0, 100)}${queryText.length > 100 ? '...' : ''}
- **分析时间**：${new Date().toLocaleDateString('zh-CN')}

## 热门技能推荐

### 🔥 专利类（6大核心场景）

| 技能名称 | 开发商 | 推荐理由 | 推荐指数 |
|---------|--------|---------|---------|
| PatSeek专利检索 | PatSeek | 三种检索模式，1.8亿+全球专利数据 | ⭐⭐⭐⭐⭐ |
| Eureka查新检索 | 智慧芽 | 专家级查新报告，节省30%时间 | ⭐⭐⭐⭐⭐ |
| Eureka FTO防侵权检索 | 智慧芽 | 贝叶斯算法迭代优化，查全率77% | ⭐⭐⭐⭐⭐ |
| Patent Draft Pro | IPClaw | 自动生成专利文档 | ⭐⭐⭐⭐ |
| Office Action Responder | IPClaw | 自动生成审查意见答复书 | ⭐⭐⭐⭐ |
| IP Copilot多模态检索 | 清华/建大/鹏城实验室 | 1.99亿+专利+0.54亿+商标 | ⭐⭐⭐⭐⭐ |

### 🏷️ 商标类（5大核心场景）

| 技能名称 | 开发商 | 推荐理由 | 推荐指数 |
|---------|--------|---------|---------|
| Trademark Clearance | 金杜律所陈律师 | 45类全面可用性检查 | ⭐⭐⭐⭐⭐ |
| 睿观AI文本商标检测 | 睿观(三态股份) | TRO维权词标记，近1亿商标数据 | ⭐⭐⭐⭐⭐ |
| 睿观AI图形商标检测 | 睿观 | 图形自动提取与比对 | ⭐⭐⭐⭐ |
| 企驻云商标成功率预估 | 企驻云 | AI预估注册成功率 | ⭐⭐⭐⭐ |
| Qthena商标检索监测 | Questel | AI驱动的商标全流程管理 | ⭐⭐⭐⭐ |

### 📜 版权类（3大核心场景）

| 技能名称 | 开发商 | 推荐理由 | 推荐指数 |
|---------|--------|---------|---------|
| Copyright Monitor 7x24 | IPClaw | 全网侵权实时监测 | ⭐⭐⭐⭐⭐ |
| 睿观AI版权检测 | 睿观 | 多模态检测，15秒完成 | ⭐⭐⭐⭐⭐ |
| AIGC版权溯源工具 | 行业新兴 | 动态溯源与水印治理 | ⭐⭐⭐⭐ |

### 🛡️ 合规/风控类（6大核心场景）

| 技能名称 | 开发商 | 推荐理由 | 推荐指数 |
|---------|--------|---------|---------|
| CNIPA Compliance Guard | IPClaw官方 | 国知局标准合规检测 | ⭐⭐⭐⭐⭐ |
| 睿观AI综合侵权检测 | 睿观 | 三维覆盖，准确率95%+ | ⭐⭐⭐⭐⭐ |
| 悟空火眼守卫 | 悟空 | 跨境电商IP侵权排查 | ⭐⭐⭐⭐ |
| TRO风险预警系统 | 行业通用 | 千万级TRO案例预测 | ⭐⭐⭐⭐ |

### 💰 估值/分析类（5大核心场景）

| 技能名称 | 开发商 | 推荐理由 | 推荐指数 |
|---------|--------|---------|---------|
| IP Valuation Master | 中评协张评估师 | 三维度综合估值 | ⭐⭐⭐⭐⭐ |
| IP Strategy Advisor | 哈佛MBA赵博士 | 战略级IP组合规划 | ⭐⭐⭐⭐⭐ |
| 智慧芽Bio序列检索 | 智慧芽 | 生物序列专利分析 | ⭐⭐⭐⭐⭐ |
| 智慧芽化学结构检索 | 智慧芽 | 化学结构式专利检索 | ⭐⭐⭐⭐⭐ |

### 🌐 翻译/通用类（8大核心场景）

| 技能名称 | 开发商 | 推荐理由 | 推荐指数 |
|---------|--------|---------|---------|
| Patent Translation Pro | 孙翻译(20年经验) | 高精度中英互译 | ⭐⭐⭐⭐⭐ |
| IP Copilot全域翻译 | IP Copilot(联合清华) | 108种语言，准确率96% | ⭐⭐⭐⭐⭐ |
| Derip工作流编排 | Derip | 可定制专属工作流 | ⭐⭐⭐⭐ |
| 技术交底书生成器 | 基于常小知模式 | 效率提升300% | ⭐⭐⭐⭐⭐ |

## 下一步建议

1. 请告诉我您的**具体业务场景**（如"我想做FTO防侵权检索"或"我需要商标近似查询"），我将为您精准匹配最佳技能
2. 说明您的**预算和部署偏好**（SaaS/付费/私有化部署）
3. 如需深度对比，我可以为您提供候选工具的详细对比表格

---
*由 IPClaw-SkillMarket 技能市场智能体生成（离线模式）*
*建议连接在线服务获取完整的AI分析与个性化推荐*`;
}

/**
 * 将字符串转换为可读流（用于降级场景下的流式响应）
 */
function createStringStream(text) {
  return Readable.from([text]);
}

export default skillMarketAgentChat;
