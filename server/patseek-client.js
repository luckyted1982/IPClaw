import fetch from 'node-fetch';

const PATSEEK_API_BASE = 'https://patseek.cn/v1';

/**
 * PatSeek 专利检索客户端
 * 支持三种检索模式：简单检索、布尔检索、语义检索
 * API 文档: https://www.skillhub.cn/skills/patseek-patent-search
 */
export class PatSeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = PATSEEK_API_BASE;
  }

  /**
   * 简单检索 / 布尔检索 - 按关键词或专利号检索
   * POST /v1/search
   * @param {string} query - 检索关键词、专利号或布尔检索表达式
   * @param {number} pageSize - 返回结果数量 (1-100)
   */
  async simpleSearch(query, pageSize = 10) {
    try {
      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          page: 1,
          page_size: pageSize,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PatSeek API error');
      }

      return await response.json();
    } catch (error) {
      console.error('PatSeek simple search error:', error);
      throw error;
    }
  }

  /**
   * 布尔检索 - 支持复杂查询表达式
   * POST /v1/search
   * @param {string} query - 布尔检索表达式
   * @param {number} pageSize - 返回结果数量 (1-100)
   */
  async boolSearch(query, pageSize = 10) {
    try {
      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          page: 1,
          page_size: pageSize,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PatSeek API error');
      }

      return await response.json();
    } catch (error) {
      console.error('PatSeek bool search error:', error);
      throw error;
    }
  }

  /**
   * 语义检索 - 基于技术描述的语义相似度检索（异步）
   * POST /v1/semantic/async
   * @param {string} text - 技术描述文本
   * @param {number} topN - 返回结果数量 (1-100)
   */
  async semanticSearch(text, topN = 10) {
    try {
      // 提交异步任务
      const response = await fetch(`${this.baseURL}/semantic/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text,
          top_n: topN,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PatSeek API error');
      }

      const taskData = await response.json();
      const taskId = taskData.task_id;

      // 轮询任务状态
      return await this.pollTaskStatus(taskId);
    } catch (error) {
      console.error('PatSeek semantic search error:', error);
      throw error;
    }
  }

  /**
   * 轮询语义检索任务状态
   * @param {string} taskId - 任务 ID
   * @param {number} timeout - 超时时间（毫秒），默认 180000 (3 分钟)
   */
  async pollTaskStatus(taskId, timeout = 180000) {
    const startTime = Date.now();
    let pollInterval = 2000; // 初始 2 秒

    while (Date.now() - startTime < timeout) {
      const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PatSeek API error');
      }

      const taskData = await response.json();

      if (taskData.status === 'completed') {
        return taskData;
      } else if (taskData.status === 'failed') {
        throw new Error(taskData.error || 'Semantic search task failed');
      }

      // 调整轮询间隔：前 10 秒每 2 秒，10-60 秒每 5 秒，60 秒后每 10 秒
      const elapsed = Date.now() - startTime;
      if (elapsed < 10000) {
        pollInterval = 2000;
      } else if (elapsed < 60000) {
        pollInterval = 5000;
      } else {
        pollInterval = 10000;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Semantic search task timeout');
  }

  /**
   * 获取专利详情
   * GET /v1/patent/{identifier}
   * @param {string} identifier - 专利公布号或申请号
   */
  async getPatentDetail(identifier) {
    try {
      const response = await fetch(`${this.baseURL}/patent/${identifier}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'PatSeek API error');
      }

      return await response.json();
    } catch (error) {
      console.error('PatSeek get patent detail error:', error);
      throw error;
    }
  }
}

export default PatSeekClient;
