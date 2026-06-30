import { OpenClawAdapter } from './adapters/OpenClawAdapter.js';
import { MCPGateway } from './adapters/MCPGateway.js';

class AgentAdapterFactory {
  constructor() {
    this.adapters = new Map();
    this.registerAdapter('openclaw', OpenClawAdapter);
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