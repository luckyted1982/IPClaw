import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, Key, ShieldCheck, AlertTriangle, FileText, Scale, ExternalLink, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import type { ModuleType } from '../components/RightPanel'
import ReactMarkdown from 'react-markdown'
import TradeSecretWizard from '@/components/TradeSecretWizard'

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: any[]
  toolResults?: any[]
  timestamp: Date
}

const EXAMPLE_QUERIES = [
  "帮我评估公司核心算法源代码是否构成商业秘密，应该定为什么密级",
  "我们公司的客户名单和定价策略需要做商业秘密识别定密分析",
  "生物医药企业的研发配方和实验数据如何进行密级划分",
  "新产品的设计图纸和技术参数是否符合商业秘密三要件认定标准",
]

const CAPABILITIES = [
  { icon: Key, label: '三要件认定', description: '秘密性、价值性、保密措施', color: '#F59E0B' },
  { icon: ShieldCheck, label: '密级划分', description: '绝密/机密/秘密/内部公开', color: '#EF4444' },
  { icon: FileText, label: '定密报告', description: '结构化输出完整报告', color: '#22C55E' },
  { icon: AlertTriangle, label: '风险评估', description: '泄露后果预判与建议', color: '#8B5CF6' },
  { icon: Scale, label: '法律依据', description: '反法第9条、总局令第126号', color: '#3B82F6' },
]

const LEGAL_BASIS = [
  {
    category: '核心法律法规',
    color: '#F59E0B',
    items: [
      { name: '《反不正当竞争法》第9条（2025修订版）', desc: '商业秘密定义及侵权行为类型' },
      { name: '《商业秘密保护规定》（总局令第126号）', desc: '2026年施行，最新保护规范' },
      { name: '法释〔2020〕7号', desc: '最高法审理侵犯商业秘密民事案件规定' },
    ]
  },
  {
    category: '行业指引参考',
    color: '#22C55E',
    items: [
      { name: '深圳市《生物医药产业商业秘密保护工作指引》', desc: '生物医药行业专项保护指南' },
      { name: '深圳市《低空经济产业商业秘密保护工作指引》', desc: '低空经济产业专项保护指南（2025.12版）' },
      { name: 'GB/T 27935《商业秘密管理指南》', desc: '国家标准管理框架' },
    ]
  },
]

export default function TradeSecretIdentification() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
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

      const response = await fetch('/api/trade-secret-identification-agent', {
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
    <Layout rightPanelModule="trade-secret">
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--navy-700)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/')}>首页</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/trade-secret')}>商业秘密</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--text-primary)] font-medium">识别定密</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
              style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              onClick={() => setWizardOpen(true)}
            >
              <PlusCircle size={14} />
              新建商业秘密
            </button>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              三要件认定
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
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                  <Key size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  商业秘密识别定密
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  基于《反不正当竞争法》第9条及总局令第126号标准，提供商业秘密三要件认定、密级划分、定密流程全流程服务
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
                      className="text-left p-3.5 rounded-xl border border-[var(--navy-700)] text-sm text-[var(--text-secondary)] hover:border-[#F59E0B] hover:text-[var(--text-primary)] transition-all duration-200 hover:bg-[rgba(245,158,11,0.03)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                    >
                      <Sparkles size={14} className="text-[#F59E0B] mb-1.5" />
                      {query}
                    </motion.button>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-xs text-[var(--navy-600)]">
                  《反不正当竞争法》第9条 | 总局令第126号 | 法释〔2020〕7号 | 四级密级体系
                </div>

                {/* Legal Basis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 w-full"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 text-left">
                    法律依据与行业指引
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {LEGAL_BASIS.map((category, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-[var(--navy-700)]"
                        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: category.color }}></div>
                          <span className="text-xs font-medium text-[var(--text-primary)]">{category.category}</span>
                        </div>
                        <div className="space-y-2">
                          {category.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <ExternalLink size={12} className="text-[var(--gold-400)] flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs text-[var(--gold-400)]">{item.name}</span>
                                <p className="text-xs text-[var(--navy-600)] mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
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
                        : 'bg-gradient-to-br from-amber-500 to-orange-500'
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-500">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-xl rounded-tl-sm border border-[var(--navy-700)]" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Loader2 size={14} className="animate-spin text-[#F59E0B]" />
                      正在分析识别...
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
                  placeholder="输入您的商业秘密识别定密需求，例如：评估某信息是否构成商业秘密、确定密级..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--navy-700)] bg-[#0F172A] text-sm text-[var(--text-primary)] placeholder:text-[var(--navy-600)] focus:outline-none focus:border-[#F59E0B] resize-none transition-colors"
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
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'var(--navy-700)',
                  color: 'white',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--navy-600)]">
              <span>Enter 发送，Shift+Enter 换行</span>
              <span>三要件认定 | 四级密级 | 定密流程</span>
            </div>
          </div>
        </div>
      </div>
      <TradeSecretWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </Layout>
  )
}