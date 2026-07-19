<template>
  <AppLayout title="学习中心" :show-back-button="true">
    <div class="space-y-6 p-4 lg:p-0">
      <section class="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-7 text-white shadow-2xl dark:border-zinc-800 lg:px-8 lg:py-9">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_28%)]"></div>
        <div class="relative grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
          <div>
            <p class="text-xs uppercase tracking-[0.35em] text-zinc-300">Phase 1 Learning</p>
            <h1 class="mt-3 text-3xl font-black leading-tight lg:text-5xl">微课程、完成记录、学习笔记，先把学习闭环做扎实。</h1>
            <p class="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 lg:text-base">
              当前阶段聚焦中文文本微课。每个主题都可以直接学习、记录笔记并标记完成，不再依赖本地假数据或空白页面。
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button class="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100" @click="openRecommendedCourse">
                继续今天的学习
              </button>
              <button class="rounded-2xl border border-white/20 px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10" @click="loadData">
                刷新课程
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div class="text-2xl font-bold">{{ stat.value }}</div>
              <div class="mt-1 text-xs text-zinc-300">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <BaseCard>
          <div class="space-y-4">
            <div>
              <h2 class="text-lg font-semibold text-zinc-950 dark:text-white">学习主题</h2>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">按主题切换，优先处理未完成课程。</p>
            </div>

            <button
              v-for="category in categoriesWithAll"
              :key="category.id"
              class="w-full rounded-2xl border p-3 text-left transition-all"
              :class="selectedCategory === category.id
                ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'"
              @click="selectedCategory = category.id"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-medium">{{ category.name }}</div>
                  <div class="mt-1 text-xs" :class="selectedCategory === category.id ? 'text-white/75 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'">
                    {{ category.description }}
                  </div>
                </div>
                <span class="rounded-full px-2 py-1 text-xs" :class="selectedCategory === category.id ? 'bg-white/15 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'">
                  {{ category.courseCount || countCategoryCourses(category.id) }}
                </span>
              </div>
            </button>
          </div>
        </BaseCard>

        <div class="space-y-6">
          <BaseCard title="今日学习卡片">
            <template #header>
              <button
                class="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                :disabled="dailyCardLoading || refreshingDailyCard"
                @click="refreshDailyCard"
              >
                {{ refreshingDailyCard ? '刷新中...' : '刷新卡片' }}
              </button>
            </template>

            <div v-if="dailyCardLoading" class="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              正在生成今日学习卡片...
            </div>
            <div v-else-if="dailyCard" class="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
              <div class="rounded-[1.75rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="rounded-full bg-zinc-950 px-3 py-1 text-white dark:bg-white dark:text-zinc-950">
                    {{ dailyCard.focusCategoryName }}
                  </span>
                  <span class="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {{ dailyCard.source === 'agnes' ? 'Agnes AI' : '本地策略卡片' }}
                  </span>
                </div>
                <h2 class="mt-4 text-2xl font-black leading-tight text-zinc-950 dark:text-white">{{ dailyCard.title }}</h2>
                <p class="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{{ dailyCard.summary }}</p>
                <div class="mt-4 rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div class="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">为什么是今天</div>
                  <p class="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ dailyCard.rationale }}</p>
                </div>
                <div class="mt-5 flex flex-wrap gap-3">
                  <button
                    v-if="dailyCard.recommendedCourseId"
                    class="rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    @click="openDailyCardCourse"
                  >
                    打开推荐课程
                  </button>
                  <span class="rounded-2xl border border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    更新于 {{ formatDateTime(dailyCard.updatedAt || dailyCard.generatedAt) }}
                  </span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <div class="text-sm font-semibold text-zinc-950 dark:text-white">今日动作</div>
                  <div class="mt-4 space-y-3">
                    <div v-for="(item, index) in dailyCard.actionItems" :key="item" class="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                        {{ index + 1 }}
                      </div>
                      <p class="text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ item }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <div class="text-sm font-semibold text-zinc-950 dark:text-white">复盘问题</div>
                  <p class="mt-3 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ dailyCard.reflectionQuestion }}</p>
                </div>
              </div>
            </div>
            <div v-else class="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              今天的学习卡片暂未生成。
            </div>
          </BaseCard>

          <BaseCard>
            <template #header>
              <input
                v-model.trim="search"
                type="search"
                class="input-apple w-full md:w-72"
                placeholder="搜索课程、方法或关键词"
              />
            </template>

            <div v-if="recommendedCourse" class="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_0.8fr]">
              <div :class="['overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-6 text-white shadow-xl', recommendedCourse.accent || 'from-zinc-800 to-black']">
                <div class="flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <span class="rounded-full bg-white/15 px-3 py-1">{{ recommendedCourse.category }}</span>
                  <span>{{ formatDuration(recommendedCourse.duration) }}</span>
                  <span>{{ recommendedCourse.level }}</span>
                </div>
                <h2 class="mt-5 text-2xl font-black leading-tight lg:text-3xl">{{ recommendedCourse.title }}</h2>
                <p class="mt-3 max-w-2xl text-sm leading-7 text-white/85 lg:text-base">{{ recommendedCourse.summary || recommendedCourse.description }}</p>
                <div class="mt-6 flex flex-wrap gap-3">
                  <button class="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100" @click="goToCourse(recommendedCourse)">
                    打开课程
                  </button>
                  <div class="rounded-2xl border border-white/20 px-4 py-3 text-sm text-white/80">
                    {{ recommendedCourse.isCompleted ? '已完成，可回顾笔记' : '推荐先完成这节并写下笔记' }}
                  </div>
                </div>
              </div>

              <div class="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div class="text-sm font-semibold text-zinc-950 dark:text-white">今天的学习闭环</div>
                <div class="mt-4 space-y-3">
                  <div v-for="item in learningLoop" :key="item.title" class="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <div class="text-sm font-medium text-zinc-950 dark:text-white">{{ item.title }}</div>
                        <p class="mt-1 text-xs leading-6 text-zinc-500 dark:text-zinc-400">{{ item.description }}</p>
                      </div>
                      <span class="rounded-full px-2 py-1 text-xs" :class="item.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'">
                        {{ item.done ? '已完成' : '待完成' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="!isLoading" class="rounded-3xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              当前没有可学习的课程。
            </div>
          </BaseCard>

          <BaseCard title="课程列表">
            <template #subtitle>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">共 {{ filteredCourses.length }} 节，支持按主题筛选和关键词搜索。</p>
            </template>

            <div v-if="isLoading" class="py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">正在加载课程...</div>
            <div v-else-if="!filteredCourses.length" class="py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">没有匹配的课程，换个关键词试试。</div>
            <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="course in filteredCourses"
                :key="course.id"
                class="group cursor-pointer overflow-hidden rounded-[1.6rem] border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
                @click="goToCourse(course)"
              >
                <div :class="['relative h-36 overflow-hidden bg-gradient-to-br p-5 text-white', course.accent || 'from-zinc-800 to-black']">
                  <div class="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10"></div>
                  <div class="absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-white/10"></div>
                  <div class="relative flex items-center justify-between text-xs text-white/85">
                    <span class="rounded-full bg-white/15 px-2 py-1">{{ course.category }}</span>
                    <span>{{ course.level }}</span>
                  </div>
                  <div class="relative mt-8 flex items-end justify-between">
                    <div>
                      <div class="text-3xl font-black">{{ formatDuration(course.duration) }}</div>
                      <div class="text-xs text-white/75">建议完整读完后写下一个动作</div>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-medium" :class="course.isCompleted ? 'bg-emerald-400/20 text-emerald-50' : 'bg-black/20 text-white'">
                      {{ course.isCompleted ? '已完成' : '未完成' }}
                    </span>
                  </div>
                </div>

                <div class="space-y-4 p-5">
                  <div>
                    <h3 class="text-lg font-bold leading-tight text-zinc-950 dark:text-white">{{ course.title }}</h3>
                    <p class="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ course.description }}</p>
                  </div>

                  <div class="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">行动练习</div>
                    <p class="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{{ course.practice }}</p>
                  </div>
                </div>
              </article>
            </div>
          </BaseCard>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'

const router = useRouter()
const { error } = useToast()

const isLoading = ref(false)
const selectedCategory = ref('all')
const search = ref('')
const categories = ref([])
const courses = ref([])
const dailyCard = ref(null)
const dailyCardLoading = ref(false)
const refreshingDailyCard = ref(false)
const overview = ref({
  totalCourses: 0,
  completedCourses: 0,
  remainingCourses: 0,
  totalCategories: 0
})

const categoriesWithAll = computed(() => {
  return [
    {
      id: 'all',
      name: '全部主题',
      description: '查看所有微课程与学习动作',
      courseCount: courses.value.length
    },
    ...categories.value
  ]
})

const filteredCourses = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return courses.value.filter((course) => {
    const matchCategory = selectedCategory.value === 'all' || String(course.categoryId) === String(selectedCategory.value)
    const haystack = [course.title, course.description, course.summary, course.practice, course.category].join(' ').toLowerCase()
    const matchSearch = !keyword || haystack.includes(keyword)
    return matchCategory && matchSearch
  })
})

const recommendedCourse = computed(() => {
  return filteredCourses.value.find((course) => !course.isCompleted) || filteredCourses.value[0] || null
})

const completionPercent = computed(() => {
  if (!overview.value.totalCourses) return 0
  return Math.round((overview.value.completedCourses / overview.value.totalCourses) * 100)
})

const stats = computed(() => [
  { label: '全部课程', value: overview.value.totalCourses || courses.value.length },
  { label: '已完成', value: overview.value.completedCourses || courses.value.filter((course) => course.isCompleted).length },
  { label: '待学习', value: overview.value.remainingCourses || Math.max(courses.value.length - courses.value.filter((course) => course.isCompleted).length, 0) },
  { label: '完成率', value: `${completionPercent.value}%` }
])

const learningLoop = computed(() => {
  if (!recommendedCourse.value) return []

  return [
    {
      title: '读完微课程',
      description: '先完成本节摘要与关键要点的阅读。',
      done: true
    },
    {
      title: '写学习笔记',
      description: '在详情页记录一个收获、一个疑问或一个行动。',
      done: recommendedCourse.value.isCompleted
    },
    {
      title: '标记完成',
      description: '完成行动练习后再标记，这样闭环更真实。',
      done: recommendedCourse.value.isCompleted
    }
  ]
})

const formatDuration = (duration) => `${Number(duration || 0)} 分钟`

const formatDateTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const countCategoryCourses = (categoryId) => {
  if (categoryId === 'all') return courses.value.length
  return courses.value.filter((course) => String(course.categoryId) === String(categoryId)).length
}

const goToCourse = (course) => {
  router.push(`/learning/course/${course.id}`)
}

const openDailyCardCourse = () => {
  if (dailyCard.value?.recommendedCourseId) {
    router.push(`/learning/course/${dailyCard.value.recommendedCourseId}`)
  }
}

const openRecommendedCourse = () => {
  if (recommendedCourse.value) {
    goToCourse(recommendedCourse.value)
  }
}

const loadDailyCard = async (force = false) => {
  if (force) {
    refreshingDailyCard.value = true
  } else {
    dailyCardLoading.value = true
  }

  try {
    const response = force
      ? await learningAPI.refreshDailyLearningCard()
      : await learningAPI.getDailyLearningCard()

    if (!response.success) {
      throw new Error(response.error || '学习卡片加载失败')
    }

    dailyCard.value = response.data || null
  } catch (err) {
    error(force ? '学习卡片刷新失败' : '学习卡片加载失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    dailyCardLoading.value = false
    refreshingDailyCard.value = false
  }
}

const refreshDailyCard = async () => {
  await loadDailyCard(true)
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [categoriesResponse, coursesResponse] = await Promise.all([
      learningAPI.getCourseCategories(),
      learningAPI.getCourses({ limit: 100 })
    ])

    if (!categoriesResponse.success) {
      throw new Error(categoriesResponse.error || '学习分类加载失败')
    }

    if (!coursesResponse.success) {
      throw new Error(coursesResponse.error || '课程列表加载失败')
    }

    categories.value = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []
    courses.value = Array.isArray(coursesResponse.data?.courses) ? coursesResponse.data.courses : []
    overview.value = coursesResponse.data?.summary || overview.value
  } catch (err) {
    error('学习内容加载失败', {
      description: err.message || '请稍后重试'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadData(),
    loadDailyCard(false)
  ])
})
</script>
