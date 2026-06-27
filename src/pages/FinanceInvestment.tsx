import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Wallet, Landmark, Handshake, Calculator, Building2, LockKeyhole, PieChart, ShieldCheck, ArrowLeftRight, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { DealCard, PipelineStageCard, SummaryStat } from '../components/DealCard'
import type { Deal, PipelineStage } from '../components/DealCard'

const stats = [
  { label: 'IP资产总额', value: '¥5.2亿', trend: '+18% 本月', icon: <Wallet size={20} />, accentColor: '#059669' },
  { label: '在融项目', value: '18', trend: '+3 本月', icon: <Landmark size={20} />, accentColor: '#FACC15' },
  { label: '已完成交易', value: '47', trend: '+5 本月', icon: <Handshake size={20} />, accentColor: '#059669' },
  { label: '合作机构', value: '32', trend: '+2 本月', icon: <Building2 size={20} />, accentColor: '#22C55E' },
]

const financeServices = [
  { id: 'valuation', name: '专利估值', icon: Calculator, description: '多维度AI估值模型——技术、法律、市场、战略、风险五维评估，专业报告一键生成', metric1: '本月估值 340 万', metric2: '平均精度 91.2%', tags: ['五维模型', '2天周期', '专业报告'], color: '#059669' },
  { id: 'securitization', name: 'IP资产证券化', icon: Building2, description: '将专利、商标、版权等IP资产打包为可交易证券，ABS产品设计、发行支持与投资者对接', metric1: '已发行 12 笔', metric2: '总规模 ¥8.6亿', tags: ['ABS设计', '发行支持', '投资者对接'], color: '#059669' },
  { id: 'pledge', name: '质押融资', icon: LockKeyhole, description: '专利/商标质押融资方案设计，银行对接，评估报告出具，全流程融资服务', metric1: '本月撮合 ¥4,200万', metric2: '合作银行 28 家', tags: ['质押评估', '银行对接', '方案设计'], color: '#059669' },
  { id: 'equity', name: '股权融资', icon: PieChart, description: '以IP资产为核心的股权融资方案，投估值模型、投资人匹配、尽职调查支持', metric1: '服务 89 个项目', metric2: '总融资额 ¥12亿', tags: ['投估值模型', '投资人匹配', '尽调支持'], color: '#059669' },
  { id: 'insurance', name: 'IP保险', icon: ShieldCheck, description: '专利执行保险、侵权责任保险、知识产权综合保险方案设计与保险公司对接', metric1: '合作 8 家保险公司', metric2: '已承保 ¥2.3亿', tags: ['执行保险', '侵权保险', '综合方案'], color: '#059669' },
  { id: 'deal', name: '交易撮合', icon: ArrowLeftRight, description: 'IP资产买卖撮合平台，价格发现、尽职调查、交易结构设计、过户支持', metric1: '本月撮合 42 笔', metric2: '交易额 ¥1.2亿', tags: ['买卖撮合', '价格发现', '过户支持'], color: '#059669' },
]

const pipelineStages: PipelineStage[] = [
  { key: 'lead', label: '评估中', count: 4, value: '¥2.4亿' },
  { key: 'interest', label: '洽谈中', count: 7, value: '¥1.8亿' },
  { key: 'negotiation', label: '已完成', count: 6, value: '¥3.2亿' },
]

const recentDeals: Deal[] = [
  { id: '1', name: '某AI公司专利质押融资', type: '质押融资', amount: 20000000, stage: '评估中', status: '进行中' },
  { id: '2', name: '新能源专利包证券化', type: '资产证券化', amount: 50000000, stage: '洽谈中', status: '进行中' },
  { id: '3', name: '生物医药IP股权融资', type: '股权融资', amount: 80000000, stage: '已完成', status: '即将完成' },
  { id: '4', name: '半导体专利组合估值', type: '专利估值', amount: 15000000, stage: '评估中', status: '进行中' },
  { id: '5', name: '智能制造商标质押', type: '质押融资', amount: 12000000, stage: '洽谈中', status: '进行中' },
  { id: '6', name: '5G通信专利交易', type: '交易撮合', amount: 35000000, stage: '已完成', status: '已交割' },
]

export default function FinanceInvestment() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = financeServices.filter((s) =>
    s.name.includes(searchQuery) || s.description.includes(searchQuery)
  )

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">金融投资中心</h1>
            <p className="text-[var(--text-secondary)]">知识产权价值实现与资本运作 —— 估值、证券化、融资、保险、交易全栈金融服务</p>
          </div>
          <button className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--navy-900)] hover:scale-105 transition-transform" style={{ background: 'var(--gold-400)' }}>
            + 新增IP资产项目
          </button>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          {stats.map((stat, i) => (
            <SummaryStat key={stat.label} {...stat} index={i} />
          ))}
        </div>

        {/* Service Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">服务概览</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="搜索服务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-[#F59E0B] transition-colors"
                style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)', width: 200 }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
                }}
                className="group relative flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-6 bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                style={{ '--domain-accent': service.color, '--domain-accent-glow': `rgba(5,150,105,0.15)` } as React.CSSProperties}
                onClick={() => navigate('/finance/' + service.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3), 0 0 20px rgba(245,158,11,0.1)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--navy-700)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: service.color }} />

                {/* Icon */}
                <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <service.icon size={24} className="text-[#F59E0B]" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white">{service.name}</h3>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">{service.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-medium border" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--navy-700)]" />

                {/* Metrics */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[var(--gold-400)]">{service.metric1}</div>
                    <div className="text-xs text-[var(--text-muted)]">{service.metric2}</div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--gold-400)] transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Deal Pipeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">融资管线</h2>
            <span className="text-sm text-[var(--gold-400)] hover:underline cursor-pointer">查看全部 &rarr;</span>
          </div>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {pipelineStages.map((stage, i) => (
              <PipelineStageCard key={stage.key} stage={stage} index={i} isLast={i === pipelineStages.length - 1} />
            ))}
          </div>
        </div>

        {/* Recent Deals Table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">近期交易</h2>
          <div className="rounded-[var(--radius-lg)] border border-[var(--navy-700)] overflow-hidden" style={{ background: 'var(--navy-800)' }}>
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-[var(--navy-700)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <div>项目</div>
              <div>类型</div>
              <div>金额</div>
              <div>阶段</div>
              <div className="text-right">状态</div>
            </div>
            {/* Table Rows */}
            {recentDeals.map((deal, i) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-[var(--navy-700)] last:border-b-0 hover:bg-[rgba(245,158,11,0.04)] transition-colors"
              >
                <div className="text-sm font-medium text-white truncate">{deal.name}</div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                    {deal.type}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[var(--gold-400)]">¥{(deal.amount / 10000).toFixed(0)}万</div>
                <div className="text-sm text-[var(--text-secondary)]">{deal.stage}</div>
                <div className="text-right">
                  <span className={
                    'px-2 py-0.5 rounded-full text-[11px] font-medium ' +
                    (deal.status === '已交割'
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-[rgba(250,204,21,0.15)] text-[var(--gold-400)]')
                  }>
                    {deal.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Deal Cards (mobile-friendly) */}
        <div className="lg:hidden space-y-3 mb-8">
          {recentDeals.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>
      </div>
    </Layout>
  )
}