import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, Star, FileText, TrendingUp, X, MessageSquare, Bookmark, Calendar, Award, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import ExpertCard from '../components/ExpertCard'
import type { Expert } from '../components/ExpertCard'

const categories = ['全部', '专利代理师', '商标代理师', '律师', '评估师', '技术专家', '金融顾问']

const experts: Expert[] = [
  { id: '1', name: '王志远', title: '资深专利代理师', company: '中国专利代理(香港)有限公司', initials: '王', avatarColor: 'linear-gradient(135deg, #14B8A6, #0D9488)', rating: 4.9, cases: 1247, successRate: 87.3, rate: 800, tags: ['专利撰写', '审查意见答复', '无效宣告'], verified: true, featured: true },
  { id: '2', name: '陈丽华', title: '商标律师', company: '金杜律师事务所', initials: '陈', avatarColor: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', rating: 4.8, cases: 892, successRate: 92.1, rate: 1200, tags: ['商标注册', '异议答辩', '品牌保护'], verified: true, featured: true },
  { id: '3', name: '张明华', title: 'IP评估师', company: '中评协资深会员', initials: '张', avatarColor: 'linear-gradient(135deg, #F59E0B, #D97706)', rating: 4.7, cases: 567, successRate: 94.6, rate: 600, tags: ['专利估值', 'IP证券化', '质押融资'], verified: true, featured: true },
  { id: '4', name: '李建明', title: '资深专利代理师', company: '北京集佳知识产权', initials: '李', avatarColor: 'linear-gradient(135deg, #3B82F6, #2563EB)', rating: 4.9, cases: 1089, successRate: 91.2, rate: 950, tags: ['生物医药', '发明专利', 'PCT申请'], verified: true },
  { id: '5', name: '刘淑芳', title: '商标代理师', company: '上海华诚商标事务所', initials: '刘', avatarColor: 'linear-gradient(135deg, #EC4899, #DB2777)', rating: 4.6, cases: 634, successRate: 88.5, rate: 500, tags: ['商标续展', '驳回复审', '马德里注册'], verified: false },
  { id: '6', name: '赵伟', title: '知识产权律师', company: '方达律师事务所', initials: '赵', avatarColor: 'linear-gradient(135deg, #6366F1, #4F46E5)', rating: 4.8, cases: 756, successRate: 95.3, rate: 1500, tags: ['专利诉讼', '侵权分析', 'FTO'], verified: true },
  { id: '7', name: '孙雅芳', title: '技术专家', company: '清华大学教授', initials: '孙', avatarColor: 'linear-gradient(135deg, #10B981, #059669)', rating: 4.7, cases: 342, successRate: 89.7, rate: 2000, tags: ['技术评估', '专家证人', 'AI/ML领域'], verified: true },
  { id: '8', name: '周海波', title: '金融顾问', company: '中金公司', initials: '周', avatarColor: 'linear-gradient(135deg, #F97316, #EA580C)', rating: 4.5, cases: 423, successRate: 86.4, rate: 1800, tags: ['IP证券化', '股权融资', '估值分析'], verified: false },
  { id: '9', name: '吴小芳', title: '版权专家', company: '中国版权保护中心', initials: '吴', avatarColor: 'linear-gradient(135deg, #14B8A6, #0F766E)', rating: 4.6, cases: 789, successRate: 93.1, rate: 550, tags: ['版权登记', '侵权监测', '维权取证'], verified: false },
  { id: '10', name: '郑明', title: '专利代理师', company: '北京三友知识产权', initials: '郑', avatarColor: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', rating: 4.4, cases: 521, successRate: 84.2, rate: 480, tags: ['实用新型', '外观设计', '复审'], verified: false },
  { id: '11', name: '钱丽华', title: '评估师', company: '中联资产评估', initials: '钱', avatarColor: 'linear-gradient(135deg, #F59E0B, #D97706)', rating: 4.8, cases: 312, successRate: 92.8, rate: 700, tags: ['资产评估', '无形资产', '司法鉴定'], verified: true },
  { id: '12', name: '冯强', title: '技术专家', company: '中科院计算所', initials: '冯', avatarColor: 'linear-gradient(135deg, #3B82F6, #2563EB)', rating: 4.7, cases: 198, successRate: 90.5, rate: 1600, tags: ['区块链', '软件著作权', '技术鉴定'], verified: true },
]

const reviews = [
  { name: '某科技公司法务', rating: 5, date: '2周前', comment: '专业细致，答复意见一次通过，强烈推荐！' },
  { name: '创业者张先生', rating: 5, date: '1个月前', comment: '王代理师帮我拿到了核心发明专利，沟通非常高效！' },
  { name: '药企IP总监', rating: 4, date: '3周前', comment: '经验丰富，对生物医药领域理解很深，流程规范！' },
]

const cases = [
  { title: '某AI公司发明专利授权案', type: '发明', result: '已授权', date: '2024-10' },
  { title: '新能源电池专利无效宣告', type: '无效', result: '维持有效', date: '2024-08' },
  { title: '生物医药化合物专利布局', type: '布局', result: '12件授权', date: '2024-06' },
]

const services = [
  { name: '专利撰写咨询', price: 800 },
  { name: '审查意见答复指导', price: 1000 },
  { name: '专利无效宣告代理', price: 15000 },
]

export default function ExpertPlatform() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [detailTab, setDetailTab] = useState<'profile' | 'skills' | 'cases' | 'reviews'>('profile')

  const featuredExperts = experts.filter((e) => e.featured)
  const directoryExperts = experts.filter((e) => !e.featured)

  const filteredDirectory = directoryExperts.filter((expert) => {
    const matchCategory = activeCategory === '全部' || expert.title.includes(activeCategory.replace('师', '').replace('家', ''))
    const matchSearch = expert.name.includes(searchQuery) || expert.tags.some((t) => t.includes(searchQuery))
    return matchCategory && matchSearch
  })

  const filledStars = (rating: number) => Math.floor(rating)

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">专家平台</h1>
            <p className="text-[var(--text-secondary)]">知识产权领域顶级专家资源库 — 连接 8,000+ 认证专业人士</p>
          </div>
          <button
            className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--gold-400)]/40 text-[var(--gold-400)] hover:bg-[rgba(250,204,21,0.08)] transition-colors"
          >
            + 成为认证专家
          </button>
        </div>

        {/* Search + Filter */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="搜索专家姓名、技能或机构..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-[var(--radius-md)] text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-[#14B8A6] transition-colors"
            style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                'px-4 py-2 rounded-full text-sm transition-all duration-200 ' +
                (activeCategory === cat
                  ? 'text-[var(--navy-900)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white border border-[var(--navy-700)]')
              }
              style={activeCategory === cat ? { background: 'var(--gold-400)' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Experts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">推荐专家</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(250,204,21,0.15)', color: 'var(--gold-400)' }}>
                本月之星
              </span>
            </div>
            <span className="text-sm text-[var(--gold-400)] hover:underline cursor-pointer">查看全部 &rarr;</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredExperts.map((expert, i) => (
              <ExpertCard key={expert.id} expert={expert} index={i} onViewDetail={setSelectedExpert} />
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">专家名录</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDirectory.map((expert, i) => (
              <ExpertCard key={expert.id} expert={expert} index={i} onViewDetail={setSelectedExpert} compact />
            ))}
          </div>
          {filteredDirectory.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--text-muted)]">暂无匹配专家</p>
            </div>
          )}
        </div>

        {/* Load More */}
        <div className="flex justify-center pb-8">
          <button className="px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors">
            加载更多
          </button>
        </div>
      </div>

      {/* Expert Detail Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setSelectedExpert(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              className="w-full max-w-[640px] max-h-[80vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-6"
              style={{ background: 'var(--navy-800)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex items-center justify-center rounded-full font-bold text-white"
                    style={{ width: 80, height: 80, background: selectedExpert.avatarColor, fontSize: 28 }}
                  >
                    {selectedExpert.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{selectedExpert.name}</h2>
                      {selectedExpert.verified && <CheckCircle size={20} className="text-[#3B82F6]" />}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedExpert.title} · {selectedExpert.company}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < filledStars(selectedExpert.rating) ? 'text-[var(--gold-400)] fill-[var(--gold-400)]' : 'text-[var(--navy-700)]'}
                        />
                      ))}
                      <span className="text-sm font-semibold text-[var(--gold-400)] ml-1">{selectedExpert.rating}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedExpert(null)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 py-2.5 rounded-full text-sm font-semibold text-[var(--navy-900)] hover:scale-[1.02] transition-transform" style={{ background: 'var(--gold-400)' }}>
                  立即预约
                </button>
                <button className="px-4 py-2.5 rounded-full text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-2">
                  <MessageSquare size={14} /> 私信
                </button>
                <button className="px-4 py-2.5 rounded-full text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-2">
                  <Bookmark size={14} /> 收藏
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 rounded-[var(--radius-md)]" style={{ background: 'var(--navy-900)' }}>
                {[
                  { key: 'profile' as const, label: '档案' },
                  { key: 'skills' as const, label: '技能' },
                  { key: 'cases' as const, label: '案例' },
                  { key: 'reviews' as const, label: '评价' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key)}
                    className={
                      'flex-1 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200 ' +
                      (detailTab === tab.key ? 'text-[var(--navy-900)] font-semibold' : 'text-[var(--text-secondary)] hover:text-white')
                    }
                    style={detailTab === tab.key ? { background: 'var(--gold-400)' } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {detailTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '评分', value: selectedExpert.rating, icon: Star },
                        { label: '案件量', value: selectedExpert.cases.toLocaleString(), icon: FileText },
                        { label: '成功率', value: `${selectedExpert.successRate}%`, icon: TrendingUp },
                        { label: '经验年限', value: '12年', icon: Calendar },
                        { label: '响应时间', value: '<2h', icon: Clock },
                        { label: '复购率', value: '78%', icon: Award },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-[var(--radius-md)] border border-[var(--navy-700)] text-center" style={{ background: 'var(--navy-900)' }}>
                          <stat.icon size={16} className="mx-auto mb-1 text-[#14B8A6]" />
                          <div className="text-lg font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* About */}
                    <div className="p-4 rounded-[var(--radius-md)] border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
                      <h4 className="text-sm font-semibold text-white mb-2">关于专家</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {selectedExpert.name}是{selectedExpert.company}的{selectedExpert.title}，拥有丰富的知识产权实务经验。专注于{selectedExpert.tags.join('、')}等领域，累计服务{selectedExpert.cases}件案件，客户满意度{selectedExpert.rating}分。
                      </p>
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ background: 'rgba(20,184,166,0.1)', borderColor: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {detailTab === 'skills' && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {services.map((svc) => (
                      <div key={svc.name} className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
                        <div>
                          <div className="text-sm font-semibold text-white">{svc.name}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">{selectedExpert.name}提供</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[var(--gold-400)]">¥{svc.price.toLocaleString()}</span>
                          <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--gold-400)]/40 text-[var(--gold-400)] hover:bg-[rgba(250,204,21,0.1)] transition-colors">
                            预约
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {detailTab === 'cases' && (
                  <motion.div
                    key="cases"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {cases.map((c) => (
                      <div key={c.title} className="p-4 rounded-[var(--radius-md)] border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{c.title}</span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6' }}>{c.type}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>结果: <span className="text-green-400">{c.result}</span></span>
                          <span>{c.date}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {detailTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {reviews.map((review, idx) => (
                      <div key={idx} className="p-4 rounded-[var(--radius-md)] border border-[var(--navy-700)]" style={{ background: 'var(--navy-900)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--navy-700)' }}>
                            {review.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{review.name}</div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={10} className={i < review.rating ? 'text-[var(--gold-400)] fill-[var(--gold-400)]' : 'text-[var(--navy-700)]'} />
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-xs text-[var(--text-muted)]">{review.date}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{review.comment}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}