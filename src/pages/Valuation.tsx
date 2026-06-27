import { useState } from 'react'
import Layout from '../components/Layout'

interface Dimension {
  id: string
  name: string
  score: number
  weight: string
  description: string
}

const dimensions: Dimension[] = [
  { id: '1', name: '技术创新度', score: 85, weight: '30%', description: '技术先进性、替代性、研发难度' },
  { id: '2', name: '法律稳定性', score: 92, weight: '25%', description: '权利要求有效性、审查历史、无效风险' },
  { id: '3', name: '市场价值', score: 78, weight: '25%', description: '市场规模、竞争格局、商业化前景' },
  { id: '4', name: '战略价值', score: 88, weight: '20%', description: '专利布局、防御价值、许可潜力' },
]

export default function Valuation() {
  const [assessing, setAssessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const startAssessment = () => {
    setAssessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setAssessing(false)
          return 100
        }
        return prev + 5
      })
    }, 150)
  }

  const overallScore = Math.round(
    dimensions.reduce((acc, d) => acc + d.score * (parseInt(d.weight) / 100), 0)
  )

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-h1 text-white mb-2">专利价值评估</h1>
            <p className="font-body text-[var(--text-secondary)]">多维度评估模型，技术/法律/市场三维度分析</p>
          </div>
          <button
            onClick={startAssessment}
            disabled={assessing}
            className="px-6 py-3 rounded-[var(--radius-md)] font-semibold text-[var(--navy-900)] transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gold-400)' }}
          >
            {assessing ? '评估中...' : '开始评估'}
          </button>
        </div>

        {/* Assessment Progress */}
        {assessing && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-h4 text-white">正在评估专利价值...</span>
              <span className="font-tiny text-gold-400 ml-auto">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--navy-700)] overflow-hidden">
              <div className="h-full rounded-full bg-gold-400 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Overall Score */}
        <div className="glass-card p-8 mb-8 text-center">
          <p className="font-tiny text-[var(--text-muted)] mb-4">综合评分</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="font-display"
              style={{
                color: overallScore >= 80 ? 'var(--gold-400)' : overallScore >= 60 ? 'var(--warning)' : 'var(--error)',
              }}
            >
              {overallScore}
            </span>
            <span className="font-h2 text-[var(--text-muted)]">/ 100</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              className="px-3 py-1 rounded-full font-tiny font-semibold"
              style={{
                background: overallScore >= 80 ? 'rgba(250, 204, 21, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: overallScore >= 80 ? 'var(--gold-400)' : 'var(--warning)',
              }}
            >
              {overallScore >= 80 ? '高价值' : overallScore >= 60 ? '中等价值' : '低价值'}
            </span>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4">
          <h3 className="font-h4 text-white mb-4">评估维度</h3>
          {dimensions.map((dim) => (
            <div
              key={dim.id}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-h4 text-white">{dim.name}</span>
                  <span
                    className="px-2 py-0.5 rounded font-tiny"
                    style={{ background: 'var(--navy-700)', color: 'var(--text-muted)' }}
                  >
                    权重 {dim.weight}
                  </span>
                </div>
                <span
                  className="font-h3"
                  style={{
                    color: dim.score >= 80 ? 'var(--gold-400)' : dim.score >= 60 ? 'var(--warning)' : 'var(--error)',
                  }}
                >
                  {dim.score}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--navy-700)] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${dim.score}%`,
                    background: dim.score >= 80 ? 'var(--gold-400)' : dim.score >= 60 ? 'var(--warning)' : 'var(--error)',
                  }}
                />
              </div>
              <p className="font-small text-[var(--text-muted)]">{dim.description}</p>
            </div>
          ))}
        </div>

        {/* Value Summary */}
        <div className="glass-card p-6 mt-8">
          <h3 className="font-h4 text-white mb-4">价值分析摘要</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="font-h3 text-gold-400 mb-1">¥500万 - ¥800万</p>
              <p className="font-small text-[var(--text-secondary)]">估值区间</p>
            </div>
            <div className="text-center">
              <p className="font-h3 text-gold-400 mb-1">2周</p>
              <p className="font-small text-[var(--text-secondary)]">评估周期</p>
            </div>
            <div className="text-center">
              <p className="font-h3 text-gold-400 mb-1">A级</p>
              <p className="font-small text-[var(--text-secondary)]">推荐等级</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}