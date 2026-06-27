import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, Image, Check } from 'lucide-react'
import type { UploadedFile, FileType } from './types'

const fileTypeConfig: Record<FileType, { icon: typeof FileText; color: string; ext: string }> = {
  pdf: { icon: FileText, color: '#EF4444', ext: 'PDF' },
  docx: { icon: FileText, color: '#3B82F6', ext: 'DOCX' },
  txt: { icon: FileText, color: '#64748B', ext: 'TXT' },
  xlsx: { icon: FileText, color: '#22C55E', ext: 'XLSX' },
  png: { icon: Image, color: '#8B5CF6', ext: 'PNG' },
  jpg: { icon: Image, color: '#8B5CF6', ext: 'JPG' },
}

interface FileUploadZoneProps {
  expanded: boolean
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void
}

export default function FileUploadZone({ expanded, files, onFilesChange }: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    // Simulate file upload
    const newFiles: UploadedFile[] = Array.from(e.dataTransfer.files).map((f, i) => ({
      id: `dropped-${Date.now()}-${i}`,
      name: f.name,
      type: getFileType(f.name),
      size: formatSize(f.size),
      rawSize: f.size,
      status: 'uploading' as const,
      progress: 0,
    }))
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles])
      simulateUploadProgress(newFiles)
    }
  }, [files, onFilesChange])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles: UploadedFile[] = Array.from(e.target.files).map((f, i) => ({
      id: `selected-${Date.now()}-${i}`,
      name: f.name,
      type: getFileType(f.name),
      size: formatSize(f.size),
      rawSize: f.size,
      status: 'uploading' as const,
      progress: 0,
    }))
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles])
      simulateUploadProgress(newFiles)
    }
    e.target.value = ''
  }, [files, onFilesChange])

  const simulateUploadProgress = (newFiles: UploadedFile[]) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      onFilesChange((prev: UploadedFile[]) => prev.map((f: UploadedFile) => {
        if (newFiles.find((nf: UploadedFile) => nf.id === f.id)) {
          return { ...f, progress: Math.min(progress, 100), status: progress >= 100 ? 'done' as const : 'uploading' as const }
        }
        return f
      }))
      if (progress >= 100) clearInterval(interval)
    }, 200)
  }

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id))
  }

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          className="overflow-hidden"
          style={{ borderTop: '1px solid var(--navy-700)' }}
        >
          <div className="p-4" style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
            {/* Drop Zone */}
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg px-6 py-8 text-center cursor-pointer transition-all duration-300"
              animate={{
                borderColor: isDragOver ? '#FACC15' : 'var(--navy-700)',
                backgroundColor: isDragOver ? 'rgba(250,204,21,0.05)' : 'transparent',
              }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileSelect}
              />
              <motion.div
                animate={{ scale: isDragOver ? 1.1 : 1, color: isDragOver ? '#FACC15' : 'var(--text-muted)' }}
                transition={{ duration: 0.2 }}
              >
                <Upload size={32} className="mx-auto mb-3" />
              </motion.div>
              <p className="font-body text-[var(--text-secondary)]">
                {isDragOver ? '释放以上传' : '拖拽文件到此处，或点击上传'}
              </p>
              <p className="font-tiny text-[var(--text-muted)] mt-1">
                支持 PDF、DOCX、TXT、XLSX、PNG、JPG，单个文件最大 20MB
              </p>
            </motion.div>

            {/* File List */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 mt-3 max-h-[120px] overflow-y-auto"
                >
                  {files.map((file) => {
                    const config = fileTypeConfig[file.type]
                    const Icon = config.icon
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        layout
                        className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                        style={{
                          background: 'var(--navy-800)',
                          borderColor: 'var(--navy-700)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                          style={{ background: config.color + '15' }}
                        >
                          <Icon size={16} style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[var(--text-primary)] truncate">{file.name}</p>
                          <p className="font-tiny text-[var(--text-muted)]">{file.size}</p>
                        </div>
                        {/* Progress */}
                        {file.status === 'uploading' && (
                          <div className="w-16">
                            <div className="h-1 rounded-full bg-[var(--navy-700)] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'var(--gold-400)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}
                        {file.status === 'done' && (
                          <Check size={14} className="text-green-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.id)
                          }}
                          className="p-1 rounded hover:bg-red-500/10 transition-colors"
                        >
                          <X size={14} className="text-[var(--text-muted)] hover:text-red-400" />
                        </button>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  if (ext === 'txt') return 'txt'
  if (ext === 'xlsx') return 'xlsx'
  if (ext === 'png') return 'png'
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg'
  return 'txt'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}