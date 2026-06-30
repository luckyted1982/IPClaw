import express from 'express';
import {
  createCommunity,
  getCommunities,
  getCommunityById,
  getMyCommunities,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
  createChannel,
  getCommunityChannels,
  getChannelById,
  deleteChannel,
  sendChannelMessage,
  getChannelMessages,
  createThread,
  getChannelThreads,
  getThreadById,
  deleteThread,
  sendThreadMessage,
  getThreadMessages,
  createMatter,
  getCommunityMatters,
  getMatterById,
  updateMatter,
  deleteMatter,
  reactToMessage,
  getMessageReactions,
  calculateCommunityCost,
  getCommunityAnalytics,
} from '../controllers/communityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createCommunity);
router.get('/', getCommunities);
router.get('/me', authenticateToken, getMyCommunities);
router.get('/:id', getCommunityById);
router.put('/:id', authenticateToken, updateCommunity);
router.delete('/:id', authenticateToken, deleteCommunity);
router.post('/:id/join', authenticateToken, joinCommunity);
router.post('/:id/leave', authenticateToken, leaveCommunity);
router.get('/:id/members', authenticateToken, getCommunityMembers);
router.put('/:id/members/:memberId', authenticateToken, updateMemberRole);
router.delete('/:id/members/:memberId', authenticateToken, removeMember);

router.post('/:communityId/channels', authenticateToken, createChannel);
router.get('/:communityId/channels', authenticateToken, getCommunityChannels);
router.get('/:communityId/channels/:channelId', authenticateToken, getChannelById);
router.delete('/:communityId/channels/:channelId', authenticateToken, deleteChannel);

router.post('/:communityId/channels/:channelId/messages', authenticateToken, sendChannelMessage);
router.get('/:communityId/channels/:channelId/messages', authenticateToken, getChannelMessages);

router.post('/:communityId/channels/:channelId/threads', authenticateToken, createThread);
router.get('/:communityId/channels/:channelId/threads', authenticateToken, getChannelThreads);
router.get('/:communityId/channels/:channelId/threads/:threadId', authenticateToken, getThreadById);
router.delete('/:communityId/channels/:channelId/threads/:threadId', authenticateToken, deleteThread);
router.post('/:communityId/channels/:channelId/threads/:threadId/messages', authenticateToken, sendThreadMessage);
router.get('/:communityId/channels/:channelId/threads/:threadId/messages', authenticateToken, getThreadMessages);

router.post('/:communityId/matters', authenticateToken, createMatter);
router.get('/:communityId/matters', authenticateToken, getCommunityMatters);
router.get('/:communityId/matters/:matterId', authenticateToken, getMatterById);
router.put('/:communityId/matters/:matterId', authenticateToken, updateMatter);
router.delete('/:communityId/matters/:matterId', authenticateToken, deleteMatter);

router.post('/:communityId/channels/:channelId/messages/:messageId/react', authenticateToken, reactToMessage);
router.get('/:communityId/channels/:channelId/messages/:messageId/reactions', authenticateToken, getMessageReactions);

router.post('/:communityId/cost-calculation', authenticateToken, calculateCommunityCost);
router.get('/:communityId/analytics', authenticateToken, getCommunityAnalytics);

export default router;