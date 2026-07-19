import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ambientSoundCatalog } from '@/data/ambientSounds.js'

const PRESET_KEY = 'habitlearner.ambient-presets.v2'
const FAVORITE_KEY = 'habitlearner.ambient-favorites.v1'
const RECENT_KEY = 'habitlearner.ambient-recent.v1'
const RECENT_LIMIT = 10
const CLEANUP_DELAY_MS = 250

const activeTrackIds = ref([])
const masterVolume = ref(72)
const presets = ref([])
const activePresetId = ref('')
const isPlaybackPaused = ref(false)
const presetNameDraft = ref('')
const favoriteSoundIds = ref([])
const recentSoundIds = ref([])

const trackVolumes = reactive({})
const soundIndex = new Map()
const audioPool = new Map()

let subscriberCount = 0
let cleanupTimer = null
let presetsLoaded = false

const clamp = (value, min, max) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return min
  return Math.min(Math.max(Math.round(parsed), min), max)
}

const loadIdList = (key) => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? [...new Set(parsed.map(String))] : []
  } catch {
    return []
  }
}

const saveIdList = (key, value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const loadPresets = () => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(PRESET_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizePreset)
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch {
    return []
  }
}

function ensureTrackState() {
  for (const category of ambientSoundCatalog) {
    for (const sound of category.sounds) {
      soundIndex.set(sound.id, sound)
      if (trackVolumes[sound.id] == null) {
        trackVolumes[sound.id] = clamp(sound.defaultVolume ?? 50, 0, 100)
      }
    }
  }
}

function normalizePreset(preset) {
  if (!preset || typeof preset !== 'object') return null

  const tracks = Array.isArray(preset.tracks)
    ? preset.tracks
        .map((item) => {
          const sound = soundIndex.get(item.id)
          if (!sound) return null
          return {
            id: sound.id,
            volume: clamp(Number(item.volume ?? sound.defaultVolume ?? 50), 0, 100)
          }
        })
        .filter(Boolean)
    : []

  return {
    id: String(preset.id || `preset-${Date.now()}`),
    name: String(preset.name || '未命名预设').trim() || '未命名预设',
    masterVolume: clamp(Number(preset.masterVolume ?? 72), 0, 100),
    tracks,
    createdAt: preset.createdAt || new Date().toISOString(),
    updatedAt: preset.updatedAt || new Date().toISOString()
  }
}

function persistPresets() {
  saveIdList(PRESET_KEY, presets.value)
}

function persistFavorites() {
  saveIdList(FAVORITE_KEY, favoriteSoundIds.value)
}

function persistRecent() {
  saveIdList(RECENT_KEY, recentSoundIds.value)
}

function getSoundById(soundId) {
  return soundIndex.get(soundId) || null
}

function resolveSoundId(input) {
  if (typeof input === 'string') return input
  if (input && typeof input === 'object') return input.id || ''
  return ''
}

function getAudio(sound) {
  if (!audioPool.has(sound.id)) {
    const audio = new Audio(sound.src)
    audio.loop = true
    audio.preload = 'metadata'
    audioPool.set(sound.id, audio)
  }

  return audioPool.get(sound.id)
}

function setAudioVolume(soundId) {
  const sound = getSoundById(soundId)
  if (!sound) return

  const audio = audioPool.get(soundId)
  if (!audio) return

  const trackVolume = clamp(trackVolumes[soundId] ?? sound.defaultVolume ?? 50, 0, 100)
  const mixVolume = clamp(masterVolume.value, 0, 100)
  audio.volume = (trackVolume / 100) * (mixVolume / 100)
}

function markRecentSound(soundId) {
  const normalized = resolveSoundId(soundId)
  if (!normalized) return

  recentSoundIds.value = [normalized, ...recentSoundIds.value.filter((id) => id !== normalized)].slice(0, RECENT_LIMIT)
  persistRecent()
}

function applyPresetState(preset) {
  stopAll()
  masterVolume.value = clamp(preset.masterVolume ?? 72, 0, 100)

  for (const track of preset.tracks || []) {
    const sound = getSoundById(track.id)
    if (!sound) continue
    trackVolumes[track.id] = clamp(track.volume ?? sound.defaultVolume ?? 50, 0, 100)
    activeTrackIds.value.push(track.id)
    markRecentSound(track.id)
  }

  activePresetId.value = preset.id
  isPlaybackPaused.value = false
}

async function playTrack(soundId) {
  const sound = getSoundById(soundId)
  if (!sound) return false

  const audio = getAudio(sound)
  setAudioVolume(soundId)

  if (!activeTrackIds.value.includes(soundId)) {
    activeTrackIds.value = [...activeTrackIds.value, soundId]
  }

  try {
    await audio.play()
    isPlaybackPaused.value = false
    markRecentSound(soundId)
    return true
  } catch {
    activeTrackIds.value = activeTrackIds.value.filter((id) => id !== soundId)
    return false
  }
}

function pauseAndReset(soundId) {
  const audio = audioPool.get(soundId)
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

function syncAllVolumes() {
  activeTrackIds.value.forEach((soundId) => setAudioVolume(soundId))
}

function stopSound(input) {
  const soundId = resolveSoundId(input)
  if (!soundId) return

  pauseAndReset(soundId)
  activeTrackIds.value = activeTrackIds.value.filter((id) => id !== soundId)

  if (activePresetId.value && !activeTrackIds.value.length) {
    activePresetId.value = ''
  }

  if (!activeTrackIds.value.length) {
    isPlaybackPaused.value = false
  }
}

function stopAll() {
  activeTrackIds.value.forEach((soundId) => pauseAndReset(soundId))
  activeTrackIds.value = []
  activePresetId.value = ''
  isPlaybackPaused.value = false
}

function pauseAll() {
  if (!activeTrackIds.value.length) return false

  activeTrackIds.value.forEach((soundId) => {
    const audio = audioPool.get(soundId)
    if (audio) {
      audio.pause()
    }
  })

  isPlaybackPaused.value = true
  return true
}

async function resumeAll() {
  if (!activeTrackIds.value.length) return false

  const results = await Promise.all(activeTrackIds.value.map(async (soundId) => {
    const sound = getSoundById(soundId)
    if (!sound) return false

    const audio = getAudio(sound)
    setAudioVolume(soundId)

    try {
      await audio.play()
      return true
    } catch {
      return false
    }
  }))

  isPlaybackPaused.value = false
  return results.every(Boolean)
}

function togglePlayback() {
  return isPlaybackPaused.value ? resumeAll() : pauseAll()
}

function toggleSound(input) {
  const soundId = resolveSoundId(input)
  if (!soundId) return Promise.resolve(false)

  if (activeTrackIds.value.includes(soundId)) {
    stopSound(soundId)
    return Promise.resolve(false)
  }

  return playTrack(soundId)
}

function setTrackVolume(soundId, value) {
  const normalized = resolveSoundId(soundId)
  if (!normalized) return

  trackVolumes[normalized] = clamp(value, 0, 100)
  setAudioVolume(normalized)
}

function setMasterVolume(value) {
  masterVolume.value = clamp(value, 0, 100)
  syncAllVolumes()
}

function captureCurrentPreset(name) {
  const tracks = activeTrackIds.value
    .map((soundId) => {
      const sound = getSoundById(soundId)
      if (!sound) return null
      return {
        id: soundId,
        volume: clamp(trackVolumes[soundId] ?? sound.defaultVolume ?? 50, 0, 100)
      }
    })
    .filter(Boolean)

  if (!tracks.length) return null

  const presetName = String(name || '').trim() || '未命名预设'
  return {
    id: `preset-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: presetName,
    masterVolume: clamp(masterVolume.value, 0, 100),
    tracks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function writePresetList(list, activeId = '') {
  presets.value = [...list]
    .map(normalizePreset)
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  if (activeId) {
    activePresetId.value = activeId
  }
  persistPresets()
}

function saveCurrentAsPreset(name) {
  const preset = captureCurrentPreset(name)
  if (!preset) return null

  writePresetList([preset, ...presets.value.filter((item) => item.id !== preset.id)], preset.id)
  return preset
}

function overwritePreset(presetId) {
  const existing = presets.value.find((item) => item.id === presetId)
  const snapshot = captureCurrentPreset(existing?.name || presetNameDraft.value || '未命名预设')
  if (!existing || !snapshot) return null

  const updated = {
    ...existing,
    name: existing.name,
    masterVolume: snapshot.masterVolume,
    tracks: snapshot.tracks,
    updatedAt: new Date().toISOString()
  }

  writePresetList([updated, ...presets.value.filter((item) => item.id !== presetId)], presetId)
  return updated
}

function renamePreset(presetId, name) {
  const preset = presets.value.find((item) => item.id === presetId)
  const nextName = String(name || '').trim()
  if (!preset || !nextName) return null

  const updated = {
    ...preset,
    name: nextName,
    updatedAt: new Date().toISOString()
  }

  writePresetList([updated, ...presets.value.filter((item) => item.id !== presetId)], activePresetId.value === presetId ? presetId : activePresetId.value)
  return updated
}

function duplicatePreset(presetId, name) {
  const preset = presets.value.find((item) => item.id === presetId)
  if (!preset) return null

  const copied = {
    ...preset,
    id: `preset-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: String(name || `${preset.name} 副本`).trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  writePresetList([copied, ...presets.value], copied.id)
  return copied
}

function deletePreset(presetId) {
  presets.value = presets.value.filter((item) => item.id !== presetId)
  if (activePresetId.value === presetId) {
    activePresetId.value = ''
  }
  persistPresets()
}

async function applyPreset(presetId) {
  const preset = presets.value.find((item) => item.id === presetId)
  if (!preset) return false

  stopAll()
  masterVolume.value = clamp(preset.masterVolume ?? 72, 0, 100)

  for (const track of preset.tracks || []) {
    const sound = getSoundById(track.id)
    if (!sound) continue
    trackVolumes[track.id] = clamp(track.volume ?? sound.defaultVolume ?? 50, 0, 100)
    activeTrackIds.value.push(track.id)
    markRecentSound(track.id)
  }

  activePresetId.value = preset.id
  await Promise.all(activeTrackIds.value.map((soundId) => playTrack(soundId)))
  return true
}

function refreshPresetsFromStorage() {
  presets.value = loadPresets()
}

function toggleFavoriteSound(soundId) {
  const normalized = resolveSoundId(soundId)
  if (!normalized) return

  if (favoriteSoundIds.value.includes(normalized)) {
    favoriteSoundIds.value = favoriteSoundIds.value.filter((id) => id !== normalized)
  } else {
    favoriteSoundIds.value = [normalized, ...favoriteSoundIds.value]
  }
  persistFavorites()
}

function isFavoriteSound(soundId) {
  return favoriteSoundIds.value.includes(resolveSoundId(soundId))
}

function clearRecentSounds() {
  recentSoundIds.value = []
  persistRecent()
}

function clearFavoriteSounds() {
  favoriteSoundIds.value = []
  persistFavorites()
}

function getCategorySounds(categoryId) {
  return ambientSoundCatalog.find((item) => item.id === categoryId)?.sounds || []
}

function getActiveTracks() {
  return activeTrackIds.value
    .map((soundId) => getSoundById(soundId))
    .filter(Boolean)
}

function getFavoriteTracks() {
  return favoriteSoundIds.value
    .map((soundId) => getSoundById(soundId))
    .filter(Boolean)
}

function getRecentTracks() {
  return recentSoundIds.value
    .map((soundId) => getSoundById(soundId))
    .filter(Boolean)
}

function scheduleCleanup() {
  if (cleanupTimer) clearTimeout(cleanupTimer)
  cleanupTimer = setTimeout(() => {
    if (subscriberCount === 0) {
      stopAll()
    }
  }, CLEANUP_DELAY_MS)
}

export function useAmbientMixer() {
  ensureTrackState()

  if (!presetsLoaded) {
    presets.value = loadPresets()
    favoriteSoundIds.value = loadIdList(FAVORITE_KEY).filter((id) => soundIndex.has(id))
    recentSoundIds.value = loadIdList(RECENT_KEY).filter((id) => soundIndex.has(id)).slice(0, RECENT_LIMIT)
    presetsLoaded = true
  }

  onMounted(() => {
    subscriberCount += 1
    if (cleanupTimer) {
      clearTimeout(cleanupTimer)
      cleanupTimer = null
    }
  })

  onBeforeUnmount(() => {
    subscriberCount = Math.max(0, subscriberCount - 1)
    if (subscriberCount === 0) {
      scheduleCleanup()
    }
  })

  return {
    activePresetId,
    activeTrackIds,
    activeTracks: computed(getActiveTracks),
    ambientSoundCatalog,
    applyPreset,
    clearFavoriteSounds,
    clearRecentSounds,
    deletePreset,
    duplicatePreset,
    getActiveTracks,
    getCategorySounds,
    getFavoriteTracks,
    getRecentTracks,
    getSoundById,
    isFavoriteSound,
    masterVolume,
    isPlaybackPaused,
    markRecentSound,
    overwritePreset,
    presetNameDraft,
    presets,
    recentSoundIds,
    favoriteSoundIds,
    refreshPresetsFromStorage,
    renamePreset,
    saveCurrentAsPreset,
    setMasterVolume,
    setTrackVolume,
    pauseAll,
    resumeAll,
    togglePlayback,
    stopAll,
    stopSound,
    syncAllVolumes,
    toggleFavoriteSound,
    toggleSound,
    trackVolumes
  }
}
