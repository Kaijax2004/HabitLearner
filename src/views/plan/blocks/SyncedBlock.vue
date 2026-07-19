<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <input
        :value="model.syncKey"
        data-ai-field="syncKey"
        class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
        placeholder="同步键"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="(event) => patch({ syncKey: event.target.value })"
      />
      <select
        v-model="roleModel"
        class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:text-white"
        @focus="emit('focus')"
        @blur="emit('blur')"
      >
        <option value="source">源块</option>
        <option value="mirror">镜像块</option>
      </select>
    </div>
    <textarea
      v-if="roleModel === 'source'"
      :value="model.text"
      data-ai-field="text"
      class="min-h-[4rem] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
      placeholder="同步内容"
      @focus="emit('focus')"
      @blur="emit('blur')"
      @input="(event) => patch({ text: event.target.value })"
    />
    <div v-else class="rounded-xl border border-dashed border-zinc-300 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
      {{ syncedText || '等待源块内容' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ syncKey: '', role: 'source', text: '' })
  },
  allBlocks: { type: Array, default: () => [] },
  blockId: { type: [String, Number], default: '' }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])
const model = computed(() => props.modelValue || { syncKey: '', role: 'source', text: '' })

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })
const roleModel = computed({
  get: () => model.value.role || 'source',
  set: (value) => patch({ role: value })
})

const syncedText = computed(() => {
  if (roleModel.value === 'source') return model.value.text || ''
  const source = (props.allBlocks || []).find((block) => (
    block.type === 'synced_block' &&
    block.id !== props.blockId &&
    block.content?.syncKey === model.value.syncKey &&
    block.content?.role === 'source'
  ))
  return source?.content?.text || ''
})
</script>
