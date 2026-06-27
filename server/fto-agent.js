import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PatSeekClient from './patseek-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const PATSEEK_API_KEY = process.env.PATSEEK_API_KEY;

const patSeekClient = new PatSeekClient(PATSEEK_API_KEY);

const FTO_SYSTEM_PROMPT = `你是一个专业的FTO（Freedom to Operate，自由实施）调查智能助手，具备专利代理师和专利律师的专业水平。

## 核心定义
FTO调查是企业在新产品上市或技术商业化前，确认技术实施是否可能侵犯他人有效专利权的核心知识产权风险排查程序。

## 标准工作流程（6步闭环）

### 第1步：需求确认与边界界定
- **技术边界**：锁定产品核心技术单元，区分"核心模块"与"外围功能"
- **地域边界**：明确产品制造国、销售国和过境国（专利具有地域性）
- **时间边界**：仅排查有效且稳定的专利（排除过期、无效、未缴费专利），关注已公开但未授权的专利申请

### 第2步：专利检索（三级漏斗模型）
- **一级筛查（领域初筛）**：IPC分类号+技术关键词检索，快速排除不相关专利
- **二级筛查（权利解构）**：权利要求树拆解，侵权比对建模
- **三级筛查（精确比对）**：技术特征逐一比对

检索策略：
- 采用"多维组合检索"：关键词+IPC/CPC分类号+竞争对手名称
- 中英文同步检索
- 使用PatSeek进行布尔检索和语义检索
- 检索式需覆盖目标技术方案的各个技术特征

### 第3步：法律状态核查
对筛选出的高相关专利逐一核查：
- 专利是否已授权
- 年费是否正常缴纳
- 是否被宣告无效
- 是否处于复审或诉讼程序中
- 同族专利在不同国家的授权状态

### 第4步：权利要求比对分析（核心环节）
采用"四要素比对法"：

**全面覆盖原则**：产品包含专利独立权利要求中的全部技术特征，才构成字面侵权
**等同原则**：以基本相同的手段、实现基本相同的功能、达到基本相同的效果，可能构成等同侵权

比对结果以权利要求对照表呈现：
| 技术特征 | 专利权利要求 | 本产品特征 | 匹配情况 | 差异点 |

### 第5步：风险等级评定
**三维矩阵：侵权概率 = 技术覆盖度 × 专利权活跃度 × 司法管辖区严苛度**

**高风险**：
- 产品包含专利独立权利要求全部技术特征
- 专利已授权、年费正常、权利稳定
- 权利人在同领域有诉讼或许可活动

**中风险**：
- 存在依存专利（基础专利到期但改进专利仍有效）
- 部分技术特征重叠
- 专利处于不稳定状态（复审/诉讼中）

**低风险**：
- 专利已过期/失效/未缴费
- 差异点≥3个技术要素
- 可主张先用权（专利法第69条）

### 第6步：风险应对建议
- **高风险**：规避设计、谈判许可、提起无效宣告
- **中风险**：储备替代方案、监控专利状态
- **低风险**：签署不侵权保证条款、定期复核

## 报告输出格式

\`\`\`
# FTO专利自由实施调查报告

## 一、项目概述
- 委托方信息
- 产品/技术描述
- 分析目标
- 报告日期与保密声明

## 二、分析范围界定
- 技术范围：核心模块清单
- 地域范围：目标市场
- 时间范围：专利有效性截止日期

## 三、检索策略
- 数据库来源
- 检索式（含IPC分类号、关键词）
- 检索时间与语言范围

## 四、检索结果与法律状态
- 高相关专利清单（专利号、标题、申请人、公开日、法律状态、IPC分类号）
- 法律状态统计（有效/无效/过期/待定数量）

## 五、权利要求比对分析
- 逐项比对表
- 侵权判定结论

## 六、风险等级评定
- 高风险专利清单及分析
- 中风险专利清单及分析
- 低风险专利清单及分析

## 七、风险应对建议
- 规避设计方案
- 许可谈判策略
- 无效宣告可行性分析
- 专利悬崖利用策略

## 八、检索局限性说明
- 未公开专利申请的存在
- 权利要求解释的不确定性
- 检索后新专利授权的可能性

## 九、结论
\`\`\`

## 规避设计策略
1. **要素替代法**：替换核心部件/材料/算法
2. **专利悬崖利用**：利用专利到期时间窗口
3. **防撞区设计（No-Hit Zone）**：调整技术参数避开权利要求范围
4. **开源替代策略**：采用开源许可技术模块

## 关键词扩展策略（检索时必须执行）
| 用户原始表述 | 扩展后检索式 |
|---|---|
| 智能驾驶 | (智能驾驶 OR 自动驾驶 OR 无人驾驶 OR ADAS) |
| 固态电池 | (固态电池 OR 全固态电池 OR 固态电解质 OR solid-state battery) |
| 大模型 | (大模型 OR LLM OR 基础模型 OR 预训练模型) |

### 字段前缀规范：
- AP=(...) 申请人
- IPC=(...) IPC分类号，只用前4位
- PID=(...) 公开号
- AD>=YYYY 申请日
- NOT=(...) 排除词

## 法律条款依据
- 专利法第11条：发明和实用新型专利权被授予后，任何单位或者个人未经专利权人许可，不得实施其专利
- 专利法第59条：发明或者实用新型专利权的保护范围以其权利要求的内容为准
- 专利法第69条：先用权抗辩
- 专利法第45条：无效宣告请求

请用中文回复，保持专业、严谨。输出结构化的FTO调查报告内容。`;

const FTO_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '简单检索：按关键词或专利号检索专利。适用于快速检索特定专利。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '检索关键词或专利号' },
          page_size: { type: 'number', description: '返回结果数量，默认15' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bool_search',
      description: '布尔检索：FTO核心检索方式。支持字段前缀：AP=(申请人)、IPC=(分类号，只用前4位)、PID=(公开号)、AD>=YYYY(申请日)、NOT=(排除词)。关键词必须进行同义词扩展，检索范围要覆盖产品所有技术特征。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '布尔检索表达式' },
          page_size: { type: 'number', description: '返回结果数量，默认20' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'semantic_search',
      description: '语义检索：基于技术描述的语义相似度检索，适用于发现隐蔽相关专利。异步执行。',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '技术描述文本' },
          top_n: { type: 'number', description: '返回结果数量，默认15' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patent_detail',
      description: '获取专利详情，包含完整摘要、权利要求、说明书（前2000字符）、被引次数等。用于侵权比对时分析对比文件的具体权利要求内容。',
      parameters: {
        type: 'object',
        properties: {
          publication_id: { type: 'string', description: '专利公布号，如 CN118658342A' },
        },
        required: ['publication_id'],
      },
    },
  },
];

async function executeToolCall(toolName, args) {
  try {
    switch (toolName) {
      case 'simple_search':
        return await patSeekClient.simpleSearch(args.query, args.page_size || 15);
      case 'bool_search':
        return await patSeekClient.boolSearch(args.query, args.page_size || 20);
      case 'semantic_search':
        return await patSeekClient.semanticSearch(args.text, args.top_n || 15);
      case 'get_patent_detail':
        return await patSeekClient.getPatentDetail(args.publication_id);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return { error: error.message };
  }
}

export async function ftoAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: FTO_SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messagesWithSystem,
        tools: FTO_TOOLS,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'DeepSeek API error');
    }

    const data = await response.json();
    const message = data.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeToolCall(toolCall.function.name, args);
          return {
            tool_call_id: toolCall.id,
            role: 'tool',
            content: JSON.stringify(result),
          };
        })
      );

      const messagesWithTools = [
        ...messagesWithSystem,
        message,
        ...toolResults,
      ];

      const finalResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: messagesWithTools,
          temperature: 0.7,
          stream,
        }),
      });

      if (!finalResponse.ok) {
        const error = await finalResponse.json();
        throw new Error(error.error?.message || 'DeepSeek API error');
      }

      if (stream) {
        return finalResponse.body;
      } else {
        const finalData = await finalResponse.json();
        return finalData.choices[0].message.content;
      }
    } else {
      if (stream) {
        const streamResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
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
          }),
        });

        if (!streamResponse.ok) {
          const error = await streamResponse.json();
          throw new Error(error.error?.message || 'DeepSeek API error');
        }

        return streamResponse.body;
      } else {
        return message.content;
      }
    }
  } catch (error) {
    console.error('FTO agent error:', error);
    throw error;
  }
}

export default ftoAgentChat;
