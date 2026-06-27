import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, Clock, Briefcase, Award, ChevronRight, X, Check, Sparkles, Zap, Play, Pause } from 'lucide-react'
import { EXPERTS, EXPERT_CATEGORIES, type Expert } from './experts'

interface ExpertModePanelProps {
  expertMode: boolean
  onSelectExpert: (expert: Expert | null) => void
  selectedExpert: Expert | null
  onExecuteWorkflow: (expert: Expert) => void
}

export default function ExpertModePanel({ expertMode, onSelectExpert, selectedExpert, onExecuteWorkflow }: ExpertModePanelProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDetail, setSelectedDetail] = useState<Expert | null>(null)
  const [workflowStep, setWorkflowStep] = useState<number>(0)
  const [isExecuting, setIsExecuting] = useState(false)

  const filteredExperts = EXPERTS.filter(expert => {
    const matchesCategory = activeTab === 'all' || expert.category === activeTab
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          expert.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          expert.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleSelectExpert = (expert: Expert) => {
    onSelectExpert(expert)
    setSelectedDetail(null)
    setWorkflowStep(0)
  }

  const handleExecuteWorkflow = () => {
    if (!selectedExpert) return
    setIsExecuting(true)
    setWorkflowStep(1)
    onExecuteWorkflow(selectedExpert)
  }

  const nextStep = () => {
    if (selectedExpert && workflowStep < selectedExpert.workflow.length) {
      setWorkflowStep(workflowStep + 1)
    } else {
      setIsExecuting(false)
    }
  }

  const stopExecution = () => {
    setIsExecuting(false)
    setWorkflowStep(0)
  }

  if (!expertMode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="overflow-hidden"
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--navy-700)', background: 'rgba(30, 41, 59, 0.4)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: 'var(--gold-400)' }} />
              <span className="font-tiny font-semibold" style={{ color: 'var(--gold-400)' }}>专家模式 - 选择专家执行任务</span>
            </div>
            {selectedExpert && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-50"
                  style={{ background: 'var(--gold-400)', color: 'var(--navy-900)' }}
                >
                  {isExecuting ? <Pause size={12} /> : <Play size={12} />}
                  {isExecuting ? '执行中...' : '执行工作流程'}
                </button>
                <button onClick={() => onSelectExpert(null)} className="p-0.5 hover:bg-[var(--navy-700)] rounded">
                  <X size={12} className="text-[var(--text-muted)]" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Search size={14} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="搜索专家..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-2 py-1 rounded text-[12px] bg-[var(--navy-800)] border border-[var(--navy-700)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--gold-400)]"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {EXPERT_CATEGORIES.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-2 py-1 rounded-full font-tiny whitespace-nowrap transition-all"
                style={{
                  background: activeTab === tab.key ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--gold-400)' : 'var(--text-muted)',
                  border: activeTab === tab.key ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid transparent',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isExecuting && selectedExpert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b"
            style={{ background: 'rgba(15, 23, 42, 0.9)', borderColor: 'var(--navy-700)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--gold-400)' }} />
                <span className="text-[12px] font-semibold" style={{ color: 'var(--gold-400)' }}>
                  {selectedExpert.name}的工作流程
                </span>
              </div>
              <button onClick={stopExecution} className="text-[10px] text-[var(--text-muted)] hover:text-red-400">
                停止执行
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {selectedExpert.workflow.map((step, idx) => (
                <div key={step.step} className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{
                      background: idx < workflowStep ? 'var(--success)' : idx === workflowStep ? 'var(--gold-400)' : 'var(--navy-700)',
                      color: idx >= workflowStep && idx !== workflowStep ? 'var(--text-muted)' : 'white',
                    }}
                  >
                    {idx < workflowStep ? <Check size={10} /> : step.step}
                  </div>
                  <span
                    className="text-[10px] ml-1"
                    style={{
                      color: idx < workflowStep ? 'var(--success)' : idx === workflowStep ? 'var(--gold-400)' : 'var(--text-muted)',
                    }}
                  >
                    {step.title}
                  </span>
                  {idx < selectedExpert.workflow.length - 1 && (
                    <ChevronRight size={10} className="mx-1 text-[var(--navy-600)]" />
                  )}
                </div>
              ))}
            </div>
            <div
              className="p-3 rounded-lg border"
              style={{ background: 'rgba(30, 41, 59, 0.6)', borderColor: 'var(--gold-400)' }}
            >
              <div className="text-[12px] font-semibold mb-1" style={{ color: 'var(--gold-400)' }}>
                当前步骤: {selectedExpert.workflow[workflowStep - 1]?.title || '完成'}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {selectedExpert.workflow[workflowStep - 1]?.description || '工作流程已完成'}
              </div>
            </div>
          </motion.div>
        )}

        <div className="max-h-[300px] overflow-y-auto p-4" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
          <div className="grid grid-cols-2 gap-2">
            {filteredExperts.map((expert, i) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDetail(expert)}
                className="p-3 rounded-lg border cursor-pointer transition-all hover:border-[var(--gold-400)]"
                style={{
                  background: selectedExpert?.id === expert.id ? 'rgba(250, 204, 21, 0.08)' : 'var(--navy-800)',
                  borderColor: selectedExpert?.id === expert.id ? 'var(--gold-400)' : 'var(--navy-700)',
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${expert.category === 'patent' ? '#3B82F6' :
                        expert.category === 'trademark' ? '#8B5CF6' :
                        expert.category === 'copyright' ? '#EC4899' :
                        expert.category === 'dataip' ? '#14B8A6' :
                        expert.category === 'trade-secret' ? '#EF4444' : '#F59E0B'}40)`,
                      color: expert.category === 'patent' ? '#3B82F6' :
                        expert.category === 'trademark' ? '#8B5CF6' :
                        expert.category === 'copyright' ? '#EC4899' :
                        expert.category === 'dataip' ? '#14B8A6' :
                        expert.category === 'trade-secret' ? '#EF4444' : '#F59E0B',
                    }}
                  >
                    {expert.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{expert.name}</span>
                      {selectedExpert?.id === expert.id && <Check size={12} style={{ color: 'var(--gold-400)' }} />}
                    </div>
                    <span className="font-tiny text-[var(--text-muted)]">{expert.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star size={10} fill="#FACC15" className="text-[var(--gold-400)]" />
                        <span className="font-tiny" style={{ color: 'var(--gold-400)' }}>{expert.rating}</span>
                      </div>
                      <span className="font-tiny text-[var(--text-muted)]">{expert.completedTasks}项</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {expert.specialty.slice(0, 2).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded-full font-tiny"
                      style={{ background: 'var(--navy-700)', color: 'var(--text-muted)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredExperts.length === 0 && (
            <div className="text-center py-8">
              <Zap size={32} className="mx-auto mb-2 text-[var(--text-muted)] opacity-50" />
              <p className="font-tiny text-[var(--text-muted)]">暂无匹配的专家</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSelectedDetail(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="w-[600px] max-h-[80vh] rounded-xl overflow-hidden"
                style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--navy-700)' }}>
                  <h3 className="font-h4 text-[var(--text-primary)]">专家详情</h3>
                  <button onClick={() => setSelectedDetail(null)} className="p-1 hover:bg-[var(--navy-700)] rounded">
                    <X size={18} className="text-[var(--text-muted)]" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 65px)' }}>
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-semibold shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${selectedDetail.category === 'patent' ? '#3B82F6' :
                          selectedDetail.category === 'trademark' ? '#8B5CF6' :
                          selectedDetail.category === 'copyright' ? '#EC4899' :
                          selectedDetail.category === 'dataip' ? '#14B8A6' :
                          selectedDetail.category === 'trade-secret' ? '#EF4444' : '#F59E0B'}60)`,
                        color: 'white',
                      }}
                    >
                      {selectedDetail.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-[var(--text-primary)]">{selectedDetail.name}</h4>
                        <div className="flex items-center gap-0.5">
                          <Star size={14} fill="#FACC15" className="text-[var(--gold-400)]" />
                          <span className="font-tiny" style={{ color: 'var(--gold-400)' }}>{selectedDetail.rating}</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1">{selectedDetail.title} | {selectedDetail.company}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-[var(--text-muted)]" />
                          <span className="font-tiny text-[var(--text-muted)]">{selectedDetail.experience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase size={12} className="text-[var(--text-muted)]" />
                          <span className="font-tiny text-[var(--text-muted)]">已完成 {selectedDetail.completedTasks} 个</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award size={12} className="text-[var(--text-muted)]" />
                          <span className="font-tiny" style={{ color: 'var(--gold-400)' }}>¥{selectedDetail.hourlyRate}/小时</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2">专家简介</h5>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{selectedDetail.bio}</p>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2">工作流程</h5>
                    <div className="space-y-3">
                      {selectedDetail.workflow.map((step) => (
                        <div key={step.step} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: 'var(--navy-700)', color: 'var(--text-muted)' }}>
                            {step.step}
                          </div>
                          <div>
                            <span className="text-[13px] font-medium text-[var(--text-primary)]">{step.title}</span>
                            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2">专业能力</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDetail.capabilities.map((cap, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold-400)' }} />
                          <span className="text-[12px] text-[var(--text-secondary)]">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2">擅长领域</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedDetail.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full text-[12px]"
                          style={{ background: 'var(--navy-700)', color: 'var(--text-secondary)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectExpert(selectedDetail)}
                    className="w-full py-2.5 rounded-lg font-medium transition-colors"
                    style={{
                      background: selectedExpert?.id === selectedDetail.id ? 'var(--navy-700)' : 'var(--gold-400)',
                      color: selectedExpert?.id === selectedDetail.id ? 'var(--text-primary)' : 'var(--navy-900)',
                    }}
                  >
                    {selectedExpert?.id === selectedDetail.id ? '已选择此专家' : '选择此专家'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}