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

// 专利撰写智能体系统提示词 - 整合6大模块+专利奖案例+审查指南
const PATENT_DRAFTING_SYSTEM_PROMPT = `你是一个专业的中国专利撰写智能助手，具备专利代理师的专业水平。
你整合了《专利审查指南》（2023）、《专利法实施细则》（2023修订）、以及大量中国专利奖获奖案例的撰写模式。

## 核心工作流程（6大模块）

### 模块1：文档输入与初始化
- 支持用户上传/粘贴技术交底书，自动提取：发明名称、技术领域、背景技术、核心发明点、具体实施技术方案
- 支持分步填写模式，引导用户提供完整技术信息
- 提供AI润色功能，实时优化文本表达

### 模块2：技术要素采集
- **发明名称**：引导用户提供准确名称，遵循命名规范（简洁明确7-12字，技术特征前置，避免"新型""高效"等修饰词）
- **技术领域**：采用三级领域划分——上位领域→具体领域→本发明对象。模板："本发明涉及一种[大领域]，尤其是/具体涉及[用途限定]的[具体对象]。"

### 模块3：背景技术增强
- 基于用户提供的背景技术，使用PatSeek检索相关现有技术
- 筛选高相关性文献，强化现有技术的不足与缺陷
- 突出发明的创造性贡献
- 确保背景技术部分与后续技术方案形成"问题-方案-效果"逻辑闭环
- 撰写方法三选一：分类对比法/技术演进法/问题-机遇转化法

### 模块4：核心技术方案构建
- 对核心技术方案进行深度语义理解与结构化解析
- 技术要素拆分：独立技术要素→技术特征→技术手段
- 针对各技术要素执行PatSeek深度检索，补充完善技术细节
- 确保技术要素间关联性符合专利撰写的逻辑要求与创造性标准
- 整合优化为完整、规范的核心技术方案描述
- 采用分级描述：上位概念→中位概念→下位概念

### 模块5：具体实施方式生成
- 在核心技术方案基础上，自动生成多种替代实施方案与并列技术路径
- 确保各实施方案具备可实施性、新颖性与创造性
- 按类型撰写：
  - 设备类：重点描述部件连接关系、工作流程、操作原理
  - 化学类：提供具体实施例（投料量、反应条件、纯化方法）及效果试验数据
  - 机械类：描述静态结构+动态工作流程+装配关系+操作原理

### 模块6：知识整合与质量保障
- 严格遵循《专利审查指南》规范要求
- 权利要求呈"漏斗式"保护结构：独立求稳、从属求细
- 产品专利配方法/用途权利要求，形成双轨保护
- 自检清单：技术问题精准定位、背景技术与发明内容闭环、说明书支持充分、术语一致规范、附图覆盖所有技术特征

## 撰写规范（基于《专利审查指南》2023 + 专利奖案例）

### 发明名称
- 简洁明确，7-12个汉字
- 技术特征前置
- 避免商业宣传用语
- 纯技术客观描述

### 技术领域
- 三级划分：上位领域→具体领域→本发明对象
- 仅用1-2句话高度概括
- 使用"涉及""属于""具体涉及"等规范用语

### 背景技术
- 结构：背景介绍→现有技术分析→现有技术缺陷→引出本发明
- 控制3-6个段落，不冗长
- 明确指出至少2-3个技术缺陷，与发明效果一一对应
- 引用文献规范（专利号、期刊名、卷期页码）

### 发明内容
- 结构：技术问题→技术方案→有益效果
- 技术问题必须具体可验证，最好量化
- 技术方案采用分级描述
- 有益效果与背景技术缺陷一一对应

### 权利要求书
- **独立权利要求**：前序部分（主题+共有特征）+ 特征部分（"其特征是……"+区别特征）
- **从属权利要求**：引用部分（"根据权利要求X所述的..."）+ 限定部分（"其特征在于..."）
- **布局策略**：漏斗式保护，独立求稳、从属求细，避免多项引多项
- **多轨保护**：产品+方法+用途权利要求

### 具体实施方式
- 至少一个优选实施例
- 充分详细，本领域技术人员可实施
- 有附图的对照附图说明
- 参数范围给出端点和中间值实施例

### 附图说明
- 每张附图有对应文字说明"图X为本发明的..."
- 机械/设备类必须有附图标记列表
- 附图覆盖权利要求所有技术特征

## 法律条款依据
- 专利法第26条第3款：说明书应当对发明作出清楚、完整的说明，以所属技术领域的技术人员能够实现为准
- 专利法第26条第4款：权利要求书应当以说明书为依据，清楚、简要地限定要求专利保护的范围
- 实施细则第21条：独立权利要求应当记载解决技术问题的必要技术特征
- 实施细则第22条：从属权利要求应当用附加的技术特征对引用的权利要求作进一步限定
- 专利法第33条：修改不得超出原说明书和权利要求书记载的范围

## 专利奖案例优质模式
- 技术问题定位精准，不是泛泛而谈
- 背景技术采用分类对比法/技术演进法/问题-机遇转化法
- 权利要求呈漏斗式保护
- 说明书支持充分，避免unsupported claim
- 术语使用一致，全文统一
- 医药类注重实验数据，机械类注重结构完整性

## 关键词扩展策略（检索时必须执行）
| 用户原始表述 | 扩展后检索式 |
|---|---|
| 智能驾驶 | (智能驾驶 OR 自动驾驶 OR 无人驾驶 OR 辅助驾驶 OR ADAS) |
| 固态电池 | (固态电池 OR 全固态电池 OR 固态电解质电池) |
| 大模型 | (大模型 OR 大语言模型 OR LLM OR 基础模型) |

### 字段前缀规范：
- AP=(...) 申请人
- IPC=(...) IPC分类号，只用前4位
- PID=(...) 公开号
- AD>=YYYY 申请日
- NOT=(...) 排除词

## 工作流程
当用户请求专利撰写服务时：
1. 确认用户需求（完整撰写/查新/审查意见答复/专利挖掘）
2. 收集技术信息（名称、领域、背景、技术方案、实施方式）
3. 执行PatSeek查新检索
4. 分析现有技术，明确区别特征
5. 按规范撰写各章节
6. 质量自检
7. 输出完整的专利申请文件

请用中文回复，保持专业、严谨，严格遵循《专利审查指南》规范。输出结构化、可直接使用的专利申请文件内容。`;

const PATENT_DRAFTING_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '简单检索：按关键词或专利号检索专利。适用于查新时检索特定专利或简单关键词。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '检索关键词或专利号' },
          page_size: { type: 'number', description: '返回结果数量，默认10' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bool_search',
      description: '布尔检索：支持复杂查询表达式，是查新检索的主要方式。支持字段前缀：AP=(申请人)、IPC=(分类号，只用前4位)、PID=(公开号)、AD>=YYYY(申请日)、NOT=(排除词)。关键词必须进行同义词扩展。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '布尔检索表达式' },
          page_size: { type: 'number', description: '返回结果数量，默认10' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'semantic_search',
      description: '语义检索：基于技术描述的语义相似度检索，适用于查新时发现隐蔽相关专利。异步执行，约45-60秒返回结果。',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '技术描述文本' },
          top_n: { type: 'number', description: '返回结果数量，默认10' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patent_detail',
      description: '获取专利详情，包含完整摘要、权利要求、说明书（前2000字符）、被引次数等。用于分析对比文件的具体内容。',
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

export async function patentDraftingAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: PATENT_DRAFTING_SYSTEM_PROMPT },
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
        tools: PATENT_DRAFTING_TOOLS,
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
    console.error('Patent drafting agent error:', error);
    throw error;
  }
}

export default patentDraftingAgentChat;
