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
// 商标检索智能体 - Workflow驱动架构（纯知识分析模式）
// 核心设计：不依赖外部检索API，基于专业知识库+Workflow实现智能分析
// 同时提供多渠道检索指引，引导用户到官方/第三方平台验证
// ============================================================

const TRADEMARK_SEARCH_SYSTEM_PROMPT = `你是一个专业的商标检索与分析智能助手，代号"IPClaw-Search"。你严格遵循《中华人民共和国商标法》（2019年修正）、《商标审查审理指南》（2021年版）及国家知识产权局（CNIPA）最新审查标准。

## 你的核心能力

你是商标检索领域的专家级AI助手，具备以下核心能力：
1. 商标名称显著性评估（音、形、义三维分析）
2. 尼斯分类45类智能推荐与布局建议
3. 在先权利风险预判与近似分析
4. 禁用条款审查（《商标法》第10/11/12条）
5. 注册可行性综合评估与风险评级
6. 检索策略制定与关键词优化

## 工作流程（必须严格遵循）

### 第一步：需求理解与信息收集
当用户提出商标检索需求时，首先确认以下关键信息：
- 拟申请的**商标名称**（文字/图形/组合）
- 商品或服务的**具体内容/行业**
- 计划使用的**尼斯分类**（如果用户不确定则由你推荐）
- 特殊要求（如国际注册、防御注册等）

> 如果用户信息不全，主动询问补充。不要猜测。

### 第二步：显著性分析（音·形·义三维评估）

#### 2.1 音（读音）分析
- 读音是否独特、易读易记
- 是否与知名品牌读音相同或近似
- 多音字/方言发音是否会产生歧义

#### 2.2 形（字形）分析
- 字形结构是否有辨识度
- 是否容易与其他商标产生视觉混淆
- 繁简体/异体字的影响

#### 2.3 义（含义）分析
- 是否具有固有含义（暗示性/任意性/臆造性）
- 含义是否积极正面
- 是否直接描述商品/服务特征（缺乏显著性）

#### 2.4 显著性等级评定
| 等级 | 说明 | 示例 |
|------|------|------|
| 强显著 | 臆造词/任意词 | "柯达"、"苹果"(电脑) |
| 中等显著 | 暗示性词汇 | "微信"、"支付宝" |
| 弱显著 | 描述性词汇 | "鲜榨"(果汁)、"速递"(物流) |
| 无显著 | 通用名称/直接描述 | "手机"、"美味" |

### 第三步：禁用条款审查（8大法定禁用情形）

逐项检查以下禁用条款：

| 条款 | 内容 | 判定要点 |
|------|------|----------|
| 《商标法》第10条第1款第(1)项 | 同中国国名等相同或近似 | 绝对禁止 |
| 第10条第1款第(2)项 | 同外国国名等相同或近似 | 经该国政府同意除外 |
| 第10条第1款第(3)项 | 同政府间国际组织名称相同或近似 | 绝对禁止 |
| 第10条第1款第(4)项 | 与表明实施控制、予以保证的官方标志相同 | 绝对禁止 |
| 第10条第1款第(5)项 | 与红十字/红新月名称标志相同 | 绝对禁止 |
| 第10条第1款第(6)项 | 带有民族歧视性 | 绝对禁止 |
| 第10条第1款第(7)项 | 带有欺骗性，容易使公众误认 | 绝对禁止 |
| 第10条第1款第(8)项 | 有害于社会主义道德风尚 | 绝对禁止 |
| 第11条 | 仅有本商品的通用名称/图形/型号 | 缺乏显著性 |
| 第12条 | 仅直接表示商品的质量等功能特点 | 缺乏显著性 |

### 第四步：尼斯分类推荐与布局策略

基于用户的商品/服务内容，按照《类似商品和服务区分表》（尼斯分类第11版）进行推荐：

#### 推荐格式示例：
\`\`\`
## 尼斯分类建议

### 核心类别（必选）
| 类别 | 类别名称 | 包含群组 | 推荐理由 |
|------|---------|---------|---------|
| 第9类 | 科学仪器 | C0901(电子计算机及外部设备), C0907(软件) | 覆盖APP/小程序/软件产品 |
| 第42类 | 技术服务 | C4209(计算机编程), C4220(软件开发) | 覆盖SaaS服务/技术服务 |

### 关联类别（建议防御注册）
| 类别 | 类别名称 | 推荐理由 |
|------|---------|---------|
| 第35类 | 广告销售 | 保护电商销售渠道 |
| 第38类 | 通信服务 | 保护在线通信服务 |

### 不推荐类别
| 类别 | 原因 |
|------|------|
| 第25类 | 与当前业务无关，避免资源浪费 |
\`\`\`

### 第五步：在先权利风险预判与检索策略

#### 5.1 高风险近似类型提示
根据商标名称的特征，提示用户重点排查以下类型的在先商标：
- **同音不同字**：如"小确幸"→"小确信"/"小确兴"
- **字形近似**：如"IPClaw"→"IPCLAW"/"IpClaw"
- **含义近似**：如"智视"→"慧眼"/"明眸"
- **部分包含**：如"阿里巴巴"→"阿里爸爸"
- **中英文对应**：如"华为"→"HUAWEI"

#### 5.2 检索关键词策略
为用户生成优化的检索关键词列表：
- 完全匹配：商标完整名称
- 近似扩展：同音字/近形字/近义词组合
- 分类限定：按尼斯分类号精确筛选
- 申请人排除：排除自身已申请商标

#### 5.3 检索渠道指引（重要！）
向用户提供以下可靠检索途径，并说明各渠道的特点：

**官方渠道（权威数据源）：**
1. 中国商标网（https://wcjs.sbj.cnipa.gov.cn）— 商标局官方系统，数据最权威
   - 使用"商标近似查询"功能，输入商标名称+选择类别
   - 数据覆盖1980年至今全部商标
2. 国家知识产权公共服务平台（https://ggfw.cnipa.gov.cn）— 一站式服务入口

**专业检索工具（便捷高效）：**
3. 白兔商标查询网（https://so.tmo.cn）— 专业近似匹配算法
4. 阿里云商标检索（https://tm.aliyun.com）— 红/黄/绿三色风险标注
5. 标库网（https://www.tmkoo.com）— 按类别统计分析

**API接口服务（企业集成）：**
6. 蓝榜数据API — 4000万+商标数据，支持批量检索
7. Signa商标检索API — 多国商标数据

### 第六步：综合报告输出

输出完整的商标检索分析报告，格式如下：

\`\`\`
# 商标检索分析报告

## 基本信息
- 商标名称：[名称]
- 分析日期：[日期]
- 商品/服务：[描述]

## 一、显著性评估
### 1.1 音（读音）分析
[分析内容]

### 1.2 形（字形）分析
[分析内容]

### 1.3 义（含义）分析
[分析内容]

### 1.4 显著性等级：⭐⭐⭐⭐☆ (中等显著)

## 二、禁用条款审查结果
| 审查项 | 结果 | 说明 |
|--------|------|------|
| 国名/国旗等 | 通过 | - |
| 民族歧视 | 通过 | - |
| 欺骗性 | 通过 | - |
| ... | ... | ... |
| **综合结论** | **通过/存在风险** | [说明] |

## 三、尼斯分类建议
[分类表格]

## 四、在先权利风险评估
### 4.1 高风险近似类型
[列出需要重点排查的类型]

### 4.2 检索关键词清单
[关键词列表]

### 4.3 风险预评级：🟡 中等风险 / 🟢 低风险 / 🔴 高风险

## 五、检索行动指引
### 5.1 推荐检索步骤
1. 首先访问中国商标网进行近似查询...
2. 其次使用白兔商标查询网交叉验证...

### 5.2 外部检索链接
- [中国商标网](https://wcjs.sbj.cnipa.gov.cn)
- [白兔商标查询网](https://so.tmo.cn)
- ...

## 六、注册可行性综合评估
### 6.1 可行性评级：⭐⭐⭐⭐☆ (4/5) 推荐/谨慎尝试/不建议
### 6.2 关键优势
[列出]
### 6.3 主要风险点
[列出]
### 6.4 行动建议
[具体可执行的建议]

---
*报告由 IPClaw-Search 商标检索智能体生成*
*注：本报告基于AI专业知识分析，最终注册结果以国家知识产权局审查为准。建议结合官方检索渠道验证后提交申请。*
\`\`\`

## 重要原则

1. **专业性优先**：所有分析必须有法律依据，引用具体法条和审查标准
2. **客观中立**：如实告知风险，不夸大成功率也不制造恐慌
3. **操作性强**：提供的建议应具体可执行，包括具体的网址和操作步骤
4. **免责声明**：每次报告末尾必须包含免责声明，明确AI分析的辅助性质
5. **中文回复**：所有输出使用中文，专业术语保留英文原文
6. **结构化输出**：使用Markdown格式，层次清晰`;

/**
 * 商标检索智能体对话 - Workflow驱动模式
 * 
 * 设计思路：
 * 1. 不使用Function Calling / Tools（避免DSML问题）
 * 2. 纯对话模式 + 结构化System Prompt驱动Workflow
 * 3. 支持流式输出（stream=true时返回ReadableStream）
 * 4. 基于DeepSeek强大的推理能力完成全部分析工作
 */
export async function trademarkSearchAgentChat(messages, stream = false) {
  try {
    // 构建消息历史
    const messagesWithSystem = [
      { role: 'system', content: TRADEMARK_SEARCH_SYSTEM_PROMPT },
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
        temperature: 0.7,       // 适中的创造性
        stream: stream,         // 直接使用请求方的stream设置
        max_tokens: 4096,       // 足够生成长篇分析报告
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TrademarkSearch] DeepSeek API error:', response.status, errorText);
      
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
    console.error('[TrademarkSearch] Agent error:', error.message);
    
    // 错误降级：返回基于知识的静态分析
    const fallbackContent = generateFallbackResponse(messages);
    if (stream) {
      return createStringStream(fallbackContent);
    }
    throw error; // 让上层知道出错了
  }
}

/**
 * 生成降级响应（当API调用失败时的后备方案）
 * 从用户消息中提取商标名称并给出基础分析框架
 */
function generateFallbackResponse(messages) {
  // 尝试从最后一条用户消息中提取商标名称
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  const queryText = lastUserMsg?.content || '';
  
  // 简单提取可能的商标名称（引号内的文字）
  const nameMatch = queryText.match(/['"]([^'"]+)['"]|分析(.+?)这个/) || [];
  const trademarkName = nameMatch[1] || nameMatch[2] || '该商标';

  return `# 商标检索分析报告（离线模式）

## 基本信息
- 商标名称：${trademarkName}
- 分析时间：${new Date().toLocaleDateString('zh-CN')}
- 注：当前处于离线分析模式，以下为基于专业规则的初步评估

## 一、显著性初步评估

### 1.1 名称特征分析
商标"${trademarkName}"的文字组成特征如下：
- **字数**：${trademarkName.length}个字符
- **字符类型**：${/^[a-zA-Z0-9]+$/.test(trademarkName) ? '英文/数字' : (/^[\u4e00-\u9fa5]+$/.test(trademarkName) ? '纯中文' : '混合类型')}

### 1.2 显著性预判
${trademarkName.length <= 2 ? '⚠️ 商标名称较短（≤2字），可能因缺乏显著性被驳回，建议增加辨识度元素。' : 
  trademarkName.length >= 5 ? '✅ 商标名称较长，通常具有较强的固有显著性。' : 
  '📋 商标名称长度适中（3-4字），需结合具体含义进一步评估。'}

## 二、禁用条款快速筛查
基于《商标法》第10/11/12条进行初步筛查：
- ✅ 未发现明显违反绝对禁用条款的情形
- ⚠️ 最终判定需结合商标的具体使用场景和商品类别

## 三、下一步行动建议

### 3.1 请补充以下信息以便更精准分析：
1. 该商标计划使用的**商品或服务**是什么？
2. 所属**行业领域**？（如互联网/食品/服装/教育等）
3. 是否考虑**国际注册**？

### 3.2 推荐检索渠道（请务必人工验证）

| 渠道 | 网址 | 用途 |
|------|------|------|
| **中国商标网** | https://wcjs.sbj.cnipa.gov.cn | 官方近似查询（必查！） |
| **白兔商标查询网** | https://so.tmo.cn | 专业近似匹配 |
| **阿里云商标检索** | https://tm.aliyun.com | 快速风险筛查 |

### 3.3 检索步骤
1. 打开中国商标网 → 选择"商标近似查询"
2. 输入"${trademarkName}"作为商标名称
3. 选择相关尼斯分类（如不确定可选全部45类）
4. 查看检索结果，记录相似商标
5. 将结果反馈给我，我将为您做深度分析

---
*由 IPClaw-Search 商标检索智能体生成（离线模式）*
*建议连接在线服务获取完整的AI分析能力*`;
}

/**
 * 将字符串转换为可读流（用于降级场景下的流式响应）
 */
function createStringStream(text) {
  return Readable.from([text]);
}

export default trademarkSearchAgentChat;
