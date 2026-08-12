<template>
  <transition name="block-selector">
    <div v-if="show" class="block-selector-backdrop" @click="close">
      <section class="block-selector-panel" @click.stop>
        <header class="block-selector-header">
          <div>
            <p class="block-selector-kicker">Block Structure</p>
            <h3>切换块类型</h3>
          </div>
          <button type="button" class="block-selector-close" @click="close">关闭</button>
        </header>

        <label class="block-selector-search">
          <span>搜索类型</span>
          <input ref="searchInputRef" v-model.trim="searchQuery" type="text" placeholder="正文、标题、待办、多列、表格..." />
        </label>

        <div v-if="filteredBlockTypes.length" class="block-selector-grid">
          <button
            v-for="blockType in filteredBlockTypes"
            :key="blockType.type"
            type="button"
            class="block-selector-item"
            @click="selectBlock(blockType.type)"
          >
            <span class="block-selector-icon">{{ blockType.icon }}</span>
            <span class="min-w-0 flex-1 text-left">
              <span class="block-selector-name">{{ blockType.name }}</span>
              <span class="block-selector-desc">{{ blockType.description }}</span>
            </span>
          </button>
        </div>

        <div v-else class="block-selector-empty">
          没有匹配的块类型
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const searchInputRef = ref(null)

const blockTypes = [
  { type: 'text', icon: 'TXT', name: '正文', description: '普通文本段落，适合记录想法和说明。', keywords: ['text', 'paragraph'] },
  { type: 'heading', icon: 'H1', name: '标题', description: '章节标题，适合组织计划结构。', keywords: ['heading', 'title'] },
  { type: 'todo', icon: 'TODO', name: '待办', description: '可勾选任务，适合拆解行动。', keywords: ['task', 'checkbox'] },
  { type: 'list', icon: 'LIST', name: '列表', description: '有序或无序列表，适合连续要点。', keywords: ['list', 'bullet'] },
  { type: 'columns', icon: 'COL', name: '多列', description: '左右并排的信息结构，适合对比和拆分。', keywords: ['columns', 'layout'] },
  { type: 'table', icon: 'TBL', name: '表格', description: '结构化数据记录，适合清单和对照。', keywords: ['table', 'grid'] },
  { type: 'toggle', icon: 'TOG', name: '折叠', description: '可展开内容块，适合隐藏细节。', keywords: ['toggle', 'collapse'] },
  { type: 'quote', icon: 'QTE', name: '引用', description: '突出一段观点、原则或摘录。', keywords: ['quote'] },
  { type: 'callout', icon: 'NOTE', name: '标注', description: '重点提醒块，适合风险、提示和结论。', keywords: ['callout', 'note'] },
  { type: 'code', icon: 'CODE', name: '代码', description: '代码片段或命令记录。', keywords: ['code', 'snippet'] },
  { type: 'page', icon: 'PAGE', name: '子页面', description: '将内容拆到一个独立子页面。', keywords: ['page', 'subpage'] },
  { type: 'link_page', icon: 'LINK', name: '页面链接', description: '链接到其他计划或页面。', keywords: ['link'] },
  { type: 'image', icon: 'IMG', name: '图片', description: '图片素材或生成图结果。', keywords: ['image', 'media'] },
  { type: 'video', icon: 'VID', name: '视频', description: '视频素材或生成视频结果。', keywords: ['video', 'media'] },
  { type: 'audio', icon: 'AUD', name: '音频', description: '音频素材或声音记录。', keywords: ['audio', 'media'] },
  { type: 'bookmark', icon: 'WEB', name: '网页书签', description: '保存网页标题、链接和摘要。', keywords: ['bookmark', 'web'] },
  { type: 'database', icon: 'DB', name: '数据库视图', description: '表格、看板等长期结构化视图。', keywords: ['database', 'kanban'] },
  { type: 'divider', icon: '---', name: '分割线', description: '分隔章节或阶段。', keywords: ['divider'] },
  { type: 'button', icon: 'BTN', name: '按钮', description: '保存一个快捷操作入口。', keywords: ['button'] },
  { type: 'equation', icon: 'EQ', name: '公式', description: '数学公式或 LaTeX 内容。', keywords: ['equation', 'formula', 'latex'] }
]

const filteredBlockTypes = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return blockTypes

  return blockTypes.filter((block) => {
    const haystack = [block.type, block.name, block.description, ...(block.keywords || [])].join(' ').toLowerCase()
    return haystack.includes(query)
  })
})

const close = () => {
  emit('close')
  searchQuery.value = ''
}

const selectBlock = (type) => {
  emit('select', type)
  close()
}

const handleKeydown = (event) => {
  if (!props.show) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

watch(() => props.show, async (show) => {
  if (!show) return
  await nextTick()
  searchInputRef.value?.focus?.()
})

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.block-selector-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 9, 11, 0.34);
  padding: 1.25rem;
  backdrop-filter: blur(16px);
}

.block-selector-panel {
  width: min(48rem, 100%);
  max-height: min(76vh, 46rem);
  overflow: hidden;
  border: 1px solid rgba(212, 212, 216, 0.86);
  border-radius: 1.65rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 34px 90px rgba(24, 24, 27, 0.18);
  display: flex;
  flex-direction: column;
}

.block-selector-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 1.35rem 1rem;
}

.block-selector-kicker {
  color: rgb(113, 113, 122);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.block-selector-header h3 {
  margin-top: 0.35rem;
  color: rgb(9, 9, 11);
  font-size: 1.3rem;
  font-weight: 760;
  letter-spacing: -0.04em;
}

.block-selector-close {
  min-height: 2.25rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.82);
  padding: 0 0.9rem;
  color: rgb(82, 82, 91);
  font-size: 0.78rem;
  font-weight: 700;
}

.block-selector-search {
  display: grid;
  gap: 0.45rem;
  padding: 0 1.35rem 1rem;
  color: rgb(113, 113, 122);
  font-size: 0.75rem;
  font-weight: 700;
}

.block-selector-search input {
  min-height: 2.85rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(250, 250, 250, 0.94);
  padding: 0 1rem;
  color: rgb(24, 24, 27);
  outline: none;
}

.block-selector-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  overflow-y: auto;
  padding: 0 1.35rem 1.35rem;
}

.block-selector-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 4.6rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.1rem;
  background: rgba(250, 250, 250, 0.8);
  padding: 0.78rem;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.block-selector-item:hover {
  transform: translateY(-1px);
  border-color: rgba(24, 24, 27, 0.32);
  background: white;
}

.block-selector-icon {
  display: grid;
  place-items: center;
  width: 2.55rem;
  height: 2.55rem;
  flex-shrink: 0;
  border-radius: 0.9rem;
  background: rgb(24, 24, 27);
  color: white;
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.06em;
}

.block-selector-name {
  display: block;
  color: rgb(24, 24, 27);
  font-size: 0.92rem;
  font-weight: 760;
}

.block-selector-desc {
  display: block;
  margin-top: 0.22rem;
  overflow: hidden;
  color: rgb(113, 113, 122);
  font-size: 0.76rem;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.block-selector-empty {
  padding: 3rem 1.25rem;
  text-align: center;
  color: rgb(113, 113, 122);
  font-size: 0.9rem;
}

.dark .block-selector-panel {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(9, 9, 11, 0.96);
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.42);
}

.dark .block-selector-header h3,
.dark .block-selector-name {
  color: white;
}

.dark .block-selector-kicker,
.dark .block-selector-search,
.dark .block-selector-desc,
.dark .block-selector-empty {
  color: rgb(161, 161, 170);
}

.dark .block-selector-close,
.dark .block-selector-search input,
.dark .block-selector-item {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(24, 24, 27, 0.82);
  color: rgb(228, 228, 231);
}

.dark .block-selector-item:hover {
  border-color: rgba(255, 255, 255, 0.32);
  background: rgba(39, 39, 42, 0.9);
}

.dark .block-selector-icon {
  background: white;
  color: rgb(24, 24, 27);
}

.block-selector-enter-active,
.block-selector-leave-active {
  transition: opacity 0.18s ease;
}

.block-selector-enter-from,
.block-selector-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .block-selector-grid {
    grid-template-columns: 1fr;
  }
}
</style>