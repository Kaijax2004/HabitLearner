// 临时测试用户工具
// 用于在开发环境中绕过登录问题，直接测试提醒功能

export const createTestUser = () => {
  const testUser = {
    id: 999,
    username: 'testuser',
    email: 'test@example.com',
    avatar: null,
    createdAt: new Date().toISOString()
  }
  
  const testToken = 'test-token-' + Date.now()
  
  // 存储到 localStorage
  localStorage.setItem('token', testToken)
  localStorage.setItem('user', JSON.stringify(testUser))
  
  console.log('🧪 创建测试用户:', testUser)
  return { user: testUser, token: testToken }
}

export const createTestHabits = () => {
  const testHabits = [
    {
      id: 'test-habit-1',
      name: '学习编程',
      icon: '💻',
      category: '学习',
      color: '#007AFF',
      target: 1,
      frequency: 'daily',
      enableComments: false,
      reminderEnabled: true,
      reminderTime: getCurrentTime(),
      createdAt: new Date().toISOString(),
      userId: 999,
      isTestHabit: true // 标记为测试习惯
    },
    {
      id: 'test-habit-2',
      name: '阅读书籍',
      icon: '📚',
      category: '学习',
      color: '#10b981',
      target: 1,
      frequency: 'daily',
      enableComments: true,
      reminderEnabled: true,
      reminderTime: getNextMinuteTime(),
      createdAt: new Date().toISOString(),
      userId: 999,
      isTestHabit: true // 标记为测试习惯
    },
    {
      id: 'test-habit-3',
      name: '运动锻炼',
      icon: '🏃',
      category: '健康',
      color: '#f59e0b',
      target: 1,
      frequency: 'daily',
      enableComments: false,
      reminderEnabled: false,
      reminderTime: new Date().toTimeString().slice(0, 5), // 当前时间 HH:MM
      createdAt: new Date().toISOString(),
      userId: 999,
      isTestHabit: true // 标记为测试习惯
    }
  ]
  
  // 存储到 localStorage
  localStorage.setItem('testHabits', JSON.stringify(testHabits))
  
  console.log('🧪 创建测试习惯:', testHabits)
  return testHabits
}

export const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

export const getNextMinuteTime = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1)
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

export const setupTestEnvironment = () => {
  console.log('🧪 设置测试环境...')
  
  // 创建测试用户
  const { user, token } = createTestUser()
  
  // 创建测试习惯
  const habits = createTestHabits()
  
  // 模拟认证状态
  window.testUser = user
  window.testToken = token
  window.testHabits = habits
  
  console.log('✅ 测试环境设置完成')
  console.log('👤 测试用户:', user.username)
  console.log('📋 测试习惯数量:', habits.length)
  console.log('⏰ 当前时间:', getCurrentTime())
  console.log('⏰ 下一分钟时间:', getNextMinuteTime())
  
  return { user, token, habits }
}

export const clearTestEnvironment = () => {
  console.log('🧹 清理测试环境...')
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('testHabits')
  
  delete window.testUser
  delete window.testToken
  delete window.testHabits
  
  console.log('✅ 测试环境已清理')
}
