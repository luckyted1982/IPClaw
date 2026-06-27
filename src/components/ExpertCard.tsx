import { motion } from 'framer-motion'
import { CheckCircle, Star, FileText, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Expert {
  id: string
  name: string
  title: string
  company: string
  initials: string
  avatarColor: string
  rating: number
  cases: number
  successRate: number
  rate: number
  tags: string[]
  verified: boolean
  featured?: boolean
}

interface ExpertCardProps {
  expert: Expert
  index?: number
  onViewDetail?: (expert: Expert) => void
  compact?: boolean
}

export default function ExpertCard({ expert, index = 0, onViewDetail, compact = false }: ExpertCardProps) {
  const filledStars = Math.floor(expert.rating)

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className={cn(
        'group relative flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer',
        expert.featured
          ? 'bg-gradient-to-br from-[rgba(20,184,166,0.08)] to-[var(--navy-800)] hover:border-[rgba(20,184,166,0.5)]'
          : 'bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:border-[rgba(20,184,166,0.4)]'
      )}
      style={{ boxShadow: expert.featured ? '0 4px 20px rgba(20,184,166,0.1)' : undefined }}
      onClick={() => onViewDetail?.(expert)}
    >
      {/* Top accent line for featured */}
      {expert.featured && (
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--radius-lg)] bg-[#14B8A6]" />
      )}

      {/* Header: Avatar + Info */}
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white"
          style={{
            width: compact ? 48 : 64,
            height: compact ? 48 : 64,
            background: expert.avatarColor,
            fontSize: compact ? 16 : 22,
          }}
        >
          {expert.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-semibold text-white truncate', compact ? 'text-base' : 'text-lg')}>
              {expert.name}
            </h3>
            {expert.verified && (
              <CheckCircle size={16} className="flex-shrink-0 text-[#3B82F6]" />
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate">
            {expert.title} · {expert.company}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {expert.tags.slice(0, compact ? 2 : 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
                style={{
                  background: 'rgba(20,184,166,0.1)',
                  borderColor: 'rgba(20,184,166,0.2)',
                  color: '#14B8A6',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 py-3 border-t border-b border-[var(--navy-700)]">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < filledStars ? 'text-[var(--gold-400)] fill-[var(--gold-400)]' : 'text-[var(--navy-700)]'}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-[var(--gold-400)]">{expert.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <FileText size={12} />
          <span className="text-xs">案例 {expert.cases.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          <TrendingUp size={12} />
          <span className="text-xs">成功率 {expert.successRate}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-lg font-bold text-white">¥{expert.rate}</span>
          <span className="text-xs text-[var(--text-muted)] ml-1">/小时</span>
        </div>
        {compact ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail?.(expert)
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[rgba(20,184,166,0.1)] transition-colors"
          >
            查看详情
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--navy-900)] hover:scale-105 transition-transform"
            style={{ background: 'var(--gold-400)' }}
          >
            预约咨询
          </button>
        )}
      </div>
    </motion.div>
  )
}