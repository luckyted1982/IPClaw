import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Copy, Download, Share2, Zap, FileText, Lightbulb,
  Tag, LayoutGrid, Search, Image, Database, Shield, Scale,
  Building2, Lock, Users, FileWarning, ShieldAlert, Landmark,
  TrendingUp, Calculator, Bot, ShieldCheck, Sparkles, Trash2,
  RefreshCw, ExternalLink, CheckCircle, AlertCircle, Clock,
  ArrowRight, ChevronRight, Plus, Minus, X, Eye, Target, Cpu,
  Globe, AlertTriangle, Wrench, Layers, PenTool, BarChart3,
  Compass, Languages, MessageSquareReply, Palette, CalendarClock,
  Send, Settings, HelpCircle, Info, Filter, Grid3X3, Package,
  Award, Play, Pause,
} from 'lucide-react'

// ==================== Type Definitions ====================

export type ModuleType =
  | 'patent'
  | 'trademark'
  | 'copyright'
  | 'dataip'
  | 'trade-secret'
  | 'finance'
  | 'skill-hub'
  | 'global-task'
  | 'home'

interface ContextItem {
  icon: string
  label: string
  subtitle: string
  badge?: string
  badgeColor?: string
}

interface SuggestionButton {
  label: string
  action: 'api-call' | 'copy' | 'download' | 'navigate' | 'chat-prompt' | 'new-chat'
  payload: string
  apiEndpoint?: string
}

interface QuickAction {
  icon: string
  label: string
  action: 'copy' | 'download' | 'share' | 'new-chat' | 'clear' | 'export' | 'refresh' | 'chat-prompt' | 'navigate'
  payload?: string
  tooltip: string
}

interface ModulePanelConfig {
  aiStatus: {
    defaultTask: string
    processingLabel: string
    apiEndpoint: string
  }
  context: {
    title: string
    items: ContextItem[]
  }
  suggestions: SuggestionButton[]
  quickActions: QuickAction[]
}

export interface RightPanelProps {
  moduleType?: ModuleType
  onSendMessage?: (message: string) => void
  onNewChat?: () => void
  onClearHistory?: () => void
  onRefresh?: () => void
  chatContentForCopy?: string
  messages?: { role: 'user' | 'assistant'; content: string; timestamp: Date }[]
}

// ==================== Icon Map (safe list) ====================

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Copy, Download, Share2, Zap, FileText, Lightbulb, Tag, LayoutGrid,
  Search, Image, Database, Shield, Scale, Building2, Lock, Users,
  FileWarning, ShieldAlert, Landmark, TrendingUp, Calculator, Bot,
  ShieldCheck, Sparkles, Trash2, RefreshCw, ExternalLink, CheckCircle,
  AlertCircle, Clock, ArrowRight, ChevronRight, Plus, Minus, X, Eye,
  Target, Cpu, Globe, AlertTriangle, Wrench, Layers, PenTool, BarChart3,
  Compass, Languages, MessageSquareReply, Palette, CalendarClock, Send,
  Settings, HelpCircle, Info, Filter, Grid3X3, Package, Award, Play, Pause,
}

function getIcon(name: string): React.ComponentType<{ size?: number; className?: string }> {
  return iconMap[name] || FileText
}

// ==================== Module Configurations ====================

const moduleConfigs: Record<ModuleType, ModulePanelConfig> = {
  patent: {
    aiStatus: {
      defaultTask: '正在分析专利技术方案...',
      processingLabel: '分析中',
      apiEndpoint: '/api/patent-agent',
    },
    context: {
      title: '专利文档',
      items: [
        { icon: 'FileText', label: '技术交底书', subtitle: '2分钟前更新', badge: '核心', badgeColor: '#FACC15' },
        { icon: 'FileText', label: '权利要求书', subtitle: '5分钟前更新' },
        { icon: 'Image', label: '附图集合', subtitle: '3张图片', badge: 'NEW', badgeColor: '#10B981' },
      ],
    },
    suggestions: [
      { label: '生成权利要求', action: 'chat-prompt', payload: '请根据技术交底书生成完整的独立权利要求和从属权利要求' },
      { label: '新颖性检索', action: 'api-call', payload: '', apiEndpoint: '/api/patent-agent' },
      { label: '检查合规规范', action: 'chat-prompt', payload: '请检查当前专利文档是否符合国知局审查指南的要求' },
      { label: '导出PDF', action: 'download', payload: 'patent-draft.pdf' },
      { label: 'FTO防侵权', action: 'chat-prompt', payload: '请对当前技术方案进行FTO自由实施分析，排查侵权风险' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制AI回复内容到剪贴板' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出为Word/PDF' },
      { icon: 'Share2', label: '分享', action: 'share', tooltip: '生成分享链接' },
    ],
  },

  trademark: {
    aiStatus: {
      defaultTask: '正在进行商标近似分析...',
      processingLabel: '检索中',
      apiEndpoint: '/api/trademark-search-agent',
    },
    context: {
      title: '商标信息',
      items: [
        { icon: 'Tag', label: '目标商标名称', subtitle: '待分析', badge: '待处理', badgeColor: '#F97316' },
        { icon: 'LayoutGrid', label: '尼斯分类', subtitle: '第35类' },
        { icon: 'Search', label: '在先商标', subtitle: '发现12件近似' },
      ],
    },
    suggestions: [
      { label: '显著性评估', action: 'chat-prompt', payload: '请对该商标名称进行显著性评估（音形义三维分析）' },
      { label: '禁用审查', action: 'chat-prompt', payload: '请检查该商标是否违反商标法第10/11/12条的禁用条款' },
      { label: '近似检索', action: 'api-call', payload: '', apiEndpoint: '/api/trademark-search-agent' },
      { label: '分类推荐', action: 'chat-prompt', payload: '请根据商品服务内容推荐合适的尼斯分类类别' },
      { label: '风险评估', action: 'chat-prompt', payload: '请综合评估该商标的注册风险和驳回概率' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制分析结果' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出检索报告' },
      { icon: 'ExternalLink', label: '官方查询', action: 'navigate', payload: 'https://wcjs.sbj.cnipa.gov.cn', tooltip: '打开中国商标网' },
    ],
  },

  copyright: {
    aiStatus: {
      defaultTask: '正在分析作品版权属性...',
      processingLabel: '分析中',
      apiEndpoint: '/api/copyright-registration-agent',
    },
    context: {
      title: '作品信息',
      items: [
        { icon: 'FileText', label: '作品说明书', subtitle: '待提交' },
        { icon: 'Image', label: '作品样本', subtitle: '3张图片' },
        { icon: 'Users', label: '权利人信息', subtitle: '已填写' },
      ],
    },
    suggestions: [
      { label: '作品登记', action: 'chat-prompt', payload: '帮我准备软件著作权登记所需的全部材料清单' },
      { label: '权属分析', action: 'chat-prompt', payload: '分析该作品的著作权归属是否存在争议风险' },
      { label: '侵权监测', action: 'chat-prompt', payload: '设置对该作品的全网侵权监测方案' },
      { label: '价值评估', action: 'chat-prompt', payload: '评估该版权资产的市场价值和许可潜力' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制回复内容' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出登记材料' },
      { icon: 'RefreshCw', label: '刷新', action: 'refresh', tooltip: '重新获取状态' },
    ],
  },

  dataip: {
    aiStatus: {
      defaultTask: '正在分析数据资产属性...',
      processingLabel: '认定中',
      apiEndpoint: '/api/dataip-registration-agent',
    },
    context: {
      title: '数据资产',
      items: [
        { icon: 'Database', label: '数据集概况', subtitle: '10亿条记录' },
        { icon: 'Shield', label: '分级认定', subtitle: '一般数据', badge: 'L1', badgeColor: '#10B981' },
        { icon: 'Scale', label: '三权分置', subtitle: '持有+加工+经营' },
      ],
    },
    suggestions: [
      { label: '三权分析', action: 'chat-prompt', payload: '分析该数据资产的持有权、加工使用权、产品经营权归属' },
      { label: '分级认定', action: 'chat-prompt', payload: '判定该数据属于一般/重要/核心哪一级别' },
      { label: '入表评估', action: 'chat-prompt', payload: '评估该数据资源是否符合企业数据资源入表条件' },
      { label: '登记指引', action: 'chat-prompt', payload: '提供数据资产登记的全流程操作指引' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制分析报告' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出入表方案' },
      { icon: 'Building2', label: '交易平台', action: 'navigate', payload: '/finance/deal', tooltip: '跳转数据交易' },
    ],
  },

  'trade-secret': {
    aiStatus: {
      defaultTask: '正在识别商业秘密点...',
      processingLabel: '识别中',
      apiEndpoint: '/api/trade-secret-identification-agent',
    },
    context: {
      title: '保密信息',
      items: [
        { icon: 'Lock', label: '密点清单', subtitle: '已识别15项', badge: '机密', badgeColor: '#EF4444' },
        { icon: 'Users', label: '接触人员', subtitle: '12人有权限' },
        { icon: 'FileWarning', label: '保护措施', subtitle: '已采取8项' },
      ],
    },
    suggestions: [
      { label: '密点识别', action: 'chat-prompt', payload: '根据技术信息识别可能的商业秘密点（非公知性、价值性、保密措施）' },
      { label: '定密分级', action: 'chat-prompt', payload: '对识别出的秘密信息进行定密和分级（绝密/机密/秘密）' },
      { label: '保护体系', action: 'chat-prompt', payload: '构建完善的商业秘密保护体系（制度+技术+人员）' },
      { label: '风险评估', action: 'chat-prompt', payload: '评估当前商业秘密泄露的风险等级和薄弱环节' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制密点清单' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出保护方案' },
      { icon: 'ShieldAlert', label: '体检', action: 'chat-prompt', payload: '进行一次全面的商业秘密保护健康体检', tooltip: '保护健康体检' },
    ],
  },

  finance: {
    aiStatus: {
      defaultTask: '正在评估IP资产价值...',
      processingLabel: '估值中',
      apiEndpoint: '/api/ip-valuation-agent',
    },
    context: {
      title: 'IP资产',
      items: [
        { icon: 'Landmark', label: '专利组合', subtitle: '50件发明专利' },
        { icon: 'TrendingUp', label: '预估价值', subtitle: '¥5,200万', badge: '+18%', badgeColor: '#10B981' },
        { icon: 'Building2', label: '融资项目', subtitle: '3个在谈' },
      ],
    },
    suggestions: [
      { label: 'IP估值', action: 'chat-prompt', payload: '采用成本法、收益法、市场法对我的IP组合进行多维度估值' },
      { label: '质押融资', action: 'chat-prompt', payload: '评估我的专利资产是否适合进行质押融资，推荐银行产品' },
      { label: '证券化', action: 'chat-prompt', payload: '分析我的IP资产是否具备证券化发行ABS的条件' },
      { label: '股权出资', action: 'chat-prompt', payload: '评估以IP作价入股的可行性和税务影响' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制估值报告' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出估值报告PDF' },
      { icon: 'Calculator', label: '计算器', action: 'chat-prompt', payload: '打开IP估值计算器', tooltip: '快速估值计算' },
    ],
  },

  'skill-hub': {
    aiStatus: {
      defaultTask: '正在匹配最适合您的IP工具...',
      processingLabel: '匹配中',
      apiEndpoint: '/api/skill-market-agent',
    },
    context: {
      title: '已选技能',
      items: [
        { icon: 'Bot', label: 'PatSeek 检索', subtitle: '已安装', badge: 'ACTIVE', badgeColor: '#10B981' },
        { icon: 'ShieldCheck', label: 'CNIPA 合规', subtitle: '已安装', badge: 'ACTIVE', badgeColor: '#10B981' },
      ],
    },
    suggestions: [
      { label: '工具对比', action: 'chat-prompt', payload: '对比Eureka查新和PatSeek检索的优缺点，哪个更适合我？' },
      { label: '跨境电商工具', action: 'chat-prompt', payload: '作为跨境电商卖家，推荐最合适的侵权检测工具' },
      { label: '免费工具', action: 'chat-prompt', payload: '列出所有免费的IP AI工具及其功能限制' },
      { label: '私有化部署', action: 'chat-prompt', payload: '哪些IP AI工具支持企业私有化部署？成本如何？' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制推荐结果' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出工具对比表' },
      { icon: 'Sparkles', label: 'AI咨询', action: 'chat-prompt', payload: '你好，我是新用户，请帮我了解适合我的IP工具', tooltip: '开启AI咨询' },
    ],
  },

  'global-task': {
    aiStatus: {
      defaultTask: 'AI助手就绪',
      processingLabel: '就绪',
      apiEndpoint: '/api/chat',
    },
    context: {
      title: '最近文档',
      items: [
        { icon: 'FileText', label: '专利交底书.pdf', subtitle: '2.4 MB' },
        { icon: 'FileText', label: '技术方案.docx', subtitle: '1.8 MB' },
      ],
    },
    suggestions: [
      { label: '新对话', action: 'new-chat', payload: '' },
      { label: '专利检索', action: 'chat-prompt', payload: '我想进行一项专利检索' },
      { label: '商标查询', action: 'chat-prompt', payload: '我需要查询一个商标是否可以注册' },
      { label: '版权登记', action: 'chat-prompt', payload: '我想了解软件著作权的登记流程' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制最后一条回复' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出对话记录' },
      { icon: 'Trash2', label: '清空', action: 'clear', tooltip: '清空对话历史' },
    ],
  },

  home: {
    aiStatus: {
      defaultTask: 'AI助手就绪',
      processingLabel: '就绪',
      apiEndpoint: '/api/chat',
    },
    context: {
      title: '最近文档',
      items: [
        { icon: 'FileText', label: '专利交底书.pdf', subtitle: '2.4 MB' },
        { icon: 'FileText', label: '技术方案.docx', subtitle: '1.8 MB' },
      ],
    },
    suggestions: [
      { label: '新对话', action: 'new-chat', payload: '' },
      { label: '专利检索', action: 'chat-prompt', payload: '我想进行一项专利检索' },
      { label: '商标查询', action: 'chat-prompt', payload: '我需要查询一个商标是否可以注册' },
      { label: '版权登记', action: 'chat-prompt', payload: '我想了解软件著作权的登记流程' },
    ],
    quickActions: [
      { icon: 'Copy', label: '复制', action: 'copy', tooltip: '复制最后一条回复' },
      { icon: 'Download', label: '导出', action: 'download', tooltip: '导出对话记录' },
      { icon: 'Trash2', label: '清空', action: 'clear', tooltip: '清空对话历史' },
    ],
  },
}

// ==================== Helper Functions ====================

const moduleNames: Record<ModuleType, string> = {
  patent: '专利',
  trademark: '商标',
  copyright: '版权',
  dataip: '数据知识产权',
  'trade-secret': '商业秘密',
  finance: '金融投资',
  'skill-hub': '技能市场',
  'global-task': '通用任务',
  home: '首页',
}

function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

// ==================== Component ====================

export default function RightPanel({
  moduleType = 'global-task',
  onSendMessage,
  onNewChat,
  onClearHistory,
  onRefresh,
  chatContentForCopy = '',
  messages = [],
}: RightPanelProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const config = useMemo(() => moduleConfigs[moduleType], [moduleType])

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2000)
  }, [])

  // ==================== Action Handlers ====================

  const handleSuggestionAction = useCallback(async (btn: SuggestionButton) => {
    switch (btn.action) {
      case 'chat-prompt':
        if (onSendMessage) {
          onSendMessage(btn.payload)
        } else {
          window.dispatchEvent(new CustomEvent('rightpanel:send-message', { detail: btn.payload }))
          showToast('已发送消息')
        }
        break

      case 'api-call':
        setIsProcessing(true)
        setProgress(0)
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval)
              return 95
            }
            return prev + Math.random() * 15
          })
        }, 300)
        try {
          const endpoint = btn.apiEndpoint || config.aiStatus.apiEndpoint
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: btn.label }),
          })
          const data = await res.json()
          clearInterval(progressInterval)
          setProgress(100)
          showToast(`API调用成功: ${JSON.stringify(data).slice(0, 50)}`)
          setTimeout(() => { setProgress(0); setIsProcessing(false) }, 1500)
        } catch {
          clearInterval(progressInterval)
          setProgress(0)
          setIsProcessing(false)
          showToast('API调用失败，请重试')
        }
        break

      case 'download':
        handleDownload(btn.payload || `IPClaw_${moduleNames[moduleType]}_${getTodayString()}.md`)
        break

      case 'copy':
        await handleCopy(btn.payload || chatContentForCopy)
        break

      case 'new-chat':
        if (onNewChat) {
          onNewChat()
        } else {
          window.dispatchEvent(new CustomEvent('rightpanel:new-chat'))
          showToast('已开启新对话')
        }
        break

      default:
        break
    }
  }, [onSendMessage, onNewChat, config, moduleType, chatContentForCopy, showToast])

  const handleQuickAction = useCallback(async (action: QuickAction) => {
    switch (action.action) {
      case 'copy':
        await handleCopy(chatContentForCopy)
        break

      case 'download':
      case 'export':
        handleDownload(action.payload || `IPClaw_${moduleNames[moduleType]}_${getTodayString()}.md`)
        break

      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: `IPClaw - ${moduleNames[moduleType]}`,
              text: '查看我在IPClaw中的工作成果',
              url: window.location.href,
            })
            showToast('分享成功')
          } catch {
            // User cancelled or share failed
            if ((DOMException as unknown as { ABORT_ERR: number }).ABORT_ERR) {
              // User cancelled – ignore
            } else {
              handleCopy(window.location.href)
              showToast('链接已复制到剪贴板')
            }
          }
        } else {
          handleCopy(window.location.href)
          showToast('链接已复制到剪贴板')
        }
        break

      case 'navigate':
        if (action.payload) {
          window.open(action.payload, '_blank')
        }
        break

      case 'new-chat':
        if (onNewChat) {
          onNewChat()
        } else {
          window.dispatchEvent(new CustomEvent('rightpanel:new-chat'))
          showToast('已开启新对话')
        }
        break

      case 'clear':
        if (onClearHistory) {
          onClearHistory()
        } else {
          window.dispatchEvent(new CustomEvent('rightpanel:clear-history'))
          showToast('已清空对话历史')
        }
        break

      case 'refresh':
        if (onRefresh) {
          onRefresh()
        } else {
          window.dispatchEvent(new CustomEvent('rightpanel:refresh'))
          showToast('已刷新')
        }
        break

      case 'chat-prompt':
        if (onSendMessage && action.payload) {
          onSendMessage(action.payload)
        } else if (action.payload) {
          window.dispatchEvent(new CustomEvent('rightpanel:send-message', { detail: action.payload }))
          showToast('已发送消息')
        }
        break

      default:
        break
    }
  }, [chatContentForCopy, moduleType, onNewChat, onClearHistory, onRefresh, onSendMessage, showToast])

  const handleCopy = async (text: string) => {
    if (!text) {
      showToast('没有可复制的内容')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      showToast('已复制到剪贴板')
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast('已复制到剪贴板')
    }
  }

  const handleDownload = (filename: string) => {
    const content = generateMarkdownContent()
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`已下载 ${filename}`)
  }

  const generateMarkdownContent = (): string => {
    const lines: string[] = []
    lines.push(`# IPClaw - ${moduleNames[moduleType]} 导出`)
    lines.push('')
    lines.push(`> 导出时间: ${new Date().toLocaleString('zh-CN')}`)
    lines.push(`> 模块: ${moduleNames[moduleType]}`)
    lines.push('')
    lines.push(`## ${config.context.title}`)
    lines.push('')
    config.context.items.forEach(item => {
      lines.push(`- **${item.label}**: ${item.subtitle}${item.badge ? ` (${item.badge})` : ''}`)
    })
    lines.push('')
    
    if (messages.length > 0) {
      lines.push('---')
      lines.push('')
      lines.push('## 对话记录')
      lines.push('')
      messages.forEach((msg, idx) => {
        lines.push(`### ${msg.role === 'user' ? '用户' : 'AI助手'} (${msg.timestamp.toLocaleString('zh-CN')})`)
        lines.push('')
        lines.push(msg.content)
        lines.push('')
      })
    }
    
    lines.push('---')
    lines.push('*由 IPClaw AI 助手生成*')
    return lines.join('\n')
  }

  // ==================== Render ====================

  return (
    <aside
      className="w-[280px] min-w-[280px] h-full flex flex-col overflow-y-auto relative"
      style={{
        background: 'var(--navy-800)',
        borderLeft: '1px solid var(--navy-700)',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg font-small text-white shadow-lg animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #D4A855, #B8942E)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ===== User Profile Header ===== */}
      <div className="p-5 border-b border-[var(--navy-700)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {user?.avatar || user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white truncate">{user?.name || '用户'}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user?.email || ''}</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--navy-900)] border border-[var(--navy-700)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-yellow-400/20 to-amber-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">我的积分</p>
              <p className="font-semibold text-white text-sm">{user?.balance?.toLocaleString() || 0}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--gold-400)] border border-[var(--gold-400)]/30 hover:bg-[var(--gold-400)]/10 transition-colors"
          >
            详情
          </button>
        </div>
      </div>

      {/* ===== Context Panel ===== */}
      <div className="p-5 border-b border-[var(--navy-700)]">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[var(--info)]" />
          <span className="font-h4 text-[var(--text-secondary)]">{config.context.title}</span>
        </div>
        <div className="space-y-2">
          {config.context.items.map((item, idx) => {
            const ItemIcon = getIcon(item.icon)
            return (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-[var(--navy-900)] border border-[var(--navy-700)] hover:border-gold-400/30 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded bg-[var(--navy-700)] flex items-center justify-center shrink-0">
                  <ItemIcon size={14} className="text-gold-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-small text-white truncate">{item.label}</p>
                    {item.badge && (
                      <span
                        className="font-tiny px-1.5 py-0.5 rounded text-[10px] leading-none shrink-0"
                        style={{
                          color: item.badgeColor || '#FACC15',
                          background: `${item.badgeColor || '#FACC15'}20`,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="font-tiny text-[var(--text-muted)] truncate">{item.subtitle}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== Suggestions ===== */}
      <div className="p-5 border-b border-[var(--navy-700)]">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-[var(--warning)]" />
          <span className="font-h4 text-[var(--text-secondary)]">建议</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.suggestions.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionAction(btn)}
              className="px-3 py-1.5 rounded-full font-small text-[var(--text-secondary)] border border-[var(--navy-700)] hover:border-gold-400 hover:text-gold-400 transition-all duration-200 cursor-pointer active:scale-95"
              title={btn.action === 'chat-prompt' ? btn.payload : undefined}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[var(--success)]" />
          <span className="font-h4 text-[var(--text-secondary)]">快捷操作</span>
        </div>
        <div className={`grid ${config.quickActions.length <= 3 ? 'grid-cols-3' : 'grid-cols-3'} gap-2`}>
          {config.quickActions.map((action, idx) => {
            const ActionIcon = getIcon(action.icon)
            return (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[var(--navy-900)] border border-[var(--navy-700)] hover:border-gold-400 transition-all duration-200 group cursor-pointer active:scale-95"
                title={action.tooltip}
              >
                <ActionIcon size={18} className="text-[var(--text-muted)] group-hover:text-gold-400 transition-colors" />
                <span className="font-tiny text-[var(--text-muted)] group-hover:text-white transition-colors">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Inline fade-in keyframe for toast */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </aside>
  )
}