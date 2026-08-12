<template>
  <AppLayout title="专注">
    <div class="focus-page space-y-5">
      <section class="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Focus</p>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">把注意力交给这一轮</h2>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              专注工作区承接番茄钟、白噪音、全屏专注和专注统计。今日页只提醒你该做什么，这里负责让你真正开始。
            </p>
          </div>

          <div class="grid grid-cols-3 overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-zinc-100 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div class="bg-white px-4 py-3 dark:bg-zinc-950/80">
              <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Start</p>
              <p class="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">快速进入</p>
            </div>
            <div class="bg-white px-4 py-3 dark:bg-zinc-950/80">
              <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Sound</p>
              <p class="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">声场陪伴</p>
            </div>
            <div class="bg-white px-4 py-3 dark:bg-zinc-950/80">
              <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Record</p>
              <p class="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">沉淀记录</p>
            </div>
          </div>
        </div>
      </section>

      <div class="focus-workspace-shell">
        <PomodoroWorkspace />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'
import PomodoroWorkspace from '@/components/PomodoroWorkspace.vue'
</script>

<style scoped>
.focus-workspace-shell {
  min-height: calc(100vh - 17rem);
}
</style>
