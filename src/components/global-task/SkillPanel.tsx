import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, PenTool, Shield, BookOpen, BarChart3, Scale, Zap } from 'lucide-react'
import type { Skill, SkillCategory } from './types'
import type { LucideIcon } from 'lucide-react'

const categoryTabs: { key: SkillCategory | 'all'; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: '全部', icon: Zap },
  { key: 'patent', label: '专利', icon: PenTool },
  { key: 'trademark', label: '商标', icon: Shield },
  { key: 'copyright', label: '版权', icon: BookOpen },
  { key: 'valuation', label: '评估', icon: BarChart3 },
  { key: 'legal', label: '法律', icon: Scale },
  { key: 'general', label: '通用', icon: Zap },
]

const skillsData: Skill[] = [
  { id: '1', name: '专利撰写助手', category: 'patent', icon: 'pen-tool', color: '#3B82F6', usage: 1284, favorited: true, description: '根据技术交底书自动生成专利申请文件', author: 'IPClaw官方' },
  { id: '2', name: '权利要求优化', category: 'patent', icon: 'shield-check', color: '#3B82F6', usage: 967, favorited: false, description: '优化权利要求书的保护范围和层次', author: 'IPClaw官方' },
  { id: '3', name: '专利检索分析', category: 'patent', icon: 'search', color: '#3B82F6', usage: 756, favorited: true, description: '检索相似专利并提供对比分析', author: '专利达人' },
  { id: '4', name: '审查意见答复', category: 'patent', icon: 'message-square', color: '#3B82F6', usage: 543, favorited: false, description: '辅助撰写专利审查意见答复文档', author: '审查专家' },
  { id: '5', name: '商标近似查询', category: 'trademark', icon: 'search', color: '#8B5CF6', usage: 892, favorited: false, description: '查询相似商标并评估注册风险', author: '商标管家' },
  { id: '6', name: '商标分类建议', category: 'trademark', icon: 'tag', color: '#8B5CF6', usage: 445, favorited: false, description: '根据商品/服务推荐尼斯分类', author: 'IPClaw官方' },
  { id: '7', name: '商标监测预警', category: 'trademark', icon: 'bell', color: '#8B5CF6', usage: 334, favorited: true, description: '实时监测近似商标申请动态', author: '监测专家' },
  { id: '8', name: '版权登记辅助', category: 'copyright', icon: 'file-check', color: '#10B981', usage: 567, favorited: false, description: '辅助填写版权登记申请材料', author: '版权助手' },
  { id: '9', name: '侵权比对分析', category: 'copyright', icon: 'git-compare', color: '#10B981', usage: 423, favorited: false, description: '比对作品相似度并生成报告', author: 'IPClaw官方' },
  { id: '10', name: '开源许可审查', category: 'copyright', icon: 'code', color: '#10B981', usage: 289, favorited: false, description: '审查代码库的开源许可证兼容性', author: '开源律师' },
  { id: '11', name: '专利价值评估', category: 'valuation', icon: 'trending-up', color: '#F59E0B', usage: 678, favorited: true, description: '多维度评估专利的商业价值', author: '评估大师' },
  { id: '12', name: '技术成熟度分析', category: 'valuation', icon: 'layers', color: '#F59E0B', usage: 345, favorited: false, description: '评估技术的TRL成熟度等级', author: '技术专家' },
  { id: '13', name: 'FTO自由实施分析', category: 'legal', icon: 'scale', color: '#EF4444', usage: 456, favorited: false, description: '分析产品的自由实施风险', author: '法务专家' },
  { id: '14', name: '合规性审查', category: 'legal', icon: 'check-circle', color: '#EF4444', usage: 389, favorited: false, description: '对照法规进行合规性检查', author: 'IPClaw官方' },
  { id: '15', name: '合同条款审查', category: 'legal', icon: 'file-text', color: '#EF4444', usage: 267, favorited: false, description: '审查IP相关合同条款风险', author: '合同律师' },
  { id: '16', name: '文档翻译', category: 'general', icon: 'languages', color: '#FACC15', usage: 1523, favorited: true, description: '专业IP文档多语言翻译', author: '翻译专家' },
  { id: '17', name: '文本摘要', category: 'general', icon: 'align-left', color: '#FACC15', usage: 1123, favorited: false, description: '生成长文档的智能摘要', author: 'AI助手' },
  { id: '18', name: '格式转换', category: 'general', icon: 'refresh-cw', color: '#FACC15', usage: 876, favorited: false, description: '文档格式批量转换', author: '工具箱' },
]

const recentSkills = [
  { id: '2', name: '权利要求优化', usedAt: '2小时前' },
  { id: '3', name: '专利检索分析', usedAt: '昨天' },
]

interface SkillPanelProps {
  expanded: boolean
  onInvokeSkill: (skillName: string) => void
}

export default function SkillPanel({ expanded, onInvokeSkill }: SkillPanelProps) {
  const [activeTab, setActiveTab] = useState<SkillCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(skillsData.filter((s) => s.favorited).map((s) => s.id))
  )

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredSkills = skillsData.filter((s) => {
    const matchesCategory = activeTab === 'all' || s.category === activeTab
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const favoritedSkills = skillsData.filter((s) => favorites.has(s.id))

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          className="overflow-hidden"
          style={{ borderTop: '1px solid var(--navy-700)' }}
        >
          <div className="p-4" style={{ background: 'rgba(30, 41, 59, 0.5)', maxHeight: 320, overflowY: 'auto' }}>
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg border mb-3"
              style={{ background: 'var(--navy-800)', borderColor: 'var(--navy-700)' }}
            >
              <Search size={16} className="text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="搜索技能..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide pb-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="px-3 py-1.5 rounded-full font-tiny font-medium whitespace-nowrap transition-all duration-150 border"
                  style={{
                    background: activeTab === tab.key ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--gold-400)' : 'var(--text-muted)',
                    borderColor: activeTab === tab.key ? 'rgba(250, 204, 21, 0.3)' : 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Favorites Section */}
            {favoritedSkills.length > 0 && !searchQuery && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={12} style={{ color: 'var(--gold-400)' }} />
                  <span className="font-tiny font-semibold text-[var(--text-muted)]">收藏的技能</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {favoritedSkills.slice(0, 3).map((skill, i) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      index={i}
                      isFavorited={favorites.has(skill.id)}
                      onToggleFav={() => toggleFavorite(skill.id)}
                      onClick={() => onInvokeSkill(skill.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Skills */}
            {!searchQuery && recentSkills.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="font-tiny font-semibold text-[var(--text-muted)]">最近使用</span>
                </div>
                <div className="flex flex-col gap-1">
                  {recentSkills.map((rs) => (
                    <button
                      key={rs.id}
                      onClick={() => onInvokeSkill(rs.name)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all hover:bg-[rgba(250,204,21,0.06)]"
                    >
                      <span className="text-[13px] text-[var(--text-secondary)]">{rs.name}</span>
                      <span className="font-tiny text-[var(--text-muted)]">{rs.usedAt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Skills Grid */}
            <div>
              <span className="font-tiny font-semibold text-[var(--text-muted)] mb-2 block">
                {searchQuery ? '搜索结果' : '全部技能'} ({filteredSkills.length})
              </span>
              <div className="grid grid-cols-3 gap-2">
                {filteredSkills.map((skill, i) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    index={i}
                    isFavorited={favorites.has(skill.id)}
                    onToggleFav={() => toggleFavorite(skill.id)}
                    onClick={() => onInvokeSkill(skill.name)}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SkillCard({
  skill,
  index,
  isFavorited,
  onToggleFav,
  onClick,
}: {
  skill: Skill
  index: number
  isFavorited: boolean
  onToggleFav: () => void
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.03,
        duration: 0.25,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(250,204,21,0.1)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-colors"
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
        borderColor: 'var(--navy-700)',
      }}
    >
      {/* Favorite Button */}
      <motion.button
        whileTap={{ scale: 1.4, rotate: 15 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFav()
        }}
        className="absolute top-1 right-1 p-0.5"
      >
        <Star
          size={12}
          style={{
            fill: isFavorited ? '#FACC15' : 'transparent',
            stroke: isFavorited ? '#FACC15' : 'var(--text-muted)',
          }}
        />
      </motion.button>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: skill.color + '20' }}
      >
        <div className="w-4 h-4 rounded-full" style={{ background: skill.color }} />
      </div>

      {/* Name */}
      <span className="text-[12px] text-[var(--text-primary)] font-medium text-center truncate w-full leading-tight">
        {skill.name}
      </span>

      {/* Usage */}
      <span className="font-tiny text-[var(--text-muted)]">用过 {skill.usage} 次</span>
    </motion.div>
  )
}