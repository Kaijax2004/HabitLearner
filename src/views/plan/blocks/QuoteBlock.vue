<template>
  <div class="quote-block">
    <div class="rounded-md border-l-4 border-zinc-300 bg-zinc-50/80 px-4 py-3 transition-colors duration-150 hover:bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/70">
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex-shrink-0 text-zinc-400 dark:text-zinc-500">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
          </svg>
        </div>
        <textarea
          ref="textareaRef"
          :value="model.text"
          data-ai-field="text"
          class="min-h-[1.25rem] w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
          placeholder="引用内容"
          rows="1"
          style="line-height: 1.65; font-family: inherit;"
          @focus="emit('focus')"
          @blur="emit('blur')"
          @input="onInput"
          @keydown="onKeydown"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ text: '' }) }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const textareaRef = ref(null)

const model = computed(() => props.modelValue || { text: '' })

const resizeTextarea = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

const onInput = (event) => {
  emit('update:modelValue', { ...model.value, text: event.target.value })
  resizeTextarea()
}

watch(() => model.value.text, async () => {
  await nextTick()
  resizeTextarea()
}, { immediate: true })

const onKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Backspace' && !model.value.text) {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('create-new-block')
  }
}

onMounted(() => {
  nextTick(() => {
    resizeTextarea()
  })
})
</script>

<style scoped>
</style>
