/**
 * IPClaw V2 通用任务模块 - 对话API
 *
 * 提供对话的创建、查询、消息发送、删除等操作，集成 DeepSeek API。
 */

import type { Conversation, Message, AttachedFile } from './types';
import { recentConversations, delay, generateId } from './mockData';

// API 配置
const API_BASE_URL = '/api';

// 内存中维护对话数据
let conversations = [...recentConversations];

/**
 * 获取所有对话列表（按更新时间倒序）
 * @returns 对话列表Promise
 */
export async function getConversations(): Promise<Conversation[]> {
  await delay(300);
  return [...conversations].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * 根据ID获取单个对话
 * @param id 对话ID
 * @returns 对话详情
 */
export async function getConversation(id: string): Promise<Conversation> {
  await delay(200);
  const conv = conversations.find((c) => c.id === id);
  if (!conv) {
    throw new Error(`对话 "${id}" 不存在`);
  }
  return JSON.parse(JSON.stringify(conv)) as Conversation;
}

/**
 * 创建新对话
 * @param model 使用的模型ID
 * @returns 新创建的对话
 */
export async function createConversation(model: string): Promise<Conversation> {
  await delay(400);
  const now = new Date();
  const newConv: Conversation = {
    id: generateId('conv-'),
    title: '新对话',
    model,
    messages: [],
    createdAt: now,
    updatedAt: now,
    isExpertMode: false,
  };
  conversations.unshift(newConv);
  return JSON.parse(JSON.stringify(newConv)) as Conversation;
}

/**
 * 发送消息并获取AI回复（支持流式输出）
 * @param convId 对话ID
 * @param content 用户消息内容
 * @param files 附件文件列表
 * @param onChunk 流式输出的回调函数
 * @returns AI回复消息
 */
export async function sendMessage(
  convId: string,
  content: string,
  files?: AttachedFile[],
  onChunk?: (chunk: string) => void
): Promise<Message> {
  // 1. 查找对话
  const conv = conversations.find((c) => c.id === convId);
  if (!conv) {
    throw new Error(`对话 "${convId}" 不存在`);
  }

  // 2. 添加用户消息
  const userMsg: Message = {
    id: generateId('msg-'),
    role: 'user',
    content,
    files,
    timestamp: new Date(),
  };
  conv.messages.push(userMsg);

  // 3. 更新对话标题（如果是第一条用户消息）
  if (conv.messages.filter((m) => m.role === 'user').length === 1) {
    conv.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
  }

  // 4. 构建消息历史（用于发送给 API）
  const messageHistory = conv.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // 5. 调用 DeepSeek API
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messageHistory,
        model: conv.model || 'deepseek-chat',
        temperature: 0.7,
        stream: !!onChunk,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    let aiContent = '';

    if (onChunk && response.body) {
      // 流式处理
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                aiContent += content;
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } else {
      // 非流式处理
      const data = await response.json();
      aiContent = data.choices?.[0]?.message?.content || '';
    }

    // 6. 添加AI消息
    const aiMsg: Message = {
      id: generateId('msg-'),
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
      tokens: Math.ceil(aiContent.length / 4), // 粗略估算 token 数
    };
    conv.messages.push(aiMsg);
    conv.updatedAt = new Date();

    return { ...aiMsg };
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
}

/**
 * 删除对话
 * @param id 对话ID
 */
export async function deleteConversation(id: string): Promise<void> {
  await delay(200);
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error(`对话 "${id}" 不存在`);
  }
  conversations.splice(idx, 1);
}

/**
 * 清空对话中的所有消息
 * @param convId 对话ID
 */
export async function clearMessages(convId: string): Promise<void> {
  await delay(200);
  const conv = conversations.find((c) => c.id === convId);
  if (!conv) {
    throw new Error(`对话 "${convId}" 不存在`);
  }
  conv.messages = [];
  conv.updatedAt = new Date();
}

/**
 * 切换专家模式
 * @param convId 对话ID
 * @param enabled 是否启用专家模式
 */
export async function toggleExpertMode(
  convId: string,
  enabled: boolean
): Promise<void> {
  await delay(200);
  const conv = conversations.find((c) => c.id === convId);
  if (!conv) {
    throw new Error(`对话 "${convId}" 不存在`);
  }
  conv.isExpertMode = enabled;
}

// ───────────────────────────────────────────────
// 内部辅助：根据上下文生成AI回复
// ───────────────────────────────────────────────

interface AIReply {
  content: string;
  thinking?: string;
  tokens: number;
}

function generateAIReply(
  userContent: string,
  isExpertMode: boolean,
  modelId: string
): AIReply {
  const lower = userContent.toLowerCase();

  // 关键词匹配，生成相关回复
  if (lower.includes('专利') || lower.includes('权利要求')) {
    return generatePatentReply(userContent, isExpertMode);
  }
  if (lower.includes('商标') || lower.includes('注册')) {
    return generateTrademarkReply(userContent, isExpertMode);
  }
  if (lower.includes('版权') || lower.includes('著作权')) {
    return generateCopyrightReply(userContent, isExpertMode);
  }
  if (lower.includes('分析') || lower.includes('评估')) {
    return generateAnalysisReply(userContent, isExpertMode);
  }
  if (lower.includes('合规') || lower.includes('检测')) {
    return generateComplianceReply(userContent, isExpertMode);
  }
  if (lower.includes('文件') || lower.includes('上传') || lower.includes('文档')) {
    return generateFileReply(userContent, isExpertMode);
  }
  if (lower.includes('技能') || lower.includes('skill')) {
    return generateSkillReply(userContent, isExpertMode);
  }
  if (lower.includes('你好') || lower.includes('您好') || lower.includes('在吗')) {
    return generateGreetingReply(isExpertMode);
  }

  // 通用回复
  return generateGenericReply(userContent, isExpertMode, modelId);
}

function generatePatentReply(content: string, isExpertMode: boolean): AIReply {
  const tokens = 1200 + Math.floor(Math.random() * 1000);

  const aiContent = `收到您的专利相关问题。我来为您详细分析：\n\n**一、技术分析要点**\n\n根据您描述的技术方案，建议重点关注以下方面：\n\n1. **新颖性评估**：建议进行全面的现有技术检索，重点关注近5年内同领域的专利申请。\n2. **创造性高度**：技术效果的量化数据（如效率提升百分比、精度指标等）是证明创造性的关键。\n3. **申请策略**：根据技术成熟度选择合适的申请时机，避免因过早公开影响新颖性。\n\n**二、具体建议**\n\n- 完善技术交底书，确保技术方案描述清楚完整\n- 准备充分的实施例和实验数据\n- 权利要求布局采用"核心+外围"的分层策略\n- 注意申请文件的形式要求（格式、签章等）\n\n**三、后续步骤**\n\n1. 完成 prior art 检索报告\n2. 确定专利申请类型（发明/实用新型/外观设计）\n3. 撰写申请文件初稿\n4. 内部审核修改\n5. 正式提交申请\n\n如果您能提供更多技术细节，我可以给出更精准的分析建议。`;

  const thinking = isExpertMode
    ? `1. 识别技术领域：${extractKeywords(content)}\n2. 确定专利类型：发明专利可能性较高\n3. 检索相关法条：《专利法》第22条（新颖性、创造性、实用性）\n4. 分析技术特征：提取关键技术特征点\n5. 评估授权前景：基于技术效果判断创造性高度\n6. 制定回复策略：提供结构化分析框架\n7. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateTrademarkReply(_content: string, isExpertMode: boolean): AIReply {
  const tokens = 800 + Math.floor(Math.random() * 600);

  const aiContent = `关于商标注册的问题，我为您整理了以下要点：\n\n**一、注册前准备**\n\n1. **商标查询**：在提交申请前务必进行全面的商标查询，包括相同和近似商标检索\n2. **尼斯分类**：根据产品/服务范围选择适当的商标类别，注意不要遗漏相关类别\n3. **显著性评估**：确保商标具有足够的显著性，避免使用通用名称或描述性词汇\n\n**二、申请流程**\n\n- 提交申请 → 形式审查（1个月）→ 实质审查（4-6个月）→ 初审公告（3个月）→ 注册公告\n- 整个流程约需9-12个月\n\n**三、常见风险**\n\n1. 与在先注册商标构成近似被驳回\n2. 缺乏显著性被驳回\n3. 被第三方提出异议\n4. 商品/服务分类不当导致保护范围不足\n\n**四、建议**\n\n- 委托专业代理机构办理，提高成功率\n- 考虑防御性注册相关类别\n- 建立商标监测机制，及时发现近似商标\n\n如需具体的商标查询或分类建议，请提供商标名称和拟注册的商品/服务范围。`;

  const thinking = isExpertMode
    ? `1. 识别业务类型：商标注册\n2. 确定法律框架：《商标法》及实施条例\n3. 梳理申请流程：查询→申请→审查→公告→注册\n4. 评估常见风险点：近似、显著性、异议\n5. 制定建议方案：全面覆盖注册前中后期\n6. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateCopyrightReply(_content: string, isExpertMode: boolean): AIReply {
  const tokens = 700 + Math.floor(Math.random() * 500);

  const aiContent = `软件著作权登记的相关要点如下：\n\n**一、登记材料清单**\n\n1. **源代码**：提交前后各连续30页，合计不少于60页；不足60页的需全部提交\n2. **软件说明书/操作手册**：详细描述软件功能、技术架构、操作流程\n3. **身份证明文件**：个人身份证/企业营业执照复印件\n4. **申请表**：在线填写后下载打印\n5. **代理委托书**（如委托代理机构）\n\n**二、源代码处理要点**\n\n- 每页不少于50行代码\n- 页眉需标注软件名称和版本号\n- 去除注释和空行后应仍保持逻辑完整\n- 页码连续编制\n\n**三、办理流程**\n\n1. 在线注册账号并填写申请表\n2. 准备并提交纸质材料\n3. 材料受理（约5个工作日）\n4. 审查（约30-45个工作日）\n5. 领取证书\n\n**四、注意事项**\n\n- 建议同时申请软件产品登记测试报告\n- 开源软件需注意许可证兼容性问题\n- 委托开发的软件需明确著作权归属\n\n如需进一步帮助，请告诉我您需要申请的具体软件类型。`;

  const thinking = isExpertMode
    ? `1. 识别业务类型：软件著作权登记\n2. 梳理材料要求：源代码、说明书、身份证明\n3. 明确格式规范：页眉、页码、行数要求\n4. 梳理办理流程：申请→受理→审查→发证\n5. 提醒特殊注意事项\n6. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateAnalysisReply(content: string, isExpertMode: boolean): AIReply {
  const tokens = 1400 + Math.floor(Math.random() * 800);

  const aiContent = `我来为您进行专业分析。基于您提供的信息，我的分析如下：\n\n**一、分析框架**\n\n1. **法律层面**：评估相关法律风险和保护可能性\n2. **技术层面**：分析技术方案的先进性和实施可行性\n3. **市场层面**：评估商业价值和竞争优势\n4. **战略层面**：结合行业趋势给出建议\n\n**二、关键发现**\n\n- 该技术/方案在${extractKeywords(content)}领域具有一定的创新性\n- 建议重点关注的技术方向包括：智能算法优化、数据处理效率、用户体验提升\n- 潜在的法律风险点需进一步深入分析\n\n**三、建议方案**\n\n1. **短期行动**：完善技术文档，进行全面的 prior art 检索\n2. **中期规划**：制定IP布局策略，考虑核心技术的多维度保护\n3. **长期战略**：建立持续的IP监测和维护机制\n\n**四、需要补充的信息**\n\n为了给出更精准的分析，建议您补充以下材料：\n- 详细的技术方案文档\n- 相关的实验数据或对比测试结果\n- 已有的IP资产清单\n- 主要竞争对手的IP布局情况\n\n我会根据您提供的补充信息进一步完善分析。`;

  const thinking = isExpertMode
    ? `1. 构建多维度分析框架：法律+技术+市场+战略\n2. 识别分析对象领域\n3. 评估创新性和可行性\n4. 制定分层建议方案\n5. 列出信息缺口\n6. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateComplianceReply(_content: string, isExpertMode: boolean): AIReply {
  const tokens = 900 + Math.floor(Math.random() * 500);

  const aiContent = `关于合规检测，我为您提供以下分析：\n\n**一、合规检测范围**\n\n1. **文件格式合规**：检查申请文件的格式是否符合官方要求\n2. **内容完整性**：审查必要内容是否齐全，是否存在遗漏\n3. **法律合规性**：核实是否符合相关法律法规要求\n4. **程序合规性**：检查程序步骤是否完整、时间是否在法定期限内\n\n**二、检测结果说明**\n\n- **通过**：该检查项符合所有要求\n- **警告**：存在潜在风险，建议关注但非必须修改\n- **失败**：不符合要求，必须修改后才能继续\n- **扫描中**：正在进行自动检测，请稍候查看结果\n- **待处理**：需要人工介入处理\n\n**三、自动修复功能**\n\n对于标注为"可自动修复"的项目，系统将自动进行修正：\n- 文件格式自动调整\n- 敏感信息自动脱敏\n- 页码和格式自动规范化\n\n**四、建议**\n\n- 优先处理"失败"状态的检测项\n- 对"警告"状态的项进行评估，决定是否修改\n- 定期进行合规检测，确保IP资产管理的规范性\n\n如需进行具体的合规检测，请上传需要检测的文件或选择检测项目。`;

  const thinking = isExpertMode
    ? `1. 识别业务类型：合规检测\n2. 梳理检测维度：格式、内容、法律、程序\n3. 解释状态含义：通过/警告/失败/扫描中/待处理\n4. 说明自动修复能力\n5. 给出处理优先级建议\n6. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateFileReply(_content: string, isExpertMode: boolean): AIReply {
  const tokens = 600 + Math.floor(Math.random() * 400);

  const aiContent = `我已收到您上传的文件，正在进行分析处理。\n\n**文件处理状态：**\n\n- 文件已成功接收，格式识别完成\n- 正在提取文本内容进行语义分析\n- 文件中的关键信息已纳入对话上下文\n\n**后续操作建议：**\n\n1. 您可以针对文件内容提出具体问题\n2. 我可以帮您分析文件中的技术方案、法律风险等\n3. 支持基于文件内容的专利检索和分析\n4. 可以生成文件摘要和关键点提炼\n\n请告诉我您希望如何处理这些文件？例如：\n- 分析文件中的技术方案\n- 检查文件格式和合规性\n- 提取关键信息生成摘要\n- 基于文件内容进行 prior art 检索`;

  const thinking = isExpertMode
    ? `1. 确认文件接收状态\n2. 启动文件解析流程\n3. 提取关键信息纳入上下文\n4. 提供后续操作建议\n5. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateSkillReply(_content: string, isExpertMode: boolean): AIReply {
  const tokens = 700 + Math.floor(Math.random() * 400);

  const aiContent = `IPClaw平台提供丰富的专业技能，涵盖专利、商标、版权、法律等多个领域。\n\n**技能使用方法：**\n\n1. **直接调用**：在对话框中点击「Skill技能」面板，选择需要的技能\n2. **自动匹配**：系统会根据您的对话内容智能推荐相关技能\n3. **快捷指令**：输入"/"可快速调出常用技能列表\n\n**当前热门技能：**\n\n- 📄 专利撰写助手 - 自动生成专利申请文件\n- 🔍  prior art检索分析 - 全面检索现有技术\n- ⚖️ 权利要求分析 - 深度解析保护范围\n- 🏷️ 商标注册申请 - 辅助完成商标全流程\n- 💰 专利价值评估 - 多维度价值评估报告\n\n**技能分类：**\n\n- 专利类（专利撰写、检索分析、无效宣告等）\n- 商标类（注册申请、监测预警、争议解决等）\n- 版权类（登记助手、侵权监测等）\n- 评估类（价值评估、组合分析、技术转让等）\n- 法律类（诉讼策略、FTO分析、合同审查等）\n- 通用类（战略咨询、竞争分析、知识培训等）\n\n需要我为您推荐适合当前场景的技能吗？`;

  const thinking = isExpertMode
    ? `1. 识别用户意图：了解技能功能\n2. 介绍技能使用方法\n3. 推荐热门技能\n4. 展示技能分类体系\n5. 主动提供帮助\n6. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateGreetingReply(isExpertMode: boolean): AIReply {
  const tokens = 400 + Math.floor(Math.random() * 200);

  const aiContent = `您好！我是IPClaw智能助手，很高兴为您服务。\n\n我可以帮您处理以下业务：\n\n📄 **专利相关**：专利撰写、 prior art 检索、权利要求分析、专利无效宣告\n🏷️ **商标相关**：商标注册申请、监测预警、争议解决\n©️ **版权相关**：软件著作权登记、侵权监测\n📊 **评估分析**：专利价值评估、组合分析、竞争对手分析\n⚖️ **法律服务**：诉讼策略、FTO分析、IP合同审查\n🔧 **通用服务**：IP战略咨询、知识培训、自动分类\n\n您可以：\n1. 直接描述您的问题或需求\n2. 上传文件让我帮您分析\n3. 调用右侧的Skill技能获得专业服务\n4. 切换专家模式获取深度分析\n\n请问有什么可以帮您的？`;

  const thinking = isExpertMode
    ? `1. 识别用户意图：打招呼/初始化对话\n2. 生成友好问候语\n3. 展示平台能力范围\n4. 引导用户下一步操作\n5. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function generateGenericReply(
  content: string,
  isExpertMode: boolean,
  modelId: string
): AIReply {
  const tokens = 1000 + Math.floor(Math.random() * 800);

  const aiContent = `感谢您的提问！我已收到您的消息，正在为您处理。\n\n针对"${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"，我的初步回应如下：\n\n**理解与确认**\n\n我已理解您的需求，这是一个涉及知识产权领域的专业问题。为了更好地为您服务，建议：\n\n1. **补充细节**：如果问题涉及具体技术方案或法律文件，请提供更多细节\n2. **上传文件**：如有相关文件，可以上传让我进行深入分析\n3. **调用Skill**：针对特定业务场景，可以调用平台的专业技能获得更精准的服务\n4. **切换模型**：当前使用的是${modelId === 'deepseek-v3' ? 'DeepSeek-V3' : modelId === 'qwen-max' ? 'Qwen-Max' : modelId === 'gpt-4' ? 'GPT-4' : 'Claude 3'}模型，如需切换可在顶部模型选择器中操作\n\n**我能为您做什么：**\n\n- 解答知识产权相关的专业问题\n- 分析技术方案的专利申请前景\n- 协助撰写和审查IP申请文件\n- 进行 prior art 检索和分析\n- 评估IP资产价值\n- 提供合规检测和风险预警\n\n请告诉我您希望深入了解的方面，我会继续为您提供专业支持。`;

  const thinking = isExpertMode
    ? `1. 分析用户输入：未匹配到特定业务关键词\n2. 生成通用友好回复\n3. 引导用户提供更多信息\n4. 展示平台能力\n5. 提供后续操作建议\n6. 预估token消耗：${tokens}`
    : undefined;

  return { content: aiContent, thinking, tokens };
}

function extractKeywords(content: string): string {
  // 简单提取关键词
  const keywords = ['智能', '算法', '系统', '方法', '装置', '控制', '处理', '分析', '检测'];
  const found = keywords.filter((k) => content.includes(k));
  return found.length > 0 ? found.join('、') : '相关技术';
}
