<template>
  <AppLayout title="工作台页面" :show-back-button="true" :on-back="goBack">
    <div class="workspace-page-shell">
      <div v-if="loading" class="workspace-page-empty">正在加载页面...</div>
      <template v-else-if="page">
        <header class="workspace-page-header">
          <div class="workspace-page-icon">{{ page.icon || 'P' }}</div>
          <input v-model="pageTitle" class="workspace-page-title" placeholder="无标题" @blur="savePage" @keydown.enter.prevent="savePage" />
          <span class="workspace-page-save">{{ saveState }}</span>
        </header>

        <section class="workspace-page-properties">
          <label v-for="property in properties" :key="property.id || property.key" class="workspace-page-property">
            <span>{{ property.key }}</span>
            <input :value="property.value" @change="updateProperty(property, $event.target.value)" />
          </label>
          <button type="button" class="workspace-page-add-property" @click="addProperty">+ 添加属性</button>
        </section>

        <main class="workspace-page-document">
          <div v-for="(block, index) in blocks" :key="block.id" class="workspace-page-block">
            <RichTextBlock
              v-if="block.type === 'text' || block.type === 'heading'"
              :model-value="block.content"
              :block-id="block.id"
              @update:model-value="updateBlock(block, $event)"
              @create-new-block="createBlock(index + 1)"
              @delete-block="deleteBlock(block)"
            />
            <div v-else class="workspace-page-unsupported">
              {{ block.type }} 块
            </div>
          </div>
          <button type="button" class="workspace-page-add-block" @click="createBlock(blocks.length)">+ 添加一行</button>
        </main>
      </template>
      <div v-else class="workspace-page-empty">页面不存在或已归档。</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import RichTextBlock from '@/views/plan/blocks/RichTextBlock.vue'
import {
  createEditorBlock,
  deleteEditorBlock,
  getEditorPage,
  updateEditorBlock,
  updateEditorPage,
  updateEditorProperties
} from '@/api/editor'

const route = useRoute()
const router = useRouter()
const page = ref(null)
const blocks = ref([])
const properties = ref([])
const pageTitle = ref('')
const loading = ref(true)
const saveState = ref('已保存')

const loadPage = async () => {
  loading.value = true
  const response = await getEditorPage(route.params.id)
  if (response.success) {
    page.value = response.data?.page || null
    blocks.value = response.data?.blocks || []
    properties.value = response.data?.properties || []
    pageTitle.value = page.value?.title || ''
  }
  loading.value = false
}

const savePage = async () => {
  if (!page.value) return
  saveState.value = '保存中'
  const response = await updateEditorPage(page.value.id, { title: pageTitle.value })
  saveState.value = response.success ? '已保存' : '保存失败'
  if (response.success) page.value = response.data
}

const updateBlock = async (block, content) => {
  block.content = content
  saveState.value = '保存中'
  const response = await updateEditorBlock(block.id, { content })
  saveState.value = response.success ? '已保存' : '保存失败'
}

const createBlock = async (position) => {
  if (!page.value) return
  const response = await createEditorBlock(page.value.id, { type: 'text', content: { text: '' }, position: position + 1 })
  if (response.success && response.data) blocks.value.splice(position, 0, response.data)
}

const deleteBlock = async (block) => {
  const response = await deleteEditorBlock(block.id)
  if (response.success) blocks.value = blocks.value.filter((item) => item.id !== block.id)
}

const addProperty = async () => {
  if (!page.value) return
  const next = [...properties.value, { key: `属性 ${properties.value.length + 1}`, type: 'text', value: '' }]
  const response = await updateEditorProperties(page.value.id, next)
  if (response.success) properties.value = response.data || next
}

const updateProperty = async (property, value) => {
  property.value = value
  if (!page.value) return
  await updateEditorProperties(page.value.id, properties.value)
}

const goBack = () => router.push('/plan')

onMounted(loadPage)
</script>

<style scoped>
.workspace-page-shell {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: 2rem clamp(1rem, 4vw, 4rem) 6rem;
}

.workspace-page-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border-bottom: 1px solid var(--workbench-border);
  padding-bottom: 1.2rem;
}

.workspace-page-icon {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border: 1px solid var(--workbench-border);
  border-radius: 0.7rem;
  color: var(--workbench-text-muted);
}

.workspace-page-title {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  color: var(--workbench-text);
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 750;
  letter-spacing: -0.06em;
  outline: none;
}

.workspace-page-save {
  color: var(--workbench-text-muted);
  font-size: 0.72rem;
}

.workspace-page-properties {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 1rem 0;
}

.workspace-page-property,
.workspace-page-add-property {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--workbench-border);
  border-radius: 0.75rem;
  background: var(--workbench-surface-muted);
  padding: 0.4rem 0.65rem;
  color: var(--workbench-text-muted);
  font-size: 0.72rem;
}

.workspace-page-property input {
  width: 7rem;
  border: 0;
  background: transparent;
  color: var(--workbench-text);
  outline: none;
}

.workspace-page-add-property {
  cursor: pointer;
}

.workspace-page-document {
  width: min(100%, 52rem);
  margin: 1.5rem auto 0;
}

.workspace-page-block {
  min-height: 2.5rem;
}

.workspace-page-unsupported {
  border: 1px dashed var(--workbench-border);
  color: var(--workbench-text-muted);
  padding: 0.8rem 0;
  font-size: 0.8rem;
}

.workspace-page-add-block {
  width: 100%;
  border: 1px dashed var(--workbench-border);
  border-radius: 0.8rem;
  background: transparent;
  color: var(--workbench-text-muted);
  padding: 0.8rem;
  text-align: left;
}

.workspace-page-empty {
  padding: 5rem 1rem;
  color: var(--workbench-text-muted);
  text-align: center;
}
</style>
