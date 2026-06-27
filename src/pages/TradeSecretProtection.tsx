import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, ShieldCheck, Lock, Users, Building, Server, Globe, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: any[]
  toolResults?: any[]
  timestamp: Date
}

const EXAMPLE_QUERIES = [
  "帮我制定一套完整的商业秘密保护体系建设方案，我们是200人规模的软件公司",
  "制造业企业如何建立符合ISO 27001标准的商业秘密管理体系",
  "远程办公场景下的商业秘密防护措施有哪些？需要哪些技术工具支持",
  "请帮我规划商业秘密泄密应急预案和响应流程",
]

const CAPABILITIES = [
  { icon: ShieldCheck, label: '六维保护', description: '组织/制度/人员/物理/技术/合作', color: '#F59E0B' },
  { icon: Lock, label: 'ISO 27001', description: '信息安全管理体系落地', color: '#22C55E' },
  { icon: Building, label: '制度建设', description: '12项核心制度模板', color: '#3B82F6' },
  { icon: Server, label: '技术防护', description: 'DLP/加密/审计/水印', color: '#EF4444' },
  { icon: Users, label: '人员管理', description: '入职/在职/离职全周期', color: '#8B5CF6' },
]

const PROTECTION_FRAMEWORK = [
  {
    category: '六维度保护体系',
    icon: ShieldCheck,
    color: '#F59E0B',
    items: [
      { name: '组织保障', desc: 'CISO/保密委员会/专职人员配置' },
      { name: '制度建设', desc: '12项必备制度/NDA/竞业协议模板' },
      { name: '人员管理', desc: '背调培训/权限审查/离职管控' },
      { name: '物理安全', desc: '门禁分级/区域隔离/载体管控' },
      { name: '技术防护', desc: 'DLP防泄密/加密存储/行为审计' },
      { name: '合作伙伴', desc: 'NDA签署/供应商分级/审计监督' },
    ]
  },
  {
    category: '"三位一体"维权特色',
    icon: Scale,
    color: '#EF4444',
    items: [
      { name: '🏛️ 行政途径', desc: '市场监管部门查处·罚款10万-500万' },
      { name: '⚖️ 民事途径', desc: '法院诉讼·赔偿+惩罚性赔偿1-5倍' },
      { name: '👮‍♂️ 刑事途径', desc: '公安立案·侵犯商业秘密罪·最高10年' },
    ]
  },
]

function Scale(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
      <path d="M7 21h10"/>
      <path d="M12 3v18"/>
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    </svg>
  )
}

export default function TradeSecretProtection() {
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

      const response = await fetch('/api/trade-secret-protection-agent', {
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
            <span className="text-[var(--text-primary)] font-medium">保护体系建设</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              ISO 27001 + GB/T 27935
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
                  <ShieldCheck size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  保护体系建设
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  基于ISO 27001信息安全管理体系与GB/T 27935商业秘密管理指南，提供六维度保护体系建设、应急预案编制、认证准备指引
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
                  ISO 27001 | GB/T 27935 | 六维保护体系 | 应急预案
                </div>

                {/* Protection Framework */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 w-full"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 text-left">
                    保护体系框架
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {PROTECTION_FRAMEWORK.map((framework, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-[var(--navy-700)]"
                        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${framework.color}15` }}>
                            <framework.icon size={14} style={{ color: framework.color }} />
                          </div>
                          <span className="text-xs font-medium text-[var(--text-primary)]">{framework.category}</span>
                        </div>
                        <div className="space-y-2">
                          {framework.items.map((item, j) => (
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
                      正在生成方案...
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
                  placeholder="输入您的保护体系建设需求，例如：制定保密制度、规划技术防护方案、设计应急预案..."
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
              <span>六维保护 | ISO 27001 | 应急预案</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}