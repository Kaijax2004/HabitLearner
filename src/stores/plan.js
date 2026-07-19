import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/plans'

const normalizePlan = (plan = {}) => ({
  ...plan,
  status: plan.status === 'done' ? 'completed' : (plan.status || 'not_started'),
  priority: plan.priority || 'medium',
  type: plan.type === 'note' ? 'goal' : (plan.type || 'project'),
  custom_type_name: String(plan.custom_type_name || plan.customTypeName || '').trim()
})

export const usePlanStore = defineStore('plan', () => {
  const plans = ref([])
  const blocksByPlan = ref({})
  const isLoading = ref(false)
  const error = ref('')

  const getBlocks = (planId) => blocksByPlan.value[planId] || []

  const loadPlans = async () => {
    isLoading.value = true
    error.value = ''
    const res = await api.listPlans()
    isLoading.value = false

    if (res.success) {
      plans.value = (res.data || []).map(normalizePlan)
      return { success: true, data: plans.value }
    }

    error.value = res.error || '加载计划失败'
    return res
  }

  const loadBlocks = async (planId) => {
    const res = await api.listBlocks(planId)
    if (res.success) {
      blocksByPlan.value[planId] = (res.data || []).sort((a, b) => (a.order || 0) - (b.order || 0))
    }
    return res
  }

  const addPlan = async (payload = {}) => {
    const planPayload = typeof payload === 'string' ? { title: payload } : payload
    const res = await api.createPlan(planPayload)
    if (res.success) {
      const newPlan = normalizePlan(res.data)
      plans.value = [newPlan, ...plans.value.filter((plan) => plan.id !== newPlan.id)]
      return { success: true, data: newPlan }
    }
    return res
  }

  const updatePlan = async (id, payload) => {
    const res = await api.updatePlan(id, payload)
    if (res.success) {
      const updated = normalizePlan(res.data || { id, ...payload })
      plans.value = plans.value.map((plan) => plan.id === id ? { ...plan, ...updated } : plan)
    }
    return res
  }

  const deletePlan = async (id) => {
    const res = await api.deletePlan(id)
    if (res.success) {
      plans.value = plans.value.filter((plan) => plan.id !== id)
      delete blocksByPlan.value[id]
    }
    return res
  }

  const deleteBlock = async (id, planId = null) => {
    const res = await api.deleteBlock(id)
    if (res.success && planId) {
      blocksByPlan.value[planId] = getBlocks(planId).filter((block) => block.id !== id)
    }
    return res
  }

  const archivePlan = async (id, category = 'default') => {
    const res = await api.archivePlan(id, category)
    if (res.success) {
      const archived = normalizePlan(res.data || { id, status: 'archived', archived_at: new Date().toISOString(), archive_category: category })
      plans.value = plans.value.map((plan) => plan.id === id ? { ...plan, ...archived } : plan)
    }
    return res
  }

  const addBlock = async (planId, type, content = {}) => {
    const order = (getBlocks(planId).slice(-1)[0]?.order || 0) + 1
    const res = await api.createBlock({ plan_id: planId, type, content, order })
    if (res.success) {
      blocksByPlan.value[planId] = [...getBlocks(planId), res.data]
    }
    return res
  }

  const updateBlock = async (id, payload, planId) => {
    const res = await api.updateBlock(id, payload)
    if (res.success && planId) {
      blocksByPlan.value[planId] = getBlocks(planId).map((block) => block.id === id ? { ...block, ...(res.data || payload) } : block)
    }
    return res
  }

  const reorder = async (planId, idsInOrder) => {
    const orders = {}
    idsInOrder.forEach((id, index) => { orders[id] = index + 1 })
    const res = await api.reorderBlocks(planId, orders)
    if (res.success) {
      blocksByPlan.value[planId] = getBlocks(planId).map((block) => ({ ...block, order: orders[block.id] || block.order })).sort((a, b) => a.order - b.order)
    }
    return res
  }

  return {
    plans,
    blocksByPlan,
    isLoading,
    error,
    getBlocks,
    loadPlans,
    loadBlocks,
    addPlan,
    updatePlan,
    deletePlan,
    deleteBlock,
    archivePlan,
    addBlock,
    updateBlock,
    reorder
  }
})
