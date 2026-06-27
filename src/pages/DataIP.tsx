import { motion } from 'framer-motion'
import { Fingerprint, Calculator, ShieldCheck, ArrowLeftRight, EyeOff, Globe, PlusCircle, ChevronRight, Database, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'

const accentColor = '#06B6D4'

const stats = [
  { icon: Database, label: '已确权数据资产', value: '12,400', trend: '+45%', color: '#06B6D4' },
  { icon: TrendingUp, label: '数据资产总估值', value: '¥8.6亿', trend: '+28%', color: '#FACC15' },
  { icon: ArrowLeftRight, label: '本月数据交易', value: '2,340', trend: '+67%', color: '#06B6D4' },
]

const services = [
  {
    icon: Fingerprint,
    title: '数据资产登记',
    description: '基于"数据二十条"及《公共数据资源登记管理暂行办法》，提供数据资产确权、三权分置分析、分类分级认定、企业数据资源入表咨询、登记流程指导全流程服务',
    metrics: { primary: '17省市试点', secondary: '一个体系·两级平台' },
    tags: ['资产确权', '三权分置', '入表咨询'],
    cta: '开始登记',
    path: '/data-ip/registration',
  },
  {
    icon: ShieldCheck,
    title: '数据权益保护',
    description: '基于《网络安全法》《数据安全法》《个人信息保护法》《网络数据安全管理条例》，提供数据权益识别、技术保护方案（加密/脱敏/水印/区块链）、侵权应对、跨境合规等服务',
    metrics: { primary: '技术法律双轨制', secondary: '四大法律框架' },
    tags: ['权益识别', '技术保护', '侵权应对'],
    cta: '开始保护',
    path: '/data-ip/rights',
  },
  {
    icon: EyeOff,
    title: '数据合规安全',
    description: '基于《关于完善数据流通安全治理实施方案》（2025.1.15），提供数据全生命周期合规审计、分类分级保护、匿名化标准、隐私计算（联邦学习/MPC）、跨境合规评估等专业服务',
    metrics: { primary: '2027目标：规则明晰', secondary: '五大重点任务' },
    tags: ['合规审计', '分类分级', '隐私计算'],
    cta: '开始审计',
    path: '/data-ip/compliance',
  },
  {
    icon: TrendingUp,
    title: '数据估值交易',
    description: '面向全国统一数据大市场，提供数据资产价值评估（成本法、收益法、市场法、实物期权法）、产品定价策略、四大数交所对接、金融创新（质押融资/保险/证券化）等服务',
    metrics: { primary: '市场规模数万亿', secondary: '年增长率30%+' },
    tags: ['价值评估', '交易撮合', '金融创新'],
    cta: '进入交易',
    path: '/data-ip/trading',
  },
  {
    icon: ArrowLeftRight,
    title: '隐私计算方案',
    description: '联邦学习、多方安全计算、同态加密、差分隐私等技术方案设计与实施，实现"原始数据不出域、数据可用不可见"的隐私计算范式',
    metrics: { primary: '支持4种技术方案', secondary: '已实施40+项目' },
    tags: ['联邦学习', '多方计算', '同态加密'],
    cta: '设计方案',
    path: '/data-ip/compliance',
  },
  {
    icon: Globe,
    title: '数据出境合规',
    description: '数据出境安全评估、标准合同备案、个人信息出境认证三条路径指引，确保跨境数据流动符合《数据出境安全评估办法》等法规要求',
    metrics: { primary: '处理890起出境', secondary: '通过率96.3%' },
    tags: ['安全评估', '合同备案', '跨境认证'],
    cta: '开始评估',
    path: '/data-ip/rights',
  },
]

const recentAssets = [
  { name: '用户行为数据集', type: '行为数据', value: '¥1,200万', status: '已确权', statusColor: '#22C55E' },
  { name: '供应链图谱数据', type: '关系数据', value: '¥860万', status: '评估中', statusColor: '#3B82F6' },
  { name: '医疗影像数据集', type: '影像数据', value: '¥2,400万', status: '交易中', statusColor: '#FACC15' },
  { name: '金融风控模型数据', type: '模型数据', value: '¥560万', status: '已确权', statusColor: '#22C55E' },
  { name: '城市交通流量数据', type: '传感数据', value: '¥340万', status: '审查中', statusColor: '#8B5CF6' },
]

const portfolioData = [
  { month: '1月', value: 420 },
  { month: '2月', value: 520 },
  { month: '3月', value: 480 },
  { month: '4月', value: 640 },
  { month: '5月', value: 720 },
  { month: '6月', value: 860 },
]

export default function DataIP() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="pb-10">
        {/* Hero Banner with data flow animation */}
        <div
          className="relative h-[180px] overflow-hidden border-b border-[var(--navy-700)] px-6 py-8"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, rgba(6, 182, 212, 0.05) 50%, #0F172A 100%)',
          }}
        >
          {/* Animated data flow lines */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute h-[2px] w-full"
              style={{
                top: `${30 + i * 35}px`,
                background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent)',
                animation: `dataFlow 8s linear infinite`,
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}
          {/* Animated particles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`p-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                top: `${30 + i * 30}px`,
                background: 'rgba(6, 182, 212, 0.6)',
                animation: `dataParticle 6s linear infinite`,
                animationDelay: `${i * 1.2}s`,
                boxShadow: '0 0 4px rgba(6, 182, 212, 0.4)',
              }}
            />
          ))}
          <style>{`
            @keyframes dataFlow {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes dataParticle {
              0% { transform: translateX(-100%); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateX(calc(100vw - 300px)); opacity: 0; }
            }
          `}</style>

          {/* Content */}
          <div className="relative z-10">
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: accentColor }}>
              NEW · 2025战略业务
            </span>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-2">数据知识产权</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              让数据成为可确权、可估值、可交易的数字资产
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
              <span className="text-[var(--text-primary)]">数据知识产权</span>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">数据知识产权中心</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  数据资产全生命周期管理——确权、估值、合规、交易、隐私计算、出境合规
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              >
                <PlusCircle size={16} />
                新建数据资产项目
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
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">服务概览</h2>
            <div className="grid grid-cols-3 gap-5">
              {services.map((service, i) => (
                <div
                  key={service.title}
                  onClick={() => service.path && navigate(service.path)}
                  className="cursor-pointer"
                >
                  <ServiceCard
                    {...service}
                    accentColor={accentColor}
                    delay={i * 0.08}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity + Data Asset Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-10 grid grid-cols-5 gap-6"
          >
            {/* Recent Data Assets */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">最近数据资产</h3>
                <span className="text-xs text-[var(--gold-400)] cursor-pointer hover:underline">查看全部 {'>'}</span>
              </div>
              <div
                className="rounded-xl border border-[var(--navy-700)] overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--navy-700)] text-[var(--navy-600)]">
                      <th className="text-left px-4 py-3 font-medium">资产名称</th>
                      <th className="text-left px-4 py-3 font-medium">类型</th>
                      <th className="text-left px-4 py-3 font-medium">估值</th>
                      <th className="text-left px-4 py-3 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssets.map((asset, i) => (
                      <tr
                        key={i}
                        className="border-b border-[var(--navy-700)] last:border-0 hover:bg-[rgba(250,204,21,0.02)]"
                      >
                        <td className="px-4 py-3 text-[var(--text-primary)]">{asset.name}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{asset.type}</td>
                        <td className="px-4 py-3 text-[var(--gold-400)] font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>{asset.value}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{
                              background: `${asset.statusColor}1A`,
                              color: asset.statusColor,
                              border: `1px solid ${asset.statusColor}33`,
                            }}
                          >
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="col-span-2">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">数据资产组合价值趋势</h3>
              <div
                className="rounded-xl border border-[var(--navy-700)] p-4"
                style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
              >
                <div className="flex items-end gap-2 h-[140px]">
                  {portfolioData.map((d, i) => {
                    const maxVal = Math.max(...portfolioData.map((x) => x.value))
                    const height = (d.value / maxVal) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                          className="w-full rounded-t-sm"
                          style={{ background: 'var(--gold-400)', opacity: 0.6 + (i * 0.07) }}
                        />
                        <span className="text-[10px] text-[var(--navy-600)]">{d.month}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-[var(--navy-700)]">
                  <span className="text-xs text-[var(--navy-600)]">6个月趋势</span>
                  <span className="text-xs text-[#22C55E]">+104.8%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}