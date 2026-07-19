<template>
  <div class="todo-block">
    <div class="flex items-start gap-3 rounded-md px-3 py-2 transition-colors duration-150 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
      <button
        type="button"
        class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-150"
        :class="model.done
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
          : 'border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-600 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30'"
        @click="toggleDone"
      >
        <svg v-if="model.done" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <textarea
        ref="textareaRef"
        :value="model.text"
        data-ai-field="text"
        class="flex-1 resize-none overflow-hidden bg-transparent text-sm leading-relaxed outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        :class="model.done ? 'text-zinc-500 line-through dark:text-zinc-400' : 'text-zinc-900 dark:text-white'"
        placeholder="待办事项"
        rows="1"
        style="line-height: 1.6; font-family: inherit;"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      text: '',
      done: false
    })
  }
})

const emit = defineEmits(['update:modelValue', 'toggle-complete', 'focus', 'blur', 'create-new-block', 'delete-block'])

const textareaRef = ref(null)

const model = computed(() => props.modelValue || { text: '', done: false })

const resizeTextarea = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}

const toggleDone = () => {
  emit('update:modelValue', { ...model.value, done: !model.value.done })
  emit('toggle-complete')
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

  if (event.key === 'Backspace' && !(model.value.text || '')) {
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
