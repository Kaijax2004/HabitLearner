<template>
  <AppLayout title="今日">
    <div class="space-y-5">
      <BaseCard class="relative overflow-visible border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
        <div class="w-full px-0 py-1">
          <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-stretch">
            <div class="flex h-full max-w-3xl flex-col justify-center gap-3 text-left xl:py-3">
              <span class="inline-flex rounded-full border border-zinc-200/90 bg-white/92 px-3.5 py-1.5 text-xs font-medium text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
                {{ currentDate }}
              </span>
              <h1 class="mt-1 text-[2.2rem] font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-[2.6rem]">
                {{ dashboardGreeting }}
              </h1>
              <p class="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {{ dashboardNarrative }}
              </p>
            </div>

            <div class="grid h-full min-h-[11rem] overflow-hidden rounded-[24px] border border-zinc-200/80 bg-zinc-200/80 shadow-sm xl:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
              <div
                v-for="item in dashboardHighlights"
                :key="item.label"
                class="flex min-h-[9.5rem] min-w-0 flex-col justify-between bg-white/94 px-5 py-4 text-left dark:bg-zinc-950/80"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <div class="mt-2">
                  <p class="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ item.value }}</p>
                  <p class="mt-1 truncate text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <section class="grid gap-5 xl:grid-cols-2 xl:items-stretch">
        <BaseCard padding="small" class="h-full min-h-0 w-full overflow-hidden border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="flex h-full min-h-0 flex-col gap-4 px-1 py-1">
            <div class="flex items-start justify-between gap-4 px-2 pt-2">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Habits</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">今日习惯预览</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">先完成今天最小的一步，也可以进入对应习惯工作区继续记录。</p>
              </div>
              <div class="flex shrink-0 gap-2">
                <button
                  type="button"
                  class="rounded-2xl border border-zinc-200/80 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
                  @click="openHabitManager"
                >
                  习惯管理
                </button>
                <button
                  type="button"
                  class="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
                  @click="goToTracks"
                >
                  查看轨道
                </button>
              </div>
            </div>

            <div class="habit-panel-scroll min-h-[18rem] flex-1 overflow-y-auto px-2 pb-2 pr-1" @wheel.stop>
              <template v-if="habitStore.isLoading">
                <div class="space-y-2">
                  <div v-for="index in 6" :key="index" class="h-16 animate-pulse rounded-[1.2rem] bg-zinc-100 dark:bg-zinc-900"></div>
                </div>
              </template>

              <template v-else-if="todayHabitPreview.length">
                <div class="space-y-2">
                  <div
                    v-for="habit in todayHabitPreview"
                    :key="habit.id"
                    class="habit-preview-row group"
                  >
                    <button
                      type="button"
                      class="habit-preview-main"
                      @click="goToHabitDetail(habit.id)"
                    >
                      <span class="habit-preview-dot" :style="{ backgroundColor: habit.color || '#18181b' }"></span>
                      <span class="min-w-0 flex-1 text-left">
                        <span class="block truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ habit.name }}</span>
                        <span class="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                          {{ habit.count }}/{{ habit.target }} · 连续 {{ habit.streak || 0 }} 天
                        </span>
                      </span>
                    </button>
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-semibold"
                      :class="habit.done ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'"
                    >
                      {{ habit.done ? '已完成' : '待完成' }}
                    </span>
                    <button
                      type="button"
                      class="habit-quick-check"
                      :class="{ 'is-completed': habit.done }"
                      :disabled="habit.done || checkingHabitId === habit.id"
                      @click.stop="quickCheckIn(habit)"
                    >
                      {{ checkingHabitId === habit.id ? '打卡中' : habit.done ? '已打卡' : '快捷打卡' }}
                    </button>
                    <button
                      type="button"
                      class="habit-preview-enter"
                      title="进入习惯工作区"
                      @click="goToHabitDetail(habit.id)"
                    >
                      →
                    </button>
                  </div>
                </div>
              </template>

              <div v-else class="flex h-full min-h-[16rem] items-center justify-center rounded-[1.5rem] border border-dashed border-zinc-200 bg-zinc-50 text-center dark:border-zinc-800 dark:bg-white/5">
                <div>
                  <p class="text-base font-semibold text-zinc-950 dark:text-white">还没有习惯</p>
                  <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">先创建一个最容易坚持的小习惯。</p>
                  <button
                    type="button"
                    class="mt-4 rounded-2xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
                    @click="router.push('/habit/create')"
                  >
                    创建习惯
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Workspace</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">进入对应工作区</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">从今日状态直接进入习惯、学习、专注、计划和复盘工作区。</p>
              </div>
            </div>

            <div class="grid gap-3">
              <div
                v-for="group in workspaceEntranceGroups"
                :key="group.label"
                class="workspace-entrance-group"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{{ group.kicker }}</p>
                    <h3 class="mt-1 text-base font-semibold text-zinc-950 dark:text-white">{{ group.label }}</h3>
                  </div>
                  <span class="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {{ group.items.length }} 个入口
                  </span>
                </div>
                <div class="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    v-for="entry in group.items"
                    :key="entry.title"
                    type="button"
                    class="workspace-entrance-link group"
                    @click="entry.action"
                  >
                    <span class="rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-zinc-950">{{ entry.badge }}</span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-sm font-semibold text-zinc-950 dark:text-white">{{ entry.title }}</span>
                      <span class="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">{{ entry.description }}</span>
                    </span>
                    <span class="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-950 dark:group-hover:text-white">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="today-ai-center">
        <div class="today-ai-orb" aria-hidden="true">
          <span>AI</span>
        </div>
        <div class="today-ai-copy">
          <p class="today-ai-kicker">Xizhi Intelligence</p>
          <h2>AI 今日建议中心</h2>
          <p>{{ todayAiBrief }}</p>
        </div>
        <div class="today-ai-grid">
          <article v-for="card in todayAiCards" :key="card.label" class="today-ai-card">
            <span>{{ card.label }}</span>
            <strong>{{ card.title }}</strong>
            <p>{{ card.description }}</p>
          </article>
        </div>
        <div class="today-ai-actions">
          <button type="button" class="today-ai-primary" :disabled="todayAiLoading" @click="generateTodayAiAdvice">
            {{ todayAiLoading ? '生成中' : '生成 AI 建议' }}
          </button>
          <button v-if="todayAiErrorCode === 'AI_NOT_CONFIGURED'" type="button" class="today-ai-secondary" @click="router.push('/profile/ai-providers')">
            配置供应商
          </button>
          <span class="today-ai-status">{{ todayAiStatusText }}</span>
        </div>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Current Truth</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">今日工作台</h2>
              </div>
              <div class="rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {{ workspaceToday?.currentTruth?.generatedAt ? '已同步今日状态' : '等待同步' }}
              </div>
            </div>

            <div v-if="workspaceError" class="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {{ workspaceError }}
            </div>

            <div class="rounded-[1.6rem] bg-zinc-50 p-5 dark:bg-white/5">
              <p class="text-sm leading-7 text-zinc-700 dark:text-zinc-200">
                {{ workspaceToday?.currentTruth?.summary || '正在整理你的今日状态。' }}
              </p>
              <p class="mt-3 text-sm font-medium text-zinc-950 dark:text-white">
                {{ workspaceToday?.currentTruth?.focusSuggestion || '建议先完成一个最小行动，再进入下一轮专注。' }}
              </p>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div
                v-for="item in workspaceStatusCards"
                :key="item.label"
                class="rounded-[1.4rem] border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                <p class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ item.value }}</p>
                <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
              </div>
            </div>

            <div class="workspace-advice-panel">
              <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Local Intelligence</p>
                  <h3 class="mt-2 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">智能建议</h3>
                  <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">基于真实记录生成，本地兜底，不依赖远程 AI 服务。</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="mode in adviceModes"
                    :key="mode.id"
                    type="button"
                    class="workspace-advice-tab"
                    :class="{ 'is-active': activeAdviceMode === mode.id }"
                    @click="activeAdviceMode = mode.id"
                  >
                    {{ mode.label }}
                  </button>
                </div>
              </div>

              <div class="mt-4 grid gap-3">
                <div
                  v-for="item in activeAdviceItems"
                  :key="`${activeAdviceMode}-${item.title}`"
                  class="workspace-advice-item"
                >
                  <div class="flex min-w-0 flex-1 gap-3">
                    <span class="workspace-advice-index">{{ item.index }}</span>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
                      <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.description }}</p>
                    </div>
                  </div>
                  <div class="workspace-advice-actions">
                    <button
                      type="button"
                      class="workspace-advice-action workspace-advice-action-secondary"
                      :disabled="capturingAdviceKey === adviceItemKey(item)"
                      @click="captureAdvice(item)"
                    >
                      {{ capturingAdviceKey === adviceItemKey(item) ? '采纳中' : '采纳' }}
                    </button>
                    <button
                      v-if="item.action"
                      type="button"
                      class="workspace-advice-action"
                      @click="item.action"
                    >
                      {{ item.actionLabel }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-base font-semibold text-zinc-950 dark:text-white">今日重点</h3>
                <button type="button" class="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" @click="loadWorkspaceToday">
                  {{ isWorkspaceLoading ? '同步中' : '刷新' }}
                </button>
              </div>
              <div class="mt-3 grid gap-2">
                <div
                  v-for="action in workspaceActions"
                  :key="`${action.type}-${action.title}`"
                  class="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/75 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/55 dark:text-zinc-200"
                >
                  <span class="h-2 w-2 rounded-full bg-zinc-950 dark:bg-white"></span>
                  <span>{{ action.title }}</span>
                </div>
              </div>
            </div>

            <div v-if="workspaceRisks.length" class="workspace-risk-panel">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Risk Radar</p>
                  <h3 class="mt-1 text-base font-semibold text-zinc-950 dark:text-white">今日风险</h3>
                </div>
                <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
                  {{ workspaceRisks.length }} 条
                </span>
              </div>
              <div class="mt-3 grid gap-2">
                <p
                  v-for="risk in workspaceRisks"
                  :key="`${risk.type}-${risk.title}`"
                  class="rounded-2xl border border-amber-100 bg-white/75 px-4 py-3 text-sm leading-6 text-zinc-700 dark:border-amber-500/20 dark:bg-zinc-900/55 dark:text-zinc-200"
                >
                  {{ risk.title }}
                </p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="text-base font-semibold text-zinc-950 dark:text-white">今日计划任务</h3>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">来自计划编辑器中已经安排到今天的执行块。</p>
                </div>
                <span class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {{ todayScheduleBlocks.length }} 项
                </span>
              </div>

              <div v-if="todayScheduleBlocks.length" class="mt-3 space-y-2">
                <article
                  v-for="item in todayScheduleBlocks"
                  :key="`today-schedule-${item.id}`"
                  class="rounded-[1.35rem] border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="scheduleStatusClass(item.status)">
                          {{ scheduleStatusLabel(item.status) }}
                        </span>
                        <span class="text-xs text-zinc-500 dark:text-zinc-400">
                          {{ formatScheduleMeta(item) }}
                        </span>
                      </div>
                      <p class="mt-2 truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
                      <p v-if="item.plan?.title" class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        所属计划：{{ item.plan.title }}
                      </p>
                    </div>

                    <div class="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        v-if="item.status !== 'in_progress' && item.status !== 'completed' && item.status !== 'skipped'"
                        type="button"
                        class="workspace-schedule-button"
                        :disabled="updatingScheduleId === item.id"
                        @click="changeScheduleStatus(item, 'in_progress')"
                      >
                        开始
                      </button>
                      <button
                        v-if="item.status !== 'completed'"
                        type="button"
                        class="workspace-schedule-button workspace-schedule-button-complete"
                        :disabled="updatingScheduleId === item.id"
                        @click="changeScheduleStatus(item, 'completed')"
                      >
                        完成
                      </button>
                      <button
                        v-if="item.status !== 'skipped' && item.status !== 'completed'"
                        type="button"
                        class="workspace-schedule-button workspace-schedule-button-muted"
                        :disabled="updatingScheduleId === item.id"
                        @click="changeScheduleStatus(item, 'skipped')"
                      >
                        跳过
                      </button>
                    </div>
                  </div>
                </article>
              </div>

              <div v-else class="mt-3 rounded-[1.35rem] border border-dashed border-zinc-200/90 bg-white/60 px-4 py-5 text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/35 dark:text-zinc-400">
                今天还没有安排计划任务。可以在计划编辑器里打开“待安排池”，把具体计划块安排到今天。
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">72 Hours</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">接下来 72 小时</h2>
            </div>

            <div class="space-y-3">
              <div
                v-for="day in workspaceSeventyTwoDays"
                :key="day.date"
                class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ day.label }}</p>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ day.date }}</p>
                  </div>
                  <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {{ (day.plans?.length || 0) + (day.scheduleBlocks?.length || 0) }} 项
                  </p>
                </div>
                <div class="mt-3 space-y-2">
                  <p
                    v-for="item in dayPreviewItems(day)"
                    :key="item.key"
                    class="truncate rounded-2xl bg-white px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-950/60 dark:text-zinc-300"
                  >
                    {{ item.title }}
                  </p>
                  <p v-if="!dayPreviewItems(day).length" class="text-xs text-zinc-400">暂无明确安排</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="flex h-full flex-col gap-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Inbox</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">收集箱收口</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  今日页只保留入口，完整记录、转换和归档都进入收集箱处理。
                </p>
              </div>
              <span class="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                {{ pendingCaptureCount }} 待处理
              </span>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <p class="text-xs text-zinc-500 dark:text-zinc-400">最近收集</p>
                <p class="mt-2 line-clamp-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">
                  {{ latestCaptureText }}
                </p>
              </div>
              <div class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <p class="text-xs text-zinc-500 dark:text-zinc-400">处理原则</p>
                <p class="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">
                  先收下，再判断转计划、学习笔记、习惯备注或归档。
                </p>
              </div>
            </div>

            <button class="workspace-primary-button w-full sm:w-auto sm:self-start" type="button" @click="goToCaptures">
              打开收集箱
            </button>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="flex h-full flex-col gap-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Review</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">今日复盘收口</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  复盘作为今日的结束动作，完整记录放在复盘工作区完成。
                </p>
              </div>
              <span class="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                {{ workspaceToday?.latestReview ? '已记录' : '待复盘' }}
              </span>
            </div>

            <div class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
              <p class="text-xs text-zinc-500 dark:text-zinc-400">今日收束</p>
              <p class="mt-2 text-sm leading-7 text-zinc-800 dark:text-zinc-100">{{ reviewSummaryLine }}</p>
            </div>

            <div class="mt-auto flex flex-col gap-3 sm:flex-row">
              <button class="workspace-primary-button" type="button" @click="goToReview">
                打开复盘工作区
              </button>
              <button class="workspace-secondary-button" type="button" @click="loadWorkspaceToday">
                {{ isWorkspaceLoading ? '同步中' : '刷新今日状态' }}
              </button>
            </div>
          </div>
        </BaseCard>
      </section>

    </div>

    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showHabitManager"
          class="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          @click.self="closeHabitManager"
        >
          <div class="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white/96 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950/96">
            <div class="flex items-start justify-between gap-4 border-b border-zinc-200/80 px-5 py-5 dark:border-zinc-800">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Habit Manager</p>
                <h3 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">习惯管理</h3>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">可以在这里新增习惯、全选后批量删除，或者直接进入单个习惯详情。</p>
              </div>
              <button
                type="button"
                class="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
                @click="closeHabitManager"
              >
                关闭
              </button>
            </div>

            <div class="space-y-4 p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="habit-manager-action" @click="goToHabitCreate">新增习惯</button>
                  <button type="button" class="habit-manager-action" :disabled="!managerHabits.length" @click="toggleSelectAllHabits">
                    {{ isAllHabitsSelected ? '取消全选' : '全选' }}
                  </button>
                  <button
                    type="button"
                    class="habit-manager-danger"
                    :disabled="!selectedHabitIds.length || deletingSelectedHabits"
                    @click="deleteSelectedHabits"
                  >
                    {{ deletingSelectedHabits ? '删除中...' : `删除 ${selectedHabitIds.length} 个` }}
                  </button>
                </div>
                <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  已选 {{ selectedHabitIds.length }} / {{ managerHabits.length }}
                </div>
              </div>

              <div v-if="!managerHabits.length" class="rounded-[1.6rem] border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-10 text-center dark:border-zinc-800 dark:bg-white/5">
                <p class="text-base font-semibold text-zinc-950 dark:text-white">还没有习惯</p>
                <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">先创建一个最容易坚持的小习惯，再回来批量管理。</p>
                <button type="button" class="habit-manager-primary mt-4" @click="goToHabitCreate">创建习惯</button>
              </div>

              <div v-else class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                <label
                  v-for="habit in managerHabits"
                  :key="habit.id"
                  class="habit-manager-row"
                  :class="{ 'is-selected': selectedHabitIds.includes(habit.id) }"
                >
                  <input
                    type="checkbox"
                    class="habit-manager-checkbox"
                    :checked="selectedHabitIds.includes(habit.id)"
                    @change="toggleHabitSelection(habit.id)"
                  />
                  <span class="habit-preview-dot" :style="{ backgroundColor: habit.color || '#18181b' }"></span>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="truncate text-sm font-semibold text-zinc-950 dark:text-white">{{ habit.name }}</span>
                      <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                        {{ habit.frequency === 'daily' ? '每日' : '每周' }}
                      </span>
                      <span
                        class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        :class="habit.done ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'"
                      >
                        {{ habit.done ? '已完成' : '待完成' }}
                      </span>
                    </div>
                    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {{ habit.count }}/{{ habit.target }} · 连续 {{ habit.streak || 0 }} 天
                    </p>
                  </div>
                  <button type="button" class="habit-manager-link" @click="openHabitDetailFromManager(habit.id)">
                    查看
                  </button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHabitStore } from '@/stores/habit'
import { useToast } from '@/composables/useToast'
import { useWorkspaceAiStore } from '@/stores/workspaceAi'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { chatWithMascotAssistant, createQuickCapture, getWorkspaceToday } from '@/api/workspace.js'
import { updateScheduleBlock } from '@/api/scheduleBlocks.js'

const authStore = useAuthStore()
const habitStore = useHabitStore()
const workspaceAiStore = useWorkspaceAiStore()
const router = useRouter()
const { success, error } = useToast()

const activeAdviceMode = ref('priority')
const workspaceToday = ref(null)
const workspaceError = ref('')
const isWorkspaceLoading = ref(false)
const updatingScheduleId = ref(null)
const capturingAdviceKey = ref('')
const todayAiLoading = ref(false)
const todayAiRemoteAdvice = ref(null)
const todayAiErrorCode = ref('')
const todayAiErrorMessage = ref('')

const user = computed(() => authStore.user)

const workspaceStatusCards = computed(() => {
  const status = workspaceToday.value?.statusBar || {}
  return [
    {
      label: '稳定度',
      value: `${status.stability || 0}%`,
      hint: '综合习惯、专注和计划推进'
    },
    {
      label: '今日专注',
      value: `${status.focusMinutes || 0} 分钟`,
      hint: `${workspaceToday.value?.focus?.completedPomodoros || 0} 个番茄`
    },
    {
      label: '今日计划',
      value: status.todayPlanCount || 0,
      hint: `${status.habitCompleted || 0}/${status.habitTotal || 0} 个习惯已完成`
    }
  ]
})

const workspaceActions = computed(() => workspaceToday.value?.currentTruth?.nextActions || [])
const workspaceRisks = computed(() => workspaceToday.value?.currentTruth?.risks || [])
const workspaceSeventyTwoDays = computed(() => workspaceToday.value?.seventyTwoHours?.days || [])
const workspaceCaptures = computed(() => workspaceToday.value?.captures || [])
const workspaceTracks = computed(() => workspaceToday.value?.tracks?.items || [])
const primaryWorkspaceTrack = computed(() => workspaceTracks.value[0] || null)
const todayScheduleBlocks = computed(() => workspaceToday.value?.plans?.scheduleBlocks || [])
const showHabitManager = ref(false)
const selectedHabitIds = ref([])
const deletingSelectedHabits = ref(false)
const checkingHabitId = ref(null)
const todayHabitPreview = computed(() => {
  const workspaceItems = workspaceToday.value?.habits?.items
  if (Array.isArray(workspaceItems) && workspaceItems.length) return workspaceItems

  return habitStore.habits.slice(0, 8).map((habit) => {
    const target = Math.max(1, Number(habit.target || 1))
    const count = Number(habit.todayCount || 0)
    return {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      target,
      count,
      done: count >= target,
      streak: Number(habit.streak || 0)
    }
  })
})
const managerHabits = computed(() => habitStore.habits.map((habit) => {
  const target = Math.max(1, Number(habit.target || 1))
  const count = Number(habit.todayCount || 0)
  return {
    ...habit,
    target,
    count,
    done: count >= target,
    streak: Number(habit.streak || 0)
  }
}))
const isAllHabitsSelected = computed(() => managerHabits.value.length > 0 && selectedHabitIds.value.length === managerHabits.value.length)
const pendingCaptureCount = computed(() => workspaceCaptures.value.filter((capture) => capture.status === 'pending').length)
const latestCaptureText = computed(() => {
  const latest = workspaceCaptures.value[0]
  return latest?.content || '暂无临时收集。想到任务、灵感或学习问题时，可以进入收集箱统一处理。'
})
const reviewSummaryLine = computed(() => {
  const latestReview = workspaceToday.value?.latestReview
  if (!latestReview) return '今天还没有复盘记录。建议在结束前写下完成了什么、卡住什么和明天第一步。'

  const nextStep = latestReview.next_step || latestReview.nextStep
  if (nextStep) return `明天第一步：${nextStep}`
  if (latestReview.completed) return `今日完成：${latestReview.completed}`
  return '已有今日复盘记录，可以进入复盘工作区继续补充。'
})
const adviceModes = [
  { id: 'priority', label: '先做什么' },
  { id: 'risk', label: '哪里掉队' },
  { id: 'focus30', label: '30 分钟安排' }
]
const pendingScheduleBlocks = computed(() => todayScheduleBlocks.value.filter((item) => !['completed', 'skipped'].includes(item.status)))
const nextScheduleBlock = computed(() => pendingScheduleBlocks.value[0] || null)
const recommendedFocusTitle = computed(() => {
  const action = workspaceActions.value[0]
  if (action?.title) return action.title
  if (pendingCaptureCount.value > 0) return '清理一个收集箱条目'
  if (incompleteHabitCount.value > 0) return '完成一个未打卡习惯'
  return '推进一个最小行动'
})
const incompleteHabitCount = computed(() => {
  const status = workspaceToday.value?.statusBar || {}
  return Math.max(Number(status.habitTotal || 0) - Number(status.habitCompleted || 0), 0)
})
const seventyTwoHourTaskCount = computed(() => workspaceSeventyTwoDays.value.reduce((sum, day) => {
  return sum + (day.plans?.length || 0) + (day.scheduleBlocks?.length || 0)
}, 0))
const activeAdviceItems = computed(() => {
  const status = workspaceToday.value?.statusBar || {}
  const focusMinutes = Number(status.focusMinutes || 0)
  const stability = Number(status.stability || 0)
  const schedule = nextScheduleBlock.value

  const build = (items) => items.map((item, index) => ({ index: index + 1, ...item })).slice(0, 3)

  if (activeAdviceMode.value === 'risk') {
    return build([
      stability < 60
        ? {
            title: '今日稳定度偏低',
            description: `当前稳定度 ${stability}%，优先补一个最小行动，比继续规划更能拉回节奏。`,
            actionLabel: incompleteHabitCount.value ? '处理习惯' : '看计划',
            action: incompleteHabitCount.value ? goToTracks : goToPlan
          }
        : {
            title: '稳定度暂时安全',
            description: `当前稳定度 ${stability}%，今天更适合推进一个中等难度任务。`,
            actionLabel: '进入计划',
            action: goToPlan
          },
      seventyTwoHourTaskCount.value > 0
        ? {
            title: '72 小时内已有明确事项',
            description: `未来 72 小时共有 ${seventyTwoHourTaskCount.value} 项计划或日程，建议先确认最早一项是否可执行。`,
            actionLabel: '查看计划',
            action: goToPlan
          }
        : {
            title: '短期压力较轻',
            description: '未来 72 小时没有明显堆积，可以主动安排一个长期目标的小步骤。',
            actionLabel: '看轨道',
            action: goToTracks
          },
      pendingCaptureCount.value > 0
        ? {
            title: '收集箱有待处理内容',
            description: `${pendingCaptureCount.value} 条内容还没归类，容易变成隐性压力。`,
            actionLabel: '清理收集箱',
            action: goToCaptures
          }
        : {
            title: '收集箱暂时清爽',
            description: '临时想法没有明显堆积，保持随手收集、定时处理即可。',
            actionLabel: '打开收集箱',
            action: goToCaptures
          }
    ])
  }

  if (activeAdviceMode.value === 'focus30') {
    const targetTitle = schedule?.title || recommendedFocusTitle.value
    return build([
      {
        title: '前 5 分钟：明确边界',
        description: targetTitle ? `只确认“${targetTitle}”这件事的完成标准，不继续扩写范围。` : '先写下一个今天能完成的小动作，不要从大计划开始。',
        actionLabel: schedule ? '开始任务' : '进入计划',
        action: schedule ? () => changeScheduleStatus(schedule, 'in_progress') : goToPlan
      },
      {
        title: '中间 20 分钟：进入专注',
        description: focusMinutes > 0 ? `今天已经专注 ${focusMinutes} 分钟，可以继续接一轮短专注。` : '先开一轮短专注，把状态带起来。',
        actionLabel: '专注工作区',
        action: goToFocus
      },
      {
        title: '最后 5 分钟：留下记录',
        description: '写下一句完成情况或卡点，让明天的 Current Truth 有依据。',
        actionLabel: '写复盘',
        action: goToReview
      }
    ])
  }

  return build([
    schedule
      ? {
          title: `先推进：${schedule.title}`,
          description: `它已经安排到今天，${formatScheduleMeta(schedule)}，比重新挑任务更省启动成本。`,
          actionLabel: '开始',
          action: () => changeScheduleStatus(schedule, 'in_progress')
        }
      : {
          title: '先安排一个计划块',
          description: '今天还没有明确日程任务，建议从待安排池挑一个可以完成的小块。',
          actionLabel: '进入计划',
          action: goToPlan
        },
    incompleteHabitCount.value > 0
      ? {
          title: `补齐 ${incompleteHabitCount.value} 个未完成习惯`,
          description: '先完成最容易的一项，让今日稳定度有一个确定增量。',
          actionLabel: '看习惯',
          action: goToTracks
        }
      : {
          title: '习惯节奏已稳定',
          description: '今天的习惯压力较轻，可以把精力切到学习、计划或复盘。',
          actionLabel: '看轨道',
          action: goToTracks
        },
    focusMinutes < 20
      ? {
          title: '补一轮短专注',
          description: '今日专注还没达到一轮完整番茄，建议用 20 分钟启动。',
          actionLabel: '开始专注',
          action: goToFocus
        }
      : {
          title: '专注已经启动',
          description: `今天已有 ${focusMinutes} 分钟专注，适合把成果沉淀到复盘里。`,
          actionLabel: '写复盘',
          action: goToReview
        }
  ])
})
const workspaceEntranceGroups = computed(() => [
  {
    kicker: '执行',
    label: '执行工作区',
    items: [
      {
        badge: 'Plan',
        title: '计划',
        description: '拆解计划块，并安排到具体日期。',
        action: goToPlan
      },
      {
        badge: 'Learn',
        title: '学习',
        description: '微课程、笔记和学习行动转化。',
        action: goToLearning
      },
      {
        badge: 'Focus',
        title: '专注',
        description: '番茄钟、白噪音和全屏专注。',
        action: goToFocus
      }
    ]
  },
  {
    kicker: '沉淀',
    label: '沉淀工作区',
    items: [
      {
        badge: 'Inbox',
        title: '收集',
        description: '处理想法、任务和临时记录。',
        action: goToCaptures
      },
      {
        badge: 'Review',
        title: '复盘',
        description: '收束今天，生成明天第一步。',
        action: goToReview
      }
    ]
  },
  {
    kicker: '洞察',
    label: '周期洞察',
    items: [
      {
        badge: 'Data',
        title: '洞察',
        description: '查看习惯、专注、计划的周期统计与趋势。',
        action: () => router.push('/insights')
      },
      {
        badge: 'Track',
        title: '轨道',
        description: primaryWorkspaceTrack.value
          ? `${primaryWorkspaceTrack.value.name} · ${primaryWorkspaceTrack.value.overview?.todayStatus || '正在等待更多真实记录'}`
          : '观察习惯、学习、专注和计划趋势。',
        action: goToTracks
      }
    ]
  }
])

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

const dashboardGreeting = computed(() => {
  const name = user.value?.name?.trim()
  return name ? `${greeting.value} ${name}` : greeting.value
})

const loadWorkspaceToday = async () => {
  isWorkspaceLoading.value = true
  workspaceError.value = ''

  try {
    const response = await getWorkspaceToday()
    if (!response.success) {
      throw new Error(response.error || '今日工作台加载失败')
    }
    workspaceToday.value = response.data || null
  } catch (err) {
    workspaceError.value = err.message || '今日工作台加载失败'
  } finally {
    isWorkspaceLoading.value = false
  }
}

const scheduleStatusLabel = (status) => ({
  scheduled: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  skipped: '已跳过'
}[status] || '待开始')

const scheduleStatusClass = (status) => ({
  scheduled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  skipped: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
}[status] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300')

const formatScheduleMeta = (item) => {
  const time = item.start_time || '未定时间'
  const duration = Number(item.duration_minutes || 0)
  return duration > 0 ? `${time} · ${duration} 分钟` : time
}

const changeScheduleStatus = async (item, status) => {
  if (!item?.id || updatingScheduleId.value) return
  updatingScheduleId.value = item.id

  const response = await updateScheduleBlock(item.id, { status })
  updatingScheduleId.value = null

  if (!response.success) {
    error('任务状态更新失败', { description: response.error || '请稍后重试' })
    return
  }

  success(status === 'completed' ? '今日任务已完成' : '任务状态已更新')
  await loadWorkspaceToday()
}

const dayPreviewItems = (day) => {
  const schedules = (day.scheduleBlocks || []).map((item) => ({
    key: `schedule-${item.id}`,
    title: `${item.start_time ? `${item.start_time} · ` : ''}${item.title}`
  }))
  const plans = (day.plans || []).map((item) => ({
    key: `plan-${item.id}`,
    title: `计划 · ${item.title}`
  }))
  return [...schedules, ...plans].slice(0, 3)
}

const dashboardHighlights = computed(() => [
  {
    label: '今日稳定度',
    value: `${workspaceToday.value?.statusBar?.stability || 0}%`,
    hint: '来自今日习惯、专注和计划'
  },
  {
    label: '今日专注',
    value: `${workspaceToday.value?.statusBar?.focusMinutes || 0} 分钟`,
    hint: `${workspaceToday.value?.focus?.completedPomodoros || 0} 个番茄`
  },
  {
    label: '今日计划',
    value: workspaceToday.value?.statusBar?.todayPlanCount || 0,
    hint: `${todayScheduleBlocks.value.length} 个日程块`
  }
])

const dashboardNarrative = computed(() => {
  return workspaceToday.value?.currentTruth?.summary || '今日页只负责判断、分流和下一步行动，完整统计已经移到洞察页。'
})

const todayAiBrief = computed(() => {
  if (todayAiRemoteAdvice.value?.reply) return todayAiRemoteAdvice.value.reply

  const truth = workspaceToday.value?.currentTruth || {}
  const habits = workspaceToday.value?.habits || {}
  const plans = workspaceToday.value?.plans || {}
  const focus = workspaceToday.value?.focus || {}
  const risks = Array.isArray(truth.risks) ? truth.risks : []

  if (!workspaceToday.value) {
    return '正在同步今日真实数据，准备把习惯、计划、专注和收集箱整理成可执行建议。'
  }

  return `当前已完成 ${habits.completed || 0}/${habits.total || 0} 个习惯，专注 ${focus.focusMinutes || 0} 分钟，今日已有 ${plans.scheduledTodayCount || 0} 个日程块。${risks.length ? `另外还有 ${risks.length} 条需要留意的风险。` : '目前节奏比较稳定。'}`
})

const todayAiCards = computed(() => {
  const actions = Array.isArray(todayAiRemoteAdvice.value?.proposedActions) ? todayAiRemoteAdvice.value.proposedActions : []
  if (todayAiRemoteAdvice.value?.reply) {
    return [
      {
        label: todayAiRemoteAdvice.value.source === 'fallback' ? '本地兜底' : 'AI 建议',
        title: todayAiRemoteAdvice.value.reply,
        description: todayAiRemoteAdvice.value.provider?.name
          ? `来自 ${todayAiRemoteAdvice.value.provider.name}`
          : '基于当前工作台真实数据生成'
      },
      {
        label: '建议动作',
        title: actions[0]?.title || '先推进最小行动',
        description: actions[0]?.label || '需要写入数据时，仍会等待你确认。'
      },
      {
        label: '下一入口',
        title: actions[1]?.title || '继续整理今日工作台',
        description: actions[1]?.label || '可以进入计划、收集箱或复盘继续处理。'
      }
    ]
  }

  const truth = workspaceToday.value?.currentTruth || {}
  const habits = workspaceToday.value?.habits || {}
  const focus = workspaceToday.value?.focus || {}
  const plans = workspaceToday.value?.plans || {}

  return [
    {
      label: '今日判断',
      title: truth.summary || '等待今日状态同步',
      description: truth.focusSuggestion || '先推进最小行动，再考虑复杂安排。'
    },
    {
      label: '最小行动',
      title: truth.nextActions?.[0]?.title || '先做一个最小行动',
      description: `${habits.completed || 0}/${habits.total || 0} 个习惯已完成，专注 ${focus.focusMinutes || 0} 分钟。`
    },
    {
      label: '风险提醒',
      title: truth.risks?.[0]?.title || '当前没有明显风险',
      description: plans.scheduleBlocks?.[0]?.title || '今天暂时没有排程任务'
    }
  ]
})

const todayAiStatusText = computed(() => {
  if (todayAiLoading.value) return '正在读取当前工作台数据'
  if (todayAiErrorCode.value === 'AI_NOT_CONFIGURED') return '尚未配置 AI 能力'
  if (todayAiErrorMessage.value) return todayAiErrorMessage.value
  if (todayAiRemoteAdvice.value?.source === 'fallback') return '远程不可用，已切换本地建议'
  if (todayAiRemoteAdvice.value?.source) return '已生成供应商建议'
  return '点击后按当前供应商配置生成'
})
const goToHabitDetail = (habitId) => {
  router.push(`/habit/${habitId}`)
}

const quickCheckIn = async (habit) => {
  if (!habit?.id || checkingHabitId.value || habit.done) return

  checkingHabitId.value = habit.id
  try {
    const response = await habitStore.completeHabit(habit.id)
    if (!response.success) {
      error('快捷打卡失败', { description: response.error || '请稍后重试' })
      return
    }

    success('打卡成功', { description: `「${habit.name}」已记录到今天。` })
    await Promise.all([habitStore.fetchHabits(), loadWorkspaceToday()])
  } catch (err) {
    error('快捷打卡失败', { description: err.message || '请稍后重试' })
  } finally {
    checkingHabitId.value = null
  }
}

const goToLearning = () => {
  router.push('/learning')
}

const goToFocus = () => {
  router.push('/focus')
}

const goToPlan = () => {
  router.push('/plan')
}

const goToTracks = () => {
  router.push('/tracks')
}

const goToCaptures = () => {
  router.push('/captures')
}

const goToReview = () => {
  router.push('/review')
}

const goToHabitCreate = () => {
  showHabitManager.value = false
  selectedHabitIds.value = []
  router.push('/habit/create')
}

const openHabitManager = async () => {
  showHabitManager.value = true
  selectedHabitIds.value = []
  if (!habitStore.habits.length && !habitStore.isLoading) {
    await habitStore.fetchHabits()
  }
}

const closeHabitManager = () => {
  showHabitManager.value = false
  selectedHabitIds.value = []
}

const openHabitDetailFromManager = (habitId) => {
  closeHabitManager()
  goToHabitDetail(habitId)
}

const toggleHabitSelection = (habitId) => {
  const next = new Set(selectedHabitIds.value)
  if (next.has(habitId)) next.delete(habitId)
  else next.add(habitId)
  selectedHabitIds.value = [...next]
}

const toggleSelectAllHabits = () => {
  selectedHabitIds.value = isAllHabitsSelected.value ? [] : managerHabits.value.map((habit) => habit.id)
}

const deleteSelectedHabits = async () => {
  if (!selectedHabitIds.value.length || deletingSelectedHabits.value) return
  const count = selectedHabitIds.value.length
  if (!confirm(`确定删除选中的 ${count} 个习惯吗？此操作不可撤销。`)) return

  deletingSelectedHabits.value = true
  const response = await habitStore.deleteHabits(selectedHabitIds.value)
  deletingSelectedHabits.value = false

  if (!response.success) {
    error('批量删除习惯失败', { description: response.error || '请稍后重试' })
    return
  }

  selectedHabitIds.value = []
  success('习惯已删除', { description: `已删除 ${count} 个习惯` })
  await Promise.all([habitStore.fetchHabits(), loadWorkspaceToday()])
}

const adviceItemKey = (item) => `${activeAdviceMode.value}-${item?.index || 0}-${item?.title || ''}`

const captureAdvice = async (item) => {
  if (!item || capturingAdviceKey.value) return

  const key = adviceItemKey(item)
  capturingAdviceKey.value = key

  const modeLabel = adviceModes.find((mode) => mode.id === activeAdviceMode.value)?.label || '智能建议'
  const content = [
    '【今日智能建议】',
    `建议类型：${modeLabel}`,
    `建议标题：${item.title || '未命名建议'}`,
    `建议说明：${item.description || '暂无说明'}`,
    item.actionLabel ? `建议入口：${item.actionLabel}` : '',
    '处理方式：请在收集箱中确认是否转为计划、复盘或归档。'
  ].filter(Boolean).join('\n')

  const response = await createQuickCapture({ type: 'task', content })
  capturingAdviceKey.value = ''

  if (!response.success) {
    error('采纳建议失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入收集箱', { description: '这条建议会作为待处理事项等待确认。' })
  await loadWorkspaceToday()
}

const generateTodayAiAdvice = async () => {
  if (todayAiLoading.value) return
  todayAiLoading.value = true
  todayAiErrorCode.value = ''
  todayAiErrorMessage.value = ''

  try {
    const response = await chatWithMascotAssistant({
      message: '请基于今日工作台真实数据，告诉我今天先做什么、哪里有风险、接下来 30 分钟怎么安排。请简短输出。',
      providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null
    })

    if (!response.success) {
      todayAiErrorCode.value = response.code || ''
      todayAiErrorMessage.value = response.error || response.message || 'AI 建议生成失败'
      return
    }

    todayAiRemoteAdvice.value = response.data || null
  } catch (err) {
    todayAiErrorMessage.value = err.message || 'AI 建议生成失败'
  } finally {
    todayAiLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([habitStore.fetchHabits(), loadWorkspaceToday()])
})
</script>

<style scoped>
.today-ai-center {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.95rem;
  overflow: hidden;
  border: 1px solid rgba(212, 212, 216, 0.82);
  border-radius: 2rem;
  background:
    radial-gradient(circle at 12% 0%, rgba(199, 166, 90, 0.12), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(244, 244, 245, 0.82));
  padding: 1.05rem;
  box-shadow: 0 22px 70px rgba(24, 24, 27, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(22px);
}

.today-ai-orb {
  display: grid;
  width: 4.2rem;
  height: 4.2rem;
  place-items: center;
  border: 1px solid rgba(24, 24, 27, 0.12);
  border-radius: 1.55rem;
  background:
    radial-gradient(circle at 50% 14%, rgba(255, 255, 255, 0.9), transparent 46%),
    rgb(24, 24, 27);
  color: white;
  box-shadow: 0 18px 42px rgba(24, 24, 27, 0.2);
}

.today-ai-orb span {
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.today-ai-copy {
  min-width: 0;
}

.today-ai-kicker {
  color: rgb(113, 113, 122);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.today-ai-copy h2 {
  margin-top: 0.35rem;
  color: rgb(9, 9, 11);
  font-size: 1.35rem;
  font-weight: 750;
  letter-spacing: -0.04em;
}

.today-ai-copy p {
  margin-top: 0.45rem;
  color: rgb(82, 82, 91);
  font-size: 0.82rem;
  line-height: 1.7;
}

.today-ai-grid {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.today-ai-card {
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.82);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.72);
  padding: 0.78rem;
}

.today-ai-card span {
  display: block;
  color: rgb(113, 113, 122);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.today-ai-card strong {
  display: block;
  margin-top: 0.38rem;
  overflow: hidden;
  color: rgb(24, 24, 27);
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.today-ai-card p {
  margin-top: 0.34rem;
  overflow: hidden;
  color: rgb(113, 113, 122);
  font-size: 0.72rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.today-ai-actions {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.today-ai-status {
  max-width: 11rem;
  color: rgb(113, 113, 122);
  font-size: 0.72rem;
  line-height: 1.5;
}

.today-ai-primary,
.today-ai-secondary {
  min-height: 2.45rem;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0 1rem;
  font-size: 0.78rem;
  font-weight: 850;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.today-ai-primary {
  background: rgb(24, 24, 27);
  color: white;
  box-shadow: 0 16px 38px rgba(24, 24, 27, 0.18);
}

.today-ai-secondary {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.75);
  color: rgb(63, 63, 70);
}

.today-ai-primary:hover,
.today-ai-secondary:hover {
  transform: translateY(-1px);
}

.dark .today-ai-center {
  border-color: rgba(63, 63, 70, 0.86);
  background:
    radial-gradient(circle at 12% 0%, rgba(199, 166, 90, 0.1), transparent 32%),
    linear-gradient(135deg, rgba(24, 24, 27, 0.86), rgba(9, 9, 11, 0.82));
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .today-ai-copy h2,
.dark .today-ai-card strong {
  color: white;
}

.dark .today-ai-copy p,
.dark .today-ai-kicker,
.dark .today-ai-card span,
.dark .today-ai-card p {
  color: rgb(161, 161, 170);
}

.dark .today-ai-card,
.dark .today-ai-secondary {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(24, 24, 27, 0.7);
  color: rgb(228, 228, 231);
}

.dark .today-ai-primary {
  background: white;
  color: rgb(24, 24, 27);
}

@media (max-width: 1279px) {
  .today-ai-center {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .today-ai-grid,
  .today-ai-actions {
    grid-column: 1 / -1;
  }

  .today-ai-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 767px) {
  .today-ai-center {
    grid-template-columns: 1fr;
    border-radius: 1.6rem;
  }

  .today-ai-orb {
    width: 3.6rem;
    height: 3.6rem;
  }

  .today-ai-grid {
    grid-template-columns: 1fr;
  }
}
.workspace-field,
.workspace-textarea {
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(24, 24, 27);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.workspace-field {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.workspace-textarea {
  resize: vertical;
  min-height: 4.5rem;
  padding: 0.85rem 1rem;
  line-height: 1.6;
}

.workspace-field:focus,
.workspace-textarea:focus {
  border-color: rgb(24, 24, 27);
  box-shadow: 0 0 0 4px rgba(24, 24, 27, 0.08);
}

.workspace-primary-button,
.workspace-secondary-button {
  min-height: 2.75rem;
  border-radius: 1rem;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: transform 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.workspace-primary-button {
  background: rgb(24, 24, 27);
  color: white;
}

.workspace-secondary-button {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.88);
  color: rgb(39, 39, 42);
}

.workspace-primary-button:hover:not(:disabled),
.workspace-secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.workspace-primary-button:hover:not(:disabled) {
  background: rgb(39, 39, 42);
}

.workspace-secondary-button:hover:not(:disabled) {
  background: white;
}

.workspace-primary-button:disabled,
.workspace-secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.dark .workspace-field,
.dark .workspace-textarea {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .workspace-field:focus,
.dark .workspace-textarea:focus {
  border-color: white;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.dark .workspace-primary-button {
  background: white;
  color: rgb(24, 24, 27);
}

.dark .workspace-primary-button:hover:not(:disabled) {
  background: rgb(244, 244, 245);
}

.workspace-advice-panel {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.6rem;
  background:
    radial-gradient(circle at top right, rgba(24, 24, 27, 0.06), transparent 34%),
    rgba(250, 250, 250, 0.82);
  padding: 1.25rem;
}

.workspace-risk-panel {
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 1.6rem;
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.08), transparent 34%),
    rgba(255, 251, 235, 0.5);
  padding: 1.25rem;
}

.workspace-advice-tab {
  min-height: 2rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.86);
  padding: 0 0.85rem;
  color: rgb(82, 82, 91);
  font-size: 0.75rem;
  font-weight: 700;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.workspace-advice-tab:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.8);
  color: rgb(24, 24, 27);
}

.workspace-advice-tab.is-active {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
}

.workspace-advice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.78);
  padding: 0.9rem;
}

.workspace-advice-index {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgb(24, 24, 27);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
}

.workspace-advice-action {
  min-height: 2.25rem;
  flex-shrink: 0;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: white;
  padding: 0 0.9rem;
  color: rgb(39, 39, 42);
  font-size: 0.75rem;
  font-weight: 700;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.workspace-advice-actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.workspace-advice-action:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
}

.workspace-advice-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.workspace-advice-action-secondary {
  background: rgba(244, 244, 245, 0.92);
  color: rgb(82, 82, 91);
}

.workspace-entrance-group {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.55rem;
  background:
    linear-gradient(135deg, rgba(250, 250, 250, 0.9), rgba(244, 244, 245, 0.62));
  padding: 1rem;
}

.workspace-entrance-link {
  display: flex;
  min-height: 4.35rem;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.82);
  padding: 0.85rem;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.workspace-entrance-link:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.72);
  background: white;
  box-shadow: 0 12px 28px rgba(24, 24, 27, 0.06);
}

.dark .workspace-secondary-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .workspace-secondary-button:hover:not(:disabled) {
  background: rgba(39, 39, 42, 0.92);
}

.dark .workspace-advice-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.08), transparent 34%),
    rgba(24, 24, 27, 0.72);
}

.dark .workspace-risk-panel {
  border-color: rgba(245, 158, 11, 0.22);
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.12), transparent 34%),
    rgba(24, 24, 27, 0.72);
}

.dark .workspace-advice-tab {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.72);
  color: rgb(212, 212, 216);
}

.dark .workspace-advice-tab:hover {
  border-color: rgba(161, 161, 170, 0.72);
  color: white;
}

.dark .workspace-advice-tab.is-active,
.dark .workspace-advice-index {
  border-color: white;
  background: white;
  color: rgb(24, 24, 27);
}

.dark .workspace-advice-item {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.58);
}

.dark .workspace-advice-action {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.86);
  color: white;
}

.dark .workspace-advice-action:hover:not(:disabled) {
  border-color: white;
}

.dark .workspace-advice-action-secondary {
  background: rgba(39, 39, 42, 0.82);
  color: rgb(212, 212, 216);
}

.dark .workspace-entrance-group {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    linear-gradient(135deg, rgba(39, 39, 42, 0.72), rgba(24, 24, 27, 0.64));
}

.dark .workspace-entrance-link {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.72);
}

.dark .workspace-entrance-link:hover {
  border-color: rgba(161, 161, 170, 0.72);
  background: rgba(39, 39, 42, 0.86);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.28);
}

@media (max-width: 767px) {
  .workspace-advice-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .workspace-advice-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

.workspace-schedule-button {
  min-height: 2.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.82);
  padding: 0 0.9rem;
  color: rgb(39, 39, 42);
  font-size: 0.75rem;
  font-weight: 700;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.workspace-schedule-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.8);
  background: white;
}

.workspace-schedule-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.workspace-schedule-button-complete {
  border-color: rgba(16, 185, 129, 0.28);
  background: rgba(236, 253, 245, 0.86);
  color: rgb(4, 120, 87);
}

.workspace-schedule-button-muted {
  color: rgb(113, 113, 122);
}

.dark .workspace-schedule-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.72);
  color: rgb(244, 244, 245);
}

.dark .workspace-schedule-button:hover:not(:disabled) {
  border-color: rgba(161, 161, 170, 0.7);
  background: rgba(63, 63, 70, 0.85);
}

.dark .workspace-schedule-button-complete {
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(16, 185, 129, 0.13);
  color: rgb(167, 243, 208);
}

.dark .workspace-schedule-button-muted {
  color: rgb(161, 161, 170);
}

.habit-preview-row {
  display: flex;
  min-height: 4.25rem;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.25rem;
  background: rgba(250, 250, 250, 0.82);
  padding: 0.85rem 0.95rem;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.habit-preview-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.habit-preview-row:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.72);
  background: white;
  box-shadow: 0 12px 28px rgba(24, 24, 27, 0.06);
}

.habit-preview-dot {
  width: 0.7rem;
  height: 0.7rem;
  flex-shrink: 0;
  border-radius: 9999px;
  box-shadow: 0 0 0 4px rgba(24, 24, 27, 0.05);
}

.habit-quick-check,
.habit-preview-enter {
  min-height: 2.2rem;
  flex-shrink: 0;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.88);
  color: rgb(39, 39, 42);
  font-size: 0.75rem;
  font-weight: 800;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.habit-quick-check {
  padding: 0 0.9rem;
}

.habit-preview-enter {
  display: grid;
  width: 2.2rem;
  place-items: center;
  color: rgb(161, 161, 170);
}

.habit-quick-check:hover:not(:disabled),
.habit-preview-enter:hover {
  transform: translateY(-1px);
  border-color: rgba(24, 24, 27, 0.32);
  background: white;
  color: rgb(24, 24, 27);
}

.habit-quick-check.is-completed {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(236, 253, 245, 0.84);
  color: rgb(4, 120, 87);
}

.habit-quick-check:disabled {
  cursor: not-allowed;
  opacity: 0.62;
  transform: none;
}

.dark .habit-preview-row {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.58);
}

.dark .habit-preview-row:hover {
  border-color: rgba(161, 161, 170, 0.72);
  background: rgba(39, 39, 42, 0.86);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.28);
}

.dark .habit-preview-dot {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.06);
}

.dark .habit-quick-check,
.dark .habit-preview-enter {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: rgb(228, 228, 231);
}

.dark .habit-quick-check:hover:not(:disabled),
.dark .habit-preview-enter:hover {
  border-color: rgba(161, 161, 170, 0.72);
  background: rgba(39, 39, 42, 0.92);
  color: white;
}

.dark .habit-quick-check.is-completed {
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(16, 185, 129, 0.13);
  color: rgb(167, 243, 208);
}

.habit-panel-scroll {
  min-height: 0;
  max-height: 100%;
  scrollbar-width: thin;
  scrollbar-color: rgba(82, 82, 91, 0.7) rgba(0, 0, 0, 0.03);
  scrollbar-gutter: stable both-edges;
  overflow-y: auto;
  overscroll-behavior: contain;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.habit-panel-scroll::-webkit-scrollbar {
  width: 10px;
}

.habit-panel-scroll::-webkit-scrollbar-track {
  background: rgba(113, 113, 122, 0.08);
  border-radius: 9999px;
}

.habit-panel-scroll::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  border: 2px solid transparent;
  background: rgba(82, 82, 91, 0.6);
  background-clip: padding-box;
}

.habit-manager-action,
.habit-manager-danger,
.habit-manager-link,
.habit-manager-primary {
  min-height: 2.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  padding: 0 1rem;
  color: rgb(39, 39, 42);
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
  background: rgb(24, 24, 27);
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
  border-color: rgb(24, 24, 27);
  background: white;
  box-shadow: 0 16px 36px rgba(24, 24, 27, 0.08);
}

.habit-manager-checkbox {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 9999px;
  border: 1px solid rgba(161, 161, 170, 0.9);
  accent-color: rgb(24, 24, 27);
  flex-shrink: 0;
}

.dark .habit-manager-action,
.dark .habit-manager-link {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.84);
  color: white;
}

.dark .habit-manager-action:hover:not(:disabled),
.dark .habit-manager-link:hover,
.dark .habit-manager-primary:hover {
  border-color: rgba(161, 161, 170, 0.72);
  background: rgba(39, 39, 42, 0.92);
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

.dark .habit-manager-row:hover {
  border-color: rgba(161, 161, 170, 0.72);
  background: rgba(39, 39, 42, 0.88);
}

.dark .habit-manager-row.is-selected {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28);
}

.dark .habit-manager-checkbox {
  border-color: rgba(113, 113, 122, 0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>




