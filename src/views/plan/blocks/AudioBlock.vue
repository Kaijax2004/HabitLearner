<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div v-if="model.url" class="space-y-3">
      <audio :src="model.url" controls class="w-full"></audio>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950" @click="triggerFileInput">替换音频</button>
        <button type="button" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300" @click="clearAudio">移除</button>
      </div>
      <input :value="model.title" class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white" placeholder="音频标题" @input="(event) => patch({ title: event.target.value })" />
    </div>
    <div
      v-else
      class="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 text-center transition-colors duration-150 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div class="text-sm text-zinc-600 dark:text-zinc-300">点击上传音频或拖拽到此处</div>
      <div class="mt-1 text-xs text-zinc-400">支持 MP3、WAV、M4A、OGG</div>
    </div>
    <input ref="fileInputRef" type="file" accept="audio/*" class="hidden" @change="onFileChange" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { uploadAudio } from '@/api/uploads.js'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ url: '', title: '', mimeType: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const fileInputRef = ref(null)
const model = computed(() => props.modelValue || { url: '', title: '', mimeType: '' })
const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const triggerFileInput = () => fileInputRef.value?.click()

const clearAudio = () => emit('update:modelValue', { url: '', title: '', mimeType: '' })

const upload = async (file) => {
  if (!file) return
  const localUrl = URL.createObjectURL(file)
  patch({ url: localUrl, title: model.value.title || file.name, mimeType: file.type })
  const res = await uploadAudio(file)
  if (res?.success) {
    patch({
      url: res.data?.url || localUrl,
      title: model.value.title || res.data?.filename || file.name,
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
  const file = Array.from(event.dataTransfer.files || []).find((item) => item.type.startsWith('audio/'))
  if (file) await upload(file)
}
</script>
