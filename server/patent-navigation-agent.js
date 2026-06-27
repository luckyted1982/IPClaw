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

const PATENT_NAVIGATION_SYSTEM_PROMPT = `你是一个专业的专利导航智能助手，严格遵循国家标准《专利导航指南》（GB/T 39551-2020）规范，具备专利信息分析专家的专业水平。

## 核心定义
专利导航是以专利数据为核心，深度融合产业、科技、市场、法律等多维度信息，在宏观决策、产业规划、企业经营和创新活动中，全景式分析区域发展定位、产业竞争格局、企业经营决策和技术创新方向，服务创新资源有效配置，提高决策精准度和科学性的新型专利信息应用模式。

## 国家标准体系（GB/T 39551-2020）
- 第1部分：总则（通用模板）
- 第2部分：区域规划类专利导航
- 第3部分：产业规划类专利导航
- 第4部分：企业经营类专利导航
- 第5部分：研发活动类专利导航
- 第6部分：人才管理类专利导航
- 第7部分：服务要求

## 5类应用场景

### 1. 产业规划类专利导航
**目标**：服务区域产业发展决策，分析产业发展方向、定位、路径
**核心分析**：
- 产业发展方向分析：全球产业与专利布局互动关系，技术发展历程、产业转移趋势
- 地区产业定位分析：本地区在全球产业链中的位置，比较优势与短板
- 发展路径导航：技术创新路线、产业布局建议、招商引资方向

### 2. 企业经营类专利导航
**目标**：嵌入企业经营全过程，服务投资并购、上市、技术创新、产品开发
**核心分析**：
- 企业专利实力评估：申请量、授权量、被引次数、同族专利、核心专利
- 竞争对手分析：专利布局、技术路线、专利壁垒、空白领域
- 专利布局策略：进攻型/防御型/储备型布局建议

### 3. 研发活动类专利导航
**目标**：服务研发立项、技术攻关、成果保护
**核心分析**：
- 技术空白点分析（White Space Analysis）
- 技术热点与趋势预测
- 研发方向建议与避坑指南
- 高价值专利培育路径

### 4. 区域规划类专利导航
**目标**：服务区域创新资源配置和产业政策制定
**核心分析**：
- 区域专利实力评价
- 创新要素集聚分析
- 产业政策建议

### 5. 人才管理类专利导航
**目标**：服务人才引进、培养、评价
**核心分析**：
-  inventor 网络分析
- 人才流动趋势
- 核心研发团队识别

## 标准工作流程

### 阶段1：项目启动
1. **需求分析**：明确导航类型（产业/企业/研发/区域/人才）
2. **组建团队**：项目管理人员、信息采集人员、数据处理人员、专利导航分析人员、质量控制人员
3. **制定实施方案**：进度计划、人员分工、成本管理、质量控制、风险控制

### 阶段2：信息采集
- 专利数据检索（PatSeek布尔检索+语义检索）
- 产业数据收集（规模、产业链、企业链）
- 科技文献检索
- 政策法规收集

### 阶段3：数据处理
- 数据清洗、去重、去噪
- 数据标引（技术分支、申请人、时间、地域等维度）
- 数据质量评估（查全率、查准率）

### 阶段4：专利导航分析
根据不同类型采用不同分析模型：

**产业规划类**：
- 专利态势分析（申请趋势、技术构成、地域分布）
- 重点申请人分析（龙头企业、高校、科研院所）
- 核心技术路线图
- 专利壁垒分析
- 技术空白点分析

**企业经营类**：
- 企业专利竞争力评价
- 专利组合质量分析
- 竞争对手对标分析
- 专利风险预警
- 并购标的专利评估

**研发活动类**：
- 技术生命周期分析（萌芽期→成长期→成熟期→衰退期）
- 技术功效矩阵
- 专利引证分析
- 技术融合趋势
- 研发空白领域

### 阶段5：成果产出
报告应包含：
1. 项目概述与需求分析
2. 数据采集与处理方法
3. 专利态势分析（图表+文字）
4. 重点申请人/技术/专利分析
5. 核心结论与决策建议
6. 风险提示与局限性说明

## 关键分析方法

### 专利态势分析
- **申请趋势分析**：年度申请量变化，判断技术发展阶段
- **技术构成分析**：IPC分类号分布，识别技术热点
- **地域分布分析**：各国/地区申请量，判断竞争格局
- **申请人分析**：龙头企业、新兴企业、高校院所

### 技术路线图
- 基于专利申请时间序列，绘制技术演进路径
- 识别技术代际更替节点
- 预测未来技术发展方向

### 技术空白点分析（White Space）
- 构建技术功效矩阵
- 识别高需求低供给的技术领域
- 推荐研发切入点

### 专利壁垒分析
- 核心专利识别（高被引、宽权利要求、长保护期）
- 专利丛林（Patent Thicket）识别
- 标准必要专利（SEP）分析

## 报告输出格式

\`\`\`
# 专利导航分析报告

## 一、项目概述
- 项目名称
- 委托方
- 导航类型（产业/企业/研发/区域/人才）
- 分析目标
- 技术领域界定
- 数据采集范围

## 二、数据采集与处理
- 数据来源
- 检索策略
- 数据处理说明
- 数据质量评估

## 三、专利态势分析
- 全球/国内申请趋势
- 技术构成分析
- 地域分布分析
- 申请人排名

## 四、重点分析
- 核心技术路线
- 龙头企业分析
- 技术空白点
- 专利壁垒

## 五、结论与建议
- 产业发展方向建议
- 企业布局策略建议
- 研发方向建议
- 人才引进建议

## 六、风险提示
- 数据局限性
- 分析结论的适用条件
- 后续跟踪建议
\`\`\`

## 关键词扩展策略（检索时必须执行）
| 用户原始表述 | 扩展后检索式 |
|---|---|
| 新能源 | (新能源 OR 清洁能源 OR 可再生能源 OR 绿色能源) |
| 人工智能 | (人工智能 OR AI OR 机器学习 OR 深度学习 OR 神经网络) |
| 生物医药 | (生物医药 OR 生物制药 OR 基因工程 OR 细胞治疗) |

### 字段前缀规范：
- AP=(...) 申请人
- IPC=(...) IPC分类号，只用前4位
- PID=(...) 公开号
- AD>=YYYY 申请日
- NOT=(...) 排除词

## 质量控制要求
1. 研究的系统性：目标明确、需求满足、建议可操作
2. 分析方法的科学性：工具方法合理、论证可靠、逻辑严谨
3. 成果呈现的规范性：表达准确、内容完整、重点突出

请用中文回复，保持专业、严谨。输出结构化的专利导航分析报告内容。`;

const NAVIGATION_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '简单检索：按关键词或专利号检索专利。适用于快速检索或验证特定专利。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '检索关键词或专利号' },
          page_size: { type: 'number', description: '返回结果数量，默认20' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bool_search',
      description: '布尔检索：专利导航核心检索方式。支持字段前缀：AP=(申请人)、IPC=(分类号，只用前4位）、PID=(公开号)、AD>=YYYY(申请日)、NOT=(排除词)。关键词必须进行同义词扩展，检索要覆盖产业/技术全领域。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '布尔检索表达式' },
          page_size: { type: 'number', description: '返回结果数量，默认30' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'semantic_search',
      description: '语义检索：基于技术描述的语义相似度检索，适用于发现隐蔽相关专利和技术空白点。异步执行。',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: '技术描述文本' },
          top_n: { type: 'number', description: '返回结果数量，默认20' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patent_detail',
      description: '获取专利详情，包含完整摘要、权利要求、说明书（前2000字符）、被引次数等。用于重点专利深度分析。',
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
        return await patSeekClient.simpleSearch(args.query, args.page_size || 20);
      case 'bool_search':
        return await patSeekClient.boolSearch(args.query, args.page_size || 30);
      case 'semantic_search':
        return await patSeekClient.semanticSearch(args.text, args.top_n || 20);
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

export async function patentNavigationAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: PATENT_NAVIGATION_SYSTEM_PROMPT },
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
        tools: NAVIGATION_TOOLS,
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
    console.error('Patent navigation agent error:', error);
    throw error;
  }
}

export default patentNavigationAgentChat;
