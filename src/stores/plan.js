import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/plans'

export const usePlanStore = defineStore('plan', () => {
  const plans = ref([])
  const blocksByPlan = ref({})

  const getBlocks = (planId) => blocksByPlan.value[planId] || []

  const loadPlans = async () => {
    const res = await api.listPlans()
    if (res.success) plans.value = res.data
  }

  const loadBlocks = async (planId) => {
    const res = await api.listBlocks(planId)
    if (res.success) blocksByPlan.value[planId] = res.data.sort((a,b) => (a.order||0)-(b.order||0))
  }

  const addPlan = async (title) => {
    try {
      // 验证标题
      if (!title || typeof title !== 'string' || title.trim() === '') {
        console.error('计划标题不能为空')
        return { success: false, error: '计划标题不能为空' }
      }
      
      const res = await api.createPlan({ title: title.trim() })
      console.log('创建计划响应:', res)
      
      if (res && res.success) {
        // 确保计划对象完整
        const apiPlanData = res.data || res || {}
        const newPlan = {
          id: apiPlanData.id || Date.now(),
          title: apiPlanData.title || title.trim(),
          status: apiPlanData.status || 'not_started',
          due_date: apiPlanData.due_date || null,
          user_id: apiPlanData.user_id || 1,
          createdAt: apiPlanData.createdAt || new Date().toISOString(),
          updatedAt: apiPlanData.updatedAt || new Date().toISOString()
        }
        
        plans.value.push(newPlan)
        console.log('计划创建成功并添加到本地状态:', newPlan)
        return { success: true, data: newPlan, message: res.message || '创建计划成功' }
      } else {
        const errorMessage = res?.error || '创建计划失败'
        console.error('创建计划失败:', errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('创建计划时发生异常:', error)
      return { success: false, error: error?.error || error?.message || '创建计划时发生未知错误' }
    }
  }

  const updatePlan = async (id, payload) => {
    const res = await api.updatePlan(id, payload)
    if (res.success) {
      const idx = plans.value.findIndex(p => p.id === id)
      if (idx !== -1) plans.value[idx] = { ...plans.value[idx], ...payload }
    }
    return res
  }

  const deletePlan = async (id) => {
    const res = await api.deletePlan(id)
    if (res.success) {
      plans.value = plans.value.filter(p => p.id !== id)
      // 删除相关的块数据
      delete blocksByPlan.value[id]
    }
    return res
  }

  const archivePlan = async (id, category = 'default') => {
    const res = await api.archivePlan(id, category)
    if (res.success) {
      const idx = plans.value.findIndex(p => p.id === id)
      if (idx !== -1) {
        plans.value[idx] = { 
          ...plans.value[idx], 
          status: 'archived', 
          archived_at: new Date().toISOString(), 
          archive_category: category 
        }
      }
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
      blocksByPlan.value[planId] = getBlocks(planId).map(b => b.id===id? { ...b, ...payload }: b)
    }
    return res
  }

  const reorder = async (planId, idsInOrder) => {
    const orders = {}
    idsInOrder.forEach((id, idx) => orders[id] = idx + 1)
    const res = await api.reorderBlocks(planId, orders)
    if (res.success) blocksByPlan.value[planId] = getBlocks(planId).sort((a,b)=>orders[a.id]-orders[b.id])
    return res
  }

  return { plans, getBlocks, loadPlans, loadBlocks, addPlan, updatePlan, deletePlan, archivePlan, addBlock, updateBlock, reorder }
})


