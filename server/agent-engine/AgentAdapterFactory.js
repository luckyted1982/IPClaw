import { OpenClawAdapter } from './adapters/OpenClawAdapter.js';
import { HermesAdapter } from './adapters/HermesAdapter.js';
import { MCPGateway } from './adapters/MCPGateway.js';

class AgentAdapterFactory {
  constructor() {
    this.adapters = new Map();
    this.registerAdapter('openclaw', OpenClawAdapter);
    this.registerAdapter('hermes', HermesAdapter);
    this.registerAdapter('mcp', MCPGateway);
  }

  registerAdapter(type, AdapterClass) {
    this.adapters.set(type, AdapterClass);
  }

  getAdapter(type) {
    const AdapterClass = this.adapters.get(type);
    if (!AdapterClass) {
      throw new Error(`Adapter type not supported: ${type}`);
    }
    return new AdapterClass();
  }

  listAdapters() {
    return Array.from(this.adapters.keys());
  }

  getAdapterInfo(type) {
    const descriptions = {
      openclaw: {
        name: 'OpenClaw',
        description: '开源AI协作网络平台，支持多模型、多渠道接入',
        defaultPort: 18789,
        defaultBaseUrl: 'http://localhost:18789',
        features: ['chat', 'tasks', 'agents', 'models', 'gateway', 'health'],
      },
      hermes: {
        name: 'Hermes Agent',
        description: '本地AI智能体框架，具备主动记忆和任务执行能力',
        defaultPort: 8642,
        defaultBaseUrl: 'http://localhost:8642',
        features: ['chat', 'tasks', 'agents', 'models', 'memory', 'health'],
      },
      mcp: {
        name: 'MCP Gateway',
        description: 'Model Context Protocol服务器，支持工具调用',
        defaultPort: 8081,
        defaultBaseUrl: 'http://localhost:8081',
        features: ['tools', 'health'],
      },
    };
    return descriptions[type] || {
      name: type,
      description: 'Unknown adapter',
      features: [],
    };
  }
}

export const agentAdapterFactory = new AgentAdapterFactory();

export async function executeExternalAgent(type, config, messages, options = {}) {
  const adapter = agentAdapterFactory.getAdapter(type);
  return adapter.execute(config, messages, options);
}

export async function listExternalAgents(type, config) {
  const adapter = agentAdapterFactory.getAdapter(type);
  return adapter.listAgents(config);
}

export async function verifyExternalAgentConnection(type, config) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.verifyConnection === 'function') {
    return adapter.verifyConnection(config);
  }
  return {
    success: false,
    message: 'Verification not supported for this adapter type',
  };
}

export async function executeExternalTask(type, config, taskSpec) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.executeTask === 'function') {
    return adapter.executeTask(config, taskSpec);
  }
  throw new Error('executeTask not supported for this adapter type');
}

export async function healthCheckExternalAgent(type, config) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.healthCheck === 'function') {
    return adapter.healthCheck(config);
  }
  return {
    success: false,
    message: 'Health check not supported for this adapter type',
  };
}

export async function listExternalModels(type, config) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.listModels === 'function') {
    return adapter.listModels(config);
  }
  return [];
}

export async function getExternalAgentInfo(type, config, agentId) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.getAgentInfo === 'function') {
    return adapter.getAgentInfo(config, agentId);
  }
  throw new Error('getAgentInfo not supported for this adapter type');
}

export async function getExternalConfig(type, config) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.getConfig === 'function') {
    return adapter.getConfig(config);
  }
  throw new Error('getConfig not supported for this adapter type');
}

export async function registerExternalAgent(type, config, agentData) {
  const adapter = agentAdapterFactory.getAdapter(type);
  if (typeof adapter.registerAgent === 'function') {
    return adapter.registerAgent(config, agentData);
  }
  throw new Error('registerAgent not supported for this adapter type');
}