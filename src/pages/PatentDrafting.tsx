import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Send, Loader2, Bot, User, Sparkles, Trash2, FileText, Search, Scale, PenTool, MessageSquare, Wand2, Upload, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import type { ModuleType } from '../components/RightPanel'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type WorkflowStep = 'chat' | 'input' | 'tech-field' | 'background' | 'core-tech' | 'embodiment' | 'claims' | 'review'

const EXAMPLE_QUERIES = [
  '帮我挖掘"基于多模态大模型的智能客服系统"的专利点，并撰写权利要求书',
  '对"一种固态电池电解质材料及其制备方法"进行查新检索，分析新颖性和创造性',
  '请帮我撰写一份关于"无人机集群协同控制方法"的完整专利申请文件',
  '审查意见指出权利要求1缺乏创造性，对比文件是CN118658342A，请帮我分析并给出答复策略',
]

const CAPABILITIES = [
  { icon: PenTool, label: '专利挖掘', desc: '从技术方案中识别创新点', color: '#F59E0B' },
  { icon: Search, label: '查新检索', desc: 'PatSeek检索现有技术', color: '#3B82F6' },
  { icon: FileText, label: '文件撰写', desc: '权利要求书、说明书、摘要', color: '#8B5CF6' },
  { icon: Scale, label: '审查答复', desc: '分析审查意见与答复策略', color: '#22C55E' },
  { icon: MessageSquare, label: '迭代优化', desc: '多轮修改与完善', color: '#EC4899' },
]

const WORKFLOW_STEPS = [
  { id: 'input' as WorkflowStep, label: '文档输入', desc: '上传交底书或分步填写', icon: Upload },
  { id: 'tech-field' as WorkflowStep, label: '技术领域', desc: '三级领域划分', icon: BookOpen },
  { id: 'background' as WorkflowStep, label: '背景技术', desc: '现有技术分析与缺陷', icon: Search },
  { id: 'core-tech' as WorkflowStep, label: '核心方案', desc: '技术要素拆分与构建', icon: Wand2 },
  { id: 'embodiment' as WorkflowStep, label: '实施方式', desc: '替代方案与并列路线', icon: FileText },
  { id: 'claims' as WorkflowStep, label: '权利要求', desc: '漏斗式保护布局', icon: Scale },
  { id: 'review' as WorkflowStep, label: '质量审核', desc: '自检与优化', icon: CheckCircle },
]

export default function PatentDrafting() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'chat' | 'workflow'>('chat')
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input')
  const [workflowData, setWorkflowData] = useState<Record<string, string>>({})
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

      const response = await fetch('/api/patent-drafting-agent', {
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

  const handleWorkflowStep = (stepId: WorkflowStep) => {
    setCurrentStep(stepId)
    const stepLabels: Record<string, string> = {
      input: '文档输入与初始化',
      'tech-field': '技术要素采集',
      background: '背景技术增强',
      'core-tech': '核心技术方案构建',
      embodiment: '具体实施方式生成',
      claims: '权利要求书撰写',
      review: '知识整合与质量审核',
    }
    const prompt = `请进入【${stepLabels[stepId]}】模块。当前已收集的数据：${Object.entries(workflowData).map(([k, v]) => `${k}: ${v.substring(0, 50)}...`).join('; ') || '无'}。请引导我完成此步骤。`
    sendMessage(prompt)
  }

  const hasMessages = messages.length > 0

  return (
    <Layout rightPanelModule="patent">
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--navy-700)]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/')}>首页</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--navy-600)] cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/patent')}>专利业务</span>
            <ChevronRight size={14} className="text-[var(--navy-600)]" />
            <span className="text-[var(--text-primary)] font-medium">专利辅助撰写</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Mode Switch */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[var(--navy-700)] bg-[#0F172A]">
              <button
                onClick={() => setMode('chat')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'chat' ? 'bg-[var(--gold-400)] text-[var(--navy-900)]' : 'text-[var(--navy-600)] hover:text-[var(--text-primary)]'
                }`}
              >
                对话模式
              </button>
              <button
                onClick={() => setMode('workflow')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'workflow' ? 'bg-[var(--gold-400)] text-[var(--navy-900)]' : 'text-[var(--navy-600)] hover:text-[var(--text-primary)]'
                }`}
              >
                分步撰写
              </button>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              撰写引擎就绪
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl w-full text-center"
              >
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                  <PenTool size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  专利辅助撰写
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  基于《专利审查指南》（2023）规范，集成 PatSeek 检索，提供专利挖掘、查新、文件撰写、审查答复全流程服务
                </p>
                <p className="text-xs text-[var(--navy-600)] mb-6">
                  已整合中国专利奖获奖案例撰写模式与专利法实施细则（2023修订版）
                </p>

                {/* Workflow Steps (visible in workflow mode) */}
                {mode === 'workflow' && (
                  <div className="grid grid-cols-7 gap-2 mb-8">
                    {WORKFLOW_STEPS.map((step, i) => (
                      <motion.button
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        onClick={() => handleWorkflowStep(step.id)}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[var(--navy-700)] hover:border-[var(--gold-400)] transition-all cursor-pointer"
                        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                      >
                        <step.icon size={16} className="text-[var(--gold-400)]" />
                        <span className="text-[10px] font-medium text-[var(--text-primary)]">{step.label}</span>
                        <span className="text-[9px] text-[var(--navy-600)] text-center leading-tight">{step.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Capabilities */}
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {CAPABILITIES.map((cap, i) => (
                    <motion.div
                      key={cap.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--navy-700)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                    >
                      <cap.icon size={18} style={{ color: cap.color }} />
                      <span className="text-xs font-medium text-[var(--text-primary)]">{cap.label}</span>
                      <span className="text-[10px] text-[var(--navy-600)] text-center leading-tight">{cap.desc}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Example Queries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {EXAMPLE_QUERIES.map((query, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      onClick={() => sendMessage(query)}
                      className="text-left p-3.5 rounded-xl border border-[var(--navy-700)] text-sm text-[var(--text-secondary)] hover:border-[var(--gold-400)] hover:text-[var(--text-primary)] transition-all duration-200 hover:bg-[rgba(250,204,21,0.03)]"
                      style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                    >
                      <Sparkles size={14} className="text-[var(--gold-400)] mb-1.5" />
                      {query}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6">
              {/* Workflow Progress Bar */}
              {mode === 'workflow' && (
                <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                  {WORKFLOW_STEPS.map((step, i) => (
                    <button
                      key={step.id}
                      onClick={() => handleWorkflowStep(step.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                        currentStep === step.id
                          ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)]'
                          : 'bg-[#1E293B] text-[var(--navy-600)] border border-[var(--navy-700)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <step.icon size={12} />
                      {step.label}
                      {i < WORKFLOW_STEPS.length - 1 && <ArrowRight size={10} className="ml-1" />}
                    </button>
                  ))}
                </div>
              )}

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
                        : 'bg-gradient-to-br from-amber-500 to-red-500'
                    }`}>
                      {msg.role === 'user' ? <User size={16} className="text-[var(--navy-900)]" /> : <Bot size={16} className="text-white" />}
                    </div>
                    <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block px-4 py-3 rounded-xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[var(--gold-400)] text-[var(--navy-900)] rounded-tr-sm'
                            : 'border border-[var(--navy-700)] text-[var(--text-primary)] rounded-tl-sm'
                        }`}
                        style={msg.role === 'assistant' ? { background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' } : {}}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 prose-pre:my-2 prose-table:text-xs">
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-500 to-red-500">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-xl rounded-tl-sm border border-[var(--navy-700)]" style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Loader2 size={14} className="animate-spin text-[#F59E0B]" />
                      正在进行专利撰写分析...
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
                  placeholder={mode === 'workflow' ? '按当前步骤要求输入内容，或点击上方步骤切换...' : '描述您的技术方案或撰写需求，例如：帮我撰写一份关于XXX的专利申请文件...'}
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
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : 'var(--navy-700)',
                  color: 'white',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--navy-600)]">
              <span>Enter 发送，Shift+Enter 换行</span>
              <span>遵循《专利审查指南》2023 规范 | 整合专利奖案例模式</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}