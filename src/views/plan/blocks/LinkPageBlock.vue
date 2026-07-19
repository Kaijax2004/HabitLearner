<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="flex items-start gap-3">
      <div class="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-lg dark:bg-zinc-800">↗</div>
      <div class="min-w-0 flex-1 space-y-3">
        <div class="grid gap-2 sm:grid-cols-2">
          <select v-model="pageIdModel" class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:text-white">
            <option value="">选择页面</option>
            <option v-for="item in planOptions" :key="item.id" :value="String(item.id)">{{ item.title }}</option>
          </select>
          <input
            :value="model.pageTitle"
            data-ai-field="pageTitle"
            class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
            placeholder="显示名称"
            @input="(event) => patch({ pageTitle: event.target.value })"
            @focus="emit('focus')"
            @blur="emit('blur')"
          />
        </div>
        <input
          :value="model.note"
          data-ai-field="note"
          class="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
          placeholder="备注"
          @input="(event) => patch({ note: event.target.value })"
          @focus="emit('focus')"
          @blur="emit('blur')"
        />
        <div class="flex gap-2">
          <button type="button" class="rounded-full bg-zinc-950 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-950" :disabled="!model.pageId" @click="openPage">
            打开
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/plan'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ pageId: '', pageTitle: '', note: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const router = useRouter()
const planStore = usePlanStore()
const planOptions = ref([])

const model = computed(() => props.modelValue || { pageId: '', pageTitle: '', note: '' })

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const pageIdModel = computed({
  get: () => String(model.value.pageId || ''),
  set: (value) => {
    const target = planOptions.value.find((item) => String(item.id) === String(value))
    patch({ pageId: value, pageTitle: target?.title || model.value.pageTitle })
  }
})

const openPage = () => {
  if (!model.value.pageId) return
  router.push(`/plan/${model.value.pageId}`)
}

onMounted(async () => {
  if (!planStore.plans.length) {
    await planStore.loadPlans()
  }
  planOptions.value = planStore.plans.slice()
})
</script>
