import fetch from 'node-fetch';

export class MCPGateway {
  constructor() {
    this.servers = new Map();
  }

  async execute(config, messages, options = {}) {
    const { serverUrl, apiKey } = config;
    const { stream = false } = options;

    if (!serverUrl) {
      throw new Error('MCP server URL is required');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${serverUrl}/api/v1/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          stream,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`MCP server error: ${errorData.message || response.status}`);
      }

      if (stream) {
        return response.body;
      }

      const result = await response.json();
      return {
        content: result.content || '',
        usage: result.usage,
      };
    } catch (error) {
      console.error('MCP gateway error:', error);
      throw error;
    }
  }

  async listAgents(config) {
    const { serverUrl, apiKey } = config;

    if (!serverUrl) {
      throw new Error('MCP server URL is required');
    }

    try {
      const headers = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${serverUrl}/api/v1/tools`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.status}`);
      }

      const result = await response.json();
      return result.tools || [];
    } catch (error) {
      console.error('MCP list tools error:', error);
      throw error;
    }
  }

  async getServerInfo(config) {
    const { serverUrl, apiKey } = config;

    if (!serverUrl) {
      throw new Error('MCP server URL is required');
    }

    try {
      const headers = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${serverUrl}/api/v1/info`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`MCP server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MCP server info error:', error);
      throw error;
    }
  }

  async registerServer(serverId, config) {
    this.servers.set(serverId, config);
    return { success: true, serverId };
  }

  async unregisterServer(serverId) {
    return this.servers.delete(serverId);
  }

  listRegisteredServers() {
    return Array.from(this.servers.entries()).map(([id, config]) => ({
      id,
      ...config,
    }));
  }
}