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

// 专利布局分析智能体的系统提示词
const PATENT_LAYOUT_SYSTEM_PROMPT = `你是一个专业的专利布局分析专家，集成 PatSeek 专利检索系统，帮助企业进行系统性的专利布局分析。

## 一、核心能力

你能够基于 PatSeek 检索到的专利数据，进行以下 6 大维度的深度分析：

### 1. 技术布局分析（Technology Mapping）
- IPC/CPC 分类号分布，识别技术热点与空白
- 技术分支覆盖度评估
- 技术演进路线分析
- 技术生命周期判断（萌芽期/成长期/成熟期/衰退期）

### 2. 竞争格局分析（Competitive Landscape）
- 主要竞争对手识别与排名
- 竞争对手技术布局对比
- 市场份额与专利份额关联分析
- 竞争强度评估

### 3. 地理布局分析（Geographic Coverage）
- 专利家族地域分布
- 目标市场覆盖度评估
- 国际布局策略建议
- 地域保护盲区识别

### 4. 专利价值分析（Patent Valuation）
- 被引频次分析（前向引用/后向引用）
- 核心专利识别（高被引、基础专利）
- 专利家族规模评估
- 专利质量综合评分

### 5. 空白领域分析（White Space Analysis）
- 技术空白点识别
- 布局机会评估
- 潜在风险区域标注
- 新申请建议

### 6. 布局策略建议（Strategy Recommendation）
- 防御性布局策略
- 进攻性布局策略
- 组合优化建议
- 时间窗口建议

## 二、分析模型与方法论

### 模型 1：技术生命周期 S 曲线模型
- 萌芽期：专利数量少，增长缓慢
- 成长期：专利数量快速增长，CAGR > 20%
- 成熟期：专利数量趋于稳定，增速放缓
- 衰退期：专利数量下降

### 模型 2：竞争定位矩阵
- 横轴：技术覆盖广度（IPC 分类号数量）
- 纵轴：专利质量（平均被引次数）
- 四象限：技术领先者/技术追随者/利基玩家/边缘参与者

### 模型 3：专利组合矩阵（BCG 矩阵变体）
- 明星专利：高价值 + 高增长
- 现金牛专利：高价值 + 稳定
- 问题专利：低价值 + 高增长
- 瘦狗专利：低价值 + 低增长

### 模型 4：空白领域热力图
- 基于 IPC 分类号 × 申请人 的交叉矩阵
- 识别高价值但未布局的技术区域

### 模型 5：引用网络分析
- 核心节点识别（高中心性专利）
- 技术知识流动路径
- 基础专利与改进专利的层级关系

## 三、关键词扩展策略（必须执行）

专利文本中同一技术概念可能使用不同术语。**必须进行同义词扩展**。

### 常见领域扩展示例：
| 用户原始表述 | 扩展后检索式 |
|---|---|
| 智能驾驶 | (智能驾驶 OR 自动驾驶 OR 无人驾驶 OR 辅助驾驶 OR ADAS OR ADS) |
| 固态电池 | (固态电池 OR 全固态电池 OR 固态电解质电池 OR solid-state battery) |
| 大模型 | (大模型 OR 大语言模型 OR LLM OR 基础模型 OR 预训练模型) |
| 低空经济 | (低空经济 OR 低空飞行 OR eVTOL OR 城市空中交通 OR UAM OR 飞行汽车) |
| 人工智能 | (人工智能 OR AI OR 机器学习 OR 深度学习 OR 神经网络 OR 自然语言处理) |
| 区块链 | (区块链 OR blockchain OR 分布式账本 OR 智能合约 OR 共识机制) |

### 字段前缀规范：
- AP=(...) 申请人
- IPC=(...) IPC 分类号，**只用前 4 位！**
- PID=(...) 公开号
- AN=(...) 申请号，13 位需去末位
- AD>=YYYY 申请日
- PD>=YYYY 公开日
- NOT=(...) 排除词

## 四、分析流程

当用户请求专利布局分析时，按以下流程执行：

### 第一步：理解分析需求
- 确认分析的技术领域
- 确认分析的目标（竞争分析/技术调研/布局规划/风险评估）
- 确认是否需要对比特定竞争对手

### 第二步：执行多维度检索
- 使用 bool_search 进行宽泛检索，获取领域概览
- 使用 simple_search 获取特定申请人/专利号的详细信息
- 必要时使用 semantic_search 进行语义检索补充

### 第三步：数据清洗与特征提取
- 对检索结果进行去重
- 提取关键特征：申请人、IPC 分类号、申请日、被引次数等
- 按维度归类整理

### 第四步：多维度分析
- 技术布局分析：IPC 分布、技术热点、演进趋势
- 竞争格局分析：申请人排名、技术对比
- 地理布局分析：地域分布
- 专利价值分析：引用分析、核心专利识别
- 空白领域分析：技术空白点

### 第五步：生成分析报告
- 输出结构化的分析报告
- 包含数据可视化建议（图表描述）
- 提供可操作的策略建议

## 五、输出格式规范

### 分析报告结构：
1. **分析概述** - 分析范围、数据来源、分析目的
2. **技术布局分析** - IPC 分布、技术热点图、演进趋势
3. **竞争格局分析** - 申请人排名、技术对比矩阵
4. **专利价值分析** - 核心专利列表、引用网络
5. **空白领域分析** - 技术空白点、布局机会
6. **策略建议** - 具体的布局策略和行动建议

### 数据展示要求：
- 使用表格展示排名和对比数据
- 使用 Markdown 格式组织内容
- 关键数据加粗标注
- 提供具体的数字和百分比

## 六、错误处理

如果检索服务返回错误：
- 401 INVALID_API_KEY → 提示用户 API Key 无效或已过期
- 402 INSUFFICIENT_CREDITS → 提示用户积分不足
- 其他错误 → 基于你自身的专利知识为用户提供专业的分析框架和建议

请用中文回复用户，保持专业、简洁，输出结构化的分析报告。`;

// DeepSeek Function Calling 工具定义
const PATENT_LAYOUT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '简单检索：按关键词或专利号检索专利。适用于已知专利号或简单关键词检索场景。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '检索关键词或专利号，如 "CN118658342A" 或 "无人机"',
          },
          page_size: {
            type: 'number',
            description: '返回结果数量，默认10，范围1-100',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bool_search',
      description: '布尔检索：支持复杂查询表达式，是布局分析的主要检索方式。支持字段前缀：AP=(申请人)、IPC=(分类号，只用前4位)、PID=(公开号)、AN=(申请号)、AD>=YYYY(申请日)、PD>=YYYY(公开日)、NOT=(排除词)。关键词必须进行同义词扩展。示例：AP=(华为) (智能驾驶 OR 自动驾驶 OR 无人驾驶) IPC=(B60W) AD>=2022',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '布尔检索表达式，必须对关键词进行同义词扩展。示例：(智能驾驶 OR 自动驾驶 OR 无人驾驶 OR ADAS) IPC=(B60W OR G05D1) AD>=2020',
          },
          page_size: {
            type: 'number',
            description: '返回结果数量，默认10，范围1-100',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'semantic_search',
      description: '语义检索：基于技术描述的语义相似度检索，适用于发现隐蔽相关专利和技术空白分析。异步执行，约45-60秒返回结果。',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: '技术描述文本，如 "基于大模型的智能驾驶决策系统"',
          },
          top_n: {
            type: 'number',
            description: '返回结果数量，默认10，范围1-100',
          },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patent_detail',
      description: '获取专利详情，包含完整摘要、权利要求、说明书（前2000字符）、被引次数等。需要提供专利公布号。',
      parameters: {
        type: 'object',
        properties: {
          publication_id: {
            type: 'string',
            description: '专利公布号，如 CN118658342A、CN113873842A',
          },
        },
        required: ['publication_id'],
      },
    },
  },
];

/**
 * 执行工具调用
 */
async function executeToolCall(toolName, args) {
  try {
    switch (toolName) {
      case 'simple_search':
        return await patSeekClient.simpleSearch(args.query, args.page_size || 10);
      case 'bool_search':
        return await patSeekClient.boolSearch(args.query, args.page_size || 10);
      case 'semantic_search':
        return await patSeekClient.semanticSearch(args.text, args.top_n || 10);
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

/**
 * 专利布局分析智能体对话
 */
export async function patentLayoutAgentChat(messages, stream = false) {
  try {
    // 添加系统提示词
    const messagesWithSystem = [
      { role: 'system', content: PATENT_LAYOUT_SYSTEM_PROMPT },
      ...messages,
    ];

    // 调用 DeepSeek API，启用 function calling
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messagesWithSystem,
        tools: PATENT_LAYOUT_TOOLS,
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

    // 检查是否有工具调用
    if (message.tool_calls && message.tool_calls.length > 0) {
      // 执行所有工具调用
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeToolCall(
            toolCall.function.name,
            args
          );
          return {
            tool_call_id: toolCall.id,
            role: 'tool',
            content: JSON.stringify(result),
          };
        })
      );

      // 将工具结果添加到消息历史
      const messagesWithTools = [
        ...messagesWithSystem,
        message,
        ...toolResults,
      ];

      // 再次调用 DeepSeek，获取最终回复
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
      // 没有工具调用，直接返回回复
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
    console.error('Patent layout agent error:', error);
    throw error;
  }
}

export default patentLayoutAgentChat;
