// 导入api实例
import api from './index.js'

// 获取用户统计概览
export const getStatsOverview = async () => {
  try {
    const result = await api.get('/stats/overview')
    return result
  } catch (error) {
    console.error('获取统计概览失败:', error)
    return error
  }
}

// 获取习惯完成历史
export const getHabitHistory = async (id, params = {}) => {
  try {
    let url = `/stats/history/${id}`
    if (params.days) {
      url += `?days=${params.days}`
    }
    const result = await api.get(url)
    return result
  } catch (error) {
    console.error('获取习惯历史失败:', error)
    return error
  }
}

// 获取月度详细报告
export const getMonthlyReport = async (params = {}) => {
  try {
    let url = '/stats/monthly'
    if (params.year && params.month) {
      url = `/stats/monthly?year=${params.year}&month=${params.month}`
    }
    const result = await api.get(url)
    return result
  } catch (error) {
    console.error('获取月度报告失败:', error)
    return error
  }
}
