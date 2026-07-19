import api, { storage } from './index.js'
import { encrypt } from '../utils/encryption.js'

/**
 * 用户注册接口
 * @param {Object} userData - 用户注册数据
 * @param {string} userData.name - 用户名
 * @param {string} userData.email - 邮箱
 * @param {string} userData.password - 密码
 * @returns {Promise<Object>} 注册结果
 */
export const register = async (userData) => {
  try {
    // 构建发送给API的数据对象，确保字段名正确
    const apiData = {
      // 如果存在username字段，将其映射到name字段（后端需要name字段）
      name: userData.name || userData.username,
      email: userData.email,
      verificationCode: userData.verificationCode,
      // 加密密码传输
      password: encrypt(userData.password)
    };
    
    console.log('转换后的注册数据（适配后端API）:', { ...apiData, password: '***' });
    
    // 调用注册接口
    const response = await api.post('/auth/register', apiData)
    
    // 只保存token，不保存任何用户数据到本地存储
    // 用户数据应由后端API管理
    if (response.success && response.data && response.data.token) {
      storage.setItem('token', response.data.token)
    }
    
    return response
  } catch (error) {
    console.error('注册失败:', error)
    throw error
  }
}

/**
 * 用户登录接口
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.email - 邮箱
 * @param {string} credentials.password - 密码
 * @returns {Promise<Object>} 登录结果
 */
export const login = async (credentials) => {
  try {
    // 加密密码
    const apiData = {
      ...credentials,
      password: encrypt(credentials.password)
    }

    // 调用登录接口
    const response = await api.post('/auth/login', apiData)
    
    // 只保存token，不保存任何用户数据到本地存储
    // 用户数据应由后端API管理
    if (response.success && response.data && response.data.token) {
      storage.setItem('token', response.data.token)
    }
    
    return response
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

/**
 * 获取个人资料接口
 * @returns {Promise<Object>} 个人资料
 */
export const getProfile = async () => {
  try {
    // 调用获取个人资料接口
    const response = await api.get('/auth/profile')
    
    // 不再保存用户信息到本地存储
    // 用户数据应由后端API管理
    return response
  } catch (error) {
    console.error('获取个人资料失败:', error)
    throw error
  }
}

/**
 * 更新个人资料接口
 * @param {Object} formData - 更新的资料数据
 * @returns {Promise<Object>} 更新结果
 */
export const updateProfile = async (formData) => {
  try {
    // 调用更新个人资料接口
    const response = await api.put('/auth/profile', formData)
    
    // 不再保存用户信息到本地存储
    // 用户数据应由后端API管理
    return response
  } catch (error) {
    console.error('更新个人资料失败:', error)
    throw error
  }
}

/**
 * 发送验证码接口
 * @param {string} email - 邮箱地址
 * @returns {Promise<Object>} 发送结果
 */
export const sendVerifyCode = async (email, type = 'other') => {
  try {
    const response = await api.post('/auth/send-code', { email, type })
    return response
  } catch (error) {
    console.error('Verification code request failed:', error)
    throw error
  }
}

/**
 * Verify email code API
 * @param {string} email - value
 * @param {string} code - code
 * @returns {Promise<Object>} value
 */
export const verifyCode = async (email, code, type = undefined) => {
  try {
    const payload = { email, code }
    if (type) {
      payload.type = type
    }
    const response = await api.post('/auth/verify-code', payload)
    return response
  } catch (error) {
    console.error('Verification code request failed:', error)
    throw error
  }
}

/**
 * ?修改密码接口
 * @param {Object} passwordData - 密码修改数据
 * @param {string} passwordData.newPassword - 新密码
 * @param {string} passwordData.confirmPassword - 确认新密码
 * @returns {Promise<Object>} 修改结果
 */
export const changePassword = async (passwordData) => {
  try {
    const apiData = {
      ...passwordData,
      newPassword: encrypt(passwordData.newPassword),
      confirmPassword: encrypt(passwordData.confirmPassword)
    }

    const response = await api.put('/auth/change-password', apiData)
    return response
  } catch (error) {
    console.error('Change password failed:', error)
    throw error
  }
}

/**
 * ?重置密码接口
 * @param {Object} resetData - 重置密码数据
 * @param {string} resetData.email - 邮箱
 * @param {string} resetData.code - 验证码
 * @param {string} resetData.newPassword - 新密码
 * @param {string} resetData.confirmPassword - 确认新密码
 * @returns {Promise<Object>} 重置结果
 */
export const resetPassword = async (resetData) => {
  try {
    // 加密新密码
    const apiData = {
      ...resetData,
      newPassword: encrypt(resetData.newPassword),
      confirmPassword: encrypt(resetData.confirmPassword)
    }

    // 调用重置密码接口
    const response = await api.post('/auth/reset-password', apiData)
    return response
  } catch (error) {
    console.error('重置密码失败:', error)
    throw error
  }
}

/**
 * 用户登出接口
 * @returns {Promise<Object>} 登出结果
 */
export const logout = async () => {
  try {
    // 调用登出接口
    const response = await api.post('/auth/logout')
    
    // 清除本地存储的token和用户信息
    storage.removeItem('token')
    storage.removeItem('user')
    
    return response
  } catch (error) {
    console.error('登出失败:', error)
    // 即使接口调用失败，也要清除本地存储
    storage.removeItem('token')
    storage.removeItem('user')
    throw error
  }
}
