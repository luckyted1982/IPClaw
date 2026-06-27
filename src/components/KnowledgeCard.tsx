import { motion } from 'framer-motion'
import { BookOpen, GitFork, Clock, FileText, Eye } from 'lucide-react'

export interface KnowledgeBase {
  id: string
  name: string
  type: string
  creatorName: string
  creatorInitials: string
  creatorColor: string
  visibility: 'public' | 'private' | 'shared'
  contentCount: number
  lastUpdated: string
  forkCount: number
  tags: string[]
}

interface KnowledgeCardProps {
  kb: KnowledgeBase
  index?: number
  onView?: (kb: KnowledgeBase) => void
}

const visibilityConfig = {
  public: { label: '公开', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22C55E' },
  private: { label: '私有', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#EF4444' },
  shared: { label: '共享', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)', color: '#FACC15' },
}

export default function KnowledgeCard({ kb, index = 0, onView }: KnowledgeCardProps) {
  const vis = visibilityConfig[kb.visibility]

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className="group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-5 bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:-translate-y-1 hover:border-[rgba(99,102,241,0.4)] transition-all duration-200 cursor-pointer"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
      onClick={() => onView?.(kb)}
    >
      {/* Header: Icon + Visibility */}
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
          <BookOpen size={20} className="text-[#6366F1]" />
        </div>
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
          style={{ background: vis.bg, borderColor: vis.border, color: vis.color }}
        >
          {vis.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white leading-snug">{kb.name}</h3>

      {/* Creator */}
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: kb.creatorColor }}
        >
          {kb.creatorInitials}
        </div>
        <span className="text-xs text-[var(--text-muted)]">{kb.creatorName}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {kb.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-medium border" style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', color: '#6366F1' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--navy-700)]" />

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <FileText size={12} />
            {kb.contentCount.toLocaleString()}篇
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {kb.lastUpdated}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <GitFork size={12} />
          {kb.forkCount}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onView?.(kb)
        }}
        className="mt-auto w-full py-2 rounded-full text-xs font-semibold border border-[#6366F1]/30 text-[#6366F1] hover:bg-[rgba(99,102,241,0.1)] transition-colors flex items-center justify-center gap-1"
      >
        <Eye size={12} /> 查看
      </button>
    </motion.div>
  )
}