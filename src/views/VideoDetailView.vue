<template>
  <AppLayout :title="course?.title || '学习内容'" :show-back-button="true">
    <div class="space-y-6 p-4 lg:p-0">
      <div v-if="isLoading" class="rounded-[2rem] border border-zinc-200 bg-white py-20 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        正在加载课程内容...
      </div>

      <template v-else-if="course">
        <section :class="['overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 text-white shadow-2xl lg:p-8', course.accent || 'from-zinc-800 to-black']">
          <div class="flex flex-wrap items-center gap-2 text-xs text-white/80">
            <span class="rounded-full bg-white/15 px-3 py-1">{{ course.category }}</span>
            <span class="rounded-full bg-black/20 px-3 py-1">{{ course.level }}</span>
            <span class="rounded-full bg-black/20 px-3 py-1">{{ formatDuration(course.duration) }}</span>
          </div>
          <h1 class="mt-5 max-w-4xl text-3xl font-black leading-tight lg:text-5xl">{{ course.title }}</h1>
          <p class="mt-4 max-w-3xl text-sm leading-7 text-white/85 lg:text-base">{{ course.description }}</p>

          <div class="mt-6 flex flex-wrap gap-3">
            <button
              class="rounded-2xl px-5 py-3 text-sm font-semibold transition"
              :class="course.isCompleted ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-950 hover:bg-zinc-100'"
              :disabled="markingComplete || course.isCompleted"
              @click="markAsCompleted"
            >
              {{ course.isCompleted ? '已完成学习' : markingComplete ? '保存中...' : '标记完成' }}
            </button>
            <button class="rounded-2xl border border-white/20 px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10" @click="saveNote">
              {{ savingNote ? '保存笔记中...' : isNoteDirty ? '保存笔记' : '笔记已同步' }}
            </button>
          </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-2">
          <div class="space-y-6">
            <BaseCard title="课程摘要">
              <p class="text-sm leading-8 text-zinc-700 dark:text-zinc-300">{{ course.summary }}</p>
            </BaseCard>

            <BaseCard title="关键要点">
              <div class="grid gap-4 md:grid-cols-3">
                <div v-for="(point, index) in course.keyPoints" :key="point" class="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-bold text-white dark:bg-white dark:text-zinc-950">
                    {{ index + 1 }}
                  </div>
                  <p class="text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ point }}</p>
                </div>
              </div>
            </BaseCard>

            <BaseCard title="行动练习">
              <div class="rounded-[1.6rem] border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">今天就做</div>
                <p class="mt-3 text-sm leading-7 text-zinc-800 dark:text-zinc-100">{{ course.practice }}</p>
              </div>
            </BaseCard>

            <BaseCard title="复盘问题">
              <div class="rounded-[1.6rem] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <p class="text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ course.reflectionQuestion }}</p>
              </div>
            </BaseCard>
          </div>

          <aside class="space-y-6">
            <BaseCard title="学习闭环">
              <div class="space-y-4">
                <div>
                  <div class="mb-2 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                    <span>当前进度</span>
                    <span>{{ closurePercent }}%</span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${closurePercent}%` }"></div>
                  </div>
                </div>

                <div class="space-y-3">
                  <div v-for="step in closureSteps" :key="step.title" class="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" :class="step.done ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'">
                      {{ step.done ? '✓' : step.index }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-zinc-950 dark:text-white">{{ step.title }}</div>
                      <p class="mt-1 text-xs leading-6 text-zinc-500 dark:text-zinc-400">{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </BaseCard>

            <BaseCard title="我的笔记">
              <textarea
                v-model="note"
                class="input-apple h-56 w-full resize-none"
                placeholder="写下一个收获、一个疑问，或者你今天准备执行的动作..."
              ></textarea>
              <div class="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{{ note.trim().length }} 字</span>
                <span>{{ noteStatusText }}</span>
              </div>
              <button class="mt-4 w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200" @click="saveNote">
                {{ savingNote ? '正在保存...' : '保存学习笔记' }}
              </button>
              <div class="mt-3 grid gap-2 sm:grid-cols-2">
                <button class="learning-action-button" type="button" :disabled="isCollectingNote || isCreatingPlan" @click="collectNote">
                  {{ isCollectingNote ? '收集中...' : '加入收集箱' }}
                </button>
                <button class="learning-action-button learning-action-button-primary" type="button" :disabled="isCreatingPlan || isCollectingNote" @click="createPlanFromNote">
                  {{ isCreatingPlan ? '创建中...' : '转为行动计划' }}
                </button>
              </div>
              <p class="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                建议先把一个收获写成可执行动作，再转入计划或收集箱。
              </p>
            </BaseCard>

            <BaseCard title="课程信息">
              <div class="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <div class="flex items-center justify-between">
                  <span>课程时长</span>
                  <span class="font-medium text-zinc-950 dark:text-white">{{ formatDuration(course.duration) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>难度等级</span>
                  <span class="font-medium text-zinc-950 dark:text-white">{{ course.level }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>学习人数</span>
                  <span class="font-medium text-zinc-950 dark:text-white">{{ course.studentCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>完成状态</span>
                  <span :class="course.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'" class="font-medium">
                    {{ course.isCompleted ? '已完成' : '未完成' }}
                  </span>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import { createQuickCapture } from '@/api/workspace.js'
import { useToast } from '@/composables/useToast'
import { usePlanStore } from '@/stores/plan'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const { success, error } = useToast()

const isLoading = ref(false)
const savingNote = ref(false)
const markingComplete = ref(false)
const isCollectingNote = ref(false)
const isCreatingPlan = ref(false)
const course = ref(null)
const note = ref('')
const savedNote = ref('')
const lastSavedAt = ref('')

const courseId = computed(() => route.params.id)

const isNoteDirty = computed(() => note.value !== savedNote.value)

const noteStatusText = computed(() => {
  if (savingNote.value) return '笔记保存中'
  if (isNoteDirty.value) return '有未保存修改'
  if (lastSavedAt.value) return `已同步于 ${lastSavedAt.value}`
  return '笔记尚未保存'
})

const closureSteps = computed(() => {
  const steps = [
    {
      index: 1,
      title: '完成课程阅读',
      description: '先通读摘要、要点、行动练习和复盘问题。',
      done: Boolean(course.value)
    },
    {
      index: 2,
      title: '写下学习笔记',
      description: '至少记录一个收获、一个疑问或一个行动。',
      done: note.value.trim().length >= 10
    },
    {
      index: 3,
      title: '执行后标记完成',
      description: '建议做完行动练习后再标记，这样闭环更真实。',
      done: Boolean(course.value?.isCompleted)
    }
  ]

  return steps
})

const closurePercent = computed(() => {
  const steps = closureSteps.value
  const completed = steps.filter((step) => step.done).length
  return Math.round((completed / steps.length) * 100)
})

const formatDuration = (duration) => `${Number(duration || 0)} 分钟`

const formatSavedTime = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const buildLearningActionContent = () => {
  const currentCourse = course.value || {}
  const currentNote = note.value.trim()
  const parts = [
    `课程：${currentCourse.title || '学习内容'}`,
    currentNote ? `学习笔记：\n${currentNote}` : '',
    currentCourse.practice ? `行动练习：\n${currentCourse.practice}` : '',
    currentCourse.reflectionQuestion ? `复盘问题：\n${currentCourse.reflectionQuestion}` : ''
  ].filter(Boolean)

  return parts.join('\n\n')
}

const ensureNoteSaved = async () => {
  if (!course.value) return false
  if (!isNoteDirty.value) return true
  await saveNote()
  return !isNoteDirty.value
}

const loadCourse = async () => {
  isLoading.value = true
  try {
    const response = await learningAPI.getCourseById(courseId.value)

    if (!response.success) {
      throw new Error(response.error || '课程不存在')
    }

    course.value = response.data
    note.value = response.data.note || ''
    savedNote.value = response.data.note || ''
    lastSavedAt.value = ''
  } catch (err) {
    error('课程加载失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isLoading.value = false
  }
}

const saveNote = async () => {
  if (!course.value || savingNote.value) return false

  savingNote.value = true
  try {
    const response = await learningAPI.saveCourseNote(courseId.value, note.value)

    if (!response.success) {
      throw new Error(response.error || '保存失败')
    }

    savedNote.value = response.data?.content || ''
    note.value = savedNote.value
    lastSavedAt.value = formatSavedTime(response.data?.updatedAt)
    success('学习笔记已保存')
    return true
  } catch (err) {
    error('笔记保存失败', {
      description: err.message || '请稍后重试'
    })
    return false
  } finally {
    savingNote.value = false
  }
}

const collectNote = async () => {
  const content = buildLearningActionContent()
  if (!note.value.trim()) {
    error('请先写下学习笔记', { description: '至少记录一个收获、疑问或行动，再加入收集箱。' })
    return
  }

  isCollectingNote.value = true
  const saved = await ensureNoteSaved()
  if (!saved) {
    isCollectingNote.value = false
    return
  }

  const response = await createQuickCapture({
    type: 'learning',
    content,
    metadata: {
      source: 'learning_course',
      courseId: Number(courseId.value),
      courseTitle: course.value?.title || ''
    }
  })
  isCollectingNote.value = false

  if (!response.success) {
    error('加入收集箱失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入学习收集箱')
}

const createPlanFromNote = async () => {
  if (!note.value.trim()) {
    error('请先写下学习笔记', { description: '把学习收获写下来后，再转成可执行计划。' })
    return
  }

  isCreatingPlan.value = true
  const saved = await ensureNoteSaved()
  if (!saved) {
    isCreatingPlan.value = false
    return
  }

  const currentCourse = course.value || {}
  const planResponse = await planStore.addPlan({
    title: `学习行动：${currentCourse.title || '未命名课程'}`,
    status: 'not_started',
    priority: 'medium',
    type: 'task'
  })

  if (!planResponse.success || !planResponse.data?.id) {
    isCreatingPlan.value = false
    error('创建行动计划失败', { description: planResponse.error || '请稍后重试' })
    return
  }

  const planId = planResponse.data.id
  const noteContent = buildLearningActionContent()
  const blockResults = await Promise.allSettled([
    planStore.addBlock(planId, 'text', { text: noteContent }),
    planStore.addBlock(planId, 'todo', {
      text: currentCourse.practice || `完成课程“${currentCourse.title || '学习内容'}”的一个可执行动作`,
      done: false
    })
  ])
  const failedBlocks = blockResults.filter((item) => item.status === 'rejected' || !item.value?.success)
  isCreatingPlan.value = false

  if (failedBlocks.length) {
    error('行动计划已创建，但部分内容写入失败', { description: '可以进入计划页手动补充。' })
    router.push(`/plan/${planId}`)
    return
  }

  success('已转为行动计划')
  router.push(`/plan/${planId}`)
}

const markAsCompleted = async () => {
  if (!course.value || course.value.isCompleted || markingComplete.value) return

  markingComplete.value = true
  try {
    if (isNoteDirty.value) {
      await saveNote()
    }

    const response = await learningAPI.completeCourse(courseId.value)

    if (!response.success) {
      throw new Error(response.error || '标记完成失败')
    }

    course.value = {
      ...course.value,
      isCompleted: true,
      completedAt: response.data?.completedAt || null
    }

    success('课程已标记完成')
  } catch (err) {
    error('标记完成失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    markingComplete.value = false
  }
}

watch(() => route.params.id, loadCourse)

onMounted(loadCourse)
</script>

<style scoped>
.learning-action-button {
  min-height: 2.75rem;
  border-radius: 1rem;
  border: 1px solid rgb(212 212 216);
  background: rgba(255, 255, 255, 0.86);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(39 39 42);
  box-shadow: 0 12px 30px rgba(24, 24, 27, 0.06);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.learning-action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgb(113 113 122);
  box-shadow: 0 18px 40px rgba(24, 24, 27, 0.12);
}

.learning-action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.learning-action-button-primary {
  border-color: rgb(24 24 27);
  background: rgb(24 24 27);
  color: white;
}

.learning-action-button-primary:hover:not(:disabled) {
  background: rgb(39 39 42);
}

:global(.dark) .learning-action-button {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(39, 39, 42, 0.82);
  color: rgb(244 244 245);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.28);
}

:global(.dark) .learning-action-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.26);
  background: rgba(63, 63, 70, 0.9);
}

:global(.dark) .learning-action-button-primary {
  border-color: white;
  background: white;
  color: rgb(24 24 27);
}

:global(.dark) .learning-action-button-primary:hover:not(:disabled) {
  background: rgb(228 228 231);
}
</style>
