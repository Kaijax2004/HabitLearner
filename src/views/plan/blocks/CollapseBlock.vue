<template>
  <BaseCard>
    <details :open="model.open">
      <summary class="cursor-pointer select-none">
        <input v-model="model.title" class="bg-transparent outline-none dark:text-white" placeholder="折叠标题" />
      </summary>
      <textarea v-model="model.text" class="w-full p-3 bg-transparent outline-none resize-none dark:text-white mt-2" rows="3" placeholder="折叠内容..." />
    </details>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/BaseCard.vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({ title: '', text: '', open: false }) } })
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>

<style scoped>
</style>


