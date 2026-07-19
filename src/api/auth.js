import api, { storage } from './index.js'
import { encrypt } from '../utils/encryption.js'

const persistTokenFromResponse = (response) => {
  if (response?.success && response?.data?.token) {
    storage.setItem('token', response.data.token)
  }
}

export const register = async (userData) => {
  const payload = {
    name: userData.name || userData.username,
    email: userData.email,
    verificationCode: userData.verificationCode,
    password: encrypt(userData.password)
  }

  const response = await api.post('/auth/register', payload)
  persistTokenFromResponse(response)
  return response
}

export const login = async (credentials) => {
  const payload = {
    email: credentials.email,
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
