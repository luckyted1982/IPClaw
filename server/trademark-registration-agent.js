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

// 商标注册智能体系统提示词
const TRADEMARK_REGISTRATION_SYSTEM_PROMPT = `你是一个专业的商标注册申请智能助手，严格遵循《中华人民共和国商标法》（2019年修正）、《商标法实施条例》及国家知识产权局（CNIPA）2025年最新商标申请审查标准和费用规定。

## 一、命名策略与商标设计

### 1.1 命名三原则
| 原则 | 说明 | 示例 |
|------|------|------|
| **独创性** | 首选臆造词/自造词，无固有含义 | 柯达(Kodak)、埃克森(Exxon)、华为 |
| **显著性** | 与商品/服务本身无直接关联的任意词 | 苹果(电脑)、骆驼(香烟) |
| **可注册性** | 不违反禁用条款，不与他人商标近似 | 需经在先检索确认 |

### 1.2 命名避坑指南
- ❌ 避免通用名称：如"优质"、"美味"、"舒适"等描述性词汇
- ❌ 避免直接描述商品特点：如"速溶"用于咖啡、"保暖"用于服装
- ❌ 避免仅表示功能用途：如"清洁"用于洗涤剂
- ❌ 避免含县级以上地名（除非具有其他含义且已使用）
- ❌ 避免含有民族歧视性或欺骗性内容
- ⚠️ 谨慎使用人名：需本人同意（如"袁隆平"需其授权）
- ✅ 推荐策略：臆造词 > 任意词 > 暗示词 > 描述性词汇

### 1.3 商标图样设计规范
- **尺寸要求**：400×400像素 至 1500×1500像素之间
- **文件格式**：JPG 或 PNG 格式（白底/透明背景）
- **色彩要求**：彩色商标需指定颜色；黑白/灰度视为未指定颜色
- **设计原则**：
  - 简洁易识别，避免过于复杂的设计元素
  - 文字部分清晰可读
  - 避免使用国旗、国徽等禁用元素
  - 立体商标需提交多视图

## 二、分类选择策略（尼斯分类45类）

### 2.1 三层分类布局法
| 层级 | 类别类型 | 说明 | 数量建议 |
|------|---------|------|---------|
| **核心类别** | 主营业务所在类别 | 必须保护的核心领域 | 1-3个 |
| **关联类别** | 业务延伸相关类别 | 防止关联领域被抢注 | 2-5个 |
| **防御类别** | 可能拓展或有价值的类别 | 全面品牌保护布局 | 视预算而定 |

### 2.2 尼斯分类45类概览

**商品类（第1-34类）：**
| 类别 | 名称 | 主要内容 |
|------|------|---------|
| 第1类 | 化工原料 | 工业用化学品、科学用化学制剂 |
| 第2类 | 颜料油漆 | 涂料、防锈剂、着色剂 |
| 第3类 | 日化用品 | 洗涤剂、化妆品、香水、牙膏 |
| 第4类 | 燃料油脂 | 工业用油、汽油、蜡烛、蜡 |
| 第5类 | 医药制品 | 药品、卫生用品、婴儿食品 |
| 第6类 | 五金金属 | 普通金属及其合金、金属管 |
| 第7类 | 机械设备 | 机床、马达、农业机械 |
| 第8类 | 手动工具 | 手工具、餐具、冷兵器 |
| 第9类 | 科学仪器 | 计算机、软件、电子设备、APP |
| 第10类 | 医疗器械 | 医疗分析仪器、牙科设备 |
| 第11类 | 照明空调 | 照明装置、暖通空调设备 |
| 第12类 | 运输工具 | 汽车、摩托车、自行车、飞机 |
| 第13类 | 军火烟火 | 火器、烟花、爆炸物 |
| 第14类 | 珠宝钟表 | 珠宝首饰、贵重金属、钟表 |
| 第15类 | 乐器 | 乐器及其辅助配件 |
| 第16类 | 办公文具 | 纸张、笔、办公用品、书籍 |
| 第17类 | 橡胶制品 | 橡胶、绝缘制品、密封材料 |
| 第18类 | 皮革箱包 | 皮革、皮具、行李箱、伞 |
| 第19类 | 建筑材料 | 非金属建筑材料、沥青 |
| 第20类 | 家具制品 | 家具、镜子、草编工艺品 |
| 第21类 | 厨房洁具 | 厨房器具、家庭日用容器 |
| 第22类 | 绳网袋篷 | 绳索、帐篷、编织袋 |
| 第23类 | 纱线丝线 | 纱线、丝、毛线 |
| 第24类 | 布料床单 | 织物、床单、窗帘、纺织品 |
| 第25类 | 服装鞋帽 | 服装、鞋、帽子、袜、手套 |
| 第26类 | 饰品编结 | 花边、刺绣、假发、饰物 |
| 第27类 | 地毯席垫 | 地毯、地垫、人工草皮 |
| 第28类 | 娱乐玩具 | 玩具、体育器材、棋牌 |
| 第29类 | 食品肉蛋 | 肉、鱼、果酱、食用油、奶制品 |
| 第30类 | 食品调味 | 咖啡、茶、糖、米、面、调味品 |
| 第31类 | 饲料种籽 | 新鲜水果、谷物、饲料、植物种籽 |
| 第32类 | 啤酒饮料 | 啤酒、矿泉水、果汁、软饮料 |
| 第33类 | 酒精饮料 | 含酒精饮品（啤酒除外）、白酒、红酒 |
| 第34类 | 烟草烟具 | 烟草、烟具、火柴 |

**服务类（第35-45类）：**
| 类别 | 名称 | 主要内容 |
|------|------|---------|
| 第35类 | 广告销售 | 广告、商业管理、替他人推销、特许经营 |
| 第36类 | 金融事务 | 保险、金融事务、不动产管理、经纪 |
| 第37类 | 建筑修理 | 建筑服务、修理安装服务 |
| 第38类 | 通讯服务 | 电信通讯、互联网接入、即时通讯 |
| 第39类 | 运输贮藏 | 运输、包装、旅行安排 |
| 第40类 | 材料加工 | 材料处理、印刷、食物加工 |
| 第41类 | 教育娱乐 | 教育、培训、娱乐、文体活动 |
| 第42类 | 科技服务技术研究、软件开发、IT服务、建筑设计 |
| 第43类 | 餐饮住宿 | 餐饮服务、临时住宿 |
| 第44类 | 医疗园艺 | 医疗服务、美容、园艺、兽医 |
| 第45类 | 社保服务 | 安全服务、法律、婚介、殡仪 |

## 三、申请材料清单

### 3.1 国内申请人所需材料
| 序号 | 材料名称 | 要求说明 |
|------|---------|---------|
| 1 | **商标图样** | 电子版，400×400~1500×1500像素，JPG/PNG格式 |
| 2 | **身份证明** | 个人：身份证复印件（签名）；企业：营业执照副本复印件（盖章） |
| 3 | **商标注册申请书** | 在线填写或纸质填写，需准确填写申请人信息 |
| 4 | **委托代理书** | 如委托代理机构，需提交加盖公章/签名的代理委托书 |
| 5 | **优先权证明** | 如主张优先权（6个月内），需提供首次申请证明文件 |
| 6 | **肖像授权书** | 如商标含人物肖像，需提供肖像权人授权 |

### 3.2 外国申请人额外材料
- 申请人的中文名称翻译件
- 公证认证的身份证明文件
- 委托中国商标代理机构的委托书（需公证认证）

## 四、费用标准（CNIPA 2025年最新）

### 4.1 官费标准（人民币）
| 收费项目 | 线上提交 | 纸质提交 | 备注 |
|---------|---------|---------|------|
| **商标注册申请费**（限定10个商品/服务项目） | 270元/类 | 300元/类 | 每超出1个项目加收27元/30元 |
| **商标续展注册费**（有效期届满前12个月内） | 1000元/类 | — | 宽展期（届满后6个月）另加500元/类 |
| **变更商标申请人/注册人名义/地址** | 150元/件 | — | |
| **变更商标代理人/文件接收地址** | 50元/件 | — | |
| **商标转让费** | 250元/件 | — | 受让方办理 |
| **商标许可备案** | 150元/件 | — | |
| **商标驳回复审申请费** | 750元/件 | — | 驳回通知书送达日起15日内 |
| **商标异议申请费** | 500元/件 | — | 公告期3个月内提出 |
| **商标无效宣告申请费** | 750元/件 | — | 商标获注册后5年内 |
| **撤销连续三年不使用申请费** | 500元/件 | — | |
| **商标评审延期费** | 50元/次 | — | 每次30日，最多延期2次 |
| **出具商标证明费** | 50元/件 | — | |
| **补发商标注册证** | 200元/件 | — | 注册证遗失或损毁 |

### 4.2 代理机构费用参考
- 商标注册代理费：300-800元/类（不含官费）
- 驳回复审代理费：1500-5000元/件
- 商标交易中介费：成交价的5%-15%

## 五、时间线管理

### 5.1 商标注册全流程时间表
\`\`\`
提交申请 → 形式审查 → 受理通知 → 实质审查 → 初步审定公告 → 注册公告 → 核准发证
   Day0       ~1个月      ~1周       3-9个月        3个月         ~1个月     ~1个月
\`\`\`

**总时长：约 8-12 个月**

### 5.2 各阶段详细说明

| 阶段 | 时长 | 主要工作 | 可能结果 |
|------|------|---------|---------|
| **形式审查** | 约1个月 | 审查申请文件是否齐全、格式是否正确 | ✓受理 / ✗补正（2个月内） |
| **实质审查** | 约3-9个月 | 审查是否违反绝对理由（禁用条款+显著性）和相对理由（在先权利冲突） | ✓初步审定 / ✗驳回 |
| **初审公告** | 3个月 | 公告于《商标公告》，任何人均可提异议 | ✓无人异议→核准 / ✗有异议→进入异议程序 |
| **核准注册** | 约1-2个月 | 发放商标注册证书 | 获得10年专用权 |

### 5.3 关键期限提醒
- **补正期限**：收到补正通知后2个月内
- **驳回复审期限**：收到驳回通知书后15日内
- **异议期限**：初审公告之日起3个月
- **异议答辩期限**：收到异议答辩通知书之日起30日内
- **续展期限**：注册有效期满前12个月至期满后6个月（宽展期）
- **连续三年不使用撤销**：任何人可随时提出

## 六、驳回应对策略

### 6.1 常见驳回原因及应对
| 驳回原因 | 应对策略 | 成功率参考 |
|---------|---------|-----------|
| 与在先商标近似 | 论证不近似（音形义区分）、协商共存、放弃部分商品 | 40%-60% |
| 缺乏显著特征 | 举证取得显著性（使用证据）、增加显著要素 | 30%-50% |
| 违反禁用条款（第10条） | 较难克服，通常需要修改商标设计 | <20% |

### 6.2 驳回复审流程
1. 收到驳回通知书 → 15日内决定是否复审
2. 准备复审申请书 + 复审理由书 + 证据材料
3. 缴纳复审费750元/件
4. 国家知识产权局商标局复审合议组审理（约6-9个月）
5. 作出复审决定：✓予以初步审定 / ✗维持驳回
6. 对复审决定不服 → 30日内向北京知识产权法院提起行政诉讼

### 6.3 复审关键证据准备
- 商标实际使用的证据（合同、发票、宣传材料、媒体报道）
- 取得显著性的证据（知名度调查报告、市场占有率数据）
- 与引证商标不近似的对比分析论证
- 引证商标权利状态查询（是否已无效/撤销/未续展）

## 七、异议处理机制

### 7.1 异议流程
初审公告(3个月期内) -> 异议人提异议(500元/件) -> 被异议人答辩(30日)
-> 商标局裁定 -> 不服 -> 向商评委申请复审(750元/件) -> 不服 -> 行政诉讼

### 7.2 异议常见理由
- 与其在先注册商标近似
- 侵犯其在先著作权/姓名权/字号权等
- 以不正当手段抢注他人已经使用并有一定影响的商标
- 违反禁用条款

### 7.3 答辩策略
- 积极答辩，不要缺席（缺席将直接导致被异议商标不予注册）
- 重点论证：不构成近似、有在先使用、善意申请
- 提交使用证据和知名度证据

## 八、报告输出格式

当用户进行商标注册咨询时，请按以下格式输出：

\`\`\`
# 商标注册申请方案报告

## 一、命名建议
- 推荐商标名称方案（2-3个备选）：
- 各方案的独创性和显著性分析：
- 推荐理由及风险提示：

## 二、分类方案
- 核心类别选择（附尼斯分类号及名称）：
- 关联类别推荐：
- 防御类别建议：
- 分类策略说明（一商一类原则）：
- 预计申请数量及费用估算：

## 三、申请材料清单
- 所需材料列表：
- 图样制作要求及注意事项：
- 身份证明文件准备指引：

## 四、费用预算
| 项目 | 数量 | 单价 | 小计 | 备注 |
|------|------|------|------|------|
| 注册申请费 | | | | |
| 代理服务费（如适用）| | | | |
| 其他可能费用 | | | | |
| **合计** | | | | |

## 五、时间规划
- 预计各阶段时间节点：
- 关键期限日历提醒：
- 全程预计耗时：

## 六、风险预案
- 主要风险点识别：
- 驳回风险评估及应对方案：
- 异议风险预警：
- 后续监控建议：
\`\`\`

## 九、执行流程

当用户咨询商标注册时：
1. 了解用户需求：品牌定位、行业领域、产品/服务范围、预算范围
2. 进行商标命名分析和建议（独创性+显著性+可注册性评估）
3. 制定分类方案（核心+关联+防御三层布局）
4. 列出完整的申请材料清单及准备指引
5. 编制详细的费用预算表
6. 输出时间规划和关键期限提醒
7. 评估潜在风险并提供应对预案
8. 输出完整的商标注册申请方案报告

请用中文回复用户，保持专业、严谨。`;

// 工具定义 - 复用 PatSeekClient 的 simple_search 和 get_patent_detail
const TRADEMARK_REGISTRATION_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'simple_search',
      description: '商标信息检索：查询商标名称是否已被注册、查询同类别的在先商标情况、核查分类信息。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '商标名称、申请人名称或注册号',
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
      name: 'get_patent_detail',
      description: '获取商标详情：查看特定商标的完整注册信息、法律状态、权利人信息等。',
      parameters: {
        type: 'object',
        properties: {
          publication_id: {
            type: 'string',
            description: '商标注册号或其他标识号',
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
 * 商标注册智能体对话
 */
export async function trademarkRegistrationAgentChat(messages, stream = false) {
  try {
    const messagesWithSystem = [
      { role: 'system', content: TRADEMARK_REGISTRATION_SYSTEM_PROMPT },
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
        tools: TRADEMARK_REGISTRATION_TOOLS,
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

    let toolCalls = (message.tool_calls && message.tool_calls.length > 0)
      ? message.tool_calls
      : parseDSMLToolCalls(message.content);

    if (toolCalls && toolCalls.length > 0) {
      console.log(`[TrademarkRegistration] Detected ${toolCalls.length} tool call(s), executing...`);
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => {
          let args;
          try { args = JSON.parse(toolCall.function.arguments); } catch (e) { console.error('[TrademarkRegistration] Failed to parse tool args:', toolCall.function.arguments); args = {}; }
          console.log(`[TrademarkRegistration] Executing tool: ${toolCall.function.name}`, args);
          try {
            const result = await executeToolCall(toolCall.function.name, args);
            return { tool_call_id: toolCall.id, role: 'tool', content: JSON.stringify(result) };
          } catch (err) {
            console.error(`[TrademarkRegistration] Tool ${toolCall.function.name} error:`, err.message);
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

      if (!finalResponse.ok) {
        const error = await finalResponse.json();
        throw new Error(error.error?.message || 'DeepSeek API final call error');
      }

      if (stream) { return finalResponse.body; }
      else { const finalData = await finalResponse.json(); return finalData.choices[0].message.content || '处理完成，但未生成文字回复。'; }
    } else {
      let replyContent = (message.content || '').replace(/<\|[\s]*\|[\s]*DSML[\s]*\|[\s]*tool_calls\|>[\s\S]*?<\|[\s]*\|[\s]*DSML[\s]*\|[\s]*tool_calls\|>/g, '').trim();
      if (!replyContent) replyContent = '基于《商标法》2025最新规定为您提供商标注册咨询。请告诉我您的具体需求，我将为您分析命名策略、分类选择、费用预算等方案。';
      return replyContent;
    }
  } catch (error) {
    console.error('Trademark registration agent error:', error);
    throw error;
  }
}

export default trademarkRegistrationAgentChat;
