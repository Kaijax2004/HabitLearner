import api from './index.js'

export const normalizePlanStatus = (status) => status === 'done' ? 'completed' : (status || 'not_started')
const VALID_PLAN_TYPES = new Set(['project', 'task', 'goal', 'custom'])

const normalizePlanPayload = (payload = {}) => {
  const nextPayload = { ...payload }
  if (nextPayload.status) nextPayload.status = normalizePlanStatus(nextPayload.status)
  if (nextPayload.type === 'note') nextPayload.type = 'goal'

  const rawType = String(nextPayload.type || 'project').trim()
  if (VALID_PLAN_TYPES.has(rawType)) {
    nextPayload.type = rawType
  } else {
    nextPayload.type = 'custom'
    nextPayload.custom_type_name = String(nextPayload.custom_type_name || rawType).slice(0, 50)
  }

  if (nextPayload.type !== 'custom') {
    nextPayload.custom_type_name = null
  }

  return nextPayload
}

export const listPlans = () => api.get('/plans')
export const getPlanById = (id) => api.get(`/plans/${id}`)
export const createPlan = (payload) => {
  if (!payload?.title?.trim()) {
    return Promise.resolve({ success: false, error: '计划标题不能为空' })
  }
  return api.post('/plans', normalizePlanPayload({
    title: payload.title.trim(),
    status: normalizePlanStatus(payload.status),
    priority: payload.priority || 'medium',
    type: payload.type || 'project',
    custom_type_name: payload.custom_type_name || null,
    due_date: payload.due_date || null
  }))
}
export const updatePlan = (id, payload) => {
  return api.put(`/plans/${id}`, normalizePlanPayload(payload))
}
export const deletePlan = (id) => api.delete(`/plans/${id}`)
export const archivePlan = (id, category = 'default') => api.post(`/plans/${id}/archive`, { category })
export const listBlocks = (planId) => api.get(`/plans/${planId}/blocks`)
export const createBlock = (payload) => api.post('/plan-blocks', payload)
export const updateBlock = (id, payload) => api.patch(`/plan-blocks/${id}`, payload)
export const deleteBlock = (id) => api.delete(`/plan-blocks/${id}`)
export const reorderBlocks = (planId, orders) => api.post(`/plans/${planId}/blocks/reorder`, { orders })
export const polishPlanBlockAI = (payload) => api.post('/plans/ai/polish', payload)
export const generatePlanQuestionsAI = (payload) => api.post('/plans/ai/questions', payload)
export const generatePlanOutlineAI = (payload) => api.post('/plans/ai/outline', payload)
export const generatePlanImageAI = (payload) => api.post('/plans/ai/image', payload)
export const getPlanImageStatusAI = (payload) => api.post('/plans/ai/image/status', payload)
export const listPlanImageHistoryAI = (params = {}) => api.get('/plans/ai/image/history', params)
export const deletePlanImageHistoryAI = (taskId) => api.delete(`/plans/ai/image/history/${encodeURIComponent(taskId)}`)
export const createPlanVideoAI = (payload) => api.post('/plans/ai/video', payload)
export const getPlanVideoStatusAI = (payload) => api.post('/plans/ai/video/status', payload)
export const listPlanVideoHistoryAI = (params = {}) => api.get('/plans/ai/video/history', params)
export const deletePlanVideoHistoryAI = (taskId) => api.delete(`/plans/ai/video/history/${encodeURIComponent(taskId)}`)
