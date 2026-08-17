<template>
  <div v-if="commandMenu.show" class="slash-backdrop" @click="$emit('close')">
    <div class="slash-panel" :style="{ top: `${commandMenu.top}px`, left: `${commandMenu.left}px` }" @click.stop>
      <div class="slash-header">
        <span>{{ commandMenu.mode === 'replace-current' ? '替换当前块' : '插入新块' }}</span>
        <span class="text-xs text-zinc-400">/</span>
      </div>
      <div class="mb-2 px-1">
        <input
          ref="inputRef"
          :value="commandMenu.query"
          class="slash-search"
          type="text"
          placeholder="搜索文本、列表、图片、数据库..."
          @input="$emit('query', $event.target.value)"
          @keydown="$emit('keydown', $event)"
        />
      </div>
      <div class="slash-category-tabs">
        <button
          v-for="category in commandCategories"
          :key="category.key"
          type="button"
          class="slash-category-chip"
          :class="{ 'slash-category-chip-active': commandMenu.selectedCategory === category.key }"
          @click="$emit('category', category.key)"
        >
          <span>{{ category.label }}</span>
          <span class="slash-category-count">{{ category.count }}</span>
        </button>
      </div>
      <div v-if="visibleCommandItems.length" class="mb-1 flex items-center justify-between px-2 pb-1 text-[11px] text-zinc-400">
        <span>第 {{ currentPage + 1 }} / {{ totalPages }} 页</span>
        <span>{{ pageItemRangeText }}</span>
      </div>
      <div v-if="visibleCommandItems.length" ref="listRef" class="slash-list">
        <button
          v-for="item in pagedCommandItems"
          :key="item.key"
          type="button"
          class="slash-item"
          :class="{ 'slash-item-active': visibleCommandItems[commandMenu.highlight]?.key === item.key }"
          @mouseenter="$emit('highlight', visibleCommandItems.findIndex((candidate) => candidate.key === item.key))"
          @click="$emit('select', item)"
        >
          <span class="slash-item-icon">{{ item.icon }}</span>
          <span class="slash-item-text">
            <span>{{ item.label }}</span>
            <span>{{ item.description }}</span>
          </span>
          <span v-if="commandMenu.selectedCategory === 'all'" class="slash-item-badge">{{ item.category }}</span>
        </button>
      </div>
      <div v-else class="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">没有匹配的命令</div>
      <div v-if="visibleCommandItems.length && totalPages > 1" class="slash-pagination">
        <button type="button" class="slash-page-btn" :disabled="currentPage === 0" @click="$emit('page', currentPage - 1)">上一页</button>
        <span class="slash-page-indicator">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button type="button" class="slash-page-btn" :disabled="currentPage >= totalPages - 1" @click="$emit('page', currentPage + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  commandMenu: { type: Object, required: true },
  commandCategories: { type: Array, default: () => [] },
  visibleCommandItems: { type: Array, default: () => [] },
  pagedCommandItems: { type: Array, default: () => [] },
  currentPage: { type: Number, default: 0 },
  totalPages: { type: Number, default: 1 },
  pageItemRangeText: { type: String, default: '' }
})

defineEmits(['close', 'query', 'keydown', 'category', 'highlight', 'select', 'page'])

const inputRef = ref(null)
const listRef = ref(null)

watch(() => props.commandMenu.show, (show) => {
  if (show) nextTick(() => inputRef.value?.focus())
})

watch(
  () => [props.commandMenu.highlight, props.currentPage, props.commandMenu.show],
  async () => {
    if (!props.commandMenu.show) return
    await nextTick()
    listRef.value?.querySelector('.slash-item-active')?.scrollIntoView({ block: 'nearest' })
  }
)
</script>

<style>
.slash-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
}

.slash-panel {
  position: fixed;
  z-index: 1201;
  width: 320px;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.98);
  padding: 0.65rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.dark .slash-panel {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(9, 9, 11, 0.98);
}

.slash-header,
.slash-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.slash-header {
  padding: 0.35rem 0.55rem 0.45rem;
  color: rgb(113 113 122);
  font-size: 0.75rem;
}

.slash-search {
  width: 100%;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 14px;
  background: transparent;
  color: rgb(24 24 27);
  padding: 0.7rem 0.85rem;
  font-size: 0.9rem;
  outline: none;
}

.dark .slash-search {
  border-color: rgba(39, 39, 42, 0.95);
  color: white;
}

.slash-category-tabs {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  margin-bottom: 0.3rem;
  padding: 0 0.2rem 0.6rem;
  scrollbar-width: none;
}

.slash-category-chip,
.slash-page-btn {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.96);
  color: rgb(82 82 91);
  padding: 0.38rem 0.72rem;
  font-size: 0.74rem;
  white-space: nowrap;
}

.slash-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.slash-category-chip-active,
.slash-category-chip:hover {
  border-color: rgba(24, 24, 27, 0.12);
  background: rgb(24 24 27);
  color: white;
}

.slash-category-count {
  display: inline-flex;
  min-width: 1.25rem;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(113, 113, 122, 0.14);
  padding: 0.15rem 0.35rem;
  font-size: 0.68rem;
}

.slash-list {
  max-height: 340px;
  overflow-y: auto;
}

.slash-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  border-radius: 16px;
  background: transparent;
  padding: 0.7rem 0.75rem;
  text-align: left;
}

.slash-item:hover,
.slash-item-active {
  background: rgba(244, 244, 245, 1);
}

.dark .slash-item:hover,
.dark .slash-item-active {
  background: rgba(39, 39, 42, 1);
}

.slash-item-icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(244, 244, 245, 1);
  color: rgb(39 39 42);
  font-size: 0.8rem;
  font-weight: 700;
}

.slash-item-text {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.slash-item-text span:first-child {
  color: rgb(24 24 27);
  font-size: 0.92rem;
}

.slash-item-text span:last-child,
.slash-item-badge,
.slash-page-indicator {
  color: rgb(113 113 122);
  font-size: 0.74rem;
}

.dark .slash-item-text span:first-child {
  color: white;
}

.slash-pagination {
  padding: 0.5rem 0.4rem 0.1rem;
}

.slash-page-btn {
  padding: 0.45rem 0.8rem;
}

.slash-page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}
</style>
