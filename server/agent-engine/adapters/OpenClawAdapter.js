import fetch from 'node-fetch';

export class OpenClawAdapter {
  constructor() {
    this.baseUrl = process.env.OPENCLAW_BASE_URL || 'https://api.openclaw-cn.com';
  }

  async execute(config, messages, options = {}) {
    const { apiKey, baseUrl = this.baseUrl } = config;
    const { stream = false, temperature = 0.7 } = options;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages,
          temperature,
          stream,
          model: config.model || 'openclaw-chat',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`OpenClaw API error: ${errorData.message || response.status}`);
      }

      if (stream) {
        return response.body;
      }

      const result = await response.json();
      return {
        content: result.choices?.[0]?.message?.content || '',
        usage: result.usage,
      };
    } catch (error) {
      console.error('OpenClaw adapter error:', error);
      throw error;
    }
  }

  async listAgents(config) {
    const { apiKey, baseUrl = this.baseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/agents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      const result = await response.json();
      return result.agents || [];
    } catch (error) {
      console.error('OpenClaw list agents error:', error);
      throw error;
    }
  }

  async getAgentInfo(config, agentId) {
    const { apiKey, baseUrl = this.baseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/agents/${agentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenClaw get agent info error:', error);
      throw error;
    }
  }
}