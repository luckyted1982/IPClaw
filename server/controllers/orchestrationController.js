import { executeCollaboration, orchestrationEngine } from '../agent-engine/OrchestrationEngine.js';

export async function startOrchestration(req, res) {
  try {
    const { pattern, agentIds, messages } = req.body;

    if (!pattern || !agentIds || !messages) {
      return res.status(400).json({ error: 'Missing required parameters: pattern, agentIds, messages' });
    }

    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ error: 'agentIds must be a non-empty array' });
    }

    const validPatterns = ['pipeline', 'roundtable', 'critic', 'split', 'swarm'];
    if (!validPatterns.includes(pattern)) {
      return res.status(400).json({ error: `Invalid pattern. Must be one of: ${validPatterns.join(', ')}` });
    }

    const result = await executeCollaboration(pattern, agentIds, messages, {
      userId: req.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Orchestration error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getExecutionStatus(req, res) {
  try {
    const { executionId } = req.params;

    const execution = orchestrationEngine.getExecution(executionId);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.status(200).json(execution);
  } catch (error) {
    console.error('Get execution status error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function cancelExecution(req, res) {
  try {
    const { executionId } = req.params;

    const success = orchestrationEngine.cancelExecution(executionId);
    if (!success) {
      return res.status(400).json({ error: 'Cannot cancel execution - not found or already completed' });
    }

    res.status(200).json({ success: true, message: 'Execution cancelled' });
  } catch (error) {
    console.error('Cancel execution error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function listCollaborationPatterns(req, res) {
  try {
    const patterns = [
      {
        name: 'pipeline',
        description: '流水线模式 - 智能体按顺序依次处理，前一个的输出作为后一个的输入',
        minAgents: 2,
        maxAgents: 10,
      },
      {
        name: 'roundtable',
        description: '圆桌会议模式 - 所有智能体同时处理，然后汇总结果',
        minAgents: 2,
        maxAgents: 20,
      },
      {
        name: 'critic',
        description: '评审模式 - 主智能体先回答，其他智能体评审，然后主智能体改进',
        minAgents: 2,
        maxAgents: 10,
      },
      {
        name: 'split',
        description: '拆分模式 - 将任务拆分给多个智能体并行处理',
        minAgents: 2,
        maxAgents: 20,
      },
      {
        name: 'swarm',
        description: '蜂群模式 - 多个智能体并行处理，基于信任分数选择最佳结果',
        minAgents: 2,
        maxAgents: 20,
      },
    ];

    res.status(200).json({ patterns });
  } catch (error) {
    console.error('List patterns error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}