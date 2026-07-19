<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">目录</div>
    <div v-if="headings.length" class="space-y-1 text-sm">
      <button v-for="item in headings" :key="item.id" type="button" class="block w-full rounded-lg px-2 py-1.5 text-left text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" :style="{ paddingLeft: `${8 + (item.level - 1) * 14}px` }" @click="scrollToBlock(item.id)">
        {{ item.text || '未命名标题' }}
      </button>
    </div>
    <div v-else class="text-sm text-zinc-400">当前页面还没有标题</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  allBlocks: { type: Array, default: () => [] }
})

const headings = computed(() => (props.allBlocks || []).filter((block) => block.type === 'heading').map((block) => ({
  id: block.id,
  text: block.content?.text || '',
  level: block.content?.level || 1
})))

const scrollToBlock = (blockId) => {
  document.querySelector(`[data-block-id="${String(blockId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

