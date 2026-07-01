import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, ChevronRight, Check, Lock, ShieldCheck,
  Eye, EyeOff, Upload, Wand2, FileText, Tag, Palette,
  Bot, ArrowLeft, ArrowRight, Copy, RefreshCw, AlertCircle,
  Zap, Globe, BookOpen, Scale, PenTool, BarChart3, Search,
  X, CheckCircle2, Loader2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ════════════════════════════════════════════════
//  Types
// ════════════════════════════════════════════════

type CreatorStep = 'define' | 'metadata' | 'protect' | 'publish'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface SkillDraft {
  name: string
  category: string
  description: string
  icon: string
  tags: string[]
  systemPrompt: string
  encryptedPrompt: string
  author: string
}

// ════════════════════════════════════════════════
//  Constants
// ════════════════════════════════════════════════

const CATEGORIES = [
  { key: '专利', label: '专利', icon: PenTool, color: '#3B82F6' },
  { key: '商标', label: '商标', icon: Search, color: '#8B5CF6' },
  { key: '版权', label: '版权', icon: BookOpen, color: '#10B981' },
  { key: '合规风控', label: '合规风控', icon: Scale, color: '#EF4444' },
  { key: '估值分析', label: '估值分析', icon: BarChart3, color: '#F59E0B' },
  { key: '翻译通用', label: '翻译通用', icon: Globe, color: '#6366F1' },
  { key: '金融投资', label: '金融投资', color: '#F59E0B', icon: BarChart3 },
  { key: '商业秘密', label: '商业秘密', color: '#EF4444', icon: ShieldCheck },
]

const ICON_OPTIONS = [
  { value: 'wand-2', label: '魔法棒', Icon: Wand2 },
  { value: 'bot', label: '机器人', Icon: Bot },
  { value: 'zap', label: '闪电', Icon: Zap },
  { value: 'file-text', label: '文档', Icon: FileText },
  { value: 'search', label: '搜索', Icon: Search },
  { value: 'shield-check', label: '盾牌', Icon: ShieldCheck },
  { value: 'globe', label: '地球', Icon: Globe },
  { value: 'scale', label: '天平', Icon: Scale },
  { value: 'pen-tool', label: '笔', Icon: PenTool },
  { value: 'bar-chart-3', label: '图表', Icon: BarChart3 },
  { value: 'sparkles', label: '星星', Icon: Sparkles },
  { value: 'tag', label: '标签', Icon: Tag },
]

const STEP_CONFIG: { key: CreatorStep; title: string; desc: string }[] = [
  { key: 'define', title: 'AI 对话定义', desc: '与AI多轮交互，定义技能功能与行为' },
  { key: 'metadata', title: '元数据配置', desc: '设置名称、分类、图标、描述等' },
  { key: 'protect', title: '提示词封装', desc: '核心提示词加密保护，防止泄露' },
  { key: 'publish', title: '发布上线', desc: '一键上传至技能市场' },
]

const SUGGESTION_PROMPTS = [
  '帮我做一个专利查新分析技能',
  '创建一个商标近似度检测工具',
  '制作一个版权侵权监测助手',
  '设计一个IP价值评估专家',
  '构建一个FTO防侵权检索Agent',
  '创建一个合同条款审查技能',
]

// ════════════════════════════════════════════════
//  Prompt Encryption Utility (XOR + Base64)
// ════════════════════════════════════════════════

function encryptPrompt(text: string): string {
  const key = 'IPClaw_Skill_Protect_2025'
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(encodeURIComponent(result))
}

function decryptPrompt(encoded: string): string {
  try {
    const decoded = decodeURIComponent(atob(encoded))
    const key = 'IPClaw_Skill_Protect_2025'
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  } catch {
    return '[解密失败]'
  }
}

function maskPrompt(prompt: string): string {
  if (prompt.length <= 20) return '*'.repeat(prompt.length)
  const head = prompt.slice(0, 8)
  const tail = prompt.slice(-8)
  const maskedLength = Math.min(prompt.length - 16, 60)
  return `${head}${'*'.repeat(maskedLength)}${tail}  (${prompt.length}字符已加密)`
}

function generateChatFallback(userInput: string): string {
  const input = (userInput || '').toLowerCase()

  let category = '通用'
  let suggestedName = '自定义技能'
  let promptTemplate = ''

  if (/专利|patent|查新|检索|撰写|FTO|侵权/i.test(input)) {
    category = '专利'
    suggestedName = input.includes('查新') ? '智能专利查新分析师' :
                    input.includes('撰写') ? '专利撰写助手' :
                    input.includes('FTO') ? 'FTO防侵权专家' : '专利智能助手'
    promptTemplate = `你是一个专业的${suggestedName}。你的任务是${input.includes('查新') ? '对给定技术方案进行新颖性检索和分析' : input.includes('撰写') ? '根据技术交底书生成规范的专利申请文件' : '为用户提供专业的专利相关服务'}。

## 核心能力
- 深入理解技术方案的实质创新点
- 基于法律法规提供专业意见
- 结构化输出分析结果

## 工作规则
1. 首先确认用户的具体需求
2. 基于专业知识进行分析
3. 给出可执行的建议
4. 如有不确定之处主动询问

## 输出格式
使用Markdown结构化输出，包含必要的表格和列表。`
  } else if (/商标|trademark|品牌|近似|注册|监测/i.test(input)) {
    category = '商标'
    suggestedName = '商标智能顾问'
    promptTemplate = `你是一个专业的商标智能顾问。你的任务是为用户提供商标相关的专业服务，包括商标近似查询、注册风险评估、商标监测预警等。

## 核心能力
- 商标近似度分析与评估
- 注册成功率预测
- 品牌保护策略建议

## 工作规则
1. 准确理解用户的商标需求
2. 基于尼斯分类体系进行分析
3. 提供具体可行的行动建议`
  } else if (/版权|copyright|著作权|侵权|监测/i.test(input)) {
    category = '版权'
    suggestedName = '版权保护专家'
    promptTemplate = `你是一个专业的版权保护专家。你的任务是为用户提供版权登记、侵权监测、维权支持等服务。`
  } else if (/合规|compliance|风险|扫描/i.test(input)) {
    category = '合规风控'
    suggestedName = 'IP合规审查员'
    promptTemplate = `你是一个专业的IP合规审查员。你的任务是为用户提供知识产权合规性检查和风险预警服务。`
  } else if (/估值|valuation|价值|评估/i.test(input)) {
    category = '估值分析'
    suggestedName = 'IP价值评估师'
    promptTemplate = `你是一个专业的IP价值评估师。你的任务是为用户提供知识产权的价值评估服务，包括成本法、收益法、市场法等多种评估方法。`
  } else if (/翻译|translation|语言/i.test(input)) {
    category = '翻译通用'
    suggestedName = 'IP翻译专家'
    promptTemplate = `你是一个专业的IP翻译专家。你的任务是为用户提供高质量的知识产权文档翻译服务，确保术语准确性和法律效力。`
  } else {
    suggestedName = 'IP智能助手'
    promptTemplate = `你是一个专业的知识产权AI助手。请根据用户的需求提供专业的IP相关服务和建议。`
  }

  return `感谢你的详细描述！基于你的需求，我为你生成了初步的技能方案：

## 技能概要
- **名称**: ${suggestedName}
- **分类**: ${category}
- **定位**: 基于"${input.slice(0, 50)}${input.length > 50 ? '...' : ''}"的需求定制

## 已生成的系统提示词如下：

\`\`\`prompt
${promptTemplate}
\`\`\`

> 你可以在下一步中调整和完善这个提示词。如需修改任何部分，请告诉我！

\`\`\`json
{
  "skillData": {
    "name": "${suggestedName}",
    "category": "${category}",
    "description": "基于用户需求定制的${category}类AI技能",
    "systemPrompt": ${JSON.stringify(promptTemplate)}
  }
}
\`\`\``
}

function extractSkillDataFromFallback(content: string) {
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/i)
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim())
      if (parsed.skillData) return parsed.skillData
    } catch {
      // ignore
    }
  }
  return null
}

// ════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════

interface SkillCreatorProps {
  open: boolean
  onClose: () => void
  onSkillCreated?: (skill: SkillDraft) => void
}

export default function SkillCreator({ open, onClose, onSkillCreated }: SkillCreatorProps) {
  // ── Step State ──
  const [currentStep, setCurrentStep] = useState<CreatorStep>('define')
  const stepIndex = STEP_CONFIG.findIndex(s => s.key === currentStep)

  // ── Chat State (Step 1: Define) ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'sys-0',
      role: 'system',
      content: `🎯 **欢迎来到技能创作工坊！**

我是你的**AI技能架构师**。请告诉我你想创建什么类型的技能，我会通过多轮对话帮你：
1. **明确技能定位** – 这个技能解决什么问题？
2. **设计行为模式** – 输入/输出应该是什么格式？
3. **生成系统提示词** – 构建专业的System Prompt
4. **优化与迭代** – 根据你的反馈持续改进

你可以从下方快捷入口开始，或直接描述你的想法：`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Draft State ──
  const [draft, setDraft] = useState<SkillDraft>({
    name: '',
    category: '专利',
    description: '',
    icon: 'wand-2',
    tags: [],
    systemPrompt: '',
    encryptedPrompt: '',
    author: 'IPClaw 用户',
  })

  // ── Protection State (Step 3) ──
  const [showRawPrompt, setShowRawPrompt] = useState(false)
  const [protectionEnabled, setProtectionEnabled] = useState(true)

  // ── Publish State (Step 4) ──
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<'idle' | 'success' | 'error'>('idle')

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Focus input when step changes to define
  useEffect(() => {
    if (currentStep === 'define' && open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [currentStep, open])

  // ════════════════════════════════════════════════
  //  Step 1: AI Chat - Send Message
  // ════════════════════════════════════════════════

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text || inputValue).trim()
    if (!msgText || isStreaming) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setChatMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsStreaming(true)

    // Add placeholder for assistant
    const aiMsgId = `ai-${Date.now()}`
    setChatMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }])

    try {
      const response = await fetch('/api/skill-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: chatMessages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content,
          })),
          userInput: msgText,
          currentDraft: {
            name: draft.name,
            category: draft.category,
            description: draft.description,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API请求失败: ${response.status} - ${errorText}`)
      }

      if (!response.body) {
        throw new Error('响应体为空')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue

          const data = trimmed.slice(5).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              accumulated += parsed.content
              setChatMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m)
              )
            }
            if (parsed.skillData) {
              setDraft(prev => ({
                ...prev,
                name: parsed.skillData.name || prev.name,
                category: parsed.skillData.category || prev.category,
                description: parsed.skillData.description || prev.description,
                systemPrompt: parsed.skillData.systemPrompt || prev.systemPrompt,
              }))
            }
          } catch { /* ignore */ }
        }
      }

      if (accumulated.includes('```') && !draft.systemPrompt) {
        const promptMatch = accumulated.match(/```(?:prompt|system)?\s*\n([\s\S]+?)```/i)
        if (promptMatch) {
          setDraft(prev => ({ ...prev, systemPrompt: promptMatch[1].trim() }))
        }
      }
    } catch (err) {
      console.error('[SkillCreator] Chat error:', err)
      const errorMsg = err instanceof Error ? err.message : '未知错误'
      const fallbackContent = generateChatFallback(msgText)
      
      setChatMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: `${fallbackContent}\n\n---\n⚠️ 注意：API调用出现问题（${errorMsg}），以上为离线生成的技能方案。` }
            : m
        )
      )

      const skillData = extractSkillDataFromFallback(fallbackContent)
      if (skillData) {
        setDraft(prev => ({
          ...prev,
          name: skillData.name || prev.name,
          category: skillData.category || prev.category,
          description: skillData.description || prev.description,
          systemPrompt: skillData.systemPrompt || prev.systemPrompt,
        }))
      }
    } finally {
      setIsStreaming(false)
    }
  }, [inputValue, isStreaming, chatMessages, draft])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ════════════════════════════════════════════════
  //  Step Navigation
  // ════════════════════════════════════════════════

  const goToNext = () => {
    const steps: CreatorStep[] = ['define', 'metadata', 'protect', 'publish']
    const idx = steps.indexOf(currentStep)
    if (idx < steps.length - 1) {
      // Auto-encrypt when moving to protect step
      if (steps[idx + 1] === 'protect' && draft.systemPrompt && !draft.encryptedPrompt) {
        setDraft(prev => ({
          ...prev,
          encryptedPrompt: encryptPrompt(prev.systemPrompt),
        }))
      }
      setCurrentStep(steps[idx + 1])
    }
  }

  const goToPrev = () => {
    const steps: CreatorStep[] = ['define', 'metadata', 'protect', 'publish']
    const idx = steps.indexOf(currentStep)
    if (idx > 0) setCurrentStep(steps[idx - 1])
  }

  // ════════════════════════════════════════════════
  //  Step 4: Publish
  // ════════════════════════════════════════════════

  const handlePublish = async () => {
    setIsPublishing(true)
    setPublishResult('idle')

    try {
      const response = await fetch('/api/skill-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          skill: {
            ...draft,
            encryptedPrompt: protectionEnabled ? encryptPrompt(draft.systemPrompt) : '',
            publishedAt: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) throw new Error('发布失败')

      const result = await response.json()
      if (result.success) {
        setPublishResult('success')
        onSkillCreated?.(draft)
      } else {
        throw new Error(result.error || '发布失败')
      }
    } catch (err) {
      console.error('[SkillCreator] Publish error:', err)
      setPublishResult('error')
    } finally {
      setIsPublishing(false)
    }
  }

  // ════════════════════════════════════════════════
  //  Render
  // ════════════════════════════════════════════════

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%)',
            border: '1px solid var(--navy-700)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(250,204,21,0.05)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)] shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)' }}
              >
                <Wand2 size={20} className="text-[#0F172A]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">技能创作工坊</h2>
                <p className="text-[11px] text-[var(--text-muted)]">AI驱动的个性化技能生成器</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--navy-700)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ─── Step Indicator ─── */}
          <div className="flex items-center px-6 py-3 border-b border-[var(--navy-700)] shrink-0">
            {STEP_CONFIG.map((step, idx) => (
              <div key={step.key} className="flex items-center flex-1">
                <button
                  onClick={() => idx <= stepIndex && setCurrentStep(step.key)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      idx === stepIndex
                        ? 'text-[var(--navy-900)] scale-110'
                        : idx < stepIndex
                          ? 'text-white'
                          : 'text-[var(--text-muted)]'
                    }`}
                    style={{
                      background:
                        idx === stepIndex
                          ? 'var(--gold-400)'
                          : idx < stepIndex
                            ? '#22C55E'
                            : 'var(--navy-700)',
                      boxShadow: idx === stepIndex ? '0 0 12px rgba(250,204,21,0.3)' : 'none',
                    }}
                  >
                    {idx < stepIndex ? <Check size={14} /> : idx + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors ${
                    idx === stepIndex ? 'text-[var(--gold-400)]' :
                    idx < stepIndex ? 'text-white' : 'text-[var(--text-muted)]'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {idx < STEP_CONFIG.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 rounded transition-colors duration-500 ${
                      idx < stepIndex ? 'bg-[#22C55E]' : 'bg-[var(--navy-700)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ─── Content Area ─── */}
          <div className="flex-1 overflow-y-auto">
            {/* STEP 1: AI对话定义 */}
            {currentStep === 'define' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-[520px]"
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {chatMessages.map((msg) => {
                    if (msg.role === 'system') {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="max-w-[85%] mx-auto rounded-xl px-4 py-3"
                          style={{
                            background: 'rgba(250,204,21,0.08)',
                            border: '1px solid rgba(250,204,21,0.15)',
                          }}
                        >
                          <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </motion.div>
                      )
                    }
                    if (msg.role === 'user') {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-[75%] bg-[#2563EB] rounded-2xl rounded-br-md px-4 py-2.5">
                            <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                          </div>
                        </motion.div>
                      )
                    }
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div
                          className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3"
                          style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
                        >
                          <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                            {msg.content ? (
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : isStreaming ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 size={14} className="animate-spin text-[var(--gold-400)]" />
                                AI正在思考...
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions */}
                {chatMessages.length <= 1 && (
                  <div className="px-5 pb-2">
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTION_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(prompt)}
                          disabled={isStreaming}
                          className="text-[11px] px-3 py-1.5 rounded-full border transition-all duration-200 truncate max-w-full"
                          style={{
                            borderColor: 'var(--navy-600)',
                            color: 'var(--text-secondary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(250,204,21,0.4)'
                            e.currentTarget.style.color = 'var(--gold-400)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--navy-600)'
                            e.currentTarget.style.color = 'var(--text-secondary)'
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="px-5 pb-4 pt-2 border-t border-[var(--navy-700)]">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="描述你想创建的技能..."
                      disabled={isStreaming}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[var(--text-muted)] outline-none transition-colors disabled:opacity-50"
                      style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold-400)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--navy-700)'}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!inputValue.trim() || isStreaming}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                      style={{
                        background: inputValue.trim() && !isStreaming
                          ? 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)'
                          : 'var(--navy-700)',
                      }}
                    >
                      <Send size={16} className={inputValue.trim() && !isStreaming ? 'text-[#0F172A]' : 'text-[var(--text-muted)]'} />
                    </button>
                  </div>

                  {/* Quick info about draft */}
                  {(draft.name || draft.systemPrompt) && (
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                      {draft.name && <span>已识别: <strong className="text-[var(--gold-400)]">{draft.name}</strong></span>}
                      {draft.systemPrompt && <span>提示词: <strong className="text-green-400">已生成</strong> ({draft.systemPrompt.length}字)</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: 元数据配置 */}
            {currentStep === 'metadata' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.12)' }}>
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-[var(--gold-400)] mt-0.5 shrink-0" />
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  基于刚才的对话，AI已自动提取了部分信息。你可以在此处修改和完善技能的元数据。
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    技能名称<span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如：智能专利查新分析师"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                    style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold-400)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--navy-700)'}
                  />
                </div>

                {/* Category + Icon Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">分类</label>
                    <select
                      value={draft.category}
                      onChange={e => setDraft(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                      style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)', color: 'var(--text-primary)' }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">图标</label>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl" style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}>
                      {ICON_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setDraft(prev => ({ ...prev, icon: opt.value }))}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            draft.icon === opt.value ? 'scale-110 ring-2' : 'hover:scale-105'
                          }`}
                          style={{
                            background: draft.icon === opt.value ? 'rgba(250,204,21,0.15)' : 'transparent',
                            borderColor: draft.icon === opt.value ? 'var(--gold-400)' : 'transparent',
                          }}
                          title={opt.label}
                        >
                          <opt.Icon size={16} className={draft.icon === opt.value ? 'text-[var(--gold-400)]' : 'text-[var(--text-muted)]'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    功能描述 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={draft.description}
                    onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述这个技能的功能、适用场景和特点..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none resize-none transition-colors"
                    style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold-400)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--navy-700)'}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">标签（用逗号分隔）</label>
                  <input
                    type="text"
                    value={draft.tags.join(', ')}
                    onChange={e => setDraft(prev => ({
                      ...prev,
                      tags: e.target.value.split(/[,，]/).map(t => t.trim()).filter(Boolean),
                    }))}
                    placeholder="例如：专利, 查新, 分析, AI"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                    style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                  />
                  {draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {draft.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[11px]"
                          style={{ background: 'rgba(250,204,21,0.1)', color: 'var(--gold-400)', border: '1px solid rgba(250,204,21,0.2)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* System Prompt Preview */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    系统提示词（AI自动生成）
                  </label>
                  <div
                    className="rounded-xl p-4 text-[13px] leading-relaxed max-h-[160px] overflow-y-auto"
                    style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                  >
                    {draft.systemPrompt ? (
                      <pre className="whitespace-pre-wrap text-[var(--text-secondary)] font-mono text-xs">{draft.systemPrompt}</pre>
                    ) : (
                      <p className="text-[var(--text-muted)] italic">
                        还未生成提示词。请返回第一步与AI对话来生成系统提示词。
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: 提示词封装保护 */}
            {currentStep === 'protect' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                {/* Security Info Banner */}
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
                >
                  <ShieldCheck size={20} className="text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-400 mb-1">提示词安全保护机制</h3>
                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                      你的核心提示词将使用 XOR+Base64 双重加密存储。即使数据库被直接访问，
                      攻击者也无法还原原始内容。前端展示时仅显示脱敏版本。
                    </p>
                  </div>
                </div>

                {/* Toggle Protection */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors"
                  style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
                  onClick={() => setProtectionEnabled(!protectionEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <Lock size={18} className={protectionEnabled ? 'text-green-400' : 'text-[var(--text-muted)]'} />
                    <div>
                      <p className="text-sm font-medium text-white">启用提示词加密保护</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {protectionEnabled ? '已开启 – 提示词将被加密存储，防止泄露' : '已关闭 – 提示词将以明文形式存储'}
                      </p>
                    </div>
                  </div>
                  <div
                    className="relative w-11 h-6 rounded-full transition-colors duration-200"
                    style={{ background: protectionEnabled ? '#22C55E' : 'var(--navy-700)' }}
                  >
                    <motion.div
                      className="absolute top-[2px] w-5 h-5 rounded-full bg-white"
                      animate={{ x: protectionEnabled ? 22 : 2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>

                {/* Encrypted Prompt Display */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      {protectionEnabled ? '加密后的提示词（脱敏显示）' : '原始提示词预览'}
                    </label>
                    <button
                      onClick={() => setShowRawPrompt(!showRawPrompt)}
                      className="flex items-center gap-1 text-[11px] text-[var(--gold-400)] hover:underline"
                    >
                      {showRawPrompt ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showRawPrompt ? '隐藏原文' : '查看原文'}
                    </button>
                  </div>
                  <div
                    className="rounded-xl p-4 min-h-[120px]"
                    style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                  >
                    {showRawPrompt ? (
                      <pre className="whitespace-pre-wrap text-xs text-[var(--text-secondary)] font-mono leading-relaxed max-h-[200px] overflow-y-auto">
                        {draft.systemPrompt || '（暂无提示词）'}
                      </pre>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[var(--text-muted)]">
                          <Lock size={14} className="text-green-400" />
                          <span className="text-xs font-mono">
                            {draft.systemPrompt ? maskPrompt(draft.systemPrompt) : '（暂无提示词）'}
                          </span>
                        </div>
                        {protectionEnabled && draft.systemPrompt && (
                          <>
                            <div className="h-px bg-[var(--navy-700)]" />
                            <div className="space-y-1.5">
                              <p className="text-[11px] text-[var(--text-muted)]">加密密文预览：</p>
                              <code className="block text-[10px] text-green-400/70 font-mono break-all leading-relaxed p-2 rounded" style={{ background: 'rgba(34,197,94,0.05)' }}>
                                {encryptPrompt(draft.systemPrompt).slice(0, 120)}...
                              </code>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '提示词长度', value: `${draft.systemPrompt.length} 字符` },
                    { label: '加密状态', value: protectionEnabled ? '已加密' : '明文', color: protectionEnabled ? '#22C55E' : '#EF4444' },
                    { label: '安全等级', value: protectionEnabled ? 'A级' : 'C级', color: protectionEnabled ? '#22C55E' : '#F59E0B' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-xl text-center"
                      style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
                    >
                      <div className="text-base font-bold" style={{ color: stat.color || 'var(--text-primary)' }}>{stat.value}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: 发布上线 */}
            {currentStep === 'publish' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-5"
              >
                {publishResult === 'idle' && (
                  <>
                    {/* Summary Card */}
                    <div
                      className="rounded-xl p-5"
                      style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
                    >
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-[var(--gold-400)]" />
                        技能发布摘要
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: '技能名称', value: draft.name || '未命名' },
                          { label: '所属分类', value: draft.category },
                          { label: '功能描述', value: draft.description || '无描述' },
                          { label: '标签', value: draft.tags.length > 0 ? draft.tags.join(', ') : '无' },
                          { label: '提示词长度', value: `${draft.systemPrompt.length} 字符` },
                          { label: '加密状态', value: protectionEnabled ? '已加密保护' : '明文存储' },
                          { label: '作者', value: draft.author },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between text-[13px]">
                            <span className="text-[var(--text-muted)]">{item.label}</span>
                            <span className="text-[var(--text-primary)] font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warning */}
                    <div
                      className="rounded-xl p-3 flex items-start gap-2"
                      style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}
                    >
                      <AlertCircle size={16} className="text-[var(--gold-400)] mt-0.5 shrink-0" />
                      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                        发布后，该技能将对所有用户可见并可供安装使用。请确保所有信息准确无误。
                      </p>
                    </div>

                    {/* Publish Button */}
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing || !draft.name || !draft.systemPrompt}
                      className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                        color: '#0F172A',
                        boxShadow: '0 4px 20px rgba(250,204,21,0.25)',
                      }}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          正在发布...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          确认发布到技能市场
                        </>
                      )}
                    </button>
                  </>
                )}

                {publishResult === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.1)' }}
                    >
                      <CheckCircle2 size={40} className="text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">发布成功！</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      技能「{draft.name}」已成功上传至技能市场
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-full text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors"
                      >
                        返回市场
                      </button>
                      <button
                        onClick={() => {
                          setPublishResult('idle')
                          setDraft({
                            name: '', category: '专利', description: '', icon: 'wand-2',
                            tags: [], systemPrompt: '', encryptedPrompt: '', author: 'IPClaw 用户',
                          })
                          setCurrentStep('define')
                          setChatMessages([chatMessages[0]])
                        }}
                        className="px-5 py-2 rounded-full text-sm font-medium text-[var(--navy-900)]"
                        style={{ background: 'var(--gold-400)' }}
                      >
                        再做一个
                      </button>
                    </div>
                  </motion.div>
                )}

                {publishResult === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)' }}
                    >
                      <AlertCircle size={40} className="text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">发布失败</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      请检查网络连接后重试
                    </p>
                    <button
                      onClick={() => setPublishResult('idle')}
                      className="px-5 py-2 rounded-full text-sm font-medium text-[var(--navy-900)]"
                      style={{ background: 'var(--gold-400)' }}
                    >
                      重试
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* ─── Footer Navigation ─── */}
          {publishResult === 'idle' && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--navy-700)] shrink-0">
              <button
                onClick={stepIndex > 0 ? goToPrev : onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                {stepIndex > 0 ? '上一步' : '退出'}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">
                  步骤 {stepIndex + 1} / {STEP_CONFIG.length}
                </span>
                {stepIndex < STEP_CONFIG.length - 1 && (
                  <button
                    onClick={goToNext}
                    disabled={currentStep === 'define' ? false : !draft.name || !draft.systemPrompt}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-[var(--navy-900)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'var(--gold-400)' }}
                  >
                    下一步
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}