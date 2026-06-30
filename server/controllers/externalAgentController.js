import { executeExternalAgent, listExternalAgents, agentAdapterFactory } from '../agent-engine/AgentAdapterFactory.js';
import prisma from '../lib/prisma.js';

export async function chatWithExternalAgent(req, res) {
  try {
    const { type, config, messages, options } = req.body;

    if (!type || !messages) {
      return res.status(400).json({ error: 'Missing required parameters: type, messages' });
    }

    const result = await executeExternalAgent(type, config || {}, messages, options || {});

    res.status(200).json(result);
  } catch (error) {
    console.error('External agent chat error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function listAvailableAgents(req, res) {
  try {
    const { type, config } = req.query;

    if (!type) {
      return res.status(400).json({ error: 'Missing required parameter: type' });
    }

    const agents = await listExternalAgents(type, JSON.parse(config || '{}'));

    res.status(200).json({ agents });
  } catch (error) {
    console.error('List external agents error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function listAdapterTypes(req, res) {
  try {
    const adapters = agentAdapterFactory.listAdapters();

    const adapterInfo = adapters.map((adapter) => ({
      type: adapter,
      description: getAdapterDescription(adapter),
    }));

    res.status(200).json({ adapters: adapterInfo });
  } catch (error) {
    console.error('List adapters error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function saveExternalAgentConfig(req, res) {
  try {
    const { name, type, config, userId } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Missing required parameters: name, type' });
    }

    const existing = await prisma.externalAgentConfig.findUnique({
      where: { name_userId: { name, userId: userId || req.user.id } },
    });

    if (existing) {
      return res.status(400).json({ error: 'Configuration already exists' });
    }

    const savedConfig = await prisma.externalAgentConfig.create({
      data: {
        name,
        type,
        config: JSON.stringify(config),
        userId: userId || req.user.id,
      },
    });

    res.status(201).json(savedConfig);
  } catch (error) {
    console.error('Save external agent config error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getExternalAgentConfig(req, res) {
  try {
    const { name } = req.params;

    const config = await prisma.externalAgentConfig.findUnique({
      where: { name_userId: { name, userId: req.user.id } },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error('Get external agent config error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function listExternalAgentConfigs(req, res) {
  try {
    const configs = await prisma.externalAgentConfig.findMany({
      where: { userId: req.user.id },
    });

    res.status(200).json({ configs });
  } catch (error) {
    console.error('List external agent configs error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteExternalAgentConfig(req, res) {
  try {
    const { name } = req.params;

    const config = await prisma.externalAgentConfig.findUnique({
      where: { name_userId: { name, userId: req.user.id } },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    await prisma.externalAgentConfig.delete({
      where: { name_userId: { name, userId: req.user.id } },
    });

    res.status(200).json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete external agent config error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

function getAdapterDescription(type) {
  const descriptions = {
    openclaw: 'OpenClaw - 开源AI协作网络平台',
    mcp: 'MCP Gateway - Model Context Protocol服务器',
  };
  return descriptions[type] || 'Unknown adapter';
}