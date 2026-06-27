import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Plus, X, Sparkles } from 'lucide-react'
import type { Model, ModelStatus } from './types'

interface ModelConfig {
  id: string
  name: string
  provider: string
  apiBase: string
  color: string
  status: 'online' | 'offline' | 'busy'
  apiKey?: string
}

interface ModelSelectorProps {
  selectedModelId: string
  onSelectModel: (id: string) => void
  expertMode: boolean
  temperature: number
  onTemperatureChange: (val: number) => void
  availableModels: ModelConfig[]
  onAddModel: (model: Omit<ModelConfig, 'id'>) => void
}

const models: Model[] = [
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: '深度求索',
    status: 'online',
    tags: [
      { key: 'code', label: '代码强', color: '#3B82F6' },
      { key: 'chinese', label: '中文强', color: '#22C55E' },
      { key: 'reasoning', label: '推理强', color: '#8B5CF6' },
    ],
    description: 'DeepSeek最新大模型，综合能力最强',
  },
  {
    id: 'qwen-max',
    name: 'Qwen-Max',
    provider: '阿里云通义',
    status: 'online',
    tags: [
      { key: 'chinese', label: '中文强', color: '#22C55E' },
      { key: 'long-context', label: '长文强', color: '#F59E0B' },
    ],
    description: '阿里云大模型，中文场景优化',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    status: 'busy',
    tags: [
      { key: 'reasoning', label: '推理强', color: '#8B5CF6' },
      { key: 'multilingual', label: '多语言', color: '#EC4899' },
    ],
    description: 'OpenAI旗舰模型，推理能力出色',
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    status: 'online',
    tags: [
      { key: 'long-context', label: '长文强', color: '#F59E0B' },
      { key: 'safety', label: '安全强', color: '#14B8A6' },
    ],
    description: 'Anthropic模型，超长上下文窗口',
  },
  {
    id: 'glm-4',
    name: 'GLM-4',
    provider: '智谱AI',
    status: 'online',
    tags: [
      { key: 'chinese', label: '中文强', color: '#22C55E' },
      { key: 'reasoning', label: '推理强', color: '#8B5CF6' },
    ],
    description: '智谱AI大模型，中文理解优秀',
  },
  {
    id: 'doubao',
    name: '豆包 Pro',
    provider: '字节跳动',
    status: 'online',
    tags: [
      { key: 'chinese', label: '中文强', color: '#22C55E' },
      { key: 'multimodal', label: '多模态', color: '#EC4899' },
    ],
    description: '字节跳动大模型，多模态能力强',
  },
]

const statusConfig: Record<ModelStatus, { color: string; label: string; tooltip: string }> = {
  online: { color: '#22C55E', label: '在线', tooltip: '模型运行正常，响应迅速' },
  busy: { color: '#F59E0B', label: '繁忙', tooltip: '当前负载较高，响应可能延迟' },
  offline: { color: '#EF4444', label: '离线', tooltip: '模型暂时不可用' },
}

const providerColors: Record<string, string> = {
  '深度求索': '#3B82F6',
  '阿里云通义': '#FF6A00',
  'OpenAI': '#10A37F',
  'Anthropic': '#D4A574',
  '智谱AI': '#FF6B6B',
  '字节跳动': '#00A8FF',
  'Custom': '#10B981',
}

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  expertMode,
  temperature,
  onTemperatureChange,
  availableModels,
  onAddModel,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newModel, setNewModel] = useState({ name: '', apiKey: '', apiBase: '', provider: 'Custom' })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedModel = models.find((m) => m.id === selectedModelId) || 
                       availableModels.find((m) => m.id === selectedModelId) || 
                       models[0]
  
  const status = statusConfig[selectedModel.status]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setShowAddForm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddCustomModel = () => {
    if (!newModel.name || !newModel.apiBase) return
    onAddModel({
      name: newModel.name,
      provider: newModel.provider,
      apiBase: newModel.apiBase,
      color: '#10B981',
      status: 'online',
      apiKey: newModel.apiKey || undefined,
    })
    setNewModel({ name: '', apiKey: '', apiBase: '', provider: 'Custom' })
    setShowAddForm(false)
  }

  const allModels = [...models, ...availableModels.filter(m => !models.find(builtIn => builtIn.id === m.id))]

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 border"
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderColor: isOpen ? 'var(--gold-400)' : 'var(--navy-700)',
          color: 'var(--text-primary)',
          minWidth: 180,
        }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: (providerColors[selectedModel.provider] || '#10B981') + '20' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: providerColors[selectedModel.provider] || '#10B981' }} />
        </div>
        <span className="flex-1 text-left">{selectedModel.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-[var(--text-muted)]" />
        </motion.div>
      </button>

      <div className="flex items-center gap-1.5" title={status.tooltip}>
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: status.color }}
          animate={selectedModel.status === 'online' ? {
            scale: [1, 1.4, 1],
            opacity: [0.7, 1, 0.7],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-tiny text-[var(--text-muted)]">{status.label}</span>
      </div>

      <AnimatePresence>
        {expertMode && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span className="font-tiny text-[var(--text-muted)] whitespace-nowrap">温度</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="w-20 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--gold-400) 0%, var(--gold-400) ${temperature * 100}%, var(--navy-700) ${temperature * 100}%, var(--navy-700) 100%)`,
              }}
              title="较低 = 更确定，较高 = 更有创意"
            />
            <span
              className="font-tiny min-w-[28px]"
              style={{ color: 'var(--gold-400)', fontFamily: '"JetBrains Mono", monospace' }}
            >
              {temperature.toFixed(1)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="absolute top-[calc(100%+8px)] left-0 z-50 w-96 rounded-lg p-2"
            style={{
              background: 'var(--navy-800)',
              border: '1px solid var(--navy-700)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <span className="font-tiny text-[var(--text-muted)] font-semibold">选择 AI 模型</span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 font-tiny text-[var(--gold-400)] cursor-pointer hover:underline"
              >
                <Plus size={12} />
                添加自定义模型
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-2"
                >
                  <div className="px-3 py-3 rounded-lg border" style={{ background: 'rgba(30,41,59,0.6)', borderColor: 'var(--navy-700)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-tiny font-semibold text-[var(--gold-400)]">添加自定义模型</span>
                      <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-[var(--navy-700)] rounded">
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="模型名称"
                        value={newModel.name}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                        className="w-full px-2 py-1.5 rounded text-[12px] bg-[var(--navy-900)] border border-[var(--navy-700)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--gold-400)]"
                      />
                      <input
                        type="text"
                        placeholder="API Base URL"
                        value={newModel.apiBase}
                        onChange={(e) => setNewModel({ ...newModel, apiBase: e.target.value })}
                        className="w-full px-2 py-1.5 rounded text-[12px] bg-[var(--navy-900)] border border-[var(--navy-700)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--gold-400)]"
                      />
                      <input
                        type="password"
                        placeholder="API Key（可选）"
                        value={newModel.apiKey}
                        onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                        className="w-full px-2 py-1.5 rounded text-[12px] bg-[var(--navy-900)] border border-[var(--navy-700)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--gold-400)]"
                      />
                      <button
                        onClick={handleAddCustomModel}
                        disabled={!newModel.name || !newModel.apiBase}
                        className="w-full px-3 py-1.5 rounded text-[12px] font-medium transition-colors"
                        style={{
                          background: 'var(--gold-400)',
                          color: 'var(--navy-900)',
                          opacity: (!newModel.name || !newModel.apiBase) ? 0.5 : 1,
                          cursor: (!newModel.name || !newModel.apiBase) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        添加模型
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {availableModels.length > 0 && (
              <div className="px-3 py-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[var(--gold-400)]" />
                  <span className="font-tiny text-[var(--gold-400)] font-semibold">自定义模型</span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {availableModels.map((model, i) => {
                    const isSelected = model.id === selectedModelId
                    return (
                      <motion.button
                        key={model.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        onClick={() => {
                          onSelectModel(model.id)
                          setIsOpen(false)
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full text-left"
                        style={{
                          background: isSelected ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                          border: isSelected ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid transparent',
                        }}
                      >
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#10B98120' }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: '#22C55E', borderColor: 'var(--navy-800)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)]">{model.name}</span>
                          </div>
                          <span className="font-tiny text-[var(--text-muted)]">自定义</span>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} style={{ color: 'var(--gold-400)' }} />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {models.map((model, i) => {
                const modelStatus = statusConfig[model.status]
                const isSelected = model.id === selectedModelId
                return (
                  <motion.button
                    key={model.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    onClick={() => {
                      onSelectModel(model.id)
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full text-left"
                    style={{
                      background: isSelected ? 'rgba(250, 204, 21, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid transparent',
                    }}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: providerColors[model.provider] + '20' }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: providerColors[model.provider] }} />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: modelStatus.color, borderColor: 'var(--navy-800)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">{model.name}</span>
                      </div>
                      <span className="font-tiny text-[var(--text-muted)]">{model.provider}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {model.tags.slice(0, 2).map((tag) => (
                        <span key={tag.key} className="px-1.5 py-0.5 rounded-full font-tiny" style={{ background: tag.color + '20', color: tag.color }}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={14} style={{ color: 'var(--gold-400)' }} />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}