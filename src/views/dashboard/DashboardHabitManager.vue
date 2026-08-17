<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/96 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950/96">
          <div class="flex items-start justify-between gap-4 border-b border-zinc-200/80 px-5 py-5 dark:border-zinc-800">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Habit Manager</p>
              <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">习惯管理</h3>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">可以在这里新增习惯、全选后批量删除，或者直接进入单个习惯详情。</p>
            </div>
            <button type="button" class="habit-manager-action" @click="$emit('close')">关闭</button>
          </div>

          <div class="space-y-4 p-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div class="flex flex-wrap gap-2">
                <button type="button" class="habit-manager-action" @click="$emit('create')">新增习惯</button>
                <button type="button" class="habit-manager-action" :disabled="!habits.length" @click="$emit('toggle-select-all')">
                  {{ allSelected ? '取消全选' : '全选' }}
                </button>
                <button type="button" class="habit-manager-danger" :disabled="!selectedIds.length || deleting" @click="$emit('delete-selected')">
                  {{ deleting ? '删除中...' : `删除 ${selectedIds.length} 个` }}
                </button>
              </div>
              <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">已选 {{ selectedIds.length }} / {{ habits.length }}</div>
            </div>

            <div v-if="!habits.length" class="rounded-[1.6rem] border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-10 text-center dark:border-zinc-800 dark:bg-white/5">
              <p class="text-base font-semibold text-zinc-950 dark:text-white">还没有习惯</p>
              <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">先创建一个最容易坚持的小习惯，再回来批量管理。</p>
              <button type="button" class="habit-manager-primary mt-4" @click="$emit('create')">创建习惯</button>
            </div>

            <div v-else class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              <label v-for="habit in habits" :key="habit.id" class="habit-manager-row" :class="{ 'is-selected': selectedIds.includes(habit.id) }">
                <input type="checkbox" class="habit-manager-checkbox" :checked="selectedIds.includes(habit.id)" @change="$emit('toggle-selection', habit.id)" />
                <span class="habit-preview-dot" :style="{ backgroundColor: habit.color || '#18181b' }"></span>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ habit.name }}</span>
                    <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                      {{ habit.frequency === 'daily' ? '每日' : '每周' }}
                    </span>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="habit.done ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'">
                      {{ habit.done ? '已完成' : '待完成' }}
                    </span>
                  </div>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ habit.count }}/{{ habit.target }} · 连续 {{ habit.streak || 0 }} 天</p>
                </div>
                <button type="button" class="habit-manager-link" @click="$emit('open-detail', habit.id)">查看</button>
              </label>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  habits: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
  allSelected: { type: Boolean, default: false },
  deleting: { type: Boolean, default: false }
})

defineEmits(['close', 'create', 'toggle-select-all', 'delete-selected', 'toggle-selection', 'open-detail'])
</script>

<style>
.habit-manager-action,
.habit-manager-danger,
.habit-manager-link,
.habit-manager-primary {
  min-height: 2.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  padding: 0 1rem;
  color: rgb(39 39 42);
  font-size: 0.8125rem;
  font-weight: 700;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.habit-manager-action:hover:not(:disabled),
.habit-manager-danger:hover:not(:disabled),
.habit-manager-link:hover,
.habit-manager-primary:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.82);
  background: white;
}

.habit-manager-action:disabled,
.habit-manager-danger:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.habit-manager-primary,
.habit-manager-danger {
  background: rgb(24 24 27);
  color: white;
}

.habit-manager-danger {
  border-color: rgba(185, 28, 28, 0.2);
  background: rgba(254, 242, 242, 0.94);
  color: rgb(185, 28, 28);
}

.habit-manager-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.habit-manager-row {
  display: flex;
  min-height: 4.5rem;
  align-items: center;
  gap: 0.85rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.35rem;
  background: rgba(250, 250, 250, 0.84);
  padding: 0.9rem 1rem;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.habit-manager-row:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.72);
  background: white;
  box-shadow: 0 12px 28px rgba(24, 24, 27, 0.06);
}

.habit-manager-row.is-selected {
  border-color: rgb(24 24 27);
  background: white;
  box-shadow: 0 16px 36px rgba(24, 24, 27, 0.08);
}

.habit-manager-checkbox {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  accent-color: rgb(24 24 27);
}

.dark .habit-manager-action,
.dark .habit-manager-link {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.84);
  color: white;
}

.dark .habit-manager-danger {
  border-color: rgba(239, 68, 68, 0.24);
  background: rgba(127, 29, 29, 0.24);
  color: rgb(254, 202, 202);
}

.dark .habit-manager-row {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.72);
}

.dark .habit-manager-row.is-selected {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
}
</style>
