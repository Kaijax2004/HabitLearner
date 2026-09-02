import api from './index.js'
export const builtinAiSkills = [
  {
    id: 'builtin:improve-writing',
    slug: 'improve-writing',
    name: 'Improve writing',
    description: '在不改变事实和原意的前提下，让表达更清晰、自然、简洁。',
    sourceType: 'builtin',
    status: 'active',
    manifest: { referenceCount: 0 }
  },
  {
    id: 'builtin:proofread',
    slug: 'proofread',
    name: 'Proofread',
    description: '检查错别字、语法、标点和明显表达问题，只修正必要内容。',
    sourceType: 'builtin',
    status: 'active',
    manifest: { referenceCount: 0 }
  },
  {
    id: 'builtin:explain',
    slug: 'explain',
    name: 'Explain',
    description: '把复杂内容解释得更容易理解，并根据上下文补充必要背景。',
    sourceType: 'builtin',
    status: 'active',
    manifest: { referenceCount: 0 }
  },
  {
    id: 'builtin:reformat',
    slug: 'reformat',
    name: 'Reformat',
    description: '保持信息不变，重新整理标题、段落、列表和层级结构。',
    sourceType: 'builtin',
    status: 'active',
    manifest: { referenceCount: 0 }
  },
  {
    id: 'builtin:workbench-operator',
    slug: 'workbench-operator',
    name: 'Workbench Operator',
    description: '让 Mentor-X 理解 HabitLearner 工作台，并把建议收束成可确认的下一步动作。',
    sourceType: 'builtin',
    status: 'active',
    manifest: { referenceCount: 0 }
  }
]

export const getWorkspaceToday = () => api.get('/workspace/today')
export const getWorkspaceBootstrap = (params = {}) => api.get('/workspace/bootstrap', params)
export const getDashboardSummary = (params = {}) => api.get('/dashboard/summary', params)
export const updateTodayPriorities = (payload) => api.put('/workspace/today/priorities', payload)
export const getWorkspaceState = () => api.get('/workspace/state')
export const getWorkspaceAppearance = () => api.get('/workspace/appearance')
export const updateWorkspaceAppearance = (payload) => api.put('/workspace/appearance', payload)
export const listWorkspaceEvents = (params = {}) => api.get('/workspace/events', params)
export const trackWorkbenchEvent = (payload) => api.post('/workspace/events/track', payload)
export const applyWorkspaceOp = (payload) => api.post('/workspace/ops', payload)
export const rollbackWorkspaceEvent = (id) => api.post(`/workspace/events/${id}/rollback`)
export const getWorkspaceInsights = (params = {}) => api.get('/workspace/insights', params)
export const listQuickCaptures = (params = {}) => api.get('/workspace/captures', params)
export const createQuickCapture = (payload) => api.post('/workspace/captures', payload)
export const updateQuickCapture = (id, payload) => api.put(`/workspace/captures/${id}`, payload)
export const deleteQuickCapture = (id) => api.delete(`/workspace/captures/${id}`)
export const batchUpdateQuickCaptures = (payload) => api.put('/workspace/captures/batch', payload)
export const linkQuickCapture = (id, payload) => api.post(`/workspace/captures/${id}/link`, payload)
export const getReviewEntry = (params = {}) => api.get('/workspace/reviews', params)
export const saveReviewEntry = (payload) => api.post('/workspace/reviews', payload)
export const listWorkspaceMemories = (params = {}) => api.get('/workspace/memories', params)
export const createWorkspaceMemory = (payload) => api.post('/workspace/memories', payload)
export const updateWorkspaceMemory = (id, payload) => api.put(`/workspace/memories/${id}`, payload)
export const deleteWorkspaceMemory = (id) => api.delete(`/workspace/memories/${id}`)
export const listWorkspaceDecisions = (params = {}) => api.get('/workspace/decisions', params)
export const createWorkspaceDecision = (payload) => api.post('/workspace/decisions', payload)
export const updateWorkspaceDecision = (id, payload) => api.put(`/workspace/decisions/${id}`, payload)
export const chatWithMascotAssistant = (payload) => api.post('/workspace/assistant/chat', payload)
export const runMascotAssistantAction = (payload) => api.post('/workspace/assistant/action', payload)
export const listAiConversations = (params = {}) => api.get('/workspace/assistant/conversations', params)
export const getAiConversation = (id) => api.get(`/workspace/assistant/conversations/${id}`)
export const createAiConversation = (payload) => api.post('/workspace/assistant/conversations', payload)
export const updateAiConversation = (id, payload) => api.put(`/workspace/assistant/conversations/${id}`, payload)
export const deleteAiConversation = (id) => api.delete(`/workspace/assistant/conversations/${id}`)
export const listAiProviders = () => api.get('/workspace/ai-providers')
export const listAiProviderModels = (payload) => api.post('/workspace/ai-providers/models', payload)
export const saveAiProvider = (payload) => api.post('/workspace/ai-providers', payload)
export const updateAiProvider = (id, payload) => api.put(`/workspace/ai-providers/${id}`, payload)
export const deleteAiProvider = (id) => api.delete(`/workspace/ai-providers/${id}`)
export const testAiProvider = (id) => api.post(`/workspace/ai-providers/${id}/test`)
export const listAiSkills = () => api.get('/workspace/ai-skills')
export const uploadAiSkill = (formData) => api.post('/workspace/ai-skills/upload', formData)
export const updateAiSkill = (id, payload) => api.put(`/workspace/ai-skills/${id}`, payload)
export const deleteAiSkill = (id) => api.delete(`/workspace/ai-skills/${id}`)
export const runWorkspaceAi = (payload) => api.post('/workspace/ai/run', payload)
export const listWorkspacePets = () => api.get('/workspace/pets')
export const importWorkspacePetPack = (formData) => api.post('/workspace/pets/import', formData)
export const updateWorkspacePetSetting = (payload) => api.put('/workspace/pets/settings', payload)
export const activateWorkspacePet = (id) => api.post(`/workspace/pets/${id}/activate`)
export const deleteWorkspacePet = (id) => api.delete(`/workspace/pets/${id}`)
