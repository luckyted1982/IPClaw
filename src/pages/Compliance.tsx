import { useState } from 'react'
import Layout from '../components/Layout'

interface Rule {
  id: string
  name: string
  status: 'pass' | 'warning' | 'fail'
  description: string
}

const rules: Rule[] = [
  { id: '1', name: '说明书充分公开', status: 'pass', description: '技术方案描述完整，所属领域技术人员可实现' },
  { id: '2', name: '权利要求清晰', status: 'pass', description: '权利要求保护范围明确，无歧义表述' },
  { id: '3', name: '新颖性审查', status: 'pass', description: '技术方案未被现有技术公开' },
  { id: '4', name: '创造性审查', status: 'warning', description: '建议补充技术效果的对比数据' },
  { id: '5', name: '单一性检查', status: 'pass', description: '权利要求属于同一发明构思' },
  { id: '6', name: '引用基础检查', status: 'pass', description: '从属权利要求引用基础正确' },
  { id: '7', name: '术语一致性', status: 'pass', description: '全文术语使用一致，无矛盾' },
  { id: '8', name: '附图说明', status: 'pass', description: '附图标记与说明书记载一致' },
  { id: '9', name: '摘要规范', status: 'pass', description: '摘要不超过300字，包含关键技术特征' },
  { id: '10', name: '优先权核查', status: 'pass', description: '优先权主张符合法定期限' },
  { id: '11', name: '申请人资格', status: 'pass', description: '申请人具备申请资格' },
  { id: '12', name: '费用缴纳', status: 'fail', description: '申请费尚未缴纳，请尽快完成缴费' },
]

const statusConfig = {
  pass: { label: '通过', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)' },
  warning: { label: '警告', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  fail: { label: '未通过', color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.1)' },
}

export default function Compliance() {
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)

  const startScan = () => {
    setScanning(true)
    setScanComplete(false)
    setScanProgress(0)
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          setScanComplete(true)
          return 100
        }
        return prev + 8
      })
    }, 200)
  }

  const passCount = rules.filter((r) => r.status === 'pass').length
  const warningCount = rules.filter((r) => r.status === 'warning').length
  const failCount = rules.filter((r) => r.status === 'fail').length

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-h1 text-white mb-2">IP 合规检测引擎</h1>
            <p className="font-body text-[var(--text-secondary)]">一键合规扫描，12条规则检测，国知局标准</p>
          </div>
          <button
            onClick={startScan}
            disabled={scanning}
            className="px-6 py-3 rounded-[var(--radius-md)] font-semibold text-[var(--navy-900)] transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gold-400)' }}
          >
            {scanning ? '检测中...' : '扫描'}
          </button>
        </div>

        {/* Progress */}
        {(scanning || scanComplete) && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-3">
              {scanning && <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />}
              {scanComplete && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span className="font-h4 text-white">{scanning ? '正在检测合规性...' : '检测完成'}</span>
              <span className="font-tiny text-gold-400 ml-auto">{scanProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--navy-700)] overflow-hidden">
              <div className="h-full rounded-full bg-gold-400 transition-all duration-200" style={{ width: `${scanProgress}%` }} />
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center" style={{ borderLeft: '3px solid var(--success)' }}>
            <p className="font-h2" style={{ color: 'var(--success)' }}>{passCount}</p>
            <p className="font-small text-[var(--text-secondary)]">通过</p>
          </div>
          <div className="glass-card p-4 text-center" style={{ borderLeft: '3px solid var(--warning)' }}>
            <p className="font-h2" style={{ color: 'var(--warning)' }}>{warningCount}</p>
            <p className="font-small text-[var(--text-secondary)]">警告</p>
          </div>
          <div className="glass-card p-4 text-center" style={{ borderLeft: '3px solid var(--error)' }}>
            <p className="font-h2" style={{ color: 'var(--error)' }}>{failCount}</p>
            <p className="font-small text-[var(--text-secondary)]">未通过</p>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-2">
          {rules.map((rule) => {
            const config = statusConfig[rule.status]
            return (
              <div
                key={rule.id}
                className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] transition-all duration-200"
                style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: config.bg }}
                >
                  {rule.status === 'pass' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {rule.status === 'warning' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                  {rule.status === 'fail' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-small font-semibold text-white">{rule.name}</p>
                  <p className="font-tiny text-[var(--text-muted)]">{rule.description}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full font-tiny font-semibold shrink-0"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}