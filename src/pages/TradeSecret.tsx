import { motion } from 'framer-motion'
import { Key, ShieldCheck, Search, Scale, Lock, AlertTriangle, Users, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'

const accentColor = '#F59E0B'

const stats = [
  { icon: Lock, label: '已梳理密点', value: '8,920', trend: '+34%', color: '#F59E0B' },
  { icon: AlertTriangle, label: '当前泄密风险等级', value: '低', sub: '基于 12 项指标评估', color: '#22C55E' },
  { icon: Users, label: '保密协议覆盖率', value: '94.2%', trend: '+5.8%', color: '#F59E0B' },
]

const services = [
  {
    icon: Key,
    title: '识别定密',
    description: 'AI辅助识别企业核心商业秘密，基于三要件标准（不为公众知悉、商业价值、保密措施）进行认定分析，四级密级划分与定密流程指引',
    metrics: { primary: '三要件认定 + 四级密级体系', secondary: '反法第9条 | 总局令第126号' },
    tags: ['三要件认定', '密级划分', '定密报告'],
    cta: '开始识别',
    path: '/trade-secret/identification',
  },
  {
    icon: ShieldCheck,
    title: '保护体系建设',
    description: 'ISO 27001 + GB/T 27935 六维度保护体系建设规划，含组织保障、制度建设、人员管理、物理安全、技术防护、合作伙伴管理全方案',
    metrics: { primary: '六维保护体系 | "三位一体"维权', secondary: 'ISO 27001 | 应急预案' },
    tags: ['六维保护', 'ISO 27001', '应急预案'],
    cta: '开始建设',
    path: '/trade-secret/protection',
  },
  {
    icon: Search,
    title: '侵权调查',
    description: '商业秘密侵权行为类型识别与调查取证，支持离职员工侵权、供应链侵权等典型模式分析，电子取证与证据保全指引',
    metrics: { primary: '三类侵权行为 | 电子取证', secondary: '反法第9-10条 | 证据保全' },
    tags: ['行为识别', '电子取证', '调查报告'],
    cta: '开始调查',
    path: '/trade-secret/investigation',
  },
  {
    icon: Scale,
    title: '诉讼支持',
    description: '三轨维权路径（行政/民事/刑事）规划与选择，损害赔偿计算（含惩罚性赔偿1-5倍），诉讼策略制定与抗辩应对指导',
    metrics: { primary: '三轨维权 | 惩罚性赔偿1-5倍', secondary: '刑法第219条 | 典型判例' },
    tags: ['三轨维权', '惩罚性赔偿', '诉讼策略'],
    cta: '获取支持',
    path: '/trade-secret/litigation',
  },
]

const riskAlerts = [
  { label: '本月泄密预警', value: '2 件', color: '#F59E0B' },
  { label: '待处理保密协议', value: '12 件', color: '#FACC15' },
  { label: '核心人员异动', value: '0 件', color: '#22C55E' },
]

export default function TradeSecret() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="pb-10">
        {/* Security Hero Banner */}
        <div
          className="relative h-[160px] overflow-hidden border-b px-6 py-7"
          style={{
            background: 'linear-gradient(180deg, #0B1120 0%, #1a1408 50%, #0B1120 100%)',
            borderColor: 'rgba(245, 158, 11, 0.2)',
          }}
        >
          {/* Pulsing security glow */}
          <div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              animation: 'securityPulse 4s ease-in-out infinite',
            }}
          />
          {/* Lock watermark */}
          <div className="absolute bottom-2 right-6 opacity-10 pointer-events-none">
            <Lock size={80} color="#F59E0B" />
          </div>
          <style>{`
            @keyframes securityPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
              50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            }
          `}</style>

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <Lock size={12} color="#F59E0B" />
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: accentColor }}>
                商业秘密业务领域
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">商业秘密保护中心</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              企业核心机密全生命周期保护——识别定密 · 保护体系建设 · 侵权调查 · 诉讼支持
            </p>
          </div>
        </div>

        <div className="px-6 pt-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 text-sm text-[var(--navy-600)] mb-4">
              <span>首页</span>
              <ChevronRight size={14} />
              <span className="text-[var(--text-primary)]">商业秘密</span>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">商业秘密保护中心</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  基于三位一体保护体系的智能商业秘密管理平台——从识别定密到诉讼维权的全方位服务
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                  }}
                  className="flex-1 min-w-[180px] flex items-center gap-3.5 p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                    border: `1px solid rgba(245, 158, 11, 0.15)`,
                    borderLeft: `2px solid ${stat.color}`,
                  }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                  <div>
                    <div className="text-xl font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-[var(--navy-600)]">{stat.label}</div>
                    {stat.trend && <div className="text-xs text-[#22C55E] mt-0.5">{stat.trend} 环比</div>}
                    {stat.sub && <div className="text-xs text-[var(--navy-600)] mt-0.5">{stat.sub}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Service Grid */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">智能体服务</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                "三位一体" 保护体系
              </span>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {services.map((service, i) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                  }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => navigate(service.path)}
                  className="cursor-pointer"
                >
                  <ServiceCard
                    {...service}
                    accentColor={accentColor}
                    delay={i * 0.08}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Security Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-10"
          >
            <div
              className="rounded-xl border p-6"
              style={{
                background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                borderColor: 'rgba(245, 158, 11, 0.15)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[var(--text-primary)]">安全态势概览</h3>
                <span className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  实时更新
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Risk Meter */}
                <div className="flex flex-col items-center">
                  <div className="relative w-[160px] h-[80px]">
                    <svg viewBox="0 0 160 80" className="w-full h-full">
                      {/* Background arc */}
                      <path
                        d="M 10 80 A 70 70 0 0 1 150 80"
                        fill="none"
                        stroke="var(--navy-700)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Value arc */}
                      <motion.path
                        d="M 10 80 A 70 70 0 0 1 150 80"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.23 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{ strokeDasharray: '220', strokeDashoffset: '0' }}
                      />
                    </svg>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                      <div className="text-2xl font-bold text-[#22C55E]" style={{ fontFamily: '"Inter", sans-serif' }}>23/100</div>
                      <div className="text-[11px] text-[var(--navy-600)]">风险指数</div>
                    </div>
                  </div>
                  <span
                    className="mt-3 px-3 py-1 text-xs font-semibold rounded-full"
                    style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                  >
                    当前风险等级: 低
                  </span>
                </div>

                {/* Alert Summary */}
                <div className="flex flex-col justify-center gap-4">
                  {riskAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--navy-700)] last:border-0">
                      <span className="text-sm text-[var(--text-secondary)]">{alert.label}</span>
                      <span className="text-sm font-bold" style={{ color: alert.color }}>{alert.value}</span>
                    </div>
                  ))}
                </div>

                {/* 30-day risk trend */}
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--navy-600)] mb-2">30天风险趋势</span>
                  <div className="flex-1 flex items-end gap-1 h-[100px]">
                    {[22, 24, 21, 23, 20, 25, 22, 23, 21, 22, 20, 23, 22, 21, 23].map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${v}%` }}
                        transition={{ delay: 0.8 + i * 0.04, duration: 0.4 }}
                        className="flex-1 rounded-t-[1px]"
                        style={{ background: v > 23 ? '#F59E0B' : '#22C55E', opacity: 0.7 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[var(--navy-600)]">30天前</span>
                    <span className="text-[10px] text-[var(--navy-600)]">今天</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Three-in-One Feature Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8"
          >
            <div
              className="rounded-xl border p-6"
              style={{
                background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                borderColor: 'rgba(245, 158, 11, 0.15)',
              }}
            >
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">"三位一体" 维权体系特色</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-[var(--navy-700)] text-center">
                  <div className="text-2xl mb-2">🏛️</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">行政途径</div>
                  <div className="text-xs text-[var(--navy-600)]">市场监管部门查处<br/>罚款10万-500万<br/>程序快速成本低</div>
                </div>
                <div className="p-4 rounded-lg border border-[var(--navy-700)] text-center">
                  <div className="text-2xl mb-2">⚖️</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">民事途径</div>
                  <div className="text-xs text-[var(--navy-600)]">法院诉讼追偿<br/>惩罚性赔偿1-5倍<br/>可获全面经济赔偿</div>
                </div>
                <div className="p-4 rounded-lg border border-[var(--navy-700)] text-center">
                  <div className="text-2xl mb-2">👮‍♂️</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">刑事途径</div>
                  <div className="text-xs text-[var(--navy-600)]">公安机关立案<br/>侵犯商业秘密罪<br/>最高10年有期徒刑</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}