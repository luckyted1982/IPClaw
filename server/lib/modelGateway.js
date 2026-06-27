import fetch from 'node-fetch';
import prisma from './prisma.js';

const DEFAULT_MODELS = {
  deepseek: {
    type: 'deepseek',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
    modelName: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  },
};

export async function getModelConfig(modelName) {
  const config = await prisma.modelConfig.findUnique({ where: { name: modelName } });
  
  if (config) {
    return {
      type: config.type,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      modelName: config.modelName,
    };
  }

  return DEFAULT_MODELS[modelName] || DEFAULT_MODELS.deepseek;
}

export async function callModel(modelName, messages, options = {}) {
  const config = await getModelConfig(modelName);
  
  const {
    temperature = 0.7,
    stream = false,
    maxTokens = 4096,
    tools = [],
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  };

  const body = JSON.stringify({
    model: config.modelName,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
    ...(tools.length > 0 && { tools }),
  });

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model API error: ${response.status} - ${errorText}`);
  }

  return response;
}

export async function listModels() {
  const configs = await prisma.modelConfig.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      modelName: true,
      enabled: true,
    },
  });

  const defaultModels = Object.keys(DEFAULT_MODELS).map((key) => ({
    id: `default_${key}`,
    name: key,
    type: DEFAULT_MODELS[key].type,
    modelName: DEFAULT_MODELS[key].modelName,
    enabled: true,
    isDefault: true,
  }));

  return [...defaultModels, ...configs];
}

export async function addModelConfig(config) {
  const existing = await prisma.modelConfig.findUnique({ where: { name: config.name } });
  if (existing) {
    throw new Error('Model configuration already exists');
  }

  return await prisma.modelConfig.create({
    data: {
      name: config.name,
      type: config.type,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      modelName: config.modelName,
      enabled: config.enabled ?? true,
    },
  });
}

export async function updateModelConfig(name, config) {
  return await prisma.modelConfig.update({
    where: { name },
    data: {
      ...(config.type && { type: config.type }),
      ...(config.apiKey && { apiKey: config.apiKey }),
      ...(config.baseUrl && { baseUrl: config.baseUrl }),
      ...(config.modelName && { modelName: config.modelName }),
      ...(config.enabled !== undefined && { enabled: config.enabled }),
    },
  });
}

export async function deleteModelConfig(name) {
  return await prisma.modelConfig.delete({ where: { name } });
}