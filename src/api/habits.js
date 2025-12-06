import api from './index.js'

/**
 * 获取习惯列表
 * @param {Object} params - 查询参数
 * @param {string} params.category - 可选，按分类筛选
 * @param {string} params.frequency - 可选，按频率筛选
 * @returns {Promise<Object>} 习惯列表
 */
export const getHabits = async (params = {}) => {
  try {
    const response = await api.get('/habits', params)
    return response
  } catch (error) {
    console.error('获取习惯列表失败:', error)
    throw error
  }
}

/**
 * 获取单个习惯详情
 * @param {string|number} id - 习惯ID
 * @returns {Promise<Object>} 习惯详情
 */
export const getHabitById = async (id) => {
  try {
    const response = await api.get(`/habits/${id}`)
    return response
  } catch (error) {
    console.error(`获取习惯${id}详情失败:`, error)
    throw error
  }
}

/**
 * 创建新习惯
 * @param {Object} habitData - 习惯数据
 * @param {string} habitData.name - 习惯名称
 * @param {string} habitData.description - 习惯描述
 * @param {string} habitData.icon - 图标名称
 * @param {string} habitData.color - 颜色代码
 * @param {string} habitData.frequency - 频率
 * @param {number} habitData.target - 目标值
 * @param {string} habitData.category - 分类
 * @returns {Promise<Object>} 创建结果
 */
export const createHabit = async (habitData) => {
  try {
    const response = await api.post('/habits', habitData)
    return response
  } catch (error) {
    console.error('创建习惯失败:', error)
    throw error
  }
}

/**
 * 更新习惯信息
 * @param {string|number} id - 习惯ID
 * @param {Object} habitData - 更新的习惯数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateHabit = async (id, habitData) => {
  try {
    const response = await api.put(`/habits/${id}`, habitData)
    return response
  } catch (error) {
    console.error(`更新习惯${id}失败:`, error)
    throw error
  }
}

/**
 * 删除习惯
 * @param {string|number} id - 习惯ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteHabit = async (id) => {
  try {
    const response = await api.delete(`/habits/${id}`)
    return response
  } catch (error) {
    console.error(`删除习惯${id}失败:`, error)
    throw error
  }
}

/**
 * 批量删除习惯
 * @param {Array<string|number>} ids - 习惯ID数组
 * @returns {Promise<Object>} 删除结果
 */
export const deleteHabits = async (ids) => {
  try {
    const response = await api.delete('/habits/batch', { ids })
    return response
  } catch (error) {
    console.error('批量删除习惯失败:', error)
    throw error
  }
}

/**
 * 习惯打卡
 * @param {string|number} id - 习惯ID
 * @param {Object} data - 打卡数据
 * @param {string} data.comment - 可选，打卡备注
 * @param {number} data.value - 可选，实际完成值
 * @returns {Promise<Object>} 打卡结果
 */
export const checkInHabit = async (id, data = {}) => {
  try {
    const response = await api.post(`/habits/${id}/check-in`, data)
    return response
  } catch (error) {
    console.error(`习惯${id}打卡失败:`, error)
    throw error
  }
}

/**
 * 取消打卡
 * @param {string|number} id - 习惯ID
 * @param {string} date - 打卡日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 取消结果
 */
export const cancelCheckIn = async (id, date) => {
  try {
    const response = await api.delete(`/habits/${id}/check-in`, { date })
    return response
  } catch (error) {
    console.error(`取消习惯${id}打卡失败:`, error)
    throw error
  }
}

/**
 * 添加/编辑每日留言
 * @param {string|number} id - 习惯ID
 * @param {Object} comment - 留言数据
 * @param {string} comment.content - 留言内容
 * @param {string} comment.date - 留言日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 保存结果
 */
export const addDailyComment = async (id, comment) => {
  try {
    const response = await api.post(`/habits/${id}/comments`, comment)
    return response
  } catch (error) {
    console.error(`为习惯${id}添加留言失败:`, error)
    throw error
  }
}

/**
 * 获取习惯统计数据
 * @param {string|number} id - 习惯ID
 * @param {Object} params - 查询参数
 * @param {number} params.days - 统计天数
 * @returns {Promise<Object>} 统计数据
 */
export const getHabitStats = async (id, params = {}) => {
  try {
    const response = await api.get(`/habits/${id}/stats`, params)
    return response
  } catch (error) {
    console.error(`获取习惯${id}统计失败:`, error)
    throw error
  }
}
