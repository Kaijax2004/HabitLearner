import { ref } from 'vue'
import { getEditorPage, getEditorPlanDocument, getPlanEditorBootstrap, listEditorPages } from '@/api/editor'

const normalizeBlock = (block, index = 0) => ({
  ...block,
  order: block.position || block.order || index + 1,
  content: block.content || { text: '' }
})

export function useEditorDocument() {
  const page = ref(null)
  const blocks = ref([])
  const properties = ref([])
  const databaseViews = ref([])
  const isLoading = ref(false)
  const error = ref('')

  const reset = () => {
    page.value = null
    blocks.value = []
    properties.value = []
    databaseViews.value = []
    error.value = ''
  }

  const loadPage = async (pageId) => {
    if (!pageId) {
      reset()
      return { success: false, error: '页面 ID 不能为空' }
    }

    isLoading.value = true
    error.value = ''
    try {
      const response = await getEditorPage(pageId)

      if (!response.success) {
        error.value = response.error || '加载页面失败'
        return response
      }

      page.value = response.data?.page || null
      blocks.value = (response.data?.blocks || []).map(normalizeBlock)
      properties.value = response.data?.properties || []
      databaseViews.value = response.data?.databaseViews || []
      return {
        success: true,
        data: {
          page: page.value,
          blocks: blocks.value,
          properties: properties.value,
          databaseViews: databaseViews.value
        }
      }
    } catch (err) {
      error.value = err?.message || '加载页面失败'
      return { success: false, error: error.value, code: 'EDITOR_PAGE_LOAD_FAILED' }
    } finally {
      isLoading.value = false
    }
  }

  const loadForPlan = async (planId, pageId = null) => {
    if (!planId) {
      reset()
      return { success: false, data: null }
    }

    const explicitPageId = Number(pageId)
    if (Number.isInteger(explicitPageId) && explicitPageId > 0) {
      const response = await loadPage(explicitPageId)
      if (response.success && response.data?.page?.source_plan_id && String(response.data.page.source_plan_id) !== String(planId)) {
        reset()
        return { success: false, error: '编辑器页面与计划不匹配', code: 'EDITOR_PLAN_MISMATCH' }
      }
      if (response.success) return { ...response, data: { ...response.data, id: explicitPageId } }
    }

    const bootstrapResponse = await getPlanEditorBootstrap(planId)
    if (bootstrapResponse.success && bootstrapResponse.data?.page) {
      page.value = bootstrapResponse.data.page
      blocks.value = (bootstrapResponse.data.blocks || []).map(normalizeBlock)
      properties.value = bootstrapResponse.data.properties || []
      databaseViews.value = bootstrapResponse.data.databaseViews || []
      return {
        success: true,
        data: {
          page: page.value,
          blocks: blocks.value,
          properties: properties.value,
          databaseViews: databaseViews.value,
          scheduleBlocks: bootstrapResponse.data.scheduleBlocks || [],
          pageTree: bootstrapResponse.data.pageTree || [],
          id: bootstrapResponse.data.editorPageId || page.value.id
        }
      }
    }

    const documentResponse = await getEditorPlanDocument(planId)
    const pagesResponse = await listEditorPages({ source_plan_id: planId })
    if (!pagesResponse.success) {
      reset()
      return {
        success: false,
        error: documentResponse.error || pagesResponse.error || '编辑器页面列表加载失败',
        code: documentResponse.code || pagesResponse.code || 'EDITOR_PAGES_LOAD_FAILED'
      }
    }

    const editorPage = pagesResponse.data?.[0] || null
    if (!editorPage) {
      reset()
      return { success: false, error: '计划对应的编辑器页面不存在', code: 'EDITOR_PAGE_NOT_FOUND' }
    }
    const response = await loadPage(editorPage.id)
    return response.success ? { ...response, data: { ...response.data, id: editorPage.id } } : response
  }

  return {
    page,
    blocks,
    properties,
    databaseViews,
    isLoading,
    error,
    reset,
    loadPage,
    loadForPlan
  }
}
