import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Wand2,
  Search, FileText, Image, Scale, FileCheck, ClipboardList,
  Send, ExternalLink, BookOpen, Lightbulb, AlertCircle,
  Loader2, X, Plus, CircleDot, ArrowRight, Download,
  Copy, Bot, Eye, EyeOff, Shield, Tag,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ════════════════════════════════════════════════
//  Types
// ════════════════════════════════════════════════

interface TrademarkData {
  name: string
  type: '文字' | '图形' | '组合' | '三维' | '声音'
  applicant: string
  agent: string
  // Step 1
  searchResults: string
  similarMarks: string[]
  // Step 2
  classes: string[]
  goodsServices: string
  // Step 3
  applicationDoc: string
  priorityClaim: string
  // Step 4
  formalReview: string
  // Step 5
  substantiveReview: string
  objectionRisk: string
  // Step 6
  publicationStatus: string
  oppositionPeriod: string
  // Step 7
  registrationStatus: string
  // Step 8
  certificate: string
}

// ════════════════════════════════════════════════
//  Step Definitions (8 steps)
// ════════════════════════════════════════════════

const STEPS = [
  {
    id: 'search',
    title: '商标查询',
    subtitle: '近似商标检索与风险评估',
    icon: Search,
    color: '#8B5CF6',
    desc: '全面检索近似商标，评估注册可行性',
    aiAction: 'AI智能近似查询',
    templateTitle: '商标近似判断标准',
    regulations: ['《商标法》第30条：申请注册的商标不得与他人在先商标近似', '《商标审查审理指南》：近似商标判断标准'],
  },
  {
    id: 'classification',
    title: '分类选择',
    subtitle: '尼斯分类与商品服务项',
    icon: Tag,
    color: '#06B6D4',
    desc: '根据尼斯分类选择正确的商品/服务类别',
    aiAction: 'AI辅助分类推荐',
    templateTitle: '尼斯分类查询表',
    regulations: ['《类似商品和服务区分表》：尼斯联盟分类标准', '《商标法》第4条：自然人可申请商标'],
  },
  {
    id: 'documents',
    title: '申请文件',
    subtitle: '准备商标注册申请书',
    icon: FileText,
    color: '#10B981',
    desc: '准备规范的申请材料，确保文件完整',
    aiAction: 'AI生成申请材料',
    templateTitle: '商标注册申请书模板',
    regulations: ['《商标法实施条例》第13-16条：申请文件要求', '《商标法》第18条：可委托代理机构'],
  },
  {
    id: 'formal',
    title: '形式审查',
    subtitle: '申请文件形式合规性检查',
    icon: Shield,
    color: '#F59E0B',
    desc: '审查申请文件是否齐全、格式是否规范',
    aiAction: 'AI形式审查预检',
    templateTitle: '形式审查要点清单',
    regulations: ['《商标法》第18条：形式审查程序', '《商标法实施条例》第18条：受理条件'],
  },
  {
    id: 'substantive',
    title: '实质审查',
    subtitle: '商标可注册性实质审查',
    icon: Scale,
    color: '#EF4444',
    desc: '审查商标是否具有显著性、是否违反禁用条款',
    aiAction: 'AI审查风险预警',
    templateTitle: '驳回理由典型案例',
    regulations: ['《商标法》第10条：禁用条款', '《商标法》第11条：缺乏显著性情形', '《商标法》第12条：三维标志显著性问题'],
  },
  {
    id: 'publication',
    title: '初审公告',
    subtitle: '三个月公告期异议',
    icon: Eye,
    color: '#EC4899',
    desc: '公告期内接受社会公众异议监督',
    aiAction: 'AI监测公告动态',
    templateTitle: '异议程序指南',
    regulations: ['《商标法》第33条：异议程序', '《商标法》第35条：异议审查期限'],
  },
  {
    id: 'registration',
    title: '注册公告',
    subtitle: '核发注册证前的最后确认',
    icon: FileCheck,
    color: '#22C55E',
    desc: '公告期满无异议后核准注册并公告',
    aiAction: 'AI注册进度追踪',
    templateTitle: '注册流程时效表',
    regulations: ['《商标法》第33条：三个月公告期', '《商标法》第39条：注册有效期10年'],
  },
  {
    id: 'certificate',
    title: '证书发放',
    subtitle: '领取商标注册证',
    icon: Download,
    color: '#3B82F6',
    desc: '完成注册，领取电子/纸质商标注册证',
    aiAction: '一键下载证书包',
    templateTitle: '注册证使用规范',
    regulations: ['《商标法》第39条：注册有效期10年', '《商标法》第40条：续展注册'],
  },
] as const

type StepId = typeof STEPS[number]['id']

// ════════════════════════════════════════════════
//  Template Data for Each Step
// ════════════════════════════════════════════════

function getStepTemplate(stepId: StepId): string {
  const templates: Record<StepId, string> = {
    search: `# 商标近似查询报告模板

## 一、查询要素
| 要素 | 内容 |
|------|------|
| **查询商标** | |
| **申请类别** | |
| **查询日期** | |
| **查询范围** | ☑ 同类别近似 ☑ 跨类别近似 ☑ 联合商标 ☑ 防御商标 |

## 二、近似判断标准（《商标审查审理指南》）

### 2.1 文字商标近似
- **相同**：字体、排列方式、读音完全相同
- **近似**：字形相似、含义相同、读音相同
- **判断原则**：整体印象为主，显著部分为核心

### 2.2 图形商标近似
- 设计手法相同
- 构图相同或近似
- 整体视觉印象相同或近似

### 2.3 组合商标近似
- 文字部分相同或近似
- 图形部分相同或近似
- 文字图形整体近似

## 三、检索结果
| 类别 | 注册号 | 商标图样 | 申请日 | 指定商品 | 近似度 | 风险评估 |
|------|--------|---------|--------|---------|--------|---------|
| | | | | | ★★★★★ | 高风险 |
| | | | | | ★★★☆☆ | 中风险 |
| | | | | | ★☆☆☆☆ | 低风险 |

## 四、风险分析与建议

### 4.1 高风险情形
- 与在先注册商标完全相同
- 与在先商标仅存在细微差异
- 可能造成消费者混淆

### 4.2 规避建议
- 修改商标设计
- 更换商品/服务类别
- 考虑购买或许可在先商标
- 撤三程序（撤销连续三年未使用的商标）`,
    classification: `# 尼斯分类选择指南

## 一、尼斯分类概述
《类似商品和服务区分表》共45个类别：
- **1-34类**：商品
- **35-45类**：服务

## 二、常见类别速查

| 行业领域 | 主要类别 | 关联类别 |
|---------|---------|---------|
| 科技/软件 | 9, 42 | 35, 38, 45 |
| 制造业 | 按具体商品 | 35, 37, 40 |
| 餐饮/食品 | 29, 30, 31, 43 | 32, 33, 35 |
| 服装/鞋帽 | 25, 26, 35 | 18, 40 |
| 医疗/健康 | 5, 10, 35, 44 | 3, 44 |
| 教育/培训 | 41, 42, 45 | 35, 38 |
| 金融/投资 | 36, 35, 42 | 9, 38 |
| 餐饮/住宿 | 43, 29, 30 | 31, 32, 35 |

## 三、选择原则

### 3.1 核心类别（必须注册）
覆盖主营业务的核心商品/服务

### 3.2 关联类别（建议注册）
- 类似商品
- 上下游产品
- 容易被抢注的类别

### 3.3 防御类别（视情况注册）
- 防止他人蹭热度
- 全类别注册（知名商标）

## 四、商品/服务项填写规范

### 4.1 商品项要求
- 使用规范商品名称
- 避免描述性或笼统表述
- 参考《类似商品和服务区分表》

### 4.2 服务项要求
- 与实际经营一致
- 明确服务内容
- 避免跨类保护

## 五、AI辅助分类推荐
点击"AI辅助分类推荐"，基于您的业务描述自动推荐最佳类别组合`,
    documents: `# 商标注册申请材料清单

## 一、必备材料
| 材料名称 | 份数 | 要求 | 说明 |
|---------|------|------|------|
| 商标注册申请书 | 1份 | 电子申请 | 在线填写或下载打印 |
| 商标图样 | 5份 | JPG/PNG | 尺寸：不大于10×10cm |
| 身份证明文件 | 1份 | PDF | 企业：营业执照；个人：身份证 |

## 二、可选材料

### 2.1 优先权证明
- **巴黎公约优先权**：首次申请后6个月内
- 材料：优先权证明文件+中文译本

### 2.2 肖像权许可
- 公证机关公证的授权书
- 自然人肖像所有人的身份证

### 2.3 集体/证明商标
- 主体资格证明
- 集体/证明商标使用管理规则

## 三、申请书填写规范

### 3.1 申请人信息
- 名称：与企业营业执照一致
- 地址：详细地址，省市区街道门牌号

### 3.2 商标图样要求
- 清晰，便于粘贴
- 黑白申请可变换颜色
- 颜色申请固定颜色

### 3.3 商品/服务项目
- 从分类表中选择规范名称
- 每项前加类别号
- 控制数量，避免超项

## 四、常见错误避坑
❌ 商品名称过于笼统（如"电子产品"）
❌ 未参考区分表随意填写
❌ 肖像使用无授权文件
❌ 优先权过期后补充主张`,
    formal: `# 形式审查要点清单

## 一、形式审查内容
| 审查项目 | 审查标准 | 不通过情形 |
|---------|---------|-----------|
| **申请书式** | 格式规范 | 填写不完整/涂改 |
| **申请人资格** | 真实合法 | 伪造证明文件 |
| **代理委托** | 有效代理 | 无委托书/超范围 |
| **申请费用** | 足额缴纳 | 费用不足/未缴 |
| **商品分类** | 规范准确 | 分类错误/超项 |

## 二、审查时间
- **正常审查**：1个月左右
- **补正通知**：15日内补正
- **逾期处理**：视为撤回申请

## 三、补正情形

### 3.1 常见补正原因
1. 申请文件不齐全
2. 申请书填写不规范
3. 商标图样不清晰
4. 商品/服务分类不准
5. 身份证明文件模糊

### 3.2 补正要求
- 按通知书要求补正
- 不得改变商标图样
- 不得改变商品/服务范围

## 四、受理条件
☑ 申请文件齐备
☑ 申请费用已缴
☑ 申请书式符合要求
☑ 申请主体适格
☑ 商品/服务分类准确`,
    substantive: `# 实质审查驳回理由与应对

## 一、驳回类型

### 1.1 绝对理由（《商标法》第10-12条）
| 驳回条款 | 情形 | 能否通过 |
|---------|------|---------|
| §10.1条 | 同国家名称、国旗等相同/近似 | 永久驳回 |
| §10.2条 | 政府间国际组织标志相同/近似 | 有条件 |
| §10.3条 | 官方检验印记相同/近似 | 有条件 |
| §10.7条 | 带有民族歧视 | 永久驳回 |
| §10.8条 | 有害社会主义道德风尚 | 永久驳回 |
| §11.1条 | 仅直接表示商品特征 | 可通过设计改标 |
| §12条 | 三维标志仅由自身功能决定 | 永久驳回 |

### 1.2 相对理由（《商标法》第13、15、16、30条）
| 驳回条款 | 情形 | 应对策略 |
|---------|------|---------|
| §13条 | 复制/摹仿他人驰名商标 | 异议/无效宣告 |
| §15条 | 代理/代表抢注 | 依据在先使用 |
| §30条 | 与在先商标近似 | 修改商品/说服审查员 |

## 二、典型驳回复审案例

### 2.1 案例一：缺乏显著性
**商标**：QQ企鹅图形
**理由**：常见动物图形
**结果**：补充使用证据后核准

### 2.2 案例二：近似商标
**商标**："康师傅" vs "康帅傅"
**理由**：构成近似
**结果**：核准（明显区分）

### 2.3 案例三：禁用条款
**商标**："USA"运动鞋
**理由**：外国国家名称
**结果**：驳回复审（部分通过）

## 三、驳回复审策略

### 3.1 证据准备
- 商标使用证据
- 消费者认知调查
- 市场知名度材料
- 代理商/经销商证明

### 3.2 驳回复审理由
- 申请商标与引证商标不近似
- 指定商品不类似
- 商标经过使用已获显著性
- 引证商标已失效`,
    publication: `# 商标公告与异议程序

## 一、初审公告

### 1.1 公告内容
- 商标图样
- 申请号、申请日期
- 申请人名称、地址
- 指定商品/服务
- 初步审定期限3个月

### 1.2 公告效力
- 社会公众监督
- 在先权利人异议
- 社会公众举报

## 二、异议程序

### 2.1 异议主体
- 在先权利人
- 利害关系人
- 任何单位或个人（涉及第10条）

### 2.2 异议理由
| 类型 | 具体情形 |
|------|---------|
| 在先权利冲突 | 著作权、外观设计专利、企业名称等 |
| 抢注 | 代理人、代表人抢注 |
| 近似 | 与在先商标构成近似 |
| 违反禁用条款 | 第10条情形 |
| 损害公共利益 | 恶意抢注、囤积 |

### 2.3 异议材料
- 异议申请书
- 身份证明
- 异议理由及证据
- 代理委托书（如有）

## 三、异议答辩

### 3.1 答辩时限
收到异议答辩通知书后30日内

### 3.2 答辩要点
1. 不近似判定
2. 商品/服务不类似
3. 在先使用抗辩
4. 无恶意抢注证据

## 四、AI监测公告
点击"AI监测公告动态"，可自动追踪目标商标的公告状态，及时预警异议风险`,
    registration: `# 注册公告与有效期管理

## 一、注册公告

### 1.1 公告内容
- 商标注册号
- 注册日期
- 专用权期限
- 核定使用商品/服务

### 1.2 公告效力
- 商标专用权生效
- 可标注®标志
- 获得法律保护

## 二、注册有效期

### 2.1 起算日期
自初步审定公告三个月期满之日起计算

### 2.2 有效期限
- **发明专利**：20年（2025年调整）
- **实用新型专利**：10年
- **外观设计专利**：15年（2025年调整）

## 三、时间节点提醒
| 时间节点 | 提醒内容 |
|---------|---------|
| 注册后第9年 | 续展提醒 |
| 10年届满前12个月 | 续展申请期 |
| 10年届满后6个月 | 宽展期（加收滞纳金） |

## 四、续展流程

### 4.1 续展材料
- 商标续展注册申请书
- 身份证明文件
- 代理委托书（如有）

### 4.2 续展费用
| 类别 | 正常费用 | 宽展期费用 |
|------|---------|-----------|
| 纸质申请 | 1000元 | 250元滞纳金 |
| 电子申请 | 500元 | 250元滞纳金 |

## 五、AI进度追踪
点击"AI注册进度追踪"，实时监控商标注册各阶段状态`,
    certificate: `# 商标注册证与后续管理

## 一、注册证内容

| 项目 | 内容 |
|------|------|
| 注册号 | |
| 注册日期 | |
| 专用权期限 | 至____年__月__日 |
| 核定使用商品 | |
| 注册人 | |

## 二、注册证使用规范

### 2.1 正确使用
☑ 标注®标志
☑ 许可使用需备案
☑ 转让需办理手续
☑ 使用与注册一致

### 2.2 常见错误
❌ 标注™（应为®）
❌ 超范围使用
❌ 随意改变图样
❌ 许可不备案

## 三、后续管理事项
| 事项 | 时限 | 说明 |
|------|------|------|
| 许可备案 | 签订许可合同后 | 可选但建议 |
| 变更备案 | 信息变化后及时 | 必须 |
| 转让申请 | 签订转让协议后 | 必须公证 |
| 续展申请 | 到期前12个月 | 建议提前 |

## 四、质押融资

### 4.1 质押条件
- 商标已注册
- 权属清晰无争议
- 具有一定市场价值
- 许可使用已备案

### 4.2 质押登记
- 质权设立日期
- 质押期限
- 质押金额

## 五、维权保护

### 5.1 行政保护
- 市场监管投诉
- 侵权查处请求
- 假冒注册商标报案

### 5.2 民事保护
- 侵权诉讼
- 诉前保全
- 损害赔偿

## 六、证书下载
点击"一键下载证书包"，获取电子注册证及相关文件`,
  }
  return templates[stepId]
}

// ════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════

interface TrademarkProjectWizardProps {
  open: boolean
  onClose: () => void
}

export default function TrademarkProjectWizard({ open, onClose }: TrademarkProjectWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  const [project, setProject] = useState<TrademarkData>({
    name: '', type: '文字', applicant: '', agent: '',
    searchResults: '', similarMarks: [],
    classes: [], goodsServices: '',
    applicationDoc: '', priorityClaim: '',
    formalReview: '', substantiveReview: '', objectionRisk: '',
    publicationStatus: '', oppositionPeriod: '',
    registrationStatus: '', certificate: '',
  })

  const [showTemplate, setShowTemplate] = useState(false)
  const [showRegulations, setShowRegulations] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiResponse, isStreaming])

  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0)
      setProject({
        name: '', type: '文字', applicant: '', agent: '',
        searchResults: '', similarMarks: [],
        classes: [], goodsServices: '',
        applicationDoc: '', priorityClaim: '',
        formalReview: '', substantiveReview: '', objectionRisk: '',
        publicationStatus: '', oppositionPeriod: '',
        registrationStatus: '', certificate: '',
      })
      setAiResponse('')
      setIsStreaming(false)
    }
  }, [open])

  // ════════════════════════════════════════════════
  //  AI Assistant Call
  // ════════════════════════════════════════════════

  const handleAICall = useCallback(async () => {
    setAiLoading(true)
    setIsStreaming(true)
    setAiResponse('')

    try {
      const response = await fetch('/api/trademark-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: `${currentStep.id}-assist`,
          projectData: project,
          stepContext: {
            stepName: currentStep.title,
            stepDesc: currentStep.desc,
            template: getStepTemplate(currentStep.id),
          },
        }),
      })

      if (!response.ok || !response.body) throw new Error('API error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim())
              if (data.content) {
                full += data.content
                setAiResponse(full)
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err) {
      console.error('[TrademarkWizard] AI call failed:', err)
      const name = project.name || '[待填写商标名称]'
      const fallbacks: Record<StepId, string> = {
        search: '好的，我来帮您进行商标近似查询分析。请提供您的商标名称和指定类别，我将为您检索是否存在近似商标。',
        classification: '根据尼斯分类标准，我来帮您分析最适合的分类组合。请描述您的业务范围，我将推荐最佳类别选择。',
        documents: '我来帮您准备商标注册申请材料，包括申请书撰写、图样规范、身份证明等全套文件。',
        formal: '形式审查主要检查申请文件是否齐全、格式是否规范。我来帮您进行预审，提前发现可能的问题。',
        substantive: '实质审查阶段会评估商标的显著性和是否违反禁用条款。我来帮您分析驳回风险并提供应对建议。',
        publication: '初审公告后进入3个月的异议期。我来帮您监测公告动态，及时发现潜在的异议风险。',
        registration: '公告期满无异议后将核准注册。我来帮您追踪注册进度，确保顺利完成。',
        certificate: '恭喜您即将获得商标注册证！我来帮您准备证书下载包和后续管理建议。',
      }
      setAiResponse(fallbacks[currentStep.id] || '请稍候，AI正在分析...')
    } finally {
      setAiLoading(false)
      setIsStreaming(false)
    }
  }, [currentStep, project])

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      setAiResponse('')
    }
  }

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setAiResponse('')
    }
  }

  const StepIcon = currentStep.icon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-[var(--navy-700)] overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${currentStep.color}20` }}
                >
                  <StepIcon size={20} style={{ color: currentStep.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">商标申请工作流</h2>
                  <p className="text-xs text-[var(--text-secondary)]">{currentStep.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-3 border-b border-[var(--navy-700)]">
              <div className="flex items-center gap-2">
                {STEPS.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={step.id} className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => { setCurrentStepIndex(i); setAiResponse('') }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                          i === currentStepIndex
                            ? 'ring-2'
                            : i < currentStepIndex
                            ? 'cursor-pointer hover:scale-105'
                            : 'opacity-50'
                        }`}
                        style={{
                          background: i <= currentStepIndex ? `${step.color}20` : 'transparent',
                          color: i <= currentStepIndex ? step.color : 'var(--text-muted)',
                        }}
                      >
                        {i < currentStepIndex ? (
                          <Check size={12} />
                        ) : (
                          <Icon size={12} />
                        )}
                        <span className="hidden md:inline">{step.title}</span>
                      </button>
                      {i < STEPS.length - 1 && (
                        <div
                          className="h-px flex-1 mx-1"
                          style={{ background: i < currentStepIndex ? step.color : 'var(--navy-700)' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Main Content Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Step Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {currentStepIndex + 1}. {currentStep.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{currentStep.desc}</p>
                </div>

                {/* Step Content - 简洁展示 */}
                <div className="bg-[var(--navy-800)] rounded-xl p-5 mb-4 border border-[var(--navy-700)]">
                  <h4 className="text-sm font-semibold text-white mb-3">当前步骤内容</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">步骤编号</span>
                      <span className="text-white font-medium">{currentStep.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">步骤颜色</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: currentStep.color }} />
                        <span className="text-white">{currentStep.color}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">AI辅助功能</span>
                      <span className="text-white font-medium">{currentStep.aiAction}</span>
                    </div>
                  </div>
                </div>

                {/* AI Response Area */}
                {(aiResponse || aiLoading) && (
                  <div className="bg-[var(--navy-800)] rounded-xl p-5 border border-[var(--navy-700)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot size={16} className="text-[#6366F1]" />
                      <h4 className="text-sm font-semibold text-white">AI 助手</h4>
                      {aiLoading && <Loader2 size={14} className="animate-spin text-[#6366F1]" />}
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{aiResponse || '正在分析...'}</ReactMarkdown>
                    </div>
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Right Sidebar - Actions */}
              <div className="w-72 border-l border-[var(--navy-700)] p-4 overflow-y-auto">
                <div className="space-y-3">
                  {/* AI Assistant Button */}
                  <button
                    onClick={handleAICall}
                    disabled={aiLoading}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white' }}
                  >
                    {aiLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {currentStep.aiAction}
                  </button>

                  {/* Template Reference */}
                  <button
                    onClick={() => setShowTemplate(!showTemplate)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--navy-600)', color: 'var(--text-secondary)' }}
                  >
                    <BookOpen size={16} />
                    模板参考
                  </button>

                  {/* Regulations */}
                  <button
                    onClick={() => setShowRegulations(!showRegulations)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--navy-600)', color: 'var(--text-secondary)' }}
                  >
                    <Scale size={16} />
                    法条规定
                  </button>

                  {/* Template Panel */}
                  {showTemplate && (
                    <div className="mt-4 p-4 rounded-xl bg-[var(--navy-800)] border border-[var(--navy-700)]">
                      <h5 className="text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
                        {currentStep.templateTitle}
                      </h5>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{getStepTemplate(currentStep.id)}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Regulations Panel */}
                  {showRegulations && (
                    <div className="mt-4 p-4 rounded-xl bg-[var(--navy-800)] border border-[var(--navy-700)]">
                      <h5 className="text-xs font-bold text-white mb-3 uppercase tracking-wide">
                        相关法律条款
                      </h5>
                      <ul className="space-y-2">
                        {currentStep.regulations.map((reg, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[#6366F1] mt-0.5">§</span>
                            {reg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--navy-700)]">
              <button
                onClick={goPrev}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={16} />
                上一步
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">
                  步骤 {currentStepIndex + 1} / {STEPS.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentStepIndex === STEPS.length - 1 ? (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: currentStep.color, color: 'white' }}
                  >
                    <Check size={16} />
                    完成
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: currentStep.color, color: 'white' }}
                  >
                    下一步
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}