import api from './index.js'

export const listTracks = (params = {}) => api.get('/tracks', params)
export const createTrack = (payload) => api.post('/tracks', payload)
export const updateTrack = (id, payload) => api.put(`/tracks/${id}`, payload)
export const archiveTrack = (id) => api.post(`/tracks/${id}/archive`)
