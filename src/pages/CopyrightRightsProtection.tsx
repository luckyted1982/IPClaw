import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, Shield, Gavel, Scale, FileWarning, ExternalLink, Building } from 'lucide-react'
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
  "我在淘宝发现有人卖盗版产品，如何取证和维权？",
  "我的文章被公众号抄袭了，能索赔多少钱？需要准备什么证据？",
  "对方恶意侵权情节严重，能否追究刑事责任？立案标准是什么？",
  "软件著作权被侵权，是走行政举报还是直接起诉？哪个更快？",
]

const CAPABILITIES = [
  { icon: Gavel, label: '法律定性', description: '侵权行为认定', color: '#A855F7' },
  { icon: Scale, label: '赔偿计算', description: '四维赔偿模型', color: '#EC4899' },
  { icon: Shield, label: '证据固定', description: '公证/区块链存证', color: '#8B5CF6' },
  { icon: FileWarning, label: '双轨保护', description: '行政+司法并行', color: '#6366F1' },
  { icon: Building, label: '刑事追责', description: '入罪标准分析', color: '#A855F7' },
]

const RIGHTS_CHANNELS = [
  {
    category: '行政举报途径',
    icon: Building,
    color: '#A855F7',
    items: [
      { name: '全国12315平台', url: 'https://www.12315.cn', desc: '市场监管综合举报入口' },
      { name: '国家版权局举报', url: '', desc: '版权领域专业执法' },
      { name: '各地文化执法大队', url: '', desc: '一线行政执法力量' },
    ]
  },
  {
    category: '司法诉讼途径',
    icon: Gavel,
    color: '#8B5CF6',
    items: [
      { name: '互联网法院', url: '', desc: '杭州/北京/广州互联网法院，全程线上' },
      { name: '知识产权法院', url: '', desc: '北上广成武汉等专门法院' },
      { name: '最高人民法院知产法庭', url: '', desc: '上诉/再审案件审理' },
    ]
  },
  {
    category: '证据服务平台',
    icon: Shield,
    color: '#6366F1',
    items: [
      { name: '公证处线上公证', url: '', desc: '网页/购买/现场公证（约3000-5000元）' },
      { name: '可信时间戳服务', url: '', desc: '电子证据固化（约10元/次）' },
      { name: '司法区块链存证', url: '', desc: '不可篡改的电子证据（按次收费）' },
    ]
  },
]

export default function CopyrightRightsProtection() {
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

      const response = await fetch('/api/copyright-rights-agent', {
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
    <Layout rightPanelModule="copyright">
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--navy-700)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/')}>首页</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/copyright')}>版权业务</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--text-primary)] font-medium">版权维权</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />
              25万+年民事案件
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
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A855F7, #EF4444)' }}>
                  <Shield size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  版权维权
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-8">
                  基于《著作权法》第53-61条、《刑法》第217条，提供双轨保护路径选择、证据收集方案、损害赔偿计算及刑事报案指引
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
                      className="text-left p-3.5 rounded-xl border border-[var(--navy-700)] text-sm text-[var(--text-secondary)] hover:border-[#A855F7] hover:text-[var(--text-primary)] transition-all duration-200 hover:bg-[rgba(168,85,247,0.03)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                    >
                      <Sparkles size={14} className="text-[#A855F7] mb-1.5" />
                      {query}
                    </motion.button>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-xs text-[var(--navy-600)]">
                  著作权法第53-61条 | 刑法第217条 | 双轨保护机制
                </div>

                {/* Rights Channels */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="mt-8 w-full"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 text-left">
                    维权途径一览
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {RIGHTS_CHANNELS.map((channel, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-[var(--navy-700)]"
                        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${channel.color}15` }}>
                            <channel.icon size={14} style={{ color: channel.color }} />
                          </div>
                          <span className="text-xs font-medium text-[var(--text-primary)]">{channel.category}</span>
                        </div>
                        <div className="space-y-2">
                          {channel.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2 group">
                              {item.url ? (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-[var(--gold-400)] hover:underline flex-shrink-0"
                                >
                                  {item.name}
                                  <ExternalLink size={10} className="opacity-50 group-hover:opacity-100" />
                                </a>
                              ) : (
                                <span className="text-xs text-[var(--gold-400)] flex-shrink-0">{item.name}</span>
                              )}
                              <span className="text-xs text-[var(--navy-600)] leading-relaxed">{item.desc}</span>
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
                        : 'bg-gradient-to-br from-purple-500 to-red-500'
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-red-500">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-xl rounded-tl-sm border border-[var(--navy-700)]" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Loader2 size={14} className="animate-spin text-[#A855F7]" />
                      正在分析维权方案...
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
                  placeholder="输入您的版权维权需求，例如：分析侵权行为、制定维权策略、计算赔偿金额..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--navy-700)] bg-[#0F172A] text-sm text-[var(--text-primary)] placeholder:text-[var(--navy-600)] focus:outline-none focus:border-[#A855F7] resize-none transition-colors"
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
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #A855F7, #EF4444)' : 'var(--navy-700)',
                  color: 'white',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--navy-600)]">
              <span>Enter 发送，Shift+Enter 换行</span>
              <span>双轨保护 | 惩罚性赔偿 | 刑事追责</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}