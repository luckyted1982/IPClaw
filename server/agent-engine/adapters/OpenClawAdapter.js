import fetch from 'node-fetch';

export class OpenClawAdapter {
  constructor() {
    this.defaultBaseUrl = 'http://localhost:18789';
    this.apiBasePath = '/v1/chat/completions';
  }

  async execute(config, messages, options = {}) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;
    const { stream = false, temperature = 0.7, model = 'openclaw' } = options;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}${this.apiBasePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          stream,
          max_tokens: options.maxTokens || 4096,
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
        model: result.model,
      };
    } catch (error) {
      console.error('OpenClaw adapter error:', error);
      throw error;
    }
  }

  async listAgents(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/v1/agents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      const result = await response.json();
      return result.agents || result || [];
    } catch (error) {
      console.error('OpenClaw list agents error:', error);
      throw error;
    }
  }

  async getAgentInfo(config, agentId) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/v1/agents/${agentId}`, {
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

  async healthCheck(config) {
    const { baseUrl = this.defaultBaseUrl } = config;

    try {
      const response = await fetch(`${baseUrl}/health`);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: response.statusText,
        };
      }

      const result = await response.json();
      return {
        success: true,
        status: response.status,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: error.message,
      };
    }
  }

  async getGatewayStatus(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/gateway/status?token=${apiKey}`);

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenClaw get gateway status error:', error);
      throw error;
    }
  }

  async getConfig(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/config?token=${apiKey}`);

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenClaw get config error:', error);
      throw error;
    }
  }

  async listModels(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`OpenClaw API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('OpenClaw list models error:', error);
      throw error;
    }
  }

  async verifyConnection(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    const healthResult = await this.healthCheck({ baseUrl });
    if (!healthResult.success) {
      return healthResult;
    }

    if (!apiKey) {
      return {
        success: true,
        status: healthResult.status,
        message: 'Gateway is running (no API key provided)',
        data: healthResult.data,
      };
    }

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openclaw',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 10,
        }),
      });

      const data = response.ok ? await response.json().catch(() => null) : await response.json().catch(() => ({ message: response.statusText }));

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Connection successful' : (data?.message || response.statusText),
        data: response.ok ? data : null,
        gatewayInfo: healthResult.data,
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: error.message,
        gatewayInfo: healthResult.data,
      };
    }
  }

  async registerAgent(config, agentData) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/v1/agents/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`OpenClaw register agent error: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenClaw register agent error:', error);
      throw error;
    }
  }

  async executeTask(config, taskSpec) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;
    const { objective, context = '', allowedTools = [], successCriteria = '' } = taskSpec;

    if (!apiKey) {
      throw new Error('OpenClaw API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}${this.apiBasePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openclaw',
          messages: [
            {
              role: 'system',
              content: '你是一个执行任务的智能助手。请根据用户的指令完成任务。',
            },
            {
              role: 'user',
              content: `任务目标: ${objective}\n上下文: ${context}\n允许的工具: ${JSON.stringify(allowedTools)}\n成功标准: ${successCriteria}`,
            },
          ],
          max_tokens: 8192,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`OpenClaw execute task error: ${errorData.message || response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        content: result.choices?.[0]?.message?.content || '',
        raw: result,
      };
    } catch (error) {
      console.error('OpenClaw execute task error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}