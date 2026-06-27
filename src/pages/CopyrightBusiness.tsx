import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileCheck, ScanEye, Shield, TrendingUp, ChevronRight, ArrowRight, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'
import CopyrightProjectWizard from '@/components/CopyrightProjectWizard'

const accentColor = '#A855F7'

const stats = [
  { icon: FileCheck, label: '版权产业规模', value: '10万亿+', trend: '+12%', color: '#A855F7' },
  { icon: ScanEye, label: '年民事案件量', value: '25.9万件', trend: '+5.2%', color: '#EC4899' },
  { icon: Shield, label: '监测覆盖率', value: '99.2%', trend: '+1.8%', color: '#8B5CF6' },
]

const services = [
  {
    icon: FileCheck,
    title: '版权登记',
    description: '基于《著作权法》(2020修订)及2025年最新政策，提供作品登记、软件著作权登记全流程咨询，支持12种作品类型，AI辅助材料生成与独创性评估',
    metrics: { primary: '支持12种作品类型', secondary: '软件/文字/美术/影视等' },
    tags: ['独创性评估', '材料清单', '费用预算', '2025新规'],
    cta: '开始登记',
    path: '/copyright/registration',
  },
  {
    icon: ScanEye,
    title: '版权监测',
    description: '基于"剑网2025"专项行动部署，提供7×24全网多模态侵权监测，覆盖国内48+主流平台，数字水印/指纹识别/区块链存证一体化方案',
    metrics: { primary: '覆盖48+平台', secondary: '剑网2025专项行动' },
    tags: ['全网监测', '数字水印', '区块链存证', '实时预警'],
    cta: '查看监测',
    path: '/copyright/monitoring',
  },
  {
    icon: Shield,
    title: '版权维权',
    description: '基于《著作权法》第53-61条、《刑法》第217条，提供双轨保护路径选择、证据收集方案、损害赔偿计算（含惩罚性赔偿）、刑事报案标准分析',
    metrics: { primary: '25.9万件/年案件', secondary: '双轨保护+刑事追责' },
    tags: ['法律定位', '证据固定', '赔偿计算', '刑事报案'],
    cta: '开始维权',
    path: '/copyright/rights',
  },
  {
    icon: TrendingUp,
    title: '版权运营',
    description: '基于10万亿元版权产业规模，提供版权交易撮合、许可授权设计、质押融资、证券化、五大集体管理组织对接、国际条约运用及数据资产入表咨询',
    metrics: { primary: '版权产业10万亿+', secondary: '数据资产入表(2024新政)' },
    tags: ['价值挖掘', '交易设计', '质押融资', '集体管理'],
    cta: '运营咨询',
    path: '/copyright/operation',
  },
]

export default function CopyrightBusiness() {
  const navigate = useNavigate()
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <Layout>
      <div className="p-6 pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-sm text-[var(--navy-600)] mb-4">
            <span className="cursor-pointer hover:text-[var(--gold-400)]" onClick={() => navigate('/')}>首页</span>
            <ChevronRight size={14} />
            <span className="text-[var(--text-primary)]">版权业务</span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">版权业务中心</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                四大智能体覆盖版权全生命周期：从登记确权到监测维权再到商业运营的一站式AI解决方案
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              onClick={() => setWizardOpen(true)}
            >
              <PlusCircle size={16} />
              新建版权登记
            </button>
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
                className="flex-1 min-w-[180px] flex items-center gap-3.5 p-4 rounded-xl border border-[var(--navy-700)]"
                style={{
                  background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                  borderLeft: `2px solid ${stat.color}`,
                }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
                <div>
                  <div className="text-xl font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--navy-600)]">{stat.label}</div>
                  <div className="text-xs text-[#22C55E] mt-0.5">{stat.trend} 环比</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Service Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">智能体服务</h2>
            <span className="text-xs text-[var(--navy-600)]">4个专业智能体 · Workflow驱动纯对话模式</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                onClick={() => navigate(service.path)}
                className="group cursor-pointer"
              >
                <div
                  className="p-5 rounded-xl border border-[var(--navy-700)] h-full transition-all duration-300 hover:border-[#A855F7]/50 hover:shadow-lg hover:shadow-[#A855F7]/10"
                  style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${accentColor}15` }}
                    >
                      <service.icon size={24} style={{ color: accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold text-[var(--text-primary)]">{service.title}</h3>
                        <ArrowRight size={14} className="text-[var(--navy-600)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accentColor }} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {service.tags.map((tag, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: `${accentColor}10`,
                              color: accentColor,
                              border: `1px solid ${accentColor}20`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-[var(--gold-400)]">{service.metrics.primary}</span>
                        <span className="text-[var(--navy-600)]">{service.metrics.secondary}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-4 pt-3 border-t border-[var(--navy-700)]">
                    <button
                      className="w-full py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
                        color: 'white',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(service.path)
                      }}
                    >
                      {service.cta}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10"
        >
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">核心能力亮点</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { title: '法律依据完备', desc: '著作权法/计算机软件保护条例/刑法第217条', icon: '⚖️' },
              { title: '2025新规同步', desc: '剑网2025/AI创作声明/数据资产入表/电子签名', icon: '🆕' },
              { title: '双轨保护机制', desc: '行政执法+司法诉讼+刑事追责三管齐下', icon: '🛡️' },
              { title: '国际化视野', desc: '伯尔尼公约81国/WIPO/北京条约/马拉喀什条约', icon: '🌏' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.4 }}
                className="p-4 rounded-xl border border-[var(--navy-700)]"
                style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{feature.title}</h3>
                <p className="text-xs text-[var(--navy-600)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <CopyrightProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </Layout>
  )
}