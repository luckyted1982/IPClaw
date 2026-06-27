import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, TrendingUp, Calculator, ArrowLeftRight, Building2, Landmark, PiggyBank, BarChart3, LineChart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const EXAMPLE_QUERIES = [
  "我们的电商用户数据大概值多少钱？能帮我做个估值吗？",
  "数据资产如何在交易所挂牌交易？需要满足什么条件？",
  "数据资产可以做抵押融资吗？具体怎么操作？",
  "不同行业的数据应用场景有哪些？数据能带来什么样的商业价值？",
]

const CAPABILITIES = [
  { icon: Calculator, label: '价值评估', description: '四大评估方法', color: '#F59E0B' },
  { icon: TrendingUp, label: '定价策略', description: '市场定价模式', color: '#22C55E' },
  { icon: ArrowLeftRight, label: '交易撮合', description: '四大数交所', color: '#06B6D4' },
  { icon: PiggyBank, label: '金融创新', description: '质押/保险/ABS', color: '#8B5CF6' },
  { icon: Building2, label: 'CDO建设', description: '数据官制度', color: '#EF4444' },
]

const MARKET_OVERVIEW = [
  {
    exchange: '深圳数据交易所',
    location: '深圳',
    volume: '¥55亿',
    highlight: '金融数据活跃',
    color: '#06B6D4',
    url: 'https://www.szdex.com',
  },
  {
    exchange: '上海数据交易所',
    location: '上海',
    volume: '¥35亿',
    highlight: '数商生态完善',
    color: '#8B5CF6',
    url: 'https://www.chinadep.com',
  },
  {
    exchange: '广州数据交易所',
    location: '广州',
    volume: '¥30亿',
    highlight: '粤港澳大湾区',
    color: '#22C55E',
    url: 'https://www.gzdde.com',
  },
  {
    exchange: '北京国际大数据交易所',
    location: '北京',
    volume: '¥20亿',
    highlight: '国有控股公信力',
    color: '#F59E0B',
    url: 'https://www.bjdex.com',
  },
]

const VALUATION_METHODS = [
  {
    method: '成本法',
    formula: 'V = C × (1-d) × α',
    bestFor: '新资产、无市场参照',
    icon: Calculator,
    color: '#F59E0B',
  },
  {
    method: '收益法',
    formula: 'V = Σ(Ft / (1+r)^t)',
    bestFor: '有稳定盈利模式',
    icon: LineChart,
    color: '#22C55E',
  },
  {
    method: '市场法',
    formula: 'V = P × α × β × γ',
    bestFor: '有活跃交易案例',
    icon: BarChart3,
    color: '#06B6D4',
  },
  {
    method: '实物期权法',
    formula: 'BS期权定价模型',
    bestFor: '战略性投资决策',
    icon: Landmark,
    color: '#8B5CF6',
  },
]

export default function DataIPTrading() {
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

      const response = await fetch('/api/dataip-trading-agent', {
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
            <span className="text-[var(--text-primary)] font-medium">数据估值交易</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              <TrendingUp size={12} />
              市场规模破万亿
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
                  <TrendingUp size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  数据估值交易
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  面向全国统一数据大市场，提供数据资产价值评估、产品定价、交易平台对接、金融创新（质押融资/保险/证券化）、行业场景应用等一站式服务
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

                {/* Market Overview & Valuation Methods */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 w-full"
                >
                  <div className="grid grid-cols-2 gap-6">
                    {/* Major Exchanges */}
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 text-left">
                        主要数据交易所
                      </h3>
                      <div className="space-y-2">
                        {MARKET_OVERVIEW.map((exchange, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl border border-[var(--navy-700)]"
                            style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-8 rounded-full" style={{ background: exchange.color }} />
                              <div>
                                <div className="text-xs font-medium text-[var(--text-primary)]">{exchange.exchange}</div>
                                <div className="text-[10px] text-[var(--navy-600)]">{exchange.highlight}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-[var(--gold-400)]">{exchange.volume}</div>
                              <div className="text-[10px] text-[var(--navy-600)]">{exchange.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Valuation Methods */}
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 text-left">
                        四大评估方法
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {VALUATION_METHODS.map((method, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl border border-[var(--navy-700)]"
                            style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <method.icon size={12} style={{ color: method.color }} />
                              <span className="text-xs font-medium text-[var(--text-primary)]">{method.method}</span>
                            </div>
                            <div className="text-[10px] text-[var(--gold-400)] font-mono mb-1">{method.formula}</div>
                            <div className="text-[10px] text-[var(--navy-600)]">{method.bestFor}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-6 text-xs text-[var(--navy-600)]">
                  成本法 | 收益法 | 市场法 | 实物期权法 | 数据质押融资 | CDO制度
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
                      正在估值分析...
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
                  placeholder="输入您的数据估值或交易需求，例如：评估数据资产价值、了解交易流程、探索融资方案..."
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
              <span>成本法 | 收益法 | 市场法 | 数据金融创新</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}