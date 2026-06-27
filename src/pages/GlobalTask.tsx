import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Paperclip, Wand2, FolderOpen, Send, Sparkles,
  ArrowRight, Plus, X as XIcon, Check,
  ChevronDown, Upload,
} from 'lucide-react'
import Layout from '../components/Layout'
import type { ModuleType } from '../components/RightPanel'
import {
  ModelSelector,
  FileUploadZone,
  SkillPanel,
  ChatInterface,
  ExpertModePanel,
  QuickActionBar,
  WorkDirectory,
} from '../components/global-task'
import type { Message, UploadedFile, ThinkingStep } from '../components/global-task/types'
import type { Expert } from '../components/global-task/experts'

// === Agent 路由表：业务领域 → Agent API 端点映射 ===
const AGENT_ROUTING_TABLE: Record<string, { endpoint: string; name: string; category: string; color: string }> = {
  // === 专利业务 ===
  '专利检索': { endpoint: '/api/patent-agent', name: 'PatentSearch Agent', category: 'patent', color: '#3B82F6' },
  '专利布局': { endpoint: '/api/patent-layout-agent', name: 'PatentLayout Agent', category: 'patent', color: '#3B82F6' },
  '专利撰写': { endpoint: '/api/patent-drafting-agent', name: 'PatentDrafting Agent', category: 'patent', color: '#3B82F6' },
  'FTO': { endpoint: '/api/fto-agent', name: 'FTO Investigation Agent', category: 'patent', color: '#3B82F6' },
  'FTO防侵权': { endpoint: '/api/fto-agent', name: 'FTO Investigation Agent', category: 'patent', color: '#3B82F6' },
  '专利导航': { endpoint: '/api/patent-navigation-agent', name: 'PatentNavigation Agent', category: 'patent', color: '#3B82F6' },
  '年费': { endpoint: '/api/patent-fee-agent', name: 'PatentFee Agent', category: 'patent', color: '#3B82F6' },
  '专利维权': { endpoint: '/api/patent-rights-agent', name: 'PatentRights Agent', category: 'patent', color: '#3B82F6' },
  '权利要求': { endpoint: '/api/patent-drafting-agent', name: 'PatentDrafting Agent', category: 'patent', color: '#3B82F6' },
  '说明书': { endpoint: '/api/patent-drafting-agent', name: 'PatentDrafting Agent', category: 'patent', color: '#3B82F6' },
  '技术交底书': { endpoint: '/api/patent-drafting-agent', name: 'PatentDrafting Agent', category: 'patent', color: '#3B82F6' },
  '新颖性': { endpoint: '/api/patent-agent', name: 'PatentSearch Agent', category: 'patent', color: '#3B82F6' },
  '创造性': { endpoint: '/api/patent-agent', name: 'PatentSearch Agent', category: 'patent', color: '#3B82F6' },
  '查新': { endpoint: '/api/patent-agent', name: 'PatentSearch Agent', category: 'patent', color: '#3B82F6' },
  '审查意见': { endpoint: '/api/patent-agent', name: 'PatentSearch Agent', category: 'patent', color: '#3B82F6' },

  // === 商标业务 ===
  '商标检索': { endpoint: '/api/trademark-search-agent', name: 'TrademarkSearch Agent', category: 'trademark', color: '#8B5CF6' },
  '商标注册': { endpoint: '/api/trademark-registration-agent', name: 'TrademarkRegistration Agent', category: 'trademark', color: '#8B5CF6' },
  '商标监测': { endpoint: '/api/trademark-monitoring-agent', name: 'TrademarkMonitoring Agent', category: 'trademark', color: '#8B5CF6' },
  '商标维权': { endpoint: '/api/trademark-rights-agent', name: 'TrademarkRights Agent', category: 'trademark', color: '#8B5CF6' },
  '尼斯分类': { endpoint: '/api/trademark-search-agent', name: 'TrademarkSearch Agent', category: 'trademark', color: '#8B5CF6' },
  '近似': { endpoint: '/api/trademark-search-agent', name: 'TrademarkSearch Agent', category: 'trademark', color: '#8B5CF6' },
  '显著性': { endpoint: '/api/trademark-search-agent', name: 'TrademarkSearch Agent', category: 'trademark', color: '#8B5CF6' },
  '异议': { endpoint: '/api/trademark-rights-agent', name: 'TrademarkRights Agent', category: 'trademark', color: '#8B5CF6' },
  '无效宣告': { endpoint: '/api/trademark-rights-agent', name: 'TrademarkRights Agent', category: 'trademark', color: '#8B5CF6' },

  // === 版权业务 ===
  '版权登记': { endpoint: '/api/copyright-registration-agent', name: 'CopyrightRegistration Agent', category: 'copyright', color: '#EC4899' },
  '软件著作权': { endpoint: '/api/copyright-registration-agent', name: 'CopyrightRegistration Agent', category: 'copyright', color: '#EC4899' },
  '软著': { endpoint: '/api/copyright-registration-agent', name: 'CopyrightRegistration Agent', category: 'copyright', color: '#EC4899' },
  '版权监测': { endpoint: '/api/copyright-monitoring-agent', name: 'CopyrightMonitoring Agent', category: 'copyright', color: '#EC4899' },
  '版权维权': { endpoint: '/api/copyright-rights-agent', name: 'CopyrightRights Agent', category: 'copyright', color: '#EC4899' },
  '版权运营': { endpoint: '/api/copyright-operation-agent', name: 'CopyrightOperation Agent', category: 'copyright', color: '#EC4899' },
  '作品登记': { endpoint: '/api/copyright-registration-agent', name: 'CopyrightRegistration Agent', category: 'copyright', color: '#EC4899' },
  '侵权监测': { endpoint: '/api/copyright-monitoring-agent', name: 'CopyrightMonitoring Agent', category: 'copyright', color: '#EC4899' },

  // === 数据知识产权 ===
  '数据登记': { endpoint: '/api/dataip-registration-agent', name: 'DataIPRegistration Agent', category: 'dataip', color: '#14B8A6' },
  '数据资产': { endpoint: '/api/dataip-registration-agent', name: 'DataIPRegistration Agent', category: 'dataip', color: '#14B8A6' },
  '三权分置': { endpoint: '/api/dataip-registration-agent', name: 'DataIPRegistration Agent', category: 'dataip', color: '#14B8A6' },
  '数据入表': { endpoint: '/api/dataip-registration-agent', name: 'DataIPRegistration Agent', category: 'dataip', color: '#14B8A6' },
  '数据权益': { endpoint: '/api/dataip-rights-agent', name: 'DataIPRights Agent', category: 'dataip', color: '#14B8A6' },
  '数据合规': { endpoint: '/api/dataip-compliance-agent', name: 'DataIPCompliance Agent', category: 'dataip', color: '#14B8A6' },
  '数据交易': { endpoint: '/api/dataip-trading-agent', name: 'DataIPTrading Agent', category: 'dataip', color: '#14B8A6' },
  '数据估值': { endpoint: '/api/dataip-trading-agent', name: 'DataIPTrading Agent', category: 'dataip', color: '#14B8A6' },

  // === 商业秘密 ===
  '密点识别': { endpoint: '/api/trade-secret-identification-agent', name: 'TradeSecretID Agent', category: 'trade-secret', color: '#EF4444' },
  '商业秘密': { endpoint: '/api/trade-secret-identification-agent', name: 'TradeSecretID Agent', category: 'trade-secret', color: '#EF4444' },
  '保密体系': { endpoint: '/api/trade-secret-protection-agent', name: 'TradeSecretProtection Agent', category: 'trade-secret', color: '#EF4444' },
  '定密': { endpoint: '/api/trade-secret-identification-agent', name: 'TradeSecretID Agent', category: 'trade-secret', color: '#EF4444' },
  '侵权调查': { endpoint: '/api/trade-secret-investigation-agent', name: 'TradeSecretInvestigation Agent', category: 'trade-secret', color: '#EF4444' },
  '诉讼支持': { endpoint: '/api/trade-secret-litigation-agent', name: 'TradeSecretLitigation Agent', category: 'trade-secret', color: '#EF4444' },

  // === 金融投资 ===
  'IP估值': { endpoint: '/api/ip-valuation-agent', name: 'IPValuation Agent', category: 'finance', color: '#F59E0B' },
  '证券化': { endpoint: '/api/ip-securitization-agent', name: 'IPSecuritization Agent', category: 'finance', color: '#F59E0B' },
  'ABS': { endpoint: '/api/ip-securitization-agent', name: 'IPSecuritization Agent', category: 'finance', color: '#F59E0B' },
  '质押融资': { endpoint: '/api/ip-pledge-agent', name: 'IPPledge Agent', category: 'finance', color: '#F59E0B' },
  '股权融资': { endpoint: '/api/ip-equity-agent', name: 'IPEquity Agent', category: 'finance', color: '#F59E0B' },
  '股权出资': { endpoint: '/api/ip-equity-agent', name: 'IPEquity Agent', category: 'finance', color: '#F59E0B' },
  'IP保险': { endpoint: '/api/ip-insurance-agent', name: 'IPInsurance Agent', category: 'finance', color: '#F59E0B' },
  '交易撮合': { endpoint: '/api/ip-deal-agent', name: 'IPDeal Agent', category: 'finance', color: '#F59E0B' },
  '融资': { endpoint: '/api/ip-pledge-agent', name: 'IPPledge Agent', category: 'finance', color: '#F59E0B' },

  // === 技能市场 ===
  '技能推荐': { endpoint: '/api/skill-market-agent', name: 'SkillMarket Agent', category: 'skill-hub', color: '#06B6D4' },
  '工具对比': { endpoint: '/api/skill-market-agent', name: 'SkillMarket Agent', category: 'skill-hub', color: '#06B6D4' },
  'AI工具': { endpoint: '/api/skill-market-agent', name: 'SkillMarket Agent', category: 'skill-hub', color: '#06B6D4' },
}

function getCategoryName(category: string): string {
  const map: Record<string, string> = {
    patent: '专利',
    trademark: '商标',
    copyright: '版权',
    dataip: '数据知识产权',
    'trade-secret': '商业秘密',
    finance: '金融投资',
    'skill-hub': '技能市场',
  }
  return map[category] || '通用'
}

function detectIntent(userInput: string): { agent: typeof AGENT_ROUTING_TABLE[string] | null; confidence: number; matchedKeyword: string } {
  const input = userInput.toLowerCase()
  for (const [keyword, agentConfig] of Object.entries(AGENT_ROUTING_TABLE)) {
    if (input.includes(keyword.toLowerCase())) {
      return { agent: agentConfig, confidence: 0.9, matchedKeyword: keyword }
    }
  }
  return { agent: null, confidence: 0, matchedKeyword: '' }
}

// === 模型配置 ===
interface ModelConfig {
  id: string
  name: string
  provider: string
  apiBase: string
  color: string
  status: 'online' | 'offline' | 'busy'
  apiKey?: string
}

const BUILTIN_MODELS: ModelConfig[] = [
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: '深度求索', apiBase: 'https://api.deepseek.com/v1', color: '#4F46E5', status: 'online' },
  { id: 'qwen-max', name: 'Qwen-Max', provider: '阿里云通义', apiBase: 'https://dashscope.aliyuncs.com/api/v1', color: '#FF6A00', status: 'online' },
  { id: 'glm-4', name: 'GLM-4', provider: '智谱AI', apiBase: 'https://open.bigmodel.cn/api/paas/v4', color: '#FF6B6B', status: 'online' },
  { id: 'doubao-pro', name: '豆包 Pro', provider: '字节跳动', apiBase: 'https://api.doubao.com/v1', color: '#00A8FF', status: 'online' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', apiBase: 'https://api.openai.com/v1', color: '#10A37F', status: 'busy' },
  { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', apiBase: 'https://api.anthropic.com/v1', color: '#D4A574', status: 'online' },
]

// === 工作空间 ===
interface Workspace {
  id: string
  name: string
  path: string
  icon: string
}

const WORKSPACES: Workspace[] = [
  { id: 'default', name: '默认工作空间', path: '/IPClaw/默认项目', icon: '📁' },
  { id: 'patent-2025', name: '2025专利申请', path: '/IPClaw/专利/2025申请', icon: '📋' },
  { id: 'trademark-q2', name: 'Q2商标注册', path: '/IPClaw/商标/Q2批次', icon: '™️' },
  { id: 'copyright-sw', name: '软件著作权库', path: '/IPClaw/版权/软著', icon: '©️' },
]

// === 技能市场数据 ===
const MARKET_SKILLS = [
  { name: 'PatSeek智能检索', category: '专利', desc: '亿级专利数据库AI检索', provider: 'PatSeek', icon: '🔍' },
  { name: 'Eureka查新Agent', category: '专利', desc: '查全率97%的新颖性分析', provider: '智慧芽', icon: '🔬' },
  { name: 'Eureka FTO Agent', category: '专利', desc: '自由实施风险排查', provider: '智慧芽', icon: '⚖️' },
  { name: 'Eureka外观设计Agent', category: '专利', desc: '外观设计相似性检索', provider: '智慧芽', icon: '🎨' },
  { name: 'Eureka撰写Agent', category: '专利', desc: '权利要求、说明书生成', provider: '智慧芽', icon: '✍️' },
  { name: 'Derip工作流编排', category: '专利', desc: '多步骤IP处理自动化', provider: 'Derip', icon: '🔗' },
  { name: 'IP Copilot全域翻译', category: '专利', desc: '108语言专业术语保留', provider: 'IP Copilot', icon: '🌏' },
  { name: 'incoPat全球分析', category: '专利', desc: '1.7亿全球专利数据', provider: 'incoPat', icon: '📊' },
  { name: 'Trademark Clearance', category: '商标', desc: 'AI驱动的商标近似检索', provider: 'Questel', icon: '™️' },
  { name: '睿观AI商标检索', category: '商标', desc: '15秒侵权检索', provider: '睿观AI', icon: '👁️' },
  { name: '企驻云成功率预估', category: '商标', desc: 'AI预测注册成功率', provider: '企驻云', icon: '📈' },
  { name: 'WIPO图形检索', category: '商标', desc: '图形商标相似度匹配', provider: 'WIPO', icon: '🖼️' },
  { name: 'Copyright Monitor', category: '版权', desc: '7×24全网侵权监测', provider: 'CNIPA', icon: '🔔' },
  { name: '睿观AI版权检索', category: '版权', desc: '6000万版权数据比对', provider: '睿观AI', icon: '©️' },
  { name: 'CNIPA合规扫描', category: '合规', desc: '国知办函服字〔2025〕179号标准', provider: 'CNIPA', icon: '📄' },
  { name: '睿观AI综合检索', category: '合规', desc: '2亿专利、1亿商标、6000万版权', provider: '睿观AI', icon: '🧠' },
  { name: '悟空火眼守卫', category: '合规', desc: '电商侵权实时监控', provider: '悟空', icon: '👀' },
  { name: 'IP估值大师', category: '金融', desc: '成本法、收益法、市场法三轨估值', provider: 'IPClaw', icon: '💰' },
  { name: 'WIPO Translate', category: '工具', desc: '108种语言机器翻译', provider: 'WIPO', icon: '🌍' },
  { name: 'Qthena AI助手', category: '工具', desc: '58%机构已部署', provider: 'Questel', icon: '🤖' },
]

export default function GlobalTask() {
  // ── State 声明（全部集中在此处）──
  const [selectedModelId, setSelectedModelId] = useState('deepseek-chat')
  const [expertMode, setExpertMode] = useState(false)
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [temperature, setTemperature] = useState(0.7)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputText, setInputText] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const [uploadExpanded, setUploadExpanded] = useState(false)
  const [skillExpanded, setSkillExpanded] = useState(false)
  const [workDirExpanded, setWorkDirExpanded] = useState(false)
  const [showThinking, setShowThinking] = useState(true)
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('default')
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>(BUILTIN_MODELS)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showAddModel, setShowAddModel] = useState(false)
  const [newModelForm, setNewModelForm] = useState({ name: '', apiKey: '', apiBase: '' })
  const [tokenStats] = useState({ inputTokens: 1247, outputTokens: 2893, estimatedCost: '0.023', responseTime: '3.2s' })

  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 派生值
  const currentModel = availableModels.find(m => m.id === selectedModelId) || availableModels[0]
  const currentWorkspace = WORKSPACES.find(w => w.id === currentWorkspaceId) || WORKSPACES[0]

  // ════════════════════════════════════════════════
  //  函数定义区——顺序至关重要，严禁打乱！
  // ════════════════════════════════════════════════

  // ── 1. handleAddModel（添加自定义模型）──
  const handleAddModel = useCallback(() => {
    if (!newModelForm.name || !newModelForm.apiKey || !newModelForm.apiBase) return
    const newModel: ModelConfig = {
      id: `custom_${Date.now()}`,
      name: newModelForm.name,
      provider: 'Custom',
      apiBase: newModelForm.apiBase,
      color: '#10B981',
      status: 'online',
      apiKey: newModelForm.apiKey,
    }
    setAvailableModels(prev => [...prev, newModel])
    setSelectedModelId(newModel.id)
    setShowAddModel(false)
    setNewModelForm({ name: '', apiKey: '', apiBase: '' })
    setShowModelDropdown(false)
  }, [newModelForm])

  // ── 1.5 handleExecuteWorkflow（执行专家工作流程）──
  const handleExecuteWorkflow = useCallback(async (expert: Expert) => {
    const workflowPrompt = `专家"${expert.name}"（${expert.title}）的工作流程：\n` +
      expert.workflow.map((step, idx) => `${idx + 1}. ${step.title}：${step.description}`).join('\n') +
      `\n\n请按照上述工作流程，逐步分析和处理用户的需求。`

    handleSendMessage(workflowPrompt)
  }, [])

  // ── 2. handleSendMessage ★★★ 核心消息处理，必须在analyzeAndRouteFile之前 ★★★ ──
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // 1. 构建用户消息
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setActiveSkill(null)
    setIsTyping(true)

    // 2. 创建AI回复占位符
    const aiMsgId = `msg_${Date.now() + 1}`

    // 3. 意图识别
    const intent = detectIntent(content)

    // 4. 构建对话历史（快照当前messages，不含刚添加的userMsg）
    const conversationHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    try {
      let apiEndpoint: string
      let systemPrompt: string
      let routingInfo: string = ''
      let agentColor: string = '#FACC15'

      if (intent.agent) {
        // ===== 路由到专业Agent =====
        apiEndpoint = currentModel.apiKey && currentModel.apiBase !== 'https://api.deepseek.com/v1'
          ? `${currentModel.apiBase}/chat/completions`
          : `${intent.agent.endpoint}`
        routingInfo = `🤖 ${intent.agent.name} (${intent.matchedKeyword})`
        agentColor = intent.agent.color

        const expertContext = selectedExpert ? `\n\n## 专家模式激活\n你当前正在以**专家模式**运行，由专家"${selectedExpert.name}"（${selectedExpert.title}）指导。\n专家专长：${selectedExpert.specialty.join('、')}\n请严格按照专家的工作流程和专业能力进行处理。` : ''

        systemPrompt = `你是 ${intent.agent.name}，隶属于IPClaw智能体协同网络。当前请求由**智能总台**路由至此。
## 你的专业身份
你是一个专业的知识产权${getCategoryName(intent.agent.category)}AI专家。
## 协同上下文
- 本轮对话由用户通过**Agentic助手**发起
- 用户原始问题："${content.trim()}"
- 检测到的意图关键词："${intent.matchedKeyword}"
- 请基于你的专业领域知识给出精准、专业的回答

## 回答要求
1. 直接回答用户问题，不要重复问题本身
2. 引用具体法律法规条款
3. 提供可执行的操作建议
4. 如需更多信息，主动询问
5. 保持专业、严谨、务实的风格${expertContext}`
      } else {
        // ===== 通用对话模式（Agentic助手 / 智能总台自身处理）====
        apiEndpoint = currentModel.apiKey && currentModel.apiBase !== 'https://api.deepseek.com/v1'
          ? `${currentModel.apiBase}/chat/completions`
          : '/api/chat'
        routingInfo = '🚀 Agentic助手 (智能总台)'
        agentColor = '#FACC15'

        const expertContext = selectedExpert ? `\n\n## 专家模式激活\n你当前正在以**专家模式**运行，由专家"${selectedExpert.name}"（${selectedExpert.title}）指导。\n专家专长：${selectedExpert.specialty.join('、')}\n专家工作流程：${selectedExpert.workflow.map(w => `${w.step}.${w.title}`).join(' → ')}\n请严格按照专家的专业能力和工作流程进行处理。` : ''

        systemPrompt = `你是**Agentic助手**（IPClaw 智能总台），代号"IPClaw-Nexus"。你是整个IPClaw智能体系统的中央调度核心。
## 你的核心定位
你不是普通的聊天助手——你是*31个专业IP Agent的统一入口和智能调度中心*。用户向你提出的任何问题，你都能理解其业务意图，并调用最合适的专业Agent来回答。
## 工作原则
1. **首先判断领域**：分析用户问题属于哪个业务领域（专利/商标/版权/数据IP/商业秘密/金融）
2. **专业回答**：基于该领域的法律法规和行业标准给出精准回答
3. **跨域协调**：如涉及多个领域，分别从各角度分析。
4. **引导操作**：告诉用户可以点击左侧对应模块进入专属界面深度操作。
5. **上下文记忆**：记住对话历史，支持连续追问和多轮深度交互。
6. **结构化输出**：Markdown格式，表格对比，层次清晰。

## 法规依据：
- 《专利法》（2020) + 《实施细则》（2023) + 《审查指南》
- 《商标法》（2019) + 《审查审理指南》（2021)
- 《著作权法》（2020) + 《计算机软件保护条例》
- 《反不正当竞争法》（2025第二次修正）
- "数据二十条"（2022.12) + 《公共数据资源登记管理暂行办法》
- 《网络数据安全管理条例》（国令〔790〕号）${expertContext}`
      }

      // 5. 创建AI消息（带路由信息）
      const sourcePrefix = `> ${routingInfo} 正在处理...\n\n`
      const aiMsg: Message = {
        id: aiMsgId,
        role: 'assistant',
        content: sourcePrefix,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])

      // 6. 调用API
      const isCustomModel = currentModel.apiKey && currentModel.apiBase !== 'https://api.deepseek.com/v1'
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (isCustomModel && currentModel.apiKey) {
        headers['Authorization'] = `Bearer ${currentModel.apiKey}`
      }

      const modelName = selectedModelId === 'deepseek-chat' ? 'deepseek-chat' : selectedModelId

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: content.trim() },
          ],
          model: modelName,
          temperature: temperature,
          stream: true,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      // 7. 流式读取响应
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                accumulatedContent += delta
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, content: sourcePrefix + accumulatedContent } : msg
                  )
                )
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

    } catch (error) {
      console.error('[AgenticAssistant] Error:', error)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, content: '抱歉，请求处理失败。请检查后端服务是否正常运行，或稍后重试。' }
            : msg
        )
      )
    } finally {
      setIsTyping(false)
    }
  }, [selectedModelId, temperature, messages, currentModel, selectedExpert])

  // ── 3. analyzeAndRouteFile（依赖handleSendMessage，必须在其后定义）──
  const analyzeAndRouteFile = useCallback((file: UploadedFile) => {
    const fileName = file.name.toLowerCase()
    let detectedAgent: typeof AGENT_ROUTING_TABLE[string] | null = null

    if (fileName.includes('专利') || fileName.includes('patent') || fileName.includes('交底') || fileName.includes('权利要求')) {
      detectedAgent = AGENT_ROUTING_TABLE['专利撰写']
    } else if (fileName.includes('商标') || fileName.includes('trademark')) {
      detectedAgent = AGENT_ROUTING_TABLE['商标检索']
    } else if (fileName.includes('版权') || fileName.includes('软著') || fileName.includes('软件')) {
      detectedAgent = AGENT_ROUTING_TABLE['版权登记']
    } else if (fileName.includes('商业秘密') || fileName.includes('保密')) {
      detectedAgent = AGENT_ROUTING_TABLE['商业秘密']
    } else if (fileName.includes('数据') || fileName.includes('data')) {
      detectedAgent = AGENT_ROUTING_TABLE['数据登记']
    } else if (fileName.includes('估值') || fileName.includes('融资') || fileName.includes('valuation')) {
      detectedAgent = AGENT_ROUTING_TABLE['IP估值']
    }

    if (detectedAgent) {
      handleSendMessage(
        `请帮我分析刚上传的文件（${file.name}，${file.type}, ${(file.rawSize / 1024).toFixed(1)}KB），这是一个${getCategoryName(detectedAgent.category)}相关的文件。请根据您的专业领域知识，告诉我这个文件可能涉及哪些知识产权问题，以及下一步应该怎么处理。`
      )
    } else {
      handleSendMessage(
        `请帮我分析刚上传的文件（${file.name}，${file.type}, ${(file.rawSize / 1024).toFixed(1)}KB)。请识别文件内容并给出相关建议。`
      )
    }
  }, [handleSendMessage])

  // ── 4. useEffect 监听files变化，自动触发文件分析 ──
  const prevFilesRef = useRef<UploadedFile[]>([])
  useEffect(() => {
    if (files.length > prevFilesRef.current.length) {
      const newFiles = files.filter(f => !prevFilesRef.current.find(pf => pf.id === f.id))
      newFiles.forEach(f => analyzeAndRouteFile(f))
    }
    prevFilesRef.current = files
  }, [files, analyzeAndRouteFile])

  // ── 5. 其他事件处理函数 ──
  const handleInputSend = () => {
    const text = activeSkill ? `[${activeSkill}] ${inputText}` : inputText
    handleSendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleInputSend()
    } else if (e.key === 'Escape') {
      setInputText('')
      setActiveSkill(null)
    }
  }

  const handleInvokeSkill = (skillName: string) => {
    setActiveSkill(skillName)
    setSkillExpanded(false)
    
    const skillPrompts: Record<string, string> = {
      '专利撰写助手': `你现在是专利撰写助手，按照以下步骤执行：

步骤1：需求分析
- 分析用户提供的技术方案
- 识别创新点和技术特征

步骤2：权利要求撰写
- 构建独立权利要求
- 设计从属权利要求层次

步骤3：说明书撰写
- 撰写技术领域和背景技术
- 详细描述发明内容和实施例

步骤4：附图说明
- 描述附图的技术含义

步骤5：摘要撰写
- 总结技术方案的核心内容

请按照上述流程处理用户的专利撰写需求。`,
      '权利要求优化': `你现在是权利要求优化专家，按照以下步骤执行：

步骤1：现有分析
- 分析现有权利要求的保护范围
- 识别潜在缺陷和风险

步骤2：层次设计
- 设计合理的权利要求层次
- 确保保护范围最大化

步骤3：引用关系
- 优化权利要求之间的引用关系
- 确保逻辑清晰

步骤4：法律合规
- 检查是否符合专利法要求
- 避免形式缺陷

步骤5：审查预判
- 预判可能的审查意见
- 提前做好应对准备

请按照上述流程优化用户的权利要求。`,
      '专利检索分析': `你现在是专利检索专家，按照以下步骤执行：
步骤1：检索策略
- 分析技术主题和关键词
- 制定检索策略

步骤2：数据库检索
- 在主要专利数据库中检索
- 收集相关专利文献

步骤3：相关性分析
- 分析专利的相关性
- 筛选高价值专利

步骤4：技术分析
- 分析技术发展趋势
- 识别关键技术节点

步骤5：报告撰写
- 撰写检索分析报告
- 提供技术建议

请按照上述流程进行专利检索分析。`,
      '审查意见答复': `你现在是审查意见答复专家（创造性答复方向），按照以下详细策略和工作流程执行：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
策略一：技术特征对比分析（核心）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤1：技术方案拆解
- 将本申请权利要求逐项拆解为技术特征
- 将对比文件1的技术方案逐项拆解为技术特征

步骤2：制作技术特征对比表
| 本申请特征 | 对比文件1对应特征 | 是否相同 | 差异分析 |
|-----------|------------------|---------|---------|

步骤3：协同作用深度挖掘（重点）
- 识别技术特征之间的协同关系
- 分析协同产生的技术效果（1+1>2）
- 强调协同作用在现有技术中未被披露或教导

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
策略二：最接近现有技术论证
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤4：挖掘对比文件1不适合作为最接近现有技术的理由
- 分析对比文件1实际要解决的技术问题
- 分析本申请实际要解决的技术问题
- 找出二者技术问题的本质差异

步骤5：正向研发角度论证
- 从本领域技术人员正向研发的角度出发
- 论证不会选择对比文件1作为改进的原点或起点
- 强调动机缺失：对比文件1没有给出向本申请方向改进的任何动机

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
策略三：区别技术特征与技术启示分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤6：核对区别技术特征事实认定
- 核对审查员指出的区别技术特征是否准确
- 挖掘事实认定上的差错或失误
- 引用本申请说明书或权利要求书作为证据

步骤7：对比文件2/3技术启示分析
- 将区别技术特征与对比文件2/3相应特征进行对比
- 强调特征之间的协同作用和共同产生的技术效果
- 如果审查员进行了割裂判断，指出其错误
- 结论：对比文件2/3无法提供技术启示，无法与对比文件1结合

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
策略四：公知常识/常规技术手段反驳
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤8：汇总统计
- 统计审查意见中"常规技术手段"、"公知常识"的使用次数

步骤9：针对性反驳（重点）
- 法律定义缺失：《专利审查指南》未对"常规技术手段"给出明确定义
- 引用法律基础缺失：审查员未引用任何现有技术文献支持其认定
- 滥用问题："常规技术手段"经常被滥用，成为规避举证责任的工具
- 主观武断：认定缺乏客观标准，审查员应承担举证责任

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
策略五：事后诸葛亮评述
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤10：还原发明过程
- 从发明人的视角还原发明过程
- 分析依据现有对比文件能够得到的技术方案
- 强调与本申请的差距巨大

步骤11：揭示倒推逻辑
- 指出审查员采用了"事后诸葛亮"的倒推方法
- 评述过程是一种技术方案的"倒推"
- 违背了三步法的正向推导原则
- 不利于保护创新

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
策略六：专利价值分析与引导
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤12：挖掘社会价值
- 卡脖子技术突破
- 自主知识产权
- 国产替代

步骤13：挖掘经济价值
- 出海战略支撑
- 打破垄断
- 市场竞争力提升

步骤14：引导审查员关注专利制度本质
- 专利制度的本质是保护创新
- 保护本国产业的需要
- 平衡专利权人与社会公众利益

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步骤15：撰写正式答复文档
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 整合以上分析，撰写符合国知局格式要求的审查意见答复书
- 包含答复声明、意见陈述书正文、修改说明、权利要求书替换页
- 逻辑清晰、层次分明、引用证据准确

请按照上述策略和工作流程，针对用户提供的审查意见进行全面、深入的答复分析。`,
      '商标近似查询': `你现在是商标检索专家，按照以下步骤执行：
步骤1：商标分析
- 分析拟申请商标的文字和图形
- 确定商标显著性

步骤2：数据库查询
- 在商标数据库中检索
- 查找近似商标

步骤3：风险评估
- 评估注册风险
- 分析驳回概率

步骤4：类别规划
- 推荐尼斯分类
- 制定注册策略

步骤5：报告提交
- 提供检索分析报告
- 给出注册建议

请按照上述流程进行商标近似查询。`,
      '版权登记辅助': `你现在是版权登记助手，按照以下步骤执行：

步骤1：作品分析
- 分析作品类型和独创性
- 确定权利归属

步骤2：材料准备
- 指导准备登记材料
- 检查材料完整性

步骤3：申请填写
- 辅助填写登记申请表
- 确保信息准确

步骤4：流程指导
- 指导登记申请流程
- 跟踪申请进度

步骤5：证书领取
- 协助领取登记证书
- 提供后续维护建议

请按照上述流程协助用户进行版权登记。`,
      '专利价值评估': `你现在是专利价值评估专家，按照以下步骤执行：
步骤1：资产盘点
- 梳理专利资产组合
- 评估专利质量

步骤2：市场分析
- 分析市场环境和需求
- 评估专利的市场价值

步骤3：方法选择
- 选择合适的评估方法
- 进行价值测算

步骤4：风险评估
- 评估法律风险和技术风险
- 调整评估结果

步骤5：报告出具
- 出具专业评估报告
- 提供价值提升建议

请按照上述流程进行专利价值评估。`,
      'FTO自由实施分析': `你现在是FTO分析专家，按照以下步骤执行：

步骤1：技术比对
- 对比产品技术与专利权利要求
- 评估侵权风险

步骤2：规避设计
- 设计规避方案
- 寻找替代技术

步骤3：风险量化
- 量化侵权风险等级
- 评估诉讼风险

步骤4：策略制定
- 制定风险管理策略
- 确定行动方案

步骤5：报告撰写
- 撰写FTO分析报告
- 提供实施建议

请按照上述流程进行FTO自由实施分析。`,
      '文档翻译': `你现在是专业翻译助手，按照以下步骤执行：

步骤1：内容分析
- 分析文档类型和专业领域
- 确定翻译策略

步骤2：术语处理
- 建立专业术语表
- 确保术语一致性

步骤3：翻译执行
- 进行准确翻译
- 保持专业表达

步骤4：质量检查
- 检查翻译质量
- 确保技术准确性

步骤5：格式调整
- 调整文档格式
- 提供最终版本

请按照上述流程进行文档翻译。`,
    }

    const prompt = skillPrompts[skillName] || `你现在执行技能"${skillName}"。请根据该技能的专业领域，提供专业的服务和建议。`
    handleSendMessage(prompt)
  }

  const handleNewChat = () => {
    setMessages([])
    setActiveSkill(null)
    setInputText('')
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const handleExportChat = () => {
    const data = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n---\n\n')
    const blob = new Blob([data], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IPClaw_对话_${new Date().toLocaleDateString('zh-CN')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRegenerate = (_messageId: string) => {
    setIsTyping(true)
    setTimeout(() => {
      const aiMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: '已重新生成回复。\n\n基于您的需求，我建议从以下几个角度进行分析：\n\n1. **技术层面** - 深入理解核心创新点\n2. **法律层面** - 确保权利要求书符合审查标准\n3. **商业层面** - 评估专利的市场价值和保护策略',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  // 派生值：最后一条AI消息的思考步骤
  const lastThinking = messages.length > 0 && messages[messages.length - 1].role === 'assistant'
    ? messages[messages.length - 1].thinking || []
    : []

  // ════════════════════════════════════════════════
  //  JSX Return
  // ════════════════════════════════════════════════
  return (
    <Layout rightPanelModule="global-task">
      <div className="flex flex-col h-full overflow-hidden relative">
        {/* Quick Action Bar */}
        <QuickActionBar
          onNewChat={handleNewChat}
          onClearChat={handleClearChat}
          onExportChat={handleExportChat}
        />

        {/* Task Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-3 px-4 h-[52px] shrink-0"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--navy-700)',
            zIndex: 10,
          }}
        >
          {/* 自定义模型选择器 */}
          <div className="relative">
            <button
              onClick={() => { setShowModelDropdown(!showModelDropdown); setShowAddModel(false) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200 border"
              style={{
                background: showModelDropdown ? 'rgba(79, 70, 229, 0.1)' : 'rgba(30, 41, 59, 0.4)',
                borderColor: showModelDropdown ? '#4F46E5' : 'var(--navy-700)',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: currentModel.status === 'online' ? '#22C55E' : '#EF4444', boxShadow: currentModel.status === 'online' ? '0 0 6px #22C55E80' : 'none' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{currentModel.name}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* 模型下拉面板 */}
            <AnimatePresence>
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50"
                  style={{
                    background: 'rgba(15, 23, 42, 0.98)',
                    border: '1px solid var(--navy-600)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="p-1.5">
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => { setSelectedModelId(model.id); setShowModelDropdown(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150"
                        style={{
                          background: model.id === selectedModelId ? 'rgba(79, 70, 229, 0.12)' : 'transparent',
                          color: model.id === selectedModelId ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: model.status === 'online' ? '#22C55E' : model.status === 'busy' ? '#F59E0B' : '#EF4444' }} />
                        <span className="flex-1 text-left truncate">{model.name}</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{model.provider}</span>
                        {model.id === selectedModelId && <Check size={14} style={{ color: '#4F46E5' }} />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t" style={{ borderColor: 'var(--navy-700)' }}>
                    <button
                      onClick={() => { setShowAddModel(true); setShowModelDropdown(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-white/5"
                      style={{ color: '#10B981' }}
                    >
                      <Plus size={14} />
                      <span>添加新模型...</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 添加模型表单 */}
            <AnimatePresence>
              {showAddModel && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50"
                  style={{
                    background: 'rgba(15, 23, 42, 0.98)',
                    border: '1px solid var(--navy-600)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--navy-700)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>添加新模型</span>
                      <button onClick={() => setShowAddModel(false)} className="hover:opacity-70">
                        <XIcon size={16} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>模型名称</label>
                      <input
                        type="text"
                        value={newModelForm.name}
                        onChange={e => setNewModelForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：GPT-4o、Claude 3.5 Sonnet"
                        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none border transition-colors"
                        style={{
                          background: 'rgba(30, 41, 59, 0.6)',
                          borderColor: 'var(--navy-700)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#4F46E5'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--navy-700)'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>API Base URL</label>
                      <input
                        type="text"
                        value={newModelForm.apiBase}
                        onChange={e => setNewModelForm(prev => ({ ...prev, apiBase: e.target.value }))}
                        placeholder="例如：https://api.openai.com/v1"
                        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none border transition-colors"
                        style={{
                          background: 'rgba(30, 41, 59, 0.6)',
                          borderColor: 'var(--navy-700)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#4F46E5'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--navy-700)'}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>API Key</label>
                      <input
                        type="password"
                        value={newModelForm.apiKey}
                        onChange={e => setNewModelForm(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none border transition-colors"
                        style={{
                          background: 'rgba(30, 41, 59, 0.6)',
                          borderColor: 'var(--navy-700)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#4F46E5'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--navy-700)'}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 px-4 pb-4">
                    <button
                      onClick={() => setShowAddModel(false)}
                      className="px-3 py-1.5 rounded-lg text-[12px] border transition-colors"
                      style={{ borderColor: 'var(--navy-700)', color: 'var(--text-secondary)' }}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddModel}
                      disabled={!newModelForm.name || !newModelForm.apiKey || !newModelForm.apiBase}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#10B981', color: '#fff' }}
                    >
                      <Check size={14} className="inline mr-1" />添加
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 工作空间选择器 */}
          <div className="relative">
            <button
              onClick={() => setWorkDirExpanded(!workDirExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200 border"
              style={{
                background: workDirExpanded ? 'rgba(250, 204, 21, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                borderColor: workDirExpanded ? 'var(--gold-400)' : 'var(--navy-700)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{currentWorkspace.icon}</span>
              <span className="truncate max-w-[140px]">{currentWorkspace.name}</span>
              <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${workDirExpanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {workDirExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-2xl overflow-hidden z-50"
                  style={{
                    background: 'rgba(15, 23, 42, 0.98)',
                    border: '1px solid var(--navy-600)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="p-1.5">
                    {WORKSPACES.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => { setCurrentWorkspaceId(ws.id); setWorkDirExpanded(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150"
                        style={{
                          background: ws.id === currentWorkspaceId ? 'rgba(250, 204, 21, 0.08)' : 'transparent',
                          color: ws.id === currentWorkspaceId ? 'var(--gold-400)' : 'var(--text-secondary)',
                        }}
                      >
                        <span>{ws.icon}</span>
                        <span className="flex-1 text-left">{ws.name}</span>
                        {ws.id === currentWorkspaceId && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t" style={{ borderColor: 'var(--navy-700)' }}>
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.webkitdirectory = true
                        input.multiple = false
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files && files.length > 0) {
                            const path = files[0].webkitRelativePath.split('/')[0] || files[0].name
                            const newWorkspace: Workspace = {
                              id: `custom_${Date.now()}`,
                              name: path,
                              path: path,
                              icon: '📂',
                            }
                            WORKSPACES.push(newWorkspace)
                            setCurrentWorkspaceId(newWorkspace.id)
                            setWorkDirExpanded(false)
                          }
                        }
                        input.click()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] transition-colors duration-150 hover:bg-white/5"
                      style={{ color: '#10B981' }}
                    >
                      <Plus size={14} />
                      <span>选择本地文件夹...</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Upload Trigger */}
          <button
            onClick={() => setUploadExpanded(!uploadExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200 border"
            style={{
              background: files.length > 0 ? 'rgba(250, 204, 21, 0.08)' : 'transparent',
              borderColor: uploadExpanded ? 'var(--gold-400)' : 'var(--navy-700)',
              color: files.length > 0 ? 'var(--gold-400)' : 'var(--text-secondary)',
            }}
          >
            <Paperclip size={14} />
            <span>附件</span>
            {files.length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full font-tiny"
                style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              >
                {files.length}
              </span>
            )}
          </button>

          {/* Skill Trigger */}
          <button
            onClick={() => setSkillExpanded(!skillExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-200 border"
            style={{
              borderColor: skillExpanded ? 'var(--gold-400)' : 'var(--navy-700)',
              color: 'var(--text-secondary)',
            }}
          >
            <Wand2 size={14} />
            <span>技能</span>
          </button>

          {/* Expert Mode Toggle */}
          <button
            onClick={() => setExpertMode(!expertMode)}
            className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full transition-all duration-200 border"
            style={{
              background: expertMode ? 'rgba(250, 204, 21, 0.08)' : 'rgba(30, 41, 59, 0.4)',
              borderColor: expertMode ? 'var(--gold-400)' : 'var(--navy-700)',
            }}
          >
            <span className="font-tiny text-[var(--text-secondary)]">专家模式</span>
            <div
              className="relative w-9 h-5 rounded-full transition-colors duration-200"
              style={{ background: expertMode ? 'var(--gold-400)' : 'var(--navy-700)' }}
            >
              <motion.div
                className="absolute top-[2px] w-4 h-4 rounded-full bg-white"
                animate={{ x: expertMode ? 16 : 2 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              />
            </div>
          </button>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
        {/* Chat Area - 欢迎语由ChatInterface内部统一渲染 */}

          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            onRegenerate={handleRegenerate}
          />
        </motion.div>

        {/* Expert Mode Panel */}
        <ExpertModePanel
          expertMode={expertMode}
          onSelectExpert={setSelectedExpert}
          selectedExpert={selectedExpert}
          onExecuteWorkflow={handleExecuteWorkflow}
        />

        {/* Skill Panel */}
        <SkillPanel expanded={skillExpanded} onInvokeSkill={handleInvokeSkill} />

        {/* File Upload Zone */}
        <FileUploadZone expanded={uploadExpanded} files={files} onFilesChange={setFiles} />

        {/* Input Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="shrink-0 px-5 py-4"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--navy-700)',
            zIndex: 10,
          }}
        >
          <div className="flex items-end gap-3 max-w-5xl mx-auto">
            {/* Skill Pill */}
            <AnimatePresence>
              {activeSkill && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto' }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium shrink-0 self-end mb-2"
                  style={{
                    background: 'rgba(250, 204, 21, 0.15)',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    color: 'var(--gold-400)',
                  }}
                >
                  <Sparkles size={12} />
                  {activeSkill}
                  <button
                    onClick={() => setActiveSkill(null)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <XIcon size={12} />
                  </button>
                </motion.span>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeSkill
                    ? `使用「${activeSkill}」技能，输入您的问题...`
                    : 'Agentic助手 · 智能总台 · 按 Enter 发送，Shift+Enter 换行'
                }
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-[14px] leading-relaxed resize-none outline-none transition-all duration-200 border"
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderColor: 'var(--navy-700)',
                  color: 'var(--text-primary)',
                  maxHeight: 200,
                  minHeight: 72,
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 200) + 'px'
                }}
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInputSend}
              disabled={!inputText.trim() || isTyping}
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed self-end mb-0.5"
              style={{
                background: inputText.trim() ? 'var(--gold-400)' : 'var(--navy-700)',
                color: inputText.trim() ? 'var(--navy-900)' : 'var(--text-muted)',
              }}
            >
              {isTyping ? (
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: 'var(--navy-900)', borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Send size={18} />
              )}
            </motion.button>
          </div>

          {/* Hint Bar */}
          <div className="flex items-center justify-center gap-5 mt-2.5">
            <span className="font-tiny text-[var(--text-muted)] flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--navy-700)', fontFamily: '"JetBrains Mono", monospace' }}>Enter</kbd> 发送
            </span>
            <span className="font-tiny text-[var(--text-muted)] flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--navy-700)', fontFamily: '"JetBrains Mono", monospace' }}>Shift+Enter</kbd> 换行
            </span>
            <span className="font-tiny text-[var(--text-muted)] flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--navy-700)', fontFamily: '"JetBrains Mono", monospace' }}>Esc</kbd> 清空
            </span>
            <span className="font-tiny text-[var(--gold-400)]">|</span>
            <span className="font-tiny text-[var(--gold-400)]">Agentic助手 · 智能总台</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}