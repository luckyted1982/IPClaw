import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, Calculator, Clock, ShieldCheck, TrendingDown, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const EXAMPLE_QUERIES = [
  '帮我计算一件2023年5月1日申请的发明专利，授权后第3年的年费是多少？如果符合费减条件呢？',
  '我司有10件专利需要管理，请帮我制定年度年费预算和缴纳计划',
  '有一件专利逾期3个月未缴年费，请问滞纳金怎么算？还能恢复权利吗？',
  '分析我司专利组合的年费支出，给出维持/放弃/许可的建议',
]

const CAPABILITIES = [
  { icon: Calculator, label: '费用计算', desc: '精确计算年费/滞纳金/恢复费', color: '#F59E0B' },
  { icon: Clock, label: '期限管理', desc: '缴费期/宽限期/恢复期', color: '#3B82F6' },
  { icon: ShieldCheck, label: '减免政策', desc: '85%减缴+开放许可优惠', color: '#22C55E' },
  { icon: TrendingDown, label: '成本优化', desc: '价值评估+放弃策略', color: '#8B5CF6' },
  { icon: AlertCircle, label: '风险预警', desc: '逾期提醒+权利恢复', color: '#EF4444' },
]

export default function PatentFeeManagement() {
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

    const userMessage: Message = { role: 'user', content: content.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const conversationHistory = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
      const response = await fetch('/api/patent-fee-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || '请求失败')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content || '抱歉，未获取到响应内容', timestamp: new Date() }])
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `请求出错：${error.message || '未知错误'}。`, timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const clearChat = () => { setMessages([]); inputRef.current?.focus() }
  const hasMessages = messages.length > 0

  return (
    <Layout rightPanelModule="patent">
      <div className="flex flex-col h-[calc(100vh-56px)]">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--navy-700)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/')}>首页</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/patent')}>专利业务</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--text-primary)] font-medium">年费管理</span>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" /> 国知局2025标准
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl w-full text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #22C55E)' }}>
                  <Calculator size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">专利年费管理</h1>
                <p className="text-sm text-[var(--text-secondary)] mb-2">基于国知局2025最新收费标准，提供年费计算、减免政策、缴纳规划、成本优化全流程服务</p>
                <p className="text-xs text-[var(--navy-600)] mb-6">涵盖发明专利(20年)、实用新型(10年)、外观设计(15年)全部费用类型与减免政策</p>

                <div className="grid grid-cols-5 gap-3 mb-8">
                  {CAPABILITIES.map((cap, i) => (
                    <motion.div key={cap.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--navy-700)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                      <cap.icon size={18} style={{ color: cap.color }} />
                      <span className="text-xs font-medium text-[var(--text-primary)]">{cap.label}</span>
                      <span className="text-[10px] text-[var(--navy-600)] text-center leading-tight">{cap.desc}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {EXAMPLE_QUERIES.map((query, i) => (
                    <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                      onClick={() => sendMessage(query)}
                      className="text-left p-3.5 rounded-xl border border-[var(--navy-700)] text-sm text-[var(--text-secondary)] hover:border-[var(--gold-400)] hover:text-[var(--text-primary)] transition-all duration-200 hover:bg-[rgba(250,204,21,0.03)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                      <Sparkles size={14} className="text-[var(--gold-400)] mb-1.5" />{query}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex gap-3 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[var(--gold-400)]' : 'bg-gradient-to-br from-amber-500 to-green-500'}`}>
                      {msg.role === 'user' ? <User size={16} className="text-[var(--navy-900)]" /> : <Bot size={16} className="text-white" />}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[var(--gold-400)] text-[var(--navy-900)] rounded-tr-sm' : 'border border-[var(--navy-700)] text-[var(--text-primary)] rounded-tl-sm'}`}
                        style={msg.role === 'assistant' ? { background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' } : {}}>
                        {msg.role === 'assistant' ? <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 prose-pre:my-2 prose-table:text-xs"><ReactMarkdown>{msg.content}</ReactMarkdown></div> : msg.content}
                      </div>
                      <div className="text-xs text-[var(--navy-600)] mt-1 px-1">{msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-500 to-green-500"><Bot size={16} className="text-white" /></div>
                  <div className="px-4 py-3 rounded-xl rounded-tl-sm border border-[var(--navy-700)]" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Loader2 size={14} className="animate-spin text-[#F59E0B]" />正在计算分析...</div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-[var(--navy-700)] px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3">
              {hasMessages && <button onClick={clearChat} className="p-2.5 rounded-lg border border-[var(--navy-700)] text-[var(--navy-600)] hover:text-red-400 hover:border-red-400/30 transition-colors flex-shrink-0" title="清空对话"><Trash2 size={16} /></button>}
              <div className="flex-1 relative">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="输入您的年费管理需求，例如：计算某件专利的年费、查询减免政策、制定缴费计划..."
                  rows={1} className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--navy-700)] bg-[#0F172A] text-sm text-[var(--text-primary)] placeholder:text-[var(--navy-600)] focus:outline-none focus:border-[#F59E0B] resize-none transition-colors"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = '44px'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }} />
              </div>
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} className="p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #F59E0B, #22C55E)' : 'var(--navy-700)', color: 'white' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--navy-600)]">
              <span>Enter 发送，Shift+Enter 换行</span>
              <span>国知局2025标准 | 财税2024年73号 | 第294号公告</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}