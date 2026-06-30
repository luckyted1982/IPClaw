import { WebSocketServer } from 'ws';

const communityConnections = new Map();

export function setupCommunityWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.slice(1));
    const userId = urlParams.get('userId');
    const communityId = urlParams.get('communityId');

    if (userId) {
      if (!communityConnections.has(userId)) {
        communityConnections.set(userId, new Set());
      }
      communityConnections.get(userId).add(ws);
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        handleCommunityMessage(ws, data);
      } catch (error) {
        console.error('Community WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId && communityConnections.has(userId)) {
        communityConnections.get(userId).delete(ws);
        if (communityConnections.get(userId).size === 0) {
          communityConnections.delete(userId);
        }
      }
    });
  });
}

function handleCommunityMessage(ws, data) {
  switch (data.type) {
    case 'subscribe':
      handleSubscribe(ws, data);
      break;
    case 'unsubscribe':
      handleUnsubscribe(ws, data);
      break;
    case 'channel_message':
      handleChannelMessage(data);
      break;
    case 'thread_message':
      handleThreadMessage(data);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

const subscriptions = new Map();

function handleSubscribe(ws, data) {
  const { userId, communityId, channelId } = data;
  
  if (!subscriptions.has(communityId)) {
    subscriptions.set(communityId, new Map());
  }
  
  if (!subscriptions.get(communityId).has(channelId)) {
    subscriptions.get(communityId).set(channelId, new Set());
  }
  
  subscriptions.get(communityId).get(channelId).add(ws);
  
  ws.send(JSON.stringify({ 
    type: 'subscribed', 
    communityId, 
    channelId 
  }));
}

function handleUnsubscribe(ws, data) {
  const { communityId, channelId } = data;
  
  if (subscriptions.has(communityId) && subscriptions.get(communityId).has(channelId)) {
    subscriptions.get(communityId).get(channelId).delete(ws);
  }
}

export function broadcastChannelMessage(communityId, channelId, message) {
  if (!subscriptions.has(communityId)) return;
  
  const channelSubscriptions = subscriptions.get(communityId);
  
  if (channelSubscriptions.has(channelId)) {
    channelSubscriptions.get(channelId).forEach((ws) => {
      if (ws.readyState === WebSocketServer.OPEN) {
        ws.send(JSON.stringify({
          type: 'channel_message',
          communityId,
          channelId,
          message,
        }));
      }
    });
  }
  
  const defaultChannel = channelSubscriptions.get('*');
  if (defaultChannel) {
    defaultChannel.forEach((ws) => {
      if (ws.readyState === WebSocketServer.OPEN) {
        ws.send(JSON.stringify({
          type: 'channel_message',
          communityId,
          channelId,
          message,
        }));
      }
    });
  }
}

export function broadcastThreadMessage(communityId, channelId, threadId, message) {
  if (!subscriptions.has(communityId)) return;
  
  const channelSubscriptions = subscriptions.get(communityId);
  
  if (channelSubscriptions.has(channelId)) {
    channelSubscriptions.get(channelId).forEach((ws) => {
      if (ws.readyState === WebSocketServer.OPEN) {
        ws.send(JSON.stringify({
          type: 'thread_message',
          communityId,
          channelId,
          threadId,
          message,
        }));
      }
    });
  }
}

export function broadcastMatterUpdate(communityId, matter) {
  if (!subscriptions.has(communityId)) return;
  
  subscriptions.get(communityId).forEach((channelSubscriptions) => {
    channelSubscriptions.forEach((wsSet) => {
      wsSet.forEach((ws) => {
        if (ws.readyState === WebSocketServer.OPEN) {
          ws.send(JSON.stringify({
            type: 'matter_update',
            communityId,
            matter,
          }));
        }
      });
    });
  });
}

export function broadcastCommunityEvent(communityId, eventType, payload) {
  if (!subscriptions.has(communityId)) return;
  
  subscriptions.get(communityId).forEach((channelSubscriptions) => {
    channelSubscriptions.forEach((wsSet) => {
      wsSet.forEach((ws) => {
        if (ws.readyState === WebSocketServer.OPEN) {
          ws.send(JSON.stringify({
            type: eventType,
            communityId,
            payload,
          }));
        }
      });
    });
  });
}

export function sendDirectMessage(userId, message) {
  if (!communityConnections.has(userId)) return;
  
  communityConnections.get(userId).forEach((ws) => {
    if (ws.readyState === WebSocketServer.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}