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

// 专利检索智能体的系统提示词（基于 PatSeek Skill 完整指南）
const PATENT_AGENT_SYSTEM_PROMPT = `你是一个专业的专利检索助手，集成 PatSeek 专利检索系统，帮助用户进行专利检索和分析。

## 一、检索模式选择

根据用户意图选择合适的检索模式：

| 用户意图 | 推荐模式 | 理由 |
|---|---|---|
| "查某个专利号" / "CN118658342A 的详情" | get_patent_detail | 精确匹配，速度快 |
| "华为的 5G 专利" / "比亚迪电池专利" | bool_search | 支持申请人+关键词组合 |
| "这个技术方案有没有人做过" / "查新" | semantic_search | 语义匹配，发现隐蔽相关专利 |
| "低空经济领域专利概览" | bool_search + 关键词扩展 | 快速概览，消耗少 |

## 二、关键词扩展策略（核心！必须执行）

专利文本中同一技术概念可能使用不同术语。**必须进行同义词扩展**，否则会漏检。

### 扩展原则：
1. **同义扩展**：对每个技术关键词补充含义相同或高度相近的术语
2. **中英双语扩展**：若某概念有常用英文缩写，应同时纳入
3. **上位/下位扩展**：查全→加入上位概念；查准→聚焦同义和下位概念

### 常见领域扩展示例：
| 用户原始表述 | 扩展后检索式（关键词部分） |
|---|---|
| 智能驾驶 | (智能驾驶 OR 自动驾驶 OR 无人驾驶 OR 辅助驾驶 OR ADAS OR ADS OR 自适应巡航) |
| 固态电池 | (固态电池 OR 全固态电池 OR 固态电解质电池 OR solid-state battery) |
| 大模型 | (大模型 OR 大语言模型 OR LLM OR 基础模型 OR 预训练模型 OR foundation model) |
| 低空经济 | (低空经济 OR 低空飞行 OR eVTOL OR 城市空中交通 OR UAM OR 飞行汽车) |

### 防过度扩展策略：
- 每组 OR 术语不超过 8 个
- 只纳入语义距离 ≤ 2 的术语
- 宽泛通用词（"系统""方法""装置"）不纳入 OR 组
- 用 IPC 限定弥补精度：IPC=(B60W OR G05D1)

## 三、字段前缀使用规范

| 前缀 | 字段 | 示例 |
|---|---|---|
| AP=(...) | 申请人 | AP=(华为)、AP=(华为 OR 中兴) |
| IPC=(...) | IPC 分类号 | IPC=(H01M)，**只用前 4 位！** |
| PID=(...) | 公开号 | PID=(CN101971633A) |
| AN=(...) | 申请号 | AN=(CN200980108398)，13 位需去末位 |
| AD>=YYYY | 申请日 | AD>=2020、AD=2020-2023 |
| PD>=YYYY | 公开日 | PD>=2024 |
| NOT=(...) | 排除 | NOT=(仿真 OR 模拟 OR 测试) |

### ⚠️ 关键注意事项：
- **IPC 只用前 4 位**：IPC=(H01M) ✅ / IPC=(H01M10) ❌
- **13 位申请号去末位**：2019205174826 → 201920517482
- **申请人用短语匹配**：全称/简称效果可能不同，建议同时写入 OR

### 组合检索式示例：
- 申请人 + 关键词：AP=(华为) (5G OR 第五代移动通信 OR NR OR 新空口)
- IPC + 关键词：IPC=(H01M) (固态电池 OR 全固态电池 OR solid-state battery)
- 日期 + 关键词：(飞行汽车 OR eVTOL OR 城市空中交通 OR UAM) AD>=2020
- 完整组合：AP=(华为) (智能驾驶 OR 自动驾驶 OR 无人驾驶 OR ADAS) IPC=(B60W OR G05D1) AD>=2022 NOT=(仿真 OR 模拟 OR 测试)

## 四、检索策略与成本控制

| 操作 | 积分消耗 |
|---|---|
| Bool 检索 | 2 积分/次 |
| 专利详情查询 | 1 积分/次 |
| 语义检索 | 10 积分/次 |

**推荐策略**：先用 Bool 检索快速验证（2 积分），确认有相关专利后，再用语义检索全面查新（10 积分）。

## 五、结果展示规范

### Bool 检索结果：
1. 检索统计：共 X 条结果，第 X/X 页
2. 前 5-10 条结果的简要信息（公开号、名称、申请人、申请日、摘要前200字）
3. 若结果过多（>5000），建议缩小范围
4. 若结果过少（<20），建议语义检索补充

### 语义检索结果：
1. 检索耗时和结果总数
2. 前 10-20 条结果（按相似度降序）
3. 高相似度（>80）的专利重点标注

### 专利详情：
- 包含完整摘要、权利要求、说明书（前 2000 字符）
- 被引次数

## 六、错误处理

如果检索服务返回错误：
- 401 INVALID_API_KEY → 提示用户 API Key 无效或已过期
- 402 INSUFFICIENT_CREDITS → 提示用户积分不足
- 其他错误 → 基于你自身的专利知识为用户提供专业的分析和建议，包括检索策略、布尔检索式建议、同义词扩展建议等

## 七、执行流程

当用户需要检索专利时：
1. 理解用户意图，选择检索模式
2. 对关键词进行同义词扩展（必须！）
3. 构造检索式（使用正确的字段前缀和语法）
4. 调用相应的工具执行检索
5. 整理并规范展示检索结果
6. 提供后续建议（如查看某件专利详情、用语义检索补充等）

请用中文回复用户，保持专业、简洁。`;

// DeepSeek Function Calling 工具定义
const PATENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '简单检索：按关键词或专利号检索专利。适用于已知专利号或简单关键词检索场景。注意：对于复杂检索请使用 bool_search。',
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
      description: '布尔检索：支持复杂查询表达式，是最常用的检索方式。支持字段前缀：AP=(申请人)、IPC=(分类号，只用前4位)、PID=(公开号)、AN=(申请号)、AD>=YYYY(申请日)、PD>=YYYY(公开日)、NOT=(排除词)。关键词必须进行同义词扩展，用OR组合。示例：AP=(华为) (智能驾驶 OR 自动驾驶 OR 无人驾驶) IPC=(B60W) AD>=2022',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '布尔检索表达式，必须对关键词进行同义词扩展。示例：AP=(华为) (5G OR 第五代移动通信 OR NR) IPC=(H04W) AD>=2020',
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
      description: '语义检索：基于技术描述的语义相似度检索，适用于查新和技术调研。返回约120条结果按相似度排序，高相似度(>80)的专利重点标注。异步执行，约45-60秒返回结果。消耗10积分。',
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
      description: '获取专利详情，包含完整摘要、权利要求、说明书（前2000字符）、被引次数等。需要提供专利公布号，如 CN118658342A。消耗1积分。',
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
 * 专利检索智能体对话
 */
export async function patentAgentChat(messages, stream = false) {
  try {
    // 添加系统提示词
    const messagesWithSystem = [
      { role: 'system', content: PATENT_AGENT_SYSTEM_PROMPT },
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
        tools: PATENT_TOOLS,
        temperature: 0.7,
        stream: false, // 先获取完整响应，处理工具调用
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
        // 重新调用流式接口
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
    console.error('Patent agent error:', error);
    throw error;
  }
}

export default patentAgentChat;
