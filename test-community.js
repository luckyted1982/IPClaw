const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
let token = null;

async function testAuth() {
  console.log('=== 测试1: 用户登录 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'test123'
    });
    token = response.data.token;
    console.log('✅ 登录成功, 用户:', response.data.user?.email);
    return true;
  } catch (error) {
    console.log('❌ 登录失败:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testCreateCommunity() {
  console.log('\n=== 测试2: 创建社区 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/communities`, {
      name: '测试社区',
      description: '这是一个测试社区',
      accessType: 'public'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 创建社区成功:', response.data.community?.name);
    return response.data.community?.id;
  } catch (error) {
    console.log('❌ 创建社区失败:', error.response?.data?.error || error.message);
    return null;
  }
}

async function testCreateChannel(communityId) {
  console.log('\n=== 测试3: 创建频道 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/communities/${communityId}/channels`, {
      name: 'general',
      description: '通用频道'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 创建频道成功:', response.data.channel?.name);
    return response.data.channel?.id;
  } catch (error) {
    console.log('❌ 创建频道失败:', error.response?.data?.error || error.message);
    return null;
  }
}

async function testSendMessage(communityId, channelId) {
  console.log('\n=== 测试4: 发送消息 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/communities/${communityId}/channels/${channelId}/messages`, {
      content: 'Hello, Community!'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 发送消息成功:', response.data.message?.content);
    return response.data.message?.id;
  } catch (error) {
    console.log('❌ 发送消息失败:', error.response?.data?.error || error.message);
    return null;
  }
}

async function testReactToMessage(communityId, channelId, messageId) {
  console.log('\n=== 测试5: 消息反应 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/communities/${communityId}/channels/${channelId}/messages/${messageId}/react`, {
      type: 'thumbs_up'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 添加反应成功:', response.data.type, 'count:', response.data.count);
    return true;
  } catch (error) {
    console.log('❌ 添加反应失败:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testCreateMatter(communityId) {
  console.log('\n=== 测试6: 创建事项 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/communities/${communityId}/matters`, {
      title: '测试事项',
      description: '这是一个测试事项',
      priority: 'medium',
      status: 'open'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 创建事项成功:', response.data.matter?.title);
    return true;
  } catch (error) {
    console.log('❌ 创建事项失败:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testGetCommunities() {
  console.log('\n=== 测试7: 获取社区列表 ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/communities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取社区列表成功, 数量:', response.data.communities?.length);
    return true;
  } catch (error) {
    console.log('❌ 获取社区列表失败:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testGetAnalytics(communityId) {
  console.log('\n=== 测试8: 获取社区分析 ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/communities/${communityId}/analytics?period=7d`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取分析数据成功, 成员数:', response.data.memberCount);
    return true;
  } catch (error) {
    console.log('❌ 获取分析数据失败:', error.response?.data?.error || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 开始验证社区协作功能...\n');
  
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.log('\n❌ 认证失败，无法继续测试');
    return;
  }
  
  const communityId = await testCreateCommunity();
  if (!communityId) return;
  
  const channelId = await testCreateChannel(communityId);
  if (!channelId) return;
  
  const messageId = await testSendMessage(communityId, channelId);
  if (!messageId) return;
  
  await testReactToMessage(communityId, channelId, messageId);
  await testCreateMatter(communityId);
  await testGetCommunities();
  await testGetAnalytics(communityId);
  
  console.log('\n🎉 所有测试完成!');
}

runTests().catch(console.error);