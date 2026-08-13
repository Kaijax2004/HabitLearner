<template>
  <AppLayout title="宠物设置" show-back-button>
    <div class="pet-settings-page">
      <section class="pet-settings-hero">
        <div>
          <p class="pet-eyebrow">Companion Library</p>
          <h1>习知宠物资源库</h1>
          <p>
            宠物形象现在保存到后端，不再写入浏览器本地图片数据。这里仅支持上传 Codex 风格宠物文件夹，标准结构建议包含 pet.json、spritesheet、preview 和 validation 文件。
          </p>
        </div>
        <div class="pet-hero-status">
          <span>当前宠物</span>
          <strong>{{ activePetName }}</strong>
          <small>{{ selectedPetDescription }}</small>
        </div>
      </section>

      <section class="pet-settings-grid">
        <BaseCard class="pet-form-card" :hover="false">
          <div class="pet-section-head">
            <div>
              <p class="pet-eyebrow">01 Import</p>
              <h2>导入宠物文件夹</h2>
              <p>只支持文件夹上传。直接选择解压后的宠物目录即可，Codex 风格的宠物包会自动读取 pet.json 与 spritesheet。</p>
            </div>
          </div>

          <div
            class="pet-upload-box"
            :class="{ 'has-files': selectedFiles.length }"
            role="button"
            tabindex="0"
            @click="openFolderPicker"
            @keydown.enter.prevent="openFolderPicker"
            @keydown.space.prevent="openFolderPicker"
          >
            <input
              ref="folderInput"
              class="pet-upload-input"
              type="file"
              webkitdirectory
              directory
              multiple
              accept=".json,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.txt,.md"
              @change="handleFolderSelect"
            />
            <span>选择宠物文件夹</span>
            <strong>{{ selectedFolderLabel }}</strong>
            <small>需要包含 spritesheet.png / spritesheet.webp，推荐同时包含 pet.json、preview.png、validation.json。</small>
            <button type="button" class="pet-upload-trigger" @click.stop="openFolderPicker">
              打开文件夹选择
            </button>
          </div>

          <div class="pet-import-actions">
            <button type="button" class="pet-primary-button" :disabled="!selectedFiles.length || isUploading" @click="importSelectedFolder">
              {{ isUploading ? '导入中...' : '导入并设为当前' }}
            </button>
            <button type="button" class="pet-secondary-button" :disabled="!selectedFiles.length || isUploading" @click="clearSelectedFolder">清空选择</button>
          </div>

          <div class="pet-section-head compact">
            <div>
              <p class="pet-eyebrow">02 Size</p>
              <h2>显示大小</h2>
              <p>默认“大”接近当前陪伴感，中和小用于降低遮挡。大小会保存到后端并同步全局宠物。</p>
            </div>
          </div>

          <div class="pet-size-grid">
            <button
              v-for="option in sizeOptions"
              :key="option.value"
              type="button"
              class="pet-size-card"
              :class="{ active: selectedSize === option.value }"
              @click="selectedSize = option.value"
            >
              <strong>{{ option.label }}</strong>
              <span>{{ option.description }}</span>
            </button>
          </div>

          <div class="pet-actions">
            <button type="button" class="pet-primary-button" :disabled="isSaving" @click="saveCurrentSetting">
              {{ isSaving ? '保存中...' : '保存当前选择' }}
            </button>
            <button type="button" class="pet-secondary-button" :disabled="isSaving" @click="selectBuiltInPet">恢复默认宠物</button>
          </div>
        </BaseCard>

        <BaseCard class="pet-preview-card" :hover="false">
          <div class="pet-section-head compact no-margin">
            <div>
              <p class="pet-eyebrow">Preview</p>
              <h2>当前预览</h2>
              <p>六个基础动作槽：待机、工作、思考、等待、完成、休息。导入的宠物会按这些槽位播放。</p>
            </div>
          </div>

          <div class="pet-preview-stage">
            <div class="pet-preview-shadow"></div>
            <div class="pet-preview-figure" :style="mainPreviewStyle" aria-label="宠物预览"></div>
          </div>

          <div class="pet-action-preview-grid">
            <div v-for="item in actionPreviewItems" :key="item.state" class="pet-action-preview-card">
              <div class="pet-action-sprite" :style="item.style"></div>
              <strong>{{ item.label }}</strong>
              <span>{{ item.hint }}</span>
            </div>
          </div>
        </BaseCard>
      </section>

      <BaseCard class="pet-library-card" :hover="false">
        <div class="pet-section-head">
          <div>
            <p class="pet-eyebrow">03 Library</p>
            <h2>已保存宠物</h2>
            <p>默认宠物不可删除；后端上传的宠物可以保存多款、切换和删除。</p>
          </div>
          <button type="button" class="pet-secondary-button" :disabled="isLoading" @click="loadPets">刷新列表</button>
        </div>

        <div class="pet-library-grid">
          <article
            v-for="pet in libraryItems"
            :key="pet.id"
            class="pet-library-item"
            :class="{ active: String(selectedPetId || 'builtin') === String(pet.id) }"
          >
            <button type="button" class="pet-library-main" @click="selectPet(pet)">
              <div class="pet-library-preview" :style="getLibraryPreviewStyle(pet)"></div>
              <div>
                <strong>{{ pet.name }}</strong>
                <p>{{ pet.description || '标准宠物资源包' }}</p>
                <span>{{ pet.sourceType === 'builtin' ? '内置资源' : '后端资源' }}</span>
              </div>
            </button>
            <div class="pet-library-actions">
              <button type="button" class="pet-mini-button" @click="selectPet(pet)">选择</button>
              <button v-if="pet.sourceType !== 'builtin'" type="button" class="pet-danger-button" :disabled="isDeletingId === pet.id" @click="deletePet(pet)">
                {{ isDeletingId === pet.id ? '删除中' : '删除' }}
              </button>
            </div>
          </article>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { useToast } from '@/composables/useToast'
import {
  deleteWorkspacePet,
  importWorkspacePetPack,
  listWorkspacePets,
  updateWorkspacePetSetting
} from '@/api/workspace.js'
import {
  DEFAULT_PET_SETTINGS,
  DEFAULT_PET_STATE_MAP,
  PET_SETTINGS_UPDATED_EVENT,
  PET_SIZE_OPTIONS,
  PET_SPRITE_GRID,
  getPetScale,
  getPetSizeOption,
  normalizePetSettings,
  normalizePetStateMap,
  writeCachedPetSettings
} from '@/utils/petSettings.js'

const { success, error: showError, warning } = useToast()
const defaultSpriteUrl = `${import.meta.env.BASE_URL}assets/pet/baie/spritesheet.webp`
const CELL_WIDTH = PET_SPRITE_GRID.cellWidth
const CELL_HEIGHT = PET_SPRITE_GRID.cellHeight
const SHEET_WIDTH = CELL_WIDTH * PET_SPRITE_GRID.columns
const SHEET_HEIGHT = CELL_HEIGHT * PET_SPRITE_GRID.rows

const sizeOptions = PET_SIZE_OPTIONS
const folderInput = ref(null)
const pets = ref([])
const settings = ref({ ...DEFAULT_PET_SETTINGS })
const selectedPetId = ref(null)
const selectedSize = ref(DEFAULT_PET_SETTINGS.size)
const selectedFiles = ref([])
const selectedFolderName = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const isUploading = ref(false)
const isDeletingId = ref(null)

const builtInPet = computed(() => ({
  id: 'builtin',
  name: '默认像素宠物',
  description: 'HabitLearner 内置宠物，适合没有自定义资源时使用。',
  sourceType: 'builtin',
  spritesheetUrl: defaultSpriteUrl,
  previewUrl: defaultSpriteUrl,
  stateMap: DEFAULT_PET_STATE_MAP
}))

const libraryItems = computed(() => [builtInPet.value, ...pets.value])
const selectedPet = computed(() => {
  if (!selectedPetId.value) return builtInPet.value
  return pets.value.find((pet) => Number(pet.id) === Number(selectedPetId.value)) || builtInPet.value
})
const selectedPetStateMap = computed(() => normalizePetStateMap(selectedPet.value.stateMap || DEFAULT_PET_STATE_MAP))
const activePetName = computed(() => selectedPet.value.name || '默认像素宠物')
const selectedPetDescription = computed(() => selectedPet.value.description || '标准宠物资源包')
const currentScale = computed(() => getPetScale(selectedSize.value))
const selectedFolderLabel = computed(() => {
  if (!selectedFiles.value.length) return '请选择一个宠物文件夹'
  return `${selectedFolderName.value || '宠物文件夹'} · ${selectedFiles.value.length} 个文件`
})

const actionLabels = [
  { state: 'idle', label: '待机', hint: '低频存在感' },
  { state: 'working', label: '工作', hint: '执行请求时' },
  { state: 'thinking', label: '思考', hint: '判断和提醒' },
  { state: 'waiting', label: '等待', hint: '等待输入' },
  { state: 'done', label: '完成', hint: '轻反馈' },
  { state: 'sleeping', label: '休息', hint: '低活跃' }
]

const buildSpriteFrameStyle = (pet, state, scale = 0.44) => {
  const stateMap = normalizePetStateMap(pet.stateMap || DEFAULT_PET_STATE_MAP)
  const meta = stateMap[state] || stateMap.idle || DEFAULT_PET_STATE_MAP.idle
  const imageUrl = pet.spritesheetUrl || defaultSpriteUrl
  return {
    width: `${Math.round(CELL_WIDTH * scale)}px`,
    height: `${Math.round(CELL_HEIGHT * scale)}px`,
    backgroundImage: `url("${imageUrl}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${Math.round(SHEET_WIDTH * scale)}px ${Math.round(SHEET_HEIGHT * scale)}px`,
    backgroundPosition: `0 ${Math.round(-meta.row * CELL_HEIGHT * scale)}px`
  }
}

const mainPreviewStyle = computed(() => {
  const scale = currentScale.value || 0.88
  return buildSpriteFrameStyle(selectedPet.value, 'idle', scale)
})

const actionPreviewItems = computed(() => actionLabels.map((item) => ({
  ...item,
  style: buildSpriteFrameStyle(selectedPet.value, item.state, 0.32)
})))

const getLibraryPreviewStyle = (pet) => buildSpriteFrameStyle(pet, 'idle', 0.26)

const emitPetUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PET_SETTINGS_UPDATED_EVENT))
  }
}

const syncSelectionFromSettings = (data = {}) => {
  const nextSettings = normalizePetSettings(data.setting || {})
  settings.value = nextSettings
  selectedPetId.value = nextSettings.activePetId || null
  selectedSize.value = getPetSizeOption(nextSettings.size).value
}

const loadPets = async () => {
  isLoading.value = true
  try {
    const response = await listWorkspacePets()
    if (!response?.success) throw new Error(response?.error || '获取宠物列表失败')
    const data = response.data || {}
    pets.value = Array.isArray(data.pets) ? data.pets : []
    syncSelectionFromSettings(data)
  } catch (error) {
    showError('加载宠物失败', { description: error.message || '请稍后重试。' })
  } finally {
    isLoading.value = false
  }
}

const selectBuiltInPet = () => {
  selectedPetId.value = null
}

const selectPet = (pet) => {
  selectedPetId.value = pet.sourceType === 'builtin' ? null : pet.id
}

const clearSelectedFolder = () => {
  selectedFiles.value = []
  selectedFolderName.value = ''
  if (folderInput.value) folderInput.value.value = ''
}

const openFolderPicker = () => {
  folderInput.value?.click?.()
}

const isSystemPetFile = (file) => {
  const relativePath = file.webkitRelativePath || file.name || ''
  const parts = relativePath.split(/[\\/]/).filter(Boolean)
  return parts.some((part) => (
    part === '__MACOSX'
    || part === '.DS_Store'
    || part.startsWith('._')
  ))
}

const handleFolderSelect = (event) => {
  const rawFiles = Array.from(event.target.files || [])
  const files = rawFiles.filter((file) => file.name && !isSystemPetFile(file))
  selectedFiles.value = files
  const firstPath = files[0]?.webkitRelativePath || ''
  selectedFolderName.value = firstPath ? firstPath.split('/')[0] : ''

  if (rawFiles.length && !files.length) {
    warning('没有找到有效宠物文件', { description: '请直接选择包含 pet.json 和 spritesheet 的宠物文件夹。' })
    return
  }

  if (files.length && !files.some((file) => /spritesheet\.(png|webp|jpg|jpeg|gif|bmp)$/i.test(file.name))) {
    warning('可能缺少 spritesheet', { description: '当前文件夹没有检测到 spritesheet 图片，导入前请确认目录结构。' })
  }
}

const importSelectedFolder = async () => {
  if (!selectedFiles.value.length) return

  const hasSpritesheet = selectedFiles.value.some((file) => /spritesheet\.(png|webp|jpg|jpeg|gif|bmp)$/i.test(file.name))
  if (!hasSpritesheet) {
    showError('缺少 spritesheet', { description: '宠物文件夹中必须包含 spritesheet.png 或 spritesheet.webp。' })
    return
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('folderName', selectedFolderName.value || 'pet-folder')
    formData.append('size', selectedSize.value)
    selectedFiles.value.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.name
      formData.append('files', file, relativePath)
    })

    const response = await importWorkspacePetPack(formData)
    if (!response?.success) throw new Error(response?.error || '宠物导入失败')
    clearSelectedFolder()
    await loadPets()
    emitPetUpdated()
    success('宠物已导入', { description: '已保存到后端，并设为当前宠物。' })
  } catch (error) {
    showError('导入失败', { description: error.message || '请确认文件夹结构是否正确。' })
  } finally {
    isUploading.value = false
  }
}

const saveCurrentSetting = async () => {
  isSaving.value = true
  try {
    const response = await updateWorkspacePetSetting({
      activePetId: selectedPetId.value || null,
      size: selectedSize.value
    })
    if (!response?.success) throw new Error(response?.error || '保存失败')
    settings.value = normalizePetSettings(response.data || {})
    writeCachedPetSettings(settings.value)
    emitPetUpdated()
    success('宠物设置已保存', { description: '全局宠物已经同步更新。' })
  } catch (error) {
    showError('保存失败', { description: error.message || '请稍后重试。' })
  } finally {
    isSaving.value = false
  }
}

const deletePet = async (pet) => {
  if (!pet?.id || pet.sourceType === 'builtin') return
  if (!window.confirm(`确定删除「${pet.name}」吗？删除后对应后端文件也会清理。`)) return

  isDeletingId.value = pet.id
  try {
    const response = await deleteWorkspacePet(pet.id)
    if (!response?.success) throw new Error(response?.error || '删除失败')
    await loadPets()
    emitPetUpdated()
    success('宠物已删除', { description: '如果它是当前宠物，已自动恢复默认。' })
  } catch (error) {
    showError('删除失败', { description: error.message || '请稍后重试。' })
  } finally {
    isDeletingId.value = null
  }
}

onMounted(() => {
  loadPets()
})
</script>

<style scoped>
.pet-settings-page {
  display: grid;
  gap: 1.25rem;
}

.pet-settings-hero,
.pet-form-card,
.pet-preview-card,
.pet-library-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(212, 212, 216, 0.82);
  border-radius: 2rem;
  background:
    radial-gradient(circle at 12% 0%, rgba(199, 166, 90, 0.12), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(244, 244, 245, 0.82));
  box-shadow: 0 22px 70px rgba(24, 24, 27, 0.1);
}

.pet-settings-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.38fr);
  gap: 1rem;
  align-items: end;
  padding: 1.5rem;
}

.pet-eyebrow {
  color: rgb(113, 113, 122);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.pet-settings-hero h1,
.pet-section-head h2 {
  margin-top: 0.45rem;
  color: rgb(9, 9, 11);
  font-weight: 760;
  letter-spacing: -0.05em;
}

.pet-settings-hero h1 {
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.pet-section-head h2 {
  font-size: 1.45rem;
}

.pet-settings-hero p,
.pet-section-head p {
  margin-top: 0.55rem;
  max-width: 46rem;
  color: rgb(82, 82, 91);
  font-size: 0.9rem;
  line-height: 1.8;
}

.pet-hero-status {
  display: grid;
  gap: 0.45rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 1rem;
}

.pet-hero-status span,
.pet-library-item span,
.pet-action-preview-card span {
  color: rgb(113, 113, 122);
  font-size: 0.72rem;
  font-weight: 760;
}

.pet-hero-status strong {
  color: rgb(24, 24, 27);
  font-size: 1.55rem;
  font-weight: 820;
}

.pet-hero-status small {
  color: rgb(113, 113, 122);
  font-size: 0.78rem;
  line-height: 1.6;
}

.pet-settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.95fr);
  gap: 1.25rem;
  align-items: stretch;
}

.pet-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.pet-section-head.compact {
  margin-top: 1.25rem;
}

.pet-section-head.no-margin {
  margin-top: 0;
}

.pet-upload-box {
  position: relative;
  display: grid;
  gap: 0.38rem;
  margin-top: 1rem;
  border: 1px dashed rgba(161, 161, 170, 0.9);
  border-radius: 1.35rem;
  background: rgba(250, 250, 250, 0.72);
  padding: 1rem;
  cursor: pointer;
}

.pet-upload-box:hover,
.pet-upload-box.has-files {
  border-color: rgba(24, 24, 27, 0.7);
  background: rgba(255, 255, 255, 0.9);
}

.pet-upload-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.pet-upload-trigger {
  justify-self: start;
  min-height: 2.2rem;
  margin-top: 0.3rem;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.86);
  padding: 0 0.9rem;
  color: rgb(39, 39, 42);
  font-size: 0.78rem;
  font-weight: 820;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.pet-upload-trigger:hover {
  transform: translateY(-1px);
  border-color: rgba(24, 24, 27, 0.36);
}

.pet-upload-box span,
.pet-upload-box small {
  color: rgb(113, 113, 122);
  font-size: 0.76rem;
}

.pet-upload-box strong {
  color: rgb(24, 24, 27);
  font-size: 1rem;
  font-weight: 800;
}

.pet-size-grid,
.pet-action-preview-grid,
.pet-library-grid {
  display: grid;
  gap: 0.85rem;
}

.pet-size-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.pet-size-card {
  min-height: 5rem;
  border: 1px solid rgba(228, 228, 231, 0.92);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.72);
  padding: 1rem;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.pet-size-card:hover,
.pet-size-card.active {
  transform: translateY(-1px);
  border-color: rgb(24, 24, 27);
  background: rgba(255, 255, 255, 0.96);
}

.pet-size-card strong,
.pet-library-item strong,
.pet-action-preview-card strong {
  display: block;
  color: rgb(24, 24, 27);
  font-size: 0.96rem;
  font-weight: 800;
}

.pet-size-card span,
.pet-library-item p {
  display: block;
  margin-top: 0.38rem;
  color: rgb(113, 113, 122);
  font-size: 0.78rem;
  line-height: 1.55;
}

.pet-actions,
.pet-import-actions,
.pet-library-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.25rem;
}

.pet-primary-button,
.pet-secondary-button,
.pet-mini-button,
.pet-danger-button {
  min-height: 2.65rem;
  border-radius: 9999px;
  padding: 0 1.15rem;
  font-size: 0.86rem;
  font-weight: 800;
  transition: transform 0.18s ease, background 0.18s ease, opacity 0.18s ease;
}

.pet-primary-button {
  background: rgb(24, 24, 27);
  color: white;
}

.pet-secondary-button,
.pet-mini-button {
  border: 1px solid rgba(212, 212, 216, 0.9);
  background: rgba(255, 255, 255, 0.8);
  color: rgb(63, 63, 70);
}

.pet-danger-button {
  border: 1px solid rgba(239, 68, 68, 0.24);
  background: rgba(254, 226, 226, 0.68);
  color: rgb(185, 28, 28);
}

.pet-primary-button:hover,
.pet-secondary-button:hover,
.pet-mini-button:hover,
.pet-danger-button:hover {
  transform: translateY(-1px);
}

.pet-primary-button:disabled,
.pet-secondary-button:disabled,
.pet-danger-button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
  transform: none;
}

.pet-preview-card {
  display: flex;
  flex-direction: column;
}

.pet-preview-stage {
  position: relative;
  display: grid;
  min-height: 22rem;
  place-items: center;
  margin-top: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.75rem;
  background:
    linear-gradient(90deg, rgba(24, 24, 27, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(24, 24, 27, 0.04) 1px, transparent 1px),
    radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.92), transparent 32%),
    rgba(250, 250, 250, 0.7);
  background-size: 24px 24px, 24px 24px, auto, auto;
}

.pet-preview-shadow {
  position: absolute;
  bottom: 4.2rem;
  width: 9rem;
  height: 1rem;
  border-radius: 9999px;
  background: rgba(24, 24, 27, 0.14);
  filter: blur(10px);
}

.pet-preview-figure,
.pet-action-sprite,
.pet-library-preview {
  position: relative;
  z-index: 1;
  image-rendering: auto;
  filter: drop-shadow(0 18px 20px rgba(24, 24, 27, 0.16));
}

.pet-action-preview-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.pet-action-preview-card {
  display: grid;
  min-height: 7rem;
  place-items: center;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.75rem;
  text-align: center;
}

.pet-library-card {
  padding: 1.25rem;
}

.pet-library-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 1rem;
}

.pet-library-item {
  display: grid;
  gap: 0.75rem;
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.85rem;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.pet-library-item.active {
  border-color: rgba(24, 24, 27, 0.74);
  box-shadow: 0 0 0 3px rgba(24, 24, 27, 0.06);
}

.pet-library-main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.8rem;
  align-items: center;
  text-align: left;
}

.pet-library-preview {
  width: 50px;
  height: 54px;
  overflow: hidden;
}

.pet-library-actions {
  justify-content: flex-end;
  margin-top: 0;
}

.pet-mini-button,
.pet-danger-button {
  min-height: 2rem;
  padding: 0 0.8rem;
  font-size: 0.76rem;
}

.dark .pet-settings-hero,
.dark .pet-form-card,
.dark .pet-preview-card,
.dark .pet-library-card {
  border-color: rgba(63, 63, 70, 0.86);
  background:
    radial-gradient(circle at 12% 0%, rgba(199, 166, 90, 0.1), transparent 32%),
    linear-gradient(135deg, rgba(24, 24, 27, 0.86), rgba(9, 9, 11, 0.82));
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.28);
}

.dark .pet-settings-hero h1,
.dark .pet-section-head h2,
.dark .pet-hero-status strong,
.dark .pet-size-card strong,
.dark .pet-library-item strong,
.dark .pet-action-preview-card strong,
.dark .pet-upload-box strong {
  color: white;
}

.dark .pet-settings-hero p,
.dark .pet-section-head p,
.dark .pet-eyebrow,
.dark .pet-hero-status span,
.dark .pet-hero-status small,
.dark .pet-size-card span,
.dark .pet-library-item p,
.dark .pet-library-item span,
.dark .pet-action-preview-card span,
.dark .pet-upload-box span,
.dark .pet-upload-box small {
  color: rgb(161, 161, 170);
}

.dark .pet-hero-status,
.dark .pet-size-card,
.dark .pet-upload-box,
.dark .pet-upload-trigger,
.dark .pet-action-preview-card,
.dark .pet-library-item,
.dark .pet-secondary-button,
.dark .pet-mini-button {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(24, 24, 27, 0.7);
  color: rgb(228, 228, 231);
}

.dark .pet-size-card:hover,
.dark .pet-size-card.active,
.dark .pet-library-item.active {
  border-color: rgba(255, 255, 255, 0.62);
  background: rgba(39, 39, 42, 0.88);
}

.dark .pet-primary-button {
  background: white;
  color: rgb(24, 24, 27);
}

.dark .pet-preview-stage {
  border-color: rgba(63, 63, 70, 0.86);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 50% 12%, rgba(255, 255, 255, 0.12), transparent 34%),
    rgba(9, 9, 11, 0.52);
  background-size: 24px 24px, 24px 24px, auto, auto;
}

@media (max-width: 1180px) {
  .pet-settings-hero,
  .pet-settings-grid,
  .pet-library-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .pet-settings-hero,
  .pet-form-card,
  .pet-preview-card,
  .pet-library-card {
    border-radius: 1.5rem;
  }

  .pet-size-grid,
  .pet-action-preview-grid,
  .pet-library-grid,
  .pet-library-main {
    grid-template-columns: 1fr;
  }
}
</style>
