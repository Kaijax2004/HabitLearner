import api from './index.js'

export const listScheduleBlocks = (params = {}) => api.get('/schedule-blocks', params)
export const createScheduleBlock = (payload) => api.post('/schedule-blocks', payload)
export const updateScheduleBlock = (id, payload) => api.put(`/schedule-blocks/${id}`, payload)
