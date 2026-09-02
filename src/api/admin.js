import api from './index.js'

export const getAdminUsersOverview = async () => api.get('/admin/users/overview')

export const getAdminUsersAnalytics = async (params = {}) => api.get('/admin/users/analytics', { params })

export const getAdminUsers = async (params = {}) => api.get('/admin/users', { params })

export const getAdminUserDetail = async (id) => api.get(`/admin/users/${id}`)

export const getAdminFeedbackConfig = async () => api.get('/admin/feedback/config')

export const updateAdminFeedbackConfig = async (payload) => api.put('/admin/feedback/config', payload)

export const uploadAdminFeedbackImage = async (key, file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('key', key)
  return api.post(`/admin/feedback/config/images/${key}`, formData)
}
