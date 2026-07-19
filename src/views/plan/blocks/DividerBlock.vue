<template>
  <div
    tabindex="0"
    class="group rounded-md px-3 py-4 outline-none transition-colors duration-150 hover:bg-zinc-50/70 focus:bg-zinc-50 dark:hover:bg-zinc-800/30 dark:focus:bg-zinc-800/30"
    @focus="emit('focus')"
    @blur="emit('blur')"
    @keydown="onKeydown"
  >
    <div class="flex items-center gap-3">
      <div class="h-px flex-1 bg-zinc-300 dark:bg-zinc-700"></div>
      <span class="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">divider</span>
      <div class="h-px flex-1 bg-zinc-300 dark:bg-zinc-700"></div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['focus', 'blur', 'create-new-block', 'delete-block'])

const onKeydown = (event) => {
  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    emit('delete-block')
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('create-new-block')
  }
}
</script>

