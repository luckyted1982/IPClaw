import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      className="w-full py-10 px-6"
      style={{
        background: 'var(--navy-950)',
        borderTop: '1px solid var(--navy-700)',
      }}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* CTA Section */}
        <div className="text-center mb-12">
          <h2 className="font-h2 text-white mb-3">
            准备好改变知识产权服务了吗?
          </h2>
          <p className="font-body text-[var(--text-secondary)] mb-8">
            IPClaw 是 IP 智能体的 Steam。基于 OpenClaw 构建。
          </p>
          <Link
            to="/patent-writing"
            className="inline-block px-12 py-4 rounded-[var(--radius-md)] font-bold text-[var(--navy-900)] transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--gold-400)',
              boxShadow: '0 4px 20px rgba(250, 204, 21, 0.3)',
            }}
          >
            开始演示
          </Link>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--navy-700)]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gold-400 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-tiny text-[var(--text-muted)]">
              © 2025 IPClaw. 保留所有权利。
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="font-tiny text-[var(--text-muted)] hover:text-gold-400 transition-colors">
              使用条款
            </button>
            <button className="font-tiny text-[var(--text-muted)] hover:text-gold-400 transition-colors">
              隐私政策
            </button>
            <button className="font-tiny text-[var(--text-muted)] hover:text-gold-400 transition-colors">
              联系我们
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}