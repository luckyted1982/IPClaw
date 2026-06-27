import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Check, Sparkles, Wand2,
  Search, FileText, Image, Scale, FileCheck, ClipboardList,
  Send, ExternalLink, BookOpen, Lightbulb, AlertCircle,
  Loader2, X, Plus, CircleDot, ArrowRight, Download,
  Copy, Bot, Eye, EyeOff, Shield, Tag, Database, Key, Layers,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ════════════════════════════════════════════════
//  Types
// ════════════════════════════════════════════════

interface DataIPData {
  name: string
  type: '企业数据' | '公共数据' | '个人信息' | '数据产品'
  owner: string
  // Step 1
  ownershipConfirm: string
  rightsAnalysis: string
  // Step 2
  threeRights: {
    holding: boolean
    processing: boolean
    business: boolean
  }
  rightsDistribution: string
  // Step 3
  classification: '一般数据' | '重要数据' | '核心数据'
  classificationBasis: string
  protectionLevel: string
  // Step 4
  registrationDoc: string
  registrationStatus: string
  // Step 5
  accountingTreatment: string
  assetValue: string
  // Step 6
  transactionDoc: string
  transactionStatus: string
}

// ════════════════════════════════════════════════
//  Step Definitions (6 steps)
// ════════════════════════════════════════════════

const STEPS = [
  {
    id: 'ownership',
    title: '数据确权',
    subtitle: '确认数据权利归属',
    icon: Key,
    color: '#06B6D4',
    desc: '基于"数据二十条"，确认数据资源的权利归属',
    aiAction: 'AI权利归属分析',
    templateTitle: '数据确权分析框架',
    regulations: ['《数据二十条》(2022)：建立数据资源持有权、数据加工使用权、数据产品经营权"三权分置"', '《数据安全法》第3条：数据定义'],
  },
  {
    id: 'rights',
    title: '三权分置',
    subtitle: '明确三类数据权利',
    icon: Layers,
    color: '#8B5CF6',
    desc: '明确持有权、加工使用权、经营权的权责划分',
    aiAction: 'AI三权分配方案',
    templateTitle: '三权分置协议模板',
    regulations: ['《数据二十条》第2条：三权分置运行机制', '《数据产权登记指南》：登记规则'],
  },
  {
    id: 'classification',
    title: '分类分级',
    subtitle: '数据分类与重要程度定义',
    icon: Shield,
    color: '#F59E0B',
    desc: '依据《数据安全法》进行数据分类分级保护',
    aiAction: 'AI智能分类分级',
    templateTitle: '数据分类分级标准',
    regulations: ['《数据安全法》第21条：数据分类分级保护', '《重要数据识别指南》：重要数据定义'],
  },
  {
    id: 'registration',
    title: '登记备案',
    subtitle: '数据产权登记与备案',
    icon: FileCheck,
    color: '#10B981',
    desc: '在数据产权登记平台进行登记，领取数据产权登记凭证',
    aiAction: 'AI登记材料生成',
    templateTitle: '数据产权登记材料清单',
    regulations: ['《公共数据资源登记办法》(2025)', '《企业数据资源相关会计处理暂行规定》(2024)'],
  },
  {
    id: 'accounting',
    title: '入表评估',
    subtitle: '数据资产会计处理与价值评估',
    icon: Database,
    color: '#EF4444',
    desc: '依据会计准则评估数据资产价值，决定是否入表',
    aiAction: 'AI入表方案分析',
    templateTitle: '数据资产入表指南',
    regulations: ['《企业数据资源相关会计处理暂行规定》(2024年1月1日施行)', '《数据资产评估指导意见》'],
  },
  {
    id: 'transaction',
    title: '运营流转',
    subtitle: '数据产品交易与许可',
    icon: ArrowRight,
    color: '#3B82F6',
    desc: '通过数据交易所进行数据产品挂牌、交易或许可',
    aiAction: 'AI交易方案设计',
    templateTitle: '数据交易合规指南',
    regulations: ['《数据安全法》第33条：数据交易规范', '《数据交易所管理规则》'],
  },
] as const

type StepId = typeof STEPS[number]['id']

// ════════════════════════════════════════════════
//  Template Data for Each Step
// ════════════════════════════════════════════════

function getStepTemplate(stepId: StepId): string {
  const templates: Record<StepId, string> = {
    ownership: `# 数据确权分析框架

## 一、数据权利基础

### 1.1 "数据二十条"核心框架

| 权利类型 | 定义 | 权利主体 |
|---------|------|---------|
| **数据资源持有权** | 对依法依规收集、产生的一定规模或重要程度的数据集合的管控 | 数据处理者 |
| **数据加工使用权** | 对数据进行分析、验证、计算等处理活动的控制 | 数据处理者 |
| **数据产品经营权** | 对基于数据整合开发形成的标准化数据产品的经营 | 数据处理者 |

### 1.2 权利来源
- **原始取得**：依法依规收集、生成
- **继受取得**：合法交易、继承等
- **许可取得**：经授权使用

## 二、确权审查要点

### 2.1 数据来源合法性
- ✔ 收集时已获得合法授权
- ✔ 符合数据收集相关法规
- ✔ 不侵犯第三方权益

### 2.2 数据内容合规性
- ✔ 不涉及国家秘密
- ✔ 不涉及个人信息违规处理
- ✔ 不涉及禁止流通数据

### 2.3 数据质量要求
- ✔ 数据准确性
- ✔ 数据完整性
- ✔ 数据时效性

## 三、AI权利归属分析

点击"AI权利归属分析"，系统将帮助您：
1. 梳理数据来源链路
2. 分析权利归属状态
3. 识别潜在权属争议
4. 提供确权建议`,
    rights: `# 三权分置协议模板

## 一、三权分置概述

### 1.1 权利架构

\`\`\`
数据资源持有权 → 基权利（确认谁持有数据）
      ↓
数据加工使用权 → 核心权利（确认谁能加工处理）
      ↓
数据产品经营权 → 商业权利（确认谁能进行商业化）
\`\`\`

### 1.2 权利关系

| 权利 | 是否可分离 | 是否可转让 | 是否可许可 |
|------|-----------|-----------|-----------|
| 持有权 | 不可分离 | 暂不开放 | 暂不开放 |
| 加工使用权 | 可分离 | 部分有 | 是 |
| 经营权 | 可分离 | 是 | 是 |

## 二、协议模板框架

### 2.1 数据资源持有权确认

\`\`\`
甲方（数据持有方）：_______________
乙方（数据处理方）：_______________

一、数据资源描述
1. 数据名称：_______________
2. 数据类型：_______________
3. 数据规模：_______________
4. 采集时间：_______________
5. 数据来源：_______________

二、持有权确认
甲方确认对上述数据资源享有持有权，权利来源：[原始取得/继受取得]
\`\`\`

### 2.2 数据加工使用权授权

\`\`\`
三、加工使用权授权
1. 授权范围：[全部/部分数据字段]
2. 加工方式：[分析/计算/验证等]
3. 使用目的：[具体业务场景]
4. 授权期限：[____年__月__日至____年__月__日]
5. 授权地域：[全国/指定区域]
\`\`\`

### 2.3 数据产品经营权约定

\`\`\`
四、数据产品经营权
1. 产品名称：_______________
2. 产品形态：[数据包/API/报告等]
3. 定价模式：[按次/按量/订阅]
4. 收益分配：[甲方__% / 乙方__%]
5. 销售渠道：[自营/第三方平台]
\`\`\`

## 三、AI三权分配方案

点击"AI三权分配方案"，AI将根据您的业务场景自动生成：
- 最优三权配置建议
- 风险点提示
- 协议条款清单`,
    classification: `# 数据分类分级标准

## 一、分类维度

### 1.1 业务维度分类

| 类别 | 说明 | 示例 |
|------|------|------|
| 经营数据 | 企业经营活动中产生 | 销售数据、财务数据 |
| 运营数据 | 系统运行产生 | 日志、监控数据 |
| 客户数据 | 客户相关信息 | 个人信息、交易记录 |
| 研发数据 | 研发活动产生 | 设计文档、测试数据 |
| 公共数据 | 公共机构收集 | 政务数据、地理数据 |

### 1.2 内容维度分类

| 类别 | 说明 | 示例 |
|------|------|------|
| 个人数据 | 识别特定自然人 | 姓名、身份证、行为记录 |
| 敏感数据 | 泄露会造成严重后果 | 健康、金融、位置数据 |
| 一般数据 | 非敏感的客观数据 | 公开统计信息 |
| 衍生数据 | 经过加工处理数据 | 数据分析结果 |

## 二、分级标准

### 2.1 重要程度分级

| 级别 | 名称 | 定义 | 保护要求 |
|------|------|------|---------|
| 1级 | 公开级 | 可向全社会公开 | 正常管理 |
| 2级 | 内部级 | 仅限内部使用 | 访问控制 |
| 3级 | 敏感级 | 泄露会造成不良影响 | 加密+审计 |
| 4级 | 机密级 | 泄露会造成严重损害 | 最高防护 |
| 5级 | 绝密级 | 泄露会造成灾难性后果 | 特殊防护 |

### 2.2 行业特定分类（参考）

| 行业 | 一般数据 | 重要数据 | 核心数据 |
|------|---------|---------|---------|
| 金融 | 公开行情 | 客户身份 | 交易数据 |
| 医疗 | 公开健康知识 | 病历信息 | 基因数据 |
| 工业 | 设备参数 | 生产工艺 | 核心配方 |
| 政务 | 公开政策 | 内部文件 | 国家安全相关 |

## 三、AI智能分类分级

点击"AI智能分类分级"，系统将：
1. 扫描数据内容特征
2. 对照分类分级标准
3. 生成分类分级报告
4. 提供保护措施建议`,
    registration: `# 数据产权登记材料清单

## 一、登记类型

| 类型 | 适用场景 | 登记平台 |
|------|---------|---------|
| 持有权登记 | 确认数据资源持有权 | 数据交易所/登记平台 |
| 加工使用权登记 | 授权第三方加工使用 | 数据交易所 |
| 产品经营权登记 | 数据产品上市交易 | 数据交易所 |
| 变更/注销登记 | 信息变更或注销 | 同上 |

## 二、登记材料清单

### 2.1 基础材料（所有类型）

| 材料 | 要求 | 说明 |
|------|------|------|
| 数据产权登记申请表 | 在线填写 | 平台提供模板 |
| 申请人身份证明 | 企业营业执照/个人身份证 | PDF格式 |
| 数据资源描述文件 | JSON/XML格式 | 数据元信息 |
| 数据样本 | 脱敏后样本 | 用于验证 |

### 2.2 持有权登记附加材料
- 数据来源说明
- 数据采集/生成证明
- 合规性承诺函
- 数据安全措施说明

### 2.3 产品经营权登记附加材料
- 数据产品说明书
- 数据质量评估报告
- 定价方案
- 交易规则

## 三、登记流程

### 3.1 申请阶段
1. 注册账号并完成实名认证
2. 选择登记类型
3. 填写登记表
4. 上传证明材料
5. 提交申请

### 3.2 审核阶段
1. 材料完整性审核（5工作日）
2. 内容合规性审核（10工作日）
3. 公示期（10工作日）
4. 发放登记凭证

## 四、AI登记材料生成

点击"AI登记材料生成"，自动生成：
- 完整材料清单
- 数据描述文件
- 合规性承诺函模板
- 产品说明书草稿`,
    accounting: `# 数据资产入表指南

## 一、政策背景

### 1.1 适用法规
- 《企业数据资源相关会计处理暂行规定》（2024年1月1日施行）
- 《数据资产评估指导意见》

### 1.2 适用范围
- ✔ 企业合法持有或控制的数据资源
- ✔ 预期会给企业带来经济利益
- ✔ 数据成本能够可靠计量

## 二、入表路径

### 2.1 确认为无形资产

适用条件：
- 企业使用数据资源提供服务
- 数据资产有明确使用寿命
- 能够可靠计量成本

账务处理：

\`\`\`
借：无形资产——数据资产
贷：银行存款/应付账款
\`\`\`

### 2.2 确认为存货

适用条件：
- 企业将数据产品对外销售
- 数据产品已交付或可交付

账务处理：

\`\`\`
借：存货——数据产品
贷：银行存款/应付账款
\`\`\`

### 2.3 不符合入表条件
- 数据来源不合规
- 成本无法可靠计量
- 预期不会产生经济利益
- 仅供内部使用且无转让价值

## 三、价值评估方法

| 方法 | 适用场景 | 说明 |
|------|---------|------|
| 成本法 | 成本可计量 | 基于历史成本调整 |
| 收益法 | 未来收益可预见 | DCF模型 |
| 市场法 | 存在可比交易 | 参考类似交易 |

## 四、AI入表方案分析

点击"AI入表方案分析"，AI将帮助您：
1. 评估是否符合入表条件
2. 选择最佳入表路径
3. 估算资产价值
4. 评估对企业财务的影响`,
    transaction: `# 数据交易合规指南

## 一、交易场所

### 1.1 国家级数据交易所

| 交易所 | 成立时间 | 定位 |
|--------|---------|------|
| 上海数据交易所 | 2021年11月 | 国际数据港 |
| 北京数据交易所 | 2021年9月 | 公共数据开发 |
| 深圳数据交易所 | 2021年12月 | 粤港澳大湾区 |
| 贵阳大数据交易所 | 2015年9月 | 全国首家 |

### 1.2 地方数据交易所
- 浙江大数据交易中心
- 华东大数据交易中心
- 长江大数据交易中心

## 二、交易模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| 数据产品挂牌 | 在交易所上架数据产品 | 标准化数据产品 |
| API接口调用 | 通过接口提供实时数据 | 实时数据服务 |
| 数据集下载 | 提供离线数据包 | 批量数据需求 |
| 隐私计算 | 联邦学习/多方安全计算 | 敏感数据合作 |

## 三、交易合规要求

### 3.1 数据来源合规
- ✔ 持有合法数据产权登记凭证
- ✔ 数据不涉及个人信息违规
- ✔ 不涉及禁止交易的数据

### 3.2 交易过程合规
- ✔ 签订数据交易合同
- ✔ 使用标准交易凭证
- ✔ 完成交易登记备案

### 3.3 交易后管理
- ✔ 数据使用范围限制
- ✔ 数据安全保障义务
- ✔ 定期审计权保障

## 四、AI交易方案设计

点击"AI交易方案设计"，系统将：
1. 分析数据产品特征
2. 推荐最佳交易模式
3. 设计合同关键条款
4. 评估交易风险与合规性`,
  }
  return templates[stepId]
}

// ════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════

interface DataIPWizardProps {
  open: boolean
  onClose: () => void
}

export default function DataIPWizard({ open, onClose }: DataIPWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStep = STEPS[currentStepIndex]

  const [project, setProject] = useState<DataIPData>({
    name: '', type: '企业数据', owner: '',
    ownershipConfirm: '', rightsAnalysis: '',
    threeRights: { holding: false, processing: false, business: false },
    rightsDistribution: '',
    classification: '一般数据', classificationBasis: '', protectionLevel: '',
    registrationDoc: '', registrationStatus: '',
    accountingTreatment: '', assetValue: '',
    transactionDoc: '', transactionStatus: '',
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
        name: '', type: '企业数据', owner: '',
        ownershipConfirm: '', rightsAnalysis: '',
        threeRights: { holding: false, processing: false, business: false },
        rightsDistribution: '',
        classification: '一般数据', classificationBasis: '', protectionLevel: '',
        registrationDoc: '', registrationStatus: '',
        accountingTreatment: '', assetValue: '',
        transactionDoc: '', transactionStatus: '',
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
      const response = await fetch('/api/dataip-agent', {
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
      console.error('[DataIPWizard] AI call failed:', err)
      const fallbacks: Record<StepId, string> = {
        ownership: '我来帮您进行数据确权分析。基于"数据二十条"的政策框架，我将梳理您的数据来源链路，分析权利归属状态，识别潜在的权属争议，并提供专业的确权建议。',
        rights: '三权分置是数据产权制度的核心。我来帮您设计最优的三权分配方案，明确数据资源持有权、加工使用权、经营权的权责划分，生成符合法规要求的三权分置协议。',
        classification: '数据分类分级是数据保护的基础。我来帮您依据《数据安全法》对数据进行智能分类分级，识别重要数据和核心数据，并提供相应的保护措施建议。',
        registration: '数据产权登记是确权的法定程序。我来帮您准备完整的登记材料，包括登记申请表、数据描述文件、合规性承诺函等，确保登记顺利完成。',
        accounting: '数据资产入表是新政策下的重要议题。我来帮您评估数据是否符合入表条件，选择最佳会计处理路径，并分析对企业财务的影响。',
        transaction: '数据交易需要遵循严格的合规要求。我来帮您设计最优的交易方案，选择合适的交易场所和模式，确保交易合规、安全。',
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
                  <h2 className="text-lg font-bold text-white">数据知识产权工作台</h2>
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
                      <Bot size={16} className="text-[#06B6D4]" />
                      <h4 className="text-sm font-semibold text-white">AI 助手</h4>
                      {aiLoading && <Loader2 size={14} className="animate-spin text-[#06B6D4]" />}
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
                    style={{ background: 'linear-gradient(135deg, #06B6D4, #3B82F6)', color: 'white' }}
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
                            <span className="text-[#06B6D4] mt-0.5">§</span>
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