/**
 * IPClaw V2 通用任务模块 - 文件上传API
 *
 * 提供文件上传、删除、查询等操作，模拟上传进度和文件管理。
 */

import type { AttachedFile } from './types';
import { mockFiles, delay, generateId } from './mockData';

// 内存中维护文件数据
let files = [...mockFiles];

/**
 * 上传文件（模拟上传过程）
 * @param file 浏览器File对象
 * @param onProgress 进度回调函数
 * @returns 上传完成的文件信息
 */
export async function uploadFile(
  file: File,
  onProgress: (progress: number) => void
): Promise<AttachedFile> {
  // 1. 创建文件记录
  const fileId = generateId('file-');
  const totalSize = file.size;

  // 检查文件大小限制（50MB）
  const maxSize = 50 * 1024 * 1024;
  if (totalSize > maxSize) {
    throw new Error(
      `文件 "${file.name}" 大小超过50MB限制，请压缩后重新上传`
    );
  }

  const newFile: AttachedFile = {
    id: fileId,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: totalSize,
    url: `/uploads/${file.name}`,
    status: 'uploading',
    progress: 0,
  };

  files.push(newFile);

  // 2. 模拟分段上传（1.5秒内完成，每100ms更新一次进度）
  const totalDuration = 1500; // 1.5秒
  const updateInterval = 100; // 每100ms更新
  const steps = totalDuration / updateInterval;
  const progressPerStep = 100 / steps;

  for (let i = 0; i < steps; i++) {
    await delay(updateInterval);
    const progress = Math.min(
      Math.round((i + 1) * progressPerStep),
      100
    );
    newFile.progress = progress;
    onProgress(progress);
  }

  // 3. 上传完成
  newFile.progress = 100;
  newFile.status = 'done';

  // 如果是图片类型，添加缩略图
  if (file.type.startsWith('image/')) {
    newFile.thumbnail = `/thumbnails/${file.name}`;
  }

  onProgress(100);
  return { ...newFile };
}

/**
 * 删除文件
 * @param fileId 文件ID
 */
export async function deleteFile(fileId: string): Promise<void> {
  await delay(200);
  const idx = files.findIndex((f) => f.id === fileId);
  if (idx === -1) {
    throw new Error(`文件 "${fileId}" 不存在`);
  }
  files.splice(idx, 1);
}

/**
 * 获取所有文件列表
 * @returns 文件列表Promise
 */
export async function getFiles(): Promise<AttachedFile[]> {
  await delay(200);
  return [...files];
}

/**
 * 根据ID获取单个文件
 * @param fileId 文件ID
 * @returns 文件信息
 */
export async function getFile(fileId: string): Promise<AttachedFile> {
  await delay(200);
  const file = files.find((f) => f.id === fileId);
  if (!file) {
    throw new Error(`文件 "${fileId}" 不存在`);
  }
  return { ...file };
}

/**
 * 批量删除文件
 * @param fileIds 文件ID数组
 */
export async function deleteFiles(fileIds: string[]): Promise<void> {
  await delay(300);
  files = files.filter((f) => !fileIds.includes(f.id));
}
