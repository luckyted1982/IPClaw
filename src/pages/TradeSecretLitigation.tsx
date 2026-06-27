import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, Scale, Gavel, Building, Calculator, ShieldCheck, Trophy, ExternalLink } from 'lucide-react'
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
  "我的商业秘密被前员工侵权了，应该选择行政、民事还是刑事途径维权？",
  "商业秘密侵权案件的损害赔偿怎么计算？惩罚性赔偿如何主张？",
  "对方抗辩说是自主研发的，我该如何应对？举证责任怎么分配？",
  "商业秘密民事诉讼的完整流程是什么？如何申请诉前证据保全？",
]

const CAPABILITIES = [
  { icon: Scale, label: '三轨维权', description: '行政/民事/刑事路径选择', color: '#F59E0B' },
  { icon: Gavel, label: '诉讼策略', description: '管辖/临时措施/专家证人', color: '#EF4444' },
  { icon: Calculator, label: '赔偿计算', description: '四种方式含惩罚性赔偿1-5倍', color: '#22C55E' },
  { icon: ShieldCheck, label: '举证指导', description: '四位一体证据组织', color: '#3B82F6' },
  { icon: Trophy, label: '抗辩应对', description: '自主研发/反向工程等', color: '#8B5CF6' },
]

const LITIGATION_PATHS = [
  {
    category: '三轨维权路径对比',
    color: '#F59E0B',
    items: [
      { name: '🏛️ 行政途径', desc: '市场监管局查处 · 罚款10万-500万 · 程序快成本低' },
      { name: '⚖️ 民事途径', desc: '法院诉讼 · 赔偿+惩罚性赔偿1-5倍 · 可获全面赔偿' },
      { name: '👮‍♂️ 刑事途径', desc: '公安立案 · 侵犯商业秘密罪 · 最高10年有期徒刑' },
    ]
  },
  {
    category: '高额判例参考',
    color: '#F59E0B',
    items: [
      { name: '💰 "离心压缩机案"', desc: '判赔1.66亿元（含惩罚性赔偿）' },
      { name: '💰 "香兰素案"', desc: '判赔1.59亿元（史上最高之一）' },
      { name: '🌏 "天然蛋白粉"案', desc: '跨境保护成功案例' },
      { name: '✨ 惩罚性赔偿亮点', desc: '故意+情节严重 → 基数×1-5倍' },
    ]
  },
]

export default function TradeSecretLitigation() {
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

      const response = await fetch('/api/trade-secret-litigation-agent', {
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
            <span className="text-[var(--text-primary)] font-medium">诉讼支持</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              刑法第219条
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
                  <Scale size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  诉讼支持
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  基于《刑法》第219条、《反不正当竞争法》第21条及法释〔2020〕7号，提供三轨维权路径规划、诉讼策略制定、损害赔偿计算、抗辩应对全流程法律服务
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
                  《刑法》第219条 | 反不正当竞争法第21条 | 惩罚性赔偿1-5倍 | 典型判例
                </div>

                {/* Litigation Paths */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 w-full"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 text-left">
                    维权路径与典型案例
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {LITIGATION_PATHS.map((category, i) => (
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
                      正在分析策略...
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
                  placeholder="输入您的诉讼支持需求，例如：维权路径选择、诉讼策略咨询、赔偿计算..."
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
              <span>三轨维权 | 惩罚性赔偿 | 抗辩应对</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}