<template>
  <aside class="plan-editor-rail plan-page-tree-rail">
    <div class="plan-rail-heading">
      <span class="plan-rail-eyebrow">Workspace</span>
      <div class="flex items-center justify-between gap-2">
        <strong>页面</strong>
        <button type="button" class="plan-page-tree-add" title="新建页面" @click="$emit('create', null)">+</button>
      </div>
    </div>

    <div v-if="flatPages.length" class="plan-page-tree-list">
      <div
        v-for="item in flatPages"
        :key="item.id"
        class="plan-page-tree-item"
        :class="{ 'is-active': String(item.id) === String(currentPageId) }"
        :style="{ paddingLeft: `${0.45 + item.depth * 0.8}rem` }"
      >
        <button type="button" class="plan-page-tree-open" @click="$emit('open', item.page)">
          <span class="plan-page-tree-icon">{{ item.page.icon || 'P' }}</span>
          <span class="min-w-0 flex-1 truncate">{{ item.page.title || '无标题' }}</span>
        </button>
        <button type="button" class="plan-page-tree-child" title="新建子页面" @click="$emit('create', item.page.id)">+</button>
      </div>
    </div>
    <p v-else class="plan-rail-empty">还没有工作台页面。</p>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pages: { type: Array, default: () => [] },
  currentPageId: { type: [String, Number, null], default: null }
})

defineEmits(['open', 'create'])

const flatPages = computed(() => {
  const result = []
  const visit = (nodes, depth = 0) => {
    nodes.forEach((page) => {
      result.push({ id: page.id, page, depth })
      if (Array.isArray(page.children) && page.children.length) visit(page.children, depth + 1)
    })
  }
  visit(props.pages)
  return result
})
</script>

<style scoped>
.plan-page-tree-rail {
  min-width: 0;
}

.plan-page-tree-add,
.plan-page-tree-child {
  display: inline-grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  color: #a1a1aa;
  font-size: 1rem;
}

.plan-page-tree-add:hover,
.plan-page-tree-child:hover {
  background: rgba(228, 228, 231, 0.72);
  color: #18181b;
}

.plan-page-tree-list {
  display: grid;
  gap: 0.2rem;
}

.plan-page-tree-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  border: 0;
  border-radius: 0.7rem;
  background: transparent;
  color: #52525b;
  padding-top: 0.45rem;
  padding-right: 0.25rem;
  padding-bottom: 0.45rem;
  text-align: left;
  font-size: 0.74rem;
}

.plan-page-tree-open {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}

.plan-page-tree-item:hover,
.plan-page-tree-item.is-active {
  background: rgba(228, 228, 231, 0.68);
  color: #18181b;
}

.plan-page-tree-icon {
  display: inline-grid;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(161, 161, 170, 0.55);
  border-radius: 0.35rem;
  font-size: 0.62rem;
}

.dark .plan-page-tree-item {
  color: #d4d4d8;
}

.dark .plan-page-tree-item:hover,
.dark .plan-page-tree-item.is-active {
  background: rgba(63, 63, 70, 0.68);
  color: white;
}
</style>
