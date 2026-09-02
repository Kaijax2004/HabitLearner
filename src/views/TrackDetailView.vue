<template>
  <AppLayout title="轨道详情" :show-back-button="true">
    <div class="track-detail-page space-y-5">
      <section v-if="isLoading" class="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-8 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div class="h-8 w-48 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-900"></div>
        <div class="mt-5 h-28 animate-pulse rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-900"></div>
      </section>

      <section v-else-if="errorMessage" class="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
        {{ errorMessage }}
      </section>

      <template v-else-if="track">
        <section
          class="track-detail-hero rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8"
          :style="{ '--track-color': track.color || '#18181b' }"
        >
          <div class="grid gap-6 xl:grid-cols-2 xl:items-end">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">{{ typeLabel(track.type) }} Track</p>
              <h1 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white lg:text-5xl">{{ track.name }}</h1>
              <p class="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {{ track.overview?.todayStatus || '这条轨道正在等待更多真实记录。' }}
              </p>
            </div>

            <div class="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-white/5">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">下一步行动</p>
              <p class="mt-3 text-sm leading-7 text-zinc-800 dark:text-zinc-100">{{ track.overview?.nextAction || '为这条轨道补充一个下一步行动。' }}</p>
            </div>
          </div>
        </section>

        <section class="grid gap-5 xl:grid-cols-2">
          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <div class="space-y-5">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Seven Days</p>
                  <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">最近 7 天趋势</h2>
                </div>
                <span class="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
                  来自真实记录
                </span>
              </div>

              <div class="relative flex h-56 items-end gap-2 rounded-[1.6rem] border border-zinc-200/80 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-white/5">
                <div v-if="!trendHasData" class="absolute inset-0 flex items-center justify-center px-6 text-center text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                  这条轨道最近 7 天还没有可统计记录，完成一次行动后这里会开始生成趋势。
                </div>
                <div v-for="point in trendBars" :key="point.date" class="relative z-10 flex h-full flex-1 flex-col justify-end gap-2">
                  <div class="relative flex flex-1 items-end">
                    <span class="track-detail-bar" :style="{ height: `${point.height}%` }" :title="`${point.date}: ${point.value}`"></span>
                  </div>
                  <p class="truncate text-center text-[11px] text-zinc-500 dark:text-zinc-400">{{ point.label }}</p>
                </div>
              </div>

              <div class="grid gap-3 lg:grid-cols-3">
                <div
                  v-for="item in trackInsightCards"
                  :key="item.title"
                  class="track-insight-card"
                >
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                  <h3 class="mt-2 text-base font-semibold text-zinc-950 dark:text-white">{{ item.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ item.description }}</p>
                </div>
              </div>

              <div class="track-learning-notes-panel">
                <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Learning Notes</p>
                    <h3 class="mt-2 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">轨道沉淀</h3>
                    <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      从学习工作区沉淀过来的收获，会先作为长期证据保存在这里。
                    </p>
                  </div>
                  <span class="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
                    {{ trackLearningNotes.length }} 条
                  </span>
                </div>

                <div v-if="trackLearningNotes.length" class="mt-4 space-y-3">
                  <article
                    v-for="(note, index) in trackLearningNotes"
                    :key="getNoteKey(note, index)"
                    class="track-learning-note"
                  >
                    <template v-if="editingNoteKey === getNoteKey(note, index)">
                      <textarea
                        v-model="editingNoteContent"
                        class="track-note-editor"
                        rows="5"
                        placeholder="整理这条轨道沉淀..."
                      ></textarea>
                      <div class="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          class="track-note-action is-primary"
                          :disabled="updatingNoteKey === getNoteKey(note, index)"
                          @click="saveEditedNote(note, index)"
                        >
                          保存
                        </button>
                        <button type="button" class="track-note-action" @click="cancelEditNote">
                          取消
                        </button>
                      </div>
                    </template>

                    <template v-else>
                      <p class="whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-200">{{ note.content }}</p>
                      <div class="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                        <p class="text-xs text-zinc-400">{{ formatDateTime(note.createdAt) }}</p>
                        <div class="flex flex-wrap gap-2">
                          <button type="button" class="track-note-action" @click="startEditNote(note, index)">
                            编辑
                          </button>
                          <button
                            type="button"
                            class="track-note-action"
                            :disabled="updatingNoteKey === getNoteKey(note, index)"
                            @click="sendNoteToReview(note, index)"
                          >
                            转复盘
                          </button>
                          <button
                            type="button"
                            class="track-note-action is-danger"
                            :disabled="updatingNoteKey === getNoteKey(note, index)"
                            @click="deleteLearningNote(note, index)"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </template>
                  </article>
                </div>

                <div v-else class="mt-4 rounded-[1.35rem] border border-dashed border-zinc-200 px-4 py-8 text-center text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  暂无轨道沉淀。可以在学习工作区把一条学习笔记“沉到轨道”，这里就会出现长期证据。
                </div>
              </div>
            </div>
          </BaseCard>

          <aside class="space-y-5">
            <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Track Goal</p>
                  <h3 class="mt-2 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">轨道目标</h3>
                </div>
                <button class="track-small-button" type="button" @click="toggleTrackConfigEditor">
                  {{ editingTrackConfig ? '收起' : '编辑' }}
                </button>
              </div>

              <div v-if="editingTrackConfig" class="mt-4 space-y-3">
                <label class="track-config-label">
                  <span>长期目标</span>
                  <textarea
                    v-model="trackGoalDraft"
                    class="track-note-editor"
                    rows="4"
                    placeholder="例如：把学习输入沉淀成每周可执行的行动实验。"
                  ></textarea>
                </label>
                <label class="track-config-label">
                  <span>下一步行动</span>
                  <textarea
                    v-model="trackNextActionDraft"
                    class="track-note-editor"
                    rows="3"
                    placeholder="例如：今晚整理一条学习笔记，并转成明天 20 分钟计划块。"
                  ></textarea>
                </label>
                <label class="track-config-label">
                  <span>关键问题</span>
                  <textarea
                    v-model="trackQuestionDraft"
                    class="track-note-editor"
                    rows="2"
                    placeholder="例如：这条轨道最近最容易掉队的地方是什么？"
                  ></textarea>
                </label>
                <label class="track-config-label">
                  <span>下一步期限</span>
                  <input
                    v-model="trackNextActionDueDraft"
                    class="track-config-input"
                    maxlength="40"
                    placeholder="例如：今天 / 72 小时内 / 本周"
                  />
                </label>
                <label class="track-config-label">
                  <span>里程碑（每行一条）</span>
                  <textarea
                    v-model="trackMilestonesDraft"
                    class="track-note-editor"
                    rows="3"
                    placeholder="连续 7 天不断线&#10;每周沉淀 3 条证据"
                  ></textarea>
                </label>
                <label class="track-config-label">
                  <span>硬窗口（每行一条）</span>
                  <textarea
                    v-model="trackHardWindowsDraft"
                    class="track-note-editor"
                    rows="3"
                    placeholder="早晨启动&#10;睡前收口"
                  ></textarea>
                </label>
                <button class="track-action-button w-full text-center" type="button" :disabled="savingTrackConfig" @click="saveTrackConfig">
                  {{ savingTrackConfig ? '保存中...' : '保存轨道目标' }}
                </button>
              </div>

              <div v-else class="mt-4 space-y-3">
                <div class="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">长期目标</p>
                  <p class="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">{{ trackGoal }}</p>
                </div>
                <div class="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">下一步行动</p>
                  <p class="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">{{ trackNextAction }}</p>
                </div>
                <button class="track-action-button w-full text-center" type="button" :disabled="creatingTrackReview" @click="createTrackReviewPrompt">
                  {{ creatingTrackReview ? '生成中...' : '带入今日复盘' }}
                </button>
              </div>
            </BaseCard>

            <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">OOS Base</p>
              <h3 class="mt-2 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">轨道底座</h3>
              <div class="mt-4 space-y-4">
                <div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">核心视图</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="view in semanticViews"
                      :key="view"
                      class="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {{ view }}
                    </span>
                  </div>
                </div>

                <div class="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">关键问题</p>
                  <p class="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">{{ trackSemantic.needsQuestion || '这条轨道还需要补充一个长期问题。' }}</p>
                  <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {{ trackSemantic.archetype || typeLabel(track.type) }} · {{ trackSemantic.nextActionDue || '今日' }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">里程碑</p>
                  <div class="mt-2 space-y-2">
                    <p v-for="item in semanticMilestones" :key="item" class="track-semantic-line">{{ item }}</p>
                  </div>
                </div>

                <div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">硬窗口</p>
                  <div class="mt-2 space-y-2">
                    <p v-for="item in semanticHardWindows" :key="item" class="track-semantic-line">{{ item }}</p>
                  </div>
                </div>

                <div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">真实证据</p>
                  <div class="mt-2 space-y-2">
                    <p v-for="item in semanticEvidence" :key="item" class="track-semantic-line">{{ item }}</p>
                  </div>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">关键指标</p>
              <div class="mt-4 space-y-3">
                <div v-for="item in metricCards" :key="item.label" class="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
                  <p class="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">{{ item.value }}</p>
                  <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.hint }}</p>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">进入工作区</p>
              <div class="mt-4 grid gap-2">
                <button
                  v-for="entry in actionEntries"
                  :key="entry.label"
                  type="button"
                  class="track-action-button"
                  @click="entry.action"
                >
                  {{ entry.label }}
                </button>
              </div>
            </BaseCard>

            <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">下一步建议</p>
              <div class="mt-4 space-y-3">
                <div
                  v-for="suggestion in nextStepSuggestions"
                  :key="suggestion.title"
                  class="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5"
                >
                  <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ suggestion.title }}</p>
                  <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ suggestion.description }}</p>
                  <button class="track-small-button mt-3" type="button" @click="suggestion.action">
                    {{ suggestion.actionLabel }}
                  </button>
                </div>
              </div>
            </BaseCard>
          </aside>
        </section>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { listTracks, updateTrack } from '@/api/tracks.js'
import { createQuickCapture, linkQuickCapture } from '@/api/workspace.js'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()
const track = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const editingNoteKey = ref('')
const editingNoteContent = ref('')
const updatingNoteKey = ref('')
const editingTrackConfig = ref(false)
const trackGoalDraft = ref('')
const trackNextActionDraft = ref('')
const trackQuestionDraft = ref('')
const trackNextActionDueDraft = ref('')
const trackMilestonesDraft = ref('')
const trackHardWindowsDraft = ref('')
const savingTrackConfig = ref(false)
const creatingTrackReview = ref(false)

const typeLabel = (type) => ({
  habit: '习惯',
  learning: '学习',
  focus: '专注',
  project: '计划',
  pipeline: '内容创作',
  custom: '自定义'
}[type] || '轨道')

const trendBars = computed(() => {
  const trend = Array.isArray(track.value?.overview?.recentTrend) ? track.value.overview.recentTrend : []
  const safeTrend = trend.length ? trend : Array.from({ length: 7 }, (_, index) => ({ date: `D${index + 1}`, value: 0 }))
  const max = Math.max(...safeTrend.map((item) => Number(item.value || 0)), 1)
  return safeTrend.map((item) => ({
    ...item,
    label: String(item.date || '').slice(5) || item.date,
    height: Math.max(8, Math.round((Number(item.value || 0) / max) * 100))
  }))
})

const trendHasData = computed(() => trendBars.value.some((point) => Number(point.value || 0) > 0))
const trendTotal = computed(() => trendBars.value.reduce((sum, point) => sum + Number(point.value || 0), 0))
const trendActiveDays = computed(() => trendBars.value.filter((point) => Number(point.value || 0) > 0).length)
const latestTrendValue = computed(() => Number(trendBars.value[trendBars.value.length - 1]?.value || 0))
const trackLearningNotes = computed(() => {
  const notes = track.value?.config?.learningNotes
  return Array.isArray(notes) ? notes.slice(0, 8) : []
})
const previousTrendAverage = computed(() => {
  const previous = trendBars.value.slice(0, -1)
  if (!previous.length) return 0
  return previous.reduce((sum, point) => sum + Number(point.value || 0), 0) / previous.length
})

const trackGoal = computed(() => track.value?.config?.goal || '还没有写下长期目标。可以先用一句话描述这条轨道希望帮助你持续推进什么。')
const trackNextAction = computed(() => track.value?.config?.nextAction || track.value?.overview?.nextAction || '为这条轨道补充一个 24-72 小时内能完成的小动作。')
const trackSemantic = computed(() => track.value?.overview?.semantic || {})
const semanticViews = computed(() => (
  Array.isArray(trackSemantic.value.views) && trackSemantic.value.views.length
    ? trackSemantic.value.views
    : ['基础视图', '行动证据']
))
const semanticMilestones = computed(() => (
  Array.isArray(trackSemantic.value.milestones) && trackSemantic.value.milestones.length
    ? trackSemantic.value.milestones
    : ['补充长期目标', '沉淀第一条证据']
))
const semanticHardWindows = computed(() => (
  Array.isArray(trackSemantic.value.hardWindows) && trackSemantic.value.hardWindows.length
    ? trackSemantic.value.hardWindows
    : ['暂无固定窗口']
))
const semanticEvidence = computed(() => (
  Array.isArray(trackSemantic.value.evidence) && trackSemantic.value.evidence.length
    ? trackSemantic.value.evidence
    : ['暂无真实证据，完成一次行动后这里会自动补充。']
))

const joinLines = (items = []) => (
  Array.isArray(items) ? items.map((item) => String(item || '').trim()).filter(Boolean).join('\n') : ''
)

const splitLines = (value = '') => (
  String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
)

const trendDirection = computed(() => {
  if (!trendHasData.value) return 'empty'
  if (latestTrendValue.value > previousTrendAverage.value) return 'up'
  if (latestTrendValue.value < previousTrendAverage.value) return 'down'
  return 'flat'
})

const trackInsightCards = computed(() => {
  const type = track.value?.type
  const unit = {
    habit: '次打卡',
    learning: '次学习活动',
    focus: '分钟专注',
    project: '项计划压力',
    custom: '条记录'
  }[type] || '条记录'

  const statusTitle = trendHasData.value ? `7 天共 ${trendTotal.value} ${unit}` : '暂无可解释趋势'
  const statusDescription = trendHasData.value
    ? `最近 7 天有 ${trendActiveDays.value} 天留下记录，今天记录为 ${latestTrendValue.value}。`
    : '这条轨道还缺少真实记录，先完成一次行动，系统再开始解释节奏。'

  const directionTitle = {
    empty: '等待第一次推进',
    up: '今天高于近期均值',
    down: '今天低于近期均值',
    flat: '节奏基本持平'
  }[trendDirection.value]

  const directionDescription = {
    empty: '不要先追求复杂统计，先让轨道出现第一条可验证记录。',
    up: '今天已经有明显推进，可以顺手记录一个有效动作，方便复盘复用。',
    down: '今天推进偏弱，建议把下一步缩小到 5-20 分钟内能完成。',
    flat: '当前节奏稳定，适合保持同一类小动作，不急着加码。'
  }[trendDirection.value]

  return [
    { label: 'Evidence', title: statusTitle, description: statusDescription },
    { label: 'Direction', title: directionTitle, description: directionDescription },
    { label: 'Focus', title: track.value?.overview?.nextAction || '补一个下一步行动', description: '轨道页只做长期判断，具体执行仍回到对应工作区完成。' }
  ]
})

const metricCards = computed(() => {
  const metrics = track.value?.overview?.metrics || {}
  const type = track.value?.type

  if (type === 'habit') {
    return [
      { label: '习惯总数', value: metrics.totalHabits || 0, hint: '当前正在追踪的习惯数量' },
      { label: '今日打卡', value: metrics.todayCheckIns || 0, hint: '今天已经完成的打卡数' },
      { label: '今日完成度', value: `${metrics.completionRate || 0}%`, hint: '今日打卡数占习惯总数的比例' }
    ]
  }

  if (type === 'learning') {
    return [
      { label: '学习笔记', value: metrics.noteCount || 0, hint: '已沉淀的学习笔记数量' },
      { label: '学习完成', value: metrics.completionCount || 0, hint: '已经完成的学习记录数量' },
      { label: '7 天活动', value: metrics.weekActivity || 0, hint: '最近 7 天学习笔记与完成记录合计' },
      { label: '轨道沉淀', value: trackLearningNotes.value.length, hint: '从学习页直接沉淀到这条轨道的记录' }
    ]
  }

  if (type === 'focus') {
    return [
      { label: '今日专注', value: `${metrics.todayMinutes || 0} 分钟`, hint: '今天累计专注时长' },
      { label: '本周专注', value: `${metrics.weekMinutes || 0} 分钟`, hint: '最近 7 天累计专注时长' },
      { label: '完成番茄', value: metrics.completedPomodoros || 0, hint: '最近 7 天完成的番茄数量' }
    ]
  }

  if (type === 'project') {
    return [
      { label: '进行中计划', value: metrics.openPlans || 0, hint: '尚未完成或归档的计划' },
      { label: '72 小时内', value: metrics.dueSoon || 0, hint: '近期需要处理的计划' },
      { label: '计划块', value: metrics.blockCount || 0, hint: '已拆解的计划内容块数量' }
    ]
  }

  if (type === 'pipeline') {
    return [
      { label: '内容阶段', value: '7', hint: '信号到复盘的完整流水线阶段' },
      { label: '今日重点', value: '选题', hint: '先从一个真实来源开始推进' },
      { label: '下一步', value: '研究', hint: '把信号转成可验证的内容角度' }
    ]
  }

  return [
    { label: '轨道类型', value: typeLabel(type), hint: '自定义轨道可继续补充目标和记录' }
  ]
})

const actionEntries = computed(() => {
  const type = track.value?.type
  const entries = []

  if (type === 'habit') entries.push({ label: '进入今日习惯', action: () => router.push('/dashboard') })
  if (type === 'learning') entries.push({ label: '进入学习工作区', action: () => router.push('/learning') })
  if (type === 'focus') entries.push({ label: '进入专注工作区', action: () => router.push('/focus') })
  if (type === 'project') entries.push({ label: '进入计划工作区', action: () => router.push('/plan') })
  if (type === 'pipeline') entries.push({ label: '进入内容工作区', action: () => router.push('/creator') })

  entries.push({ label: '回到轨道总览', action: () => router.push('/tracks') })
  return entries
})

const nextStepSuggestions = computed(() => {
  const type = track.value?.type
  const weakTrend = !trendHasData.value || trendDirection.value === 'down'

  if (type === 'habit') {
    return [
      {
        title: weakTrend ? '先补一个最容易完成的习惯' : '保持今天的习惯节奏',
        description: weakTrend ? '不要一次调整所有习惯，先选择阻力最低的一项打卡。' : '今天节奏不错，可以进入今日页继续处理其它工作区。',
        actionLabel: '进入今日',
        action: () => router.push('/dashboard')
      },
      {
        title: '晚上做一次习惯复盘',
        description: '记录哪个习惯最容易卡住，为明天降低启动阻力。',
        actionLabel: '写复盘',
        action: () => router.push('/review')
      }
    ]
  }

  if (type === 'learning') {
    return [
      {
        title: weakTrend ? '完成一张今日学习卡' : '把最新笔记转成行动',
        description: weakTrend ? '学习轨道先恢复输入，不需要一次学很多。' : '如果已经有笔记，可以把它转成复盘问题或习惯实验。',
        actionLabel: '学习工作区',
        action: () => router.push('/learning')
      },
      {
        title: '整理一个学习收获',
        description: '把今天的一个收获先放进收集箱，后续再决定转计划还是习惯。',
        actionLabel: '打开收集箱',
        action: () => router.push('/captures')
      }
    ]
  }

  if (type === 'focus') {
    return [
      {
        title: weakTrend ? '开一轮短专注' : '延续当前专注节奏',
        description: weakTrend ? '先用一轮短专注把状态启动起来。' : '保持已有节奏，继续用任务标题沉淀专注记录。',
        actionLabel: '专注工作区',
        action: () => router.push('/focus')
      },
      {
        title: '复盘专注卡点',
        description: '如果专注被打断，记录原因比强行延长时长更有价值。',
        actionLabel: '写复盘',
        action: () => router.push('/review')
      }
    ]
  }

  if (type === 'project') {
    return [
      {
        title: weakTrend ? '从待安排池挑一个计划块' : '推进最近的计划块',
        description: '计划轨道的关键不是写更多，而是把下一步安排到具体日期。',
        actionLabel: '计划工作区',
        action: () => router.push('/plan')
      },
      {
        title: '把临时任务收进箱子',
        description: '不确定怎么安排的任务先进入收集箱，避免散落在脑子里。',
        actionLabel: '打开收集箱',
        action: () => router.push('/captures')
      }
    ]
  }

  if (type === 'pipeline') {
    return [
      {
        title: weakTrend ? '先放入一个真实信号或选题' : '推进当前内容阶段',
        description: '内容轨道不追求一次写完，先让一个条目从收件箱向前移动。',
        actionLabel: '打开内容创作',
        action: () => router.push('/creator')
      },
      {
        title: '给内容保留来源和发布时间',
        description: '有来源的素材才方便后续研究、引用和复盘。',
        actionLabel: '内容工作区',
        action: () => router.push('/creator')
      }
    ]
  }

  return [
    {
      title: '给自定义轨道补一个下一步',
      description: '先定义一个 24-72 小时内能完成的小动作。',
      actionLabel: '打开收集箱',
      action: () => router.push('/captures')
    }
  ]
})

const loadTrack = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const response = await listTracks({ includeArchived: true })
  isLoading.value = false

  if (!response.success) {
    errorMessage.value = response.error || '轨道加载失败'
    return
  }

  const id = String(route.params.id)
  track.value = (response.data || []).find((item) => String(item.id) === id) || null
  if (!track.value) {
    errorMessage.value = '轨道不存在或当前账户无权访问'
  }
}

const toggleTrackConfigEditor = () => {
  editingTrackConfig.value = !editingTrackConfig.value
  if (editingTrackConfig.value) {
    trackGoalDraft.value = track.value?.config?.goal || ''
    trackNextActionDraft.value = track.value?.config?.nextAction || track.value?.overview?.nextAction || ''
    trackQuestionDraft.value = trackSemantic.value.needsQuestion || ''
    trackNextActionDueDraft.value = trackSemantic.value.nextActionDue || ''
    trackMilestonesDraft.value = joinLines(semanticMilestones.value)
    trackHardWindowsDraft.value = joinLines(semanticHardWindows.value)
  }
}

const saveTrackConfig = async () => {
  if (!track.value?.id) return
  savingTrackConfig.value = true
  const currentConfig = track.value.config && typeof track.value.config === 'object' ? track.value.config : {}
  const nextConfig = {
    ...currentConfig,
    goal: trackGoalDraft.value.trim(),
    nextAction: trackNextActionDraft.value.trim(),
    needsQuestion: trackQuestionDraft.value.trim(),
    nextActionDue: trackNextActionDueDraft.value.trim(),
    milestones: splitLines(trackMilestonesDraft.value),
    hardWindows: splitLines(trackHardWindowsDraft.value)
  }
  const response = await updateTrack(track.value.id, { config: nextConfig })
  savingTrackConfig.value = false

  if (!response.success) {
    showError('轨道目标保存失败', { description: response.error || '请稍后重试' })
    return
  }

  track.value = {
    ...track.value,
    config: nextConfig,
    overview: {
      ...(track.value.overview || {}),
      nextAction: nextConfig.nextAction || track.value?.overview?.nextAction,
      semantic: {
        ...(track.value.overview?.semantic || {}),
        needsQuestion: nextConfig.needsQuestion,
        nextActionDue: nextConfig.nextActionDue,
        milestones: nextConfig.milestones,
        hardWindows: nextConfig.hardWindows
      }
    }
  }
  editingTrackConfig.value = false
  success('轨道目标已保存')
}

const createTrackReviewPrompt = async () => {
  if (!track.value?.id || creatingTrackReview.value) return
  creatingTrackReview.value = true
  const content = [
    '【轨道复盘问题】',
    `轨道：${track.value.name}`,
    `类型：${typeLabel(track.value.type)}`,
    '',
    '长期目标：',
    trackGoal.value,
    '',
    '下一步行动：',
    trackNextAction.value,
    '',
    '最近 7 天证据：',
    trackInsightCards.value.map((item) => `- ${item.title}：${item.description}`).join('\n'),
    '',
    '复盘问题：这条轨道本周真正有效的动作是什么？下一个 24-72 小时我应该保留、减少或调整什么？'
  ].join('\n')

  const captureResponse = await createQuickCapture({
    type: 'learning',
    content
  })

  if (!captureResponse.success || !captureResponse.data?.id) {
    creatingTrackReview.value = false
    showError('轨道复盘生成失败', { description: captureResponse.error || '请稍后重试' })
    return
  }

  const linkResponse = await linkQuickCapture(captureResponse.data.id, {
    targetType: 'review_question'
  })
  creatingTrackReview.value = false

  if (!linkResponse.success) {
    showError('复盘草稿写入失败', { description: linkResponse.error || '内容已进入收集箱，可稍后手动整理。' })
    return
  }

  success('已带入今日复盘', { description: '轨道复盘问题已追加到今日复盘的卡点区。' })
  router.push('/review')
}

const getAllLearningNotes = () => {
  const notes = track.value?.config?.learningNotes
  return Array.isArray(notes) ? notes : []
}

const getNoteKey = (note, index = 0) => String(note?.id || note?.createdAt || `note-${index}`)

const persistLearningNotes = async (nextNotes, noteKey, successMessage) => {
  if (!track.value?.id) return false
  updatingNoteKey.value = noteKey
  const currentConfig = track.value.config && typeof track.value.config === 'object' ? track.value.config : {}
  const nextConfig = {
    ...currentConfig,
    learningNotes: nextNotes.slice(0, 30)
  }

  const response = await updateTrack(track.value.id, { config: nextConfig })
  updatingNoteKey.value = ''

  if (!response.success) {
    showError('轨道沉淀更新失败', { description: response.error || '请稍后重试' })
    return false
  }

  track.value = {
    ...track.value,
    config: nextConfig
  }
  success(successMessage)
  return true
}

const startEditNote = (note, index) => {
  editingNoteKey.value = getNoteKey(note, index)
  editingNoteContent.value = note?.content || ''
}

const cancelEditNote = () => {
  editingNoteKey.value = ''
  editingNoteContent.value = ''
}

const saveEditedNote = async (note, index) => {
  const content = editingNoteContent.value.trim()
  if (!content) {
    showError('沉淀内容不能为空', { description: '如果这条沉淀已经不需要，可以直接删除。' })
    return
  }

  const noteKey = getNoteKey(note, index)
  const nextNotes = getAllLearningNotes().map((item, itemIndex) => (
    getNoteKey(item, itemIndex) === noteKey
      ? { ...item, content, updatedAt: new Date().toISOString() }
      : item
  ))
  const saved = await persistLearningNotes(nextNotes, noteKey, '轨道沉淀已更新')
  if (saved) cancelEditNote()
}

const deleteLearningNote = async (note, index) => {
  const noteKey = getNoteKey(note, index)
  const confirmed = window.confirm('确定删除这条轨道沉淀吗？删除后不会影响原学习笔记。')
  if (!confirmed) return

  const nextNotes = getAllLearningNotes().filter((item, itemIndex) => getNoteKey(item, itemIndex) !== noteKey)
  const deleted = await persistLearningNotes(nextNotes, noteKey, '轨道沉淀已删除')
  if (deleted && editingNoteKey.value === noteKey) cancelEditNote()
}

const sendNoteToReview = async (note, index) => {
  const noteKey = getNoteKey(note, index)
  updatingNoteKey.value = noteKey
  const response = await createQuickCapture({
    type: 'learning',
    content: [
      '【轨道复盘问题】',
      `轨道：${track.value?.name || '未命名轨道'}`,
      '',
      '来源沉淀：',
      note?.content || '',
      '',
      '复盘问题：这条收获提醒我下一步应该调整什么？'
    ].join('\n')
  })
  updatingNoteKey.value = ''

  if (!response.success) {
    showError('转复盘问题失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已放入收集箱', { description: '这条沉淀已转成复盘问题，可在收集箱继续处理。' })
}

const formatDateTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(loadTrack)
</script>

<style scoped>
.track-detail-hero {
  position: relative;
  overflow: hidden;
}

.track-detail-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--track-color) 16%, transparent), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
}

.track-detail-hero > * {
  position: relative;
}

.track-detail-bar {
  display: block;
  width: 100%;
  min-height: 8%;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--track-color, #18181b) 70%, white), var(--track-color, #18181b));
  opacity: 0.92;
}

.track-action-button {
  min-height: 2.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  padding: 0 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(39, 39, 42);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.track-action-button:hover {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
  box-shadow: 0 14px 28px rgba(24, 24, 27, 0.08);
}

.track-small-button {
  min-height: 2.25rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  padding: 0 0.9rem;
  color: rgb(39, 39, 42);
  font-size: 0.75rem;
  font-weight: 700;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.track-small-button:hover {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
  background: white;
}

.track-insight-card {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.78);
  padding: 1rem;
}

.track-semantic-line {
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1rem;
  background: rgba(250, 250, 250, 0.78);
  padding: 0.75rem 0.85rem;
  color: rgb(82, 82, 91);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.track-learning-notes-panel {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.6rem;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--track-color, #18181b) 8%, transparent), transparent 34%),
    rgba(250, 250, 250, 0.78);
  padding: 1.25rem;
}

.track-learning-note {
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
}

.track-note-editor,
.track-config-input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(212, 212, 216, 0.95);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.9rem 1rem;
  font-size: 0.875rem;
  line-height: 1.75;
  color: rgb(39, 39, 42);
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.track-note-editor {
  resize: vertical;
}

.track-config-input {
  min-height: 2.75rem;
}

.track-note-editor:focus,
.track-config-input:focus {
  border-color: rgb(24, 24, 27);
  background: white;
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.08);
}

.track-note-action {
  min-height: 2rem;
  border-radius: 999px;
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.86);
  padding: 0 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(63, 63, 70);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.track-note-action:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
  background: white;
  color: rgb(24, 24, 27);
}

.track-note-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.track-note-action.is-primary {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
}

.track-note-action.is-danger {
  color: rgb(153, 27, 27);
}

.track-config-label {
  display: grid;
  gap: 0.5rem;
  color: rgb(82, 82, 91);
  font-size: 0.75rem;
  font-weight: 700;
}

.dark .track-action-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .track-action-button:hover {
  border-color: white;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.32);
}

.dark .track-small-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .track-small-button:hover {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
}

.dark .track-insight-card {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.72);
}

.dark .track-semantic-line {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.58);
  color: rgb(212, 212, 216);
}

.dark .track-learning-notes-panel {
  border-color: rgba(63, 63, 70, 0.9);
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--track-color, #ffffff) 12%, transparent), transparent 34%),
    rgba(24, 24, 27, 0.72);
}

.dark .track-learning-note {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(39, 39, 42, 0.58);
}

.dark .track-note-editor,
.dark .track-config-input {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .track-note-editor:focus {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
}

.dark .track-note-action {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.72);
  color: rgb(228, 228, 231);
}

.dark .track-note-action:hover:not(:disabled) {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
  color: white;
}

.dark .track-note-action.is-primary {
  border-color: white;
  background: white;
  color: rgb(24, 24, 27);
}

.dark .track-note-action.is-danger {
  color: rgb(252, 165, 165);
}

.dark .track-config-label {
  color: rgb(212, 212, 216);
}
</style>
