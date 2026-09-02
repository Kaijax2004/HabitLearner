import api from './index.js'

export const getCreatorSummary = () => api.get('/creator/summary')
export const createCreatorItem = (payload) => api.post('/creator/items', payload)
export const updateCreatorItem = (id, payload) => api.put(`/creator/items/${id}`, payload)
export const archiveCreatorItem = (id) => api.post(`/creator/items/${id}/archive`)
export const getHotspotRadarSummary = (params = {}) => api.get('/hotspots/summary', params)
export const refreshHotspotRadarSummary = () => api.post('/hotspots/refresh')
export const getHotspotSubscriptions = () => api.get('/hotspots/subscriptions')
export const updateHotspotSubscriptions = (payload) => api.put('/hotspots/subscriptions', payload)

export const getHotspotSources = (params = {}) => api.get('/hotspots/sources', params)
