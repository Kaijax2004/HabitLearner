<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="flex items-start gap-3">
      <button type="button" class="mt-1 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="patch({ open: !model.open })">
        <span :class="{ 'rotate-90': model.open }" class="transition-transform duration-150">›</span>
      </button>
      <div class="min-w-0 flex-1">
        <input
          :value="model.title"
          data-ai-field="title"
          class="w-full bg-transparent text-sm font-medium text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white"
          placeholder="折叠标题"
          @focus="emit('focus')"
          @blur="emit('blur')"
          @input="(event) => patch({ title: event.target.value })"
          @keydown="onTitleKeydown"
        />
        <textarea
          v-show="model.open"
          :value="model.text"
          data-ai-field="text"
          class="mt-2 min-h-[3rem] w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-600 outline-none placeholder:text-zinc-400 dark:text-zinc-300"
          placeholder="折叠内容"
          @focus="emit('focus')"
          @blur="emit('blur')"
          @input="(event) => patch({ text: event.target.value })"
          @keydown="onContentKeydown"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ title: '', text: '', open: true })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const model = computed(() => props.modelValue || { title: '', text: '', open: true })
const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const onTitleKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    patch({ open: true })
  }
  if (event.key === 'Backspace' && !model.value.title && !model.value.text) {
    event.preventDefault()
    emit('delete-block')
  }
}

const onContentKeydown = (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    emit('create-new-block')
  }
  if (event.key === 'Backspace' && !model.value.text && !model.value.title) {
    event.preventDefault()
    emit('delete-block')
  }
}
</script>
