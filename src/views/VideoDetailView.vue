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

        <section class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
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

            <BaseCard title="主题推荐视频">
              <div v-if="recommendationsLoading" class="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                正在加载推荐视频...
              </div>
              <div v-else-if="videoRecommendations.length" class="space-y-3">
                <a
                  v-for="video in videoRecommendations"
                  :key="video.videoId"
                  :href="video.url"
                  target="_blank"
                  rel="noreferrer"
                  class="block overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <img :src="video.thumbnail" :alt="video.title" class="h-36 w-full object-cover" />
                  <div class="space-y-2 p-4">
                    <div class="line-clamp-2 text-sm font-semibold leading-6 text-zinc-950 dark:text-white">{{ video.title }}</div>
                    <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ video.channelTitle || 'YouTube' }}</div>
                  </div>
                </a>
              </div>
              <div v-else class="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm leading-7 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
                {{ recommendationsMessage }}
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
import { useRoute } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const route = useRoute()
const { success, error } = useToast()

const isLoading = ref(false)
const savingNote = ref(false)
const markingComplete = ref(false)
const course = ref(null)
const note = ref('')
const savedNote = ref('')
const lastSavedAt = ref('')
const recommendationsLoading = ref(false)
const recommendationsMessage = ref('当前主题暂未加载推荐视频。')
const videoRecommendations = ref([])

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
    await loadRecommendations()
  } catch (err) {
    error('课程加载失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isLoading.value = false
  }
}

const loadRecommendations = async () => {
  recommendationsLoading.value = true
  try {
    const response = await learningAPI.getVideoRecommendations({
      courseId: courseId.value,
      limit: 4
    })

    if (!response.success) {
      throw new Error(response.error || '推荐视频加载失败')
    }

    videoRecommendations.value = Array.isArray(response.data?.items) ? response.data.items : []
    recommendationsMessage.value = response.data?.message || '当前主题暂未加载推荐视频。'
  } catch (err) {
    videoRecommendations.value = []
    recommendationsMessage.value = err.message || '推荐视频加载失败，请稍后重试。'
  } finally {
    recommendationsLoading.value = false
  }
}

const saveNote = async () => {
  if (!course.value || savingNote.value) return

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
  } catch (err) {
    error('笔记保存失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    savingNote.value = false
  }
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
