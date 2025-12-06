<template>
  <BaseCard>
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs text-gray-500">标注</span>
      <select v-model="model.variant" class="bg-transparent border rounded px-2 py-1 text-xs">
        <option value="info">提示</option>
        <option value="warning">警告</option>
        <option value="success">成功</option>
      </select>
    </div>
    <div :class="boxClass" class="p-3 rounded">
      <textarea v-model="model.text" class="w-full bg-transparent outline-none resize-none dark:text-white" rows="3" placeholder="标注内容..." />
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({ text: '', variant: 'info' }) } })
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const boxClass = computed(() => ({
  info: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
}[model.value.variant || 'info']))
</script>

<style scoped>
</style>


