import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileCheck, Search, ScanEye, ShieldAlert, CalendarCheck, Radio, PlusCircle, ChevronRight, Shield, Globe2, Gavel } from 'lucide-react'
import Layout from '@/components/Layout'
import ServiceCard from '@/components/ServiceCard'
import TrademarkProjectWizard from '@/components/TrademarkProjectWizard'

const accentColor = '#8B5CF6'

const stats = [
  { icon: FileCheck, label: '本月申请量', value: '892', trend: '+18%', color: '#8B5CF6' },
  { icon: ScanEye, label: '近似检测准确率', value: '96.7%', trend: '+2.4%', color: '#22C55E' },
  { icon: Radio, label: '品牌监测覆盖', value: '48 平台', trend: '+6 平台', color: '#3B82F6' },
]

const services = [
  {
    icon: Search,
    title: '商标检索',
    description: '基于《商标审查审理指南》及尼斯分类标准,提供相似商标检索、在先权利排查、显著性评估与分类建议',
    metrics: { primary: '覆盖 3,200万+ 商标', secondary: '支持 45 个尼斯分类' },
    tags: ['相似检索', '风险评估', '禁用审查'],
    cta: '开始检索',
  },
  {
    icon: FileCheck,
    title: '商标注册',
    description: '基于《商标法》2025最新规定,提供商标命名、分类选择、材料准备、费用预算与时间规划一站式服务',
    metrics: { primary: '本月 892 件申请', secondary: '平均 5.2天提交' },
    tags: ['智能命名', '分类布局', '全程跟踪'],
    cta: '开始注册',
  },
  {
    icon: Globe2,
    title: '商标监测',
    description: '基于中华商标协会国际监测预警体系,覆盖196个国家/地区,提供抢注监测、使用证据管理与续展提醒',
    metrics: { primary: '覆盖 196 国家/地区', secondary: '396家会员数据' },
    tags: ['全球监测', '抢注预警', '防撤三'],
    cta: '开始监测',
  },
  {
    icon: Shield,
    title: '商标维权',
    description: '基于市场监管总局"守护知识产权"专项行动,提供侵权识别、证据固定、行政投诉与民事诉讼双轨维权',
    metrics: { primary: '年办理 4.4 万件', secondary: '涉案金额 11.29亿' },
    tags: ['侵权监测', '行政投诉', '平台治理'],
    cta: '开始维权',
  },
]

const recentTrademarks = [
  { name: '智视科技', type: '9类', status: '审查中', updated: '1天前', statusColor: '#3B82F6' },
  { name: 'IPClaw', type: '42类', status: '已注册', updated: '3天前', statusColor: '#22C55E' },
  { name: '蓝盾安全', type: '45类', status: '异议中', updated: '5天前', statusColor: '#F59E0B' },
  { name: '数据卫士', type: '36类', status: '已驳回', updated: '1周前', statusColor: '#EF4444' },
  { name: '云知产', type: '9类', status: '申请中', updated: '1周前', statusColor: '#FACC15' },
]

const templates = [
  { icon: FileCheck, title: '商标注册申请书模板', desc: '标准商标申请文件格式' },
  { icon: ScanEye, title: '近似检测报告模板', desc: '多维度近似分析框架' },
  { icon: ShieldAlert, title: '异议答辩书模板', desc: '标准异议答辩结构' },
  { icon: Radio, title: '品牌监测配置模板', desc: '多平台监测快速配置' },
]

export default function TrademarkBusiness() {
  const navigate = useNavigate()
  const [wizardOpen, setWizardOpen] = useState(false)

  const handleServiceClick = (title: string) => {
    if (title === '商标检索') navigate('/trademark/search')
    else if (title === '商标注册') navigate('/trademark/registration')
    else if (title === '商标监测') navigate('/trademark/monitoring')
    else if (title === '商标维权') navigate('/trademark/rights')
  }

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
            <span>首页</span>
            <ChevronRight size={14} />
            <span className="text-[var(--text-primary)]">商标业务</span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">商标业务中心</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                全链路品牌保护方案,从注册申请到品牌监测的智能商标服务
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
              onClick={() => setWizardOpen(true)}
            >
              <PlusCircle size={16} />
              新建商标申请
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
              <ServiceCard
                key={service.title}
                {...service}
                accentColor={accentColor}
                delay={i * 0.08}
                onClick={() => handleServiceClick(service.title)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity + Quick Start */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-10 grid grid-cols-5 gap-6"
        >
          {/* Recent Trademarks */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">最近商标申请</h3>
              <span className="text-xs text-[var(--gold-400)] cursor-pointer hover:underline">查看全部 →</span>
            </div>
            <div
              className="rounded-xl border border-[var(--navy-700)] overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--navy-700)] text-[var(--navy-600)]">
                    <th className="text-left px-4 py-3 font-medium">商标名称</th>
                    <th className="text-left px-4 py-3 font-medium">类别</th>
                    <th className="text-left px-4 py-3 font-medium">状态</th>
                    <th className="text-left px-4 py-3 font-medium">更新日期</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrademarks.map((tm, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--navy-700)] last:border-0 hover:bg-[rgba(250,204,21,0.02)]"
                    >
                      <td className="px-4 py-3 text-[var(--text-primary)]">{tm.name}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{tm.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            background: `${tm.statusColor}1A`,
                            color: tm.statusColor,
                            border: `1px solid ${tm.statusColor}33`,
                          }}
                        >
                          {tm.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{tm.updated}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--gold-400)] cursor-pointer hover:underline">查看</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Start Templates */}
          <div className="col-span-2">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">快速开始</h3>
            <div className="flex flex-col gap-2.5">
              {templates.map((tmpl, i) => (
                <motion.div
                  key={tmpl.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--navy-700)] cursor-pointer hover:border-[var(--gold-400)] transition-colors"
                  style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accentColor}1A`, color: accentColor }}
                  >
                    <tmpl.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{tmpl.title}</div>
                    <div className="text-xs text-[var(--navy-600)]">{tmpl.desc}</div>
                  </div>
                  <span className="text-xs text-[var(--gold-400)] hover:underline flex-shrink-0">使用</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <TrademarkProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </Layout>
  )
}