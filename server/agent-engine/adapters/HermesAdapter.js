import fetch from 'node-fetch';

export class HermesAdapter {
  constructor() {
    this.defaultBaseUrl = 'http://localhost:8642';
    this.apiBasePath = '/v1/chat/completions';
  }

  async execute(config, messages, options = {}) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;
    const { stream = false, temperature = 0.7, model = 'hermes-executor' } = options;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
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
          max_tokens: options.maxTokens || 8192,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Hermes API error: ${errorData.message || response.status}`);
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
      console.error('Hermes adapter error:', error);
      throw error;
    }
  }

  async listAgents(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/v1/agents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status}`);
      }

      const result = await response.json();
      return result.agents || result || [];
    } catch (error) {
      console.error('Hermes list agents error:', error);
      throw error;
    }
  }

  async getAgentInfo(config, agentId) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/v1/agents/${agentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hermes get agent info error:', error);
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
      try {
        const altResponse = await fetch(`${baseUrl}/api/status`);
        if (!altResponse.ok) {
          return {
            success: false,
            status: altResponse.status,
            message: altResponse.statusText,
          };
        }
        const result = await altResponse.json();
        return {
          success: true,
          status: altResponse.status,
          data: result,
        };
      } catch (altError) {
        return {
          success: false,
          status: 0,
          message: error.message,
        };
      }
    }
  }

  async listModels(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Hermes list models error:', error);
      throw error;
    }
  }

  async getConfig(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hermes get config error:', error);
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
        message: 'Hermes service is running (no API key provided)',
        data: healthResult.data,
      };
    }

    try {
      const response = await fetch(`${baseUrl}${this.apiBasePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'hermes-executor',
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
      throw new Error('Hermes API key is required');
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
        throw new Error(`Hermes register agent error: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hermes register agent error:', error);
      throw error;
    }
  }

  async executeTask(config, taskSpec) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;
    const { objective, context = '', allowedTools = [], forbiddenActions = [], successCriteria = '' } = taskSpec;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
    }

    const taskConfig = {
      objective,
      context,
      allowed_tools: allowedTools,
      forbidden_actions: forbiddenActions,
      success_criteria: successCriteria,
    };

    try {
      const response = await fetch(`${baseUrl}${this.apiBasePath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'hermes-executor',
          messages: [
            {
              role: 'system',
              content: '你是Executor。只执行明确授权的任务。遇到删除、覆盖、联网提交、发信、付款、安装包、读取密钥时停止并请求上层确认。',
            },
            {
              role: 'user',
              content: JSON.stringify(taskConfig, ensureAscii = false),
            },
          ],
          max_tokens: 8192,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Hermes execute task error: ${errorData.message || response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        content: result.choices?.[0]?.message?.content || '',
        raw: result,
      };
    } catch (error) {
      console.error('Hermes execute task error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getMemoryStats(config) {
    const { apiKey, baseUrl = this.defaultBaseUrl } = config;

    if (!apiKey) {
      throw new Error('Hermes API key is required');
    }

    try {
      const response = await fetch(`${baseUrl}/api/memory/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Hermes get memory stats error:', error);
      throw error;
    }
  }
}