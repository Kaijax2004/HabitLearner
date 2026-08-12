export const PET_SETTINGS_UPDATED_EVENT = 'habitLearner:workspace-pet-settings-updated'

export const PET_SIZE_OPTIONS = [
  { value: 'large', label: '大', description: '接近当前页面上的陪伴感，适合桌面端常驻。', scale: 0.88 },
  { value: 'medium', label: '中', description: '更克制，不容易遮挡主要内容。', scale: 0.74 },
  { value: 'small', label: '小', description: '低存在感，只保留轻量入口和提醒。', scale: 0.62 }
]

export const PET_SPRITE_GRID = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208
}

export const DEFAULT_PET_SETTINGS = {
  activePetId: null,
  size: 'large'
}

export const DEFAULT_PET_STATE_MAP = {
  idle: { row: 0, frames: 6, duration: 6400 },
  working: { row: 1, frames: 8, duration: 1250 },
  thinking: { row: 2, frames: 8, duration: 1250 },
  waiting: { row: 3, frames: 4, duration: 1050 },
  done: { row: 4, frames: 5, duration: 900 },
  sleeping: { row: 5, frames: 6, duration: 4200 }
}

export const INTERNAL_PET_STATE_MAP = {
  idle: 'idle',
  working: 'working',
  thinking: 'thinking',
  waiting: 'waiting',
  done: 'done',
  sleeping: 'sleeping',
  running: 'working',
  'running-right': 'working',
  'running-left': 'working',
  waving: 'done',
  jumping: 'done',
  review: 'done',
  failed: 'thinking'
}

export const getPetSizeOption = (size = DEFAULT_PET_SETTINGS.size) => (
  PET_SIZE_OPTIONS.find((item) => item.value === size) || PET_SIZE_OPTIONS[0]
)

export const getPetScale = (size = DEFAULT_PET_SETTINGS.size) => getPetSizeOption(size).scale

export const normalizePetSettings = (settings = {}) => ({
  activePetId: settings.activePetId === undefined ? null : settings.activePetId,
  size: PET_SIZE_OPTIONS.some((item) => item.value === settings.size) ? settings.size : DEFAULT_PET_SETTINGS.size
})

export const normalizePetStateMap = (stateMap = {}) => {
  const nextMap = { ...DEFAULT_PET_STATE_MAP }
  Object.entries(stateMap || {}).forEach(([key, value]) => {
    if (!value || typeof value !== 'object') return
    nextMap[key] = {
      row: Number(value.row ?? DEFAULT_PET_STATE_MAP[key]?.row ?? 0),
      frames: Number(value.frames ?? DEFAULT_PET_STATE_MAP[key]?.frames ?? 1) || 1,
      duration: Number(value.duration ?? DEFAULT_PET_STATE_MAP[key]?.duration ?? 1200) || 1200
    }
  })
  return nextMap
}

export const resolvePetRenderState = (state = 'idle') => INTERNAL_PET_STATE_MAP[state] || 'idle'
