/**
 * IPClaw V2 通用任务模块 - Mock API 服务入口
 *
 * 本模块提供完整的Mock API服务，模拟后端数据交互，
 * 涵盖模型管理、对话、技能、文件、工作目录等核心功能。
 *
 * 所有API函数均返回Promise，并模拟真实网络延迟。
 *
 * @example
 * ```typescript
 * import { getModels, getConversations, sendMessage, getSkills, uploadFile } from '@/services';
 *
 * // 获取模型列表
 * const models = await getModels();
 *
 * // 发送消息
 * const reply = await sendMessage('conv-id', '请帮我分析这个专利');
 * ```
 */

// ─── 类型定义 ───────────────────────────────────

export type {
  Model,
  Message,
  AttachedFile,
  Conversation,
  Skill,
  WorkDirectory,
  ComplianceRule,
  UploadProgress,
  ModelStatus,
  MessageRole,
  FileStatus,
  SkillCategory,
  ComplianceStatus,
} from './types';

// ─── 模型管理API ─────────────────────────────────

export {
  getModels,
  switchModel,
  getActiveModel,
  updateTemperature,
} from './modelApi';

// ─── 对话API ─────────────────────────────────────

export {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  deleteConversation,
  clearMessages,
  toggleExpertMode,
} from './conversationApi';

// ─── 技能API ─────────────────────────────────────

export {
  getSkills,
  getRecentSkills,
  getFavoriteSkills,
  invokeSkill,
  toggleFavorite,
  getSkillDetail,
} from './skillApi';

// ─── 文件API ─────────────────────────────────────

export {
  uploadFile,
  deleteFile,
  getFiles,
  getFile,
  deleteFiles,
} from './fileApi';

// ─── 工作目录API ──────────────────────────────────

export {
  getDirectory,
  createFolder,
  getRecentFolders,
  toggleDirectory,
  refreshDirectory,
} from './directoryApi';

// ─── Mock数据（开发调试用）────────────────────────

export {
  mockModels,
  mockFiles,
  mockSkills,
  mockDirectoryTree,
  mockComplianceRules,
  sampleConversation,
  recentConversations,
  delay,
  generateId,
} from './mockData';
