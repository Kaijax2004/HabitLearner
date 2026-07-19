<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition-colors duration-150 hover:bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/70">
    <div class="flex items-start gap-3">
      <div class="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-sm font-semibold dark:bg-zinc-800">{{ model.icon || 'P' }}</div>
      <div class="min-w-0 flex-1 space-y-3">
        <input
          :value="model.title"
          data-ai-field="title"
          class="w-full bg-transparent text-lg font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500"
          placeholder="页面标题"
          @focus="emit('focus')"
          @blur="emit('blur')"
          @input="(event) => patch({ title: event.target.value })"
          @keydown="onKeydown"
        />
        <textarea
          :value="model.summary"
          data-ai-field="summary"
          class="min-h-[3.2rem] w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-600 outline-none placeholder:text-zinc-400 dark:text-zinc-300 dark:placeholder:text-zinc-500"
          placeholder="页面摘要"
          @focus="emit('focus')"
          @blur="emit('blur')"
          @input="(event) => patch({ summary: event.target.value })"
        />
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-950" @click="createChildPage">
            {{ model.pageId ? '打开页面' : '创建子页面' }}
          </button>
          <button v-if="model.pageId" type="button" class="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300" @click="openPage">
            前往
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/plan'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ title: '新页面', summary: '', pageId: null, icon: 'P' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const router = useRouter()
const planStore = usePlanStore()

const model = computed(() => props.modelValue || { title: '新页面', summary: '', pageId: null, icon: 'P' })

const patch = (patchValue) => {
  emit('update:modelValue', { ...model.value, ...patchValue })
}

const createChildPage = async () => {
  if (model.value.pageId) {
    await openPage()
    return
  }
  const res = await planStore.addPlan({ title: model.value.title || '新页面', type: 'project' })
  if (res.success && res.data?.id) {
    patch({ pageId: res.data.id, title: res.data.title || model.value.title })
    router.push(`/plan/${res.data.id}`)
  }
}

const openPage = async () => {
  if (!model.value.pageId) return
  router.push(`/plan/${model.value.pageId}`)
}

const onKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('create-new-block')
  }
  if (event.key === 'Backspace' && !model.value.title && !model.value.summary) {
    event.preventDefault()
    emit('delete-block')
  }
}
</script>
