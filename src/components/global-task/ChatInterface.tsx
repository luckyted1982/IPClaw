import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, RotateCcw, Sparkles, FileText, Search, Scale, BarChart3, PenTool, Download, FileDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, WidthType, SectionType } from 'docx'
import type { Message, ThinkingStep } from './types'

const welcomeCards = [
  { icon: PenTool, title: '帮我撰写专利', desc: '根据技术方案自动生成专利文档', color: '#3B82F6' },
  { icon: Search, title: '检索相似专利', desc: '快速检索并提供对比分析报告', color: '#8B5CF6' },
  { icon: Scale, title: '分析侵权风险', desc: '多维度评估潜在侵权可能性', color: '#EF4444' },
  { icon: BarChart3, title: '评估专利价值', desc: '多维度评估专利的商业价值', color: '#F59E0B' },
  { icon: FileText, title: '优化权利要求', desc: '优化权利要求书的保护范围', color: '#10B981' },
  { icon: Sparkles, title: '商标版权咨询', desc: '商标注册、版权登记全流程指导', color: '#06B6D4' },
]

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: '请帮我分析这份智能分拣系统专利的侵权风险，重点关注权利要求1和权利要求3的保护范围。',
    timestamp: '14:32',
  },
  {
    id: '2',
    role: 'assistant',
    content: `好的，我来为您分析这份智能分拣系统专利的侵权风险。

## 分析概览

基于您提供的专利文件，我重点关注了**权利要求1**和**权利要求3**的保护范围。

### 权利要求1 分析

权利要求1定义了一种基于深度学习的智能分拣系统，其核心特征包括：

1. **图像采集模块** - 采用多光谱摄像头阵列
2. **目标识别单元** - 基于改进的YOLOv8架构
3. **分拣执行机构** - 气动弹射与机械臂协同
4. **控制中枢** - 边缘计算节点+云端协同

### 侵权风险评估

| 风险维度 | 评估等级 | 说明 |
|---------|---------|------|
| 技术特征覆盖度 | 高 | 主要技术特征已被现有专利覆盖 |
| 等同侵权可能 | 中 | 部分算法改进可能构成等同侵权 |
| 规避设计空间 | 低 | 核心架构难以绕过 |
| 无效宣告风险 | 高 | 存在现有技术抗辩可能 |

\`\`\`python
# 侵权风险评分模型
def calculate_risk_score(claims, prior_art):
    """计算综合侵权风险评分"""
    scores = {
        'literal_infringement': 0.75,  # 字面侵权
        'doctrine_of_equivalents': 0.45, # 等同原则
        'design_around': 0.25,          # 规避设计
    }
    return sum(scores.values()) / len(scores)

risk = calculate_risk_score(claims, prior_art)
print(f"综合风险评分: {risk:.2f}")  # 输出: 0.48

\`\`\`

## 建议措施

> **重要提示**: 建议尽快进行\`FTO自由实施分析\`，并考虑以下策略：
> - 申请分案专利以缩小保护范围
> - 针对核心算法申请商业秘密保护
> - 与潜在专利权人进行许可谈判`,
    timestamp: '14:33',
    thinking: [
      { id: 't1', description: '解析专利权利要求结构', status: 'completed' },
      { id: 't2', description: '检索相关现有技术数据库', status: 'completed' },
      { id: 't3', description: '分析技术特征覆盖范围', status: 'completed' },
      { id: 't4', description: '生成风险评估矩阵', status: 'completed' },
      { id: 't5', description: '输出详细分析报告', status: 'completed' },
    ] as ThinkingStep[],
  },
  {
    id: '3',
    role: 'user',
    content: '谢谢分析！那如果我想规避这些风险，有什么具体的建议吗？',
    timestamp: '14:35',
  },
  {
    id: '4',
    role: 'assistant',
    content: `针对规避设计，我为您提供以下具体策略：

## 一、技术架构调整

### 1. 替换核心算法
将现有的 **YOLOv8改进架构** 替换为其他目标检测方案：

- **方案A**: Transformer-based检测器（如DETR系列）
- **方案B**: 轻量化MobileNet backbone + 自定义head
- **方案C**: 多模态融合检测（视觉+激光雷达）

### 2. 改变分拣执行方式

| 原方案 | 规避方案 | 侵权风险 |
|-------|---------|---------|
| 气动弹射+机械臂 | 磁悬浮输送+柔性夹具 | 低 |
| 单点控制 | 分布式边缘节点 | 极低 |
| 固定光谱范围 | 可调谐多波段成像 | 低 |

## 二、专利申请策略

1. **分案申请**: 将独立权利要求拆分为多个专利申请
2. **防御性公开**: 对非核心技术进行提前公开
3. **继续审查**: 利用延续案调整权利要求范围

## 三、商业策略建议

- 与专利权人协商**交叉许可**
- 考虑收购核心专利或专利组合
- 加入专利池降低许可成本

需要我详细展开哪个方面的规避方案？`,
    timestamp: '14:36',
    thinking: [
      { id: 't1', description: '识别高侵权风险技术特征', status: 'completed' },
      { id: 't2', description: '检索替代技术方案', status: 'completed' },
      { id: 't3', description: '评估规避设计可行性', status: 'completed' },
      { id: 't4', description: '制定综合规避策略', status: 'completed' },
    ] as ThinkingStep[],
  },
]

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isTyping: boolean
  onRegenerate: (messageId: string) => void
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  onRegenerate,
}: ChatInterfaceProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ scrollBehavior: 'smooth' }}>
      {messages.length === 0 ? (
        <WelcomeScreen onSelectCard={(text) => onSendMessage(text)} />
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onRegenerate={() => onRegenerate(msg.id)}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={chatEndRef} />
        </>
      )}
    </div>
  )
}

function WelcomeScreen({ onSelectCard }: { onSelectCard: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-8"
    >
      {/* Glow background */}
      <div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(250,204,21,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Icon + Title 组 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="flex items-center gap-4 mb-3"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
            boxShadow: '0 6px 24px rgba(250, 204, 21, 0.2)',
          }}
        >
          <Sparkles size={24} color="#0F172A" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">Agentic 助手</h2>
          <p className="text-xs font-medium" style={{ color: 'var(--gold-400)' }}>
            IPClaw 智能总台 · 多模态 · 31 Agents
          </p>
        </div>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[13px] mb-6 text-center max-w-md"
        style={{ color: 'var(--text-muted)' }}
      >
        输入问题，自动识别意图并调度最合适的专业Agent为您服务。支持专利、商标、版权、数据IP、商业秘密、金融投资全领域
      </motion.p>

      {/* Quick Cards - 3列紧凑网格。 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-2.5 w-full max-w-2xl"
      >
        {welcomeCards.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ y: -2, boxShadow: `0 4px 16px ${card.color}20` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectCard(card.title)}
            className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderColor: 'var(--navy-700)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: card.color + '15' }}
            >
              <card.icon size={17} style={{ color: card.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[var(--text-primary)] leading-tight truncate">{card.title}</p>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5 line-clamp-1">{card.desc}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function MessageBubble({
  message,
  onRegenerate,
}: {
  message: Message
  onRegenerate: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const isUser = message.role === 'user'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportMD = () => {
    setExporting('md')
    const blob = new Blob([message.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `IPClaw_${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  const handleExportDOCX = async () => {
    setExporting('docx')
    try {
      const content = message.content
      const children: (Paragraph | Table)[] = []
      const lines = content.split('\n')
      
      let i = 0
      while (i < lines.length) {
        const line = lines[i]
        
        if (line.startsWith('## ')) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: line.slice(3), bold: true })],
          }))
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: line.slice(4), bold: true })],
          }))
        } else if (line.startsWith('**') && line.endsWith('**')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(2, -2), bold: true })],
          }))
        } else if (line.startsWith('> ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(2), italics: true })],
            indent: { left: 720 },
          }))
        } else if (line.match(/^\|.*\|$/)) {
          const headers = line.split('|').filter(cell => cell.trim())
          const rows: TableRow[] = []
          
          rows.push(new TableRow({
            children: headers.map(h => new TableCell({
              children: [new Paragraph(h.trim())],
              shading: { fill: 'E8E8E8' },
            })),
          }))
          
          i++
          while (i < lines.length && lines[i].match(/^\|.*\|$/)) {
            const cells = lines[i].split('|').filter(cell => cell.trim())
            rows.push(new TableRow({
              children: cells.map(c => new TableCell({
                children: [new Paragraph(c.trim())],
              })),
            }))
            i++
          }
          
          children.push(new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
          }))
          continue
        } else if (line.startsWith('```')) {
          i++
          const codeLines: string[] = []
          while (i < lines.length && !lines[i].startsWith('```')) {
            codeLines.push(lines[i])
            i++
          }
          children.push(new Paragraph({
            children: [new TextRun({ text: codeLines.join('\n'), font: 'Consolas', size: 22 })],
          }))
        } else if (line.trim()) {
          children.push(new Paragraph({
            children: [new TextRun(line)],
          }))
        }
        
        i++
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `IPClaw_${Date.now()}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export DOCX error:', error)
    }
    setExporting(null)
  }

  return (
    <motion.div
      initial={isUser ? { opacity: 0, x: 40, scale: 0.92 } : { opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: isUser ? 0.35 : 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`group relative max-w-[85%] ${isUser ? 'max-w-[80%]' : 'max-w-[85%]'}`}>
        <div
          className={`px-4 py-3 ${isUser ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'}`}
          style={{
            background: isUser
              ? 'var(--navy-700)'
              : 'rgba(250, 204, 21, 0.06)',
            borderLeft: isUser ? 'none' : '3px solid var(--gold-400)',
          }}
        >
          {/* Message Content */}
          <div className="text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="font-tiny text-[var(--text-muted)]">{message.timestamp}</span>
          </div>
        </div>

        {/* Message Actions - appear on hover */}
        <div
          className="absolute -bottom-6 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <button
            onClick={handleCopy}
            title={copied ? '已复制' : '复制'}
            className="p-1.5 rounded hover:bg-[var(--navy-700)] transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-[var(--text-muted)]" />
            )}
          </button>
          {!isUser && (
            <>
              <button
                onClick={onRegenerate}
                title="重新生成"
                className="p-1.5 rounded hover:bg-[var(--navy-700)] transition-colors"
              >
                <RotateCcw size={14} className="text-[var(--text-muted)]" />
              </button>
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="导出"
                  className="p-1.5 rounded hover:bg-[var(--navy-700)] transition-colors"
                >
                  <Download size={14} className="text-[var(--text-muted)]" />
                </button>
                <div className={`absolute right-0 top-full mt-1 w-28 bg-[var(--navy-800)] rounded-lg border border-[var(--navy-700)] shadow-xl z-50 transition-all duration-200 ${showExportMenu ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'}`}>
                  <button
                    onClick={() => { handleExportMD(); setShowExportMenu(false) }}
                    disabled={exporting !== null}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--navy-700)] transition-colors"
                  >
                    <FileText size={14} className="text-[var(--text-muted)]" />
                    <span className="text-[var(--text-secondary)]">导出 MD</span>
                  </button>
                  <button
                    onClick={() => { handleExportDOCX(); setShowExportMenu(false) }}
                    disabled={exporting !== null}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--navy-700)] transition-colors"
                  >
                    <FileDown size={14} className="text-[var(--text-muted)]" />
                    <span className="text-[var(--text-secondary)]">导出 DOCX</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mt-4 mb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--navy-700)', paddingBottom: '4px' }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mt-3 mb-2" style={{ color: 'var(--gold-400)' }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1" style={{ color: 'var(--text-primary)' }}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</strong>
        ),
        code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const isInline = !className

          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded text-[13px]"
                style={{
                  background: 'var(--navy-950)',
                  color: 'var(--gold-400)',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <div className="my-3 rounded-lg overflow-hidden" style={{ background: 'var(--navy-950)' }}>
              {language && (
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid var(--navy-700)' }}
                >
                  <span className="font-tiny text-[var(--text-muted)]">{language}</span>
                  <CopyButton code={String(children)} />
                </div>
              )}
              <SyntaxHighlighter
                language={language || 'text'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'var(--navy-950)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          )
        },
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-[13px] border-collapse" style={{ border: '1px solid var(--navy-700)' }}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ background: 'var(--navy-800)' }}>{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-semibold border" style={{ borderColor: 'var(--navy-700)', color: 'var(--text-primary)' }}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border" style={{ borderColor: 'var(--navy-700)' }}>
            {children}
          </td>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="my-3 pl-4 py-2 border-l-2 rounded-r"
            style={{
              borderLeftColor: 'var(--gold-400)',
              background: 'rgba(250, 204, 21, 0.05)',
              color: 'var(--text-secondary)',
            }}
          >
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-[var(--navy-700)] transition-colors">
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
    </button>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-start"
    >
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-md"
        style={{
          background: 'rgba(250, 204, 21, 0.06)',
          borderLeft: '3px solid var(--gold-400)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[var(--text-muted)]">正在思考</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--gold-400)' }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { sampleMessages }