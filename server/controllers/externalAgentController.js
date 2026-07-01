import {
  executeExternalAgent,
  listExternalAgents,
  agentAdapterFactory,
  verifyExternalAgentConnection,
  executeExternalTask,
  healthCheckExternalAgent,
  listExternalModels,
  getExternalAgentInfo,
  getExternalConfig,
  registerExternalAgent,
} from '../agent-engine/AgentAdapterFactory.js';
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

export async function verifyAgentConnection(req, res) {
  try {
    const { type, config } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Missing required parameter: type' });
    }

    const result = await verifyExternalAgentConnection(type, config || {});

    res.status(200).json(result);
  } catch (error) {
    console.error('Verify connection error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function healthCheckAgent(req, res) {
  try {
    const { type, config } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Missing required parameter: type' });
    }

    const result = await healthCheckExternalAgent(type, config || {});

    res.status(200).json(result);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function listAdapterTypes(req, res) {
  try {
    const adapters = agentAdapterFactory.listAdapters();

    const adapterInfo = adapters.map((adapter) => ({
      type: adapter,
      ...agentAdapterFactory.getAdapterInfo(adapter),
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
      include: { user: { select: { name: true, email: true } } },
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

export async function updateExternalAgentConfig(req, res) {
  try {
    const { name } = req.params;
    const { config: newConfig } = req.body;

    const existing = await prisma.externalAgentConfig.findUnique({
      where: { name_userId: { name, userId: req.user.id } },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const updatedConfig = await prisma.externalAgentConfig.update({
      where: { name_userId: { name, userId: req.user.id } },
      data: {
        config: JSON.stringify(newConfig),
        updatedAt: new Date(),
      },
    });

    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error('Update external agent config error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function executeTask(req, res) {
  try {
    const { type, config, taskSpec } = req.body;

    if (!type || !taskSpec) {
      return res.status(400).json({ error: 'Missing required parameters: type, taskSpec' });
    }

    const result = await executeExternalTask(type, config || {}, taskSpec);

    res.status(200).json(result);
  } catch (error) {
    console.error('Execute task error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function listModels(req, res) {
  try {
    const { type, config } = req.query;

    if (!type) {
      return res.status(400).json({ error: 'Missing required parameter: type' });
    }

    const models = await listExternalModels(type, JSON.parse(config || '{}'));

    res.status(200).json({ models });
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getAgentInfo(req, res) {
  try {
    const { type, config, agentId } = req.body;

    if (!type || !agentId) {
      return res.status(400).json({ error: 'Missing required parameters: type, agentId' });
    }

    const info = await getExternalAgentInfo(type, JSON.parse(config || '{}'), agentId);

    res.status(200).json(info);
  } catch (error) {
    console.error('Get agent info error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getConfig(req, res) {
  try {
    const { type, config } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Missing required parameter: type' });
    }

    const configInfo = await getExternalConfig(type, JSON.parse(config || '{}'));

    res.status(200).json(configInfo);
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function registerAgent(req, res) {
  try {
    const { type, config, agentData } = req.body;

    if (!type || !agentData) {
      return res.status(400).json({ error: 'Missing required parameters: type, agentData' });
    }

    const result = await registerExternalAgent(type, config || {}, agentData);

    res.status(201).json(result);
  } catch (error) {
    console.error('Register agent error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function discoverAgents(req, res) {
  try {
    const { type, baseUrl } = req.body;

    if (!type || !baseUrl) {
      return res.status(400).json({ error: 'Missing required parameters: type, baseUrl' });
    }

    const healthResult = await healthCheckExternalAgent(type, { baseUrl });
    if (!healthResult.success) {
      return res.status(200).json({
        discovered: false,
        message: healthResult.message,
        agents: [],
      });
    }

    const config = { baseUrl };
    let agents = [];
    let models = [];

    try {
      agents = await listExternalAgents(type, config);
    } catch (e) {
      console.warn('Failed to list agents during discovery:', e.message);
    }

    try {
      models = await listExternalModels(type, config);
    } catch (e) {
      console.warn('Failed to list models during discovery:', e.message);
    }

    res.status(200).json({
      discovered: true,
      gatewayInfo: healthResult.data,
      agents,
      models,
      adapterInfo: agentAdapterFactory.getAdapterInfo(type),
    });
  } catch (error) {
    console.error('Discover agents error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}