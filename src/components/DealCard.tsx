import { motion } from 'framer-motion'
import { Package } from 'lucide-react'

export interface Deal {
  id: string
  name: string
  type: string
  amount: number
  stage: string
  status: string
}

export interface PipelineStage {
  key: string
  label: string
  count: number
  value: string
}

interface DealCardProps {
  deal: Deal
  index?: number
}

export function DealCard({ deal, index = 0 }: DealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border border-[var(--navy-700)] bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:border-[rgba(245,158,11,0.4)] transition-all duration-200"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
        <Package size={18} className="text-[#F59E0B]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{deal.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
            {deal.type}
          </span>
          <span className="text-xs text-[var(--text-muted)]">{deal.stage}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-bold text-[var(--gold-400)]">¥{(deal.amount / 10000).toFixed(0)}万</div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
          {deal.status}
        </span>
      </div>
    </motion.div>
  )
}

interface PipelineStageCardProps {
  stage: PipelineStage
  index?: number
  isLast?: boolean
}

export function PipelineStageCard({ stage, index = 0, isLast = false }: PipelineStageCardProps) {
  return (
    <div className="flex items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay: index * 0.15,
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        }}
        className="min-w-[140px] p-4 rounded-[var(--radius-lg)] border border-[var(--navy-700)] bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] text-center"
      >
        <div className="text-sm font-semibold text-white">{stage.label}</div>
        <div className="text-2xl font-bold text-[var(--gold-400)] my-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {stage.count}个
        </div>
        <div className="text-xs text-[var(--text-secondary)]">{stage.value}</div>
      </motion.div>
      {!isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-8 h-[2px] mx-2 flex-shrink-0 origin-left"
          style={{ background: 'linear-gradient(90deg, var(--navy-700), var(--gold-400))' }}
        />
      )}
    </div>
  )
}

interface SummaryStatProps {
  label: string
  value: string
  trend: string
  icon: React.ReactNode
  accentColor: string
  index?: number
}

export function SummaryStat({ label, value, trend, icon, accentColor, index = 0 }: SummaryStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className="flex-1 min-w-[200px] p-4 rounded-[var(--radius-lg)] border border-[var(--navy-700)] bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)]"
      style={{ borderLeft: `2px solid ${accentColor}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color: accentColor }}>{icon}</div>
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--gold-400)]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {value}
      </div>
      <div className="text-xs text-green-400 mt-1">{trend}</div>
    </motion.div>
  )
}