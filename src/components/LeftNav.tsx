import { Link, useLocation } from 'react-router-dom'
import { 
  MessageSquare, 
  FileText, 
  Tag, 
  Copyright, 
  Database, 
  Lock, 
  Bot, 
  Users, 
  DollarSign, 
  Wrench, 
  BookOpen 
} from 'lucide-react'

const navItems = [
  { path: '/global-task', label: '智能总台', icon: MessageSquare },
  { path: '/patent', label: '专利业务', icon: FileText },
  { path: '/trademark', label: '商标业务', icon: Tag },
  { path: '/copyright', label: '版权业务', icon: Copyright },
  { path: '/data-ip', label: '数据知识产权', icon: Database },
  { path: '/trade-secret', label: '商业秘密', icon: Lock },
  { path: '/agent-world', label: 'Agent World', icon: Bot },
  { path: '/community', label: '社区协作', icon: Users },
  { path: '/experts', label: '专家平台', icon: Users },
  { path: '/finance', label: '金融投资', icon: DollarSign },
  { path: '/skillhub', label: '技能市场', icon: Wrench },
  { path: '/knowledge', label: '知识库广场', icon: BookOpen },
]

export default function LeftNav() {
  const location = useLocation()

  return (
    <div className="h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border-color)]">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[var(--text-primary)]">
          <span className="text-2xl">⚖️</span>
          <span>IPClaw</span>
        </Link>
        <span className="ml-auto px-2 py-0.5 rounded text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
          v3.1
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-[var(--primary-color)] text-white font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-[var(--text-primary)]">AI Agent 就绪</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            12 个智能体可用于 IP 任务
          </p>
        </div>
      </div>
    </div>
  )
}