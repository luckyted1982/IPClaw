import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, BookOpen, GitFork, FileText, X, Plus, Network,
  Eye, ChevronRight, ArrowLeft, Scale, ShieldCheck, Globe,
  FileSearch, Tag, Calendar, User, ExternalLink, Copy, Check,
} from 'lucide-react'
import Layout from '../components/Layout'
import KnowledgeCard from '../components/KnowledgeCard'
import type { KnowledgeBase } from '../components/KnowledgeCard'
import { officialKnowledgeBases } from '../data/knowledge-bases'
import type { KBDocument } from '../data/knowledge-bases'

const categories = ['全部', '法规', '案例', '条约', '指南']

const officialKBs: KnowledgeBase[] = officialKnowledgeBases.map(kb => ({
  id: kb.id,
  name: kb.name,
  type: kb.type === 'regulation' ? (kb.id.includes('laws') ? 'regulation' : 'guideline') : kb.type,
  creatorName: kb.creatorName,
  creatorInitials: kb.creatorInitials,
  creatorColor: kb.creatorColor,
  visibility: 'public' as const,
  contentCount: kb.contentCount * 50,
  lastUpdated: kb.lastUpdated,
  forkCount: kb.forkCount,
  tags: kb.tags.slice(0, 4),
}))

const featuredKBs = officialKBs

export default function KnowledgePlaza() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [activeFullKB, setActiveFullKB] = useState<typeof officialKnowledgeBases[0] | null>(null)
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [activeDocCategory, setActiveDocCategory] = useState<string>('')
  const [copiedLink, setCopiedLink] = useState(false)

  const filteredKBs = useMemo(() => {
    let bases = [...officialKBs]
    if (activeCategory !== '全部') {
      const catMap: Record<string, string> = {
        '法规': 'regulation',
        '案例': 'case',
        '条约': 'treaty',
        '指南': 'guideline',
      }
      bases = bases.filter(b => b.type === catMap[activeCategory])
    }
    if (searchQuery) {
      bases = bases.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    return bases
  }, [activeCategory, searchQuery])

  const activeDocument = useMemo(() => {
    if (!activeFullKB || !activeDocId) return null
    return activeFullKB.documents.find(d => d.id === activeDocId) || null
  }, [activeFullKB, activeDocId])

  const docsInCategory = useMemo(() => {
    if (!activeFullKB) return []
    if (!activeDocCategory) return activeFullKB.documents
    return activeFullKB.documents.filter(d => d.category === activeDocCategory)
  }, [activeFullKB, activeDocCategory])

  const handleViewDocuments = (kb: KnowledgeBase) => {
    const fullKB = officialKnowledgeBases.find(f => f.id === kb.id)
    if (fullKB) {
      setActiveFullKB(fullKB)
      setActiveDocCategory('')
      setActiveDocId(null)
    }
  }

  const copyCitation = () => {
    if (!activeDocument) return
    navigator.clipboard.writeText(
      `${activeDocument.title} 来源:${activeDocument.source} ${activeDocument.docNumber || ''}`
    )
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">知识库广场</h1>
            <p className="text-[var(--text-secondary)]">
              汇聚知识产权领域权威法律法规与典型案例<span className="text-[var(--gold-400)] font-semibold">{officialKnowledgeBases.length}</span> 个官方知识库 · <span className="text-[var(--gold-400)] font-semibold">{officialKnowledgeBases.reduce((sum, k) => sum + k.documents.length, 0)}</span> 篇核心文献</p>
          </div>
          <button className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--navy-900)] hover:scale-105 transition-transform flex items-center gap-2"
            style={{ background: 'var(--gold-400)' }}
          >
            <Plus size={16} /> 创建知识库</button>
        </div>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text" placeholder="搜索知识库、标签或创作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-[var(--radius-md)] text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-[#6366F1] transition-colors"
            style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                activeCategory === cat
                  ? 'text-[var(--navy-900)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white border border-[var(--navy-700)]'
              }`}
              style={activeCategory === cat ? { background: 'var(--gold-400)' } : {}}
            >
              {cat}
              {cat !== '全部' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({officialKnowledgeBases.filter(k =>
                    cat === '法规' ? k.type === 'regulation' :
                    cat === '案例' ? k.type === 'case' :
                    cat === '条约' ? k.type === 'treaty' :
                    k.type === 'guideline'
                  ).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeFullKB ? (
            <motion.div
              key="doc-viewer"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => { setActiveFullKB(null); setActiveDocId(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <ArrowLeft size={15} /> 返回广场
                </button>
                <div className="h-4 w-px bg-[var(--navy-700)]" />
                <BookOpen size={16} className="text-[var(--gold-400)]" />
                <span className="text-white font-semibold">{activeFullKB.name}</span>
                <span className="text-xs text-[var(--text-muted)]">· {activeFullKB.documents.length} 篇文献</span>
              </div>

              <div className="flex gap-6 min-h-[600px]">
                <div className="w-72 shrink-0 space-y-4">
                  <div className="rounded-xl p-4 border border-[var(--navy-700)]"
                    style={{ background: 'var(--navy-800)' }}
                  >
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FileText size={13} /> 分类目录
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setActiveDocCategory(''); setActiveDocId(null); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                          !activeDocCategory ? 'bg-[rgba(250,204,21,0.1)] text-[var(--gold-400)]' : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
                      >
                        <span>全部文献</span>
                        <span className="text-xs opacity-60">{activeFullKB.documents.length}</span>
                      </button>
                      {activeFullKB.categories.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => { setActiveDocCategory(cat.name); setActiveDocId(null); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                            activeDocCategory === cat.name ? 'bg-[rgba(250,204,21,0.1)] text-[var(--gold-400)]' : 'text-[var(--text-secondary)] hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </span>
                          <span className="text-xs opacity-60">{cat.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 border border-[var(--navy-700)]"
                    style={{ background: 'var(--navy-800)' }}
                  >
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FileSearch size={13} /> 文档列表
                    </h3>
                    <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                      {docsInCategory.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] text-center py-4">该分类下暂无文档</p>
                      ) : (
                        docsInCategory.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setActiveDocId(doc.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-left transition-colors group ${
                              activeDocId === doc.id
                                ? 'bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.2)]'
                                : 'hover:bg-[var(--navy-900)] border border-transparent'
                            }`}
                          >
                            <p className={`text-[13px] leading-snug line-clamp-2 ${
                              activeDocId === doc.id ? 'text-[var(--gold-400)] font-medium' : 'text-[var(--text-primary)]'
                            }`}>
                              {doc.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: 'rgba(99,102,241,0.1)',
                                  color: '#6366F1',
                                  border: '1px solid rgba(99,102,241,0.15)',
                                }}
                              >{doc.category}</span>
                              {doc.docNumber && (
                                <span className="text-[10px] text-[var(--text-muted)] truncate">{doc.docNumber}</span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 rounded-xl border border-[var(--navy-700)] overflow-hidden flex flex-col"
                  style={{ background: 'var(--navy-800)' }}
                >
                  {activeDocument ? (
                    <>
                      <div className="px-6 py-4 border-b border-[var(--navy-700)] shrink-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{activeDocument.title}</h2>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Scale size={12} /> {activeDocument.source}
                              </span>
                              {activeDocument.docNumber && (
                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                  <FileText size={12} /> {activeDocument.docNumber}
                                </span>
                              )}
                              {activeDocument.effectiveDate && (
                                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                  <Calendar size={12} /> 生效日期 {activeDocument.effectiveDate}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={copyCitation}
                            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:border-[var(--gold-400)] hover:text-[var(--gold-400)] transition-colors flex items-center gap-1.5"
                          >
                            {copiedLink ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制引用</>}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="prose prose-invert prose-sm max-w-none
                          prose-headings:text-white prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                          prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
                          prose-strong:text-white prose-code:text-[var(--gold-400)]
                          prose-li:text-[var(--text-secondary)] prose-blockquote:border-l-[var(--gold-400)]
                          prose-table:text-[var(--text-secondary)]
                        ">
                          {activeDocument.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) {
                              return <h1 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>
                            }
                            if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-lg font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={i} className="text-base font-semibold text-[var(--gold-400)] mt-4 mb-2">{line.slice(4)}</h3>
                            }
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>
                            }
                            if (line.startsWith('> ')) {
                              return <blockquote key={i} className="border-l-2 border-[var(--gold-400)] pl-4 italic text-[var(--text-secondary)] my-3 bg-[rgba(250,204,21,0.04)] py-2 rounded-r">{line.slice(2)}</blockquote>
                            }
                            if (line.startsWith('- ')) {
                              return <p key={i} className="ml-4 text-[var(--text-secondary)] my-1">{line}</p>
                            }
                            if (line.trim() === '') {
                              return <div key={i} className="h-2" />
                            }
                            if (line.startsWith('|') && line.includes('|')) {
                              return <p key={i} className="text-xs text-[var(--text-muted)] font-mono my-1 overflow-x-auto">{line}</p>
                            }
                            return <p key={i} className="my-1">{line}</p>
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(250,204,21,0.06)', border: '1px dashed rgba(250,204,21,0.2)' }}
                      >
                        <FileText size={32} className="text-[var(--gold-400)] opacity-40" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">选择一篇文献开始阅读</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-md">
                        从左侧目录中选择分类，然后点击具体文献查看完整内容。所有内容均来自公开可检索的官方信息源。</p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-[var(--text-muted)]">
                        <ShieldCheck size={14} className="text-green-400" />
                        数据来源：全国人大常委会、最高人民法院、国家知识产权局、WIPO等权威机构</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-[var(--gold-400)]" />
                  <h2 className="text-xl font-bold text-white">官方知识库</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(250,204,21,0.1)', color: 'var(--gold-400)', border: '1px solid rgba(250,204,21,0.2)' }}
                  >权威收录</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featuredKBs.map((kb, i) => (
                    <OfficialKBCard key={kb.id} kb={kb} index={i} onView={handleViewDocuments} />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-4">全部知识库</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredKBs.map((kb, i) => (
                    <OfficialKBCard key={kb.id} kb={kb} index={i} onView={handleViewDocuments} />
                  ))}
                </div>
                {filteredKBs.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-[var(--text-muted)]">暂无匹配知识库</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedKB && !activeFullKB && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSelectedKB(null)}
            >
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[600px] max-h-[80vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-6"
                style={{ background: 'var(--navy-800)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center"
                      style={{ background: 'rgba(99,102,241,0.1)' }}
                    >
                      <BookOpen size={24} className="text-[#6366F1]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedKB.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: selectedKB.creatorColor }}
                        >{selectedKB.creatorInitials}</div>
                        <span className="text-sm text-[var(--text-secondary)]">{selectedKB.creatorName}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedKB(null)} className="text-[var(--text-muted)] hover:text-white"><X size={24}/></button>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: '文档数', value: selectedKB.contentCount.toLocaleString(), icon: FileText },
                    { label: '分叉数', value: selectedKB.forkCount.toLocaleString(), icon: GitFork },
                    { label: '浏览数', value: '12.5k', icon: Eye },
                    { label: '关联数', value: '890', icon: Network },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-[var(--radius-md)] border border-[var(--navy-700)] text-center"
                      style={{ background: 'var(--navy-900)' }}
                    >
                      <stat.icon size={16} className="mx-auto mb-1 text-[#6366F1]" />
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedKB.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', color: '#6366F1' }}
                    >{tag}</span>
                  ))}
                </div>
                <div className="p-4 rounded-[var(--radius-md)] border border-[var(--navy-700)] mb-6"
                  style={{ background: 'var(--navy-900)' }}
                >
                  <h4 className="text-sm font-semibold text-white mb-2">知识库简介</h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {officialKnowledgeBases.find(f => f.id === selectedKB.id)?.description || '暂无描述'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setSelectedKB(null); handleViewDocuments(selectedKB); }}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold text-[var(--navy-900)] hover:scale-[1.02] transition-transform"
                    style={{ background: 'var(--gold-400)' }}
                  >浏览文档</button>
                  <button className="px-4 py-2.5 rounded-full text-sm font-medium border border-[var(--navy-700)] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-2">
                    <GitFork size={14} /> 分叉
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

function OfficialKBCard({ kb, index = 0, onView }: { kb: KnowledgeBase; index?: number; onView?: (kb: KnowledgeBase) => void }) {
  const fullKB = officialKnowledgeBases.find(f => f.id === kb.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="group relative flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-5 bg-gradient-to-b from-[var(--navy-800)] to-[var(--navy-900)] hover:-translate-y-1 hover:border-[rgba(250,204,21,0.3)] transition-all duration-200 cursor-pointer"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
      onClick={() => onView?.(kb)}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ background: 'rgba(250,204,21,0.1)' }}
        >
          <BookOpen size={20} className="text-[var(--gold-400)]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
          >官方</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
            style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', color: '#6366F1' }}
          >{kb.type === 'regulation' ? '法规' : kb.type === 'case' ? '案例' : kb.type === 'treaty' ? '国际条约' : '指南'}</span>
        </div>
      </div>

      <h3 className="text-base font-bold text-white leading-snug">{kb.name}</h3>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: kb.creatorColor }}
        >{kb.creatorInitials}</div>
        <span className="text-xs text-[var(--text-muted)]">{kb.creatorName}</span>
      </div>

      {fullKB && (
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {fullKB.description.slice(0, 100)}...
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(fullKB?.tags || kb.tags).slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded text-[11px] font-medium border"
            style={{ background: 'rgba(250,204,21,0.06)', borderColor: 'rgba(250,204,21,0.15)', color: 'var(--gold-400)' }}
          >{tag}</span>
        ))}
        {fullKB && <span className="text-[11px] text-[var(--text-muted)]">+{fullKB.categories.length}个分类</span>}
      </div>

      <div className="h-px bg-[var(--navy-700)]" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1"><FileText size={12} />{fullKB?.documents.length || kb.contentCount}篇</span>
          <span className="flex items-center gap-1"><Calendar size={12} />{kb.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <GitFork size={12} />{kb.forkCount}
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onView?.(kb); }}
        className="mt-auto w-full py-2 rounded-full text-xs font-semibold text-[var(--navy-900)] hover:scale-[1.01] transition-transform flex items-center justify-center gap-1"
        style={{ background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)', boxShadow: '0 2px 12px rgba(250,204,21,0.2)' }}
      >
        <Eye size={12} /> 浏览全文
      </button>
    </motion.div>
  )
}