<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="grid gap-3">
      <div class="grid gap-2 sm:grid-cols-2">
        <select v-model="variantModel" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:text-white">
          <option value="embed">嵌入网页</option>
          <option value="google_drive">Google Drive</option>
          <option value="tweet">Tweet</option>
          <option value="github_gist">GitHub Gist</option>
          <option value="maps">Maps</option>
        </select>
        <input :value="model.title" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="标题" @input="(event) => patch({ title: event.target.value })" />
      </div>
      <input :value="model.url" class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="粘贴 URL" @input="(event) => patch({ url: event.target.value })" />
      <iframe v-if="canEmbed" :src="model.url" class="h-72 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800" loading="lazy"></iframe>
      <a v-if="model.url" :href="model.url" target="_blank" rel="noreferrer" class="inline-flex w-fit rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950">打开链接</a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ variant: 'embed', url: '', title: '' })
  }
})

const emit = defineEmits(['update:modelValue'])
const model = computed(() => props.modelValue || { variant: 'embed', url: '', title: '' })
const variantModel = computed({
  get: () => model.value.variant || 'embed',
  set: (value) => patch({ variant: value })
})

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })
const canEmbed = computed(() => !!model.value.url)
</script>

