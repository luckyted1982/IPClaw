/**
 * IPClaw V2 通用任务模块 - 类型定义
 *
 * 本文件定义了Mock API服务使用的全部TypeScript接口，
 * 涵盖模型管理、对话、技能、文件、工作目录等核心数据模型。
 */

/** 模型状态 */
export type ModelStatus = 'online' | 'busy' | 'offline';

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 文件状态 */
export type FileStatus = 'uploading' | 'done' | 'error';

/** 技能分类 */
export type SkillCategory = 'patent' | 'trademark' | 'copyright' | 'assessment' | 'law' | 'general';

/** 合规规则状态 */
export type ComplianceStatus = 'pass' | 'warning' | 'fail' | 'pending' | 'scanning';

/**
 * AI模型
 */
export interface Model {
  id: string;
  name: string;
  provider: string;
  status: ModelStatus;
  capabilities: string[];
  temperature: number;
  maxTokens: number;
}

/**
 * 附件文件
 */
export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  status: FileStatus;
  progress?: number;
}

/**
 * 对话消息
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  thinking?: string;
  files?: AttachedFile[];
  timestamp: Date;
  tokens?: number;
}

/**
 * 对话
 */
export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isExpertMode: boolean;
}

/**
 * 技能
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  author: string;
  authorTitle: string;
  rating: number;
  downloads: number;
  price: string;
  icon: string;
  isFavorite?: boolean;
  isRecent?: boolean;
  systemPrompt: string;
}

/**
 * 工作目录节点
 */
export interface WorkDirectory {
  path: string;
  name: string;
  children?: WorkDirectory[];
  isExpanded?: boolean;
}

/**
 * 合规规则
 */
export interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  status: ComplianceStatus;
  description: string;
  autoFixable: boolean;
}

/**
 * 上传进度
 */
export interface UploadProgress {
  fileId: string;
  progress: number;
  status: FileStatus;
}
