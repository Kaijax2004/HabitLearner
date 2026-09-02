import api from './index.js'

export const getFeedbackConfig = async () => api.get('/feedback/config')
