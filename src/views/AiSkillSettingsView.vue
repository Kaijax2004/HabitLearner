<template>
  <AppLayout title="Mentor-X 技能管理" show-back-button>
    <div class="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <section class="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">AI Skills</p>
            <h1 class="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">技能管理</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              技能只会作为提示规则和参考资料参与当前供应商请求，不会执行技能文件中的代码。
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn-primary px-4 py-2 text-sm" @click="skillFileInput?.click()">
              上传技能文件
            </button>
            <button type="button" class="btn-secondary px-4 py-2 text-sm" @click="skillFolderInput?.click()">
              上传技能文件夹
            </button>
          </div>
          <input
            ref="skillFileInput"
            type="file"
            class="hidden"
            accept=".md,.txt,.json,.yaml,.yml,.csv"
            @change="handleUpload"
          />
          <input
            ref="skillFolderInput"
            type="file"
            class="hidden"
            multiple
            webkitdirectory
            directory
            accept=".md,.txt,.json,.yaml,.yml,.csv"
            @change="handleUpload"
          />
        </div>

        <div v-if="errorMessage" class="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {{ errorMessage }}
        </div>
        <div v-if="isLoading" class="py-16 text-center text-sm text-zinc-500">正在读取技能...</div>
        <div v-else class="mt-8 space-y-8">
          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 class="font-semibold text-zinc-900 dark:text-white">内置技能</h2>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">开箱即用，不占用你的上传空间。</p>
              </div>
              <span class="text-xs text-zinc-400">{{ builtinSkills.length }} 个</span>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <article v-for="skill in builtinSkills" :key="skill.id" class="skill-card">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-medium text-zinc-900 dark:text-white">{{ skill.name }}</h3>
                    <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{{ skill.description }}</p>
                  </div>
                  <span class="skill-badge">内置</span>
                </div>
              </article>
            </div>
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 class="font-semibold text-zinc-900 dark:text-white">我的技能</h2>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">上传文件夹时请确保根目录包含 `SKILL.md`。</p>
              </div>
              <span class="text-xs text-zinc-400">{{ uploadedSkills.length }} 个</span>
            </div>

            <div v-if="!uploadedSkills.length" class="rounded-2xl border border-dashed border-zinc-300 px-5 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              还没有自定义技能，先上传一个技能文件夹。
            </div>
            <div v-else class="space-y-3">
              <article v-for="skill in uploadedSkills" :key="skill.id" class="skill-card">
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="font-medium text-zinc-900 dark:text-white">{{ skill.name }}</h3>
                      <span class="skill-badge" :class="skill.status === 'active' ? 'skill-badge-active' : 'skill-badge-muted'">
                        {{ skill.status === 'active' ? '已启用' : '已停用' }}
                      </span>
                    </div>
                    <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{{ skill.description || '暂无说明' }}</p>
                    <p class="mt-2 text-xs text-zinc-400">
                      {{ skill.manifest?.referenceCount || 0 }} 个参考文件
                    </p>
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2">
                    <button type="button" class="btn-secondary px-3 py-2 text-xs" @click="toggleSkill(skill)">
                      {{ skill.status === 'active' ? '停用' : '启用' }}
                    </button>
                    <button type="button" class="btn-secondary px-3 py-2 text-xs text-red-600" @click="removeSkill(skill)">
                      删除
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { deleteAiSkill, listAiSkills, updateAiSkill, uploadAiSkill } from '@/api/workspace'

const skillFileInput = ref(null)
const skillFolderInput = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const builtinSkills = ref([])
const uploadedSkills = ref([])

const loadSkills = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await listAiSkills()
    if (!response?.success) throw new Error(response?.error || '读取技能失败')
    builtinSkills.value = response.data?.builtinSkills || []
    uploadedSkills.value = response.data?.uploadedSkills || []
  } catch (error) {
    errorMessage.value = error.message || '读取技能失败'
  } finally {
    isLoading.value = false
  }
}

const handleUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return

  const formData = new FormData()
  files.forEach((file) => formData.append('files', file, file.webkitRelativePath || file.name))
  try {
    const response = await uploadAiSkill(formData)
    if (!response?.success) throw new Error(response?.error || '上传技能失败')
    await loadSkills()
  } catch (error) {
    errorMessage.value = error.message || '上传技能失败'
  }
}

const toggleSkill = async (skill) => {
  const response = await updateAiSkill(skill.id, { status: skill.status === 'active' ? 'disabled' : 'active' })
  if (!response?.success) {
    errorMessage.value = response?.error || '更新技能失败'
    return
  }
  await loadSkills()
}

const removeSkill = async (skill) => {
  if (!window.confirm(`确认删除技能“${skill.name}”吗？`)) return
  const response = await deleteAiSkill(skill.id)
  if (!response?.success) {
    errorMessage.value = response?.error || '删除技能失败'
    return
  }
  await loadSkills()
}

onMounted(loadSkills)
</script>

<style scoped>
.skill-card {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 1.25rem;
  background: rgba(250, 250, 250, 0.72);
  padding: 1rem 1.1rem;
}

.dark .skill-card {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(24, 24, 27, 0.72);
}

.skill-badge {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(228, 228, 231, 0.72);
  padding: 0.24rem 0.55rem;
  color: rgb(82 82 91);
  font-size: 0.7rem;
}

.skill-badge-active {
  background: rgba(220, 252, 231, 0.92);
  color: rgb(22 101 52);
}

.skill-badge-muted {
  background: rgba(244, 244, 245, 0.92);
  color: rgb(113 113 122);
}

.dark .skill-badge {
  background: rgba(63, 63, 70, 0.9);
  color: rgb(228 228 231);
}
</style>


