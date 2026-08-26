import api, { storage } from './index.js'
import { encrypt } from '../utils/encryption.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const persistTokenFromResponse = (response) => {
  if (response?.success && response?.data?.token) {
    storage.setItem('token', response.data.token)
  }
}

export const register = async (userData) => {
  const payload = {
    name: userData.name || userData.username,
    nickname: userData.nickname,
    email: userData.email,
    verificationCode: userData.verificationCode,
    password: encrypt(userData.password),
    acceptedPrivacyPolicy: Boolean(userData.acceptedPrivacyPolicy)
  }

  const response = await api.post('/auth/register', payload)
  persistTokenFromResponse(response)
  return response
}

export const login = async (credentials) => {
  const loginId = credentials.loginId || credentials.email || ''
  const payload = {
    loginId,
    email: loginId,
    password: encrypt(credentials.password)
  }

  const response = await api.post('/auth/login', payload)
  persistTokenFromResponse(response)
  return response
}

export const loginWithCode = async ({ email, code }) => {
  const response = await api.post('/auth/login/code', { email, code })
  persistTokenFromResponse(response)
  return response
}

export const getProfile = async () => api.get('/auth/profile')

export const updateProfile = async (formData) => api.put('/auth/profile', formData)

export const sendVerifyCode = async (email, type = 'other') => api.post('/auth/send-code', { email, type })

export const verifyCode = async (email, code, type = undefined) => {
  const payload = { email, code }
  if (type) payload.type = type
  return api.post('/auth/verify-code', payload)
}

export const checkUsername = async (username) => api.get(`/auth/username/check?${new URLSearchParams({ username }).toString()}`)

export const sendEmailBindCode = async (email) => api.post('/auth/email/bind/send-code', { email })

export const bindEmail = async ({ email, code }) => api.put('/auth/email', { email, code })

export const sendEmailUnbindCode = async () => api.post('/auth/email/unbind/send-code')

export const unbindEmail = async ({ code }) => api.delete('/auth/email', { code })

export const changePassword = async (passwordData) => {
  const payload = {
    ...passwordData,
    newPassword: encrypt(passwordData.newPassword),
    confirmPassword: encrypt(passwordData.confirmPassword)
  }

  return api.put('/auth/change-password', payload)
}

export const resetPassword = async (resetData) => {
  const payload = {
    ...resetData,
    newPassword: encrypt(resetData.newPassword),
    confirmPassword: encrypt(resetData.confirmPassword)
  }

  return api.post('/auth/reset-password', payload)
}

export const logout = async () => {
  const response = await api.post('/auth/logout')
  storage.removeItem('token')
  storage.removeItem('user')
  return response
}

export const getSocialLoginUrl = (provider, redirect = '/dashboard') => {
  const typeMap = {
    qq: 'qq',
    wechat: 'wx',
    wx: 'wx',
    google: 'google',
    github: 'github'
  }
  const type = typeMap[provider]
  if (!type) return ''

  const base = String(API_BASE_URL).replace(/\/+$/, '')
  const params = new URLSearchParams({ redirect })
  return `${base}/auth/social/${type}/start?${params.toString()}`
}

export const getSocialBindUrl = async (provider, redirect = '/profile') => {
  const typeMap = {
    qq: 'qq',
    wechat: 'wx',
    wx: 'wx',
    google: 'google',
    github: 'github'
  }
  const type = typeMap[provider]
  if (!type) return ''

  const response = await api.post(`/auth/social/${type}/link`, { redirect })
  return response?.success ? response.data?.url || '' : ''
}

export const getSocialUnlinkUrl = async (provider, redirect = '/profile') => {
  const typeMap = {
    qq: 'qq',
    wechat: 'wx',
    wx: 'wx',
    google: 'google',
    github: 'github'
  }
  const type = typeMap[provider]
  if (!type) return ''

  const response = await api.post(`/auth/social/${type}/unlink`, { redirect })
  return response?.success ? response.data?.url || '' : ''
}

export const completeSocialProfile = async (payload) => {
  const response = await api.post('/auth/social/complete', payload)
  persistTokenFromResponse(response)
  return response
}

export const requestAccountDeletion = async (payload = {}) => api.post('/auth/account/deletion/request', {
  ...payload,
  ...(payload.password ? { password: encrypt(payload.password) } : {})
})

export const cancelAccountDeletion = async () => api.post('/auth/account/deletion/cancel')

