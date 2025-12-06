// Mock数据 - 移除实际API调用

// 本地存储键
const LS_NOTIFICATION_SETTINGS = 'notification_settings'

// 初始化默认通知设置
const initializeDefaultSettings = () => {
  if (!localStorage.getItem(LS_NOTIFICATION_SETTINGS)) {
    const defaultSettings = {
      enable_reminders: true,
      reminder_time: '09:00',
      weekly_summary: true,
      achievement_notifications: true,
      learning_recommendations: false
    }
    localStorage.setItem(LS_NOTIFICATION_SETTINGS, JSON.stringify(defaultSettings))
  }
}

// 初始化默认设置
initializeDefaultSettings()

// 获取通知设置
export const getNotificationSettings = async () => {
  const settings = JSON.parse(localStorage.getItem(LS_NOTIFICATION_SETTINGS) || '{}')
  return { 
    success: true, 
    data: settings,
    message: '获取通知设置成功'
  }
}

// 更新通知设置
export const updateNotificationSettings = async (settings) => {
  const currentSettings = JSON.parse(localStorage.getItem(LS_NOTIFICATION_SETTINGS) || '{}')
  const updatedSettings = { ...currentSettings, ...settings }
  localStorage.setItem(LS_NOTIFICATION_SETTINGS, JSON.stringify(updatedSettings))
  return { 
    success: true, 
    data: updatedSettings,
    message: '通知设置已更新'
  }
}

// 导出用户数据
export const exportUserData = async (options) => {
  // 模拟导出操作
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '用户数据导出成功',
        data: {
          export_url: '#',
          filename: `habit_learner_data_${new Date().toISOString().split('T')[0]}.json`,
          export_time: new Date().toISOString(),
          export_options: options || { format: 'json', include_media: false }
        }
      })
    }, 500)
  })
}
