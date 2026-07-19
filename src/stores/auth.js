import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authAPI from '@/api/auth.js'

const readStoredToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('token')
}

const writeStoredToken = (token) => {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem('token', token)
  } else {
    window.localStorage.removeItem('token')
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(readStoredToken())
  const isLoading = ref(false)
  const bootstrapComplete = ref(false)
  let bootstrapPromise = null

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuthState = ({ nextUser = null, nextToken = null, persistToken = false } = {}) => {
    user.value = nextUser
    token.value = nextToken

    if (persistToken) {
      writeStoredToken(nextToken)
    }
  }

  const clearAuthState = () => {
    user.value = null
    token.value = null
    writeStoredToken(null)
  }

  const hydrateProfile = async () => {
    const storedToken = readStoredToken()

    if (!storedToken) {
      clearAuthState()
      bootstrapComplete.value = true
      return false
    }

    token.value = storedToken

    try {
      const response = await authAPI.getProfile()
      if (response.success && response.data) {
        user.value = response.data
        bootstrapComplete.value = true
        return true
      }
    } catch (error) {
      console.warn('Auth bootstrap failed:', error)
    }

    clearAuthState()
    bootstrapComplete.value = true
    return false
  }

  const bootstrapAuth = async () => {
    if (bootstrapComplete.value) {
      return isAuthenticated.value
    }

    if (bootstrapPromise) {
      return bootstrapPromise
    }

    bootstrapPromise = hydrateProfile().finally(() => {
      bootstrapPromise = null
    })

    return bootstrapPromise
  }

  const checkAuth = () => bootstrapAuth()

  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await authAPI.login(credentials)

      if (response.success) {
        setAuthState({
          nextUser: response.data.user,
          nextToken: response.data.token,
          persistToken: true
        })
        bootstrapComplete.value = true
        return { success: true, user: response.data.user }
      }

      return { success: false, error: response.error, code: response.code }
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
        setAuthState({
          nextUser: response.data.user,
          nextToken: response.data.token,
          persistToken: true
        })
        bootstrapComplete.value = true
        return { success: true, user: response.data.user }
      }

      return { success: false, error: response.error, code: response.code }
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
      clearAuthState()
      bootstrapComplete.value = true
    }
  }

  const testLogin = () => bootstrapAuth()

  const updateProfile = async (profileData) => {
    isLoading.value = true
    try {
      const response = await authAPI.updateProfile(profileData)

      if (response.success) {
        user.value = response.data
        return { success: true, user: response.data }
      }

      return { success: false, error: response.error, code: response.code }
    } catch (error) {
      return { success: false, error: error.error || error.message }
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = (userData) => {
    user.value = userData
  }

  return {
    user,
    token,
    isLoading,
    bootstrapComplete,
    isAuthenticated,
    bootstrapAuth,
    login,
    register,
    logout,
    checkAuth,
    testLogin,
    updateProfile,
    updateUser
  }
})
