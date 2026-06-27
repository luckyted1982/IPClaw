import Layout from '../components/Layout'

export default function PatentWriting() {
  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid var(--gold-400)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </div>
          <div>
            <h1 className="font-h1 text-white">AI 专利撰写助手</h1>
            <p className="font-small text-[var(--text-muted)]">上传技术交底书 → AI生成 → 人工审核 → 输出专利草稿</p>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { step: '01', label: '上传', desc: '技术交底书', status: 'complete' },
            { step: '02', label: 'AI处理', desc: '生成专利草稿', status: 'processing' },
            { step: '03', label: '审阅', desc: '人工审核修改', status: 'pending' },
            { step: '04', label: '输出', desc: '最终专利文件', status: 'pending' },
          ].map((item) => (
            <div
              key={item.step}
              className="glass-card p-4 relative"
              style={{
                opacity: item.status === 'pending' ? 0.5 : 1,
                borderLeft: item.status === 'processing' ? '3px solid var(--gold-400)' : undefined,
              }}
            >
              {item.status === 'processing' && (
                <div className="absolute top-3 right-3">
                  <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {item.status === 'complete' && (
                <div className="absolute top-3 right-3 text-green-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
              <span className="font-tiny text-[var(--text-muted)]">{item.step}</span>
              <p className="font-h4 text-white mt-1">{item.label}</p>
              <p className="font-small text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-[var(--navy-700)] rounded-[var(--radius-lg)] p-12 text-center mb-8 hover:border-gold-400/50 transition-colors cursor-pointer"
          style={{ background: 'rgba(30, 41, 59, 0.4)' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(250, 204, 21, 0.08)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="font-h4 text-white mb-2">拖拽文件到此处，或点击上传</p>
          <p className="font-small text-[var(--text-muted)]">支持 PDF、DOCX、TXT，单个文件最大 20MB</p>
        </div>

        {/* Processing Status */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-h4 text-white">AI 处理中...</p>
                <p className="font-small text-[var(--text-muted)]">正在分析技术交底书并生成专利草稿</p>
              </div>
            </div>
            <span className="font-tiny text-gold-400">65%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--navy-700)] overflow-hidden">
            <div className="h-full rounded-full bg-gold-400 transition-all duration-500" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-[var(--radius-md)] font-semibold text-[var(--navy-900)] transition-all duration-200 hover:scale-[1.02]" style={{ background: 'var(--gold-400)' }}>
            通过
          </button>
          <button className="px-6 py-2.5 rounded-[var(--radius-md)] font-semibold text-gold-400 border border-gold-400 transition-all duration-200 hover:bg-gold-400/10 hover:scale-[1.02]">
            编辑
          </button>
          <button className="px-6 py-2.5 rounded-[var(--radius-md)] font-semibold text-[var(--error)] border border-[var(--error)]/30 transition-all duration-200 hover:bg-[var(--error)]/10 hover:scale-[1.02]">
            驳回
          </button>
        </div>
      </div>
    </Layout>
  )
}