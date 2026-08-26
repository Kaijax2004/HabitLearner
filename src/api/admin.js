import api from './index.js'

export const getAdminUsersOverview = async () => api.get('/admin/users/overview')

export const getAdminUsersAnalytics = async (params = {}) => api.get('/admin/users/analytics', { params })

export const getAdminUsers = async (params = {}) => api.get('/admin/users', { params })

export const getAdminUserDetail = async (id) => api.get(`/admin/users/${id}`)
