import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, ChevronRight, FolderOpen, Plus, RefreshCw, Clock } from 'lucide-react'
import type { DirectoryNode } from './types'

const mockDirectory: DirectoryNode = {
  id: 'root',
  name: 'IPClaw',
  type: 'folder',
  path: '/IPClaw',
  children: [
    {
      id: 'projects',
      name: '我的项目',
      type: 'folder',
      path: '/IPClaw/我的项目',
      children: [
        {
          id: 'patent-2024',
          name: '2024专利申请',
          type: 'folder',
          path: '/IPClaw/我的项目/2024专利申请',
          children: [
            { id: 'doc1', name: '发明专利_智能分拣系统.docx', type: 'file', path: '/IPClaw/我的项目/2024专利申请/发明专利_智能分拣系统.docx' },
            { id: 'doc2', name: '权利要求书_初稿.txt', type: 'file', path: '/IPClaw/我的项目/2024专利申请/权利要求书_初稿.txt' },
            {
              id: 'refs',
              name: '参考资料',
              type: 'folder',
              path: '/IPClaw/我的项目/2024专利申请/参考资料',
              children: [],
            },
          ],
        },
        {
          id: 'trademark',
          name: '商标监测',
          type: 'folder',
          path: '/IPClaw/我的项目/商标监测',
          children: [
            { id: 'tm1', name: '近似商标列表.xlsx', type: 'file', path: '/IPClaw/我的项目/商标监测/近似商标列表.xlsx' },
          ],
        },
        {
          id: 'copyright',
          name: '版权登记',
          type: 'folder',
          path: '/IPClaw/我的项目/版权登记',
          children: [
            { id: 'cr1', name: '软件著作权_申请表.pdf', type: 'file', path: '/IPClaw/我的项目/版权登记/软件著作权_申请表.pdf' },
          ],
        },
      ],
    },
    {
      id: 'knowledge',
      name: '知识库',
      type: 'folder',
      path: '/IPClaw/知识库',
      children: [
        { id: 'k1', name: '专利法2020修正.pdf', type: 'file', path: '/IPClaw/知识库/专利法2020修正.pdf' },
        { id: 'k2', name: '审查指南摘要.txt', type: 'file', path: '/IPClaw/知识库/审查指南摘要.txt' },
      ],
    },
    {
      id: 'temp',
      name: '临时文件',
      type: 'folder',
      path: '/IPClaw/临时文件',
      children: [],
    },
  ],
}

const recentFolders = [
  { path: '/IPClaw/我的项目/2024专利申请', time: '2小时前' },
  { path: '/IPClaw/知识库', time: '昨天' },
  { path: '/IPClaw/我的项目/商标监测', time: '3天前' },
]

interface WorkDirectoryProps {
  expanded: boolean
  currentPath: string
  onPathChange: (path: string) => void
}

export default function WorkDirectory({ expanded, currentPath, onPathChange }: WorkDirectoryProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'projects']))

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderTree = (node: DirectoryNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = node.path === currentPath
    const hasChildren = node.children && node.children.length > 0
    const fileCount = node.children?.filter((c) => c.type === 'file').length || 0

    return (
      <div key={node.id}>
        <motion.div
          className="flex items-center gap-1.5 py-1.5 pr-3 rounded-md cursor-pointer transition-colors"
          style={{
            paddingLeft: `calc(12px + ${depth * 16}px)`,
            background: isSelected ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
            color: isSelected ? 'var(--gold-400)' : 'var(--text-secondary)',
          }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleNode(node.id)
              onPathChange(node.path)
            }
          }}
        >
          {node.type === 'folder' && hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight size={12} />
            </motion.div>
          )}
          {node.type === 'folder' && !hasChildren && (
            <div className="w-3" />
          )}
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen size={16} style={{ color: isSelected ? 'var(--gold-400)' : 'var(--text-muted)' }} />
            ) : (
              <Folder size={16} style={{ color: isSelected ? 'var(--gold-400)' : 'var(--text-muted)' }} />
            )
          ) : (
            <div className="w-4" />
          )}
          <span className="text-[13px] truncate flex-1">{node.name}</span>
          {node.type === 'folder' && fileCount > 0 && (
            <span
              className="font-tiny px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--navy-700)', color: 'var(--text-muted)' }}
            >
              {fileCount}
            </span>
          )}
        </motion.div>
        <AnimatePresence>
          {isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {node.children.map((child) => renderTree(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          className="absolute top-[calc(100%+8px)] left-0 z-40 w-80 rounded-lg overflow-hidden"
          style={{
            background: 'var(--navy-800)',
            border: '1px solid var(--navy-700)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          {/* Current Path Breadcrumb */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--navy-700)' }}>
            <div className="flex items-center gap-1 flex-wrap">
              {currentPath.split('/').filter(Boolean).map((segment, i, arr) => (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className="text-[12px] cursor-pointer hover:text-[var(--gold-400)] transition-colors"
                    style={{ color: i === arr.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    onClick={() => {
                      const newPath = '/' + arr.slice(0, i + 1).join('/')
                      onPathChange(newPath)
                    }}
                  >
                    {segment}
                  </span>
                  {i < arr.length - 1 && (
                    <ChevronRight size={10} className="text-[var(--text-muted)]" />
                  )}
                </span>
              ))}
            </div>
            <button
              className="mt-2 text-[11px] font-tiny transition-colors hover:text-[var(--gold-300)]"
              style={{ color: 'var(--gold-400)' }}
            >
              更改目录
            </button>
          </div>

          {/* Recent Folders */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--navy-700)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={12} className="text-[var(--text-muted)]" />
              <span className="font-tiny text-[var(--text-muted)] font-semibold">最近访问</span>
            </div>
            <div className="flex flex-col gap-1">
              {recentFolders.map((rf) => (
                <button
                  key={rf.path}
                  onClick={() => onPathChange(rf.path)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors hover:bg-[rgba(250,204,21,0.06)]"
                >
                  <Folder size={14} className="text-[var(--text-muted)]" />
                  <span className="text-[12px] text-[var(--text-secondary)] truncate flex-1">
                    {rf.path}
                  </span>
                  <span className="font-tiny text-[var(--text-muted)]">{rf.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Directory Tree */}
          <div className="px-2 py-2">
            {renderTree(mockDirectory)}
          </div>

          {/* Actions */}
          <div
            className="px-4 py-3 border-t flex items-center gap-3"
            style={{ borderColor: 'var(--navy-700)' }}
          >
            <button className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--gold-400)] transition-colors">
              <Plus size={12} />
              新建文件夹
            </button>
            <button className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--gold-400)] transition-colors">
              <RefreshCw size={12} />
              刷新
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}