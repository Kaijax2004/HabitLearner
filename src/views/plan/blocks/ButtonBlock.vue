<template>
  <div class="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <div class="grid gap-3 sm:grid-cols-2">
      <input
        :value="model.label"
        data-ai-field="label"
        class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
        placeholder="按钮文案"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @input="(event) => patch({ label: event.target.value })"
      />
      <select
        v-model="styleModel"
        class="rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:text-white"
        @focus="emit('focus')"
        @blur="emit('blur')"
      >
        <option value="primary">主按钮</option>
        <option value="secondary">次按钮</option>
        <option value="ghost">文字按钮</option>
      </select>
    </div>
    <input
      :value="model.url"
      data-ai-field="url"
      class="mt-3 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 dark:border-zinc-700 dark:text-white"
      placeholder="跳转链接"
      @focus="emit('focus')"
      @blur="emit('blur')"
      @input="(event) => patch({ url: event.target.value })"
    />
    <div class="mt-3">
      <button type="button" :class="buttonClass" @click="openTarget">{{ model.label || '按钮' }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ label: '按钮', url: '', style: 'primary' })
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])
const model = computed(() => props.modelValue || { label: '按钮', url: '', style: 'primary' })
const styleModel = computed({
  get: () => model.value.style || 'primary',
  set: (value) => patch({ style: value })
})

const patch = (patchValue) => emit('update:modelValue', { ...model.value, ...patchValue })

const buttonClass = computed(() => ({
  primary: 'inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950',
  secondary: 'inline-flex rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200',
  ghost: 'inline-flex rounded-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200'
}[styleModel.value]))

const openTarget = () => {
  if (model.value.url) window.open(model.value.url, '_blank', 'noreferrer')
}
</script>
