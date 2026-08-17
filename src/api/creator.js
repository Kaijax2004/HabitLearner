import api from './index.js'

export const getCreatorSummary = () => api.get('/creator/summary')
export const createCreatorItem = (payload) => api.post('/creator/items', payload)
export const updateCreatorItem = (id, payload) => api.put(`/creator/items/${id}`, payload)
export const archiveCreatorItem = (id) => api.post(`/creator/items/${id}/archive`)
