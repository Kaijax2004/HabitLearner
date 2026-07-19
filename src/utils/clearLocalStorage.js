// 清除本地存储中的测试数据，用于开发测试
const clearLocalStorage = () => {
  try {
    // 清除用户认证相关数据
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 清除习惯相关数据
    localStorage.removeItem('habits')
    localStorage.removeItem('testHabits')
    
    // 清除引导相关数据
    localStorage.removeItem('is_new_user')
    localStorage.removeItem('has_completed_onboarding')
    
    // 清除其他可能相关的数据
    localStorage.removeItem('plan')
    localStorage.removeItem('plans')
    localStorage.removeItem('categories')
    localStorage.removeItem('theme')
    
    console.log('✅ 已清除所有本地存储数据')
    return true
  } catch (error) {
    console.error('❌ 清除本地存储数据失败:', error)
    return false
  }
}

// 如果在浏览器环境中直接执行
if (typeof window !== 'undefined') {
  clearLocalStorage()
}

export default clearLocalStorage