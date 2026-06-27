export interface Expert {
  id: string
  name: string
  avatar: string
  title: string
  company: string
  specialty: string[]
  category: 'patent' | 'trademark' | 'copyright' | 'dataip' | 'trade-secret' | 'finance'
  experience: string
  rating: number
  completedTasks: number
  hourlyRate: number
  bio: string
  capabilities: string[]
  workflow: ExpertWorkflow[]
  tags: string[]
}

export interface ExpertWorkflow {
  step: number
  title: string
  description: string
  icon: string
}

export const EXPERTS: Expert[] = [
  {
    id: 'patent-expert-1',
    name: '张明远',
    avatar: '张',
    title: '专利代理师',
    company: '北京金杜律师事务所',
    specialty: ['发明专利', '实用新型', 'PCT申请'],
    category: 'patent',
    experience: '15年专利代理经验',
    rating: 4.9,
    completedTasks: 2680,
    hourlyRate: 800,
    bio: '前国家知识产权局审查员，精通机械、电子领域专利申请。曾代理多起高价值专利案件，包括华为、中兴等知名企业专利布局项目。',
    capabilities: [
      '技术交底书撰写与优化',
      '权利要求书层级设计',
      '说明书撰写与附图说明',
      '审查意见答复策略',
      '专利无效与侵权分析',
      'PCT国际申请',
      '专利布局规划',
    ],
    workflow: [
      { step: 1, title: '需求分析', description: '深入理解技术方案，识别创新点', icon: '🔍' },
      { step: 2, title: '技术挖掘', description: '扩展技术方案，挖掘从属权利要求', icon: '⛏️' },
      { step: 3, title: '权利要求撰写', description: '构建多层次权利要求书', icon: '✍️' },
      { step: 4, title: '说明书完善', description: '撰写详细技术说明与实施例', icon: '📄' },
      { step: 5, title: '审查意见答复', description: '针对审查意见进行答辩', icon: '💬' },
    ],
    tags: ['机械', '电子', '通信', '人工智能'],
  },
  {
    id: 'patent-expert-2',
    name: '李雪婷',
    avatar: '李',
    title: '专利律师',
    company: '上海恒都律师事务所',
    specialty: ['专利诉讼', 'FTO分析', '商业秘密保护'],
    category: 'patent',
    experience: '12年知识产权法律经验',
    rating: 4.8,
    completedTasks: 1850,
    hourlyRate: 1200,
    bio: '华东政法大学知识产权法硕士，专注于专利侵权诉讼与FTO分析。曾代理多起亿元级专利侵权案件，胜诉率达85%以上。',
    capabilities: [
      'FTO自由实施分析',
      '专利侵权判定',
      '专利无效宣告请求',
      '专利侵权诉讼',
      '技术秘密保护方案',
      '许可协议谈判',
    ],
    workflow: [
      { step: 1, title: '技术比对', description: '对比产品技术与专利权利要求', icon: '⚖️' },
      { step: 2, title: '侵权分析', description: '评估侵权风险与规避方案', icon: '📊' },
      { step: 3, title: '证据收集', description: '收集侵权证据与市场数据', icon: '📝' },
      { step: 4, title: '策略制定', description: '制定维权或规避策略', icon: '🎯' },
      { step: 5, title: '执行落地', description: '提起诉讼或协商和解', icon: '⚡' },
    ],
    tags: ['专利诉讼', 'FTO', '半导体', '生物医药'],
  },
  {
    id: 'trademark-expert-1',
    name: '王建国',
    avatar: '王',
    title: '商标代理师',
    company: '北京集佳知识产权代理有限公司',
    specialty: ['商标注册', '商标异议', '驰名商标'],
    category: 'trademark',
    experience: '10年商标代理经验',
    rating: 4.9,
    completedTasks: 3200,
    hourlyRate: 500,
    bio: '国家商标局备案代理师，精通商标全流程业务。成功代理数千件商标注册申请，包括多个驰名商标认定案件。',
    capabilities: [
      '商标近似查询与分析',
      '商标注册申请',
      '商标异议与答辩',
      '商标无效宣告',
      '驰名商标认定',
      '商标国际注册',
      '商标许可与转让',
    ],
    workflow: [
      { step: 1, title: '商标检索', description: '全面检索近似商标', icon: '🔍' },
      { step: 2, title: '风险评估', description: '评估注册成功率', icon: '📈' },
      { step: 3, title: '类别规划', description: '制定商标注册类别策略', icon: '📋' },
      { step: 4, title: '材料提交', description: '准备并提交注册申请', icon: '📤' },
      { step: 5, title: '跟进维护', description: '跟进审查进度与答辩', icon: '🔄' },
    ],
    tags: ['商标注册', '品牌保护', '电商', '餐饮'],
  },
  {
    id: 'copyright-expert-1',
    name: '陈思琪',
    avatar: '陈',
    title: '版权顾问',
    company: '深圳版权协会',
    specialty: ['软件著作权', '作品登记', '版权维权'],
    category: 'copyright',
    experience: '8年版权服务经验',
    rating: 4.8,
    completedTasks: 2100,
    hourlyRate: 400,
    bio: '中国版权保护中心特约顾问，专注于软件著作权登记与版权维权。曾为腾讯、华为等企业提供版权管理咨询服务。',
    capabilities: [
      '软件著作权登记',
      '作品著作权登记',
      '版权质押融资',
      '版权侵权取证',
      'DMCA下架申请',
      '版权许可合同',
      '版权资产管理',
    ],
    workflow: [
      { step: 1, title: '作品分析', description: '分析作品类型与独创性', icon: '🎨' },
      { step: 2, title: '材料准备', description: '准备登记所需材料', icon: '📁' },
      { step: 3, title: '登记申请', description: '提交版权登记申请', icon: '📝' },
      { step: 4, title: '证书领取', description: '跟踪进度领取证书', icon: '🏆' },
      { step: 5, title: '权利维护', description: '提供后续版权维护建议', icon: '🛡️' },
    ],
    tags: ['软件著作权', '影视版权', '游戏', '自媒体'],
  },
  {
    id: 'dataip-expert-1',
    name: '赵文博',
    avatar: '赵',
    title: '数据合规专家',
    company: '北京德恒律师事务所',
    specialty: ['数据合规', '数据资产入表', '数据交易'],
    category: 'dataip',
    experience: '6年数据合规经验',
    rating: 4.7,
    completedTasks: 980,
    hourlyRate: 600,
    bio: '数据安全法专家，深耕数据合规领域。曾参与多个央企数据合规项目，熟悉《数据安全法》《个人信息保护法》等法律法规。',
    capabilities: [
      '数据合规评估',
      '数据分类分级',
      '数据资产入表',
      '数据交易合规',
      '数据出境评估',
      '隐私影响评估',
      '数据安全治理',
    ],
    workflow: [
      { step: 1, title: '现状评估', description: '评估企业数据合规现状', icon: '🔍' },
      { step: 2, title: '差距分析', description: '分析与法规要求的差距', icon: '📊' },
      { step: 3, title: '方案设计', description: '设计数据合规方案', icon: '📋' },
      { step: 4, title: '数据入表', description: '指导数据资产入表', icon: '📈' },
      { step: 5, title: '持续合规', description: '建立持续合规机制', icon: '🔄' },
    ],
    tags: ['数据合规', '数据资产', '隐私保护', '金融数据'],
  },
  {
    id: 'trade-secret-expert-1',
    name: '刘铁军',
    avatar: '刘',
    title: '商业秘密专家',
    company: '北京炜衡律师事务所',
    specialty: ['商业秘密保护', '竞业限制', '秘密侵权'],
    category: 'trade-secret',
    experience: '13年商业秘密保护经验',
    rating: 4.8,
    completedTasks: 1560,
    hourlyRate: 1000,
    bio: '前华为知识产权专家，专注于商业秘密保护与竞业限制诉讼。曾代理多起涉及核心技术秘密的重大案件。',
    capabilities: [
      '商业秘密识别与界定',
      '保密体系建设',
      '竞业限制设计',
      '商业秘密侵权调查',
      '商业秘密诉讼',
      '离职员工风险管理',
    ],
    workflow: [
      { step: 1, title: '秘密识别', description: '识别企业核心商业秘密', icon: '🔐' },
      { step: 2, title: '体系建设', description: '建立保密管理制度', icon: '📋' },
      { step: 3, title: '合同设计', description: '设计保密与竞业限制协议', icon: '📝' },
      { step: 4, title: '风险防控', description: '建立离职员工风险防控', icon: '🛡️' },
      { step: 5, title: '维权行动', description: '发起商业秘密维权', icon: '⚖️' },
    ],
    tags: ['商业秘密', '竞业限制', '高科技', '制造业'],
  },
  {
    id: 'finance-expert-1',
    name: '周美玲',
    avatar: '周',
    title: 'IP估值专家',
    company: '北京中金资产评估有限公司',
    specialty: ['专利估值', 'IP证券化', '质押融资'],
    category: 'finance',
    experience: '10年IP估值经验',
    rating: 4.9,
    completedTasks: 890,
    hourlyRate: 1500,
    bio: '中国资产评估协会会员，专注于知识产权价值评估。曾参与多个IP证券化项目，评估资产总额超过100亿元。',
    capabilities: [
      '专利价值评估',
      '商标价值评估',
      'IP组合估值',
      'IP质押融资',
      'IP证券化',
      '技术入股评估',
      '侵权损失评估',
    ],
    workflow: [
      { step: 1, title: '资产盘点', description: '梳理评估对象IP资产', icon: '📊' },
      { step: 2, title: '市场分析', description: '分析市场环境与可比交易', icon: '📈' },
      { step: 3, title: '方法选择', description: '选择合适的评估方法', icon: '⚖️' },
      { step: 4, title: '价值测算', description: '进行详细价值测算', icon: '🔢' },
      { step: 5, title: '报告出具', description: '出具专业评估报告', icon: '📄' },
    ],
    tags: ['IP估值', '质押融资', '证券化', '并购重组'],
  },
]

export const EXPERT_CATEGORIES = [
  { key: 'all', label: '全部', icon: '👤' },
  { key: 'patent', label: '专利', icon: '⚙️' },
  { key: 'trademark', label: '商标', icon: '™️' },
  { key: 'copyright', label: '版权', icon: '©️' },
  { key: 'dataip', label: '数据IP', icon: '📊' },
  { key: 'trade-secret', label: '商业秘密', icon: '🔐' },
  { key: 'finance', label: '金融', icon: '💰' },
]