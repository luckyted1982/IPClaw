import prisma from '../lib/prisma.js';
import creditService from '../services/CreditService.js';
import { ServiceType } from '../services/CreditService.js';

export async function createCommunity(req, res) {
  try {
    const { name, description, accessType = 'public', avatar } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    const community = await prisma.community.create({
      data: {
        name,
        description: description || '',
        accessType: accessType || 'public',
        avatar: avatar || name.charAt(0).toUpperCase(),
        ownerId: req.user.id,
        members: {
          create: [{ userId: req.user.id, role: 'admin' }],
        },
        channels: {
          create: [{ name: 'general', description: 'General discussion', isDefault: true }],
        },
      },
      include: {
        owner: { select: { name: true, avatar: true } },
        members: { include: { user: { select: { name: true, avatar: true } } } },
        channels: true,
      },
    });

    res.status(201).json(community);
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getCommunities(req, res) {
  try {
    const { search, accessType, page = 1, limit = 20 } = req.query;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(accessType && { accessType }),
    };

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          owner: { select: { name: true, avatar: true } },
          members: { select: { userId: true } },
          channels: { take: 3 },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.community.count({ where }),
    ]);

    const result = communities.map((c) => ({
      ...c,
      memberCount: c.members.length,
      members: undefined,
    }));

    res.json({
      communities: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getCommunityById(req, res) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, avatar: true } },
        members: { include: { user: { select: { name: true, avatar: true, role: true } } } },
        channels: { include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } } },
      },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const result = {
      ...community,
      channels: community.channels.map((ch) => ({
        ...ch,
        lastMessage: ch.messages[0]?.content || '',
        messages: undefined,
      })),
    };

    res.json(result);
  } catch (error) {
    console.error('Get community by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getMyCommunities(req, res) {
  try {
    const communities = await prisma.communityMember.findMany({
      where: { userId: req.user.id },
      include: {
        community: {
          include: {
            owner: { select: { name: true, avatar: true } },
            members: { select: { userId: true } },
          },
        },
      },
      orderBy: [{ joinedAt: 'desc' }],
    });

    const result = communities.map((cm) => ({
      ...cm.community,
      myRole: cm.role,
      joinedAt: cm.joinedAt,
      memberCount: cm.community.members.length,
      members: undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get my communities error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateCommunity(req, res) {
  try {
    const { id } = req.params;
    const { name, description, accessType, avatar } = req.body;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const updatedCommunity = await prisma.community.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(accessType && { accessType }),
        ...(avatar && { avatar }),
      },
      include: {
        owner: { select: { name: true, avatar: true } },
      },
    });

    res.json(updatedCommunity);
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteCommunity(req, res) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    await prisma.community.delete({ where: { id } });

    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function joinCommunity(req, res) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.accessType === 'private') {
      return res.status(403).json({ error: 'This community is private' });
    }

    const existingMember = await prisma.communityMember.findFirst({
      where: { communityId: id, userId: req.user.id },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member' });
    }

    const member = await prisma.communityMember.create({
      data: {
        communityId: id,
        userId: req.user.id,
        role: 'member',
      },
      include: {
        community: { include: { owner: { select: { name: true, avatar: true } } } },
        user: { select: { name: true, avatar: true } },
      },
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function leaveCommunity(req, res) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const member = await prisma.communityMember.findFirst({
      where: { communityId: id, userId: req.user.id },
    });

    if (!member) {
      return res.status(400).json({ error: 'You are not a member of this community' });
    }

    if (member.role === 'admin' && community.ownerId === req.user.id) {
      return res.status(400).json({ error: 'Owner cannot leave the community' });
    }

    await prisma.communityMember.delete({ where: { id: member.id } });

    res.json({ message: 'Left community successfully' });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getCommunityMembers(req, res) {
  try {
    const { id } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const members = await prisma.communityMember.findMany({
      where: { communityId: id },
      include: {
        user: { select: { name: true, avatar: true, email: true } },
      },
      orderBy: [{ joinedAt: 'desc' }],
    });

    res.json(members);
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateMemberRole(req, res) {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const member = await prisma.communityMember.findFirst({
      where: { communityId: id, userId: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.userId === community.ownerId) {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    const updatedMember = await prisma.communityMember.update({
      where: { id: member.id },
      data: { role },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    res.json(updatedMember);
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function removeMember(req, res) {
  try {
    const { id, memberId } = req.params;

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const member = await prisma.communityMember.findFirst({
      where: { communityId: id, userId: memberId },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.userId === community.ownerId) {
      return res.status(400).json({ error: 'Cannot remove the owner' });
    }

    await prisma.communityMember.delete({ where: { id: member.id } });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function createChannel(req, res) {
  try {
    const { communityId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const isMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: req.user.id },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to create a channel' });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        description: description || '',
        communityId,
      },
      include: {
        community: { select: { name: true } },
      },
    });

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getCommunityChannels(req, res) {
  try {
    const { communityId } = req.params;

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const channels = await prisma.channel.findMany({
      where: { communityId },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
        threads: { take: 3 },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    const result = channels.map((ch) => ({
      ...ch,
      lastMessage: ch.messages[0]?.content || '',
      messageCount: ch.messages.length,
      threadCount: ch.threads.length,
      messages: undefined,
      threads: undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get community channels error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getChannelById(req, res) {
  try {
    const { communityId, channelId } = req.params;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        community: { select: { name: true, id: true } },
        messages: {
          include: {
            user: { select: { name: true, avatar: true } },
            agent: { select: { name: true, avatar: true } },
          },
          orderBy: [{ createdAt: 'asc' }],
          take: 100,
        },
        threads: { take: 10, orderBy: [{ createdAt: 'desc' }] },
      },
    });

    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json(channel);
  } catch (error) {
    console.error('Get channel by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteChannel(req, res) {
  try {
    const { communityId, channelId } = req.params;

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default channel' });
    }

    await prisma.channel.delete({ where: { id: channelId } });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function sendChannelMessage(req, res) {
  try {
    const { communityId, channelId } = req.params;
    const { content, type = 'text', agentId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const isMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: req.user.id },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to send messages' });
    }

    const message = await prisma.channelMessage.create({
      data: {
        channelId,
        userId: agentId ? undefined : req.user.id,
        agentId: agentId || undefined,
        content,
        type,
      },
      include: {
        user: { select: { name: true, avatar: true } },
        agent: { select: { name: true, avatar: true } },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send channel message error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getChannelMessages(req, res) {
  try {
    const { communityId, channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const [messages, total] = await Promise.all([
      prisma.channelMessage.findMany({
        where: { channelId },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          user: { select: { name: true, avatar: true } },
          agent: { select: { name: true, avatar: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
      }),
      prisma.channelMessage.count({ where: { channelId } }),
    ]);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get channel messages error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function createThread(req, res) {
  try {
    const { communityId, channelId } = req.params;
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Thread title is required' });
    }

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const isMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: req.user.id },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to create a thread' });
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        channelId,
      },
      include: {
        channel: { select: { name: true } },
      },
    });

    if (content) {
      await prisma.threadMessage.create({
        data: {
          threadId: thread.id,
          userId: req.user.id,
          content,
          type: 'text',
        },
      });
    }

    res.status(201).json(thread);
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getChannelThreads(req, res) {
  try {
    const { communityId, channelId } = req.params;

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const threads = await prisma.thread.findMany({
      where: { channelId },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const result = threads.map((th) => ({
      ...th,
      lastMessage: th.messages[0]?.content || '',
      messageCount: th.messages.length,
      messages: undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get channel threads error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getThreadById(req, res) {
  try {
    const { communityId, channelId, threadId } = req.params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        channel: { select: { name: true, communityId: true } },
        messages: {
          include: {
            user: { select: { name: true, avatar: true } },
            agent: { select: { name: true, avatar: true } },
          },
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });

    if (!thread || thread.channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);
  } catch (error) {
    console.error('Get thread by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteThread(req, res) {
  try {
    const { communityId, channelId, threadId } = req.params;

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { channel: { select: { communityId: true } } },
    });

    if (!thread || thread.channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    await prisma.thread.delete({ where: { id: threadId } });

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function sendThreadMessage(req, res) {
  try {
    const { communityId, channelId, threadId } = req.params;
    const { content, type = 'text', agentId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { channel: { select: { communityId: true } } },
    });

    if (!thread || thread.channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const isMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: req.user.id },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to send messages' });
    }

    const message = await prisma.threadMessage.create({
      data: {
        threadId,
        userId: agentId ? undefined : req.user.id,
        agentId: agentId || undefined,
        content,
        type,
      },
      include: {
        user: { select: { name: true, avatar: true } },
        agent: { select: { name: true, avatar: true } },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send thread message error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getThreadMessages(req, res) {
  try {
    const { communityId, channelId, threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { channel: { select: { communityId: true } } },
    });

    if (!thread || thread.channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const [messages, total] = await Promise.all([
      prisma.threadMessage.findMany({
        where: { threadId },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          user: { select: { name: true, avatar: true } },
          agent: { select: { name: true, avatar: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
      }),
      prisma.threadMessage.count({ where: { threadId } }),
    ]);

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get thread messages error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function createMatter(req, res) {
  try {
    const { communityId } = req.params;
    const { title, description, channelId, threadId, deadline, deliverables } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Matter title is required' });
    }

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const isMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: req.user.id },
    });

    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to create a matter' });
    }

    const matter = await prisma.matter.create({
      data: {
        title,
        description: description || '',
        ownerId: req.user.id,
        communityId,
        channelId: channelId || undefined,
        threadId: threadId || undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        deliverables: deliverables || '',
      },
      include: {
        owner: { select: { name: true, avatar: true } },
        community: { select: { name: true } },
        channel: { select: { name: true } },
        thread: { select: { title: true } },
      },
    });

    res.status(201).json(matter);
  } catch (error) {
    console.error('Create matter error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getCommunityMatters(req, res) {
  try {
    const { communityId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const where = {
      communityId,
      ...(status && { status }),
    };

    const [matters, total] = await Promise.all([
      prisma.matter.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          owner: { select: { name: true, avatar: true } },
          channel: { select: { name: true } },
          thread: { select: { title: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.matter.count({ where }),
    ]);

    res.json({
      matters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get community matters error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getMatterById(req, res) {
  try {
    const { communityId, matterId } = req.params;

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        owner: { select: { name: true, avatar: true } },
        community: { select: { name: true, id: true } },
        channel: { select: { name: true } },
        thread: { select: { title: true } },
      },
    });

    if (!matter || matter.communityId !== communityId) {
      return res.status(404).json({ error: 'Matter not found' });
    }

    res.json(matter);
  } catch (error) {
    console.error('Get matter by id error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function updateMatter(req, res) {
  try {
    const { communityId, matterId } = req.params;
    const { title, description, status, deadline, deliverables } = req.body;

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: { community: { select: { ownerId: true } } },
    });

    if (!matter || matter.communityId !== communityId) {
      return res.status(404).json({ error: 'Matter not found' });
    }

    if (matter.ownerId !== req.user.id && matter.community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    const updatedMatter = await prisma.matter.update({
      where: { id: matterId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(deliverables !== undefined && { deliverables }),
      },
      include: {
        owner: { select: { name: true, avatar: true } },
        community: { select: { name: true } },
      },
    });

    res.json(updatedMatter);
  } catch (error) {
    console.error('Update matter error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteMatter(req, res) {
  try {
    const { communityId, matterId } = req.params;

    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: { community: { select: { ownerId: true } } },
    });

    if (!matter || matter.communityId !== communityId) {
      return res.status(404).json({ error: 'Matter not found' });
    }

    if (matter.ownerId !== req.user.id && matter.community.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not the owner' });
    }

    await prisma.matter.delete({ where: { id: matterId } });

    res.json({ message: 'Matter deleted successfully' });
  } catch (error) {
    console.error('Delete matter error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function reactToMessage(req, res) {
  try {
    const { communityId, channelId, messageId } = req.params;
    const { type } = req.body;

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const message = await prisma.channelMessage.findUnique({ where: { id: messageId } });
    if (!message || message.channelId !== channelId) {
      return res.status(404).json({ error: 'Message not found' });
    }

    let reaction = await prisma.messageReaction.findFirst({
      where: { messageId, userId: req.user.id, type },
    });

    let count;
    if (reaction) {
      await prisma.messageReaction.delete({ where: { id: reaction.id } });
      count = await prisma.messageReaction.count({ where: { messageId, type } });
    } else {
      await prisma.messageReaction.create({
        data: { messageId, userId: req.user.id, type },
      });
      count = await prisma.messageReaction.count({ where: { messageId, type } });
    }

    res.json({ messageId, type, count });
  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getMessageReactions(req, res) {
  try {
    const { communityId, channelId, messageId } = req.params;

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    if (!channel || channel.communityId !== communityId) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const message = await prisma.channelMessage.findUnique({ where: { id: messageId } });
    if (!message || message.channelId !== channelId) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const reactions = await prisma.messageReaction.groupBy({
      by: ['type'],
      where: { messageId },
      _count: { type: true },
    });

    const result = reactions.map((r) => ({
      type: r.type,
      count: r._count.type,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get message reactions error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function calculateCommunityCost(req, res) {
  try {
    const { serviceType, modelName, inputTokens, outputTokens } = req.body;

    let estimatedCredits = 0;
    let description = '';

    switch (serviceType) {
      case 'agent_chat':
        estimatedCredits = creditService.calculateChatCredits(modelName || 'deepseek-chat', inputTokens || 0, outputTokens || 0);
        description = `社区 Agent 对话 (${inputTokens + outputTokens} tokens)`;
        break;
      case 'task_execution':
        estimatedCredits = creditService.calculateTaskCredits(1, 'medium');
        description = '社区任务执行';
        break;
      case 'document_generation':
        estimatedCredits = creditService.calculateDocumentCredits(modelName || 'deepseek-chat', inputTokens || 1000);
        description = `社区文档生成 (${inputTokens} tokens)`;
        break;
      default:
        return res.status(400).json({ error: '未知服务类型' });
    }

    const hasEnough = await creditService.hasEnoughCredits(req.user.id, estimatedCredits);

    res.json({
      estimatedCredits,
      serviceType,
      description,
      modelName,
      inputTokens,
      outputTokens,
      hasEnoughCredits: hasEnough,
    });
  } catch (error) {
    console.error('Calculate community cost error:', error);
    res.status(500).json({ error: '计算积分失败', details: error.message });
  }
}

export async function getCommunityAnalytics(req, res) {
  try {
    const { communityId } = req.params;
    const { period = '7d' } = req.query;

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const now = new Date();
    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [memberCount, activeMemberCount, totalMessages, matterStats, channelStats, dailyActivity] = await Promise.all([
      prisma.communityMember.count({ where: { communityId } }),
      prisma.communityMember.count({
        where: {
          communityId,
          joinedAt: { gte: startDate },
        },
      }),
      prisma.channelMessage.count({
        where: {
          channel: { communityId },
          createdAt: { gte: startDate },
        },
      }),
      prisma.matter.aggregate({
        where: { communityId },
        _count: { id: true },
        _groupBy: { status: true },
      }),
      prisma.channel.findMany({
        where: { communityId },
        include: {
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.channelMessage.groupBy({
        by: ['createdAt'],
        where: {
          channel: { communityId },
          createdAt: { gte: startDate },
        },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const matterByStatus = {};
    matterStats.forEach((m) => {
      matterByStatus[m.status] = m._count.id;
    });

    const activityData = dailyActivity.map((d) => ({
      date: d.createdAt.toISOString().split('T')[0],
      count: d._count.id,
    }));

    res.json({
      communityId,
      communityName: community.name,
      period,
      memberCount,
      activeMemberCount,
      totalMessages,
      matterStats: {
        total: Object.values(matterByStatus).reduce((a, b) => a + b, 0),
        byStatus: matterByStatus,
      },
      topChannels: channelStats.map((ch) => ({
        id: ch.id,
        name: ch.name,
        messageCount: ch._count.messages,
      })),
      activityData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get community analytics error:', error);
    res.status(500).json({ error: '获取分析数据失败', details: error.message });
  }
}