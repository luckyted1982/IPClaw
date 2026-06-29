import fetch from 'node-fetch';

class Tool {
  constructor(name, description, parameters) {
    this.name = name;
    this.description = description;
    this.parameters = parameters || [];
  }

  async execute(params) {
    throw new Error(`Tool ${this.name} must implement execute method`);
  }

  getSchema() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }
}

class PatSeekTool extends Tool {
  constructor(apiKey) {
    super(
      'patseek_search',
      'Search patents using PatSeek API. Use this tool to find relevant patents.',
      [
        { name: 'query', type: 'string', description: 'Search query string', required: true },
        { name: 'page', type: 'number', description: 'Page number', required: false },
        { name: 'pageSize', type: 'number', description: 'Results per page', required: false },
      ]
    );
    this.apiKey = apiKey;
  }

  async execute(params) {
    try {
      const { query, page = 1, pageSize = 10 } = params;

      const response = await fetch('https://api.patseek.com/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          page,
          page_size: pageSize,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PatSeek API error');
      }

      const data = await response.json();
      return {
        success: true,
        results: data.results || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.error('PatSeek tool error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

class CalculatorTool extends Tool {
  constructor() {
    super(
      'calculator',
      'Perform mathematical calculations. Use this for computations.',
      [
        { name: 'expression', type: 'string', description: 'Mathematical expression to evaluate', required: true },
      ]
    );
  }

  async execute(params) {
    try {
      const { expression } = params;

      // Safe math evaluation
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();

      return {
        success: true,
        expression,
        result: Number.isFinite(result) ? result : 'Invalid result',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

class DateTimeTool extends Tool {
  constructor() {
    super(
      'datetime',
      'Get current date and time information.',
      [
        { name: 'format', type: 'string', description: 'Date format (iso, locale, timestamp)', required: false },
      ]
    );
  }

  async execute(params) {
    const { format = 'iso' } = params;
    const now = new Date();

    let result;
    switch (format) {
      case 'timestamp':
        result = now.getTime();
        break;
      case 'locale':
        result = now.toLocaleString();
        break;
      case 'iso':
      default:
        result = now.toISOString();
        break;
    }

    return {
      success: true,
      datetime: result,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

class TextTool extends Tool {
  constructor() {
    super(
      'text_processor',
      'Process and transform text (count words, characters, etc.)',
      [
        { name: 'text', type: 'string', description: 'Input text', required: true },
        { name: 'operation', type: 'string', description: 'Operation: count_words, count_chars, uppercase, lowercase, reverse', required: true },
      ]
    );
  }

  async execute(params) {
    try {
      const { text, operation } = params;

      let result;
      switch (operation) {
        case 'count_words':
          result = text.trim().split(/\s+/).length;
          break;
        case 'count_chars':
          result = text.length;
          break;
        case 'uppercase':
          result = text.toUpperCase();
          break;
        case 'lowercase':
          result = text.toLowerCase();
          break;
        case 'reverse':
          result = text.split('').reverse().join('');
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return { success: true, operation, result, input_length: text.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    if (!(tool instanceof Tool)) {
      throw new Error('Tool must be an instance of Tool class');
    }
    this.tools.set(tool.name, tool);
  }

  get(name) {
    return this.tools.get(name);
  }

  list() {
    return Array.from(this.tools.values()).map(t => t.getSchema());
  }

  has(name) {
    return this.tools.has(name);
  }
}

let globalRegistry = null;

export function getToolRegistry() {
  if (!globalRegistry) {
    globalRegistry = new ToolRegistry();

    // Register default tools (without API keys)
    globalRegistry.register(new CalculatorTool());
    globalRegistry.register(new DateTimeTool());
    globalRegistry.register(new TextTool());
  }
  return globalRegistry;
}

export function initializeTools(apiKeys = {}) {
  const registry = getToolRegistry();

  // Register PatSeek if API key is provided
  if (apiKeys.patseek) {
    const patseekTool = new PatSeekTool(apiKeys.patseek);
    registry.register(patseekTool);
  }

  return registry;
}

export { Tool, PatSeekTool, CalculatorTool, DateTimeTool, TextTool };