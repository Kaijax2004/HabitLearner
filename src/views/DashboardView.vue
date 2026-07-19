<template>
  <AppLayout title="HabitLearner">
    <div class="space-y-5">
      <BaseCard class="relative overflow-visible border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
        <div class="absolute left-5 top-5 z-10">
          <div class="relative">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-white dark:hover:border-zinc-600"
              @click="toggleRangePopover"
            >
              <span>{{ periodLabel }}</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              v-if="showRangePopover"
              class="absolute left-0 top-full z-20 mt-3 w-[320px] rounded-[24px] border border-zinc-200 bg-white/96 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/96"
            >
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">选择统计周期</p>

              <div class="mt-3 grid grid-cols-2 gap-2">
                <button
                  v-for="option in rangeOptions"
                  :key="option.value"
                  type="button"
                  class="rounded-2xl border px-3 py-2 text-sm font-medium transition"
                  :class="selectedRange === option.value
                    ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600'"
                  @click="handleRangeOption(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>

              <div v-if="selectedRange === 'custom'" class="mt-4 space-y-3 rounded-[20px] border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div>
                  <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400">开始日期</label>
                  <input
                    v-model="customStartDate"
                    type="date"
                    class="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                  />
                </div>
                <div>
                  <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400">结束日期</label>
                  <input
                    v-model="customEndDate"
                    type="date"
                    class="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex-1 rounded-2xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    @click="closeRangePopover"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-2xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                    :disabled="isOverviewLoading"
                    @click="applyCustomRange"
                  >
                    {{ isOverviewLoading ? '加载中...' : '应用' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mx-auto max-w-6xl px-4 pb-4 pt-12 text-center sm:px-8">
          <h1 class="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-[3rem]">
            {{ greeting }}，{{ user?.name || '你' }}
          </h1>
          <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{{ currentDate }}</p>
          <p class="mx-auto mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {{ dashboardNarrative }}
          </p>

          <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="card in summaryCards"
              :key="card.label"
              class="rounded-[26px] border p-4 text-left transition dark:border-zinc-800/80"
              :class="card.panelClass"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-[11px] font-medium uppercase tracking-[0.18em]" :class="card.labelClass">{{ card.label }}</p>
                <span class="rounded-full px-2.5 py-1 text-[11px] font-medium" :class="card.badgeClass">{{ card.badge }}</span>
              </div>
              <p class="mt-4 text-[2rem] font-semibold tracking-tight" :class="card.valueClass">{{ card.value }}</p>
              <div class="mt-4 h-px bg-zinc-200/80 dark:bg-zinc-800/80" />
              <p class="mt-3 text-xs leading-5" :class="card.hintClass">{{ card.hint }}</p>
            </div>
          </div>

          <div class="mt-3 rounded-[28px] border border-zinc-200/80 bg-zinc-50/80 p-5 text-left dark:border-zinc-800 dark:bg-zinc-900/60">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">数据概览</p>
                <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">先看关键数字，再决定今天的节奏。</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-3">
                <div
                  v-for="item in dashboardHighlights"
                  :key="item.label"
                  class="flex items-center justify-between gap-3 rounded-[22px] border border-zinc-200/80 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/75"
                >
                  <div>
                    <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
                  </div>
                  <p class="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <section class="grid gap-5 xl:grid-cols-2 xl:items-start">
        <div ref="dashboardPrimaryColumnRef" class="space-y-5 xl:flex xl:flex-col">
          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">今日微学习</p>
                  <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">保持输入，也保持输出</h2>
                </div>
                <button
                  type="button"
                  class="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  @click="goToLearning"
                >
                  查看课程
                </button>
              </div>

              <div class="rounded-[28px] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="flex items-start gap-4">
                  <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-lg font-semibold text-zinc-950 dark:text-white">习惯、专注与时间管理</h3>
                    <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      先用文本微课程配合番茄钟做沉淀式学习，后续再接视频课程、主题学习和 AI 学习卡片也能自然延展。
                    </p>
                    <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span class="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">中文内容</span>
                      <span class="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">通用用户</span>
                      <span class="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">持续扩展中</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <div class="xl:h-[33.5rem] xl:min-h-0 xl:flex-none">
            <PomodoroWorkspace />
          </div>
        </div>

        <div class="min-h-0 xl:flex" :style="habitColumnStyle">
          <BaseCard padding="small" class="h-full w-full overflow-hidden border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <div class="flex h-full min-h-0 flex-col space-y-4 pt-2">
              <div class="flex flex-col gap-2.5 pb-0.5 sm:flex-row sm:items-start sm:justify-between">
                <div class="max-w-[28rem] space-y-1">
                  <h2 class="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">我的习惯</h2>
                  <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">右侧保持为主工作区，可直接查看进度、批量管理，或进入习惯详情继续完善。</p>
                </div>

                <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    v-if="selectedHabits.length > 0"
                    type="button"
                    class="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                    @click="showDeleteConfirm = true"
                  >
                    删除 {{ selectedHabits.length }} 项
                  </button>
                  <button
                    type="button"
                    class="rounded-2xl border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    @click="toggleEditMode"
                  >
                    {{ isEditMode ? '完成选择' : '批量编辑' }}
                  </button>
                  <router-link
                    to="/habit/create"
                    class="rounded-2xl bg-zinc-950 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                  >
                    新建习惯
                  </router-link>
                </div>
              </div>

              <div class="min-h-0 flex-1 overflow-hidden">
                <div class="h-full overflow-y-auto pr-0.5 habit-panel-scroll">
                  <div class="grid auto-rows-[9.25rem] grid-cols-1 gap-3 2xl:grid-cols-2">
                    <template v-if="habitStore.isLoading">
                      <div v-for="i in 4" :key="`habit-loading-${i}`" class="rounded-[28px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/75">
                        <div class="animate-pulse space-y-3">
                          <div class="flex items-center gap-2.5">
                            <div class="h-12 w-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                            <div class="flex-1 space-y-2">
                              <div class="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                              <div class="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                            <div class="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          </div>
                          <div class="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                      </div>
                    </template>

                    <template v-else-if="habitStore.habits.length">
                      <HabitCard
                        v-for="habit in habitStore.habits"
                        :key="habit.id"
                        :habit="habit"
                        :is-edit-mode="isEditMode"
                        :is-selected="selectedHabits.includes(habit.id)"
                        @click="handleHabitClick(habit.id)"
                        @complete="handleHabitComplete"
                        @select="handleHabitSelect"
                      />
                    </template>
                  </div>

                  <div
                    v-if="!habitStore.isLoading && !habitStore.habits.length"
                    class="rounded-[32px] border border-dashed border-zinc-200 bg-white/85 px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-950/75"
                  >
                    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                      <svg class="h-8 w-8 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6v12m6-6H6" />
                      </svg>
                    </div>
                    <h3 class="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">还没有习惯</h3>
                    <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">从一个最容易开始的习惯入手，先把第一条记录建立起来。</p>
                    <router-link
                      to="/habit/create"
                      class="mt-6 inline-flex rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                    >
                      创建第一个习惯
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">习惯统计</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">更多维度的习惯数据</h2>
              </div>
              <div class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                最高连击 {{ overview.habit.longestStreak }} 天
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="item in habitSummaryCards"
                :key="item.label"
                class="rounded-[20px] border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                <p class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
              </div>
            </div>

            <div class="rounded-[28px] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-zinc-700 dark:text-zinc-200">习惯完成稳定度</p>
                <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ overview.habit.consistencyRate }}%</p>
              </div>
              <div class="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div class="h-2 rounded-full bg-zinc-950 transition-all duration-300 dark:bg-white" :style="{ width: `${overview.habit.consistencyRate}%` }" />
              </div>
              <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                平均每天 {{ overview.habit.averageCheckInsPerDay }} 次打卡，提醒开启 {{ overview.habit.reminderEnabledCount }} 个，首次留言开启 {{ overview.habit.commentEnabledCount }} 个。
              </p>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div class="rounded-[28px] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">类型分布</p>
                <div class="mt-4 space-y-3">
                  <div v-for="item in overview.habit.categoryBreakdown" :key="item.name" class="space-y-1.5">
                    <div class="flex items-center justify-between gap-3 text-sm">
                      <span class="truncate text-zinc-700 dark:text-zinc-200">{{ item.name }}</span>
                      <span class="text-zinc-500 dark:text-zinc-400">{{ item.totalCount }} 次</span>
                    </div>
                    <div class="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div class="h-2 rounded-full bg-zinc-950 transition-all duration-300 dark:bg-white" :style="{ width: `${item.percent}%` }" />
                    </div>
                  </div>
                  <div v-if="!overview.habit.categoryBreakdown.length" class="text-sm text-zinc-500 dark:text-zinc-400">当前周期还没有分类数据。</div>
                </div>
              </div>

              <div class="rounded-[28px] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">表现排行</p>
                <div class="mt-4 space-y-3">
                  <div v-for="item in overview.habit.rankedHabits" :key="item.id" class="rounded-[20px] border border-zinc-200/70 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm font-medium text-zinc-950 dark:text-white">{{ item.name }}</p>
                        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ item.category }} · {{ item.frequency }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.totalCount }} 次</p>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.completionRate }}%</p>
                      </div>
                    </div>
                    <div class="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div class="h-2 rounded-full bg-emerald-500 transition-all duration-300" :style="{ width: `${Math.min(item.completionRate, 100)}%` }" />
                    </div>
                    <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">日均 {{ item.averagePerDay }} 次 · 连击 {{ item.streak }} 天</p>
                  </div>
                  <div v-if="!overview.habit.rankedHabits.length" class="text-sm text-zinc-500 dark:text-zinc-400">当前周期还没有习惯打卡记录。</div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">番茄钟统计</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">专注时间都去了哪里</h2>
              </div>
              <div class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                稳定度 {{ overview.pomodoro.focusConsistencyRate }}%
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="item in pomodoroSummaryCards"
                :key="item.label"
                class="rounded-[20px] border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                <p class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
              <div class="rounded-[32px] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">任务占比</p>
                    <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">按任务标题汇总当前周期的专注分布，悬停后可查看更细的明细。</p>
                  </div>
                  <div class="rounded-full border border-zinc-200/80 bg-white/90 px-3 py-1.5 text-right dark:border-zinc-800 dark:bg-zinc-950/70">
                    <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">任务数</p>
                    <p class="mt-0.5 text-sm font-semibold text-zinc-950 dark:text-white">{{ pomodoroChartItems.length || 0 }}</p>
                  </div>
                </div>

                <div class="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(220px,0.82fr)] xl:items-center">
                  <div class="flex items-center justify-center">
                    <div class="relative flex w-full max-w-[19rem] flex-col items-center">
                      <div
                        class="mb-4 min-h-[3.75rem] w-full max-w-[13rem] rounded-[999px] border border-white/70 bg-white/88 px-4 py-2 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-zinc-950/82"
                      >
                        <p class="truncate text-[11px] font-medium tracking-[0.05em] text-zinc-500 dark:text-zinc-400">
                          {{ activePomodoroTask?.title || '悬停环图查看任务' }}
                        </p>
                        <p class="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
                          {{ activePomodoroTask ? `${activePomodoroTask.percent}% · ${activePomodoroTask.focusHours} 小时` : '专注分布明细' }}
                        </p>
                      </div>

                      <div class="relative h-60 w-60">
                      <svg viewBox="0 0 240 240" class="h-full w-full overflow-visible">
                        <circle cx="120" cy="120" r="92" class="fill-none stroke-zinc-200/90 dark:stroke-zinc-800" stroke-width="28" />
                        <path
                          v-for="(item, index) in pomodoroChartItems"
                          :key="`${item.title}-${index}`"
                          :d="item.path"
                          :fill="item.color"
                          class="cursor-pointer transition-all duration-200"
                          :class="hoveredPomodoroSlice === index ? 'opacity-100 drop-shadow-[0_8px_18px_rgba(15,23,42,0.18)]' : 'opacity-92 hover:opacity-100'"
                          tabindex="0"
                          @mouseenter="setPomodoroHover(index)"
                          @mouseleave="setPomodoroHover(null)"
                          @focus="setPomodoroHover(index)"
                          @blur="setPomodoroHover(null)"
                        />
                      </svg>

                        <div class="absolute inset-[25%] rounded-full border border-zinc-200 bg-white/96 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-zinc-800 dark:bg-zinc-950/96" />
                        <div class="absolute inset-[25%] flex flex-col items-center justify-center text-center">
                          <p class="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">总专注</p>
                          <p class="mt-2 text-3xl font-semibold leading-tight text-zinc-950 dark:text-white">{{ overview.pomodoro.totalFocusHours }} 小时</p>
                          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{{ overview.pomodoro.totalPomodoros }} 个番茄</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="rounded-[24px] border border-zinc-200/70 bg-white/92 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/72">
                      <div class="flex items-center gap-3">
                        <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: activePomodoroTask?.color || '#18181b' }" />
                        <div class="min-w-0">
                          <p class="truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ activePomodoroTask?.title || '等待专注数据' }}</p>
                          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ activePomodoroTask ? '当前悬停任务的详细数据' : '开始一轮专注后，这里会显示任务详情' }}</p>
                        </div>
                      </div>

                      <div class="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div class="rounded-2xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900/80">
                          <p class="text-zinc-500 dark:text-zinc-400">占比</p>
                          <p class="mt-1 font-semibold text-zinc-950 dark:text-white">{{ activePomodoroTask?.percent || 0 }}%</p>
                        </div>
                        <div class="rounded-2xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900/80">
                          <p class="text-zinc-500 dark:text-zinc-400">时长</p>
                          <p class="mt-1 font-semibold text-zinc-950 dark:text-white">{{ activePomodoroTask?.focusHours || 0 }} 小时</p>
                        </div>
                        <div class="rounded-2xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900/80">
                          <p class="text-zinc-500 dark:text-zinc-400">会话</p>
                          <p class="mt-1 font-semibold text-zinc-950 dark:text-white">{{ activePomodoroTask?.sessionCount || 0 }} 次</p>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <div class="rounded-[20px] border border-zinc-200/70 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">上午 {{ formatHours(overview.pomodoro.focusTimeBuckets.morning) }} 小时</div>
                      <div class="rounded-[20px] border border-zinc-200/70 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">下午 {{ formatHours(overview.pomodoro.focusTimeBuckets.afternoon) }} 小时</div>
                      <div class="rounded-[20px] border border-zinc-200/70 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">晚上 {{ formatHours(overview.pomodoro.focusTimeBuckets.evening) }} 小时</div>
                      <div class="rounded-[20px] border border-zinc-200/70 bg-white/90 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">深夜 {{ formatHours(overview.pomodoro.focusTimeBuckets.night) }} 小时</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-[32px] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">明细排行</p>
                <div class="mt-4 space-y-3">
                  <div
                    v-for="(item, index) in pomodoroChartItems"
                    :key="item.title"
                    class="rounded-[20px] border bg-white/90 p-4 transition duration-200 dark:bg-zinc-950/70"
                    :class="hoveredPomodoroSlice === index ? 'border-zinc-900 shadow-[0_14px_32px_rgba(0,0,0,0.08)] dark:border-white' : 'border-zinc-200/70 dark:border-zinc-800'"
                    @mouseenter="setPomodoroHover(index)"
                    @mouseleave="setPomodoroHover(null)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
                          <p class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ item.title }}</p>
                        </div>
                        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ item.pomodoros }} 个番茄 · {{ item.sessionCount }} 次会话</p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.percent }}%</p>
                        <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.focusHours }} 小时</p>
                      </div>
                    </div>
                    <div class="mt-3 h-2 rounded-full bg-zinc-200/90 dark:bg-zinc-800">
                      <div class="h-2 rounded-full transition-all duration-300" :style="{ width: `${Math.min(item.percent, 100)}%`, backgroundColor: item.color }" />
                    </div>
                  </div>
                  <div v-if="!pomodoroChartItems.length" class="text-sm text-zinc-500 dark:text-zinc-400">开始使用番茄钟后，这里会自动按任务汇总。</div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[85] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="text-lg font-semibold text-zinc-950 dark:text-white">确认删除</h3>
          <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">你选择了 {{ selectedHabits.length }} 个习惯。删除后无法恢复，建议再确认一次。</p>

          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              @click="showDeleteConfirm = false"
            >
              取消
            </button>
            <button
              type="button"
              class="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500"
              @click="confirmDelete"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import HabitCard from '@/components/HabitCard.vue'
import PomodoroWorkspace from '@/components/PomodoroWorkspace.vue'
import * as statsAPI from '@/api/stats.js'
import { formatLocalDateKey } from '@/utils/date.js'

const createEmptyOverview = () => ({
  period: {
    range: 'today',
    label: '今日',
    startDate: formatLocalDateKey(),
    endDate: formatLocalDateKey(),
    dayCount: 1
  },
  habit: {
    totalHabits: 0,
    activeHabits: 0,
    totalCheckIns: 0,
    averageCheckInsPerDay: 0,
    consistencyRate: 0,
    longestStreak: 0,
    reminderEnabledCount: 0,
    commentEnabledCount: 0,
    rankedHabits: [],
    categoryBreakdown: []
  },
  pomodoro: {
    totalFocusSeconds: 0,
    totalFocusHours: 0,
    totalBreakSeconds: 0,
    totalBreakHours: 0,
    totalPomodoros: 0,
    sessionCount: 0,
    averageSessionFocusSeconds: 0,
    longestSessionFocusSeconds: 0,
    focusConsistencyRate: 0,
    streakDays: 0,
    focusTimeBuckets: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    },
    taskBreakdown: [],
    dailyTrend: []
  }
})

const POMODORO_RING_CONFIG = {
  centerX: 120,
  centerY: 120,
  outerRadius: 92,
  innerRadius: 64
}

const pomodoroPalette = [
  '#1f2937',
  '#0f766e',
  '#1d4ed8',
  '#b45309',
  '#9f1239',
  '#6d28d9',
  '#155e75',
  '#475569'
]

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  }
}

const describeDonutSegment = ({ startAngle, endAngle, outerRadius, innerRadius, centerX, centerY }) => {
  if (endAngle <= startAngle) return ''

  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle)
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle)
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle)
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z'
  ].join(' ')
}

const authStore = useAuthStore()
const habitStore = useHabitStore()
const router = useRouter()
const { success, error } = useToast()

const isEditMode = ref(false)
const selectedHabits = ref([])
const showDeleteConfirm = ref(false)
const selectedRange = ref('today')
const customStartDate = ref(formatLocalDateKey())
const customEndDate = ref(formatLocalDateKey())
const isOverviewLoading = ref(false)
const showRangePopover = ref(false)
const hoveredPomodoroSlice = ref(null)
const overview = reactive(createEmptyOverview())
const dashboardPrimaryColumnRef = ref(null)
const habitColumnHeight = ref('')

let dashboardPrimaryColumnObserver = null

const user = computed(() => authStore.user)
const periodLabel = computed(() => {
  if (selectedRange.value === 'custom') {
    return `${customStartDate.value} 至 ${customEndDate.value}`
  }

  return rangeOptions.find((option) => option.value === selectedRange.value)?.label || '今日'
})

const currentDate = computed(() => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}).format(new Date()))

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const rangeOptions = [
  { value: 'today', label: '今日' },
  { value: '7d', label: '最近 7 天' },
  { value: '30d', label: '最近 30 天' },
  { value: 'custom', label: '自定义' }
]

const formatHours = (seconds = 0) => Number((Number(seconds || 0) / 3600).toFixed(1))
const formatMinutes = (seconds = 0) => {
  const value = Math.max(0, Number(seconds || 0))
  const minutes = Math.round(value / 60)
  if (minutes >= 60) {
    return `${(value / 3600).toFixed(1).replace(/\.0$/, '')}`
  }
  return `${minutes}`
}

const applyOverview = (payload = {}) => {
  Object.assign(overview, createEmptyOverview(), payload || {})
  overview.habit = { ...createEmptyOverview().habit, ...(payload.habit || {}) }
  overview.pomodoro = { ...createEmptyOverview().pomodoro, ...(payload.pomodoro || {}) }
  overview.habit.categoryBreakdown = Array.isArray(payload.habit?.categoryBreakdown) ? payload.habit.categoryBreakdown : []
  overview.habit.rankedHabits = Array.isArray(payload.habit?.rankedHabits) ? payload.habit.rankedHabits : []
  overview.pomodoro.taskBreakdown = Array.isArray(payload.pomodoro?.taskBreakdown) ? payload.pomodoro.taskBreakdown : []
  overview.pomodoro.dailyTrend = Array.isArray(payload.pomodoro?.dailyTrend) ? payload.pomodoro.dailyTrend : []
  overview.pomodoro.focusTimeBuckets = {
    ...createEmptyOverview().pomodoro.focusTimeBuckets,
    ...(payload.pomodoro?.focusTimeBuckets || {})
  }
}

const loadOverview = async () => {
  isOverviewLoading.value = true

  try {
    const params = selectedRange.value === 'custom'
      ? {
          range: 'custom',
          startDate: customStartDate.value,
          endDate: customEndDate.value
        }
      : { range: selectedRange.value }

    const response = await statsAPI.getStatsOverview(params)

    if (!response.success) {
      throw new Error(response.error || '获取统计概览失败')
    }

    applyOverview(response.data || {})
  } catch (err) {
    error('统计加载失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isOverviewLoading.value = false
  }
}

const closeRangePopover = () => {
  showRangePopover.value = false
}

const toggleRangePopover = () => {
  showRangePopover.value = !showRangePopover.value
}

const handleRangeOption = async (value) => {
  selectedRange.value = value

  if (value === 'custom') {
    return
  }

  closeRangePopover()
  await loadOverview()
}

const applyCustomRange = async () => {
  if (!customStartDate.value || !customEndDate.value || customStartDate.value > customEndDate.value) {
    error('日期范围无效', {
      description: '请确认开始日期不晚于结束日期'
    })
    return
  }

  await loadOverview()
  closeRangePopover()
}

const summaryCards = computed(() => [
  {
    label: '习惯总数',
    value: overview.habit.totalHabits,
    hint: '当前周期内创建的习惯总量',
    badge: `${overview.habit.activeHabits} 个活跃`,
    panelClass: 'border-zinc-200/80 bg-white/92 dark:border-zinc-800/80 dark:bg-zinc-950/78',
    labelClass: 'text-zinc-500 dark:text-zinc-400',
    valueClass: 'text-zinc-950 dark:text-white',
    hintClass: 'text-zinc-500 dark:text-zinc-400',
    badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300'
  },
  {
    label: '周期打卡',
    value: overview.habit.totalCheckIns,
    hint: '本周期累计完成的打卡次数',
    badge: `${overview.habit.consistencyRate}% 稳定`,
    panelClass: 'border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800/80 dark:bg-zinc-900/60',
    labelClass: 'text-zinc-500 dark:text-zinc-400',
    valueClass: 'text-zinc-950 dark:text-white',
    hintClass: 'text-zinc-500 dark:text-zinc-400',
    badgeClass: 'bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  },
  {
    label: '专注时长',
    value: `${overview.pomodoro.totalFocusHours} 小时`,
    hint: '本周期累计专注投入',
    badge: `${overview.pomodoro.sessionCount} 次会话`,
    panelClass: 'border-emerald-200/60 bg-emerald-50/80 dark:border-emerald-500/25 dark:bg-emerald-500/10',
    labelClass: 'text-emerald-700 dark:text-emerald-300',
    valueClass: 'text-zinc-950 dark:text-white',
    hintClass: 'text-emerald-700/80 dark:text-emerald-200/80',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
  },
  {
    label: '番茄数量',
    value: overview.pomodoro.totalPomodoros,
    hint: '已累计完成的番茄数量',
    badge: `平均 ${formatMinutes(overview.pomodoro.averageSessionFocusSeconds)} 分钟`,
    panelClass: 'border-zinc-200/80 bg-white/92 dark:border-zinc-800/80 dark:bg-zinc-950/78',
    labelClass: 'text-zinc-500 dark:text-zinc-400',
    valueClass: 'text-zinc-950 dark:text-white',
    hintClass: 'text-zinc-500 dark:text-zinc-400',
    badgeClass: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300'
  }
])

const dashboardHighlights = computed(() => [
  {
    label: '习惯稳定度',
    value: `${overview.habit.consistencyRate}%`,
    hint: '稳定打卡率'
  },
  {
    label: '最长连击',
    value: `${overview.habit.longestStreak} 天`,
    hint: '连续打卡最高天数'
  },
  {
    label: '今日总览',
    value: `${overview.habit.totalCheckIns} / ${overview.pomodoro.totalPomodoros}`,
    hint: '习惯 / 专注合计'
  }
])

const habitSummaryCards = computed(() => [
  {
    label: '活跃习惯',
    value: overview.habit.activeHabits,
    hint: '当前仍在执行'
  },
  {
    label: '提醒开启',
    value: overview.habit.reminderEnabledCount,
    hint: '启用提醒的习惯'
  },
  {
    label: '留言开启',
    value: overview.habit.commentEnabledCount,
    hint: '启用首次留言'
  },
  {
    label: '平均打卡',
    value: overview.habit.averageCheckInsPerDay,
    hint: '每天平均次数'
  }
])

const pomodoroSummaryCards = computed(() => [
  {
    label: '会话数',
    value: overview.pomodoro.sessionCount,
    hint: '已记录专注会话'
  },
  {
    label: '稳定度',
    value: `${overview.pomodoro.focusConsistencyRate}%`,
    hint: '连续专注稳定'
  },
  {
    label: '单次最长',
    value: `${formatMinutes(overview.pomodoro.longestSessionFocusSeconds)} 分钟`,
    hint: '最长单次专注'
  },
  {
    label: '平均时长',
    value: `${formatMinutes(overview.pomodoro.averageSessionFocusSeconds)} 分钟`,
    hint: '每次平均专注'
  }
])

const dashboardNarrative = computed(() => {
  const { totalHabits, totalCheckIns, consistencyRate } = overview.habit
  const { totalFocusHours, totalPomodoros } = overview.pomodoro

  if (totalHabits === 0 && totalPomodoros === 0) {
    return '先从今天开始建立记录，关键数字会慢慢完整起来。'
  }

  return `本周期共记录 ${totalCheckIns} 次打卡、${totalFocusHours} 小时专注、${totalPomodoros} 个番茄，整体稳定度 ${consistencyRate}%。`
})

const pomodoroChartItems = computed(() => {
  const items = (overview.pomodoro.taskBreakdown || []).filter((item) => Number(item.percent || 0) > 0)

  if (!items.length) {
    return []
  }

  const totalPercent = items.reduce((sum, item) => sum + Math.max(Number(item.percent || 0), 0), 0) || 100
  let cursor = 0

  return items.map((item, index) => {
    const normalizedPercent = (Math.max(Number(item.percent || 0), 0) / totalPercent) * 100
    const spanAngle = normalizedPercent * 3.6
    const gapAngle = items.length > 1 ? Math.min(3, spanAngle * 0.2) : 0
    const startAngle = cursor + gapAngle / 2
    const endAngle = cursor + spanAngle - gapAngle / 2
    const color = pomodoroPalette[index % pomodoroPalette.length]

    cursor += spanAngle

    return {
      ...item,
      color,
      path: describeDonutSegment({
        startAngle,
        endAngle,
        ...POMODORO_RING_CONFIG
      })
    }
  })
})

const topPomodoroTask = computed(() => pomodoroChartItems.value[0] || null)
const activePomodoroTask = computed(() => pomodoroChartItems.value[hoveredPomodoroSlice.value] || topPomodoroTask.value || null)
const habitColumnStyle = computed(() => (habitColumnHeight.value ? { height: habitColumnHeight.value } : {}))

const syncHabitColumnHeight = async () => {
  await nextTick()

  if (typeof window === 'undefined') {
    return
  }

  if (window.innerWidth < 1280) {
    habitColumnHeight.value = ''
    return
  }

  const primaryColumnElement = dashboardPrimaryColumnRef.value
  if (!primaryColumnElement) {
    habitColumnHeight.value = ''
    return
  }

  habitColumnHeight.value = `${Math.ceil(primaryColumnElement.getBoundingClientRect().height)}px`
}

const setPomodoroHover = (index) => {
  hoveredPomodoroSlice.value = Number.isInteger(index) ? index : null
}

const goToHabitDetail = (habitId) => {
  router.push(`/habit/${habitId}`)
}

const goToLearning = () => {
  router.push('/learning')
}

const handleHabitComplete = async () => {
  await loadOverview()
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    selectedHabits.value = []
  }
}

const handleHabitClick = (habitId) => {
  if (isEditMode.value) {
    handleHabitSelect(habitId)
    return
  }

  goToHabitDetail(habitId)
}

const handleHabitSelect = (habitId) => {
  const index = selectedHabits.value.indexOf(habitId)
  if (index >= 0) selectedHabits.value.splice(index, 1)
  else selectedHabits.value.push(habitId)
}

const confirmDelete = async () => {
  try {
    const result = await habitStore.deleteHabits(selectedHabits.value)

    if (!result.success) {
      throw new Error(result.error || '删除失败')
    }

    const deletedCount = result.deletedCount || selectedHabits.value.length
    selectedHabits.value = []
    isEditMode.value = false
    showDeleteConfirm.value = false

    await Promise.all([habitStore.fetchHabits(), loadOverview()])

    success('删除成功', {
      description: `已删除 ${deletedCount} 个习惯`
    })
  } catch (err) {
    error('删除失败', {
      description: err.message || '请稍后重试'
    })
  }
}

onMounted(async () => {
  await Promise.all([habitStore.fetchHabits(), loadOverview()])

  await syncHabitColumnHeight()

  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
    return
  }

  const primaryColumnElement = dashboardPrimaryColumnRef.value
  if (!primaryColumnElement) {
    return
  }

  dashboardPrimaryColumnObserver = new ResizeObserver(() => {
    syncHabitColumnHeight()
  })
  dashboardPrimaryColumnObserver.observe(primaryColumnElement)
  window.addEventListener('resize', syncHabitColumnHeight)
})

onBeforeUnmount(() => {
  dashboardPrimaryColumnObserver?.disconnect()
  dashboardPrimaryColumnObserver = null

  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncHabitColumnHeight)
  }
})
</script>

<style scoped>
.habit-panel-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(113, 113, 122, 0.45) transparent;
  scrollbar-gutter: stable both-edges;
  overscroll-behavior: contain;
  padding-bottom: 0.25rem;
}

.habit-panel-scroll::-webkit-scrollbar {
  width: 8px;
}

.habit-panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.habit-panel-scroll::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(113, 113, 122, 0.35);
}
</style>
