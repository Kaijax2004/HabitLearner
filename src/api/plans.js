import api from './index.js';

/**
 * 计划管理模块API接口
 */

/**
 * 获取计划列表
 * @returns {Promise<Object>} 计划列表响应
 */
export const listPlans = async () => {
  try {
    return await api.get('/plans');
  } catch (error) {
    console.error('获取计划列表失败:', error);
    throw error;
  }
};

/**
 * 获取计划详情
 * @param {number|string} id - 计划ID
 * @returns {Promise<Object>} 计划详情响应
 */
export const getPlanById = async (id) => {
  try {
    return await api.get(`/plans/${id}`);
  } catch (error) {
    console.error(`获取计划 ${id} 详情失败:`, error);
    throw error;
  }
};

/**
 * 创建新计划
 * @param {Object} payload - 计划创建参数
 * @param {string} payload.title - 计划标题（必填）
 * @param {string} payload.status - 状态（not_started/in_progress/completed/archived）
 * @param {string} payload.due_date - 截止日期（YYYY-MM-DD）
 * @returns {Promise<Object>} 创建计划响应
 */
export const createPlan = async (payload) => {
  try {
    if (!payload || !payload.title) {
      throw new Error('计划标题不能为空');
    }
    return await api.post('/plans', payload);
  } catch (error) {
    console.error('创建计划失败:', error);
    throw error;
  }
};

/**
 * 更新计划信息
 * @param {number|string} id - 计划ID
 * @param {Object} payload - 更新参数
 * @param {string} payload.title - 计划标题
 * @param {string} payload.status - 状态
 * @param {string} payload.due_date - 截止日期
 * @returns {Promise<Object>} 更新计划响应
 */
export const updatePlan = async (id, payload) => {
  try {
    return await api.put(`/plans/${id}`, payload);
  } catch (error) {
    console.error(`更新计划 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 删除计划
 * @param {number|string} id - 计划ID
 * @returns {Promise<Object>} 删除计划响应
 */
export const deletePlan = async (id) => {
  try {
    return await api.delete(`/plans/${id}`);
  } catch (error) {
    console.error(`删除计划 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 归档计划
 * @param {number|string} id - 计划ID
 * @returns {Promise<Object>} 归档计划响应
 */
export const archivePlan = async (id) => {
  try {
    return await api.post(`/plans/${id}/archive`);
  } catch (error) {
    console.error(`归档计划 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 获取计划的所有块
 * @param {number|string} planId - 计划ID
 * @returns {Promise<Object>} 计划块列表响应
 */
export const listBlocks = async (planId) => {
  try {
    return await api.get(`/plans/${planId}/blocks`);
  } catch (error) {
    console.error(`获取计划 ${planId} 的块列表失败:`, error);
    throw error;
  }
};

/**
 * 创建计划块
 * @param {Object} payload - 计划块创建参数
 * @param {number} payload.plan_id - 所属计划ID（必填）
 * @param {string} payload.title - 计划块标题（必填）
 * @param {string} payload.content - 计划块内容
 * @param {string} payload.status - 状态（pending/active/completed）
 * @returns {Promise<Object>} 创建计划块响应
 */
export const createBlock = async (payload) => {
  try {
    if (!payload || !payload.plan_id || !payload.title) {
      throw new Error('计划ID和标题不能为空');
    }
    return await api.post('/plan-blocks', payload);
  } catch (error) {
    console.error('创建计划块失败:', error);
    throw error;
  }
};

/**
 * 更新计划块
 * @param {number|string} id - 计划块ID
 * @param {Object} payload - 更新参数
 * @param {string} payload.title - 计划块标题
 * @param {string} payload.content - 计划块内容
 * @param {string} payload.status - 状态
 * @returns {Promise<Object>} 更新计划块响应
 */
export const updateBlock = async (id, payload) => {
  try {
    return await api.patch(`/plan-blocks/${id}`, payload);
  } catch (error) {
    console.error(`更新计划块 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 删除计划块
 * @param {number|string} id - 计划块ID
 * @returns {Promise<Object>} 删除计划块响应
 */
export const deleteBlock = async (id) => {
  try {
    return await api.delete(`/plan-blocks/${id}`);
  } catch (error) {
    console.error(`删除计划块 ${id} 失败:`, error);
    throw error;
  }
};

/**
 * 重新排序计划块
 * @param {number|string} planId - 计划ID
 * @param {Array<number|string>} blockIds - 按新顺序排列的计划块ID数组
 * @returns {Promise<Object>} 重新排序响应
 */
export const reorderBlocks = async (planId, blockIds) => {
  try {
    if (!blockIds || !Array.isArray(blockIds)) {
      throw new Error('需要提供有效的计划块ID数组');
    }
    return await api.post(`/plans/${planId}/blocks/reorder`, { blockIds });
  } catch (error) {
    console.error(`重新排序计划 ${planId} 的块失败:`, error);
    throw error;
  }
};


