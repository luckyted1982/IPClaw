import prisma from '../lib/prisma.js';
import { AgentExecutor } from './AgentExecutor.js';
import creditService from '../services/CreditService.js';

export class OrchestrationEngine {
  constructor() {
    this.executions = new Map();
  }

  async executePipeline(agentIds, messages, options = {}) {
    const { userId, stream = false } = options;
    const executionId = this.generateExecutionId();

    this.executions.set(executionId, {
      status: 'running',
      step: 0,
      results: [],
      agentIds,
    });

    let accumulatedMessages = [...messages];

    for (let i = 0; i < agentIds.length; i++) {
      const agentId = agentIds[i];
      
      if (this.executions.get(executionId)?.status === 'cancelled') {
        return { status: 'cancelled', executionId };
      }

      this.executions.get(executionId).step = i + 1;

      try {
        const executor = new AgentExecutor(agentId);
        await executor.initialize();

        const result = await executor.chat(accumulatedMessages, {
          stream: false,
          userId,
          skipCredits: true,
        });

        const agent = await prisma.agent.findUnique({ where: { id: agentId } });
        
        this.executions.get(executionId).results.push({
          agentId,
          agentName: agent?.name || 'Unknown',
          content: result,
          step: i + 1,
        });

        accumulatedMessages.push({
          role: 'user',
          content: `请基于以下信息继续处理：\n\n上一阶段输出（${agent?.name}）：\n${result}`,
        });

      } catch (error) {
        this.executions.get(executionId).status = 'error';
        return {
          status: 'error',
          executionId,
          error: error.message,
          step: i + 1,
        };
      }
    }

    this.executions.get(executionId).status = 'completed';

    if (userId) {
      await this.handleCredits(userId, agentIds, this.executions.get(executionId).results);
    }

    return {
      status: 'completed',
      executionId,
      results: this.executions.get(executionId).results,
    };
  }

  async executeRoundtable(agentIds, messages, options = {}) {
    const { userId } = options;
    const executionId = this.generateExecutionId();

    this.executions.set(executionId, {
      status: 'running',
      results: [],
      agentIds,
    });

    const agentResults = await Promise.all(
      agentIds.map(async (agentId) => {
        try {
          const executor = new AgentExecutor(agentId);
          await executor.initialize();

          const result = await executor.chat([...messages], {
            stream: false,
            userId,
            skipCredits: true,
          });

          const agent = await prisma.agent.findUnique({ where: { id: agentId } });

          return {
            agentId,
            agentName: agent?.name || 'Unknown',
            content: result,
          };
        } catch (error) {
          return {
            agentId,
            agentName: 'Unknown',
            content: '',
            error: error.message,
          };
        }
      })
    );

    const validResults = agentResults.filter((r) => !r.error);
    
    if (validResults.length > 0) {
      const summary = await this.summarizeRoundtableResults(validResults, messages);
      validResults.push({
        agentId: 'summary',
        agentName: 'Summary',
        content: summary,
        isSummary: true,
      });
    }

    this.executions.get(executionId).results = agentResults;
    this.executions.get(executionId).status = 'completed';

    if (userId) {
      await this.handleCredits(userId, agentIds, agentResults);
    }

    return {
      status: 'completed',
      executionId,
      results: agentResults,
    };
  }

  async executeCritic(agentIds, messages, options = {}) {
    const { userId } = options;
    const executionId = this.generateExecutionId();

    this.executions.set(executionId, {
      status: 'running',
      results: [],
      agentIds,
    });

    const primaryAgentId = agentIds[0];
    const criticAgentIds = agentIds.slice(1);

    let executor = new AgentExecutor(primaryAgentId);
    await executor.initialize();

    const primaryResult = await executor.chat([...messages], {
      stream: false,
      userId,
      skipCredits: true,
    });

    const primaryAgent = await prisma.agent.findUnique({ where: { id: primaryAgentId } });
    const results = [{
      agentId: primaryAgentId,
      agentName: primaryAgent?.name || 'Unknown',
      content: primaryResult,
      role: 'primary',
    }];

    const criticismResults = await Promise.all(
      criticAgentIds.map(async (agentId) => {
        try {
          executor = new AgentExecutor(agentId);
          await executor.initialize();

          const criticMessages = [
            ...messages,
            {
              role: 'user',
              content: `请对以下回答进行评审和改进建议：\n\n原始回答：\n${primaryResult}`,
            },
          ];

          const result = await executor.chat(criticMessages, {
            stream: false,
            userId,
            skipCredits: true,
          });

          const agent = await prisma.agent.findUnique({ where: { id: agentId } });

          return {
            agentId,
            agentName: agent?.name || 'Unknown',
            content: result,
            role: 'critic',
          };
        } catch (error) {
          return {
            agentId,
            agentName: 'Unknown',
            content: '',
            error: error.message,
            role: 'critic',
          };
        }
      })
    );

    results.push(...criticismResults);

    const improvements = criticismResults
      .filter((r) => !r.error)
      .map((r) => `【${r.agentName}的评审】\n${r.content}`)
      .join('\n\n');

    if (improvements) {
      executor = new AgentExecutor(primaryAgentId);
      await executor.initialize();

      const refinedMessages = [
        ...messages,
        {
          role: 'user',
          content: `请根据以下评审意见改进你的回答：\n\n评审意见：\n${improvements}\n\n原始回答：\n${primaryResult}`,
        },
      ];

      const refinedResult = await executor.chat(refinedMessages, {
        stream: false,
        userId,
        skipCredits: true,
      });

      results.push({
        agentId: primaryAgentId,
        agentName: primaryAgent?.name || 'Unknown',
        content: refinedResult,
        role: 'refined',
      });
    }

    this.executions.get(executionId).results = results;
    this.executions.get(executionId).status = 'completed';

    if (userId) {
      await this.handleCredits(userId, agentIds, results);
    }

    return {
      status: 'completed',
      executionId,
      results,
    };
  }

  async executeSplit(agentIds, messages, options = {}) {
    const { userId, splitStrategy = 'round_robin' } = options;
    const executionId = this.generateExecutionId();

    this.executions.set(executionId, {
      status: 'running',
      results: [],
      agentIds,
    });

    const results = await Promise.all(
      agentIds.map(async (agentId) => {
        try {
          const executor = new AgentExecutor(agentId);
          await executor.initialize();

          const result = await executor.chat([...messages], {
            stream: false,
            userId,
            skipCredits: true,
          });

          const agent = await prisma.agent.findUnique({ where: { id: agentId } });

          return {
            agentId,
            agentName: agent?.name || 'Unknown',
            content: result,
          };
        } catch (error) {
          return {
            agentId,
            agentName: 'Unknown',
            content: '',
            error: error.message,
          };
        }
      })
    );

    this.executions.get(executionId).results = results;
    this.executions.get(executionId).status = 'completed';

    if (userId) {
      await this.handleCredits(userId, agentIds, results);
    }

    return {
      status: 'completed',
      executionId,
      results,
    };
  }

  async executeSwarm(agentIds, messages, options = {}) {
    const { userId } = options;
    const executionId = this.generateExecutionId();

    this.executions.set(executionId, {
      status: 'running',
      results: [],
      agentIds,
    });

    const results = await Promise.all(
      agentIds.map(async (agentId) => {
        try {
          const executor = new AgentExecutor(agentId);
          await executor.initialize();

          const result = await executor.chat([...messages], {
            stream: false,
            userId,
            skipCredits: true,
          });

          const agent = await prisma.agent.findUnique({ where: { id: agentId } });

          return {
            agentId,
            agentName: agent?.name || 'Unknown',
            content: result,
            trustScore: agent?.trustScore || 0,
          };
        } catch (error) {
          return {
            agentId,
            agentName: 'Unknown',
            content: '',
            trustScore: 0,
            error: error.message,
          };
        }
      })
    );

    const validResults = results.filter((r) => !r.error);
    
    if (validResults.length > 0) {
      const bestResult = validResults.reduce((best, current) => {
        return current.trustScore > best.trustScore ? current : best;
      });

      validResults.forEach((r) => {
        r.isBest = r.agentId === bestResult.agentId;
      });

      const summary = await this.summarizeSwarmResults(validResults, messages);
      validResults.push({
        agentId: 'summary',
        agentName: 'Summary',
        content: summary,
        isSummary: true,
      });
    }

    this.executions.get(executionId).results = validResults;
    this.executions.get(executionId).status = 'completed';

    if (userId) {
      await this.handleCredits(userId, agentIds, validResults);
    }

    return {
      status: 'completed',
      executionId,
      results: validResults,
    };
  }

  async summarizeRoundtableResults(results, originalMessages) {
    const resultsText = results.map((r) => `【${r.agentName}】\n${r.content}`).join('\n\n');
    
    const summaryMessages = [
      {
        role: 'system',
        content: '你是一个会议主持人和总结者。请综合以下多个智能体的回答，生成一份简洁、有条理的总结报告。',
      },
      {
        role: 'user',
        content: `原始问题：${originalMessages[originalMessages.length - 1]?.content}\n\n各智能体回答：\n${resultsText}\n\n请生成一份综合总结。`,
      },
    ];

    try {
      const executor = new AgentExecutor('default-summary');
      executor.agent = {
        modelName: 'deepseek-chat',
        temperature: 0.3,
        maxTokens: 4096,
        systemPrompt: '你是一个会议主持人和总结者。',
      };

      const result = await executor.chat(summaryMessages, { skipCredits: true });
      return result;
    } catch {
      return `综合总结：\n${resultsText}`;
    }
  }

  async summarizeSwarmResults(results, originalMessages) {
    const resultsText = results.map((r) => `【${r.agentName}${r.isBest ? ' (最佳)' : ''}】\n${r.content}`).join('\n\n');
    
    const summaryMessages = [
      {
        role: 'system',
        content: '你是一个评审专家。请根据多个智能体的回答，选择最佳答案并给出理由。',
      },
      {
        role: 'user',
        content: `原始问题：${originalMessages[originalMessages.length - 1]?.content}\n\n各智能体回答：\n${resultsText}\n\n请选择最佳答案并解释原因。`,
      },
    ];

    try {
      const executor = new AgentExecutor('default-summary');
      executor.agent = {
        modelName: 'deepseek-chat',
        temperature: 0.3,
        maxTokens: 4096,
        systemPrompt: '你是一个评审专家。',
      };

      const result = await executor.chat(summaryMessages, { skipCredits: true });
      return result;
    } catch {
      return `评审总结：\n${resultsText}`;
    }
  }

  async handleCredits(userId, agentIds, results) {
    try {
      const validResults = results.filter((r) => !r.error && r.content);
      const totalCredits = validResults.length * 10;

      await creditService.consumeCredits(userId, totalCredits, {
        category: 'collaboration',
        description: `多智能体协作执行（${validResults.length}个智能体）`,
        serviceType: 'multi_agent_collaboration',
      });
    } catch (error) {
      console.error('[Orchestration] Failed to deduct credits:', error.message);
    }
  }

  getExecution(executionId) {
    return this.executions.get(executionId);
  }

  cancelExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      return true;
    }
    return false;
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const orchestrationEngine = new OrchestrationEngine();

export async function executeCollaboration(pattern, agentIds, messages, options = {}) {
  switch (pattern) {
    case 'pipeline':
      return orchestrationEngine.executePipeline(agentIds, messages, options);
    case 'roundtable':
      return orchestrationEngine.executeRoundtable(agentIds, messages, options);
    case 'critic':
      return orchestrationEngine.executeCritic(agentIds, messages, options);
    case 'split':
      return orchestrationEngine.executeSplit(agentIds, messages, options);
    case 'swarm':
      return orchestrationEngine.executeSwarm(agentIds, messages, options);
    default:
      throw new Error(`Unknown collaboration pattern: ${pattern}`);
  }
}