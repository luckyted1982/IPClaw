export type ModelStatus = 'online' | 'offline' | 'busy'

export interface ModelTag {
  key: string
  label: string
  color: string
}

export interface Model {
  id: string
  name: string
  provider: string
  status: ModelStatus
  tags: ModelTag[]
  description: string
}

export type SkillCategory = 'patent' | 'trademark' | 'copyright' | 'valuation' | 'legal' | 'general'

export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  icon: string
  color: string
  usage: number
  favorited: boolean
  author: string
}

export type FileType = 'pdf' | 'docx' | 'txt' | 'xlsx' | 'png' | 'jpg'
export type FileStatus = 'uploading' | 'done' | 'error'

export interface UploadedFile {
  id: string
  name: string
  type: FileType
  size: string
  rawSize: number
  status: FileStatus
  progress: number
}

export type ThinkingStatus = 'pending' | 'running' | 'completed' | 'error'

export interface ThinkingStep {
  id: string
  description: string
  status: ThinkingStatus
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: ThinkingStep[]
  timestamp: string
  isTyping?: boolean
}

export interface DirectoryNode {
  id: string
  name: string
  type: 'folder' | 'file'
  path: string
  children?: DirectoryNode[]
}
