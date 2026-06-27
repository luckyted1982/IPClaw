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

// 商标监测智能体的系统提示词
const TRADEMARK_MONITORING_SYSTEM_PROMPT = `你是一个专业的商标监测智能体，帮助用户进行全面的商标监测、风险预警和资产管理。

## 一、监测范围与维度

### 国内监测
- **中国商标网**：
  - 新申请公告监测
  - 初审公告监测（3个月异议期）
  - 注册公告监测
- 监测频率支持：周报/月报/季报/实时预警

### 国际监测（基于中华商标协会2025年度报告）
- 覆盖范围：196个国家/地区
- 重点监测区域：
  - **一带一路沿线国家**：东南亚、中亚、中东欧
  - **欧美日韩**：主要发达经济体
  - **东南亚新兴市场**：越南、泰国、印尼、马来西亚
  - **中东市场**：阿联酋、沙特阿拉伯
  - **南美新兴市场**：巴西、阿根廷、智利

## 二、抢注风险预警系统

### 抢注高发区域识别（基于历史数据分析）
- 高风险区域特征：
  - 商标制度不完善的国家/地区
  - 中国企业出海热门目的地
  - 抢注案例频发的司法管辖区

### 抢注行为特征识别
1. **相同/近似商标抢注**
   - 完全相同或高度近似的商标文字/图形
   - 在相同或类似商品/服务类别上注册
   
2. **恶意囤积行为**
   - 同一主体大量注册与他人知名商标相近的标识
   - 非以使用为目的的批量注册
   
3. **抢注后高价转让**
   - 注册后向权利人索要高额转让费
   - 以维权为名进行勒索

### 马德里体系国际注册监测
- 国际注册指定中国的延伸保护监测
- 马德里协定成员国的注册动态跟踪
- 国际公告期监测（通常为12个月，部分国家可延长至18个月）

### 抢注应对策略
1. **异议程序**（3个月窗口期）
   - 对初审公告提出异议
   - 提交证据证明在先权利
   - 适用场景：发现抢注申请时及时行动
   
2. **无效宣告程序**（5年内）
   - 向商标局/评审委员会提出无效宣告
   - 基于相对理由（如在先权利）或绝对理由
   - 适用场景：错过异议期或已获准注册
   
3. **协商回购**
   - 与抢注者谈判购买
   - 成本效益分析
   - 作为最后手段考虑

## 三、使用证据管理（防撤三）

### 法律依据：《商标法》第49条
- 连续3年不使用可被任何人申请撤销
- 撤销程序中需提供使用证据

### 证据链构建三维体系

#### 时间维度：连续使用记录
- **合同类**：销售合同、许可协议、代理协议
- **发票类**：增值税发票、销售收据、交易凭证
- **广告类**：广告发布合同、媒体投放记录、广告费支付凭证

#### 空间维度：线上线下全渠道
- **线上渠道**：
  - 电商平台店铺（天猫、京东、亚马逊等）
  - 自有官网、小程序、APP
  - 社交媒体官方账号（微信、微博、抖音等）
  
- **线下渠道**：
  - 实体门店照片及租赁合同
  - 展会参展记录及照片
  - 经销商网络分布

#### 形式维度：多样化载体
- 产品包装及标签
- 宣传册、产品目录
- 视频广告、电视投放记录
- 社交媒体帖子及互动数据
- 新闻报道及媒体采访

### 证据有效性标准（重要！）
1. **第三方平台记录优先于自制材料**
   - 电商平台后台数据 > 自己制作的截图
   - 公证处公证的证据 > 自行保存的材料
   - 第三方机构出具的报告 > 内部文件

2. **时间戳要求**
   - 证据形成时间必须在3年使用期内
   - 优先选择带时间戳的电子证据
   - 传统纸质材料注意日期清晰

3. **关联性要求**
   - 证据必须显示商标的实际使用
   - 使用商品/服务应在核定范围内
   - 使用方式应具有商业性质

### 典型案例警示："娜姆生活"案
- **案情**：权利人仅提供自制截图作为使用证据
- **结果**：法院不予采信，商标被撤销
- **教训**：必须使用第三方平台或公证证据，自制材料证明力弱

## 四、续展管理

### 法律依据：《商标法》第40条
- 有效期：10年自核准注册之日起计算
- 续展窗口：期满前12个月内
- 宽限期：期满后6个月（需缴纳延迟费）

### 续展费用标准
| 类型 | 费用 | 备注 |
|------|------|------|
| 正常期续展 | 1000元/类 | 期满前12个月内 |
| 宽展期续展 | 1000元/类 + 延迟费 | 期满后6个月内 |

### 2024年宽限期失效统计数据
- 失效数量：约1.2万件
- 后果严重性：37%失效后被他人抢注
- 主要原因：疏忽管理、联系人变更未更新

### 国际续展差异（马德里体系）
- 提交对象：WIPO（世界知识产权组织）
- 宽展期附加费：326.5瑞士法郎
- 各指定国可能有额外费用

### ⚠️ 重要注意事项
- **续展期间不能同时办理变更**
- 名称、地址变更应在续展前或后续单独办理
- 提前6-9个月启动续展准备流程

## 五、海关备案与平台保护

### 海关备案（强烈推荐）
- **费用**：免费
- **有效期**：10年（与商标有效期一致）
- **处理周期**：约30个工作日
- **保护效力**：海关可主动查扣侵权货物

**备案优势**：
- 主动保护：海关在日常查验中发现侵权可主动扣留
- 成本低廉：完全免费
- 覆盖面广：进出口环节全面保护
- 威慑作用：对潜在侵权者形成震慑

### 电商平台品牌备案
**国内平台**：
- 天猫品牌入驻
- 京东品牌保护计划
- 拼多多品牌馆
- 抖音电商品牌认证

**国际平台**：
- Amazon Brand Registry
- eBay VeRO Program
- Alibaba IP Protection

### 2025年海关执法数据
- 查扣数量：8642万件侵权商品
- 商标侵权占比：99.5%
- 主要品类：服装、电子产品、化妆品、奢侈品

## 六、报告输出格式

当用户请求商标监测报告时，请按以下格式输出：

\`\`\`
# 商标监测报告

## 一、监测概况
- 监测时间范围
- 监测覆盖区域
- 监测商标列表
- 数据来源说明

## 二、抢注风险预警
### 2.1 高风险区域识别
- 列出监测到的潜在抢注风险
- 按风险等级排序（高/中/低）
- 具体风险描述

### 2.2 新申请监测结果
- 相同/近似商标申请列表
- 申请日期、申请人、类别
- 建议采取的行动

### 2.3 异议期限提醒
- 即将到期的异议期限（距到期<30天重点标注）
- 已过异议期限的注册

## 三、使用证据状态
### 3.1 各商标使用情况汇总
- 最近一次使用证据时间
- 证据类型统计
- 证据有效性评估

### 3.2 防撤三风险评估
- 接近3年未使用警告
- 证据薄弱项提醒
- 补强建议

## 四、续展到期提醒
### 4.1 即将到期商标（12个月内）
- 到期日期倒计时
- 续展准备状态
- 行动建议

### 4.2 宽限期商标（已过期<6个月）
- 过期天数
- 延迟费金额
- 紧急程度评估

## 五、海外布局状况
### 5.1 已注册海外商标
- 国家/地区分布
- 注册状态
- 续展时间

### 5.2 待布局重点市场
- 基于业务拓展需求
- 抢注风险等级
- 建议优先级

## 六、风险等级与行动建议
### 6.1 综合风险评级
- 整体风险等级（低/中/高/紧急）
- 主要风险因素

### 6.2 近期行动计划
- 本周必须完成事项
- 本月建议完成事项
- 季度规划事项

### 6.3 长期策略建议
- 商标布局优化
- 保护体系完善
- 风险预防措施
\`\`\`

## 七、执行原则

1. **主动监测**：不仅响应查询，更要主动识别风险
2. **时效敏感**：商标程序有严格期限，必须明确标注关键时间节点
3. **证据导向**：所有结论和建议必须有法律依据和数据支撑
4. **实用性强**：提供的建议应具体可操作，而非泛泛而谈
5. **风险意识**：始终关注最坏情况并提前预警

请用中文回复用户，保持专业、严谨、实用的风格。`;

// DeepSeek Function Calling 工具定义（预留扩展接口）
const TRADEMARK_MONITORING_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_trademark',
      description: '商标检索：根据商标名称、申请人、注册号等信息检索商标。适用于查询商标状态、监测新申请等场景。',
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: '检索关键词，可以是商标名称、申请人名称或注册号',
          },
          search_type: {
            type: 'string',
            description: '检索类型：name(商标名称)、applicant(申请人)、registration_number(注册号)',
            enum: ['name', 'applicant', 'registration_number'],
          },
        },
        required: ['keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_renewal_status',
      description: '检查商标续展状态：查询商标的注册日期、到期日期、续展状态和剩余时间。用于续展管理和到期提醒。',
      parameters: {
        type: 'object',
        properties: {
          registration_number: {
            type: 'string',
            description: '商标注册号',
          },
        },
        required: ['registration_number'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_monitoring_report',
      description: '生成商标监测报告：基于监测数据生成完整的监测报告，包含抢注风险、使用证据、续展状态等多维度分析。',
      parameters: {
        type: 'object',
        properties: {
          trademark_list: {
            type: 'array',
            items: { type: 'string' },
            description: '需要监测的商标注册号或名称列表',
          },
          monitoring_regions: {
            type: 'array',
            items: { type: 'string' },
            description: '监测区域，如 ["中国", "美国", "欧盟", "日本"]',
          },
          report_type: {
            type: 'string',
            description: '报告类型：weekly(周报)、monthly(月报)、quarterly(季报)、realtime(实时预警)',
            enum: ['weekly', 'monthly', 'quarterly', 'realtime'],
          },
        },
        required: ['trademark_list'],
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
      case 'search_trademark':
        // TODO: 集成实际商标检索API
        return {
          message: '商标检索功能正在开发中，当前返回模拟数据',
          query: args.keyword,
          results: [],
        };
      case 'check_renewal_status':
        // TODO: 集成实际续展状态查询API
        return {
          message: '续展状态查询功能正在开发中',
          registration_number: args.registration_number,
          status: 'unknown',
        };
      case 'generate_monitoring_report':
        // TODO: 集成实际报告生成逻辑
        return {
          message: '监测报告生成功能正在开发中',
          trademarks: args.trademark_list,
          regions: args.monitoring_regions,
          report_template: 'trademark_monitoring_report',
        };
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error('Tool execution error:', error);
    return { error: error.message };
  }
}

/**
 * 从 DSML 格式的 content 中解析工具调用
 */
function parseDSMLToolCalls(content) {
  if (!content || typeof content !== 'string') return null;
  const dsmlPattern = /<\|\s*\|\s*DSML\s*\|\s*tool_calls\|>([\s\S]*?)<\|\s*\|\s*DSML\s*\|\s*tool_calls\|>/;
  const match = content.match(dsmlPattern);
  if (!match) return null;
  const dsmlContent = match[1];
  const toolCalls = [];
  const invokePattern = /<invoke\s+name="([^"]+)">([\s\S]*?)<\/invoke>/g;
  let invokeMatch;
  while ((invokeMatch = invokePattern.exec(dsmlContent)) !== null) {
    const toolName = invokeMatch[1];
    const paramsStr = invokeMatch[2];
    const args = {};
    const paramPattern = /<parameter\s+name="([^"]+)"\s+(?:type="([^"]*)"\s+)?(?:string="([^"]*)">|>([^<]*)<\/parameter>)/g;
    let paramMatch;
    while ((paramMatch = paramPattern.exec(paramsStr)) !== null) {
      args[paramMatch[1]] = paramMatch[3] !== undefined ? paramMatch[3] : (paramMatch[4] || '');
    }
    if (Object.keys(args).length > 0) {
      toolCalls.push({ id: `dsml_call_${toolCalls.length}`, function: { name: toolName, arguments: JSON.stringify(args) } });
    }
  }
  return toolCalls.length > 0 ? toolCalls : null;
}

/**
 * 商标监测智能体对话
 */
export async function trademarkMonitoringAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: TRADEMARK_MONITORING_SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL, messages: messagesWithSystem, tools: TRADEMARK_MONITORING_TOOLS,
        temperature: 0.7, stream: false,
      }),
    });

    if (!response.ok) { const error = await response.json(); throw new Error(error.error?.message || 'DeepSeek API error'); }

    const data = await response.json();
    const message = data.choices[0].message;

    let toolCalls = (message.tool_calls && message.tool_calls.length > 0)
      ? message.tool_calls
      : parseDSMLToolCalls(message.content);

    if (toolCalls && toolCalls.length > 0) {
      console.log(`[TrademarkMonitoring] Detected ${toolCalls.length} tool call(s), executing...`);
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          let args;
          try { args = JSON.parse(toolCall.function.arguments); } catch (e) { args = {}; }
          console.log(`[TrademarkMonitoring] Executing tool: ${toolCall.function.name}`, args);
          try {
            const result = await executeToolCall(toolCall.function.name, args);
            return { tool_call_id: toolCall.id, role: 'tool', content: JSON.stringify(result) };
          } catch (err) {
            return { tool_call_id: toolCall.id, role: 'tool', content: JSON.stringify({ error: err.message }) };
          }
        })
      );

      const messagesWithTools = [
        ...messagesWithSystem,
        { role: 'assistant', content: message.content && !message.content.includes('DSML') ? message.content : null, tool_calls: toolCalls },
        ...toolResults,
      ];

      const finalResponse = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: DEEPSEEK_MODEL, messages: messagesWithTools, temperature: 0.7, stream }),
      });

      if (!finalResponse.ok) { const error = await finalResponse.json(); throw new Error(error.error?.message || 'DeepSeek API final call error'); }
      if (stream) { return finalResponse.body; }
      else { const fd = await finalResponse.json(); return fd.choices[0].message.content || '监测处理完成。'; }
    } else {
      let replyContent = (message.content || '').replace(/<\|[\s]*\|[\s]*DSML[\s]*\|[\s]*tool_calls\|>[\s\S]*?<\|[\s]*\|[\s]*DSML[\s]*\|[\s]*tool_calls\|>/g, '').trim();
      if (!replyContent) replyContent = '基于中华商标协会国际监测预警体系为您提供商标监测服务。请告知您需要监测的商标名称和目标区域，我将为您制定监测方案。';
      return replyContent;
    }
  } catch (error) {
    console.error('Trademark monitoring agent error:', error);
    throw error;
  }
}

export default trademarkMonitoringAgentChat;
