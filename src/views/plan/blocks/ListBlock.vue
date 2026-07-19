<template>
  <div ref="rootRef" class="relative group list-block">
    <div
      v-if="showToolbar"
      class="absolute -top-12 left-0 z-30 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <button class="toolbar-btn" title="添加列表项" @click="addItem">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        <button class="toolbar-btn" :title="listType === 'ordered' ? '切换为无序列表' : '切换为有序列表'" @click="toggleListType">
          <svg v-if="listType === 'ordered'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
    </div>

    <div
      class="group min-h-[2rem] cursor-text rounded-md px-3 py-2 transition-all duration-200"
      :class="{
        'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30': !isFocused,
        'bg-gray-50/80 shadow-sm dark:bg-gray-800/50': isFocused
      }"
      @click="focusList"
    >
      <div class="space-y-1">
        <div v-for="(item, index) in items" :key="index" class="group/item flex items-start gap-2">
          <div class="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <span v-if="listType === 'ordered'">{{ index + 1 }}.</span>
            <span v-else class="h-1.5 w-1.5 rounded-full bg-current"></span>
          </div>

          <div class="min-w-0 flex-1">
            <textarea
              :value="item"
              data-ai-field="items"
              :data-ai-item-index="String(index)"
              class="w-full resize-none overflow-hidden bg-transparent text-sm text-gray-900 outline-none dark:text-gray-100"
              :placeholder="`列表项 ${index + 1}`"
              rows="1"
              style="line-height: 1.5; font-family: inherit;"
              @focus="onFocus"
              @blur="onBlur"
              @input="(event) => onInput(event, index)"
              @keydown="(event) => onKeydown(event, index)"
            />
          </div>

          <button
            class="flex h-5 w-5 items-center justify-center rounded text-gray-400 opacity-0 transition-all duration-150 group-hover/item:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title="删除列表项"
            @click="removeItem(index)"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="!items.length" class="py-4 text-center text-gray-500 dark:text-gray-400">
        点击上方按钮添加列表项
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      listType: 'unordered',
      items: ['列表项 1', '列表项 2']
    })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const isFocused = ref(false)
const showToolbar = ref(false)
const rootRef = ref(null)

const model = computed(() => props.modelValue || { listType: 'unordered', items: [] })
const items = computed(() => Array.isArray(model.value.items) ? model.value.items : [])
const listType = computed(() => model.value.listType || 'unordered')

const updateModel = (patch) => {
  emit('update:modelValue', {
    ...model.value,
    ...patch
  })
}

const resizeAll = () => {
  rootRef.value?.querySelectorAll('textarea').forEach((input) => {
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  })
}

const focusList = () => {
  rootRef.value?.querySelector('textarea')?.focus()
}

const onFocus = () => {
  isFocused.value = true
  showToolbar.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  window.setTimeout(() => {
    showToolbar.value = false
  }, 150)
  emit('blur')
}

const onInput = (event, index) => {
  const nextItems = [...items.value]
  nextItems[index] = event.target.value
  updateModel({ items: nextItems })
  if (event?.target) {
    event.target.style.height = 'auto'
    event.target.style.height = `${event.target.scrollHeight}px`
  }
}

const addItem = () => {
  updateModel({ items: [...items.value, ''] })
  nextTick(() => {
    const inputs = rootRef.value?.querySelectorAll('textarea') || []
    inputs[inputs.length - 1]?.focus()
  })
}

const addItemAt = (index) => {
  const nextItems = [...items.value]
  nextItems.splice(index, 0, '')
  updateModel({ items: nextItems })
  nextTick(() => {
    rootRef.value?.querySelectorAll('textarea')[index]?.focus()
  })
}

const removeItem = (index) => {
  if (items.value.length <= 1) {
    emit('delete-block')
    return
  }
  updateModel({ items: items.value.filter((_, itemIndex) => itemIndex !== index) })
  nextTick(() => {
    const inputs = rootRef.value?.querySelectorAll('textarea') || []
    inputs[Math.min(index, inputs.length - 1)]?.focus()
  })
}

const toggleListType = () => {
  updateModel({ listType: listType.value === 'ordered' ? 'unordered' : 'ordered' })
}

const onKeydown = (event, index) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    addItemAt(index + 1)
    return
  }

  if (event.key === 'Backspace' && items.value[index] === '') {
    event.preventDefault()
    removeItem(index)
    return
  }

  if (event.key === 'ArrowUp' && index > 0) {
    event.preventDefault()
    rootRef.value?.querySelectorAll('textarea')[index - 1]?.focus()
    return
  }

  if (event.key === 'ArrowDown' && index < items.value.length - 1) {
    event.preventDefault()
    rootRef.value?.querySelectorAll('textarea')[index + 1]?.focus()
  }
}

onMounted(() => {
  nextTick(() => resizeAll())
})

watch(() => model.value.items, async () => {
  await nextTick()
  resizeAll()
}, { deep: true, immediate: true })
</script>

<style scoped>
.toolbar-btn {
  @apply flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700;
}
</style>
