<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div v-if="model.url" class="space-y-3">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-lg dark:bg-zinc-800">FILE</div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ model.name || '文件' }}</div>
          <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ fileMeta }}</div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950" @click="triggerFileInput">替换文件</button>
        <button type="button" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300" @click="clearFile">移除</button>
        <a :href="model.url" target="_blank" rel="noreferrer" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">打开</a>
      </div>
      <input :value="model.caption" class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="文件说明" @input="(event) => patch({ caption: event.target.value })" />
    </div>

    <div
      v-else
      class="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 text-center transition-colors duration-150 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div class="text-sm text-zinc-600 dark:text-zinc-300">点击上传文件或拖拽到此处</div>
      <div class="mt-1 text-xs text-zinc-400">支持 PDF、文档、表格、压缩包等</div>
    </div>

    <input ref="fileInputRef" type="file" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { uploadFile } from '@/api/uploads.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ url: '', name: '', caption: '', size: 0, mimeType: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const fileInputRef = ref(null)
const progress = ref(0)
const model = computed(() => props.modelValue || { url: '', name: '', caption: '', size: 0, mimeType: '' })

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const fileMeta = computed(() => [model.value.mimeType, model.value.size ? `${Math.round(model.value.size / 1024)} KB` : ''].filter(Boolean).join(' · '))

const triggerFileInput = () => fileInputRef.value?.click()

const clearFile = () => emit('update:modelValue', { url: '', name: '', caption: '', size: 0, mimeType: '' })

const upload = async (file) => {
  if (!file) return
  const localUrl = URL.createObjectURL(file)
  patch({ url: localUrl, name: file.name, size: file.size, mimeType: file.type })
  const res = await uploadFile(file, (value) => { progress.value = value })
  if (res?.success) {
    patch({
      url: res.data?.url || localUrl,
      name: res.data?.filename || file.name,
      size: res.data?.size || file.size,
      mimeType: res.data?.mimeType || file.type
    })
  }
}

const onFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (file) await upload(file)
  event.target.value = ''
}

const onDrop = async (event) => {
  const file = event.dataTransfer.files?.[0]
  if (file) await upload(file)
}
</script>

