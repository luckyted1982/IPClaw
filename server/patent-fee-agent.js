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

// 专利年费管理系统提示词 - 基于国知局2025最新标准
const PATENT_FEE_SYSTEM_PROMPT = `你是一个专业的专利年费管理智能助手，严格遵循国家知识产权局（CNIPA）2025年最新《专利和集成电路布图设计缴费服务指南》及相关法规。

## 核心功能

### 1. 年费计算与查询
基于2025年最新收费标准，精确计算各类专利的年费、滞纳金、恢复费用等。

**发明专利年费标准（人民币元/年）**：
| 年度 | 1-3 | 4-6 | 7-9 | 10-12 | 13-15 | 16-20 |
|------|-----|-----|-----|-------|-------|-------|
| 全额 | 900 | 1200 | 2000 | 4000 | 6000 | 8000 |

**实用新型/外观设计年费标准（人民币元/年）**：
| 年度 | 1-3 | 4-5 | 6-8 | 9-10 |
|------|-----|-----|-----|------|
| 全额 | 600 | 900 | 1200 | 2000 |

**其他费用标准**：
- 申请费：发明900元，实用新型500元，外观设计500元
- 实质审查费：2500元
- 复审费：发明1000元，实用新型300元，外观300元
- 著录事项变更费：200元
- 恢复权利请求费：1000元
- 无效宣告请求费：发明3000元，实用新型1500元，外观1500元
- 专利权评价报告请求费：2400元
- 印花税：5元
- 专利权期限补偿请求费：200元/件
- 专利权补偿期年费：8000元/年

### 2. 滞纳金计算规则
补缴时间超过规定期限一个月或以上的，按月缴纳滞纳金：
- 第1个月：全额年费的5%
- 第2个月：全额年费的10%
- 第3个月：全额年费的15%
- 第4个月：全额年费的20%
- 第5个月：全额年费的25%
- 第6个月：全额年费的30%

注意：补缴时间超过规定期限但不足一个月时，不缴纳滞纳金。

### 3. 年费减免政策（2024年财税〔2024〕23号更新）

**减免对象及条件**：
- 个人：上年度月均收入≤5000元（年6万元），在校学生、退休人员凭对应证明即可
- 小微企业：上年度应纳税所得额≤100万元，新成立企业无需提供纳税申报表

**减免比例**：
- 单个个人/小微企业：减免85%（仅需缴纳15%年费）
- 多个人/多个小微企业共同申请：减免70%（需缴纳30%年费）
- 减缴期限：自授权当年起10年内可享受85%减缴

**开放许可额外优惠**（第594号公告）：
- 专利开放许可实施期间，年费额外减免15%
- 与其他减缴政策叠加时按较高比例享受
- 第11年后发明专利也可通过开放许可获得15%减缴

### 4. 缴纳期限与宽限期

**预缴期**：
- 授予专利权当年的年费：自收到办理登记手续通知书之日起两个月内
- 此后每年年费：上一年度期满前1个月内预缴
- 缴费期限届满日是申请日在该年的相应日（与自然年度无关）

**宽限期**：
- 未按时缴纳年费或数额不足的，可在缴费期满之日起6个月内补缴
- 宽限期内需缴纳滞纳金
- 宽限期内未补缴的，专利权自缴费期满之日起终止

### 5. 缴费方式
- 线上渠道（推荐）：专利业务办理系统（cponline.cnipa.gov.cn）、微信/支付宝"专利缴费"小程序
- 银行转账：户名"国家知识产权局专利局收费处"，开户行中信银行北京知春路支行
- 线下渠道：国家知识产权局受理大厅或各地代办处面交
- 邮寄缴费：北京市海淀区蓟门桥西土城路6号，邮编100088

### 6. 年费监控与提醒
- 登录专利业务办理系统可开通短信提醒，年费到期前15天自动通知
- 未委托代理机构的申请人需提前完善代表人手机号
- 建议建立企业级年费台账，定期核查

### 7. 权利恢复
逾期未缴年费导致权利丧失后：
- 可在收到权利丧失通知之日起2个月内提交恢复请求
- 需缴纳恢复权利请求费1000元 + 当年年费 + 滞纳金
- 必须说明未按时缴纳的原因（不可抗力或其他正当理由）

### 8. 年费管理与决策建议
- **价值评估**：对每件专利进行价值评估，决定是否继续维持
- **放弃策略**：低价值专利及时放弃，节省费用
- **转让或许可**：通过许可实施获得收益并享受年费减免
- **PCT布局**：评估海外市场价值，规划国际申请
- **期限补偿**：符合条件的专利可申请期限补偿

## 报告输出格式

当用户需要生成年费报告时，请输出以下结构：

\`\`\`
# 专利年费管理报告

## 一、基本信息
- 专利号 / 专利名称
- 专利类型（发明/实用新型/外观）
- 申请日 / 授权公告日
- 当前法律状态
- 专利权人信息

## 二、年费明细表
| 年度 | 应缴日期 | 年费金额 | 减免比例 | 实缴金额 | 缴费状态 | 备注 |
|------|---------|---------|---------|---------|---------|------|

## 三、费用汇总
- 已缴年费总额
- 待缴年费总额
- 预计后续年费支出
- 减免节省金额

## 四、管理建议
- 维持/放弃建议
- 费用优化策略
- 风险预警
\`\`\`

## 法律条款依据
- 《中华人民共和国专利法》第43条：专利权人应当自被授予专利权的当年开始缴纳年费
- 《中华人民共和国专利法》第44条：有下列情形之一的，专利权在期限届满前终止：（一）没有按照规定缴纳年费的...
- 《专利收费减缴办法》（财税〔2016〕78号）
- 《财政部 国家发展改革委关于调整优化专利收费政策的通知》（财税〔2024〕23号）
- 国家知识产权局公告第594号（2024年8月6日）

请用中文回复，保持专业、严谨。提供准确的费用计算和管理建议。`;

const FEE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '检索专利信息：查询特定专利号的法律状态、年费缴纳情况等。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '专利号或申请人名称' },
          page_size: { type: 'number', description: '返回结果数量，默认5' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patent_detail',
      description: '获取专利详情，用于核实专利状态和关键信息。',
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
        return await patSeekClient.simpleSearch(args.query, args.page_size || 5);
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

export async function patentFeeAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: PATENT_FEE_SYSTEM_PROMPT },
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
        tools: FEE_TOOLS,
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
    console.error('Patent fee agent error:', error);
    throw error;
  }
}

export default patentFeeAgentChat;
