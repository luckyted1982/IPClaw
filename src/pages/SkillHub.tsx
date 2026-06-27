import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Check, Star, CheckCircle, User, X, PenTool, ShieldCheck, Shield,
  BarChart3, Eye, Maximize2, Compass, Languages, MessageSquareReply, Palette,
  CalendarClock, Send, Bot, Sparkles, Zap, Globe, FileText, Scale, Lock,
  TrendingUp, Target, Layers, Database, Cpu, Wrench, BookOpen, Lightbulb,
  ArrowRight, Filter, Grid3X3, Package, Building2, Award, Clock,
  AlertTriangle, ChevronDown, Plus, Minus, RefreshCw, Copy, ThumbsUp,
  ThumbsDown, Share2, Download, ExternalLink, Play, Pause, Settings,
  HelpCircle, Info, Wand2,
} from 'lucide-react'
import Layout from '../components/Layout'
import type { ModuleType } from '../components/RightPanel'
import SkillCreator from '../components/SkillCreator'

// ─── Types ───────────────────────────────────────────────

interface SkillOwner {
  name: string
  title: string
  initials: string
  avatarColor: string
  verified: boolean
}

interface Skill {
  id: string
  name: string
  category: string
  description: string
  installs: number
  installed: boolean
  rating: number
  reviews: number
  owner: SkillOwner
  icon: string
  featured?: boolean
  topRated?: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// ─── Data ────────────────────────────────────────────────

const categories = ['全部', '专利', '商标', '版权', '合规风控', '估值分析', '翻译通用', '好评优先', '认证专家']

const skills: Skill[] = [
  // === 专利类 (10项) ===
  { id: '1', name: 'PatSeek 专利检索', category: '专利', description: '专业级专利检索工具，支持简单检索、布尔检索、语义检索三种模式，覆盖全球1.8亿专利数据，智能分析新颖性与创造性', installs: 3847, installed: true, rating: 4.9, reviews: 3200, owner: { name: 'PatSeek官方', title: '官方团队', initials: 'P', avatarColor: '#3B82F6', verified: true }, icon: 'search', featured: true },
  { id: '2', name: 'Eureka 查新检索', category: '专利', description: '智慧芽AI Agent，一键输出专家级精度查新报告，可解释新颖性评述，[公开/公知/未公开]三级判断，节省80%检索时间', installs: 5200, installed: false, rating: 4.9, reviews: 4100, owner: { name: '智慧芽', title: 'PatSnap', initials: '智', avatarColor: '#10B981', verified: true }, icon: 'target', topRated: true },
  { id: '3', name: 'Eureka FTO防侵权检索', category: '专利', description: '15-30分钟输出FTO报告，AI技术特征拆解，贝叶斯算法迭代优化，查全率97%远超通用大模型', installs: 3100, installed: false, rating: 4.8, reviews: 2800, owner: { name: '智慧芽', title: 'PatSnap', initials: '智', avatarColor: '#10B981', verified: true }, icon: 'shield' },
  { id: '4', name: 'Eureka 外观防侵权', category: '专利', description: '基于商品图片执行全球范围图片相似性搜索，10分钟内生成结构化防侵权分析报告', installs: 1800, installed: false, rating: 4.7, reviews: 1500, owner: { name: '智慧芽', title: 'PatSnap', initials: '智', avatarColor: '#10B981', verified: true }, icon: 'eye' },
  { id: '5', name: 'Eureka 专利撰写', category: '专利', description: '基于交底书智能生成权利要求书+说明书，一致性检查+核稿功能，符合受理局格式标准', installs: 2900, installed: false, rating: 4.8, reviews: 2400, owner: { name: '智慧芽', title: 'PatSnap', initials: '智', avatarColor: '#10B981', verified: true }, icon: 'pen-tool' },
  { id: '6', name: 'Prior Art Hunter', category: '专利', description: '深度语义检索全球专利数据库，相似度评分与侵权风险预警', installs: 1800, installed: false, rating: 4.7, reviews: 1800, owner: { name: '李博士', title: '清华大学', initials: '李', avatarColor: '#3B82F6', verified: true }, icon: 'search', topRated: true },
  { id: '7', name: 'Office Action Responder', category: '专利', description: '自动生成审查意见答复书，论点模板与法律条文引用', installs: 2800, installed: true, rating: 4.9, reviews: 2800, owner: { name: 'IPClaw官方', title: '官方团队', initials: 'I', avatarColor: '#FACC15', verified: true }, icon: 'message-square-reply' },
  { id: '8', name: 'Derip 智能撰写', category: '专利', description: '基于交底书生成完整专利申请文件，支持DeepSeek/Qwen3国产模型，效率提升300%', installs: 2100, installed: false, rating: 4.7, reviews: 1600, owner: { name: 'Derip', title: 'AI工具商', initials: 'D', avatarColor: '#8B5CF6', verified: true }, icon: 'cpu' },
  { id: '9', name: 'IP Copilot 多模态检索', category: '专利', description: '国内唯一国际IP服务大模型，1.99亿专利、0.54亿商标，支持对话/语义/图像检索，准确率99.9%', installs: 3500, installed: false, rating: 4.9, reviews: 3000, owner: { name: 'IP Copilot', title: '清华/建大/鹏城实验室', initials: 'I', avatarColor: '#EC4899', verified: true }, icon: 'globe', featured: true },
  { id: '10', name: 'Patent Annuity Manager', category: '专利', description: '全球专利年费期限追踪，自动提醒与续费管理', installs: 1500, installed: false, rating: 4.7, reviews: 1500, owner: { name: 'IPClaw官方', title: '官方团队', initials: 'I', avatarColor: '#FACC15', verified: true }, icon: 'calendar-clock' },

  // === 商标类 (6项) ===
  { id: '11', name: 'Trademark Clearance', category: '商标', description: '45类商标全面可用性检查，降低注册驳回风险', installs: 890, installed: false, rating: 4.6, reviews: 890, owner: { name: '陈律师', title: '金杜律所', initials: '陈', avatarColor: '#8B5CF6', verified: true }, icon: 'shield' },
  { id: '12', name: '睿观AI 商标检索', category: '商标', description: '跨境电商AI侵权检测平台，文本+图形双线检测，TRO维权词标+智能替换词，超1亿商标数据', installs: 12000, installed: false, rating: 4.8, reviews: 8500, owner: { name: '睿观AI', title: '三态股份(上市)', initials: '睿', avatarColor: '#F97316', verified: true }, icon: 'search', topRated: true },
  { id: '13', name: 'WIPO 图形相似度检索', category: '商标', description: '世界知识产权组织官方AI工具，上传图形在品牌数据库中找近似商标，维也纳分类自动建立', installs: 9500, installed: false, rating: 4.9, reviews: 7200, owner: { name: 'WIPO', title: '世界知识产权组织', initials: 'W', avatarColor: '#06B6D4', verified: true }, icon: 'eye', featured: true },
  { id: '14', name: '企驻云成功率预测', category: '商标', description: '基于海量历史数据AI预估商标注册成功率，按行业推荐智能分类，可视化驳回风险', installs: 2300, installed: false, rating: 4.6, reviews: 1900, owner: { name: '企驻云', title: '商标专利管家', initials: '企', avatarColor: '#14B8A6', verified: true }, icon: 'bar-chart-3' },
  { id: '15', name: 'Qthena 商标检索监测', category: '商标', description: 'Questel AI助手，商标检索+监测+审查意见答辩管理一体化', installs: 1900, installed: false, rating: 4.7, reviews: 1500, owner: { name: 'Questel', title: '全球IP服务商', initials: 'Q', avatarColor: '#6366F1', verified: true }, icon: 'compass' },
  { id: '16', name: '企驻云竞品监控', category: '商标', description: '高频自动化巡检竞品IP法律状态，侵权风险第一时间预警+行业技术动态追踪', installs: 1700, installed: false, rating: 4.5, reviews: 1300, owner: { name: '企驻云', title: '商标专利管家', initials: '企', avatarColor: '#14B8A6', verified: true }, icon: 'alert-triangle' },

  // === 版权类 (3项) ===
  { id: '17', name: 'Copyright Monitor 7×24', category: '版权', description: '全网文本、图片、视频侵权实时监测，多渠道预警通知', installs: 3300, installed: false, rating: 5.0, reviews: 3300, owner: { name: 'IPClaw官方', title: '官方团队', initials: 'I', avatarColor: '#FACC15', verified: true }, icon: 'eye', topRated: true },
  { id: '18', name: '睿观AI 版权检索', category: '版权', description: '多模态版权侵权检测（文本/图片/视频），6000万+版权数据库，5秒完成单次查询，准确率95%+', installs: 9800, installed: false, rating: 4.8, reviews: 7200, owner: { name: '睿观AI', title: '三态股份(上市)', initials: '睿', avatarColor: '#F97316', verified: true }, icon: 'shield-check' },
  { id: '19', name: 'AIGC 版权溯源', category: '版权', description: '动态溯源与事前嵌入，水印技术+智能合约实现AIGC内容版权保护全链路追踪', installs: 890, installed: false, rating: 4.4, reviews: 650, owner: { name: '行业新兴', title: 'AIGC保护', initials: 'A', avatarColor: '#EC4899', verified: false }, icon: 'layers' },

  // === 合规风控类 (5项) ===
  { id: '20', name: 'CNIPA 合规扫描', category: '合规风控', description: '12条规则一键扫描，国知局标准合规检测，详细违规报告自动生成', installs: 5100, installed: true, rating: 5.0, reviews: 5100, owner: { name: 'IPClaw官方', title: '官方团队', initials: 'I', avatarColor: '#FACC15', verified: true }, icon: 'shield-check', topRated: true },
  { id: '21', name: '睿观AI 综合检索', category: '合规风控', description: 'IP合规+平台规则+司法风险三维覆盖，2亿专利、1亿商标、6000万版权、亿级政策+千万TRO案例', installs: 15000, installed: false, rating: 4.9, reviews: 12000, owner: { name: '睿观AI', title: '三态股份(上市)', initials: '睿', avatarColor: '#F97316', verified: true }, icon: 'shield', featured: true },
  { id: '22', name: '悟空火眼守卫', category: '合规风控', description: '跨境电商图文IP侵权排查，文本+图片多模态检索，TRO案件预警+API批量检索', installs: 4200, installed: false, rating: 4.6, reviews: 3400, owner: { name: '悟空', title: '跨境电商合规', initials: '悟', avatarColor: '#F59E0B', verified: true }, icon: 'lock' },
  { id: '23', name: '"智小宝" IP保护', category: '合规风控', description: '常州IP局官方AI智能体，DeepSeek驱动、7×24h侵权监测/线索摸排/侵权判定', installs: 1600, installed: false, rating: 4.5, reviews: 1100, owner: { name: '常州知产局', title: '政府官方', initials: '常', avatarColor: '#EF4444', verified: true }, icon: 'bot' },
  { id: '24', name: 'TRO 风险预警', category: '合规风控', description: '基于千万级历史TRO判例的智能风险预测，提前规避美国法院临时限制令风险', installs: 2700, installed: false, rating: 4.6, reviews: 2100, owner: { name: '行业通用', title: '涉外IP服务', initials: 'T', avatarColor: '#DC2626', verified: false }, icon: 'alert-triangle' },

  // === 估值分析类 (3项) ===
  { id: '25', name: 'IP 估值大师', category: '估值分析', description: '技术+法律/市场三维度综合专利估值分析', installs: 1200, installed: false, rating: 4.8, reviews: 1200, owner: { name: '张评估师', title: '中评协', initials: '张', avatarColor: '#F59E0B', verified: true }, icon: 'bar-chart-3', topRated: true },
  { id: '26', name: 'IP 战略顾问', category: '估值分析', description: '战略级知识产权组合规划，竞争情报分析与布局建议', installs: 567, installed: false, rating: 4.9, reviews: 567, owner: { name: '赵博士', title: '哈佛MBA', initials: '赵', avatarColor: '#10B981', verified: true }, icon: 'compass', topRated: true },
  { id: '27', name: 'incoPat 全球分析', category: '估值分析', description: '合享智慧全球科技分析运营平台，AI+IP数据深度整合，全景分析热点预测', installs: 3800, installed: false, rating: 4.7, reviews: 2900, owner: { name: '合享智慧', title: 'incoPat', initials: '合', avatarColor: '#3B82F6', verified: true }, icon: 'database' },

  // === 翻译通用类 (4项) ===
  { id: '28', name: 'Patent Translation Pro', category: '翻译通用', description: '高精度中英专利文档互译，专业术语一致性保证', installs: 1100, installed: false, rating: 4.4, reviews: 1100, owner: { name: '孙翻译', title: '20年经验', initials: '孙', avatarColor: '#6366F1', verified: false }, icon: 'languages' },
  { id: '29', name: 'WIPO Translate', category: '翻译通用', description: '世界知识产权组织神经网络机器翻译，108种语言全覆盖', installs: 8900, installed: false, rating: 4.9, reviews: 7500, owner: { name: 'WIPO', title: '世界知识产权组织', initials: 'W', avatarColor: '#06B6D4', verified: true }, icon: 'globe', topRated: true },
  { id: '30', name: 'IP Copilot 全域翻译', category: '翻译通用', description: '联合清华大学研发、108种语言平均准确率96%，覆盖7大技术领域，SOTA级别', installs: 4100, installed: false, rating: 4.8, reviews: 3500, owner: { name: 'IP Copilot', title: '清华/建大/鹏城实验室', initials: 'I', avatarColor: '#EC4899', verified: true }, icon: 'languages' },
  { id: '31', name: 'Derip 工作流编排', category: '翻译通用', description: '自由编排LLM/条件分支/文档导出节点，构建专属AI工作流，支持REST API与iframe嵌入', installs: 1300, installed: false, rating: 4.6, reviews: 900, owner: { name: 'Derip', title: 'AI工具商', initials: 'D', avatarColor: '#8B5CF6', verified: true }, icon: 'wrench' },
]

const iconMap: Record<string, React.ReactNode> = {
  'pen-tool': <PenTool size={20} />,
  'shield-check': <ShieldCheck size={20} />,
  'search': <Search size={20} />,
  'shield': <Shield size={20} />,
  'bar-chart-3': <BarChart3 size={20} />,
  'eye': <Eye size={20} />,
  'maximize-2': <Maximize2 size={20} />,
  'compass': <Compass size={20} />,
  'languages': <Languages size={20} />,
  'message-square-reply': <MessageSquareReply size={20} />,
  'palette': <Palette size={20} />,
  'calendar-clock': <CalendarClock size={20} />,
  'target': <Target size={20} />,
  'cpu': <Cpu size={20} />,
  'globe': <Globe size={20} />,
  'alert-triangle': <AlertTriangle size={20} />,
  'lock': <Lock size={20} />,
  'bot': <Bot size={20} />,
  'database': <Database size={20} />,
  'wrench': <Wrench size={20} />,
  'layers': <Layers size={20} />,
}

const categoryColors: Record<string, string> = {
  '专利': '#3B82F6',
  '商标': '#8B5CF6',
  '版权': '#10B981',
  '合规风控': '#EF4444',
  '估值分析': '#F59E0B',
  '翻译通用': '#6366F1',
}

const quickPrompts = [
  '我是跨境电商卖家，需要侵权检测工具',
  '我们公司要做专利布局，有什么推荐？',
  '需要专利翻译工具，中英互译',
  '想了解商标注册前的可用性检查工具',
]

// ─── Sub-components ─────────────────────────────────────

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  const filled = Math.floor(rating)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < filled ? 'text-[var(--gold-400)] fill-[var(--gold-400)]' : 'text-[var(--navy-700)]'}
        />
      ))}
    </div>
  )
}

function OwnerRow({ owner }: { owner: SkillOwner }) {
  return (
    <div className="flex items-center gap-2 group/owner cursor-pointer">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[var(--navy-600)]"
        style={{ background: owner.avatarColor }}
      >
        {owner.initials}
      </div>
      <span className="text-xs text-[var(--text-secondary)] group-hover/owner:text-[var(--gold-400)] transition-colors">
        {owner.name}
      </span>
      <span className="text-[10px] text-[var(--text-muted)]">{owner.title}</span>
      {owner.verified && <CheckCircle size={12} className="text-[#3B82F6]" />}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────

export default function SkillHub() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [skillList, setSkillList] = useState(skills)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [creatorOpen, setCreatorOpen] = useState(false)

  // ─── AI Chat State ───
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'system', content: '你好！我是IPClaw技能市场AI顾问。告诉我你的需求，我来帮你找到最适合的IP工具。' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    setChatMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsStreaming(true)

    // Add placeholder for assistant response
    const assistantIndex = chatMessages.length + 1
    setChatMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/skill-market-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages.filter(m => m.role !== 'system'), userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('请求失败')
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
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulated += parsed.content
                setChatMessages(prev =>
                  prev.map((m, i) =>
                    i === assistantIndex ? { ...m, content: accumulated } : m
                  )
                )
              }
            } catch {
              // ignore parse errors for non-JSON SSE lines
            }
          }
        }
      }
    } catch {
      setChatMessages(prev =>
        prev.map((m, i) =>
          i === assistantIndex
            ? { ...m, content: '抱歉，连接服务器失败，请稍后重试。' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }, [chatMessages, isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  // ─── Filtering & Sorting ───
  const filteredSkills = skillList.filter((skill) => {
    let matchCategory = activeCategory === '全部' || skill.category === activeCategory
    if (activeCategory === '好评优先') matchCategory = true
    if (activeCategory === '认证专家') matchCategory = skill.owner.verified
    const matchSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.includes(searchQuery)
    return matchCategory && matchSearch
  })

  const sortedSkills =
    activeCategory === '好评优先'
      ? [...filteredSkills].sort((a, b) => b.rating - a.rating)
      : filteredSkills

  const topRatedSkills = skillList.filter(s => s.topRated).sort((a, b) => b.rating - a.rating)
  const featuredSkill = skillList.find(s => s.featured)

  const toggleInstall = (id: string) => {
    setSkillList(prev =>
      prev.map(s => (s.id === id ? { ...s, installed: !s.installed } : s))
    )
    if (selectedSkill?.id === id) {
      setSelectedSkill(prev => prev ? { ...prev, installed: !prev.installed } : null)
    }
  }

  return (
    <Layout rightPanelModule="skill-hub">
      <div className="p-8 relative">
        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-[var(--text-secondary)] hover:text-[var(--gold-400)] transition-colors"
          >
            首页
          </button>
          <ChevronDown size={14} className="rotate-[-90deg] text-[var(--text-muted)]" />
          <span className="text-white font-medium">技能市场</span>
        </nav>

        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">技能市场AI</h1>
            <p className="text-[var(--text-secondary)]">
              发现与部署专家级IP技能 · AI智能推荐 · 30+真实工具覆盖专利/商标/版权/合规/估值/翻译全场景
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreatorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                color: '#0F172A',
                boxShadow: '0 4px 16px rgba(250,204,21,0.25)',
              }}
            >
              <Wand2 size={16} />
              制作技能
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)' }}
            >
              <span className="text-[var(--gold-400)] text-xs font-semibold">
                {skillList.filter(s => s.installed).length}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">已安装技能</span>
            </div>
          </div>
        </div>

        {/* ─── Search ─── */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-[var(--radius-md)] text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-[var(--gold-400)] transition-colors"
            style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
          />
        </div>

        {/* ─── Categories ─── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                'px-4 py-2 rounded-full text-sm transition-all duration-200 ' +
                (activeCategory === cat
                  ? 'text-[var(--navy-900)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white border border-[var(--navy-700)]')
              }
              style={activeCategory === cat ? { background: 'var(--gold-400)' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── Featured Banner ─── */}
        {featuredSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 rounded-[var(--radius-lg)] border border-[rgba(250,204,21,0.2)] relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.06) 0%, var(--navy-800) 100%)' }}
          >
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-14 h-14 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(250,204,21,0.15)' }}
              >
                <PenTool size={28} className="text-[var(--gold-400)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(250,204,21,0.2)', color: 'var(--gold-400)' }}
                  >
                    编辑推荐
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{featuredSkill.name} ‒ 编辑精选</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{featuredSkill.description}</p>
                <OwnerRow owner={featuredSkill.owner} />
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-[var(--text-muted)]">{featuredSkill.installs.toLocaleString()} users</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--gold-400)]">
                    <Star size={12} className="fill-[var(--gold-400)]" /> {featuredSkill.rating}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">87%效率提升</span>
                </div>
              </div>
              <button
                onClick={() => toggleInstall(featuredSkill.id)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[var(--navy-900)] hover:scale-105 transition-transform flex-shrink-0"
                style={{ background: 'var(--gold-400)' }}
              >
                {featuredSkill.installed ? '已安装' : '立即安装'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── Top Rated Section ─── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">好评技能</h2>
            <span className="text-sm text-[var(--gold-400)] hover:underline cursor-pointer">
              查看全部 &rarr;
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRatedSkills.map((skill, i) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-4 rounded-[var(--radius-lg)] border border-[var(--navy-700)] bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:border-[var(--gold-400)]/40 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedSkill(skill)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ background: 'rgba(250,204,21,0.1)' }}
                  >
                    <span className="text-[var(--gold-400)]">
                      {iconMap[skill.icon] || <PenTool size={18} />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{skill.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarRating rating={skill.rating} size={10} />
                      <span className="text-xs font-semibold text-[var(--gold-400)]">{skill.rating}</span>
                    </div>
                  </div>
                </div>
                <OwnerRow owner={skill.owner} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── All Skills Grid ─── */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">全部技能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSkills.map((skill, i) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.04,
                  duration: 0.45,
                  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                }}
                className="group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-5 bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:-translate-y-1 hover:border-[var(--gold-400)]/40 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedSkill(skill)}
              >
                {/* Top row: icon + category */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center"
                    style={{ background: 'rgba(249,115,22,0.1)' }}
                  >
                    <span className="text-[var(--gold-400)]">
                      {iconMap[skill.icon] || <PenTool size={22} />}
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{
                      background: `${categoryColors[skill.category] || '#6366F1'}20`,
                      color: categoryColors[skill.category] || '#6366F1',
                    }}
                  >
                    {skill.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{skill.name}</h3>
                <OwnerRow owner={skill.owner} />

                <div className="flex items-center gap-2">
                  <StarRating rating={skill.rating} />
                  <span className="text-xs font-semibold text-[var(--gold-400)]">{skill.rating}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    ({skill.reviews.toLocaleString()} 评价)
                  </span>
                </div>

                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{skill.description}</p>

                <div className="h-px bg-[var(--navy-700)]" />

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-bold text-[var(--gold-400)]">免费</span>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      toggleInstall(skill.id)
                    }}
                    className={
                      'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ' +
                      (skill.installed
                        ? 'text-green-500 border border-green-500/30 hover:bg-green-500/10'
                        : 'text-[var(--navy-900)] hover:scale-105')
                    }
                    style={skill.installed ? {} : { background: 'var(--gold-400)' }}
                  >
                    {skill.installed ? (
                      <span className="flex items-center gap-1">
                        <Check size={12} /> 已安装
                      </span>
                    ) : (
                      '安装'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {sortedSkills.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)]">暂无结果</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/*           AI CHAT PANEL                            */}
        {/* ════════════════════════════════════════════════ */}

        {/* Floating Button (collapsed state) */}
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatOpen(true)}
            className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              boxShadow: '0 0 24px rgba(250,204,21,0.35)',
            }}
          >
            <Bot size={26} className="text-[#1a1a2e]" />
          </motion.button>
        )}

        {/* Chat Panel (expanded state) */}
        <AnimatePresence>
          {chatOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/30"
                onClick={() => setChatOpen(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-[380px] max-w-[90vw] flex flex-col rounded-l-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%)',
                  borderLeft: '1px solid var(--navy-700)',
                  boxShadow: '-12px 0 40px rgba(0,0,0,0.4)',
                }}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--navy-700)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(250,204,21,0.15)' }}
                    >
                      <Sparkles size={18} className="text-[var(--gold-400)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">IP技能顾问AI</h3>
                      <span className="text-[10px] text-[var(--text-muted)]">智能推荐 · 实时咨询</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--navy-700)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {chatMessages.map((msg, idx) => {
                    if (msg.role === 'system') {
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-[rgba(250,204,21,0.08)] to-transparent border border-[rgba(250,204,21,0.15)] rounded-xl px-4 py-3"
                        >
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{msg.content}</p>
                        </motion.div>
                      )
                    }
                    if (msg.role === 'user') {
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-[85%] bg-[#2563EB] rounded-2xl rounded-br-md px-4 py-2.5">
                            <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                          </div>
                        </motion.div>
                      )
                    }
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[88%] rounded-2xl rounded-bl-md px-4 py-3 border border-[var(--navy-700)]"
                          style={{ background: 'var(--navy-800)' }}
                        >
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {msg.content || (isStreaming && idx === chatMessages.length - 1 ? '思考中...' : '')}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Prompts */}
                {chatMessages.length <= 1 && (
                  <div className="px-5 pb-2">
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(prompt)}
                          disabled={isStreaming}
                          className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--navy-600)] text-[var(--text-secondary)] hover:text-[var(--gold-400)] hover:border-[var(--gold-400)]/40 transition-colors disabled:opacity-50 truncate max-w-full"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="px-5 pb-5 pt-2 border-t border-[var(--navy-700)]">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入你的需求..."
                      disabled={isStreaming}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-[var(--gold-400)] transition-colors disabled:opacity-50"
                      style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
                    />
                    <button
                      onClick={() => sendMessage(inputValue)}
                      disabled={!inputValue.trim() || isStreaming}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      style={{
                        background: inputValue.trim() && !isStreaming
                          ? 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)'
                          : 'var(--navy-700)',
                      }}
                    >
                      <Send size={16} className={inputValue.trim() && !isStreaming ? 'text-[#1a1a2e]' : 'text-[var(--text-muted)]'} />
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                    AI顾问基于技能库信息提供推荐建议，仅供参考
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════ */}
        {/*           SKILL DETAIL MODAL                     */}
        {/* ════════════════════════════════════════════════ */}

        <AnimatePresence>
          {selectedSkill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSelectedSkill(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                className="w-full max-w-[520px] max-h-[80vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-6"
                style={{ background: 'var(--navy-800)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-[var(--radius-md)] flex items-center justify-center"
                      style={{ background: 'rgba(249,115,22,0.1)' }}
                    >
                      <span className="text-[var(--gold-400)]">
                        {iconMap[selectedSkill.icon] || <PenTool size={26} />}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedSkill.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            background: `${categoryColors[selectedSkill.category] || '#6366F1'}20`,
                            color: categoryColors[selectedSkill.category] || '#6366F1',
                          }}
                        >
                          {selectedSkill.category}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {selectedSkill.installs.toLocaleString()} 次安装
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSkill(null)}
                    className="text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Owner Card */}
                <div className="p-4 rounded-[var(--radius-md)] border border-[var(--navy-700)] mb-5"
                  style={{ background: 'var(--navy-900)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: selectedSkill.owner.avatarColor }}
                    >
                      {selectedSkill.owner.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{selectedSkill.owner.name}</span>
                        {selectedSkill.owner.verified && <CheckCircle size={14} className="text-[#3B82F6]" />}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{selectedSkill.owner.title}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--gold-400)] hover:underline cursor-pointer flex items-center gap-1">
                    <User size={12} /> 查看专家档案 &rarr;
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={selectedSkill.rating} size={16} />
                  <span className="text-lg font-bold text-[var(--gold-400)]">{selectedSkill.rating}</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    ({selectedSkill.reviews.toLocaleString()} 评价)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {selectedSkill.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: '安装量', value: selectedSkill.installs.toLocaleString() },
                    { label: '评分', value: selectedSkill.rating.toString() },
                    { label: '评价数', value: selectedSkill.reviews.toLocaleString() },
                  ].map(stat => (
                    <div key={stat.label}
                      className="p-3 rounded-[var(--radius-md)] border border-[var(--navy-700)] text-center"
                      style={{ background: 'var(--navy-900)' }}
                    >
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleInstall(selectedSkill.id)}
                    className={
                      'flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ' +
                      (selectedSkill.installed
                        ? 'text-green-500 border border-green-500/30 hover:bg-green-500/10'
                        : 'text-[var(--navy-900)] hover:scale-[1.02]')
                    }
                    style={selectedSkill.installed ? {} : { background: 'var(--gold-400)' }}
                  >
                    {selectedSkill.installed ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check size={14} /> 已安装
                      </span>
                    ) : (
                      '立即安装'
                    )}
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-full text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors"
                  >
                    了解更多
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Skill Creator Modal ─── */}
        <SkillCreator
          open={creatorOpen}
          onClose={() => setCreatorOpen(false)}
          onSkillCreated={(newSkill) => {
            const skill: Skill = {
              id: `custom_${Date.now()}`,
              name: newSkill.name,
              category: newSkill.category,
              description: newSkill.description,
              installs: 0,
              installed: true,
              rating: 0,
              reviews: 0,
              owner: {
                name: newSkill.author || '我',
                title: '个人开发者',
                initials: (newSkill.author || '我')[0],
                avatarColor: '#FACC15',
                verified: false,
              },
              icon: newSkill.icon || 'wand-2',
            }
            setSkillList(prev => [skill, ...prev])
          }}
        />
      </div>
    </Layout>
  )
}