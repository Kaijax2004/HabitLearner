<template>
  <section class="h-full min-h-0">
    <BaseCard padding="small" class="relative h-full overflow-hidden border border-zinc-200/80 bg-white/92 dark:border-zinc-800 dark:bg-zinc-950/78" :hover="false">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-zinc-100/70 to-transparent dark:from-white/[0.04]" />

      <div class="relative flex h-full min-h-0 flex-col gap-3">
        <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              <span>专注工作区</span>
            </div>

            <div>
              <h3 class="text-[1.35rem] font-semibold tracking-tight text-zinc-950 dark:text-white">番茄钟概览</h3>
              <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">快速开始一轮专注，完整参数与历史记录在工作区内管理。</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:justify-end">
            <button
              type="button"
              class="rounded-[1.15rem] border border-zinc-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-600"
              @click="openWorkspace"
            >
              打开工作区
            </button>

            <button
              v-if="activeSession"
              type="button"
              class="rounded-2xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              @click="openFocusMode"
            >
              进入专注区
            </button>

            <button
              v-if="activeSession"
              type="button"
              class="rounded-[1.15rem] px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition"
              :class="activeSession.status === 'paused'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'"
              @click="handlePrimarySessionAction"
            >
              {{ activeSession.status === 'paused' ? '继续专注' : '暂停一下' }}
            </button>

            <button
              v-else
              type="button"
              class="rounded-[1.15rem] bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              :disabled="isMutating"
              @click="startSession"
            >
              {{ isMutating ? '启动中...' : '开始番茄' }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 xl:grid-cols-4">
          <div
            v-for="card in summaryCards"
            :key="card.label"
            class="rounded-[20px] border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <p class="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{{ card.label }}</p>
            <p class="mt-1 text-[1.18rem] font-semibold tracking-tight text-zinc-950 dark:text-white">{{ card.value }}</p>
            <p class="mt-1 truncate text-[11px] leading-[1.12rem] text-zinc-500 dark:text-zinc-400">{{ card.hint }}</p>
          </div>
        </div>

        <div class="grid min-h-0 flex-1 gap-3 xl:grid-cols-2">
          <div class="flex min-h-0 flex-col gap-3 overflow-hidden rounded-[24px] border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">快速配置</p>
                <p class="mt-0.5 text-[11px] leading-[1.15rem] text-zinc-500 dark:text-zinc-400">标题和核心时长可直接调整，更多设置在完整工作区内完成。</p>
              </div>
            </div>

            <input
              v-model="sessionTitleDraft"
              type="text"
              maxlength="255"
              class="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-950 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
              :placeholder="activeSession ? '当前任务标题' : '给这次专注起个标题'"
            />

            <div class="grid gap-2 md:grid-cols-3">
              <label class="space-y-1 text-[12px] text-zinc-600 dark:text-zinc-300">
                <span>专注时长</span>
                <input v-model.number="preferences.focusDurationMinutes" type="number" min="5" max="180" class="input-token input-token--preview" />
              </label>
              <label class="space-y-1 text-[12px] text-zinc-600 dark:text-zinc-300">
                <span>休息时间</span>
                <input v-model.number="preferences.shortBreakDurationMinutes" type="number" min="1" max="60" class="input-token input-token--preview" />
              </label>
              <label class="space-y-1 text-[12px] text-zinc-600 dark:text-zinc-300">
                <span>循环次数</span>
                <input v-model.number="preferences.totalCycles" type="number" min="1" max="12" class="input-token input-token--preview" />
              </label>
            </div>

            <div class="grid gap-2 lg:grid-cols-2">
              <div class="rounded-[20px] border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/80">
                <p class="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">当前状态</p>

                <template v-if="liveSession">
                  <p class="mt-1 truncate text-[13px] font-semibold text-zinc-950 dark:text-white">{{ liveSession.title }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span class="rounded-full bg-zinc-100 px-2.5 py-0.5 dark:bg-zinc-800">{{ liveSession.currentPhaseLabel || '专注中' }}</span>
                    <span class="rounded-full bg-zinc-100 px-2.5 py-0.5 dark:bg-zinc-800">{{ liveSession.completedPomodoros }} / {{ liveSession.totalCycles || preferences.totalCycles }} 轮</span>
                    <span class="rounded-full bg-zinc-100 px-2.5 py-0.5 dark:bg-zinc-800">{{ liveSession.focusDurationMinutes }} 分钟</span>
                  </div>
                  <div class="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div class="h-2 rounded-full bg-emerald-500 transition-all duration-300" :style="{ width: `${liveSession.progressPercent}%` }" />
                  </div>
                  <p class="mt-1 text-[11px] leading-[1.15rem] text-zinc-500 dark:text-zinc-400">{{ liveSessionDescription }}</p>
                </template>

                <template v-else>
                  <p class="mt-2 text-[13px] font-semibold text-zinc-950 dark:text-white">准备开始新一轮专注</p>
                  <p class="mt-1 text-[11px] leading-[1.15rem] text-zinc-500 dark:text-zinc-400">点击开始后会直接进入完整工作区，专注记录会自动沉淀。</p>
                </template>
              </div>

              <div class="rounded-[20px] border border-zinc-200/80 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-950/80">
                <p class="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">剩余时间</p>
                <p class="mt-2 text-[1.5rem] font-semibold tracking-tight text-zinc-950 dark:text-white">
                  {{ liveSession ? formatDuration(liveSession.remainingSeconds) : formatDuration(preferences.focusDurationMinutes * 60) }}
                </p>
                <p class="mt-1 text-[11px] leading-[1.15rem] text-zinc-500 dark:text-zinc-400">
                  {{ liveSession ? '当前阶段倒计时' : `默认每轮 ${preferences.focusDurationMinutes} 分钟` }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex min-h-0 flex-col gap-3 overflow-hidden rounded-[24px] border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[12px] font-medium uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">7 天趋势</p>
                <p class="mt-0.5 text-[11px] leading-[1.15rem] text-zinc-500 dark:text-zinc-400">快速看看最近一周的专注曲线有没有保持住。</p>
              </div>
              <div class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-300">
                今日 {{ formatFocusMinutes(stats.todayFocusSeconds) }}
              </div>
            </div>

            <div
              v-if="stats.dailyTrend.length"
              class="flex min-h-0 flex-1 items-end gap-1 overflow-hidden rounded-[24px] border border-zinc-200/70 bg-white/90 px-2 py-2 dark:border-zinc-800 dark:bg-zinc-950/70"
            >
              <div v-for="item in stats.dailyTrend" :key="item.date" class="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div class="flex h-14 w-full items-end justify-center rounded-2xl bg-zinc-100/80 px-1 dark:bg-zinc-900">
                  <div class="w-full rounded-2xl bg-zinc-950 transition-all duration-300 dark:bg-white" :style="trendBarStyle(item.focusSeconds)" />
                </div>
                <div class="text-center">
                  <p class="text-[12px] font-medium text-zinc-700 dark:text-zinc-200">{{ formatFocusMinutes(item.focusSeconds) }}</p>
                  <p class="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                </div>
              </div>
            </div>

            <div
              v-else
              class="flex min-h-0 flex-1 items-center justify-center rounded-[24px] border border-dashed border-zinc-200 bg-white px-4 py-4 text-center text-[11px] leading-[1.15rem] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400"
            >
              开始一轮番茄后，这里会出现你的专注走势。
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <Teleport to="body">
      <Transition name="workspace-fade">
        <div v-if="showWorkspace" class="fixed inset-0 z-[90] bg-black/60 px-4 py-4 backdrop-blur-xl lg:px-6 lg:py-6">
          <div class="flex h-full w-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/94 shadow-[0_32px_120px_rgba(0,0,0,0.28)] dark:bg-zinc-950/94">
            <div class="border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800/80">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    <span>番茄钟工作区</span>
                    <span
                      v-if="liveSession"
                      class="rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] dark:border-zinc-700"
                    >
                      {{ liveSession.currentPhaseLabel || '专注中' }}
                    </span>
                  </div>

                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <input
                      v-model="sessionTitleDraft"
                      type="text"
                      maxlength="255"
                      class="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base font-semibold tracking-tight text-zinc-950 outline-none transition focus:border-zinc-900 lg:w-[440px] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                      placeholder="输入本次专注任务标题"
                    />
                    <button
                      type="button"
                      class="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      :disabled="!canRenameSession || isMutating"
                      @click="renameSession"
                    >
                      保存标题
                    </button>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-if="activeSession"
                    type="button"
                    class="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                    @click="openFocusMode"
                  >
                    进入全屏专注
                  </button>
                  <button
                    type="button"
                    class="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    @click="showWorkspace = false"
                  >
                    退出工作区
                  </button>
                </div>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div class="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <div class="space-y-5">
                  <BaseCard class="border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60" :hover="false">
                    <div class="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                      <div class="flex items-center justify-center">
                        <div class="timer-shell">
                            <svg viewBox="0 0 220 220" class="h-[280px] w-[280px] max-w-full xl:h-[300px] xl:w-[300px]">
                            <circle cx="110" cy="110" r="92" class="fill-none stroke-zinc-200 dark:stroke-zinc-800" stroke-width="14" />
                            <circle
                              cx="110"
                              cy="110"
                              r="92"
                              class="fill-none stroke-zinc-950 transition-all duration-300 dark:stroke-white"
                              stroke-width="14"
                              stroke-linecap="round"
                              :stroke-dasharray="ringCircumference"
                              :stroke-dashoffset="ringDashOffset"
                              transform="rotate(-90 110 110)"
                            />
                          </svg>

                          <div class="timer-center">
                            <p class="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                              {{ liveSession ? (liveSession.currentPhaseLabel || '专注中') : '待开始' }}
                            </p>
                            <p class="mt-3 text-[52px] font-semibold tracking-tight text-zinc-950 dark:text-white">
                              {{ liveSession ? formatDuration(liveSession.remainingSeconds) : formatDuration(preferences.focusDurationMinutes * 60) }}
                            </p>
                            <p class="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                              {{ liveSessionDescription }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-4">
                        <div class="grid gap-3 sm:grid-cols-2">
                          <div class="rounded-[24px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                            <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">已专注</p>
                            <p class="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">{{ formatFocusMinutes(liveFocusSeconds) }}</p>
                            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">正向累计，刷新页面也不会丢失。</p>
                          </div>

                          <div class="rounded-[24px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                            <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">番茄累计</p>
                            <p class="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">
                              {{ liveSession ? `${liveSession.completedPomodoros}` : '0' }}
                            </p>
                            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">每完成 1 轮专注会累计 1 个番茄，并继续推进到下一轮。</p>
                          </div>
                        </div>

                        <div class="rounded-[28px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                          <div class="flex flex-wrap gap-2">
                            <button
                              v-if="!activeSession"
                              type="button"
                              class="control-button control-button--primary"
                              :disabled="isMutating"
                              @click="startSession"
                            >
                              {{ isMutating ? '启动中...' : '开始专注' }}
                            </button>

                            <button
                              v-else-if="activeSession.status === 'running'"
                              type="button"
                              class="control-button"
                              :disabled="isMutating"
                              @click="pauseSession"
                            >
                              暂停
                            </button>

                            <button
                              v-else
                              type="button"
                              class="control-button control-button--primary"
                              :disabled="isMutating"
                              @click="resumeSession"
                            >
                              继续
                            </button>

                            <button
                              type="button"
                              class="control-button control-button--success"
                              :disabled="!activeSession || isMutating"
                              @click="completeSession"
                            >
                              提前完成
                            </button>

                            <button
                              type="button"
                              class="control-button control-button--danger"
                              :disabled="!activeSession || isMutating"
                              @click="cancelSession"
                            >
                              取消任务
                            </button>

                            <button
                              v-if="showAdvanceButton"
                              type="button"
                              class="control-button"
                              :disabled="isMutating"
                              @click="advanceSession"
                            >
                              进入下一阶段
                            </button>
                          </div>

                          <p class="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{{ controlHint }}</p>
                        </div>
                      </div>
                    </div>
                  </BaseCard>

                  <BaseCard title="默认参数" class="border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60" :hover="false">
                    <template #header>
                      <button
                        type="button"
                        class="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        :disabled="isSavingPreferences"
                        @click="savePreferences"
                      >
                        {{ isSavingPreferences ? '保存中...' : '保存为默认配置' }}
                      </button>
                    </template>

                    <template #subtitle>
                      <p class="text-sm text-zinc-500 dark:text-zinc-400">下次启动番茄钟时，会默认带出这组参数。</p>
                    </template>

                    <p class="mb-4 rounded-[20px] border border-zinc-200/70 bg-white/80 px-4 py-3 text-xs leading-6 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                      上方任务标题会一并保存为默认标题，专注时长、休息时间和循环次数也会一起记住，下方开关分别控制自动衔接与声音提醒。
                    </p>

                    <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      <label class="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <span>专注时长（分钟）</span>
                        <input v-model.number="preferences.focusDurationMinutes" type="number" min="5" max="180" class="input-token" />
                      </label>
                      <label class="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <span>休息时间（分钟）</span>
                        <input v-model.number="preferences.shortBreakDurationMinutes" type="number" min="1" max="60" class="input-token" />
                      </label>
                      <label class="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <span>循环次数</span>
                        <input v-model.number="preferences.totalCycles" type="number" min="1" max="12" class="input-token" />
                      </label>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-3">
                      <label class="toggle-chip">
                        <input v-model="preferences.autoStartBreaks" type="checkbox" class="sr-only" />
                        <span>休息自动开始</span>
                      </label>
                      <label class="toggle-chip">
                        <input v-model="preferences.autoStartFocus" type="checkbox" class="sr-only" />
                        <span>专注自动开始</span>
                      </label>
                      <label class="toggle-chip">
                        <input v-model="preferences.soundEnabled" type="checkbox" class="sr-only" />
                        <span>保留声音提醒</span>
                      </label>
                    </div>
                  </BaseCard>

                  <WhiteNoiseConsole mode="workspace" />
                </div>

                <div class="space-y-5">
                  <BaseCard title="统计分析" class="border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60" :hover="false">
                    <div class="grid gap-3 sm:grid-cols-2">
                      <div
                        v-for="card in analysisCards"
                        :key="card.label"
                        class="rounded-[24px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70"
                      >
                        <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ card.label }}</p>
                        <p class="mt-3 text-2xl font-semibold text-zinc-950 dark:text-white">{{ card.value }}</p>
                        <p class="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{{ card.hint }}</p>
                      </div>
                    </div>

                    <div class="mt-4 rounded-[24px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
                      <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">本周趋势解读</p>
                      <ul class="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                        <li v-for="item in analysisInsights" :key="item">{{ item }}</li>
                      </ul>
                    </div>
                  </BaseCard>

                  <BaseCard title="阶段时间线" class="border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60" :hover="false">
                    <template #subtitle>
                      <p class="text-sm text-zinc-500 dark:text-zinc-400">阶段切换、暂停和完成都会按时间顺序记录下来。</p>
                    </template>

                    <div v-if="timelineItems.length" class="space-y-3">
                      <div
                        v-for="event in timelineItems"
                        :key="event.id"
                        class="rounded-[22px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70"
                      >
                        <div class="flex items-start justify-between gap-4">
                          <div>
                            <p class="text-sm font-medium text-zinc-950 dark:text-white">{{ event.label }}</p>
                            <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ formatDateTime(event.occurredAt) }}</p>
                          </div>
                          <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {{ event.type }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else
                      class="rounded-[24px] border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400"
                    >
                      启动一次番茄钟后，这里会显示完整时间线。
                    </div>
                  </BaseCard>

                  <BaseCard title="最近记录" class="border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60" :hover="false">
                    <template #subtitle>
                      <p class="text-sm text-zinc-500 dark:text-zinc-400">支持手动删除历史记录，刷新后也不会丢失。</p>
                    </template>

                    <div v-if="recentSessions.length" class="space-y-3">
                      <div
                        v-for="item in recentSessions"
                        :key="item.id"
                        class="rounded-[22px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70"
                      >
                        <div class="flex items-start justify-between gap-4">
                          <div class="min-w-0">
                            <p class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ item.title }}</p>
                            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                              <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">{{ sessionStatusLabel(item.status) }}</span>
                              <span>{{ formatFocusMinutes(item.totalFocusSeconds) }}</span>
                              <span>完成 {{ item.completedPomodoros }} / {{ item.totalCycles || 1 }} 轮</span>
                            </div>
                            <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{{ formatDateTime(item.createdAt) }}</p>
                          </div>

                          <button
                            type="button"
                            class="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-500/40 dark:hover:text-red-300"
                            @click="pendingDeleteId = item.id"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else
                      class="rounded-[24px] border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400"
                    >
                      还没有历史记录。开始第一轮专注后，这里会自动沉淀数据。
                    </div>
                  </BaseCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="workspace-fade">
        <div v-if="showFocusMode" class="fixed inset-0 z-[100] overflow-hidden bg-zinc-950 text-white">
          <div class="focus-ambient-orb focus-ambient-orb--one" />
          <div class="focus-ambient-orb focus-ambient-orb--two" />
          <div class="focus-ambient-orb focus-ambient-orb--three" />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_20%,transparent_80%,rgba(255,255,255,0.04))]" />
          <div class="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:34px_34px]" />

          <div class="relative flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6">
            <div class="flex h-full w-full flex-col gap-4">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-white/45">全屏专注区</p>
                  <p class="mt-2 truncate text-sm text-white/75">
                    {{ liveSession?.title || sessionTitleDraft || '今日专注任务' }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    @click="showFocusMode = false"
                  >
                    返回工作区
                  </button>
                </div>
              </div>

              <div class="min-h-0 flex-1">
                <div class="grid h-full gap-5 xl:grid-cols-2">
                  <div class="focus-stage-panel flex min-h-0 flex-col justify-between overflow-hidden rounded-[34px] p-6 sm:p-8">
                  <div class="flex flex-wrap items-center gap-2 text-sm text-white/78">
                    <span class="rounded-full bg-white/10 px-3 py-1">{{ liveSession?.currentPhaseLabel || '准备开始' }}</span>
                    <span class="rounded-full bg-white/10 px-3 py-1">已完成 {{ liveSession?.completedPomodoros || 0 }} / {{ liveSession?.totalCycles || preferences.totalCycles }} 轮</span>
                    <span class="rounded-full bg-white/10 px-3 py-1">专注 {{ liveSession?.focusDurationMinutes || preferences.focusDurationMinutes }} 分钟</span>
                  </div>

                    <div class="flex flex-1 items-center justify-center py-6">
                      <div class="timer-shell timer-shell--focus">
                        <svg viewBox="0 0 220 220" class="h-[min(74vw,560px)] w-[min(74vw,560px)] max-w-full">
                          <circle cx="110" cy="110" r="92" class="fill-none stroke-white/10" stroke-width="14" />
                          <circle
                            cx="110"
                            cy="110"
                            r="92"
                            class="fill-none stroke-white transition-all duration-300"
                            stroke-width="14"
                            stroke-linecap="round"
                            :stroke-dasharray="ringCircumference"
                            :stroke-dashoffset="ringDashOffset"
                            transform="rotate(-90 110 110)"
                          />
                        </svg>

                        <div class="timer-center text-white">
                          <p class="text-sm font-medium uppercase tracking-[0.3em] text-white/55">
                            {{ liveSession ? (liveSession.currentPhaseLabel || '专注中') : '待开始' }}
                          </p>
                          <p class="mt-4 text-[clamp(3.8rem,9vw,7.4rem)] font-semibold leading-none tracking-tight">
                            {{ liveSession ? formatDuration(liveSession.remainingSeconds) : formatDuration(preferences.focusDurationMinutes * 60) }}
                          </p>
                          <p class="mt-4 max-w-xl text-sm leading-6 text-white/65">
                            {{ liveSessionDescription }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-3">
                      <div class="focus-metric-card">
                        <p class="text-xs font-medium uppercase tracking-[0.18em] text-white/45">已专注</p>
                        <p class="mt-3 text-3xl font-semibold text-white">{{ formatFocusMinutes(liveFocusSeconds) }}</p>
                      </div>
                      <div class="focus-metric-card">
                        <p class="text-xs font-medium uppercase tracking-[0.18em] text-white/45">番茄累计</p>
                        <p class="mt-3 text-3xl font-semibold text-white">{{ liveSession ? `${liveSession.completedPomodoros}` : '0' }}</p>
                      </div>
                      <div class="focus-metric-card">
                        <p class="text-xs font-medium uppercase tracking-[0.18em] text-white/45">下一步</p>
                        <p class="mt-3 text-lg font-semibold text-white">{{ showAdvanceButton ? '可进入下一阶段' : '保持节奏' }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex min-h-0 flex-col gap-4">
                    <div class="focus-stage-panel rounded-[30px] p-5">
                      <p class="text-xs font-medium uppercase tracking-[0.18em] text-white/45">专注状态</p>
                      <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/80">
                        <span class="rounded-full bg-white/10 px-3 py-1">{{ liveSession?.currentPhaseLabel || '准备开始' }}</span>
                        <span class="rounded-full bg-white/10 px-3 py-1">{{ liveSession ? '进行中' : '未启动' }}</span>
                      </div>
                      <p class="mt-4 text-sm leading-6 text-white/60">{{ controlHint }}</p>
                    </div>

                    <div class="focus-stage-panel rounded-[30px] p-5">
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-if="!activeSession"
                          type="button"
                          class="focus-action focus-action--primary"
                          :disabled="isMutating"
                          @click="startSession"
                        >
                          {{ isMutating ? '启动中...' : '开始专注' }}
                        </button>

                        <button
                          v-else-if="activeSession.status === 'running'"
                          type="button"
                          class="focus-action"
                          :disabled="isMutating"
                          @click="pauseSession"
                        >
                          暂停
                        </button>

                        <button
                          v-else
                          type="button"
                          class="focus-action focus-action--primary"
                          :disabled="isMutating"
                          @click="resumeSession"
                        >
                          继续
                        </button>

                        <button
                          type="button"
                          class="focus-action focus-action--success"
                          :disabled="!activeSession || isMutating"
                          @click="completeSession"
                        >
                          提前完成
                        </button>

                        <button
                          v-if="showAdvanceButton"
                          type="button"
                          class="focus-action"
                          :disabled="isMutating"
                          @click="advanceSession"
                        >
                          下一阶段
                        </button>
                      </div>
                    </div>

                    <div class="min-h-0 flex-1 overflow-y-auto pr-1">
                      <WhiteNoiseConsole mode="focus" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <Teleport to="body">
      <Transition name="workspace-fade">
        <div v-if="pendingDeleteId" class="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 class="text-lg font-semibold text-zinc-950 dark:text-white">删除历史记录</h3>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              删除后将无法恢复，这条番茄记录和对应的时间线都会一起移除。
            </p>

            <div class="mt-6 flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                @click="pendingDeleteId = null"
              >
                取消
              </button>
              <button
                type="button"
                class="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-500"
                :disabled="isMutating"
                @click="removeSession"
              >
                {{ isMutating ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import * as pomodoroAPI from '@/api/pomodoro.js'
import { useToast } from '@/composables/useToast'
import { useAmbientMixer } from '@/composables/useAmbientMixer.js'
import { useWorkbenchSound } from '@/composables/useWorkbenchSound.js'
import BaseCard from './BaseCard.vue'
import WhiteNoiseConsole from './WhiteNoiseConsole.vue'

const { success, error } = useToast()
const { stopAll: stopAmbientPlayback } = useAmbientMixer()
const { playWorkbenchSound } = useWorkbenchSound()

const DEFAULT_PREFERENCES = {
  focusDurationMinutes: 20,
  shortBreakDurationMinutes: 5,
  longBreakDurationMinutes: 5,
  pomodorosPerCycle: 1,
  totalCycles: 1,
  defaultTaskTitle: '',
  autoStartBreaks: true,
  autoStartFocus: true,
  soundEnabled: true
}

const EMPTY_STATS = {
  todayFocusSeconds: 0,
  todayCompletedPomodoros: 0,
  todaySessionCount: 0,
  weekFocusSeconds: 0,
  allFocusSeconds: 0,
  allCompletedPomodoros: 0,
  averageSessionFocusSeconds: 0,
  completionRate: 0,
  longestSessionFocusSeconds: 0,
  streakDays: 0,
  bestDay: null,
  dailyTrend: []
}

const preferences = reactive({ ...DEFAULT_PREFERENCES })
const stats = reactive({ ...EMPTY_STATS })

const isLoading = ref(false)
const isMutating = ref(false)
const isSavingPreferences = ref(false)
const showWorkspace = ref(false)
const showFocusMode = ref(false)
const pendingDeleteId = ref(null)
const sessionTitleDraft = ref('')
const activeSession = ref(null)
const recentSessions = ref([])
const nowTick = ref(Date.now())
const handledEndedPhaseKey = ref('')
const lastMutationSignature = ref('')
const lastMutationAt = ref(0)

let clockTimer = null

const clampValue = (value, min, max, fallback) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), min), max)
}

const clampPreferenceState = () => {
  preferences.focusDurationMinutes = clampValue(preferences.focusDurationMinutes, 5, 180, DEFAULT_PREFERENCES.focusDurationMinutes)
  preferences.shortBreakDurationMinutes = clampValue(preferences.shortBreakDurationMinutes, 1, 60, DEFAULT_PREFERENCES.shortBreakDurationMinutes)
  preferences.longBreakDurationMinutes = preferences.shortBreakDurationMinutes
  preferences.pomodorosPerCycle = 1
  preferences.totalCycles = clampValue(preferences.totalCycles, 1, 12, DEFAULT_PREFERENCES.totalCycles)
}

const markSyncedSession = (session) => {
  if (!session) return null
  return {
    ...session,
    _syncedAt: Date.now()
  }
}

const applyDashboardPayload = (payload = {}) => {
  Object.assign(preferences, {
    ...DEFAULT_PREFERENCES,
    ...(payload.preferences || {})
  })
  clampPreferenceState()

  activeSession.value = markSyncedSession(payload.activeSession || null)
  recentSessions.value = Array.isArray(payload.recentSessions) ? payload.recentSessions : []

  Object.assign(stats, { ...EMPTY_STATS, ...(payload.stats || {}) })
  stats.dailyTrend = Array.isArray(payload.stats?.dailyTrend) ? payload.stats.dailyTrend : []

  if (activeSession.value) {
    sessionTitleDraft.value = activeSession.value.title || preferences.defaultTaskTitle || ''
  } else if (!sessionTitleDraft.value.trim()) {
    sessionTitleDraft.value = preferences.defaultTaskTitle || ''
  }

  if (!activeSession.value) {
    showFocusMode.value = false
  }
}

const loadDashboard = async (silent = false) => {
  if (!silent) {
    isLoading.value = true
  }

  try {
    const response = await pomodoroAPI.getPomodoroDashboard()

    if (!response.success) {
      throw new Error(response.error || '获取番茄钟数据失败')
    }

    applyDashboardPayload(response.data)
  } catch (err) {
    error('番茄钟加载失败', {
      description: err.message || '请检查后端服务是否已经启动'
    })
  } finally {
    isLoading.value = false
  }
}

const shouldBlockRepeatedMutation = (signature) => {
  const now = Date.now()

  if (
    signature &&
    lastMutationSignature.value === signature &&
    now - lastMutationAt.value < 1500
  ) {
    return true
  }

  lastMutationSignature.value = signature
  lastMutationAt.value = now
  return false
}

const liveSession = computed(() => {
  const session = activeSession.value
  if (!session) return null

  const snapshotAt = Number(session._syncedAt || nowTick.value)
  const extraSeconds = Math.max(0, Math.floor((nowTick.value - snapshotAt) / 1000))
  const remainingSeconds = session.status === 'running' && session.phaseEndsAt
    ? Math.max(0, Math.ceil((new Date(session.phaseEndsAt).getTime() - nowTick.value) / 1000))
    : Math.max(0, Number(session.remainingSeconds || 0))
  const totalFocusSeconds = Number(session.totalFocusSeconds || 0) + (session.status === 'running' && session.currentPhase === 'focus' ? extraSeconds : 0)
  const focusTargetSeconds = Number(session.focusTargetSeconds || 0)
  const progressPercent = focusTargetSeconds > 0
    ? Math.min(100, Math.round((totalFocusSeconds / focusTargetSeconds) * 100))
    : Number(session.progressPercent || 0)

  return {
    ...session,
    remainingSeconds,
    totalFocusSeconds,
    progressPercent
  }
})

const liveFocusSeconds = computed(() => Number(liveSession.value?.totalFocusSeconds || 0))

const liveSessionDescription = computed(() => {
  if (!liveSession.value) {
    return `每轮专注 ${preferences.focusDurationMinutes} 分钟，休息 ${preferences.shortBreakDurationMinutes} 分钟，共循环 ${preferences.totalCycles} 轮。`
  }

  if (liveSession.value.status === 'paused') {
    return `当前停在 ${liveSession.value.currentPhaseLabel || '当前'} 阶段，随时可以继续。`
  }

  if (liveSession.value.currentPhase === 'focus') {
    return `本轮专注结束后会进入休息，当前已完成 ${liveSession.value.completedPomodoros} / ${liveSession.value.totalCycles || preferences.totalCycles} 轮。`
  }

  return `休息结束后会自动回到下一轮专注，当前已完成 ${liveSession.value.completedPomodoros} / ${liveSession.value.totalCycles || preferences.totalCycles} 轮。`
})

const trendMaxSeconds = computed(() => {
  const values = stats.dailyTrend.map((item) => Number(item.focusSeconds || 0))
  return Math.max(...values, 1)
})

const summaryCards = computed(() => [
  {
    label: '今日专注',
    value: formatFocusMinutes(stats.todayFocusSeconds),
    hint: `${stats.todayCompletedPomodoros} 个番茄`
  },
  {
    label: '今日场次',
    value: stats.todaySessionCount,
    hint: '已记录的专注会话'
  },
  {
    label: '本周累计',
    value: formatFocusMinutes(stats.weekFocusSeconds),
    hint: `连续 ${stats.streakDays} 天保持节奏`
  },
  {
    label: '节奏稳定度',
    value: `${stats.completionRate}%`,
    hint: `平均每次 ${formatFocusMinutes(stats.averageSessionFocusSeconds)}`
  }
])

const analysisCards = computed(() => [
  {
    label: '今日专注',
    value: formatFocusMinutes(stats.todayFocusSeconds),
    hint: `今天完成了 ${stats.todayCompletedPomodoros} 个番茄`
  },
  {
    label: '连续天数',
    value: `${stats.streakDays} 天`,
    hint: '最近连续有专注记录的天数'
  },
  {
    label: '单次最长',
    value: formatFocusMinutes(stats.longestSessionFocusSeconds),
    hint: '历史上最长的一次深度专注'
  },
  {
    label: '最佳一天',
    value: stats.bestDay?.focusSeconds ? formatFocusMinutes(stats.bestDay.focusSeconds) : '暂无',
    hint: stats.bestDay?.date ? `${stats.bestDay.date} 表现最好` : '继续启动第一轮专注'
  },
  {
    label: '历史总计',
    value: formatFocusMinutes(stats.allFocusSeconds),
    hint: `${stats.allCompletedPomodoros} 个番茄已经沉淀`
  },
  {
    label: '节奏稳定度',
    value: `${stats.completionRate}%`,
    hint: '最近一周有专注记录的天数占比'
  }
])

const analysisInsights = computed(() => {
  const insights = []

  if (stats.todayFocusSeconds > 0) {
    insights.push(`今天已经投入 ${formatFocusMinutes(stats.todayFocusSeconds)}，继续保持会让这一周更稳。`)
  } else {
    insights.push(`今天还没有开始专注，建议先启动一轮 ${preferences.focusDurationMinutes} 分钟，把节奏拉起来。`)
  }

  if (stats.completionRate >= 80) {
    insights.push('最近节奏非常稳定，保持当前专注与休息的衔接就很好。')
  } else if (stats.completionRate >= 50) {
    insights.push('最近节奏还不错，如果分心变多，可以先把休息时间调顺一点。')
  } else {
    insights.push('最近节奏还不够稳定，先用更清晰的任务标题把每轮专注切小一些会更容易进入状态。')
  }

  if (stats.bestDay?.focusSeconds) {
    insights.push(`最近表现最好的是 ${stats.bestDay.date}，当天累计了 ${formatFocusMinutes(stats.bestDay.focusSeconds)}。`)
  }

  return insights.slice(0, 3)
})

const timelineItems = computed(() => {
  const list = liveSession.value?.timeline || []
  return [...list].reverse().slice(0, 8)
})

const ringCircumference = 2 * Math.PI * 92
const ringDashOffset = computed(() => ringCircumference * (1 - Number((liveSession.value?.progressPercent || 0) / 100)))
const showAdvanceButton = computed(() => Boolean(activeSession.value) && Number(liveSession.value?.remainingSeconds || 0) <= 0)
const canRenameSession = computed(() => Boolean(activeSession.value) && sessionTitleDraft.value.trim() && sessionTitleDraft.value.trim() !== activeSession.value?.title)
const livePhaseKey = computed(() => {
  const session = liveSession.value
  if (!session?.id) return ''

  return [
    session.id,
    session.currentPhase || 'idle',
    session.currentPomodoro || 0,
    session.phaseEndsAt || session.remainingSeconds || 0
  ].join(':')
})

const controlHint = computed(() => {
  if (!activeSession.value) {
    return '启动后会自动进入第一阶段专注，并把整个过程写入历史记录。'
  }

  if (activeSession.value.status === 'paused') {
    return '当前已暂停，点击继续后会从剩余时间接着往下走。'
  }

  if (showAdvanceButton.value) {
    return '当前阶段已经结束，音乐已暂停，点击“进入下一阶段”即可继续。'
  }

  return '如果你已经完成当前任务，也可以直接点击“提前完成”收口这次专注。'
})

const formatDuration = (seconds = 0) => {
  const safe = Math.max(0, Number(seconds || 0))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const remainSeconds = safe % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`
}

const formatFocusMinutes = (seconds = 0) => {
  const safe = Math.max(0, Number(seconds || 0))
  const totalMinutes = Math.round(safe / 60)

  if (totalMinutes >= 60) {
    const hours = (safe / 3600).toFixed(1).replace(/\.0$/, '')
    return `${hours} 小时`
  }

  return `${totalMinutes} 分钟`
}

const formatDateTime = (value) => {
  if (!value) return '暂无时间'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间无效'

  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const trendBarStyle = (seconds = 0) => {
  const height = Math.max(12, Math.round((Number(seconds || 0) / trendMaxSeconds.value) * 100))
  return {
    height: `${height}%`
  }
}

const sessionStatusLabel = (status) => {
  switch (status) {
    case 'running':
      return '进行中'
    case 'paused':
      return '已暂停'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return status || '未知状态'
  }
}

const openWorkspace = () => {
  showWorkspace.value = true
}

const openFocusMode = () => {
  if (!activeSession.value) return
  showFocusMode.value = true
}

const savePreferences = async () => {
  if (isSavingPreferences.value) return
  clampPreferenceState()
  isSavingPreferences.value = true

  const payload = {
    ...preferences,
    defaultTaskTitle: sessionTitleDraft.value.trim() || preferences.defaultTaskTitle || ''
  }

  try {
    const response = await pomodoroAPI.updatePomodoroPreferences(payload)

    if (!response.success) {
      throw new Error(response.error || '保存默认配置失败')
    }

    Object.assign(preferences, response.data)
    success('默认参数已保存')
  } catch (err) {
    error('保存失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isSavingPreferences.value = false
  }
}

const syncConflictSession = (response) => {
  const conflictSession = response?.details?.data?.activeSession
  if (conflictSession) {
    activeSession.value = markSyncedSession(conflictSession)
    sessionTitleDraft.value = conflictSession.title || sessionTitleDraft.value
  }
}

const startSession = async () => {
  if (isMutating.value || shouldBlockRepeatedMutation('session:start')) return
  clampPreferenceState()
  isMutating.value = true

  try {
    const response = await pomodoroAPI.createPomodoroSession({
      title: sessionTitleDraft.value.trim() || preferences.defaultTaskTitle || '今日专注任务',
      ...preferences
    })

    if (!response.success) {
      syncConflictSession(response)
      throw new Error(response.error || '启动番茄钟失败')
    }

    void playWorkbenchSound('focus_start', { focusSoundEnabled: preferences.soundEnabled })
    success('番茄钟已启动')
    showWorkspace.value = true
    await loadDashboard(true)
  } catch (err) {
    void playWorkbenchSound('error')
    error('启动失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isMutating.value = false
  }
}

const runAction = async (action, payload = {}, options = {}) => {
  if (!activeSession.value) return false
  if (isMutating.value) return false

  const sessionId = activeSession.value.id
  if (shouldBlockRepeatedMutation(`session:${sessionId}:${action}`)) {
    return false
  }

  isMutating.value = true

  try {
    const response = await pomodoroAPI.runPomodoroAction(activeSession.value.id, {
      action,
      ...payload
    })

    if (!response.success) {
      throw new Error(response.error || '番茄钟操作失败')
    }

    if (!options.silentSuccess) {
      success(options.successMessage || '操作成功')
    }

    if (options.soundEvent) {
      void playWorkbenchSound(options.soundEvent, { focusSoundEnabled: activeSession.value?.soundEnabled ?? preferences.soundEnabled })
    }

    await loadDashboard(true)
    return true
  } catch (err) {
    void playWorkbenchSound('error')
    error(options.errorTitle || '操作失败', {
      description: err.message || '请稍后重试'
    })
    return false
  } finally {
    isMutating.value = false
  }
}

const pauseSession = () => runAction('pause', {}, {
  successMessage: '已暂停番茄钟',
  errorTitle: '暂停失败'
})

const resumeSession = () => runAction('resume', {}, {
  successMessage: '已继续专注',
  errorTitle: '继续失败',
  soundEvent: 'focus_start'
})

const completeSession = () => runAction('complete', {}, {
  successMessage: '本次专注已完成',
  errorTitle: '完成失败',
  soundEvent: 'focus_end'
})

const cancelSession = () => runAction('cancel', {}, {
  successMessage: '已取消当前番茄钟',
  errorTitle: '取消失败',
  soundEvent: 'dismiss'
})

const advanceSession = (silentSuccess = false) => runAction('advance', {}, {
  successMessage: '已进入下一阶段',
  errorTitle: '阶段切换失败',
  silentSuccess
})

const renameSession = async () => {
  if (!canRenameSession.value) return

  await runAction('rename', { title: sessionTitleDraft.value.trim() }, {
    successMessage: '任务标题已更新',
    errorTitle: '更新标题失败'
  })
}

const removeSession = async () => {
  if (!pendingDeleteId.value) return
  if (isMutating.value || shouldBlockRepeatedMutation(`session:delete:${pendingDeleteId.value}`)) return

  isMutating.value = true

  try {
    const response = await pomodoroAPI.deletePomodoroSession(pendingDeleteId.value)

    if (!response.success) {
      throw new Error(response.error || '删除历史记录失败')
    }

    pendingDeleteId.value = null
    success('历史记录已删除')
    await loadDashboard(true)
  } catch (err) {
    error('删除失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isMutating.value = false
  }
}

const handlePrimarySessionAction = () => {
  if (!activeSession.value) {
    startSession()
    return
  }

  if (activeSession.value.status === 'paused') {
    resumeSession()
    return
  }

  pauseSession()
}

const syncClock = async () => {
  nowTick.value = Date.now()

  if (!liveSession.value || liveSession.value.status !== 'running') return
  if (liveSession.value.remainingSeconds > 0) {
    if (handledEndedPhaseKey.value === livePhaseKey.value) {
      handledEndedPhaseKey.value = ''
    }
    return
  }

  if (!livePhaseKey.value || handledEndedPhaseKey.value === livePhaseKey.value) return

  handledEndedPhaseKey.value = livePhaseKey.value

  try {
    stopAmbientPlayback()
  } catch (stopError) {
    console.warn('Failed to stop ambient playback after phase end:', stopError)
  }
}

const startClock = () => {
  if (clockTimer) return
  clockTimer = window.setInterval(syncClock, 1000)
}

const stopClock = () => {
  if (!clockTimer) return
  window.clearInterval(clockTimer)
  clockTimer = null
}

onMounted(async () => {
  startClock()
  await loadDashboard()
})

onBeforeUnmount(() => {
  stopClock()
})
</script>

<style scoped>
.input-token {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(228, 228, 231, 0.95);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.68rem 0.92rem;
  color: rgb(24, 24, 27);
  outline: none;
  transition: all 0.2s ease;
}

.dark .input-token {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(9, 9, 11, 0.82);
  color: white;
}

.input-token:focus {
  border-color: rgb(24, 24, 27);
}

.dark .input-token:focus {
  border-color: white;
}

.input-token--preview {
  padding: 0.5rem 0.75rem;
  border-radius: 0.9rem;
  font-size: 0.8125rem;
}

.toggle-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(228, 228, 231, 0.95);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.58rem 0.9rem;
  font-size: 0.875rem;
  color: rgb(39, 39, 42);
  transition: all 0.2s ease;
}

.dark .toggle-chip {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(9, 9, 11, 0.82);
  color: rgba(244, 244, 245, 0.92);
}

.toggle-chip--preview {
  gap: 0.35rem;
  padding: 0.42rem 0.72rem;
  font-size: 0.75rem;
}

.toggle-chip:has(input:checked) {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.08);
  color: rgb(6, 95, 70);
}

.dark .toggle-chip:has(input:checked) {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.15);
  color: rgb(167, 243, 208);
}

.timer-shell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-shell--focus {
  filter: drop-shadow(0 0 48px rgba(255, 255, 255, 0.08));
}

.timer-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
  text-align: center;
}

.control-button {
  border-radius: 1rem;
  border: 1px solid rgba(228, 228, 231, 0.95);
  background: rgba(255, 255, 255, 0.96);
  padding: 0.85rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(39, 39, 42);
  transition: all 0.2s ease;
}

.control-button:hover {
  border-color: rgba(161, 161, 170, 0.95);
  background: rgba(250, 250, 250, 1);
}

.dark .control-button {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(9, 9, 11, 0.82);
  color: rgba(244, 244, 245, 0.94);
}

.dark .control-button:hover {
  border-color: rgba(113, 113, 122, 0.95);
}

.control-button:disabled,
.focus-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.control-button--primary {
  border-color: rgb(5, 150, 105);
  background: rgb(5, 150, 105);
  color: white;
}

.control-button--primary:hover {
  border-color: rgb(4, 120, 87);
  background: rgb(4, 120, 87);
}

.control-button--success {
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(16, 185, 129, 0.09);
  color: rgb(6, 95, 70);
}

.dark .control-button--success {
  border-color: rgba(16, 185, 129, 0.36);
  background: rgba(16, 185, 129, 0.16);
  color: rgb(167, 243, 208);
}

.control-button--danger {
  border-color: rgba(220, 38, 38, 0.2);
  background: rgba(220, 38, 38, 0.08);
  color: rgb(153, 27, 27);
}

.dark .control-button--danger {
  border-color: rgba(248, 113, 113, 0.25);
  background: rgba(248, 113, 113, 0.12);
  color: rgb(254, 202, 202);
}

.focus-action {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.9rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  transition: all 0.2s ease;
}

.focus-action:hover {
  background: rgba(255, 255, 255, 0.12);
}

.focus-action--primary {
  border-color: rgba(16, 185, 129, 0.42);
  background: rgba(16, 185, 129, 0.18);
  color: rgb(209, 250, 229);
}

.focus-action--primary:hover {
  background: rgba(16, 185, 129, 0.24);
}

.focus-action--success {
  border-color: rgba(59, 130, 246, 0.36);
  background: rgba(59, 130, 246, 0.16);
  color: rgb(191, 219, 254);
}

.focus-action--success:hover {
  background: rgba(59, 130, 246, 0.22);
}

.workspace-fade-enter-active,
.workspace-fade-leave-active {
  transition: opacity 0.2s ease;
}

.workspace-fade-enter-from,
.workspace-fade-leave-to {
  opacity: 0;
}

.focus-ambient-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(36px);
  opacity: 0.45;
  mix-blend-mode: screen;
  animation: focus-orb-float 18s ease-in-out infinite;
  pointer-events: none;
}

.focus-ambient-orb--one {
  top: -6rem;
  left: -5rem;
  width: 24rem;
  height: 24rem;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.28), transparent 70%);
}

.focus-ambient-orb--two {
  top: 14%;
  right: -4rem;
  width: 18rem;
  height: 18rem;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22), transparent 72%);
  animation-duration: 22s;
}

.focus-ambient-orb--three {
  right: 24%;
  bottom: -7rem;
  width: 30rem;
  height: 30rem;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 72%);
  animation-duration: 26s;
}

.focus-stage-panel {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 24px 80px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(28px);
}

.focus-stage-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 42%);
  pointer-events: none;
}

.focus-metric-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  padding: 1rem;
  backdrop-filter: blur(20px);
}

.focus-metric-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 55%);
  pointer-events: none;
}

@keyframes focus-orb-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(0, -18px, 0) scale(1.06);
  }
}
</style>



