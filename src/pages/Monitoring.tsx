import { useState } from 'react'
import Layout from '../components/Layout'

interface Platform {
  id: string
  name: string
  status: 'active' | 'idle' | 'error'
  detections: number
  lastScan: string
}

const platforms: Platform[] = [
  { id: '1', name: '抖音', status: 'active', detections: 12, lastScan: '2分钟前' },
  { id: '2', name: '淘宝', status: 'active', detections: 8, lastScan: '5分钟前' },
  { id: '3', name: '京东', status: 'active', detections: 3, lastScan: '10分钟前' },
  { id: '4', name: '拼多多', status: 'idle', detections: 0, lastScan: '1小时前' },
  { id: '5', name: '微信视频号', status: 'active', detections: 5, lastScan: '8分钟前' },
  { id: '6', name: '微博', status: 'error', detections: 0, lastScan: '3小时前' },
]

const statusConfig = {
  active: { label: '监测中', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', dot: 'animate-pulse' },
  idle: { label: '待机', color: 'var(--text-muted)', bg: 'rgba(100, 116, 139, 0.1)', dot: '' },
  error: { label: '异常', color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.1)', dot: '' },
}

export default function Monitoring() {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)

  const startScan = () => {
    setScanning(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const totalDetections = platforms.reduce((acc, p) => acc + p.detections, 0)

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-h1 text-white mb-2">版权侵权监测中心</h1>
            <p className="font-body text-[var(--text-secondary)]">7×24 实时多模态比对，全网侵权监测与预警</p>
          </div>
          <button
            onClick={startScan}
            disabled={scanning}
            className="px-6 py-3 rounded-[var(--radius-md)] font-semibold text-[var(--navy-900)] transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gold-400)' }}
          >
            {scanning ? '扫描中...' : '启动扫描'}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 text-center" style={{ borderLeft: '3px solid var(--gold-400)' }}>
            <p className="font-h2 text-gold-400">{totalDetections}</p>
            <p className="font-small text-[var(--text-secondary)]">今日侵权检测</p>
          </div>
          <div className="glass-card p-5 text-center" style={{ borderLeft: '3px solid var(--success)' }}>
            <p className="font-h2 text-green-500">6</p>
            <p className="font-small text-[var(--text-secondary)]">监测平台数</p>
          </div>
          <div className="glass-card p-5 text-center" style={{ borderLeft: '3px solid var(--info)' }}>
            <p className="font-h2 text-blue-400">99.2%</p>
            <p className="font-small text-[var(--text-secondary)]">识别准确率</p>
          </div>
          <div className="glass-card p-5 text-center" style={{ borderLeft: '3px solid var(--warning)' }}>
            <p className="font-h2 text-amber-400">&lt; 3min</p>
            <p className="font-small text-[var(--text-secondary)]">平均响应时间</p>
          </div>
        </div>

        {/* Progress */}
        {scanning && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-h4 text-white">正在全网扫描...</span>
              <span className="font-tiny text-gold-400 ml-auto">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--navy-700)] overflow-hidden">
              <div className="h-full rounded-full bg-gold-400 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Platform List */}
        <h3 className="font-h4 text-white mb-4">监测平台状态</h3>
        <div className="space-y-2 mb-8">
          {platforms.map((platform) => {
            const config = statusConfig[platform.status]
            return (
              <div
                key={platform.id}
                className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] transition-all duration-200"
                style={{ background: 'var(--navy-800)', border: '1px solid var(--navy-700)' }}
              >
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} style={{ background: config.color }} />
                  <span className="font-small font-semibold text-white">{platform.name}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full font-tiny font-semibold"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.label}
                </span>
                <span className="font-small text-[var(--text-secondary)] ml-auto">
                  检测 {platform.detections} 个
                </span>
                <span className="font-tiny text-[var(--text-muted)] min-w-[80px] text-right">
                  {platform.lastScan}
                </span>
              </div>
            )
          })}
        </div>

        {/* Recent Detections */}
        <h3 className="font-h4 text-white mb-4">近期检测结果</h3>
        <div className="glass-card p-6">
          <div className="space-y-3">
            {[
              { content: '疑似侵权图片 · 抖音 · 相似度 92%', time: '2分钟前', type: '图片' },
              { content: '文本抄袭检测 · 淘宝 · 相似度 85%', time: '8分钟前', type: '文本' },
              { content: '视频片段比对 · 微信视频号 · 相似度 78%', time: '15分钟前', type: '视频' },
              { content: '商标近似检测 · 京东 · 相似度 71%', time: '32分钟前', type: '商标' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg"
                style={{ background: 'var(--navy-900)', border: '1px solid var(--navy-700)' }}
              >
                <span
                  className="px-2 py-0.5 rounded font-tiny font-semibold"
                  style={{ background: 'rgba(250, 204, 21, 0.1)', color: 'var(--gold-400)' }}
                >
                  {item.type}
                </span>
                <span className="font-small text-white flex-1">{item.content}</span>
                <span className="font-tiny text-[var(--text-muted)]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}