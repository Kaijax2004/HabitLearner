<template>
  <AppLayout title="学习工作台">
    <div class="learning-workbench w-full min-w-0 space-y-5">
      <section class="learning-hero w-full rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <div class="grid gap-6 xl:grid-cols-2 xl:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Learning Workbench</p>
            <h1 class="mt-3 w-full max-w-none text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white lg:text-5xl">
              把输入变成明天能执行的一步
            </h1>
            <p class="mt-4 w-full max-w-none text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              学习页重新定义为个人成长工作台里的“输入处理区”：先完成一张今日卡片，再写下笔记，最后把收获转成计划、习惯或复盘问题。
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button class="learning-primary-button" type="button" @click="openRecommendedCourse">开始今日学习</button>
              <button class="learning-secondary-button" type="button" :disabled="isLoading" @click="loadData">同步课程库</button>
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

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Today Learning</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">今日学习行动台</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">今天只做一个小输入，并把它转成可执行动作。</p>
              </div>
              <button class="learning-secondary-button" type="button" :disabled="dailyCardLoading || refreshingDailyCard" @click="refreshDailyCard">
                {{ refreshingDailyCard ? '刷新中' : '换一张卡片' }}
              </button>
            </div>

            <div v-if="dailyCardLoading" class="rounded-[1.6rem] border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              正在整理今日学习卡片...
            </div>

            <div v-else-if="dailyCard" class="grid gap-5 lg:grid-cols-2">
              <div class="learning-daily-card">
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="rounded-full bg-zinc-950 px-3 py-1 text-white dark:bg-white dark:text-zinc-950">{{ dailyCard.focusCategoryName || '今日主题' }}</span>
                  <span class="rounded-full bg-white px-3 py-1 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{{ dailyCard.source === 'agnes' ? 'AI 推荐' : '本地策略' }}</span>
                </div>
                <h3 class="mt-4 text-2xl font-semibold leading-tight text-zinc-950 dark:text-white">{{ dailyCard.title }}</h3>
                <p class="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{{ dailyCard.summary }}</p>
                <div class="mt-5 rounded-[1.4rem] bg-white/78 p-4 dark:bg-zinc-950/60">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">为什么是今天</p>
                  <p class="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ dailyCard.rationale }}</p>
                </div>
                <div class="mt-5 flex flex-wrap gap-3">
                  <button v-if="dailyCard.recommendedCourseId" class="learning-primary-button" type="button" @click="openDailyCardCourse">打开推荐课程</button>
                  <button class="learning-secondary-button" type="button" :disabled="dailyCardActionLoading" @click="convertDailyCardToCapture">
                    {{ dailyCardActionLoading ? '整理中' : '转成今日行动' }}
                  </button>
                  <span class="rounded-2xl border border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">更新于 {{ formatDateTime(dailyCard.updatedAt || dailyCard.generatedAt) }}</span>
                </div>
              </div>

              <div class="space-y-3">
                <div v-for="(item, index) in dailyActions" :key="`${index}-${item}`" class="learning-action-step">
                  <span class="learning-step-index">{{ index + 1 }}</span>
                  <p class="text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ item }}</p>
                </div>
                <div class="rounded-[1.35rem] border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-white/5">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">复盘问题</p>
                  <p class="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{{ dailyCard.reflectionQuestion }}</p>
                </div>
              </div>
            </div>

            <div v-else class="rounded-[1.6rem] border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              今天还没有学习卡片，可以先从下方学习路径开始。
            </div>
          </div>
        </BaseCard>

        <aside class="min-w-0 space-y-5">
          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Capture</p>
            <h2 class="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">学习收集</h2>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">把一个收获、疑问或行动先收进箱子，后续再转成计划或复盘素材。</p>
            <textarea v-model="learningCapture" class="learning-textarea mt-4" rows="4" placeholder="例如：我想把拖延拆成一个 10 分钟启动动作"></textarea>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="item in outputTemplates"
                :key="`capture-${item.title}`"
                class="learning-template-chip"
                type="button"
                @click="applyOutputTemplate(item)"
              >
                {{ item.title }}
              </button>
            </div>
            <button class="learning-primary-button mt-3 w-full" type="button" :disabled="isCapturing" @click="submitLearningCapture">
              {{ isCapturing ? '收集中' : '加入学习收集' }}
            </button>
          </BaseCard>

          <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Learning Loop</p>
            <h2 class="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">闭环状态</h2>
            <div class="mt-4 space-y-3">
              <div v-for="item in learningLoop" :key="item.title" class="rounded-2xl border border-zinc-200/80 p-4 dark:border-zinc-800">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
                  <span class="rounded-full px-2.5 py-1 text-xs" :class="item.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'">{{ item.done ? '已完成' : '待完成' }}</span>
                </div>
                <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{{ item.description }}</p>
              </div>
            </div>
          </BaseCard>
        </aside>
      </section>

      <section class="grid w-full gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Notes</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习笔记沉淀</h2>
                <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">笔记不只用来保存，要继续转成复盘问题、习惯实验或下一步计划。</p>
              </div>
              <button class="learning-secondary-button" type="button" :disabled="isNotesLoading" @click="loadLearningNotes">
                {{ isNotesLoading ? '同步中' : '同步笔记' }}
              </button>
            </div>

            <div v-if="isNotesLoading" class="rounded-[1.6rem] border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              正在整理学习笔记...
            </div>

            <div v-else-if="recentNotes.length" class="grid gap-3">
              <article
                v-for="note in recentNotes"
                :key="note.id"
                class="learning-note-card"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">{{ note.category || '学习课程' }}</span>
                    <span>{{ formatDateTime(note.updatedAt) }}</span>
                  </div>
                  <h3 class="mt-3 truncate text-base font-semibold text-zinc-950 dark:text-white">{{ note.courseTitle || '未命名课程' }}</h3>
                  <p class="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ note.excerpt || '这条笔记还没有摘要。' }}</p>
                </div>
                <div class="learning-note-actions">
                  <button class="learning-mini-button" type="button" @click="goToNoteCourse(note)">打开课程</button>
                  <button class="learning-mini-button" type="button" :disabled="noteActionId === note.id" @click="convertNoteToPlanAction(note)">
                    先放入收集箱
                  </button>
                  <button class="learning-mini-button learning-mini-button-dark" type="button" :disabled="!selectedActionPlanId || noteActionId === note.id" @click="convertNoteToPlanBlock(note)">
                    追加到计划
                  </button>
                  <button class="learning-mini-button" type="button" :disabled="noteActionId === note.id" @click="convertNoteToReviewQuestion(note)">
                    转复盘问题
                  </button>
                  <button class="learning-mini-button" type="button" :disabled="noteActionId === note.id" @click="convertNoteToHabitExperiment(note)">
                    转习惯实验
                  </button>
                  <button class="learning-mini-button" type="button" :disabled="!selectedTargetHabitId || noteActionId === note.id" @click="convertNoteToHabitComment(note)">
                    追加到习惯
                  </button>
                  <button class="learning-mini-button" type="button" :disabled="!selectedTargetTrackId || noteActionId === note.id" @click="convertNoteToTrack(note)">
                    沉到轨道
                  </button>
                </div>
              </article>
            </div>

            <div v-else class="rounded-[1.6rem] border border-dashed border-zinc-200 px-5 py-12 text-center text-sm leading-6 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              还没有学习笔记。先完成一节微课程，在详情页写下一句收获，这里就会变成你的学习沉淀池。
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-4">
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Conversion</p>
            <h2 class="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习转化规则</h2>
            <div class="rounded-[1.35rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
              <label class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">目标计划</label>
              <select v-model="selectedActionPlanId" class="learning-input mt-3 w-full">
                <option value="">选择一个计划，用于承接学习行动</option>
                <option v-for="plan in activePlans" :key="plan.id" :value="String(plan.id)">
                  {{ plan.title }}
                </option>
              </select>
              <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                选中后，笔记卡里的“追加到计划”会把学习收获写入该计划的末尾计划块。
              </p>
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
                <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  选中后，可把学习实验追加为该习惯的今日备注。
                </p>
              </div>

              <div class="rounded-[1.35rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <label class="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">目标轨道</label>
                <select v-model="selectedTargetTrackId" class="learning-input mt-3 w-full">
                  <option value="">选择一条轨道，用于长期沉淀</option>
                  <option v-for="track in activeTracks" :key="track.id" :value="String(track.id)">
                    {{ track.name }}
                  </option>
                </select>
                <p class="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  选中后，可把学习收获写入轨道沉淀，方便后续复盘。
                </p>
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
      </section>

      <section class="rounded-[2rem] border border-zinc-200/80 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/75 lg:p-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Paths</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习路径</h2>
            <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">选择一个主题路径，再从最小课程开始推进。</p>
          </div>
          <button class="learning-secondary-button" type="button" @click="selectedCategory = 'all'">查看全部</button>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            class="learning-path-card"
            :class="selectedCategory === category.id ? 'is-active' : ''"
            @click="selectedCategory = category.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="text-left">
                <h3 class="text-base font-semibold tracking-tight">{{ category.name }}</h3>
                <p class="mt-2 line-clamp-2 text-xs leading-5 opacity-75">{{ category.description }}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 text-xs" :class="selectedCategory === category.id ? 'bg-white/15 text-white dark:bg-zinc-200 dark:text-zinc-950' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'">
                {{ categoryProgress(category.id).completed }}/{{ categoryProgress(category.id).total }}
              </span>
            </div>
            <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800">
              <span class="block h-full rounded-full bg-current" :style="{ width: `${categoryProgress(category.id).percent}%` }"></span>
            </div>
            <div class="mt-4 flex items-center justify-between gap-3 text-xs">
              <span class="opacity-75">{{ categoryPathStatus(category.id) }}</span>
              <span class="font-semibold">下一步：{{ categoryNextCourseTitle(category.id) }}</span>
            </div>
          </button>
        </div>
      </section>

      <section class="grid gap-5 xl:grid-cols-2">
        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Next Course</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">下一节最适合开始的课</h2>
                <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">当前路径：{{ selectedPathName }}</p>
              </div>
              <input v-model.trim="search" type="search" class="learning-input md:w-72" placeholder="搜索课程、方法或关键词" />
            </div>

            <div v-if="recommendedCourse" :class="['overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-6 text-white shadow-xl', recommendedCourse.accent || 'from-zinc-800 to-black']">
              <div class="flex flex-wrap items-center gap-2 text-xs text-white/80">
                <span class="rounded-full bg-white/15 px-3 py-1">{{ recommendedCourse.category }}</span>
                <span>{{ formatDuration(recommendedCourse.duration) }}</span>
                <span>{{ recommendedCourse.level }}</span>
              </div>
              <h2 class="mt-5 text-2xl font-semibold leading-tight lg:text-3xl">{{ recommendedCourse.title }}</h2>
              <p class="mt-3 w-full max-w-none text-sm leading-7 text-white/85 lg:text-base">{{ recommendedCourse.summary || recommendedCourse.description }}</p>
              <div class="mt-6 flex flex-wrap gap-3">
                <button class="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100" type="button" @click="goToCourse(recommendedCourse)">打开课程</button>
                <div class="rounded-2xl border border-white/20 px-4 py-3 text-sm text-white/80">{{ recommendedCourse.isCompleted ? '已完成，可回顾笔记' : '推荐先完成这节并写下笔记' }}</div>
              </div>
            </div>

            <div v-else-if="!isLoading" class="rounded-3xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              当前没有可学习的课程。
            </div>
          </div>
        </BaseCard>

        <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
          <div class="space-y-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Action Output</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">学习输出模板</h2>
              <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">每次学习结束后，建议只沉淀这三类内容，减少记了但不用。</p>
            </div>
            <div class="grid gap-3">
              <div v-for="item in outputTemplates" :key="item.title" class="rounded-[1.4rem] border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
                <div class="flex items-start justify-between gap-3">
                  <p class="text-sm font-semibold text-zinc-950 dark:text-white">{{ item.title }}</p>
                  <button class="learning-template-button" type="button" @click="applyOutputTemplate(item)">使用</button>
                </div>
                <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <BaseCard class="border border-zinc-200/80 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/75" :hover="false">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">Library</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">课程资料库</h2>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">共 {{ filteredCourses.length }} 节，课程库只作为输入来源，完成后要写笔记并转行动。</p>
          </div>
        </div>

        <div v-if="isLoading" class="py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">正在加载课程...</div>
        <div v-else-if="!filteredCourses.length" class="py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">没有匹配的课程，换个关键词试试。</div>
        <div v-else class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="course in filteredCourses"
            :key="course.id"
            class="group cursor-pointer overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            @click="goToCourse(course)"
          >
            <div :class="['relative h-28 overflow-hidden bg-gradient-to-br p-5 text-white', course.accent || 'from-zinc-800 to-black']">
              <div class="relative flex items-center justify-between text-xs text-white/85">
                <span class="rounded-full bg-white/15 px-2 py-1">{{ course.category }}</span>
                <span>{{ course.level }}</span>
              </div>
              <div class="relative mt-7 flex items-center justify-between">
                <div class="text-2xl font-semibold">{{ formatDuration(course.duration) }}</div>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="course.isCompleted ? 'bg-emerald-400/20 text-emerald-50' : 'bg-black/20 text-white'">{{ course.isCompleted ? '已完成' : '未完成' }}</span>
              </div>
            </div>
            <div class="p-5">
              <h3 class="text-base font-semibold leading-tight text-zinc-950 dark:text-white">{{ course.title }}</h3>
              <p class="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ course.description }}</p>
            </div>
          </article>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as learningAPI from '@/api/learning.js'
import { createQuickCapture, linkQuickCapture } from '@/api/workspace.js'
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
const selectedCategory = ref('all')
const search = ref('')
const categories = ref([])
const courses = ref([])
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
const overview = ref({
  totalCourses: 0,
  completedCourses: 0,
  remainingCourses: 0,
  totalCategories: 0
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

const recommendedCourse = computed(() => filteredCourses.value.find((course) => !course.isCompleted) || filteredCourses.value[0] || null)
const completionPercent = computed(() => {
  if (!overview.value.totalCourses) return 0
  return Math.round((overview.value.completedCourses / overview.value.totalCourses) * 100)
})

const selectedPathName = computed(() => {
  if (selectedCategory.value === 'all') return '全部主题'
  return categories.value.find((category) => String(category.id) === String(selectedCategory.value))?.name || '当前主题'
})

const stats = computed(() => [
  { label: '课程', value: overview.value.totalCourses || courses.value.length, hint: '可用于微学习的内容量' },
  { label: '完成', value: overview.value.completedCourses || courses.value.filter((course) => course.isCompleted).length, hint: '已经完成并记录的课程' },
  { label: '笔记', value: learningNoteTotal.value || learningNotes.value.length, hint: '已经沉淀的学习记录' },
  { label: '完成率', value: `${completionPercent.value}%`, hint: '学习轨道当前完成比例' }
])

const recentNotes = computed(() => learningNotes.value.slice(0, 6))
const activePlans = computed(() => plans.value.filter((plan) => !['completed', 'done', 'archived'].includes(plan.status)))
const activeTracks = computed(() => tracks.value.filter((track) => track.status !== 'archived'))

const dailyActions = computed(() => {
  const items = Array.isArray(dailyCard.value?.actionItems) ? dailyCard.value.actionItems : []
  return items.length ? items : ['读完一节微课程', '写下一句学习笔记', '把一个收获转成行动']
})

const learningLoop = computed(() => {
  const hasCourse = Boolean(recommendedCourse.value)
  const hasNotes = learningNotes.value.length > 0
  const hasCompleted = courses.value.some((course) => course.isCompleted)
  return [
    { title: '输入', description: '读完一张今日卡片或一节微课程。', done: Boolean(dailyCard.value || hasCourse) },
    { title: '沉淀', description: '写下一个收获、疑问或可复用方法。', done: hasNotes },
    { title: '行动', description: '把学习内容转成计划、习惯或明天第一步。', done: hasCompleted && hasNotes }
  ]
})

const outputTemplates = [
  { title: '一句收获', description: '我今天学到的关键方法是：……', content: '一句收获：我今天学到的关键方法是：' },
  { title: '一个问题', description: '我还没想清楚的问题是：……', content: '一个问题：我还没想清楚的问题是：' },
  { title: '一个行动', description: '明天我可以执行的最小动作是：……', content: '一个行动：明天我可以执行的最小动作是：' }
]

const learningConversionRules = [
  { title: '笔记先进入收集箱', description: '转化结果先作为待处理内容保存，避免自动创建错误计划或习惯。' },
  { title: '行动计划用于明天启动', description: '没想好去向时先进收集箱；已选目标计划时，可直接追加为计划块。' },
  { title: '复盘问题用于晚上收口', description: '把学习中的疑问转成今天需要回答的问题，帮助复盘更具体。' },
  { title: '习惯实验保持小而短', description: '把方法转成 3-7 天的小实验，先验证有效，再决定是否长期坚持。' }
]

const categoryProgress = (categoryId) => {
  const items = courses.value.filter((course) => String(course.categoryId) === String(categoryId))
  const completed = items.filter((course) => course.isCompleted).length
  const total = items.length
  return {
    total,
    completed,
    percent: total ? Math.round((completed / total) * 100) : 0
  }
}

const categoryPathStatus = (categoryId) => {
  const progress = categoryProgress(categoryId)
  if (!progress.total) return '待补内容'
  if (progress.completed === 0) return '未开始'
  if (progress.completed >= progress.total) return '已完成'
  return '推进中'
}

const categoryNextCourseTitle = (categoryId) => {
  const nextCourse = courses.value.find((course) => String(course.categoryId) === String(categoryId) && !course.isCompleted)
  if (nextCourse) return nextCourse.title
  const fallbackCourse = courses.value.find((course) => String(course.categoryId) === String(categoryId))
  return fallbackCourse ? '回顾笔记' : '等待课程'
}

const formatDuration = (duration) => `${Number(duration || 0)} 分钟`

const formatDateTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const goToCourse = (course) => {
  router.push(`/learning/course/${course.id}`)
}

const goToNoteCourse = (note) => {
  if (note?.courseId) router.push(`/learning/course/${note.courseId}`)
}

const openDailyCardCourse = () => {
  if (dailyCard.value?.recommendedCourseId) router.push(`/learning/course/${dailyCard.value.recommendedCourseId}`)
}

const openRecommendedCourse = () => {
  if (recommendedCourse.value) goToCourse(recommendedCourse.value)
}

const applyOutputTemplate = (template) => {
  const current = learningCapture.value.trim()
  learningCapture.value = current ? `${current}\n${template.content}` : template.content
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
  success('已加入学习收集')
}

const buildDailyCardActionContent = () => {
  const card = dailyCard.value || {}
  const lines = [
    '【今日学习行动】',
    `主题：${card.focusCategoryName || '今日学习'}`,
    `卡片：${card.title || '未命名学习卡片'}`,
    `摘要：${card.summary || '暂无摘要'}`,
    `为什么是今天：${card.rationale || '根据当前学习节奏安排一个小输入。'}`
  ]
  dailyActions.value.forEach((item, index) => {
    lines.push(`行动 ${index + 1}：${item}`)
  })
  if (card.reflectionQuestion) lines.push(`复盘问题：${card.reflectionQuestion}`)
  lines.push('处理建议：先放入收集箱，确认后再转成计划块或今日复盘。')
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
    error('今日学习行动整理失败', { description: response.error || '请稍后重试' })
    return
  }
  success('已加入收集箱', { description: '今日学习卡片会等待你确认后再转成计划或复盘。' })
}

const buildNoteBaseLines = (note) => [
  `来源课程：${note.courseTitle || '未命名课程'}`,
  `学习主题：${note.category || '学习课程'}`,
  `原始笔记：${note.content || note.excerpt || '暂无具体笔记内容'}`
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
    error('请先选择目标计划', { description: '选择后才能把学习笔记追加为计划块。' })
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
  const content = buildNoteHabitExperimentContent(note)

  const response = await createQuickCapture({ type: 'habit', content })
  noteActionId.value = null

  if (!response.success) {
    error('转习惯实验失败', { description: response.error || '请稍后重试' })
    return
  }

  success('已加入收集箱', { description: '习惯实验会在收集箱里等待确认。' })
}

const convertNoteToHabitComment = async (note) => {
  if (!note?.id || noteActionId.value) return
  if (!selectedTargetHabitId.value) {
    error('请先选择目标习惯', { description: '选择后才能把学习实验追加为习惯备注。' })
    return
  }

  noteActionId.value = note.id
  const captureResponse = await createQuickCapture({
    type: 'habit',
    content: buildNoteHabitExperimentContent(note)
  })

  if (!captureResponse.success) {
    noteActionId.value = null
    error('创建习惯实验失败', { description: captureResponse.error || '请稍后重试' })
    return
  }

  const captureId = captureResponse.data?.id
  if (!captureId) {
    noteActionId.value = null
    error('创建习惯实验失败', { description: '后端没有返回收集记录编号。' })
    return
  }

  const linkResponse = await linkQuickCapture(captureId, {
    targetType: 'habit_comment',
    habitId: Number(selectedTargetHabitId.value)
  })
  noteActionId.value = null

  if (!linkResponse.success) {
    error('追加到习惯失败', { description: linkResponse.error || '实验已进入收集箱，可稍后手动整理。' })
    return
  }

  success('已追加到习惯', { description: '学习实验已经写入该习惯的今日备注。' })
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
    if (!response.success) throw new Error(response.error || '学习笔记加载失败')
    learningNotes.value = Array.isArray(response.data?.notes) ? response.data.notes : []
    learningNoteTotal.value = Number(response.data?.total || learningNotes.value.length)
  } catch (err) {
    error('学习笔记加载失败', { description: err.message || '请稍后重试' })
  } finally {
    isNotesLoading.value = false
  }
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [categoriesResponse, coursesResponse, plansResponse, habitsResponse, tracksResponse] = await Promise.all([
      learningAPI.getCourseCategories(),
      learningAPI.getCourses({ limit: 100 }),
      listPlans(),
      getHabits(),
      listTracks()
    ])

    if (!categoriesResponse.success) throw new Error(categoriesResponse.error || '学习分类加载失败')
    if (!coursesResponse.success) throw new Error(coursesResponse.error || '课程列表加载失败')

    categories.value = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []
    courses.value = Array.isArray(coursesResponse.data?.courses) ? coursesResponse.data.courses : []
    overview.value = coursesResponse.data?.summary || overview.value
    if (plansResponse.success) plans.value = Array.isArray(plansResponse.data) ? plansResponse.data : []
    if (habitsResponse.success) habits.value = Array.isArray(habitsResponse.data) ? habitsResponse.data : []
    if (tracksResponse.success) tracks.value = Array.isArray(tracksResponse.data) ? tracksResponse.data : []
  } catch (err) {
    error('学习内容加载失败', { description: err.message || '请稍后重试' })
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
.dark .learning-note-card {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
}

.dark .learning-step-index,
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
