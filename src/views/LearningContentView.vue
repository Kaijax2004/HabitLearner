<template>
  <AppLayout title="学习工作台">
    <div class="learning-workbench w-full min-w-0 space-y-5">
      <section class="learning-hero w-full rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] xl:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Learning Workbench v2</p>
            <h1 class="mt-3 w-full max-w-none text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white lg:text-5xl">
              学习不是看完内容，而是转成自己的行动资产
            </h1>
            <p class="mt-4 w-full max-w-none text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              固定微课程库先下线。新的学习模块围绕真实来源运转：手动记录、热点雷达、内容创作和复盘沉淀都可以成为输入，再由 Mentor-X 帮你拆成计划、习惯实验或复盘问题。
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button class="learning-primary-button" type="button" @click="focusCapture">记录学习输入</button>
              <button class="learning-secondary-button" type="button" :disabled="isMentorLoading" @click="askLearningMentor('请基于我当前的学习输入、计划、轨道和笔记，推荐今天最值得学的一件事，并给出可以转化的下一步。')">
                {{ isMentorLoading ? 'Mentor-X 思考中' : '问 Mentor-X 学什么' }}
              </button>
              <button class="learning-secondary-button" type="button" :disabled="isLoading" @click="loadData">刷新状态</button>
            </div>
          </div>

          <div class="learning-metrics-grid">
            <div v-for="stat in stats" :key="stat.label" class="learning-metric-card">
              <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ stat.label }}</p>
              <p class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">{{ stat.value }}</p>
              <p class="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ stat.hint }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="source in learningSources" :key="source.title" class="learning-source-card">
          <span class="learning-source-index">{{ source.index }}</span>
          <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ source.title }}</p>
          <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ source.description }}</p>
        </article>
      </section>

      <section class="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Learning Input</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习输入</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">输入可以来自一条热点、一次创作卡点、一个计划问题，也可以只是你刚看到的一句话。</p>
            </div>
            <textarea v-model="learningCapture" data-learning-capture class="learning-textarea min-h-40" rows="7" placeholder="例如：我今天刷到一个 AI 工具工作流，想把它拆成自己的选题流程和 30 分钟实践动作。"></textarea>
            <div class="flex flex-wrap gap-2">
              <button v-for="item in outputTemplates" :key="`capture-${item.title}`" class="learning-template-chip" type="button" @click="applyOutputTemplate(item)">
                {{ item.title }}
              </button>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <button class="learning-primary-button w-full" type="button" :disabled="isCapturing" @click="submitLearningCapture">
                {{ isCapturing ? '收集中' : '加入收集箱' }}
              </button>
              <button class="learning-secondary-button w-full" type="button" :disabled="isMentorLoading" @click="askLearningMentor('请把这条学习输入拆成一个收集箱条目、一个计划块建议、一个习惯实验和一个复盘问题。')">
                拆成可执行
              </button>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Mentor-X Learning Coach</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">Mentor-X 学习教练</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">只基于真实输入、计划、热点沉淀和学习资产给建议，不再伪造固定课程推荐。</p>
              </div>
              <button class="learning-secondary-button" type="button" :disabled="isMentorLoading" @click="askLearningMentor('我现在只想做一个最小学习动作，请根据真实上下文给我一个建议和一个待确认动作。')">
                {{ isMentorLoading ? '生成中' : '今日建议' }}
              </button>
            </div>

            <div v-if="isMentorLoading" class="rounded-[1.6rem] border border-dashed border-zinc-200 py-14 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              Mentor-X 正在读取你的学习输入和工作台上下文...
            </div>

            <div v-else-if="mentorReply" class="learning-mentor-panel">
              <p class="whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-200">{{ mentorReply }}</p>
              <div v-if="mentorActions.length" class="mt-5 grid gap-3">
                <article v-for="(action, index) in mentorActions" :key="`${action.action || 'action'}-${index}`" class="learning-mentor-action">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ action.label || action.title || action.action || '待确认动作' }}</p>
                      <p v-if="action.reason" class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">理由：{{ action.reason }}</p>
                    </div>
                    <span class="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">{{ formatConfidence(action.confidence) }}</span>
                  </div>
                  <div v-if="Array.isArray(action.sourceSignals) && action.sourceSignals.length" class="mt-3 flex flex-wrap gap-2">
                    <span v-for="signal in action.sourceSignals" :key="signal" class="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">{{ signal }}</span>
                  </div>
                </article>
              </div>
            </div>

            <div v-else class="rounded-[1.6rem] border border-dashed border-zinc-200 px-5 py-12 text-center text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              先记录一条真实学习输入，或让 Mentor-X 根据今日计划和已有资产推荐一个最小学习动作。
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Today Learning</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">今日学习卡片</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">作为过渡期的学习提示卡，只负责给你一个可转化输入，不再绑定固定课程。</p>
              </div>
              <button class="learning-secondary-button" type="button" :disabled="dailyCardLoading || refreshingDailyCard" @click="refreshDailyCard">
                {{ refreshingDailyCard ? '刷新中' : '换一张' }}
              </button>
            </div>

            <div v-if="dailyCardLoading" class="rounded-[1.6rem] border border-dashed border-zinc-200 py-14 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              正在整理今日学习卡片...
            </div>

            <div v-else-if="dailyCard" class="learning-daily-card">
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full bg-zinc-950 px-3 py-1 text-white dark:bg-white dark:text-zinc-950">{{ dailyCard.focusCategoryName || '今日主题' }}</span>
                <span class="rounded-full bg-white px-3 py-1 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">真实输入优先</span>
              </div>
              <h3 class="mt-4 text-2xl font-semibold leading-tight text-zinc-950 dark:text-white">{{ dailyCard.title }}</h3>
              <p class="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{{ dailyCard.summary }}</p>
              <div class="mt-5 rounded-[1.4rem] bg-white/78 p-4 dark:bg-zinc-950/60">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">转化问题</p>
                <p class="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ dailyCard.reflectionQuestion || '这条输入能转成哪一个今天可验证的小动作？' }}</p>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <button class="learning-secondary-button" type="button" :disabled="dailyCardActionLoading" @click="convertDailyCardToCapture">
                  {{ dailyCardActionLoading ? '整理中' : '转成学习输入' }}
                </button>
                <span class="rounded-2xl border border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">更新于 {{ formatDateTime(dailyCard.updatedAt || dailyCard.generatedAt) }}</span>
              </div>
            </div>

            <div v-else class="rounded-[1.6rem] border border-dashed border-zinc-200 py-14 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              今日卡片未启用。你可以直接记录真实输入，后续再接更适合的内容源。
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Learning Loop</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">闭环状态</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">先追求每天形成一个闭环，而不是堆更多课程。</p>
            </div>
            <div class="grid gap-3">
              <div v-for="item in learningLoop" :key="item.title" class="rounded-2xl border border-zinc-200/80 p-4 dark:border-zinc-800">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
                  <span class="rounded-full px-2.5 py-1 text-xs" :class="item.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'">{{ item.done ? '已完成' : '待完成' }}</span>
                </div>
                <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <section class="grid w-full gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Conversion</p>
              <h2 class="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习转化</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">学习内容必须有出口：收集箱、计划块、习惯实验、复盘问题，至少选一个。</p>
            </div>
            <div class="rounded-[1.35rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
              <label class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">目标计划</label>
              <select v-model="selectedActionPlanId" class="learning-input mt-3 w-full">
                <option value="">选择一个计划，用于承接学习行动</option>
                <option v-for="plan in activePlans" :key="plan.id" :value="String(plan.id)">
                  {{ plan.title }}
                </option>
              </select>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <div class="rounded-[1.35rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <label class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">目标习惯</label>
                <select v-model="selectedTargetHabitId" class="learning-input mt-3 w-full">
                  <option value="">选择一个习惯，用于承接实验备注</option>
                  <option v-for="habit in habits" :key="habit.id" :value="String(habit.id)">
                    {{ habit.name }}
                  </option>
                </select>
              </div>

              <div class="rounded-[1.35rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <label class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">目标轨道</label>
                <select v-model="selectedTargetTrackId" class="learning-input mt-3 w-full">
                  <option value="">选择一条轨道，用于长期沉淀</option>
                  <option v-for="track in activeTracks" :key="track.id" :value="String(track.id)">
                    {{ track.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="rule in learningConversionRules" :key="rule.title" class="rounded-[1.35rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ rule.title }}</p>
                <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ rule.description }}</p>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Learning Assets</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习资产</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">先用笔记和收集箱承接，后续再沉淀成个人知识库。</p>
              </div>
              <button class="learning-secondary-button" type="button" :disabled="isNotesLoading" @click="loadLearningNotes">
                {{ isNotesLoading ? '同步中' : '同步资产' }}
              </button>
            </div>

            <div v-if="isNotesLoading" class="rounded-[1.6rem] border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              正在整理学习资产...
            </div>

            <div v-else-if="recentNotes.length" class="grid gap-3">
              <article v-for="note in recentNotes" :key="note.id" class="learning-note-card">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">{{ note.category || '学习输入' }}</span>
                    <span>{{ formatDateTime(note.updatedAt) }}</span>
                  </div>
                  <h3 class="mt-3 truncate text-base font-semibold text-zinc-950 dark:text-white">{{ note.courseTitle || '学习资产' }}</h3>
                  <p class="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ note.excerpt || note.content || '这条资产还没有摘要。' }}</p>
                </div>
                <div class="learning-note-actions">
                  <button v-if="note.courseId" class="learning-mini-button" type="button" @click="goToNoteCourse(note)">查看来源</button>
                  <button class="learning-mini-button" type="button" :disabled="noteActionId === note.id" @click="convertNoteToPlanAction(note)">进收集箱</button>
                  <button class="learning-mini-button learning-mini-button-dark" type="button" :disabled="!selectedActionPlanId || noteActionId === note.id" @click="convertNoteToPlanBlock(note)">转计划块</button>
                  <button class="learning-mini-button" type="button" :disabled="noteActionId === note.id" @click="convertNoteToReviewQuestion(note)">转复盘</button>
                  <button class="learning-mini-button" type="button" :disabled="noteActionId === note.id" @click="convertNoteToHabitExperiment(note)">转习惯实验</button>
                  <button class="learning-mini-button" type="button" :disabled="!selectedTargetTrackId || noteActionId === note.id" @click="convertNoteToTrack(note)">沉到轨道</button>
                </div>
              </article>
            </div>

            <div v-else class="rounded-[1.6rem] border border-dashed border-zinc-200 px-5 py-12 text-center text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              暂无学习资产。先写一条输入，再把它转成收集箱、计划块或复盘问题。
            </div>
          </div>
        </BaseCard>
      </section>

      <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
        <div class="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Content Library</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">内容库暂缓重建</h2>
            <p class="mt-2 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
              旧微课程不适合上线，YouTube 推荐链路也已下线。下一阶段更适合做“真实来源池”：热点雷达、用户收藏、内容创作复盘、管理员精选来源，再由 Mentor-X 组织成当天最值得学的行动。
            </p>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <div v-for="item in libraryRoadmap" :key="item.title" class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
              <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
              <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import { chatWithMascotAssistant, createQuickCapture, linkQuickCapture } from '@/api/workspace.js'
import { listPlans } from '@/api/plans.js'
import { getHabits } from '@/api/habits.js'
import { listTracks } from '@/api/tracks.js'
import { useToast } from '@/composables/useToast'
import { useWorkspaceAiStore } from '@/stores/workspaceAi'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const router = useRouter()
const { success, error } = useToast()
const workspaceAiStore = useWorkspaceAiStore()

const isLoading = ref(false)
const dailyCard = ref(null)
const dailyCardLoading = ref(false)
const refreshingDailyCard = ref(false)
const dailyCardActionLoading = ref(false)
const learningCapture = ref('')
const isCapturing = ref(false)
const learningNotes = ref([])
const learningNoteTotal = ref(0)
const isNotesLoading = ref(false)
const noteActionId = ref(null)
const plans = ref([])
const habits = ref([])
const tracks = ref([])
const selectedActionPlanId = ref('')
const selectedTargetHabitId = ref('')
const selectedTargetTrackId = ref('')
const isMentorLoading = ref(false)
const mentorReply = ref('')
const mentorActions = ref([])

const activePlans = computed(() => plans.value.filter((plan) => !['completed', 'done', 'archived'].includes(plan.status)))
const activeTracks = computed(() => tracks.value.filter((track) => track.status !== 'archived'))
const recentNotes = computed(() => learningNotes.value.slice(0, 6))
const hasLearningInput = computed(() => Boolean(learningCapture.value.trim() || dailyCard.value || learningNotes.value.length))
const hasLearningConversion = computed(() => Boolean(selectedActionPlanId.value || selectedTargetHabitId.value || selectedTargetTrackId.value || mentorActions.value.length))

const stats = computed(() => [
  { label: '输入源', value: learningSources.length, hint: '手动、热点、创作、复盘都能进入学习' },
  { label: '资产', value: learningNoteTotal.value || learningNotes.value.length, hint: '已经沉淀的学习记录' },
  { label: '计划承接', value: activePlans.value.length, hint: '可以承接学习行动的计划' },
  { label: '转化出口', value: 4, hint: '收集箱、计划块、习惯实验、复盘问题' }
])

const learningSources = [
  { index: '01', title: '手动记录', description: '把看到的观点、疑问、方法和卡点先记下来。' },
  { index: '02', title: '热点雷达', description: '从真实热点中挑选值得学习和拆解的主题。' },
  { index: '03', title: '内容创作', description: '把创作卡点、选题复盘反向变成学习输入。' },
  { index: '04', title: '执行复盘', description: '从计划、习惯、复盘里发现下一次该学什么。' }
]

const learningLoop = computed(() => [
  { title: '输入', description: '记录一条真实学习输入，或把热点、创作卡点转进来。', done: hasLearningInput.value },
  { title: '判断', description: '让 Mentor-X 基于真实上下文判断今天最值得学什么。', done: Boolean(mentorReply.value) },
  { title: '转化', description: '把学习内容转成收集箱、计划块、习惯实验或复盘问题。', done: hasLearningConversion.value },
  { title: '资产', description: '把有效方法沉淀到笔记、轨道或后续个人知识库。', done: learningNotes.value.length > 0 }
])

const outputTemplates = [
  { title: '一句收获', description: '我今天学到的关键方法是：……', content: '一句收获：我今天学到的关键方法是：' },
  { title: '一个问题', description: '我还没想清楚的问题是：……', content: '一个问题：我还没想清楚的问题是：' },
  { title: '一个行动', description: '明天我可以执行的最小动作是：……', content: '一个行动：明天我可以执行的最小动作是：' },
  { title: '一个来源', description: '这条信息来自哪里，为什么可信：……', content: '来源记录：\n可信理由：\n我想验证的是：' }
]

const learningConversionRules = [
  { title: '先进入收集箱', description: '所有不确定的学习输入先进入收集箱，避免自动创建错误计划。' },
  { title: '能执行才算学习', description: '一条学习内容至少要能变成一个 20-30 分钟内可以验证的小动作。' },
  { title: '方法要变成实验', description: '好方法不要直接长期坚持，先变成 3-7 天的小习惯实验。' },
  { title: '疑问进入复盘', description: '没想清楚的问题沉到复盘里，晚上用真实结果回答。' }
]

const libraryRoadmap = [
  { title: '真实来源池', description: '优先接热点、收藏、用户输入和管理员精选。' },
  { title: 'Mentor-X 组织', description: '根据目标和执行状态推荐今天该学什么。' },
  { title: '个人知识库', description: '等资产足够后再沉淀长期偏好、方法和经验。' }
]

const dailyActions = computed(() => {
  const items = Array.isArray(dailyCard.value?.actionItems) ? dailyCard.value.actionItems : []
  return items.length ? items : ['选择一个真实输入来源', '写下一句学习笔记', '把一个收获转成行动']
})

const focusCapture = () => {
  const textarea = document.querySelector('[data-learning-capture]')
  if (!textarea) return
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
  textarea.focus()
}

const formatConfidence = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '建议'
  const percent = number <= 1 ? Math.round(number * 100) : Math.round(number)
  return `${Math.max(0, Math.min(100, percent))}%`
}

const formatDateTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const applyOutputTemplate = (template) => {
  const current = learningCapture.value.trim()
  learningCapture.value = current ? `${current}\n${template.content}` : template.content
}

const buildLearningMentorBlocks = () => [
  { type: 'learning_input', text: learningCapture.value.trim() || '暂无手动学习输入' },
  { type: 'daily_learning_card', text: dailyCard.value ? `${dailyCard.value.title || ''}\n${dailyCard.value.summary || ''}\n${dailyCard.value.rationale || ''}` : '今日学习卡片未启用或暂无卡片' },
  { type: 'learning_assets', text: recentNotes.value.map((note) => `${note.courseTitle || '学习资产'}：${note.excerpt || note.content || ''}`).join('\n') || '暂无学习资产' },
  { type: 'active_plans', text: activePlans.value.slice(0, 8).map((plan) => plan.title).join('；') || '暂无可承接计划' },
  { type: 'active_habits', text: habits.value.slice(0, 8).map((habit) => habit.name).join('；') || '暂无可承接习惯' },
  { type: 'active_tracks', text: activeTracks.value.slice(0, 8).map((track) => track.name).join('；') || '暂无长期轨道' }
]

const askLearningMentor = async (prompt) => {
  if (isMentorLoading.value) return
  if (!learningCapture.value.trim() && !dailyCard.value && !recentNotes.value.length && !activePlans.value.length) {
    error('请先记录学习输入', { description: 'Mentor-X 需要真实输入、计划或学习资产作为判断依据。' })
    focusCapture()
    return
  }

  isMentorLoading.value = true
  mentorReply.value = ''
  mentorActions.value = []

  try {
    const response = await chatWithMascotAssistant({
      message: prompt,
      providerId: workspaceAiStore.normalizedSelectedProviderId,
      context: {
        planTitle: '学习工作台 v2',
        blocks: buildLearningMentorBlocks()
      }
    })

    if (!response?.success) {
      if (response?.code === 'AI_NOT_CONFIGURED') {
        error('需要先配置 Mentor-X 模型引擎', { description: '配置后才能基于真实学习输入生成建议。' })
        return
      }
      throw new Error(response?.error || response?.message || 'Mentor-X 暂时无法生成学习建议')
    }

    const payload = response.data || {}
    mentorReply.value = payload.reply || payload.answer || payload.message || 'Mentor-X 没有返回可用内容。'
    const actions = Array.isArray(payload.actionPlan?.actions) ? payload.actionPlan.actions : Array.isArray(payload.proposedActions) ? payload.proposedActions : []
    mentorActions.value = actions.slice(0, 3)
  } catch (err) {
    error('Mentor-X 学习建议失败', { description: err.message || '请稍后重试' })
  } finally {
    isMentorLoading.value = false
  }
}

const submitLearningCapture = async () => {
  const content = learningCapture.value.trim()
  if (!content) {
    error('请先写下学习内容')
    return
  }

  isCapturing.value = true
  const response = await createQuickCapture({ type: 'learning', content })
  isCapturing.value = false

  if (!response.success) {
    error('学习收集失败', { description: response.error || '请稍后重试' })
    return
  }

  learningCapture.value = ''
  success('已加入学习收集', { description: '下一步可以把它转成计划、习惯实验或复盘问题。' })
}

const buildDailyCardActionContent = () => {
  const card = dailyCard.value || {}
  const lines = [
    '【今日学习输入】',
    `主题：${card.focusCategoryName || '今日学习'}`,
    `标题：${card.title || '未命名学习卡片'}`,
    `摘要：${card.summary || '暂无摘要'}`,
    `为什么是今天：${card.rationale || '根据当前学习节奏安排一个小输入。'}`
  ]
  dailyActions.value.forEach((item, index) => {
    lines.push(`行动 ${index + 1}：${item}`)
  })
  if (card.reflectionQuestion) lines.push(`复盘问题：${card.reflectionQuestion}`)
  lines.push('处理建议：先放入收集箱，确认后再转成计划块、习惯实验或今日复盘。')
  return lines.join('\n')
}

const convertDailyCardToCapture = async () => {
  if (!dailyCard.value || dailyCardActionLoading.value) return
  dailyCardActionLoading.value = true
  const response = await createQuickCapture({
    type: 'learning',
    content: buildDailyCardActionContent()
  })
  dailyCardActionLoading.value = false

  if (!response.success) {
    error('今日学习输入整理失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入收集箱', { description: '这条学习输入会等待你确认后再转化。' })
}

const buildNoteBaseLines = (note) => [
  `来源：${note.courseTitle || '学习输入'}`,
  `学习主题：${note.category || '学习资产'}`,
  `原始内容：${note.content || note.excerpt || '暂无具体笔记内容'}`
]

const buildNotePlanActionContent = (note) => [
  '【学习行动计划】',
  ...buildNoteBaseLines(note),
  '下一步计划：把这条学习收获转成一个 20-30 分钟内可以完成的行动。',
  '完成标准：行动结束后写下一句结果，晚上复盘时判断是否值得继续。'
].join('\n')

const buildNoteHabitExperimentContent = (note) => [
  '【习惯实验】',
  ...buildNoteBaseLines(note),
  '实验目标：把这条学习收获转成一个 3-7 天可执行的小习惯。',
  '建议格式：每天在固定场景下完成一个 5-10 分钟动作，并记录是否有效。'
].join('\n')

const buildNoteTrackContent = (note) => [
  '【轨道沉淀】',
  ...buildNoteBaseLines(note),
  '沉淀方式：把这条学习收获放入长期轨道，用于后续复盘趋势和下一步行动。',
  '下一步：从这条沉淀里挑一个能在今天或明天验证的小动作。'
].join('\n')

const goToNoteCourse = (note) => {
  if (note?.courseId) router.push(`/learning/course/${note.courseId}`)
}

const convertNoteToReviewQuestion = async (note) => {
  if (!note?.id || noteActionId.value) return
  noteActionId.value = note.id
  const content = [
    '【学习复盘问题】',
    ...buildNoteBaseLines(note),
    '复盘问题：这条笔记里最值得我今天验证或追问的问题是什么？',
    '下一步：晚上复盘时回答这个问题，并写下明天第一步。'
  ].join('\n')

  const response = await createQuickCapture({ type: 'learning', content })
  noteActionId.value = null

  if (!response.success) {
    error('转复盘问题失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入收集箱', { description: '复盘问题会在收集箱里等待处理。' })
}

const convertNoteToPlanAction = async (note) => {
  if (!note?.id || noteActionId.value) return
  noteActionId.value = note.id
  const content = [
    buildNotePlanActionContent(note),
    '建议处理：在收集箱中选择“转计划块”，追加到当前最相关的计划里。'
  ].join('\n')

  const response = await createQuickCapture({ type: 'task', content })
  noteActionId.value = null

  if (!response.success) {
    error('转下一步计划失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入收集箱', { description: '下一步计划会在收集箱里等待确认。' })
}

const convertNoteToPlanBlock = async (note) => {
  if (!note?.id || noteActionId.value) return
  if (!selectedActionPlanId.value) {
    error('请先选择目标计划', { description: '选择后才能把学习资产追加为计划块。' })
    return
  }

  noteActionId.value = note.id
  const captureResponse = await createQuickCapture({
    type: 'task',
    content: buildNotePlanActionContent(note)
  })

  if (!captureResponse.success) {
    noteActionId.value = null
    error('创建学习行动失败', { description: captureResponse.error || '请稍后重试' })
    return
  }

  const captureId = captureResponse.data?.id
  if (!captureId) {
    noteActionId.value = null
    error('创建学习行动失败', { description: '后端没有返回收集记录编号。' })
    return
  }

  const linkResponse = await linkQuickCapture(captureId, {
    targetType: 'plan_block',
    planId: Number(selectedActionPlanId.value)
  })
  noteActionId.value = null

  if (!linkResponse.success) {
    error('追加到计划失败', { description: linkResponse.error || '行动已进入收集箱，可稍后手动整理。' })
    return
  }

  success('已追加到计划', { description: '学习收获已经变成该计划下的一个新计划块。' })
}

const convertNoteToHabitExperiment = async (note) => {
  if (!note?.id || noteActionId.value) return
  noteActionId.value = note.id
  const response = await createQuickCapture({ type: 'habit', content: buildNoteHabitExperimentContent(note) })
  noteActionId.value = null

  if (!response.success) {
    error('转习惯实验失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入收集箱', { description: '习惯实验会在收集箱里等待确认。' })
}

const convertNoteToTrack = async (note) => {
  if (!note?.id || noteActionId.value) return
  if (!selectedTargetTrackId.value) {
    error('请先选择目标轨道', { description: '选择后才能把学习收获沉淀到长期轨道。' })
    return
  }

  noteActionId.value = note.id
  const captureResponse = await createQuickCapture({
    type: 'learning',
    content: buildNoteTrackContent(note)
  })

  if (!captureResponse.success) {
    noteActionId.value = null
    error('创建轨道沉淀失败', { description: captureResponse.error || '请稍后重试' })
    return
  }

  const captureId = captureResponse.data?.id
  if (!captureId) {
    noteActionId.value = null
    error('创建轨道沉淀失败', { description: '后端没有返回收集记录编号。' })
    return
  }

  const linkResponse = await linkQuickCapture(captureId, {
    targetType: 'track_note',
    trackId: Number(selectedTargetTrackId.value)
  })
  noteActionId.value = null

  if (!linkResponse.success) {
    error('沉淀到轨道失败', { description: linkResponse.error || '内容已进入收集箱，可稍后手动整理。' })
    return
  }

  success('已沉淀到轨道', { description: '这条学习收获已经写入目标轨道。' })
}

const loadDailyCard = async (force = false) => {
  if (force) refreshingDailyCard.value = true
  else dailyCardLoading.value = true

  try {
    const response = force
      ? await learningAPI.refreshDailyLearningCard({
          providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null
        })
      : await learningAPI.getDailyLearningCard()
    if (!response.success) throw new Error(response.error || '学习卡片加载失败')
    dailyCard.value = response.data || null
  } catch (err) {
    error(force ? '学习卡片刷新失败' : '学习卡片加载失败', { description: err.message || '请稍后重试' })
  } finally {
    dailyCardLoading.value = false
    refreshingDailyCard.value = false
  }
}

const refreshDailyCard = async () => {
  await loadDailyCard(true)
}

const loadLearningNotes = async () => {
  isNotesLoading.value = true
  try {
    const response = await learningAPI.listLearningNotes({ limit: 20 })
    if (!response.success) throw new Error(response.error || '学习资产加载失败')
    learningNotes.value = Array.isArray(response.data?.notes) ? response.data.notes : []
    learningNoteTotal.value = Number(response.data?.total || learningNotes.value.length)
  } catch (err) {
    error('学习资产加载失败', { description: err.message || '请稍后重试' })
  } finally {
    isNotesLoading.value = false
  }
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [plansResponse, habitsResponse, tracksResponse] = await Promise.all([
      listPlans(),
      getHabits(),
      listTracks()
    ])

    if (plansResponse.success) plans.value = Array.isArray(plansResponse.data) ? plansResponse.data : []
    if (habitsResponse.success) habits.value = Array.isArray(habitsResponse.data) ? habitsResponse.data : []
    if (tracksResponse.success) tracks.value = Array.isArray(tracksResponse.data) ? tracksResponse.data : []
  } catch (err) {
    error('学习状态加载失败', { description: err.message || '请稍后重试' })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadData(), loadDailyCard(false), loadLearningNotes()])
})
</script>

<style scoped>
.learning-hero {
  position: relative;
  overflow: hidden;
}

.learning-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 82% 12%, rgba(24, 24, 27, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent);
}

.learning-hero > * {
  position: relative;
}

.learning-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.learning-metric-card {
  border: 1px solid rgba(212, 212, 216, 0.85);
  border-radius: 1.4rem;
  background: rgba(250, 250, 250, 0.78);
  padding: 1rem;
}

.learning-source-card {
  min-height: 8.25rem;
  border: 1px solid rgba(212, 212, 216, 0.82);
  border-radius: 1.55rem;
  background: rgba(255, 255, 255, 0.82);
  padding: 1rem;
  box-shadow: 0 16px 34px rgba(24, 24, 27, 0.05);
  backdrop-filter: blur(18px);
}

.learning-source-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  height: 1.75rem;
  margin-bottom: 0.8rem;
  border-radius: 999px;
  background: rgb(24, 24, 27);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.learning-mentor-panel {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.6rem;
  background:
    radial-gradient(circle at 92% 10%, rgba(24, 24, 27, 0.08), transparent 34%),
    rgba(250, 250, 250, 0.84);
  padding: 1.15rem;
}

.learning-mentor-action {
  border: 1px solid rgba(212, 212, 216, 0.88);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.78);
  padding: 1rem;
}

.learning-daily-card {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.75rem;
  background: linear-gradient(135deg, rgba(250, 250, 250, 0.95), rgba(244, 244, 245, 0.72));
  padding: 1.25rem;
}

.learning-action-step {
  display: flex;
  gap: 0.75rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.78);
  padding: 1rem;
}

.learning-note-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.5rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(250, 250, 250, 0.76));
  padding: 1rem;
}

.learning-note-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.learning-mini-button {
  min-height: 2.25rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  padding: 0 0.9rem;
  color: rgb(39, 39, 42);
  font-size: 0.75rem;
  font-weight: 700;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.learning-mini-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
  background: white;
}

.learning-mini-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.learning-mini-button-dark {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
}

.learning-template-chip,
.learning-template-button {
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: rgb(39, 39, 42);
  font-size: 0.75rem;
  font-weight: 700;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.learning-template-chip {
  min-height: 2rem;
  padding: 0 0.8rem;
}

.learning-template-button {
  min-height: 1.8rem;
  flex-shrink: 0;
  padding: 0 0.75rem;
}

.learning-template-chip:hover,
.learning-template-button:hover {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
  background: white;
}

.learning-step-index {
  display: flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(24, 24, 27);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
}

.learning-path-card {
  min-height: 8.75rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.86);
  padding: 1rem;
  color: rgb(39, 39, 42);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.learning-path-card:hover {
  transform: translateY(-1px);
  border-color: rgba(113, 113, 122, 0.85);
  box-shadow: 0 14px 32px rgba(24, 24, 27, 0.08);
}

.learning-path-card.is-active {
  border-color: rgb(24, 24, 27);
  background: rgb(24, 24, 27);
  color: white;
}

.learning-primary-button,
.learning-secondary-button {
  min-height: 2.75rem;
  border-radius: 1rem;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.learning-primary-button {
  background: rgb(24, 24, 27);
  color: white;
}

.learning-secondary-button {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.9);
  color: rgb(39, 39, 42);
}

.learning-primary-button:hover:not(:disabled),
.learning-secondary-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.learning-primary-button:disabled,
.learning-secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.learning-input,
.learning-textarea {
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: rgb(24, 24, 27);
  font-size: 0.875rem;
  outline: none;
}

.learning-input {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.learning-textarea {
  resize: vertical;
  min-height: 6rem;
  padding: 0.9rem 1rem;
  line-height: 1.65;
}

.dark .learning-metric-card,
.dark .learning-daily-card,
.dark .learning-action-step,
.dark .learning-note-card,
.dark .learning-source-card,
.dark .learning-mentor-panel,
.dark .learning-mentor-action {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
}

.dark .learning-step-index,
.dark .learning-source-index,
.dark .learning-primary-button {
  background: white;
  color: rgb(24, 24, 27);
}

.dark .learning-path-card {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .learning-path-card.is-active {
  border-color: white;
  background: white;
  color: rgb(24, 24, 27);
}

.dark .learning-secondary-button,
.dark .learning-input,
.dark .learning-textarea {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .learning-mini-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .learning-template-chip,
.dark .learning-template-button {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .learning-mini-button:hover:not(:disabled) {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
}

.dark .learning-template-chip:hover,
.dark .learning-template-button:hover {
  border-color: white;
  background: rgba(39, 39, 42, 0.92);
}

.dark .learning-mini-button-dark {
  border-color: white;
  background: white;
  color: rgb(24, 24, 27);
}

@media (min-width: 768px) {
  .learning-note-card {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .learning-note-actions {
    justify-content: flex-end;
  }
}
</style>
