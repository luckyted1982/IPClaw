export default function BottomBar() {
  return (
    <div
      className="h-10 flex items-center justify-between px-6 shrink-0 text-xs"
      style={{
        background: 'var(--navy-950)',
        borderTop: '1px solid var(--navy-700)',
      }}
    >
      {/* Left: System Status */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[var(--text-secondary)] font-medium">系统在线</span>
      </div>

      {/* Center: Token Savings */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <span>🧠</span>
        <span className="font-mono text-[var(--gold-400)] font-semibold">活跃记忆: 87% Token 已节省</span>
      </div>

      {/* Right: MCP Protocol */}
      <div
        className="px-3 py-1 rounded-full font-tiny font-semibold"
        style={{
          background: 'rgba(59, 130, 246, 0.15)',
          color: 'var(--info)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        MCP Protocol v2.1
      </div>
    </div>
  )
}