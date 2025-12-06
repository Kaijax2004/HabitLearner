import api from './index.js';

/**
 * 学习资源模块API接口
 */

/**
 * 获取学习分类
 * @returns {Promise<Object>} 学习分类列表响应
 */
export const getCourseCategories = async () => {
  try {
    return await api.get('/learning/categories');
  } catch (error) {
    console.error('获取学习分类失败:', error);
    throw error;
  }
};

/**
 * 获取课程列表
 * @param {Object} params - 查询参数
 * @param {number} params.categoryId - 分类ID（可选）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10）
 * @param {string} params.search - 搜索关键词（可选）
 * @returns {Promise<Object>} 课程列表响应
 */
export const getCourses = async (params = {}) => {
  try {
    return await api.get('/learning/courses', { params });
  } catch (error) {
    console.error('获取课程列表失败:', error);
    throw error;
  }
};

/**
 * 获取课程详情
 * @param {number|string} id - 课程ID
 * @returns {Promise<Object>} 课程详情响应
 */
export const getCourseById = async (id) => {
  try {
    return await api.get(`/learning/courses/${id}`);
  } catch (error) {
    console.error(`获取课程 ${id} 详情失败:`, error);
    throw error;
  }
};

/**
 * 上传用户视频
 * 注意：API文档中未明确定义该接口，但保留用于兼容性
 * @param {FormData} formData - 包含视频文件的表单数据
 * @returns {Promise<Object>} 视频上传响应
 */
export const uploadVideo = async (formData) => {
  try {
    // 如果API文档中未定义该接口，这里可能需要根据后端实际情况调整路径
    return await api.post('/learning/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('视频上传失败:', error);
    throw error;
  }
};

/**
 * 为课程评分
 * @param {number|string} id - 课程ID
 * @param {number} rating - 评分（1-5）
 * @returns {Promise<Object>} 评分响应
 */
export const rateCourse = async (id, rating) => {
  try {
    // 验证评分范围
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('评分必须是1-5之间的数字');
    }
    return await api.post(`/learning/courses/${id}/rating`, { rating });
  } catch (error) {
    console.error(`为课程 ${id} 评分失败:`, error);
    throw error;
  }
};

/**
 * 标记课程为已完成
 * @param {number|string} id - 课程ID
 * @returns {Promise<Object>} 标记完成响应
 */
export const completeCourse = async (id) => {
  try {
    return await api.post(`/learning/courses/${id}/complete`);
  } catch (error) {
    console.error(`标记课程 ${id} 完成失败:`, error);
    throw error;
  }
};

/**
 * 获取统计数据模块接口
 */

/**
 * 获取统计概览
 * @returns {Promise<Object>} 统计概览响应
 */
export const getStatsOverview = async () => {
  try {
    return await api.get('/stats/overview');
  } catch (error) {
    console.error('获取统计概览失败:', error);
    throw error;
  }
};

/**
 * 获取习惯完成历史
 * @param {number|string} habitId - 习惯ID
 * @param {Object} params - 查询参数
 * @param {number} params.days - 天数（默认30）
 * @returns {Promise<Object>} 习惯完成历史响应
 */
export const getHabitHistory = async (habitId, params = {}) => {
  try {
    return await api.get(`/stats/history/${habitId}`, { params });
  } catch (error) {
    console.error(`获取习惯 ${habitId} 完成历史失败:`, error);
    throw error;
  }
};

/**
 * 获取月度详细报告
 * @param {Object} params - 查询参数
 * @param {number} params.year - 年份（默认当前年）
 * @param {number} params.month - 月份（默认当前月）
 * @returns {Promise<Object>} 月度详细报告响应
 */
export const getMonthlyReport = async (params = {}) => {
  try {
    return await api.get('/stats/monthly', { params });
  } catch (error) {
    console.error('获取月度详细报告失败:', error);
    throw error;
  }
};
