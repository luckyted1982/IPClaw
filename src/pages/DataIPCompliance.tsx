import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, ShieldCheck, ClipboardCheck, EyeOff, Lock, AlertCircle, CheckCircle, FileSearch, Layers } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const EXAMPLE_QUERIES = [
  "我们需要开展一次全面的数据合规审计，应该关注哪些方面？",
  "企业的数据如何进行分类分级？一般数据、重要数据、核心数据的区别？",
  "个人信息匿名化怎么做才能符合法规要求？有哪些技术标准？",
  "数据出境需要走什么流程？安全评估、标准合同、认证有什么区别？",
]

const CAPABILITIES = [
  { icon: ClipboardCheck, label: '合规审计', description: '全生命周期检查', color: '#22C55E' },
  { icon: Layers, label: '分类分级', description: '三级保护体系', color: '#F59E0B' },
  { icon: EyeOff, label: '匿名化', description: 'k匿名/差分隐私', color: '#06B6D4' },
  { icon: Lock, label: '隐私计算', description: '联邦学习/MPC', color: '#8B5CF6' },
  { icon: FileSearch, label: '溯源审计', description: '水印/指纹/区块链', color: '#EF4444' },
]

const COMPLIANCE_CHECKLIST = [
  {
    phase: '数据收集',
    icon: ClipboardCheck,
    status: 'active',
    checks: [
      { item: '取得用户明示同意', required: true },
      { item: '履行告知义务（隐私政策）', required: true },
      { item: '遵循最小必要原则', required: true },
      { item: '合法渠道获取数据', required: true },
    ]
  },
  {
    phase: '数据存储',
    icon: Lock,
    status: 'pending',
    checks: [
      { item: '境内存储（或完成出境评估）', required: true },
      { item: '采用强加密（AES-256）', required: true },
      { item: '实施访问控制（最小权限）', required: true },
      { item: '定期备份并测试恢复', required: false },
    ]
  },
  {
    phase: '数据使用',
    icon: EyeOff,
    status: 'pending',
    checks: [
      { item: '在声明的目的范围内使用', required: true },
      { item: '限制内部访问范围', required: true },
      { item: '记录使用行为日志', required: false },
      { item: '异常使用行为检测告警', required: false },
    ]
  },
  {
    phase: '数据共享',
    icon: AlertCircle,
    status: 'pending',
    checks: [
      { item: '获得单独同意', required: true },
      { item: '签订数据共享协议', required: true },
      { item: '对共享数据进行脱敏', required: true },
      { item: '嵌入数字水印便于溯源', required: false },
    ]
  },
]

export default function DataIPCompliance() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/dataip-compliance-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || '请求失败')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || '抱歉，未获取到响应内容。',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `请求出错：${error.message || '未知错误'}。请检查后端服务是否正常运行。`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([])
    inputRef.current?.focus()
  }

  const hasMessages = messages.length > 0

  return (
    <Layout rightPanelModule="dataip">
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--navy-700)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/')}>首页</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/data-ip')}>数据知识产权</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--text-primary)] font-medium">数据合规安全</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              2027目标：规则明确
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center h-full px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full text-center"
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                  <ShieldCheck size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  数据合规安全
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  基于《关于完善数据流通安全治理实施方案》（2025.1.15），提供数据全生命周期合规审计、分类分级保护、匿名化、隐私计算、跨境合规等专业服务
                </p>

                {/* Capabilities */}
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {CAPABILITIES.map((cap, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex flex-col items-center p-3 rounded-xl border border-[var(--navy-700)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: `${cap.color}15` }}>
                        <cap.icon size={18} style={{ color: cap.color }} />
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{cap.label}</span>
                      <span className="text-xs text-[var(--navy-500)] mt-0.5">{cap.description}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Example Queries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXAMPLE_QUERIES.map((query, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      onClick={() => sendMessage(query)}
                      className="text-left p-3.5 rounded-xl border border-[var(--navy-700)] text-sm text-[var(--text-secondary)] hover:border-[#22C55E] hover:text-[var(--text-primary)] transition-all duration-200 hover:bg-[rgba(34,197,94,0.03)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                    >
                      <Sparkles size={14} className="text-[#22C55E] mb-1.5" />
                      {query}
                    </motion.button>
                  ))}
                </div>

                {/* Compliance Checklist Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 w-full"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 text-left">
                    全生命周期合规检查清单
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {COMPLIANCE_CHECKLIST.map((phase, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-[var(--navy-700)]"
                        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <phase.icon size={14} className={phase.status === 'active' ? 'text-[#22C55E]' : 'text-[var(--navy-600)]'} />
                          <span className="text-xs font-medium text-[var(--text-primary)]">{phase.phase}</span>
                        </div>
                        <div className="space-y-1.5">
                          {phase.checks.slice(0, 3).map((check, j) => (
                            <div key={j} className="flex items-center gap-1.5">
                              <CheckCircle size={10} className={check.required ? 'text-[#22C55E]' : 'text-[var(--navy-600)]'} />
                              <span className="text-[10px] text-[var(--navy-500)] truncate">{check.item}</span>
                            </div>
                          ))}
                          {phase.checks.length > 3 && (
                            <span className="text-[10px] text-[var(--navy-600)]">+{phase.checks.length - 3}项</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-6 text-xs text-[var(--navy-600)]">
                  数据流通安全治理 | 分类分级 | 匿名化 | 隐私计算 | 跨境合规
                </div>
              </motion.div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-6 py-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-[var(--gold-400)]'
                        : 'bg-gradient-to-br from-green-500 to-emerald-500'
                    }`}>
                      {msg.role === 'user' ? <User size={16} className="text-[var(--navy-900)]" /> : <Bot size={16} className="text-white" />}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block px-4 py-3 rounded-xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[var(--gold-400)] text-[var(--navy-900)] rounded-tr-sm'
                            : 'border border-[var(--navy-700)] text-[var(--text-primary)] rounded-tl-sm'
                        }`}
                        style={msg.role === 'assistant' ? { background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' } : {}}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 prose-pre:my-2">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div className="text-xs text-[var(--navy-600)] mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 mb-6"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-xl rounded-tl-sm border border-[var(--navy-700)]" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Loader2 size={14} className="animate-spin text-[#22C55E]" />
                      正在审计分析...
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--navy-700)] px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              {hasMessages && (
                <button
                  onClick={clearChat}
                  className="p-2.5 rounded-lg border border-[var(--navy-700)] text-[var(--navy-600)] hover:text-red-400 hover:border-red-400/30 transition-colors flex-shrink-0"
                  title="清空对话"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入您的数据合规需求，例如：开展合规审计、制定分类分级方案、评估跨境合规风险..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--navy-700)] bg-[#0F172A] text-sm text-[var(--text-primary)] placeholder:text-[var(--navy-600)] focus:outline-none focus:border-[#22C55E] resize-none transition-colors"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = '44px'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'var(--navy-700)',
                  color: 'white',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--navy-600)]">
              <span>Enter 发送，Shift+Enter 换行</span>
              <span>数据流通安全治理 | 五大任务 | 2027目标</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}