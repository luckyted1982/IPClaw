/**
 * IPClaw V2 通用任务模块 - 模型管理API
 *
 * 提供AI模型的查询、切换、参数调整等操作，模拟后端服务延迟。
 */

import type { Model } from './types';
import { mockModels, delay } from './mockData';

let currentModels = [...mockModels];
let activeModelId = mockModels[0].id;

/**
 * 获取所有可用AI模型列表
 * @returns 模型列表Promise
 */
export async function getModels(): Promise<Model[]> {
  await delay(300);
  return [...currentModels];
}

/**
 * 切换当前使用的AI模型
 * @param modelId 目标模型ID
 * @returns 切换后的模型信息
 */
export async function switchModel(modelId: string): Promise<Model> {
  await delay(500);
  const model = currentModels.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`模型 "${modelId}" 不存在，请检查模型ID是否正确`);
  }
  if (model.status === 'offline') {
    throw new Error(`模型 "${model.name}" 当前离线，请切换其他模型`);
  }
  activeModelId = modelId;
  return { ...model };
}

/**
 * 获取当前激活的模型
 * @returns 当前激活的模型
 */
export async function getActiveModel(): Promise<Model> {
  await delay(200);
  const model = currentModels.find((m) => m.id === activeModelId);
  if (!model) {
    throw new Error('未找到激活的模型');
  }
  return { ...model };
}

/**
 * 更新模型的温度参数
 * @param modelId 模型ID
 * @param temp 温度值（0-1）
 */
export async function updateTemperature(
  modelId: string,
  temp: number
): Promise<void> {
  await delay(200);
  if (temp < 0 || temp > 1) {
    throw new Error('温度值必须在0到1之间');
  }
  const model = currentModels.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`模型 "${modelId}" 不存在`);
  }
  model.temperature = Math.round(temp * 10) / 10;
}
