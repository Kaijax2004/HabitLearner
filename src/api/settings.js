import api from './index.js'

// 获取通知设置
export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/settings/notifications')
    return response
  } catch (error) {
    console.error('获取通知设置失败:', error)
    throw error
  }
}

// 更新通知设置
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.put('/settings/notifications', settings)
    return response
  } catch (error) {
    console.error('更新通知设置失败:', error)
    throw error
  }
}

// 获取隐私设置
export const getPrivacySettings = async () => {
  try {
    const response = await api.get('/settings/privacy')
    return response
  } catch (error) {
    console.error('获取隐私设置失败:', error)
    throw error
  }
}

// 更新隐私设置
export const updatePrivacySettings = async (settings) => {
  try {
    const response = await api.put('/settings/privacy', settings)
    return response
  } catch (error) {
    console.error('更新隐私设置失败:', error)
    throw error
  }
}

// 导出用户数据
export const exportUserData = async (options) => {
  try {
    const response = await api.post('/settings/export', options)
    return response
  } catch (error) {
    console.error('导出数据失败:', error)
    throw error
  }
}

// 获取管理员邮件受众
export const getAdminEmailAudience = async () => {
  try {
    const response = await api.get('/settings/admin/email-audience')
    return response
  } catch (error) {
    console.error('获取邮件受众失败:', error)
    throw error
  }
}

// 管理员群发邮件
export const sendAdminBroadcastEmail = async (payload) => {
  try {
    const response = await api.post('/settings/admin/broadcast-email', payload)
    return response
  } catch (error) {
    console.error('群发邮件失败:', error)
    throw error
  }
}
