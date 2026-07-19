import api from './index.js'

export const getStatsOverview = async (params = {}) => {
  try {
    return await api.get('/stats/overview', params)
  } catch (error) {
    console.error('获取统计概览失败:', error)
    return error
  }
}

export const getHabitHistory = async (id, params = {}) => {
  try {
    return await api.get(`/stats/history/${id}`, params)
  } catch (error) {
    console.error('获取习惯历史失败:', error)
    return error
  }
}

export const getMonthlyReport = async (params = {}) => {
  try {
    return await api.get('/stats/monthly', params)
  } catch (error) {
    console.error('获取月度报告失败:', error)
    return error
  }
}
