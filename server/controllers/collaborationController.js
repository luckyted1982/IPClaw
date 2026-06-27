import prisma from '../lib/prisma.js';
import { callModel } from '../lib/modelGateway.js';

export async function createAgentGroup(req, res) {
  try {
    const { name, description, agentIds } = req.body;

    if (!name || !agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const group = await prisma.agentGroup.create({
      data: {
        name,
        description: description || '',
        ownerId: req.user.id,
        members: {
          create: agentIds.map(agentId => ({
            agentId,
            role: 'member',
          })),
        },
      },
      include: {
        members: {
          include: {
            agent: { select: { name: true, avatar: true } },
          },
        },
      },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Create agent group error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAgentGroups(req, res) {
  try {
    const groups = await prisma.agentGroup.findMany({
      where: { ownerId: req.user.id },
      include: {
        members: {
          include: {
            agent: { select: { name: true, avatar: true } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    res.json(groups);
  } catch (error) {
    console.error('Get agent groups error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAgentGroupById(req, res) {
  try {
    const { id } = req.params;

    const group = await prisma.agentGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            agent: { select: { name: true, avatar: true, category: true } },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get agent group by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function addAgentToGroup(req, res) {
  try {
    const { id } = req.params;
    const { agentId, role = 'member' } = req.body;

    const group = await prisma.agentGroup.findUnique({ where: { id } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const existingMember = await prisma.groupMember.findFirst({
      where: { groupId: id, agentId },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Agent is already in the group' });
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: id,
        agentId,
        role,
      },
      include: {
        agent: { select: { name: true, avatar: true } },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Add agent to group error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function removeAgentFromGroup(req, res) {
  try {
    const { id, agentId } = req.params;

    const group = await prisma.agentGroup.findUnique({ where: { id } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.groupMember.deleteMany({
      where: { groupId: id, agentId },
    });

    res.json({ message: 'Agent removed from group' });
  } catch (error) {
    console.error('Remove agent from group error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function assignTaskToGroup(req, res) {
  try {
    const { id } = req.params;
    const { taskId } = req.body;

    const group = await prisma.agentGroup.findUnique({
      where: { id },
      include: { members: { include: { agent: true } } },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.creatorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const agents = group.members.map(m => m.agent);
    
    const allocationResult = await allocateTaskToAgents(task, agents);

    res.json({
      message: 'Task assigned to group',
      allocation: allocationResult,
    });
  } catch (error) {
    console.error('Assign task to group error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function allocateTaskToAgents(task, agents) {
  const allocations = [];
  
  const taskRequirements = {
    category: task.category,
    budget: task.budget,
    description: task.description,
  };

  for (const agent of agents) {
    const compatibility = calculateCompatibility(taskRequirements, agent);
    
    if (compatibility.score > 0.3) {
      allocations.push({
        agentId: agent.id,
        agentName: agent.name,
        role: compatibility.role,
        confidence: compatibility.score,
      });
    }
  }

  allocations.sort((a, b) => b.confidence - a.confidence);

  return allocations.slice(0, 3);
}

function calculateCompatibility(requirements, agent) {
  let score = 0;
  let role = 'support';

  if (agent.category === requirements.category) {
    score += 0.5;
    role = 'primary';
  }

  if (agent.status === 'online') {
    score += 0.2;
  }

  score += agent.trustScore / 1000;
  score += agent.rating / 50;

  return { score: Math.min(score, 1), role };
}

export async function initiateCollaboration(req, res) {
  try {
    const { groupId, taskId, instructions } = req.body;

    const group = await prisma.agentGroup.findUnique({
      where: { id: groupId },
      include: { members: { include: { agent: true } } },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const agents = group.members.map(m => m.agent);
    
    const collaborationPlan = await generateCollaborationPlan(task, agents, instructions);

    res.json({
      message: 'Collaboration initiated',
      plan: collaborationPlan,
    });
  } catch (error) {
    console.error('Initiate collaboration error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function generateCollaborationPlan(task, agents, instructions) {
  const agentInfo = agents.map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    skills: a.agentSkills?.map(s => s.skillName) || [],
  }));

  const prompt = `
    作为协作协调员，请基于以下信息生成一个多智能体协作计划：
    
    任务信息：
    - 标题：${task.title}
    - 描述：${task.description}
    - 类别：${task.category}
    - 预算：${task.budget}
    
    可用智能体：
    ${JSON.stringify(agentInfo, null, 2)}
    
    额外说明：${instructions || '无'}
    
    请输出一个JSON格式的协作计划，包含：
    1. phases - 协作阶段列表
    2. assignments - 每个智能体的任务分配
    3. dependencies - 任务依赖关系
    4. timeline - 预计时间线
  `;

  try {
    const response = await callModel('default', prompt, { stream: false });
    const result = await response.json();
    
    return result.choices?.[0]?.message?.content || '协作计划生成中...';
  } catch {
    return {
      phases: ['分析阶段', '执行阶段', '验收阶段'],
      assignments: agentInfo.slice(0, 3).map((a, i) => ({
        agentId: a.id,
        agentName: a.name,
        tasks: [`任务阶段${i + 1}`],
      })),
      dependencies: [],
      timeline: '预计3天完成',
    };
  }
}