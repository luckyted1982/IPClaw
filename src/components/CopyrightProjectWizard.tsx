import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Wand2,
  Search, FileText, Image, Scale, FileCheck, ClipboardList,
  Send, ExternalLink, BookOpen, Lightbulb, AlertCircle,
  Loader2, X, Plus, CircleDot, ArrowRight, Download,
  Copy, Bot, Eye, EyeOff, Shield, Tag, FileSignature, Copyright,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ════════════════════════════════════════════════
//  Types
// ════════════════════════════════════════════════

interface CopyrightData {
  name: string
  type: '文字作品' | '软件著作权' | '美术作品' | '摄影作品' | '视听作品' | '音乐作品' | '其他'
  applicant: string
  author: string
  // Step 1
  workTypeAnalysis: string
  originalityAssessment: string
  // Step 2
  originalityScore: number
  originalityReport: string
  // Step 3
  materials: string[]
  materialsChecklist: string
  // Step 4
  applicationForm: string
  // Step 5
  reviewProgress: string
  reviewNotes: string
  // Step 6
  certificate: string
}

// ════════════════════════════════════════════════
//  Step Definitions (6 steps)
// ════════════════════════════════════════════════

const STEPS = [
  {
    id: 'type',
    title: '作品类型确认',
    subtitle: '确定版权保护客体类型',
    icon: FileText,
    color: '#A855F7',
    desc: '根据《著作权法》确定作品类型，判断是否属于保护客体',
    aiAction: 'AI作品类型分析',
    templateTitle: '作品类型分类表',
    regulations: ['《著作权法》第3条：作品定义与分类', '《著作权法》第5条：不适用于著作权保护的对象'],
  },
  {
    id: 'originality',
    title: '独创性评估',
    subtitle: '评估作品的独创性水平',
    icon: Lightbulb,
    color: '#F59E0B',
    desc: '评估作品是否具有独创性，这是获得版权保护的前提条件',
    aiAction: 'AI独创性评估',
    templateTitle: '独创性判断标准',
    regulations: ['《著作权法》实施条例第3条：独创性定义', '《著作权法》第4条：违禁作品处理'],
  },
  {
    id: 'materials',
    title: '材料准备',
    subtitle: '准备版权登记申请材料',
    icon: Copy,
    color: '#22C55E',
    desc: '准备申请书、作品样本、说明书等全套登记材料',
    aiAction: 'AI材料清单生成',
    templateTitle: '版权登记材料清单',
    regulations: ['《作品自愿登记试行办法》第8条', '《计算机软件著作权登记办法》第12条'],
  },
  {
    id: 'application',
    title: '登记申请',
    subtitle: '提交版权登记申请',
    icon: Send,
    color: '#3B82F6',
    desc: '通过版权登记系统在线提交登记申请',
    aiAction: 'AI申请表单预填',
    templateTitle: '版权登记申请表填写指南',
    regulations: ['《作品自愿登记试行办法》第9-12条', '版权登记在线系统操作指南'],
  },
  {
    id: 'review',
    title: '审查流程',
    subtitle: '登记机构审查阶段',
    icon: Shield,
    color: '#EF4444',
    desc: '登记机构对申请材料进行审查，决定是否予以登记',
    aiAction: 'AI审查进度追踪',
    templateTitle: '审查常见问题解答',
    regulations: ['《作品自愿登记试行办法》第13-15条', '《计算机软件著作权登记办法》第17-22条'],
  },
  {
    id: 'certificate',
    title: '证书获取',
    subtitle: '领取版权登记证书',
    icon: FileCheck,
    color: '#06B6D4',
    desc: '审查通过后领取电子或纸质版权登记证书',
    aiAction: '一键下载证书包',
    templateTitle: '证书使用与维权指南',
    regulations: ['《作品自愿登记试行办法》第16条', '《著作权行政执法指导意见》'],
  },
] as const

type StepId = typeof STEPS[number]['id']

// ════════════════════════════════════════════════
//  Template Data for Each Step
// ════════════════════════════════════════════════

function getStepTemplate(stepId: StepId): string {
  const templates: Record<StepId, string> = {
    type: `# 作品类型分类表（《著作权法》第3条）

## 一、作品类型总览

| 类型 | 示例 | 是否需要固定 | 保护期限 |
|------|------|-------------|---------|
| 文字作品 | 小说、论文、剧本、软件代码 | 是 | 作者终生+死后50年 |
| 口述作品 | 演讲、讲课 | 否（但建议固定） | 同上 |
| 音乐、戏剧、曲艺、舞蹈、杂技作品 | 歌曲、话剧、相声、舞蹈编排 | 是 | 同上 |
| 美术、建筑作品 | 绘画、雕塑、建筑设计 | 是 | 同上 |
| 摄影作品 | 照片 | 是 | 同上 |
| 视听作品 | 电影、电视剧、短视频 | 是 | 首次发表后50年 |
| 图形作品 | 工程设计图、产品设计图 | 是 | 同文字作品 |
| 模型作品 | 三维模型 | 是 | 同上 |
| 计算机软件 | 程序、说明书 | 是 | 同上 |
| 其他符合作品特征的智力成果 | 数据库（特殊条件下） | 是 | 待定 |

## 二、不受保护客体（《著作权法》第5条）

- 法律法规、国家机关决议、决定、命令等官方文件
- 单纯事实消息（时事新闻）
- 历法、通用数表、通用表格和公式

## 三、AI作品类型分析要点

点击"AI作品类型分析"，系统将帮助您：
1. 描述作品特征
2. 对照法条判断类型
3. 识别可能的争议点
4. 建议最佳登记策略

## 四、混合作品处理

### 4.1 软件+说明书
- 软件单独登记（软件著作权）
- 说明书作为文字作品登记
- 建议分别申请

### 4.2 影视作品+音乐
- 整体作为视听作品
- 音乐可单独登记
- 剧本可单独登记`,
    originality: `# 独创性判断标准

## 一、独创性的含义

### 1.1 法律定义
- **独**：独立完成，非抄袭复制
- **创**：一定的创作高度，体现作者个性

### 1.2 与专利新颖性的区别

| 维度 | 版权独创性 | 专利新颖性 |
|------|----------|----------|
| 要求 | 独立完成 | 全球范围内未公开 |
| 高度 | 最低限度的创造性 | 显著技术进步 |
| 主观性 | 更强 | 客观判断为主 |
| 冲突 | 各自独立可不相同 | 不能相同或实质相同 |

## 二、独创性评估要点

### 2.1 必须满足
- ✔ 作者独立创作完成
- ✔ 非简单复制已有作品
- ✔ 体现作者的智力判断和选择

### 2.2 常见问题

| 情形 | 独创性判断 | 说明 |
|------|----------|------|
| 简单事实汇编 | 部分有 | 编排方式体现独创性时 |
| 数据库 | 可能有 | 需要体现独特编排 |
| 计算机生成内容 | 有争议 | 需判断是否有人的创作贡献 |
| AI生成内容 | 较难 | 取决于人的干预程度 |

## 三、独创性评分参考

| 评分 | 等级 | 说明 |
|------|------|------|
| 90-100 | 极高 | 独特艺术风格，鲜明个性 |
| 70-89 | 高 | 有一定创作性，体现作者选择 |
| 50-69 | 中 | 满足基本独创性要求 |
| 30-49 | 低 | 边缘情况，需具体分析 |
| <30 | 极低 | 明显抄袭或无创造性劳动 |

## 四、AI评估维度

AI将从以下角度评估独创性：
1. **创作过程**：是否有人的智力投入
2. **表达方式**：是否体现个性化选择和判断
3. **与现有作品比较**：是否与已发表作品实质相同
4. **行业标准**：是否符合该领域一般创作要求`,
    materials: `# 版权登记材料清单

## 一、通用材料（所有作品类型）

| 材料名称 | 份数 | 格式要求 | 说明 |
|---------|------|---------|------|
| 作品著作权登记申请表 | 1份 | 在线填写打印 | 需签章 |
| 作品说明书 | 1份 | Word/PDF | 说明创作过程 |
| 申请人身份证明 | 1份 | PDF | 个人：身份证；企业：营业执照 |
| 著作权归属证明 | 1份 | PDF | 合同/协议/说明书 |

## 二、按作品类型的特殊材料

### 2.1 文字作品
- 作品样本（不少于5000字）或完整作品全文
- 代理委托书（如委托代理）

### 2.2 软件著作权
- 软件源代码（前30页和后30页，不足60页提交全部）
- 软件说明书或设计文档
- 鉴别材料（需盖章）

### 2.3 美术、摄影作品
- 作品照片或电子文件（不低于300万像素）
- 六面视图（立体作品）
- 作品创作说明

### 2.4 视听作品
- 作品视频文件
- 剧本或分镜头脚本
- 导演/主演授权（如涉及表演者权）

### 2.5 音乐作品
- 乐谱（简谱或五线谱）
- 音频文件（MP3/WAV）
- 词曲作者授权（如分离）

## 三、材料准备注意事项

### 3.1 作品说明书撰写要点
1. 创作目的
2. 创作过程
3. 作品的独特性
4. 已经发表的情况（首次发表时间、地点）

### 3.2 常见补正原因
- 作品样本不完整
- 说明书内容过于简单
- 代码注释不充分
- 身份证明文件过期
- 申请表签章不完整

## 四、AI材料清单生成

点击"AI材料清单生成"，根据您的作品类型自动生成：
- 完整材料清单
- 每项材料的填写模板
- 常见问题提示`,
    application: `# 版权登记申请表填写指南

## 一、申请表主要字段

| 字段名称 | 填写要求 | 常见错误 |
|---------|---------|---------|
| 作品名称 | 应与作品样本一致 | 多名称混淆 |
| 作品类别 | 从下拉菜单选择 | 选错类别 |
| 创作完成日期 | 精确到年月日 | 日期逻辑错误 |
| 首次发表日期 | 如未发表可填"未发表" | 发表时间早于完成时间 |
| 作者姓名/名称 | 真实创作者信息 | 与身份证明不一致 |
| 著作权人 | 权利归属明确 | 多方共有未注明 |
| 权利取得方式 | 原始/受让/继承 | 选择错误 |
| 权利范围 | 全部/部分权利 | 未明确 |

## 二、软件著作权特殊字段

### 2.1 软件全称
格式：品牌名+功能词+软件/系统/平台
示例：XX智能客服管理系统软件V1.0

### 2.2 版本号
格式：V主版本号.次版本号.修正号
示例：V2.1.0

### 2.3 编程语言
示例：Java / Python / C++

### 2.4 代码行数
填写源代码总行数

## 三、在线申请流程

### 3.1 注册账号
1. 访问版权登记网站
2. 完成实名认证
3. 激活账号

### 3.2 填报流程
1. 选择登记类型
2. 填写申请表
3. 上传电子材料
4. 缴纳登记费用
5. 提交申请

### 3.3 费用标准（参考）
- 文字作品：免费
- 软件著作权：300元左右
- 美术作品：免费
- 摄影作品：免费

## 四、AI申请表单预填

点击"AI申请表单预填"，AI将根据您的作品信息自动生成表单内容，您只需核实修改`,
    review: `# 审查流程与常见问题

## 一、审查流程

### 1.1 标准审查周期

| 作品类型 | 正常周期 | 加急周期 |
|---------|---------|---------|
| 文字作品 | 30个工作日 | 7个工作日 |
| 软件著作权 | 30-40个工作日 | 5-7个工作日 |
| 美术作品 | 20-30个工作日 | 3-5个工作日 |
| 视听作品 | 40-60个工作日 | 10个工作日 |

### 1.2 审查阶段
1. **受理**：材料是否齐全
2. **审查**：形式+实质性审查
3. **补正**：如有问题，发出补正通知书
4. **决定**：准予登记或不予登记

## 二、常见补正问题

### 2.1 材料类
- 作品样本不清晰
- 说明书内容不完整
- 身份证明文件不清晰

### 2.2 填写类
- 作品名称不一致
- 日期逻辑错误
- 权利归属不明确

### 2.3 格式类
- 文件格式不符合要求
- 文件大小超出限制
- 盖章/签字不完整

## 三、补正回复要求

### 3.1 回复时限
收到补正通知书后 **30日内** 完成补正

### 3.2 回复方式
1. 登录系统查看具体补正要求
2. 按要求补充修改材料
3. 提交补正回复

## 四、审查结果

### 4.1 准予登记
- 发放电子证书
- 可申请纸质证书
- 登记生效

### 4.2 不予登记
- 收到不予登记决定书
- 可申请行政复议
- 常见原因：
  - 不属于著作权保护客体
  - 材料虚假
  - 超过受理范围

## 五、AI审查进度追踪

点击"AI审查进度追踪"，系统将：
1. 自动查询登记进度
2. 预警补正通知
3. 提醒关键时间节点`,
    certificate: `# 版权登记证书使用与维权指南

## 一、证书内容

| 项目 | 说明 |
|------|------|
| 登记号 | 唯一标识 |
| 作品名称 | 与申请表一致 |
| 登记日期 | 证书发放日期 |
| 权利取得方式 | 原始/受让 |
| 权利范围 | 全部/有限 |
| 著作权人 | 登记的权利人 |

## 二、证书使用规范

### 2.1 正确使用方式
- 维权时作为权利证明
- 转让/许可时出示
- 申报项目/评奖时使用
- 交易时证明权利

### 2.2 证书公示
- 国家版权局登记信息可查询
- 可开具登记证明文件
- 境外使用时需公证认证

## 三、证书管理

### 3.1 纸质证书保管
1. 原件妥善保管
2. 可申请多本副本
3. 遗失可申请补发

### 3.2 电子证书使用
1. 与纸质证书同等效力
2. 可打印使用
3. 建议备份存储

## 四、后续管理

### 4.1 变更登记
- 著作权人名称变更
- 作品名称变更
- 需提交变更申请

### 4.2 转让登记
- 提交转让合同
- 双方共同申请
- 或单独受让方申请

### 4.3 许可登记
- 合同签订后30日内
- 登记许可合同
- 许可类型：独占/排他/普通

## 五、维权保护

### 5.1 维权方式

| 方式 | 适用场景 | 优势 |
|------|---------|------|
| 协商 | 轻微侵权 | 快速、成本低 |
| 调解 | 双方愿意和解 | 中立第三方 |
| 仲裁 | 合同约定仲裁条款 | 专业、高效 |
| 诉讼 | 严重侵权 | 法律效力强 |

### 5.2 侵权证据收集
1. 侵权作品截图/下载
2. 侵权方平台信息
3. 销售/传播数据
4. 保全证据公证

### 5.3 赔偿计算
- 实际损失
- 违法所得
- 法定赔偿（500-500万元）
- 惩罚性赔偿（故意侵权×1-5倍）

## 六、证书下载

点击"一键下载证书包"，获取：
- 电子登记证书
- 登记申请表复印件
- 登记查询截图`,
  }
  return templates[stepId]
}

// ════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════

interface CopyrightProjectWizardProps {
  open: boolean
  onClose: () => void
}

export default function CopyrightProjectWizard({ open, onClose }: CopyrightProjectWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  const [project, setProject] = useState<CopyrightData>({
    name: '', type: '文字作品', applicant: '', author: '',
    workTypeAnalysis: '', originalityAssessment: '',
    originalityScore: 0, originalityReport: '',
    materials: [], materialsChecklist: '',
    applicationForm: '',
    reviewProgress: '', reviewNotes: '',
    certificate: '',
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
        name: '', type: '文字作品', applicant: '', author: '',
        workTypeAnalysis: '', originalityAssessment: '',
        originalityScore: 0, originalityReport: '',
        materials: [], materialsChecklist: '',
        applicationForm: '',
        reviewProgress: '', reviewNotes: '',
        certificate: '',
      })
      setAiResponse('')
      setIsStreaming(false)
    }
  }, [open])

  const handleAICall = useCallback(async () => {
    setAiLoading(true)
    setIsStreaming(true)
    setAiResponse('')

    try {
      const response = await fetch('/api/copyright-agent', {
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
      console.error('[CopyrightWizard] AI call failed:', err)
      const fallbacks: Record<StepId, string> = {
        type: '我来帮您分析作品类型。根据《著作权法》第3条，作品分为文字、口述、音乐、戏剧、曲艺、舞蹈、美术、建筑、摄影、视听等多种类型。请描述您的作品特征，我将为您准确判断作品类型。',
        originality: '独创性是版权保护的前提条件。我来帮您评估作品的独创性水平，从创作过程、表达方式、与现有作品比较等多个维度进行分析，给出专业的评估报告。',
        materials: '我来帮您准备版权登记申请材料。根据您的作品类型，我将生成完整的材料清单，包括通用材料和特殊材料，以及每项材料的填写模板和注意事项。',
        application: '版权登记申请表需要准确填写各项信息。我来帮您预填表单内容，包括作品名称、类别、创作完成日期、权利归属等关键字段，您只需核实修改即可。',
        review: '审查阶段需要耐心等待，我来帮您追踪审查进度。系统将自动监控登记状态，及时提醒补正通知和重要时间节点，确保您不会错过任何关键期限。',
        certificate: '恭喜您即将完成版权登记！我来帮您下载完整的证书包，并提供后续维权保护和证书使用规范指南。',
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
                  <h2 className="text-lg font-bold text-white">版权登记工作台</h2>
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

                {/* Step Content */}
                <div className="bg-[var(--navy-800)] rounded-xl p-5 mb-4 border border-[var(--navy-700)]">
                  <h4 className="text-sm font-semibold text-white mb-3">当前步骤信息</h4>
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
                      <Bot size={16} className="text-[#A855F7]" />
                      <h4 className="text-sm font-semibold text-white">AI 助手</h4>
                      {aiLoading && <Loader2 size={14} className="animate-spin text-[#A855F7]" />}
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{aiResponse || '正在分析...'}</ReactMarkdown>
                    </div>
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-72 border-l border-[var(--navy-700)] p-4 overflow-y-auto">
                <div className="space-y-3">
                  {/* AI Assistant Button */}
                  <button
                    onClick={handleAICall}
                    disabled={aiLoading}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #EC4899)', color: 'white' }}
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
                            <span className="text-[#A855F7] mt-0.5">§</span>
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
                上一页
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
                    下一页
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