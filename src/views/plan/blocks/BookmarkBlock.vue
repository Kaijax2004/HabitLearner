<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="grid gap-3">
      <input
        :value="model.url"
        class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
        placeholder="粘贴网页链接"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="onUrlInput"
      />
      <div class="grid gap-2 sm:grid-cols-2">
        <input :value="model.title" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="标题" @input="(event) => patch({ title: event.target.value })" />
        <input :value="model.description" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="描述" @input="(event) => patch({ description: event.target.value })" />
      </div>
      <a v-if="model.url" :href="model.url" target="_blank" rel="noreferrer" class="inline-flex w-fit items-center rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950">
        打开书签
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ url: '', title: '', description: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const model = computed(() => props.modelValue || { url: '', title: '', description: '' })

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const onUrlInput = (event) => {
  const url = event.target.value
  let title = model.value.title
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (!title) title = host
  } catch {}
  patch({ url, title })
}
</script>

