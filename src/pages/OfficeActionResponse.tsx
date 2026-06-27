import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Reply, PlusCircle, FileText, Clock, AlertCircle, CheckCircle, ArrowRight, Search, Filter, LayoutGrid, List, X, Download, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OfficeActionWizard from '@/components/OfficeActionWizard'

const accentColor = '#F59E0B'

const mockCases = [
  { id: 1, caseNumber: 'CN2026001', applicationNumber: '202510012345.6', inventionName: '一种基于深度学习的智能分拣系统', applicant: '深圳市科技创新有限公司', officeActionDate: '2026-06-15', deadline: '2026-10-15', examiner: '张审查员', status: '待答复', statusColor: '#EF4444', type: '第一次审查意见' },
  { id: 2, caseNumber: 'CN2026002', applicationNumber: '202510023456.7', inventionName: '图像识别方法及系统', applicant: '北京智能科技股份有限公司', officeActionDate: '2026-05-20', deadline: '2026-09-20', examiner: '李审查员', status: '审查中', statusColor: '#3B82F6', type: '第二次审查意见' },
  { id: 3, caseNumber: 'CN2026003', applicationNumber: '202510034567.8', inventionName: '数据处理装置及方法', applicant: '上海数据科技有限公司', officeActionDate: '2026-04-10', deadline: '2026-08-10', examiner: '王审查员', status: '已答复', statusColor: '#22C55E', type: '第一次审查意见' },
  { id: 4, caseNumber: 'CN2026004', applicationNumber: '202510045678.9', inventionName: '区块链存证系统及方法', applicant: '杭州区块链科技有限公司', officeActionDate: '2026-06-01', deadline: '2026-10-01', examiner: '赵审查员', status: '待答复', statusColor: '#EF4444', type: '驳回决定' },
  { id: 5, caseNumber: 'CN2026005', applicationNumber: '202510056789.0', inventionName: '智能语音交互方法', applicant: '广州人工智能有限公司', officeActionDate: '2026-03-15', deadline: '2026-07-15', examiner: '刘审查员', status: '已授权', statusColor: '#22C55E', type: '第一次审查意见' },
]

export default function OfficeActionResponse() {
  const [showWizard, setShowWizard] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    if (showWizard) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showWizard])

  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = caseItem.inventionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.applicant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (showWizard) {
    return <OfficeActionWizard />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy-900)' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20` }}>
                <Reply size={24} style={{ color: accentColor }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">审查意见答复</h1>
                <p className="text-sm text-[var(--text-muted)]">智能分析审查意见，自动生成答复策略</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: accentColor, color: 'var(--navy-900)' }}
          >
            <PlusCircle size={18} />
            新建意见答复
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl p-4 border border-[var(--navy-700)]" style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-muted)]">待答复案件</span>
              <AlertCircle size={16} className="text-[var(--danger)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">2</div>
            <div className="text-xs text-[var(--danger)]">2件即将到期</div>
          </div>
          <div className="rounded-xl p-4 border border-[var(--navy-700)]" style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-muted)]">审查中案件</span>
              <Clock size={16} className="text-[var(--primary)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">1</div>
            <div className="text-xs text-[var(--text-muted)]">平均等待 35 天</div>
          </div>
          <div className="rounded-xl p-4 border border-[var(--navy-700)]" style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-muted)]">本月已答复</span>
              <CheckCircle size={16} className="text-[var(--success)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">12</div>
            <div className="text-xs text-[var(--success)]">授权率 91.7%</div>
          </div>
          <div className="rounded-xl p-4 border border-[var(--navy-700)]" style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-muted)]">驳回案件</span>
              <FileText size={16} className="text-[var(--gold-400)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">1</div>
            <div className="text-xs text-[var(--text-muted)]">复审成功率 75%</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="搜索案件编号、发明名称、申请人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-[var(--navy-700)] text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] w-72"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--navy-700)] text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
            >
              <option value="all">全部状态</option>
              <option value="待答复">待答复</option>
              <option value="审查中">审查中</option>
              <option value="已答复">已答复</option>
              <option value="已授权">已授权</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--gold-400)]/10 text-[var(--gold-400)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--gold-400)]/10 text-[var(--gold-400)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--navy-700)] overflow-hidden" style={{ background: 'rgba(15,23,42,0.6)' }}>
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--navy-700)] text-xs font-medium text-[var(--text-muted)]">
            <div className="col-span-2">案件编号</div>
            <div className="col-span-3">发明名称</div>
            <div className="col-span-2">申请人</div>
            <div className="col-span-2">审查类型</div>
            <div className="col-span-2">截止日期</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          <div className="divide-y divide-[var(--navy-700)]">
            {filteredCases.map((caseItem) => (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-[var(--navy-700)]/30 transition-colors cursor-pointer"
              >
                <div className="col-span-2">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{caseItem.caseNumber}</div>
                  <div className="text-xs text-[var(--text-muted)]">{caseItem.applicationNumber}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-[var(--text-primary)] truncate">{caseItem.inventionName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${caseItem.statusColor}20`, color: caseItem.statusColor }}>
                      {caseItem.status}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-[var(--text-secondary)] truncate">{caseItem.applicant}</div>
                  <div className="text-xs text-[var(--text-muted)]">{caseItem.examiner}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-[var(--text-secondary)]">{caseItem.type}</div>
                  <div className="text-xs text-[var(--text-muted)]">{caseItem.officeActionDate}</div>
                </div>
                <div className="col-span-2">
                  <div className={`text-sm ${new Date(caseItem.deadline) < new Date() ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}`}>
                    {caseItem.deadline}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {new Date(caseItem.deadline) < new Date() ? '已逾期' : `剩余 ${Math.ceil((new Date(caseItem.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天`}
                  </div>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button className="p-2 text-[var(--text-muted)] hover:text-[var(--gold-400)] transition-colors">
                    <Download size={16} />
                  </button>
                  <button className="p-2 text-[var(--text-muted)] hover:text-[var(--gold-400)] transition-colors">
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--gold-400)] text-[var(--gold-400)] hover:bg-[var(--gold-400)] hover:text-[var(--navy-900)] transition-colors"
                  >
                    答复
                    <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-[var(--navy-600)]" />
            <p className="text-[var(--text-muted)]">暂无符合条件的案件</p>
          </div>
        )}
      </div>
    </div>
  )
}