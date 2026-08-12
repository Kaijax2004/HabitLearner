<template>
  <AppLayout title="轨道">
    <div class="tracks-page space-y-6">
      <section class="tracks-hero rounded-[2rem] border border-zinc-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:p-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500 dark:text-zinc-400">Tracks</p>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">把每天的行动放进长期轨道</h2>
            <p class="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              轨道会把习惯、学习、专注、计划和自定义目标统一整理，让你快速看见今天的状态、最近趋势和下一步行动。
            </p>
          </div>

          <form class="track-create-form" @submit.prevent="submitTrack">
            <input v-model="newTrack.name" class="track-input" maxlength="100" placeholder="新增自定义轨道" />
            <input v-model="newTrack.color" class="track-color" type="color" title="轨道颜色" />
            <button class="track-primary-button" type="submit" :disabled="isCreating">
              {{ isCreating ? '创建中' : '创建轨道' }}
            </button>
          </form>
        </div>
      </section>

      <section v-if="errorMessage" class="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
        {{ errorMessage }}
      </section>

      <section v-if="isLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="index in 4" :key="index" class="h-64 animate-pulse rounded-[1.75rem] bg-zinc-100 dark:bg-zinc-900"></div>
      </section>

      <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="track in tracks"
          :key="track.id"
          class="track-card cursor-pointer"
          :style="{ '--track-color': track.color || '#18181b' }"
          @click="openTrack(track)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-medium text-zinc-500 dark:text-zinc-400">{{ typeLabel(track.type) }}</p>
              <input
                v-if="editingId === track.id"
                v-model="editingName"
                class="track-name-input"
                maxlength="100"
                @click.stop
                @keyup.enter="saveTrackName(track)"
                @keyup.esc="cancelEdit"
              />
              <h3 v-else class="mt-1 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{{ track.name }}</h3>
            </div>
            <span class="track-dot"></span>
          </div>

          <p class="mt-5 min-h-[3rem] text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {{ track.overview?.todayStatus || '轨道状态待生成' }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="view in trackSemanticViews(track)"
              :key="`${track.id}-${view}`"
              class="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {{ view }}
            </span>
          </div>

          <div class="mt-4 rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">OOS 轨道语义</p>
            <p class="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">
              {{ track.overview?.semantic?.needsQuestion || track.overview?.nextAction || '补充下一步行动' }}
            </p>
            <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {{ track.overview?.semantic?.archetype || track.type }} · {{ track.overview?.semantic?.nextActionDue || '今日' }}
            </p>
          </div>

          <div class="mt-5 flex h-16 items-end gap-1.5">
            <span
              v-for="point in normalizedTrend(track.overview?.recentTrend)"
              :key="point.date"
              class="track-bar"
              :style="{ height: `${point.height}%` }"
              :title="`${point.date}: ${point.value}`"
            ></span>
          </div>

          <div class="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Next</p>
            <p class="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-100">
              {{ track.overview?.nextAction || '补充下一步行动' }}
            </p>
          </div>

          <div class="mt-5 flex items-center justify-between gap-2" @click.stop>
            <button v-if="editingId === track.id" class="track-ghost-button" type="button" @click="saveTrackName(track)">保存</button>
            <button v-else class="track-ghost-button" type="button" @click="startEdit(track)">改名</button>
            <input class="track-inline-color" type="color" :value="track.color || '#18181b'" @input="updateTrackColor(track, $event.target.value)" />
            <button class="track-ghost-button" type="button" @click="openTrack(track)">详情</button>
            <button
              v-if="track.source_type !== 'system'"
              class="track-danger-button"
              type="button"
              @click="archiveCustomTrack(track)"
            >
              归档
            </button>
          </div>
        </article>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { archiveTrack, createTrack, listTracks, updateTrack } from '@/api/tracks.js'

const router = useRouter()
const tracks = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')
const editingId = ref(null)
const editingName = ref('')
const newTrack = reactive({
  name: '',
  color: '#18181b'
})

const typeLabel = (type) => ({
  habit: '习惯',
  learning: '学习',
  focus: '专注',
  project: '计划',
  custom: '自定义'
}[type] || '轨道')

const normalizedTrend = (trend = []) => {
  const safeTrend = Array.isArray(trend) && trend.length ? trend : Array.from({ length: 7 }, (_, index) => ({ date: `D${index + 1}`, value: 0 }))
  const max = Math.max(...safeTrend.map((item) => Number(item.value || 0)), 1)
  return safeTrend.map((item) => ({
    ...item,
    height: Math.max(12, Math.round((Number(item.value || 0) / max) * 100))
  }))
}

const trackSemanticViews = (track) => {
  const views = track?.overview?.semantic?.views
  return Array.isArray(views) && views.length ? views : ['基础视图', '行动证据']
}

const loadTracks = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const res = await listTracks()
  if (res.success) {
    tracks.value = res.data || []
  } else {
    errorMessage.value = res.error || '轨道加载失败'
  }
  isLoading.value = false
}

const submitTrack = async () => {
  const name = newTrack.name.trim()
  if (!name) {
    errorMessage.value = '请先输入轨道名称'
    return
  }
  isCreating.value = true
  const res = await createTrack({ name, color: newTrack.color, type: 'custom' })
  isCreating.value = false
  if (!res.success) {
    errorMessage.value = res.error || '创建轨道失败'
    return
  }
  newTrack.name = ''
  await loadTracks()
}

const openTrack = (track) => {
  router.push(`/tracks/${track.id}`)
}

const startEdit = (track) => {
  editingId.value = track.id
  editingName.value = track.name
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const saveTrackName = async (track) => {
  const name = editingName.value.trim()
  if (!name) return
  const res = await updateTrack(track.id, { name })
  if (res.success) {
    track.name = name
    cancelEdit()
  } else {
    errorMessage.value = res.error || '轨道更新失败'
  }
}

const updateTrackColor = async (track, color) => {
  track.color = color
  const res = await updateTrack(track.id, { color })
  if (!res.success) errorMessage.value = res.error || '颜色更新失败'
}

const archiveCustomTrack = async (track) => {
  const res = await archiveTrack(track.id)
  if (res.success) {
    tracks.value = tracks.value.filter((item) => item.id !== track.id)
  } else {
    errorMessage.value = res.error || '归档失败'
  }
}

onMounted(loadTracks)
</script>

<style scoped>
.track-create-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px auto;
  gap: 0.75rem;
  width: min(100%, 460px);
}

.track-input,
.track-name-input {
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: rgb(24, 24, 27);
  outline: none;
}

.track-input {
  min-height: 42px;
  padding: 0 1rem;
  font-size: 0.875rem;
}

.track-name-input {
  margin-top: 0.25rem;
  min-height: 34px;
  padding: 0 0.85rem;
  font-size: 1rem;
  font-weight: 600;
}

.track-color,
.track-inline-color {
  height: 42px;
  width: 42px;
  cursor: pointer;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 999px;
  background: transparent;
  padding: 4px;
}

.track-inline-color {
  height: 34px;
  width: 34px;
}

.track-primary-button,
.track-ghost-button,
.track-danger-button {
  min-height: 38px;
  border-radius: 999px;
  padding: 0 1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.track-primary-button {
  background: rgb(24, 24, 27);
  color: white;
}

.track-primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.track-ghost-button,
.track-danger-button {
  border: 1px solid rgba(212, 212, 216, 0.9);
  color: rgb(63, 63, 70);
}

.track-danger-button {
  color: rgb(185, 28, 28);
}

.track-primary-button:hover,
.track-ghost-button:hover,
.track-danger-button:hover {
  transform: translateY(-1px);
}

.track-card {
  position: relative;
  overflow: hidden;
  min-height: 24rem;
  border: 1px solid rgba(228, 228, 231, 0.86);
  border-radius: 1.75rem;
  background: rgba(255, 255, 255, 0.92);
  padding: 1.35rem;
  box-shadow: 0 24px 60px rgba(24, 24, 27, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.track-card:hover {
  transform: translateY(-2px);
  border-color: rgba(161, 161, 170, 0.9);
  box-shadow: 0 30px 70px rgba(24, 24, 27, 0.1);
}

.track-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--track-color) 18%, transparent), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent);
}

.track-card > * {
  position: relative;
}

.track-dot {
  height: 0.85rem;
  width: 0.85rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--track-color);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--track-color) 12%, transparent);
}

.track-bar {
  flex: 1;
  min-height: 12%;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--track-color) 72%, white), var(--track-color));
  opacity: 0.86;
}

.dark .track-input,
.dark .track-name-input,
.dark .track-color,
.dark .track-inline-color {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.85);
  color: white;
}

.dark .track-card {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(9, 9, 11, 0.86);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
}

.dark .track-card:hover {
  border-color: rgba(113, 113, 122, 0.95);
}

.dark .track-ghost-button,
.dark .track-danger-button {
  border-color: rgba(63, 63, 70, 0.9);
  color: rgb(228, 228, 231);
}

.dark .track-danger-button {
  color: rgb(252, 165, 165);
}

@media (max-width: 640px) {
  .track-create-form {
    grid-template-columns: minmax(0, 1fr) 42px;
  }

  .track-primary-button {
    grid-column: 1 / -1;
  }
}
</style>
