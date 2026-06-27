/**
 * IPClaw V2 通用任务模块 - 工作目录API
 *
 * 提供工作目录的查询、创建文件夹、获取最近访问路径等操作。
 */

import type { WorkDirectory } from './types';
import { mockDirectoryTree, delay } from './mockData';

// 内存中维护目录数据
let directoryTree = JSON.parse(JSON.stringify(mockDirectoryTree)) as WorkDirectory[];

// 最近访问的文件夹路径
let recentFolderPaths = [
  '/我的项目/专利分析2025',
  '/我的项目/商标注册2024',
  '/我的项目/版权登记',
  '/我的项目/专利分析2025/参考资料',
  '/我的项目',
];

/**
 * 获取工作目录树
 * @param path 指定路径（可选，返回该路径下的子目录）
 * @returns 目录节点数组
 */
export async function getDirectory(path?: string): Promise<WorkDirectory[]> {
  await delay(300);

  if (!path) {
    // 返回完整的目录树
    return JSON.parse(JSON.stringify(directoryTree)) as WorkDirectory[];
  }

  // 查找指定路径对应的节点
  const node = findNodeByPath(directoryTree, path);
  if (!node) {
    throw new Error(`路径 "${path}" 不存在`);
  }

  return node.children ? JSON.parse(JSON.stringify(node.children)) : [];
}

/**
 * 创建新文件夹
 * @param path 父目录路径
 * @param name 新文件夹名称
 * @returns 新创建的文件夹节点
 */
export async function createFolder(
  path: string,
  name: string
): Promise<WorkDirectory> {
  await delay(400);

  // 验证文件夹名
  if (!name || name.trim().length === 0) {
    throw new Error('文件夹名称不能为空');
  }
  if (name.length > 50) {
    throw new Error('文件夹名称不能超过50个字符');
  }

  // 查找父目录节点
  const parentNode = findNodeByPath(directoryTree, path);
  if (!parentNode) {
    throw new Error(`父目录 "${path}" 不存在`);
  }

  // 确保父目录有children数组
  if (!parentNode.children) {
    parentNode.children = [];
  }

  // 检查是否已存在同名文件夹
  const exists = parentNode.children.some((child) => child.name === name);
  if (exists) {
    throw new Error(`文件夹 "${name}" 已存在`);
  }

  // 创建新文件夹
  const newFolder: WorkDirectory = {
    path: `${path}/${name}`,
    name,
    children: [],
    isExpanded: false,
  };

  parentNode.children.push(newFolder);
  parentNode.children.sort((a, b) => {
    // 文件夹排在文件前面，然后按名称排序
    const aIsFolder = a.children !== undefined || a.name.includes('.');
    const bIsFolder = b.children !== undefined || b.name.includes('.');
    if (aIsFolder === bIsFolder) return a.name.localeCompare(b.name, 'zh-CN');
    return aIsFolder ? -1 : 1;
  });

  // 添加到最近访问
  addRecentPath(newFolder.path);

  return { ...newFolder };
}

/**
 * 获取最近访问的文件夹路径列表
 * @returns 最近访问的路径数组
 */
export async function getRecentFolders(): Promise<string[]> {
  await delay(200);
  return [...recentFolderPaths];
}

/**
 * 展开/折叠目录节点
 * @param path 目录路径
 * @param expanded 是否展开
 */
export async function toggleDirectory(
  path: string,
  expanded: boolean
): Promise<void> {
  await delay(100);
  const node = findNodeByPath(directoryTree, path);
  if (node) {
    node.isExpanded = expanded;
  }
}

/**
 * 刷新目录树（重新加载）
 * @returns 最新的完整目录树
 */
export async function refreshDirectory(): Promise<WorkDirectory[]> {
  await delay(500);
  return JSON.parse(JSON.stringify(directoryTree)) as WorkDirectory[];
}

// ───────────────────────────────────────────────
// 内部辅助函数
// ───────────────────────────────────────────────

/** 根据路径查找目录节点 */
function findNodeByPath(
  nodes: WorkDirectory[],
  path: string
): WorkDirectory | null {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

/** 添加路径到最近访问列表 */
function addRecentPath(path: string): void {
  // 移除已存在的相同路径
  const idx = recentFolderPaths.indexOf(path);
  if (idx !== -1) {
    recentFolderPaths.splice(idx, 1);
  }
  // 添加到开头
  recentFolderPaths.unshift(path);
  // 最多保留10条
  if (recentFolderPaths.length > 10) {
    recentFolderPaths = recentFolderPaths.slice(0, 10);
  }
}
