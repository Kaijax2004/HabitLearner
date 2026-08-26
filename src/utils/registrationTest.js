import api from '../api/index.js'

// 测试注册功能
export const testRegistration = async () => {
  const testUser = {
    name: '测试用户',
    email: `test${Date.now()}@example.com`,
    password: '123456'
  }
  
  try {
    console.log('🧪 开始测试注册功能...')
    console.log('📧 测试邮箱:', testUser.email)
    
    const response = await api.post('/auth/register', testUser)
    
    if (response.success) {
      console.log('✅ 注册测试成功!')
      console.log('👤 用户信息:', response.data.user)
      return { success: true, data: response.data }
    } else {
      console.error('❌ 注册测试失败:', response.error)
      return { success: false, error: response.error }
    }
  } catch (error) {
    console.error('❌ 注册测试异常:', error)
    return { success: false, error: error.error || error.message }
  }
}

// 测试登录功能
export const testLogin = async (email, password) => {
  try {
    console.log('🧪 开始测试登录功能...')
    console.log('📧 登录邮箱:', email)
    
    const response = await api.post('/auth/login', { email, password })
    
    if (response.success) {
      console.log('✅ 登录测试成功!')
      console.log('👤 用户信息:', response.data.user)
      return { success: true, data: response.data }
    } else {
      console.error('❌ 登录测试失败:', response.error)
      return { success: false, error: response.error }
    }
  } catch (error) {
    console.error('❌ 登录测试异常:', error)
    return { success: false, error: error.error || error.message }
  }
}

// 完整测试流程
export const runFullTest = async () => {
  console.log('🚀 开始完整API测试流程...')
  
  // 1. 测试注册
  const registerResult = await testRegistration()
  
  if (registerResult.success) {
    // 2. 测试登录
    const loginResult = await testLogin(
      registerResult.data.user.email,
      '123456'
    )
    
    if (loginResult.success) {
      console.log('🎉 所有测试通过! API功能正常')
      return { success: true, message: '所有测试通过' }
    } else {
      console.error('❌ 登录测试失败')
      return { success: false, message: '登录测试失败', error: loginResult.error }
    }
  } else {
    console.error('❌ 注册测试失败')
    return { success: false, message: '注册测试失败', error: registerResult.error }
  }
}
