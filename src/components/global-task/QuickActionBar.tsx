import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Trash2, Download, Settings, X, Keyboard, Monitor, Database } from 'lucide-react'

interface QuickActionBarProps {
  onNewChat: () => void
  onClearChat: () => void
  onExportChat: () => void
}

export default function QuickActionBar({ onNewChat, onClearChat, onExportChat }: QuickActionBarProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="absolute top-4 right-4 z-15 flex gap-1 p-1 rounded-lg"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <ActionButton icon={PlusCircle} label="新对话" tooltip="开始新对话" onClick={onNewChat} />
        <ActionButton icon={Trash2} label="清空" tooltip="清空当前对话" onClick={onClearChat} />
        <ActionButton icon={Download} label="导出" tooltip="导出对话记录" onClick={onExportChat} />
        <ActionButton
          icon={Settings}
          label="设置"
          tooltip="任务设置"
          onClick={() => setShowSettings(true)}
          active={showSettings}
        />
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              onClick={(e) => e.stopPropagation()}
              className="w-[480px] max-h-[70vh] rounded-xl overflow-hidden"
              style={{
                background: 'var(--navy-800)',
                border: '1px solid var(--navy-700)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--navy-700)' }}>
                <h3 className="font-h4 text-[var(--text-primary)]">设置</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded hover:bg-[var(--navy-700)] transition-colors"
                >
                  <X size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 65px)' }}>
                {/* Model Parameters */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Database size={14} className="text-[var(--gold-400)]" />
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">模型参数</h4>
                  </div>
                  <div className="space-y-3 pl-6">
                    <SettingRow label="默认模型" value="DeepSeek-V3" />
                    <SettingRow label="默认温度" value="0.7" />
                    <SettingRow label="最大回复长度" value="4096 tokens" />
                    <SettingRow label="上下文窗口" value="8K" />
                  </div>
                </div>

                {/* Interface Settings */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor size={14} className="text-[var(--gold-400)]" />
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">界面设置</h4>
                  </div>
                  <div className="space-y-3 pl-6">
                    <ToggleRow label="显示时间戳" defaultChecked />
                    <ToggleRow label="显示 Token 统计" defaultChecked={false} />
                    <ToggleRow label="打字机动态" defaultChecked />
                    <SettingRow label="消息密度" value="标准" />
                    <SettingRow label="代码主题" value="深色" />
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Keyboard size={14} className="text-[var(--gold-400)]" />
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">快捷键</h4>
                  </div>
                  <div className="space-y-2 pl-6">
                    <ShortcutRow shortcut="Enter" action="发送消息" />
                    <ShortcutRow shortcut="Shift + Enter" action="换行" />
                    <ShortcutRow shortcut="Ctrl + N" action="新对话" />
                    <ShortcutRow shortcut="Ctrl + Shift + E" action="导出对话" />
                    <ShortcutRow shortcut="Ctrl + ," action="打开设置" />
                    <ShortcutRow shortcut="Esc" action="清空输入" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ActionButton({
  icon: Icon,
  label,
  tooltip,
  onClick,
  active,
}: {
  icon: typeof PlusCircle
  label: string
  tooltip: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200"
      style={{
        color: active ? 'var(--gold-400)' : 'var(--text-muted)',
        background: active ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.style.background = 'rgba(250, 204, 21, 0.06)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <span className="text-[13px] text-[var(--text-primary)] font-medium">{value}</span>
    </div>
  )
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className="relative w-9 h-5 rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--gold-400)' : 'var(--navy-700)' }}
      >
        <motion.div
          animate={{ x: checked ? 16 : 2 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className="absolute top-[2px] w-4 h-4 rounded-full bg-white"
        />
      </button>
    </div>
  )
}

function ShortcutRow({ shortcut, action }: { shortcut: string; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[var(--text-secondary)]">{action}</span>
      <kbd
        className="px-2 py-0.5 rounded font-tiny"
        style={{
          background: 'var(--navy-700)',
          color: 'var(--text-muted)',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {shortcut}
      </kbd>
    </div>
  )
}