// API基础配置
const api = {}

// API根地址 - 使用相对路径以利用Vite代理
// 这样请求会通过Vite的代理转发到后端，避免跨域问题
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 为非浏览器环境提供localStorage的模拟实现（仅用于token管理，不再用于存储任何用户数据）
const storage = typeof window !== 'undefined' ? window.localStorage : {
  _data: {},
  getItem(key) {
    // 只允许获取token相关的存储
    return key === 'token' ? this._data[key] || null : null
  },
  setItem(key, value) {
    // 只允许存储token
    if (key === 'token') {
      this._data[key] = value
    }
  },
  removeItem(key) {
    // 只允许移除token
    if (key === 'token') {
      delete this._data[key]
    }
  },
  clear() {
    // 只清除token
    this._data = {}
  }
}

// 跟踪用户状态
const getIsNewUser = () => {
  // 检查是否有用户ID存储，没有则视为新用户
  const hasUserId = localStorage.getItem('hasLoggedInBefore')
  return !hasUserId
}
const setIsNewUser = (value) => {
  if (!value) {
    localStorage.setItem('hasLoggedInBefore', 'true')
  } else {
    localStorage.removeItem('hasLoggedInBefore')
  }
}
// 用于标识用户是否已完成引导
const hasCompletedOnboarding = () => {
  return localStorage.getItem('onboardingCompleted') === 'true'
}
const markOnboardingComplete = () => {
  localStorage.setItem('onboardingCompleted', 'true')
}

// 移除所有mock数据逻辑，只调用后端API

// 请求拦截器
const requestInterceptor = (config) => {
  // 获取token
  const token = storage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  // 添加其他通用头信息
  config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
  config.headers['Accept'] = 'application/json'
  
  console.log('API请求配置:', config)
  return config
}

// 响应拦截器
const responseInterceptor = async (response) => {
  try {
    const data = await response.json()
    
    // 统一处理响应格式
    if (!data.success && data.code === 401) {
      // 认证失败，清除token
      storage.removeItem('token')
      console.error('认证失败，请重新登录')
    }
    
    return data
  } catch (error) {
    console.error('响应解析错误:', error)
    throw error
  }
}

// 本地存储功能已移除，仅保留token存储功能

// 核心请求函数
  const call = async (method, url, params = {}, body = null) => {
    // 构建完整URL
    const fullUrl = `${API_BASE_URL}${url}`
    
    // 处理查询参数
    let requestUrl = fullUrl
    if (method === 'GET' && params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString()
      requestUrl = `${fullUrl}?${queryString}`
    }
    
    // 构建请求配置
    const config = {
      method,
      headers: {}
    }
    
    // 处理请求体
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // FormData不需要设置Content-Type，浏览器会自动设置
        config.body = body
      } else {
        // JSON数据
        config.headers['Content-Type'] = 'application/json'
        config.body = JSON.stringify(body)
      }
    }
    
    // 应用请求拦截器
    const interceptedConfig = requestInterceptor(config)
    
    try {
      // 发送API请求
      const response = await fetch(requestUrl, interceptedConfig)
      
      // 检查响应状态
      if (!response.ok) {
        console.error(`❌ 后端API ${method.toUpperCase()}请求失败 (${response.status}): ${requestUrl}`)
        try {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ 错误详情:', errorData)
          return {
            success: false,
            error: errorData.error || errorData.message || errorData.detail || `请求失败，状态码: ${response.status}`,
            code: response.status,
            details: errorData
          }
        } catch (parseError) {
          console.error('解析错误响应失败:', parseError)
          // 尝试获取响应文本
          try {
            const errorText = await response.text()
            console.error('❌ 错误响应文本:', errorText)
            return {
              success: false,
              error: `请求失败 (${response.status}): ${errorText || '无法解析响应'}`,
              code: response.status
            }
          } catch (textError) {
            return {
              success: false,
              error: `请求失败，状态码: ${response.status}`,
              code: response.status
            }
          }
        }
      }
      
      // 应用响应拦截器
      const data = await responseInterceptor(response)
      
      // 只保存token到本地存储（如果响应中包含）
      if ((url.includes('/auth/login') || url.includes('/auth/register')) && data.success && data.data?.token) {
        console.log('保存认证token到本地存储');
        storage.setItem('token', data.data.token);
      }
      
      return data
    } catch (error) {
      // 错误处理 - 后端请求异常
      console.error(`❌ 后端API ${method.toUpperCase()}请求异常: ${requestUrl}`)
      console.error('请求异常详情:', error.message)
      
      return {
        success: false,
        error: `网络请求失败: ${error.message}`,
        code: 0
      }
    }
  }

// 导出各种HTTP方法
api.get = (url, params = {}) => call('GET', url, params, null)
api.post = (url, data = null) => call('POST', url, {}, data)
api.put = (url, data = null) => call('PUT', url, {}, data)
api.delete = (url, params = {}) => call('DELETE', url, params, null)
api.patch = (url, data = null) => call('PATCH', url, {}, data)

// API注册函数
export const register = async (userData) => {
  try {
    // 验证必填字段
    if (!userData.name || !userData.email || !userData.password) {
      return {
        success: false,
        error: 'missing_fields',
        message: '用户名、邮箱和密码都是必填项'
      }
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return {
        success: false,
        error: 'invalid_email',
        message: '请输入有效的邮箱地址'
      }
    }

    // 验证密码长度
    if (userData.password.length < 6) {
      return {
        success: false,
        error: 'password_too_short',
        message: '密码长度至少为6位'
      }
    }
    
    // 优先通过API保存用户数据到后端
    console.log('发送注册请求到后端API:', userData)
    const result = await call('POST', '/auth/register', {}, userData)
    
    // 不保存任何用户数据到本地存储，只通过token进行认证
    // 用户数据应由后端API管理
    return result
  } catch (error) {
    console.error('注册失败:', error)
    return {
      success: false,
      error: 'registration_failed',
      message: '注册过程中发生错误，请稍后再试'
    }
  }
}

// API登录函数
export const login = async (credentials) => {
  try {
    // 验证必填字段
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'missing_fields',
        message: '邮箱和密码都是必填项'
      }
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      return {
        success: false,
        error: 'invalid_email',
        message: '请输入有效的邮箱地址'
      }
    }
    
    // 优先通过API验证用户凭据
    console.log('发送登录请求到后端API:', { email: credentials.email })
    const result = await call('POST', '/auth/login', {}, credentials)
    
    // token保存逻辑已移至call函数中，这里不再重复处理
    // 不保存任何用户数据到本地存储
    return result
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: 'login_failed',
      message: '登录过程中发生错误，请稍后再试'
    }
  }
}

// 导出API实例和storage对象
export default api
export { storage, getIsNewUser, setIsNewUser, hasCompletedOnboarding, markOnboardingComplete }
