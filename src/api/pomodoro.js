import api from './index.js'

export const getPomodoroDashboard = async () => {
  try {
    return await api.get('/pomodoro/dashboard')
  } catch (error) {
    console.error('获取番茄钟看板失败:', error)
    throw error
  }
}

export const getPomodoroPreferences = async () => {
  try {
    return await api.get('/pomodoro/preferences')
  } catch (error) {
    console.error('获取番茄钟偏好失败:', error)
    throw error
  }
}

export const updatePomodoroPreferences = async (payload) => {
  try {
    return await api.put('/pomodoro/preferences', payload)
  } catch (error) {
    console.error('更新番茄钟偏好失败:', error)
    throw error
  }
}

export const listPomodoroSessions = async (params = {}) => {
  try {
    return await api.get('/pomodoro/sessions', params)
  } catch (error) {
    console.error('获取番茄钟记录失败:', error)
    throw error
  }
}

export const createPomodoroSession = async (payload) => {
  try {
    return await api.post('/pomodoro/sessions', payload)
  } catch (error) {
    console.error('创建番茄钟失败:', error)
    throw error
  }
}

export const runPomodoroAction = async (sessionId, payload) => {
  try {
    return await api.post(`/pomodoro/sessions/${sessionId}/action`, payload)
  } catch (error) {
    console.error('执行番茄钟操作失败:', error)
    throw error
  }
}

export const deletePomodoroSession = async (sessionId) => {
  try {
    return await api.delete(`/pomodoro/sessions/${sessionId}`)
  } catch (error) {
    console.error('删除番茄钟记录失败:', error)
    throw error
  }
}
