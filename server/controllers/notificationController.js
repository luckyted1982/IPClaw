import prisma from '../lib/prisma.js';

const connectedClients = new Map();

export function registerClient(userId, ws) {
  if (!connectedClients.has(userId)) {
    connectedClients.set(userId, []);
  }
  connectedClients.get(userId).push(ws);
}

export function unregisterClient(userId, ws) {
  const clients = connectedClients.get(userId);
  if (clients) {
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
    if (clients.length === 0) {
      connectedClients.delete(userId);
    }
  }
}

export async function sendNotification(userId, notification) {
  const clients = connectedClients.get(userId);
  if (clients) {
    clients.forEach(ws => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'notification', data: notification }));
      }
    });
  }

  await prisma.notification.create({
    data: {
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      payload: JSON.stringify(notification.payload || {}),
    },
  });
}

export async function createNotification(req, res) {
  try {
    const { userId, type, title, message, payload } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message: message || '',
        payload: JSON.stringify(payload || {}),
      },
    });

    await sendNotification(userId, { type, title, message, payload });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getUserNotifications(req, res) {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const where = {
      userId: req.user.id,
      ...(type && { type }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function markAllNotificationsAsRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}