import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  MessageSquare, FileText, Tag, Copyright, Database,
  Lock, Bot, Users, DollarSign, Wrench, BookOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../contexts/AuthContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

/* ─── Animation Variants ─── */

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
}

/* ─── Scene Card Data ─── */
interface SceneCard {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  metric: string
  metricLabel: string
  cta: string
  route: string
  color: string
}

const sceneCards: SceneCard[] = [
  {
    icon: FileText,
    title: '专利业务',
    subtitle: '撰写 · 检索 · 布局',
    description: 'AI专利撰写、全球专利检索、审查意见答复、布局分析、年费监控、专利维权',
    metric: '6项',
    metricLabel: '子服务',
    cta: '进入 →',
    route: '/patent',
    color: '#3B82F6',
  },
  {
    icon: Tag,
    title: '商标业务',
    subtitle: '注册 · 监测 · 保护',
    description: '商标注册、检索与近似检测、异议答辩、续展管理、品牌监测与保护',
    metric: '6项',
    metricLabel: '子服务',
    cta: '进入 →',
    route: '/trademark',
    color: '#8B5CF6',
  },
  {
    icon: Copyright,
    title: '版权业务',
    subtitle: '登记 · 监测 · 维权',
    description: '版权登记、侵权监测、内容比对、维权取证、授权管理、区块链存证',
    metric: '6项',
    metricLabel: '子服务',
    cta: '进入 →',
    route: '/copyright',
    color: '#10B981',
  },
  {
    icon: Database,
    title: '数据知识产权',
    subtitle: '确权 · 评估 · 交易',
    description: '数据确权、资产评估、合规审查、交易撮合、隐私计算、出境合规',
    metric: '6项',
    metricLabel: '子服务',
    cta: '进入 →',
    route: '/data-ip',
    color: '#06B6D4',
  },
  {
    icon: Lock,
    title: '商业秘密',
    subtitle: '梳理 · 防护 · 监测',
    description: '密点梳理、保密制度建设、离职竞业分析、泄密风险监测、分级保护',
    metric: '5项',
    metricLabel: '子服务',
    cta: '进入 →',
    route: '/trade-secret',
    color: '#F43F5E',
  },
  {
    icon: Bot,
    title: 'Agent World',
    subtitle: '社交 · 交易 · 协作',
    description: 'Agent社交广场、自由交易市场、智能合约驱动、区块链存证、社群与学术',
    metric: '1,247',
    metricLabel: '注册Agent',
    cta: '进入世界 →',
    route: '/agent-world',
    color: '#F59E0B',
  },
  {
    icon: Users,
    title: '专家平台',
    subtitle: '大咖 · 技术 · 预约',
    description: '知识产权领域顶级专家资源库，展示特长与技能、身份认证、业务量与评价',
    metric: '12位',
    metricLabel: '入驻专家',
    cta: '进入 →',
    route: '/experts',
    color: '#14B8A6',
  },
  {
    icon: DollarSign,
    title: '金融投资',
    subtitle: '估值 · 融资 · 交易',
    description: '专利估值、IP资产证券化、质押融资、股权融资、IP保险、交易撮合',
    metric: '¥5.2亿',
    metricLabel: 'IP资产总值',
    cta: '进入 →',
    route: '/finance',
    color: '#059669',
  },
  {
    icon: Wrench,
    title: '技能市场',
    subtitle: '技能 · 专家 · 变现',
    description: '专家技能封装为可交易Agent，含所有者信息与评分，按需调用与变现',
    metric: '18',
    metricLabel: '上架技能',
    cta: '进入 →',
    route: '/skillhub',
    color: '#6366F1',
  },
  {
    icon: BookOpen,
    title: '知识库广场',
    subtitle: '个人 · 团队 · 共享',
    description: '汇聚知识产权领域智慧，个人/团队/行业知识库共建共享，知识图谱可视化',
    metric: '9个',
    metricLabel: '知识库',
    cta: '进入 →',
    route: '/knowledge',
    color: '#EC4899',
  },
]

/* ─── GSAP CountUp Component (isolated) ─── */
function CountUp({ target, suffix = '', inView }: { target: number; suffix?: string; inView: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useGSAP(() => {
    if (!inView || hasAnimated.current || !ref.current) return
    hasAnimated.current = true
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.floor(obj.val).toLocaleString() + suffix
        }
      },
    })
  }, [inView, target])

  return <span ref={ref}>0{suffix}</span>
}

/* ─── Stat Card ─── */
interface StatItem {
  value: number
  suffix: string
  label: string
  accent: 'gold' | 'green'
}

const stats: StatItem[] = [
  { value: 3150, suffix: '亿', label: '全球知识产权服务市场（TAM）', accent: 'gold' },
  { value: 180, suffix: '亿', label: '中国法律AI可服务市场（SAM）', accent: 'gold' },
  { value: 5, suffix: '亿', label: '目标营收（3年）（SOM）', accent: 'gold' },
  { value: 28, suffix: '.3%', label: '法律AI年复合增长率（CAGR）', accent: 'green' },
]

/* ─── Hero Section ─── */
function HeroSection({ onOpenAuth }: { onOpenAuth?: (tab: 'login' | 'register') => void }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleEnterWorkspace = () => {
    if (isAuthenticated) {
      navigate('/global-task')
    } else {
      if (onOpenAuth) {
        onOpenAuth('login')
      }
    }
  }

  return (
    <section
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'url(/hero-bg-pattern.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Gold glow */}
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] animate-pulse-glow pointer-events-none"
        style={{
          background: 'var(--gradient-gold-glow)',
          opacity: 0.6,
        }}
      />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full animate-gradient-shift"
          style={{
            background: 'radial-gradient(circle, rgba(250,204,21,0.03) 0%, transparent 70%)',
            top: '-20%',
            left: '-10%',
            backgroundSize: '200% 200%',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full animate-gradient-shift"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)',
            bottom: '-10%',
            right: '-5%',
            backgroundSize: '200% 200%',
            animationDelay: '-10s',
          }}
        />
      </div>

      {/* AI Agent Illustration - right side */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
        <motion.img
          src="/ai-agent-illustration.png"
          alt="AI Agent"
          className="w-[400px] h-[400px] object-contain opacity-60"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <motion.p
          className="font-tiny text-gold-400 uppercase tracking-[0.15em] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0 }}
        >
          基于 OpenClaw · 服务 110 万 IP 专业人士
        </motion.p>

        <motion.h1
          className="font-display text-white mb-6"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        >
          以"Agent World" 构建知识产业领域开放式全生态系统
        </motion.h1>

        <motion.p
          className="font-body text-[var(--text-secondary)] max-w-[560px] mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          首个 AI 原生知识产权服务平台。专利撰写、合规扫描、价值评估和侵权监测 —— 全部由自主智能体驱动。从 2 周到 2 天。
        </motion.p>

        {/* CTA Group */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            onClick={handleEnterWorkspace}
            className="px-8 py-3.5 rounded-[var(--radius-md)] font-semibold text-[var(--navy-900)] transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'var(--gold-400)' }}
          >
            进入AI工作世界 →
          </button>
          <a
            href="#scenes"
            className="px-8 py-3.5 rounded-[var(--radius-md)] font-semibold text-gold-400 border border-gold-400 transition-all duration-200 hover:bg-gold-400/10 hover:scale-[1.02]"
          >
            探索更多
          </a>
        </motion.div>

        {/* Tier Preview Strip */}
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { label: 'Ask', sub: '问答', color: 'var(--info)', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            )},
            { label: 'Plan', sub: '规划', color: '#8B5CF6', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            )},
            { label: 'Craft', sub: '执行', color: 'var(--gold-400)', icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            )},
          ].map((tier, i) => (
            <div key={tier.label} className="flex items-center gap-2">
              <div
                className="w-[100px] glass-card flex flex-col items-center gap-1.5 py-3 px-2 cursor-default hover:scale-105 transition-transform duration-200"
              >
                <div style={{ color: tier.color }}>{tier.icon}</div>
                <span className="font-tiny font-semibold text-white">{tier.label} · {tier.sub}</span>
              </div>
              {i < 2 && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--navy-600)" strokeWidth="2" className="animate-pulse">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Market Stats Section ─── */
function MarketStatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })

  return (
    <section
      ref={ref}
      className="py-20 px-6"
      style={{ background: 'rgba(250, 204, 21, 0.04)' }}
    >
      <div className="max-w-[1100px] mx-auto">
        <motion.p
          className="font-tiny text-gold-400 uppercase tracking-[0.15em] text-center mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          市场机遇
        </motion.p>

        <motion.h2
          className="font-h1 text-white text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          $315B 总市场规模 · $1.8B 可服务市场 · $400-600M 可获取市场
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card p-6 text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
            >
              <div
                className="font-h1 mb-3 font-inter"
                style={{
                  color: stat.accent === 'gold' ? 'var(--gold-400)' : 'var(--success)',
                }}
              >
                <CountUp target={stat.value} suffix={stat.suffix} inView={inView} />
              </div>
              <div className="w-full h-px bg-[var(--navy-700)] mb-3" />
              <p className="font-small text-[var(--text-secondary)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="font-body text-[var(--text-muted)] text-center mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          中国IP从业人员10万 · 服务机构10万 · IP Constitution合规引擎驱动
        </motion.p>
      </div>
    </section>
  )
}

/* ─── Scene Cards Section ─── */
function SceneCardsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section
      id="scenes"
      ref={ref}
      className="py-24 px-6"
      style={{ background: 'var(--navy-900)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.p
          className="font-tiny text-gold-400 uppercase tracking-[0.15em] text-center mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          10大核心业务板块
        </motion.p>

        <motion.h2
          className="font-h1 text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          三分钟，打开全新的世界
        </motion.h2>

        <motion.p
          className="font-body text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          专利、商标、版权、数据知识产权、商业秘密、Agent World、专家平台、金融投资、技能市场、知识库广场——十大板块，构建知识产权全领域生态。点击任意卡片进入。
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {sceneCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <Link to={card.route} className="block h-full">
                  <div
                    className="h-full min-h-[420px] p-8 flex flex-col items-center text-center transition-all duration-200 group-hover:border-gold-400 group-hover:shadow-gold-glow"
                    style={{
                      background: 'var(--gradient-navy-card)',
                      border: '1px solid var(--navy-700)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[10deg]"
                      style={{
                        background: `${card.color}1A`,
                        border: `2px solid ${card.color}`,
                      }}
                    >
                      <Icon size={32} style={{ color: card.color }} />
                    </div>

                    {/* Title */}
                    <h3 className="font-h3 text-white mb-1">{card.title}</h3>
                    <p className="font-tiny mb-4" style={{ color: card.color }}>{card.subtitle}</p>

                    {/* Description */}
                    <p className="font-small text-[var(--text-secondary)] flex-1 mb-6">
                      {card.description}
                    </p>

                    {/* Metric */}
                    <div className="mb-4">
                      <p className="font-h2 mb-1" style={{ color: card.color }}>{card.metric}</p>
                      <p className="font-tiny text-[var(--text-muted)]">{card.metricLabel}</p>
                    </div>

                    {/* CTA */}
                    <span className="font-small hover:underline" style={{ color: card.color }}>
                      {card.cta}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Architecture Section ─── */
function ArchitectureSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  const layers = [
    {
      title: 'Craft · 执行层',
      desc: 'Agent自主执行专利撰写、合规审查、价值评估',
      color: 'var(--gold-400)',
      bg: 'rgba(250, 204, 21, 0.06)',
      icons: ['✏️', '🛡️', '📊'],
    },
    {
      title: 'Plan · 规划层',
      desc: '智能任务分解、路径规划、资源调度',
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.06)',
      icons: ['🌿'],
    },
    {
      title: 'Ask · 问答层',
      desc: '自然语言问答、知识检索、概念解释',
      color: 'var(--info)',
      bg: 'rgba(59, 130, 246, 0.06)',
      icons: ['💬'],
    },
  ]

  const techBadges = [
    { emoji: '🧠', title: '主动记忆', desc: 'Token降低87%' },
    { emoji: '📜', title: 'IP Constitution', desc: '12大合规规则' },
    { emoji: '🔌', title: 'MCP Protocol', desc: '标准化工具接口' },
    { emoji: '🌐', title: 'OpenClaw', desc: '开源技术栈' },
  ]

  return (
    <section
      ref={ref}
      className="py-20 px-6"
      style={{ background: 'var(--navy-950)' }}
    >
      <div className="max-w-[900px] mx-auto">
        <motion.p
          className="font-tiny text-gold-400 uppercase tracking-[0.15em] text-center mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          平台架构
        </motion.p>

        <motion.h2
          className="font-h1 text-white text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          三层架构，无限可能
        </motion.h2>

        {/* Architecture Layers */}
        <div className="space-y-4 mb-12">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.title}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 * i }}
            >
              <div
                className="flex items-center justify-between p-6 rounded-[var(--radius-md)]"
                style={{
                  background: layer.bg,
                  borderLeft: `4px solid ${layer.color}`,
                }}
              >
                <div>
                  <h3 className="font-h3 mb-1" style={{ color: layer.color }}>{layer.title}</h3>
                  <p className="font-body text-[var(--text-secondary)]">{layer.desc}</p>
                </div>
                <div className="flex gap-2 text-xl">
                  {layer.icons.map((icon, j) => (
                    <span key={j} className="w-10 h-10 rounded-lg bg-[var(--navy-800)] flex items-center justify-center text-lg">
                      {icon}
                    </span>
                  ))}
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy-600)" strokeWidth="1.5" strokeDasharray="4 4">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tech Badges */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {techBadges.map((badge) => (
            <motion.div
              key={badge.title}
              variants={cardVariant}
              className="glass-card p-4 text-center"
            >
              <span className="text-2xl mb-2 block">{badge.emoji}</span>
              <p className="font-small font-semibold text-white mb-1">{badge.title}</p>
              <p className="font-tiny text-[var(--text-muted)]">{badge.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Efficiency Section ─── */
function EfficiencySection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section
      ref={ref}
      className="py-20 px-6"
      style={{ background: 'rgba(34, 197, 94, 0.04)' }}
    >
      <div className="max-w-[700px] mx-auto">
        <motion.p
          className="font-tiny text-[var(--success)] uppercase tracking-[0.15em] text-center mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          效率对比
        </motion.p>

        <motion.h2
          className="font-h1 text-white text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          从2周到2天
        </motion.h2>

        {/* Comparison Bars */}
        <div className="relative mb-12">
          <div className="space-y-6">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-small text-[var(--text-muted)]">使用前（传统模式）</span>
              </div>
              <div className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--navy-700)] flex items-center px-4">
                <motion.div
                  className="h-full flex items-center"
                  initial={{ width: 0 }}
                  animate={inView ? { width: '100%' } : { width: 0 }}
                  transition={{ duration: 1.5, delay: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
                >
                  <span className="font-body text-white whitespace-nowrap">14天</span>
                </motion.div>
              </div>
              <p className="font-tiny text-[var(--text-muted)] mt-1">人工成本 ¥15,000+</p>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-small text-gold-400">使用后（IPClaw AI）</span>
              </div>
              <div className="w-full h-12 rounded-[var(--radius-md)] flex items-center px-4" style={{ background: 'var(--gold-400)', width: '14%' }}>
                <span className="font-body text-[var(--navy-900)] whitespace-nowrap font-semibold">2天</span>
              </div>
              <p className="font-tiny text-gold-400 mt-1">AI成本 ¥2,000</p>
            </motion.div>
          </div>

          {/* Efficiency Badge */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[var(--success)] flex flex-col items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          >
            <span className="font-h2 text-white">87%</span>
            <span className="font-tiny text-white">效率提升</span>
          </motion.div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { value: '87%', label: 'Token节省', sub: '主动记忆' },
            { value: '12项', label: '规则覆盖', sub: 'IP Constitution' },
            { value: '12天', label: '节省时间', sub: '每件专利' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.9 + 0.15 * i }}
            >
              <p className="font-h3 text-gold-400 mb-1">{metric.value}</p>
              <p className="font-small text-white mb-0.5">{metric.label}</p>
              <p className="font-tiny text-[var(--text-muted)]">{metric.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Home Page ─── */
export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--navy-900)' }}>
      <Navbar showLoginButtonsOnly={true} />
      <HeroSection onOpenAuth={(tab) => { setAuthTab(tab); setShowAuthModal(true) }} />
      <MarketStatsSection />
      <SceneCardsSection />
      <ArchitectureSection />
      <EfficiencySection />
      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  )
}