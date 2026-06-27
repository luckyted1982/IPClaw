import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  tags: string[]
  metrics: { primary: string; secondary: string }
  cta: string
  accentColor: string
  delay?: number
  children?: React.ReactNode
  onClick?: () => void
}

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  tags,
  metrics,
  cta,
  accentColor,
  delay = 0,
  children,
  onClick,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-[var(--navy-700)] p-6 flex flex-col gap-3.5 cursor-pointer min-h-[240px] transition-colors duration-250 hover:border-opacity-40"
      style={{
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        ['--accent-color' as string]: accentColor,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 transition-transform duration-250 group-hover:scale-x-100"
        style={{ background: accentColor }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}1A`, color: accentColor }}
      >
        <Icon size={24} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>

      {/* Description */}
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-[11px] rounded-full border text-[var(--navy-600)]"
            style={{ background: 'var(--navy-800)', borderColor: 'var(--navy-700)' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Custom content (e.g., monitoring widget) */}
      {children}

      {/* Metrics */}
      <div className="mt-auto flex gap-4 pt-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
            {metrics.primary}
          </span>
          <span className="text-[11px] text-[var(--navy-600)]">{metrics.secondary}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1 text-sm font-semibold text-[var(--gold-400)] transition-all duration-200 group-hover:gap-2">
        <span>{cta}</span>
        <ArrowRight size={16} />
      </div>
    </motion.div>
  )
}
