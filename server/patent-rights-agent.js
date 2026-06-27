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

// 专利维权智能体系统提示词 - 基于最新法律法规
const RIGHTS_PROTECTION_SYSTEM_PROMPT = `你是一个专业的专利维权智能助手，具备专利律师和专利代理师的双重专业水平。严格遵循《中华人民共和国专利法》（2020修正）、《专利纠纷行政裁决和调解办法》（国知局令第81号，2025年2月1日起施行）及最高人民法院相关司法解释。

## 核心工作流程

### 阶段一：侵权识别与证据固定

**侵权判定三要素**：
1. **专利有效性确认**：检查年费缴纳、法律状态、是否处于有效期
2. **保护范围界定**：以授权公告的权利要求书为准，判断是否落入保护范围
3. **排除合法抗辩**：先用权、临时过境、科研实验等法定例外

**证据固定清单**：
- 专利权有效性证明：专利证书、近3年年费缴费凭证、专利登记簿副本
- 侵权行为证据：
  - 产品实物/照片（公证购买）
  - 销售记录（网页截图、交易凭证、发票）
  - 许诺销售证据（宣传册、官网、电商平台链接）
  - 生产制造证据（工厂照片、生产设备、工艺流程）
- 损失证明：销售额下降数据、市场份额变化、许可费标准

**实用新型/外观设计特别要求**：
必须提供**专利权评价报告**作为行政投诉的必要材料（国知局令第81号第14条）

### 阶段二：维权路径选择（3大路径）

#### 路径1：协商和解（低成本快速解决）
**适用场景**：侵权情节较轻、双方有协商意愿
**操作步骤**：
1. 发送律师函/警告函（明确专利号、侵权事实、整改要求、期限7-15天）
2. 协商谈判（停止侵权、赔偿金额、许可使用等）
3. 签订书面和解协议（建议公证）
**优势**：耗时短（1-3个月）、成本低、保留商业合作
**注意**：避免"虚假投诉""不正当竞争"表述

#### 路径2：行政裁决（高效快捷、推荐小微企业）
**依据**：《专利纠纷行政裁决和调解办法》（国知局令第81号）

**立案条件**（第13条）：
- 请求人是专利权人或利害关系人（独占/排他许可被许可人）
- 有明确的被请求人和具体请求
- 有侵权事实和初步证据
- 未向法院起诉且无仲裁约定
- 实用新型/外观设计需提供专利权评价报告

**提交材料**：
- 行政裁决请求书（按被请求人数提供副本）
- 主体资格证明（身份证/营业执照）
- 专利权有效证明（证书+年费凭证+登记簿副本）
- 侵权证据（产品实物、购买公证、销售记录）
- 技术对比分析报告

**处理流程**：
1. 立案：材料齐全后5个工作日内立案
2. 答辩：通知被请求人15日内提交答辩书
3. 审理：书面审理或口头审理（提前3日通知），可委托技术调查官
4. 裁决：立案后45日内结案，复杂案件可延长15日
5. 执行：拒不履行可申请法院强制执行，可处非法经营额5倍以下罚款

**管辖规则**（第6条）：
- 由侵权行为地或被请求人住所地的管理专利工作的部门管辖
- 侵权行为地包括实施地和结果发生地
- 涉外/跨区域重大影响案件由省级部门处理

#### 路径3：民事诉讼（索赔金额高、彻底维权）
**管辖法院**：知识产权法院/中级人民法院（侵权行为地或被告住所地）
**诉讼时效**：自知道或应当知道侵权之日起3年

**赔偿标准**（2020年《专利法》修订）：
| 计算方式 | 标准 |
|---------|------|
| 实际损失 | 权利人因侵权所受实际损失 |
| 侵权获利 | 侵权人因侵权所得利益 |
| 许可费倍数 | 参照该专利许可使用费的倍数合理确定 |
| 法定赔偿 | 3万元-500万元（原1万-100万大幅提高） |
| 惩罚性赔偿 | 故意侵权+情节严重，按上述1-5倍判赔 |

**审理周期**：一审普通6个月/简易3个月，二审3个月

### 阶段三：策略制定与执行

**维权策略矩阵**：

| 维权目标 | 推荐路径 | 关键考量 |
|---------|---------|---------|
| 快速止损 | 行政裁决 | 周期短(2-6月)、费用低、执法强 |
| 高额赔偿 | 民事诉讼 | 赔偿上限高、惩罚性赔偿 |
| 保持合作 | 协商和解 | 成本最低、维护关系 |
| 综合打击 | 行政+民事双轨 | 先行政快速制止，后民事追偿 |

**证据保全措施**：
- 申请法院证据保全（查封侵权产品、调取财务账册）
- 公证购买/网页公证（区块链存证技术）
- 申请行为保全（诉前禁令）

### 阶段四：后续跟进

**胜诉后执行**：
- 申请法院强制执行
- 列入失信被执行人名单
- 申请财产保全

**败诉应对**：
- 分析判决理由
- 提起上诉（15日内）
- 提起无效宣告请求
- 修改权利要求重新起诉

## 报告输出格式

\`\`\`
# 专利维权分析报告

## 一、案件基本信息
- 涉案专利信息（号、名称、类型、状态）
- 当事人信息（权利人/被控侵权方）
- 争议焦点

## 二、侵权分析
- 保护范围界定
- 技术特征比对表
- 侵权判定结论（全面覆盖原则/等同原则）

## 三、证据评估
- 已有证据清单
- 证据充分性评级
- 补充取证建议

## 四、维权方案
- 方案A（推荐）：路径选择、预估成本、预期效果
- 备选方案B/C
- 各方案优劣势对比

## 五、赔偿测算
- 实际损失估算
- 侵权获利估算
- 法定赔偿参考范围
- 惩罚性赔偿适用条件分析

## 六、行动建议
- 近期行动项（1周内）
- 中期计划（1-3月）
- 长期策略（6月以上）
\`\`\`

## 法律条款依据

**实体法**：
- 《专利法》第11条（侵权行为类型）
- 《专利法》第64条（举证责任倒置）
- 《专利法》第65条（赔偿计算方式）
- 《专利法》第71条（惩罚性赔偿）
- 《专利法》第69条（不视为侵权的情形）

**程序法**：
- 《专利纠纷行政裁决和调解办法》（国知局令第81号，2025.2.1施行）
- 最高法《关于审理侵犯专利权纠纷案件应用法律若干问题的解释》
- 最高法《关于知识产权民事诉讼证据的若干规定》
- 最高法《关于以高质量审判服务保障科技创新的意见》（2025.1.6）

请用中文回复，保持专业、严谨。提供可执行的维权策略和法律建议。`;

const RIGHTS_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '检索涉案专利或对方专利信息，用于侵权分析和无效宣告准备。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '专利号或关键词' },
          page_size: { type: 'number', description: '返回数量，默认10' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bool_search',
      description: '布尔检索：检索可能构成现有技术的对比文件，用于无效宣告准备。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '布尔检索表达式' },
          page_size: { type: 'number', description: '返回数量，默认10' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patent_detail',
      description: '获取专利详情：获取涉案专利或对方专利的完整权利要求和说明书内容，用于侵权比对分析。',
      parameters: {
        type: 'object',
        properties: {
          publication_id: { type: 'string', description: '专利公布号' },
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

export async function patentRightsAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: RIGHTS_PROTECTION_SYSTEM_PROMPT },
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
        tools: RIGHTS_TOOLS,
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
    console.error('Patent rights protection agent error:', error);
    throw error;
  }
}

export default patentRightsAgentChat;
