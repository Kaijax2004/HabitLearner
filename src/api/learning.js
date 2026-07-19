import api from './index.js'

export const getCourseCategories = () => api.get('/learning/categories')

export const getCourses = (params = {}) => api.get('/learning/courses', { params })

export const getDailyLearningCard = () => api.get('/learning/daily-card')

export const refreshDailyLearningCard = () => api.post('/learning/daily-card/refresh')

export const getCourseById = (id) => api.get(`/learning/courses/${id}`)

export const getVideoRecommendations = (params = {}) => api.get('/learning/recommendations', { params })

export const prefetchVideoRecommendations = (data = {}) => api.post('/learning/recommendations/prefetch', data)

export const getCourseNote = (id) => api.get(`/learning/courses/${id}/note`)

export const saveCourseNote = (id, content) => api.put(`/learning/courses/${id}/note`, { content })

export const completeCourse = (id) => api.post(`/learning/courses/${id}/complete`)

export const rateCourse = (id, rating) => api.post(`/learning/courses/${id}/rating`, { rating })
