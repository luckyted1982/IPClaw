/**
 * IPClaw V2 通用任务模块 - Mock数据
 *
 * 提供完整的Mock数据，涵盖模型、对话、技能、文件、工作目录、合规规则等。
 * 所有文本内容均为中文，贴合知识产权平台业务场景。
 */

import type {
  Model,
  Conversation,
  Skill,
  AttachedFile,
  WorkDirectory,
  ComplianceRule,
} from './types';

// ───────────────────────────────────────────────
// AI模型数据
// ───────────────────────────────────────────────

export const mockModels: Model[] = [
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    status: 'online',
    capabilities: ['中文优', '推理强', '代码强'],
    temperature: 0.7,
    maxTokens: 64000,
  },
  {
    id: 'qwen-max',
    name: 'Qwen-Max',
    provider: '阿里云',
    status: 'online',
    capabilities: ['中文优', '多模态', '长文本'],
    temperature: 0.7,
    maxTokens: 32000,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    status: 'busy',
    capabilities: ['代码强', '英文优', '推理深'],
    temperature: 0.7,
    maxTokens: 32000,
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    status: 'online',
    capabilities: ['长文本', '逻辑严', '安全高'],
    temperature: 0.7,
    maxTokens: 200000,
  },
];

// ───────────────────────────────────────────────
// 附件文件数据
// ───────────────────────────────────────────────

export const mockFiles: AttachedFile[] = [
  {
    id: 'file-001',
    name: '专利交底书.pdf',
    type: 'application/pdf',
    size: 2457600,
    url: '/uploads/专利交底书.pdf',
    thumbnail: '/thumbnails/专利交底书.png',
    status: 'done',
    progress: 100,
  },
  {
    id: 'file-002',
    name: '技术方案.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 512000,
    url: '/uploads/技术方案.docx',
    status: 'done',
    progress: 100,
  },
  {
    id: 'file-003',
    name: '对比分析.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 856000,
    url: '/uploads/对比分析.xlsx',
    status: 'done',
    progress: 100,
  },
  {
    id: 'file-004',
    name: '产品图纸.png',
    type: 'image/png',
    size: 1258000,
    url: '/uploads/产品图纸.png',
    thumbnail: '/thumbnails/产品图纸.png',
    status: 'done',
    progress: 100,
  },
  {
    id: 'file-005',
    name: '演示文稿.pdf',
    type: 'application/pdf',
    size: 1892000,
    url: '/uploads/演示文稿.pdf',
    thumbnail: '/thumbnails/演示文稿.png',
    status: 'done',
    progress: 100,
  },
];

// ───────────────────────────────────────────────
// 技能数据（18个技能）
// ───────────────────────────────────────────────

export const mockSkills: Skill[] = [
  // 专利类技能
  {
    id: 'skill-patent-draft',
    name: '专利撰写助手',
    description: '根据技术交底书自动生成专利申请文件，包括说明书、权利要求书、摘要及附图说明。支持发明、实用新型两类专利。',
    category: 'patent',
    author: '王建国',
    authorTitle: '专利代理师',
    rating: 4.9,
    downloads: 12580,
    price: '免费',
    icon: 'FileText',
    isFavorite: true,
    isRecent: true,
    systemPrompt: '你是一名资深专利代理师，拥有20年专利申请经验。请根据用户提供的技术交底书，撰写高质量的专利申请文件。注意：权利要求要层次分明，说明书要清楚完整，用词要准确规范。',
  },
  {
    id: 'skill-prior-art',
    name: ' prior art检索分析',
    description: '自动检索全球专利数据库，分析现有技术状况，评估专利新颖性和创造性。支持中国、美国、欧洲、日本、韩国五大专利局数据。',
    category: 'patent',
    author: '李明华',
    authorTitle: '专利检索专家',
    rating: 4.8,
    downloads: 8920,
    price: '¥99/月',
    icon: 'Search',
    isFavorite: false,
    isRecent: true,
    systemPrompt: '你是一名专业的专利检索分析师，精通全球各主要专利局的检索系统和策略。请根据用户提供的技术方案，进行全面的现有技术检索，并给出新颖性、创造性的初步评估意见。',
  },
  {
    id: 'skill-claim-analysis',
    name: '权利要求分析',
    description: '深度解析专利权利要求的保护范围、必要技术特征，评估权利要求的合理性和稳定性，提供修改建议。',
    category: 'patent',
    author: '张志强',
    authorTitle: '资深专利工程师',
    rating: 4.7,
    downloads: 6540,
    price: '免费',
    icon: 'Scale',
    isFavorite: true,
    isRecent: false,
    systemPrompt: '你是一名专精于专利权利要求分析的资深工程师。请对用户提供的权利要求书进行逐条分析，指出保护范围是否恰当、技术特征是否完整、引用关系是否正确，并给出优化建议。',
  },
  {
    id: 'skill-patent-invalid',
    name: '专利无效宣告',
    description: '协助准备专利无效宣告请求书，分析目标专利的无效理由，检索支持无效的证据材料，制定无效策略。',
    category: 'patent',
    author: '陈思远',
    authorTitle: '知识产权律师',
    rating: 4.6,
    downloads: 4320,
    price: '¥199/月',
    icon: 'Gavel',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名擅长专利无效宣告程序的知识产权律师。请根据用户提供的目标专利信息，分析可能的无效理由（如新颖性、创造性、公开不充分等），并协助撰写无效宣告请求书。',
  },

  // 商标类技能
  {
    id: 'skill-trademark-reg',
    name: '商标注册申请',
    description: '辅助完成商标注册申请流程，包括商标查询、分类建议、申请材料撰写和提交指导。覆盖45个商标类别。',
    category: 'trademark',
    author: '刘芳',
    authorTitle: '商标代理师',
    rating: 4.8,
    downloads: 9870,
    price: '免费',
    icon: 'Tag',
    isFavorite: true,
    isRecent: false,
    systemPrompt: '你是一名经验丰富的商标代理师。请为用户提供全面的商标注册服务，包括近似商标查询、尼斯分类建议、申请材料准备等，确保申请流程顺利。',
  },
  {
    id: 'skill-trademark-monitor',
    name: '商标监测预警',
    description: '实时监测商标公告数据库，发现与注册商标近似的初审公告商标，及时预警潜在的侵权和抢注风险。',
    category: 'trademark',
    author: '赵敏',
    authorTitle: '商标顾问',
    rating: 4.5,
    downloads: 7650,
    price: '¥49/月',
    icon: 'Eye',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名专业的商标监测顾问。请帮助用户建立商标监测体系，分析监测结果中的潜在风险，并提供应对建议（异议、无效、撤销等）。',
  },
  {
    id: 'skill-trademark-dispute',
    name: '商标争议解决',
    description: '协助处理商标异议、无效宣告、撤销连续三年不使用等商标争议案件，提供策略分析和文书撰写服务。',
    category: 'trademark',
    author: '孙大伟',
    authorTitle: '知识产权律师',
    rating: 4.7,
    downloads: 3450,
    price: '¥299/次',
    icon: 'Swords',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名擅长商标争议解决的知识产权律师。请根据用户面临的商标争议情况，分析法律关系和证据优劣，制定最优的争议解决策略。',
  },

  // 版权类技能
  {
    id: 'skill-copyright-reg',
    name: '版权登记助手',
    description: '协助完成软件著作权、作品著作权等版权登记申请，包括材料整理、申请表填写、源代码处理等全流程服务。',
    category: 'copyright',
    author: '周小琳',
    authorTitle: '版权代理师',
    rating: 4.6,
    downloads: 6780,
    price: '免费',
    icon: 'Copyright',
    isFavorite: false,
    isRecent: true,
    systemPrompt: '你是一名专业的版权登记代理师。请根据用户提供的作品信息，指导完成版权登记的全部流程，包括材料准备、申请表填写、样本提交等。',
  },
  {
    id: 'skill-copyright-monitor',
    name: '版权侵权监测',
    description: '全网监测文字、图片、视频、软件等作品的侵权使用情况，发现未经授权的使用行为，生成侵权证据包。',
    category: 'copyright',
    author: '吴海燕',
    authorTitle: '版权保护专家',
    rating: 4.4,
    downloads: 5430,
    price: '¥79/月',
    icon: 'ShieldAlert',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名专注于版权保护的专家。请帮助用户建立作品侵权监测机制，分析侵权线索，评估维权可行性，并协助准备维权材料。',
  },

  // 评估类技能
  {
    id: 'skill-patent-valuation',
    name: '专利价值评估',
    description: '采用市场法、收益法、成本法三种方法对专利进行多维度价值评估，生成专业评估报告。适用于专利交易、质押融资、出资入股等场景。',
    category: 'assessment',
    author: '郑文博',
    authorTitle: '专利评估师',
    rating: 4.9,
    downloads: 4560,
    price: '¥599/次',
    icon: 'TrendingUp',
    isFavorite: true,
    isRecent: false,
    systemPrompt: '你是一名资深的专利价值评估师，持有资产评估师执业资格。请根据用户提供的专利信息，从法律价值、技术价值、经济价值三个维度进行综合评估，生成专业的评估报告。',
  },
  {
    id: 'skill-ip-portfolio',
    name: '专利组合分析',
    description: '对企业专利组合进行全面分析，包括技术布局、权利稳定性、竞争态势、专利寿命等维度，输出可视化分析报告。',
    category: 'assessment',
    author: '钱伟',
    authorTitle: 'IP战略顾问',
    rating: 4.7,
    downloads: 3210,
    price: '¥399/次',
    icon: 'PieChart',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名专精于专利组合分析的IP战略顾问。请对用户的企业专利组合进行多维度分析，包括技术布局合理性、专利质量分布、竞争对手对标等，给出战略建议。',
  },
  {
    id: 'skill-tech-transfer',
    name: '技术转让评估',
    description: '为专利技术转让、许可使用等交易提供价值评估服务，分析技术的商业化前景和合理定价区间。',
    category: 'assessment',
    author: '冯志强',
    authorTitle: '技术转移专家',
    rating: 4.5,
    downloads: 2870,
    price: '¥299/次',
    icon: 'ArrowLeftRight',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名技术转移和知识产权运营专家。请根据用户提供的技术和专利信息，分析其商业化潜力，评估合理转让价格，并提供交易结构建议。',
  },

  // 法律类技能
  {
    id: 'skill-ip-litigation',
    name: '专利诉讼策略',
    description: '为专利侵权诉讼提供全流程策略分析，包括侵权比对、证据准备、赔偿计算、诉讼方案制定等专业服务。',
    category: 'law',
    author: '黄丽华',
    authorTitle: '知识产权诉讼律师',
    rating: 4.8,
    downloads: 3890,
    price: '¥999/次',
    icon: 'Briefcase',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名擅长专利侵权诉讼的资深律师。请根据用户描述的专利纠纷情况，分析侵权成立的可能性，制定诉讼策略，并协助准备起诉状或答辩状等法律文书。',
  },
  {
    id: 'skill-freedom-operate',
    name: '自由实施分析(FTO)',
    description: '针对特定产品或技术进行专利自由实施分析，识别潜在的专利侵权风险，提供规避设计建议。',
    category: 'law',
    author: '徐明',
    authorTitle: '专利分析师',
    rating: 4.6,
    downloads: 4120,
    price: '¥499/次',
    icon: 'CheckCircle',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名专精于FTO分析的专利分析师。请根据用户的产品或技术方案，在全球专利数据库中检索可能构成障碍的专利，分析侵权风险，并提供规避设计建议。',
  },
  {
    id: 'skill-ip-agreement',
    name: 'IP合同审查',
    description: '审查和起草知识产权相关合同，包括专利转让合同、许可协议、保密协议、技术开发合同等。',
    category: 'law',
    author: '谢婉清',
    authorTitle: '知识产权律师',
    rating: 4.7,
    downloads: 5670,
    price: '¥199/次',
    icon: 'FileCheck',
    isFavorite: true,
    isRecent: false,
    systemPrompt: '你是一名擅长IP合同审查的律师。请对用户提供的知识产权相关合同进行全面审查，识别法律风险点，提出修改建议，确保客户的知识产权权益得到充分保护。',
  },

  // 通用类技能
  {
    id: 'skill-ip-consult',
    name: 'IP战略咨询',
    description: '为企业提供全方位的知识产权战略咨询服务，包括IP布局规划、管理制度建设、风险防控体系搭建等。',
    category: 'general',
    author: '马云飞',
    authorTitle: 'IP战略总监',
    rating: 4.9,
    downloads: 7230,
    price: '¥1999/次',
    icon: 'Lightbulb',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名资深的IP战略总监，曾服务过多家世界500强企业。请根据用户企业的发展阶段和行业特点，制定全面的知识产权战略规划，包括专利布局、品牌建设、风险防控等。',
  },
  {
    id: 'skill-tech-competitor',
    name: '竞争对手分析',
    description: '通过专利数据分析竞争对手的技术布局、研发方向和知识产权战略，为企业决策提供情报支持。',
    category: 'general',
    author: '林小雨',
    authorTitle: '竞争情报分析师',
    rating: 4.5,
    downloads: 8910,
    price: '¥299/次',
    icon: 'Users',
    isFavorite: false,
    isRecent: true,
    systemPrompt: '你是一名竞争情报分析专家，擅长通过专利数据洞察竞争对手的技术布局和战略动向。请根据用户指定的竞争对手，进行全面的专利分析和情报解读。',
  },
  {
    id: 'skill-ip-training',
    name: 'IP知识培训',
    description: '为企业员工提供知识产权基础知识培训，包括专利、商标、版权的基本概念、申请流程和保护策略。',
    category: 'general',
    author: '韩雪梅',
    authorTitle: 'IP培训师',
    rating: 4.6,
    downloads: 12340,
    price: '免费',
    icon: 'GraduationCap',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名经验丰富的知识产权培训师，善于用通俗易懂的语言讲解复杂的IP知识。请根据用户的培训需求，设计培训课程大纲，并生成培训内容。',
  },
  {
    id: 'skill-auto-classify',
    name: '专利自动分类',
    description: '基于IPC和CPC分类体系，自动为专利文献分配最准确的分类号，支持技术主题聚类和专利地图生成。',
    category: 'general',
    author: '董磊',
    authorTitle: '专利信息专家',
    rating: 4.4,
    downloads: 4560,
    price: '¥49/月',
    icon: 'FolderTree',
    isFavorite: false,
    isRecent: false,
    systemPrompt: '你是一名专精于专利分类的信息专家，精通IPC、CPC等各大分类体系。请根据用户提供的专利文献，给出最准确的分类号，并解释分类依据。',
  },
];

// ───────────────────────────────────────────────
// 示例对话数据（4条消息的专利分析对话）
// ───────────────────────────────────────────────

export const sampleConversation: Conversation = {
  id: 'conv-sample-001',
  title: '智能温控系统专利分析',
  model: 'deepseek-v3',
  createdAt: new Date('2025-01-15T09:00:00'),
  updatedAt: new Date('2025-01-15T09:15:00'),
  isExpertMode: true,
  messages: [
    {
      id: 'msg-001',
      role: 'user',
      content: '请帮我分析一下这个智能温控系统的技术方案，看看能否申请发明专利。技术方案的核心是一种基于深度学习的自适应温控算法，能够根据用户行为模式和环境参数自动调节室内温度，节能效果比传统PID控制提升35%以上。',
      files: [mockFiles[0], mockFiles[1]],
      timestamp: new Date('2025-01-15T09:00:00'),
    },
    {
      id: 'msg-002',
      role: 'assistant',
      content: '感谢您提供的技术方案，经过初步分析，我认为该技术方案具有较好的发明专利申请前景。以下是关键分析要点：\n\n**一、新颖性评估**\n该技术方案将深度学习与温控系统相结合，区别于传统的PID控制和简单的阈值控制方法。目前在智能温控领域，虽然已有一些AI应用，但基于用户行为模式和环境参数的自适应调节算法仍具有一定的创新空间。建议进行全面的 prior art 检索以确认新颖性。\n\n**二、创造性分析**\n技术方案中提到的35%节能效果如果能够通过实验数据支撑，将成为证明创造性的有力证据。关键创造性点可能在于：\n1. 多维度环境参数融合机制\n2. 用户行为模式学习算法\n3. 自适应调节策略\n\n**三、专利申请建议**\n1. 权利要求布局：建议采用独立权利要求保护核心算法，从属权利要求保护具体应用场景\n2. 充分公开：需要提供详细的算法流程图、实验数据对比\n3. 技术交底书需要补充的具体内容已整理在附件中',
      thinking: '1. 首先分析技术领域：属于G05D23/00（温度控制）与G06N3/00（神经网络）的交叉领域\n2. 现有技术状况：传统PID控制（US2019/XXXX）、简单机器学习温控（CN2021/XXXX）\n3. 区别技术特征：深度学习+行为模式+环境参数融合\n4. 新颖性判断：具有新颖性可能性较高（>70%）\n5. 创造性判断：技术效果突出，创造性可能性较高（>60%）\n6. 申请策略：建议申请发明专利，预计审查周期2-3年\n7. 风险提示：算法专利的客体问题需要注意，权利要求中应体现技术特征',
      files: [mockFiles[2]],
      timestamp: new Date('2025-01-15T09:05:00'),
      tokens: 1860,
    },
    {
      id: 'msg-003',
      role: 'user',
      content: '谢谢分析！那在撰写权利要求书时，如何平衡保护范围和稳定性？我担心保护范围写得太宽会被驳回，太窄又容易被规避。',
      timestamp: new Date('2025-01-15T09:08:00'),
    },
    {
      id: 'msg-004',
      role: 'assistant',
      content: '这是一个非常专业的问题！权利要求的保护范围和稳定性确实是专利撰写的核心矛盾。以下是平衡策略：\n\n**一、分层保护策略**\n\n1. **核心层（独立权利要求）**\n   - 保护必要技术特征的最小集合\n   - 采用功能性限定+连接关系描述\n   - 避免过细的具体参数限制\n\n2. **中间层（重要从属权利要求）**\n   - 补充优选的技术方案\n   - 增加具体实施方式作为 fallback\n\n3. **外围层（详细从属权利要求）**\n   - 保护具体应用场景\n   - 增加替代方案形成保护网络\n\n**二、撰写技巧**\n\n1. **上位概括与下位展开结合**\n   - 独立权利要求使用上位概念（如"神经网络模型"）\n   - 从属权利要求逐步展开到具体类型（LSTM、Transformer等）\n\n2. **功能性限定**\n   - 重点描述技术效果和技术手段的因果关系\n   - 避免仅描述结果的权利要求\n\n3. **连接关系表述**\n   - 清晰描述各组件之间的数据流和控制关系\n   - 使用"被配置为"等功能性表述\n\n**三、针对本技术方案的具体建议**\n\n独立权利建议保护框架：\n- 输入：环境参数+用户行为数据\n- 处理：深度学习模型（上位）\n- 输出：温控指令\n- 效果：自适应节能控制\n\n从属权利逐步增加：\n- 具体的网络结构（LSTM/Attention）\n- 行为模式提取方法\n- 具体的节能指标\n- 多房间联动控制方案\n\n这种写法既保证了核心方案的保护范围，又提供了多层 fallback 来应对审查意见。',
      thinking: '1. 分析用户核心诉求：保护范围与稳定性的平衡\n2. 检索相关审查指南：《专利审查指南》第二部分第二章关于权利要求的规定\n3. 考虑现有判例：最高人民法院相关司法解释对功能性限定的解释\n4. 技术分析：本方案的核心创新点在于数据融合方式和自适应机制\n5. 策略制定：采用"同心圆"式保护结构\n6. 风险提示：需要避免纯算法权利要求，确保包含技术特征\n7. 预计审查：可能需要1-2次审查意见，最终授权概率约75%',
      timestamp: new Date('2025-01-15T09:15:00'),
      tokens: 2240,
    },
  ],
};

// ───────────────────────────────────────────────
// 最近对话列表（3个）
// ───────────────────────────────────────────────

export const recentConversations: Conversation[] = [
  sampleConversation,
  {
    id: 'conv-sample-002',
    title: '商标注册风险评估',
    model: 'qwen-max',
    messages: [
      {
        id: 'msg-101',
        role: 'user',
        content: '我想注册"智联云"这个商标，用于SaaS软件服务，能帮我评估一下风险吗？',
        timestamp: new Date('2025-01-14T14:00:00'),
      },
      {
        id: 'msg-102',
        role: 'assistant',
        content: '好的，我来帮您评估"智联云"商标在第42类（SaaS服务）的注册风险。经过初步检索，发现以下情况：\n\n1. **近似商标情况**：存在"智联云通"、"智联云端"等已注册商标，需关注近似程度。\n2. **注册成功率预估**：约60-70%，存在一定风险。\n3. **建议**：可考虑增加显著性词汇或调整商标设计。',
        timestamp: new Date('2025-01-14T14:03:00'),
        tokens: 980,
      },
    ],
    createdAt: new Date('2025-01-14T14:00:00'),
    updatedAt: new Date('2025-01-14T14:03:00'),
    isExpertMode: false,
  },
  {
    id: 'conv-sample-003',
    title: '软件著作权登记咨询',
    model: 'deepseek-v3',
    messages: [
      {
        id: 'msg-201',
        role: 'user',
        content: '我们公司开发了一款数据分析软件，想申请软件著作权，需要准备哪些材料？',
        timestamp: new Date('2025-01-13T10:00:00'),
      },
      {
        id: 'msg-202',
        role: 'assistant',
        content: '软件著作权登记需要准备以下材料：\n\n1. **源代码**：前后各连续30页，不足60页的全部提交\n2. **软件说明书**：功能介绍、操作流程、技术架构等\n3. **身份证明**：企业营业执照副本复印件\n4. **申请表**：在线填写后打印盖章\n5. **代理委托书**（如委托代理）\n\n整个流程大约需要30-45个工作日，加急可缩短至15个工作日。',
        timestamp: new Date('2025-01-13T10:05:00'),
        tokens: 1120,
      },
    ],
    createdAt: new Date('2025-01-13T10:00:00'),
    updatedAt: new Date('2025-01-13T10:05:00'),
    isExpertMode: false,
  },
];

// ───────────────────────────────────────────────
// 工作目录数据
// ───────────────────────────────────────────────

export const mockDirectoryTree: WorkDirectory[] = [
  {
    path: '/我的项目',
    name: '我的项目',
    isExpanded: true,
    children: [
      {
        path: '/我的项目/专利分析2025',
        name: '专利分析2025',
        isExpanded: true,
        children: [
          {
            path: '/我的项目/专利分析2025/技术交底书.pdf',
            name: '技术交底书.pdf',
          },
          {
            path: '/我的项目/专利分析2025/权利要求书.docx',
            name: '权利要求书.docx',
          },
          {
            path: '/我的项目/专利分析2025/参考资料',
            name: '参考资料',
            isExpanded: false,
            children: [
              {
                path: '/我的项目/专利分析2025/参考资料/现有技术.pdf',
                name: '现有技术.pdf',
              },
              {
                path: '/我的项目/专利分析2025/参考资料/对比文件.xlsx',
                name: '对比文件.xlsx',
              },
            ],
          },
          {
            path: '/我的项目/专利分析2025/审查意见',
            name: '审查意见',
            isExpanded: false,
            children: [
              {
                path: '/我的项目/专利分析2025/审查意见/一通答复.docx',
                name: '一通答复.docx',
              },
            ],
          },
        ],
      },
      {
        path: '/我的项目/商标注册2024',
        name: '商标注册2024',
        isExpanded: false,
        children: [
          {
            path: '/我的项目/商标注册2024/商标查询报告.pdf',
            name: '商标查询报告.pdf',
          },
          {
            path: '/我的项目/商标注册2024/申请材料',
            name: '申请材料',
            isExpanded: false,
            children: [
              {
                path: '/我的项目/商标注册2024/申请材料/注册申请书.pdf',
                name: '注册申请书.pdf',
              },
              {
                path: '/我的项目/商标注册2024/申请材料/营业执照.pdf',
                name: '营业执照.pdf',
              },
            ],
          },
        ],
      },
      {
        path: '/我的项目/版权登记',
        name: '版权登记',
        isExpanded: false,
        children: [
          {
            path: '/我的项目/版权登记/源代码',
            name: '源代码',
            isExpanded: false,
            children: [
              {
                path: '/我的项目/版权登记/源代码/main.py',
                name: 'main.py',
              },
              {
                path: '/我的项目/版权登记/源代码/utils.py',
                name: 'utils.py',
              },
            ],
          },
          {
            path: '/我的项目/版权登记/软件说明书.docx',
            name: '软件说明书.docx',
          },
        ],
      },
      {
        path: '/我的项目/合规检测',
        name: '合规检测',
        isExpanded: false,
        children: [
          {
            path: '/我的项目/合规检测/检测报告2025Q1.pdf',
            name: '检测报告2025Q1.pdf',
          },
          {
            path: '/我的项目/合规检测/整改建议.docx',
            name: '整改建议.docx',
          },
        ],
      },
    ],
  },
];

// ───────────────────────────────────────────────
// 合规规则数据（12条）
// ───────────────────────────────────────────────

export const mockComplianceRules: ComplianceRule[] = [
  {
    id: 'rule-001',
    name: '专利申请文件格式合规',
    category: '专利申请',
    status: 'pass',
    description: '检查专利申请文件的格式是否符合国家知识产权局要求，包括页边距、字体、行距等格式规范。',
    autoFixable: true,
  },
  {
    id: 'rule-002',
    name: '权利要求书保护范围检查',
    category: '专利申请',
    status: 'pass',
    description: '检查权利要求书的保护范围是否合理，是否存在过宽或过窄的问题，引用关系是否正确。',
    autoFixable: false,
  },
  {
    id: 'rule-003',
    name: '说明书充分公开审查',
    category: '专利申请',
    status: 'warning',
    description: '审查说明书是否充分公开发明内容，技术方案是否清楚完整，本领域技术人员能否实现。',
    autoFixable: false,
  },
  {
    id: 'rule-004',
    name: '新颖性初步评估',
    category: '专利申请',
    status: 'scanning',
    description: '基于内部专利数据库进行新颖性初步评估，检索是否存在影响新颖性的现有技术。',
    autoFixable: false,
  },
  {
    id: 'rule-005',
    name: '商标图样清晰度检查',
    category: '商标注册',
    status: 'pass',
    description: '检查提交的商标图样是否清晰，分辨率是否达到商标注册要求（不小于300dpi）。',
    autoFixable: true,
  },
  {
    id: 'rule-006',
    name: '商品服务分类准确性',
    category: '商标注册',
    status: 'warning',
    description: '核实所选尼斯分类是否准确覆盖申请人的实际商品/服务范围，是否存在错分或漏分。',
    autoFixable: true,
  },
  {
    id: 'rule-007',
    name: '近似商标风险扫描',
    category: '商标注册',
    status: 'scanning',
    description: '在商标数据库中检索与申请商标相同或近似的在先商标，评估被驳回或异议的风险。',
    autoFixable: false,
  },
  {
    id: 'rule-008',
    name: '源代码完整性检查',
    category: '软件著作权',
    status: 'pass',
    description: '检查提交的源代码是否完整，前后各30页是否连续，页眉页码是否规范。',
    autoFixable: true,
  },
  {
    id: 'rule-009',
    name: '软件说明书规范性',
    category: '软件著作权',
    status: 'fail',
    description: '检查软件说明书是否包含软件概述、功能说明、技术架构等必要内容，格式是否规范。',
    autoFixable: false,
  },
  {
    id: 'rule-010',
    name: '敏感信息泄露检测',
    category: '信息安全',
    status: 'pass',
    description: '扫描上传文件中是否包含个人隐私信息、商业秘密或其他敏感信息，防止信息泄露。',
    autoFixable: true,
  },
  {
    id: 'rule-011',
    name: '代理委托书合规性',
    category: '程序文件',
    status: 'warning',
    description: '检查代理委托书是否按照规定格式填写，签章是否齐全，代理权限是否明确。',
    autoFixable: false,
  },
  {
    id: 'rule-012',
    name: '费用缴纳状态核验',
    category: '程序文件',
    status: 'pending',
    description: '核验相关官费和代理费是否已按时足额缴纳，避免因费用问题导致申请被视为撤回。',
    autoFixable: true,
  },
];

// ───────────────────────────────────────────────
// 工具函数
// ───────────────────────────────────────────────

/** 模拟网络延迟 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 生成唯一ID */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
