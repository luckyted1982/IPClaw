import fetch from 'node-fetch';
import prisma from '../lib/prisma.js';
import { getToolRegistry, initializeTools } from './tools/ToolRegistry.js';

const PATSEEK_API_KEY = process.env.PATSEEK_API_KEY || 'ps_0931e2efa48df3aa2596de57c27d9449';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

export class AgentExecutor {
  constructor(agentId) {
    this.agentId = agentId;
    this.agent = null;
    this.tools = [];
    this.knowledgeBases = [];
    this.toolRegistry = null;
  }

  async initialize() {
    this.agent = await prisma.agent.findUnique({
      where: { id: this.agentId },
      include: {
        agentSkills: true,
        agentTools: {
          where: { enabled: true },
        },
        agentKnowledge: {
          include: {
            knowledgeBase: true,
          },
        },
      },
    });

    if (!this.agent) {
      throw new Error(`Agent not found: ${this.agentId}`);
    }

    this.knowledgeBases = this.agent.agentKnowledge.map(kb => kb.knowledgeBase);
    this.agentTools = this.agent.agentTools.map(t => t.toolName);

    // Initialize tool registry with API keys
    this.toolRegistry = initializeTools({ patseek: PATSEEK_API_KEY });

    return this;
  }

  buildSystemPrompt(userMessage) {
    let systemPrompt = this.agent.systemPrompt;

    if (this.knowledgeBases.length > 0) {
      const knowledgeContext = this.knowledgeBases.map(kb => {
        const preview = kb.content.substring(0, 500);
        return `【知识库: ${kb.title}】\n${preview}...`;
      }).join('\n\n');

      systemPrompt += `\n\n## 可用知识库\n${knowledgeContext}\n\n请根据上述知识库内容回答用户问题。`;
    }

    if (this.agentTools.length > 0) {
      const toolDescriptions = this.agentTools
        .map(name => {
          const tool = this.toolRegistry.get(name);
          if (tool) {
            return `- ${tool.name}: ${tool.description}`;
          }
          return `- ${name}`;
        })
        .join('\n');

      systemPrompt += `\n\n## 可用工具\n你可以使用以下工具来帮助回答问题：\n${toolDescriptions}\n\n如果需要使用工具，请用以下JSON格式返回：\n{"tool": "tool_name", "params": {"param1": "value1"}}`;
    }

    if (this.agent.agentSkills.length > 0) {
      const skills = this.agent.agentSkills.map(s => `${s.skillName} (熟练度: ${s.level}/100)`).join(', ');
      systemPrompt += `\n\n## 我的技能\n${skills}`;
    }

    return systemPrompt;
  }

  async executeTool(toolName, params) {
    if (!this.toolRegistry) {
      await this.initialize();
    }

    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool not found: ${toolName}` };
    }

    return tool.execute(params);
  }

  async chat(messages, options = {}) {
    if (!this.agent) {
      await this.initialize();
    }

    const { stream = false, userId = null } = options;

    const systemPrompt = this.buildSystemPrompt(messages[messages.length - 1]?.content);

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const requestBody = {
      model: this.agent.modelName || 'deepseek-chat',
      messages: requestMessages,
      temperature: this.agent.temperature || 0.7,
      max_tokens: this.agent.maxTokens || 4096,
      stream: stream,
    };

    if (userId) {
      await this.saveUserMessage(userId, messages[messages.length - 1].content);
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    if (stream) {
      return response.body;
    }

    const result = await response.json();
    const replyContent = result.choices[0]?.message?.content || '';

    if (userId) {
      await this.saveAssistantMessage(userId, replyContent);
    }

    return replyContent;
  }

  async chatWithTools(messages, options = {}) {
    if (!this.agent) {
      await this.initialize();
    }

    const { maxIterations = 5, userId = null } = options;

    let currentMessages = [
      { role: 'system', content: this.buildSystemPrompt(messages[messages.length - 1]?.content) },
      ...messages,
    ];

    for (let i = 0; i < maxIterations; i++) {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.agent.modelName || 'deepseek-chat',
          messages: currentMessages,
          temperature: this.agent.temperature || 0.7,
          max_tokens: this.agent.maxTokens || 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const result = await response.json();
      const assistantMessage = result.choices[0]?.message;

      currentMessages.push(assistantMessage);

      // Check if assistant wants to use a tool
      const toolCalls = assistantMessage.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        // No tool calls, return the final response
        if (userId) {
          await this.saveAssistantMessage(userId, assistantMessage.content);
        }
        return assistantMessage.content;
      }

      // Execute tool calls
      for (const toolCall of toolCalls) {
        const { id, function: { name, arguments: argsStr } } = toolCall;
        const params = JSON.parse(argsStr);

        const toolResult = await this.executeTool(name, params);

        currentMessages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify(toolResult),
        });
      }
    }

    // Max iterations reached
    return currentMessages[currentMessages.length - 1]?.content || '工具执行超时';
  }

  async saveUserMessage(userId, content) {
    let conversation = await prisma.conversation.findFirst({
      where: { agentId: this.agentId, userId, status: 'active' },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { agentId: this.agentId, userId },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content,
      },
    });
  }

  async saveAssistantMessage(userId, content) {
    const conversation = await prisma.conversation.findFirst({
      where: { agentId: this.agentId, userId, status: 'active' },
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content,
        },
      });
    }
  }

  async getConversations(userId) {
    return prisma.conversation.findMany({
      where: { agentId: this.agentId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  }
}

export async function executeAgentChat(agentId, messages, options = {}) {
  const executor = new AgentExecutor(agentId);
  await executor.initialize();
  return executor.chat(messages, options);
}

export async function executeAgentChatWithTools(agentId, messages, options = {}) {
  const executor = new AgentExecutor(agentId);
  await executor.initialize();
  return executor.chatWithTools(messages, options);
}

export default AgentExecutor;
