import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authAPI from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 动作
  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        user.value = response.data.user // 仅在内存中维护用户数据
        token.value = response.data.token
        localStorage.setItem('token', response.data.token) // 只保存token到本地存储
        
        return { success: true, user: response.data.user }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    try {
      const response = await authAPI.register(userData)
      
      if (response.success) {
        user.value = response.data.user // 仅在内存中维护用户数据
        token.value = response.data.token
        localStorage.setItem('token', response.data.token) // 只保存token到本地存储
        
        return { success: true, user: response.data.user }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token') // 只移除token，不涉及用户数据
    }
  }

  const checkAuth = () => {
    // 只从localStorage获取token，不获取用户数据
    const storedToken = localStorage.getItem('token')
    
    if (storedToken) {
      token.value = storedToken
      // 注意：这里不再从localStorage获取用户数据
      // 在实际应用中，应该使用token向后端请求当前用户信息
    }
  }

  // 测试模式登录 - 修改为不再从localStorage获取用户数据
  const testLogin = () => {
    const storedToken = localStorage.getItem('token')
    
    if (storedToken) {
      token.value = storedToken
      // 在测试模式下，如果有token但没有用户数据，应该向后端获取用户信息
      console.log('🧪 测试模式：检测到token，需要通过API获取用户信息')
      return !!token.value
    }
    return false
  }

  const updateProfile = async (profileData) => {
    isLoading.value = true
    try {
      const response = await authAPI.updateProfile(profileData)
      
      if (response.success) {
        user.value = response.data // 仅在内存中更新用户数据
        
        return { success: true, user: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = (userData) => {
    user.value = userData // 仅在内存中更新用户数据
    // 不再保存到localStorage
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    // 计算属性
    isAuthenticated,
    // 动作
    login,
    register,
    logout,
    checkAuth,
    testLogin,
    updateProfile,
    updateUser
  }
})
