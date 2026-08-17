<template>
  <div class="workspace-pet-root" :class="{ 'is-panel-left': shouldOpenPanelLeft, 'is-ready': isVisualReady }" :style="rootStyle">
    <button
      type="button"
      class="workspace-pet"
      :class="[`is-state-${activeState}`, { 'is-dragging': isDragging, 'is-panel-open': isPanelOpen }]"
      :title="petTitle"
      @pointerdown="handlePointerDown"
      @click="handleClick"
    >
      <div class="workspace-pet-sprite" :style="spriteStyle"></div>
      <div v-if="speechText" class="workspace-pet-speech">{{ speechText }}</div>
    </button>

    <section v-if="isPanelOpen" class="workspace-pet-panel" @pointerdown.stop>
      <header class="workspace-pet-panel-header">
        <div>
          <p class="workspace-pet-kicker">{{ ui.kicker }}</p>
          <h3 class="workspace-pet-title">{{ ui.name }}</h3>
          <p class="workspace-pet-subtitle">{{ assistantStatus }}</p>
        </div>
        <button type="button" class="workspace-pet-close" @click="closePanel">{{ ui.close }}</button>
      </header>

      <div class="workspace-pet-panel-badges">
        <span class="workspace-pet-panel-badge">{{ assistantStatus }}</span>
        <span class="workspace-pet-panel-badge">{{ lastSource === 'remote' ? ui.remoteMode : lastSource === 'configured' ? ui.configuredMode : ui.notConfiguredMode }}</span>
        <span class="workspace-pet-panel-badge">{{ flowState ? (flowKindLabels[flowState.kind] || flowState.kind) : '空闲待命' }}</span>
      </div>

      <div class="workspace-pet-panel-body">
        <div ref="messagesBody" class="workspace-pet-messages">
          <article
            v-for="message in messages"
            :key="message.id"
            class="workspace-pet-message"
            :class="`workspace-pet-message--${message.role}`"
          >
            <span class="workspace-pet-message-name">
              {{ message.role === 'user' ? ui.you : ui.name }}
            </span>
            <p>{{ message.content }}</p>
          </article>
        </div>

        <div class="workspace-pet-panel-section">
          <p class="workspace-pet-section-title">{{ ui.actionsTitle }}</p>
          <div class="workspace-pet-chips" aria-label="quick assistant prompts">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt"
              type="button"
              class="workspace-pet-chip"
              :disabled="isAsking"
              @click="askPrompt(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </div>

        <div v-if="lastActions.length" class="workspace-pet-panel-section">
          <p class="workspace-pet-section-title">建议动作</p>
          <div class="workspace-pet-suggestions">
            <button
              v-for="action in lastActions"
              :key="`${action.type || 'action'}-${action.title || action.label}`"
              type="button"
              class="workspace-pet-suggestion"
              @click="runProposedAction(action)"
            >
              <span>{{ action.label || ui.goHandle }}</span>
              <strong>{{ action.title || action.payload?.to || ui.goHandle }}</strong>
            </button>
          </div>
        </div>

        <div v-if="flowState" class="workspace-pet-flow">
          <p class="workspace-pet-flow-kicker">{{ ui.flowTitle }} · {{ flowKindLabels[flowState.kind] || flowState.kind }}</p>
          <p class="workspace-pet-flow-question">{{ flowQuestion }}</p>
          <p v-if="flowSummary" class="workspace-pet-flow-summary">{{ flowSummary }}</p>
          <div v-if="flowChoices.length" class="workspace-pet-flow-actions">
            <button
              v-for="choice in flowChoices"
              :key="choice.value"
              type="button"
              class="workspace-pet-flow-chip"
              @click="submitFlowChoice(choice.value)"
            >
              {{ choice.label }}
            </button>
          </div>
        </div>
      </div>

      <form class="workspace-pet-composer" @submit.prevent="submitQuestion">
        <textarea
          v-model="draft"
          class="workspace-pet-input"
          :placeholder="ui.placeholder"
          rows="2"
          @keydown.enter.exact.prevent="submitQuestion"
          @focus="sendState('waiting', 900, ui.listening)"
        ></textarea>
        <div class="workspace-pet-composer-footer">
          <button type="button" class="workspace-pet-ghost" @click="openQuickCapture">{{ ui.capture }}</button>
          <button type="submit" class="workspace-pet-send" :disabled="!canSend">
            {{ isAsking ? ui.asking : ui.send }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { generatePlanOutlineAI } from '@/api/plans.js'
import { chatWithMascotAssistant, listWorkspacePets, runMascotAssistantAction } from '@/api/workspace.js'
import { useWorkspaceAiStore } from '@/stores/workspaceAi.js'
import {
  DEFAULT_PET_SETTINGS,
  DEFAULT_PET_STATE_MAP,
  PET_SETTINGS_UPDATED_EVENT,
  PET_SPRITE_GRID,
  getPetScale,
  normalizePetSettings,
  normalizePetStateMap,
  readCachedPetSettings,
  resolvePetRenderState,
  writeCachedPetSettings
} from '@/utils/petSettings.js'

const props = defineProps({
  state: {
    type: String,
    default: ''
  },
  scale: {
    type: Number,
    default: undefined
  }
})

const router = useRouter()
const workspaceAiStore = useWorkspaceAiStore()
const spriteUrl = `${import.meta.env.BASE_URL}assets/pet/baie/spritesheet.webp`
const CELL_WIDTH = PET_SPRITE_GRID.cellWidth
const CELL_HEIGHT = PET_SPRITE_GRID.cellHeight
const SHEET_WIDTH = CELL_WIDTH * 8
const SHEET_HEIGHT = CELL_HEIGHT * 9
const POSITION_KEY = 'workspacePetPosition'
const petSettings = ref(readCachedPetSettings() || { ...DEFAULT_PET_SETTINGS })
const petCatalog = ref([])
const SHANGHAI_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const ui = {
  name: '\u4e60\u77e5',
  kicker: 'HABITLEARNER AI',
  close: '\u5173\u95ed',
  capture: '\u5feb\u901f\u6536\u96c6',
  send: '\u8be2\u95ee',
  asking: '\u5224\u65ad\u4e2d',
  you: '\u4f60',
  placeholder: '\u95ee\u4e60\u77e5\uff1a\u4eca\u5929\u5148\u505a\u4ec0\u4e48\uff1f',
  welcome: '\u6211\u5728\u3002\u4f60\u53ef\u4ee5\u76f4\u63a5\u95ee\u4eca\u5929\u5148\u505a\u4ec0\u4e48\uff0c\u6216\u8ba9\u6211\u5e2e\u4f60\u628a\u6536\u96c6\u7bb1\u548c\u8ba1\u5212\u7406\u4e00\u904d\u3002',
  actionsTitle: '\u5efa\u8bae\u52a8\u4f5c',
  goHandle: '\u53bb\u5904\u7406',
  flowTitle: '\u6b63\u5728\u5e2e\u4f60\u529e',
  flowConfirm: '\u786e\u8ba4\u521b\u5efa',
  flowCancel: '\u5148\u4e0d\u521b\u5efa',
  here: '\u5728\u3002',
  received: '\u6536\u5230',
  collect: '\u6536\u4e0b',
  listening: '\u6211\u542c\u7740',
  thinking: '\u5224\u65ad\u4e2d',
  answered: '\u53ef\u4ee5',
  error: '\u5148\u7a33\u4f4f',
  configuredMode: '\u5df2\u914d\u7f6e AI',
  notConfiguredMode: '\u672a\u914d\u7f6e AI',
  remoteMode: '\u4e91\u7aef AI',
  learningCard: '\u4eca\u65e5\u5b66\u4e60\u5361',
  track: '\u8f68\u9053',
  capture: '\u6536\u96c6',
  review: '\u590d\u76d8'
}

const quickPrompts = [
  '\u4eca\u5929\u5148\u505a\u4ec0\u4e48',
  '\u5f00\u59cb 30 \u5206\u949f\u4e13\u6ce8',
  '\u5b8c\u6210\u4eca\u5929\u7b2c\u4e00\u4e2a\u4efb\u52a1',
  '\u5e2e\u6211\u5b89\u6392 30 \u5206\u949f',
  '\u6574\u7406\u6536\u96c6\u7bb1',
  '\u751f\u6210\u4eca\u65e5\u590d\u76d8\u8349\u7a3f'
]

const flowKindLabels = {
  habit: '\u521b\u5efa\u4e60\u60ef',
  plan: '\u521b\u5efa\u8ba1\u5212',
  capture: '\u521b\u5efa\u6536\u96c6',
  review: '\u5199\u590d\u76d8',
  track: '\u521b\u5efa\u8f68\u9053',
  learningCard: '\u5237\u65b0\u5b66\u4e60\u5361',
  creatorItem: '\u521b\u5efa\u5185\u5bb9\u6761\u76ee'
}

const flowStepQuestions = {
  habit: {
    name: '\u8fd9\u4e2a\u4e60\u60ef\u53eb\u4ec0\u4e48\uff1f',
    frequency: '\u8fd9\u4e2a\u4e60\u60ef\u662f\u6bcf\u5929\u4e00\u6b21\uff0c\u6bcf\u5929\u591a\u6b21\uff0c\u8fd8\u662f\u6bcf\u5468\u51e0\u6b21\uff1f',
    reminderEnabled: '\u9700\u8981\u63d0\u9192\u5417\uff1f',
    reminderTimes: '\u8981\u54ea\u4e9b\u65f6\u95f4\u63d0\u9192\uff1f\u53ef\u4ee5\u7528\u9017\u53f7\u5206\u5f00\u3001\u4f8b\u5982 08:00, 20:00',
    enableComments: '\u9700\u8981\u5f00\u542f\u6bcf\u65e5\u9996\u6b21\u6253\u5361\u7559\u8a00\u5417\uff1f',
    confirm: '\u4fe1\u606f\u6211\u5df2\u7ecf\u8bb0\u4e0b\u6765\u4e86\uff0c\u73b0\u5728\u8981\u521b\u5efa\u8fd9\u4e2a\u4e60\u60ef\u5417\uff1f'
  },
  plan: {
    title: '\u8fd9\u4e2a\u8ba1\u5212\u53eb\u4ec0\u4e48\uff1f',
    confirm: '\u6211\u53ef\u4ee5\u5148\u5e2e\u4f60\u521b\u5efa\u8fd9\u4e2a\u8ba1\u5212\uff0c\u521b\u5efa\u540e\u518d\u95ee\u4f60\u8981\u4e0d\u8981 AI \u7ed9\u4f60\u7ee7\u7eed\u751f\u6210\u5927\u7eb2\u3002',
    outlineAfterCreate: '\u8ba1\u5212\u5df2\u521b\u5efa\u3002\u8981\u4e0d\u8981\u6211\u7ee7\u7eed\u7ed9\u4f60\u751f\u6210\u4e00\u4e2a\u521d\u59cb\u5927\u7eb2\uff1f'
  },
  capture: {
    type: '\u8fd9\u6761\u6536\u96c6\u8981\u7b97\u4ec0\u4e48\u7c7b\u578b\uff1f',
    content: '\u4f60\u60f3\u5148\u8bb0\u4e0b\u4ec0\u4e48\uff1f',
    confirm: '\u6211\u53ef\u4ee5\u628a\u5b83\u653e\u8fdb\u6536\u96c6\u7bb1\uff0c\u8981\u73b0\u5728\u521b\u5efa\u5417\uff1f'
  },
  review: {
    type: '\u8fd9\u6b21\u590d\u76d8\u7528\u4ec0\u4e48\u8303\u56f4\uff1f',
    completed: '\u4eca\u5929\u5b8c\u6210\u4e86\u4ec0\u4e48\uff1f',
    blocked: '\u4eca\u5929\u5361\u4f4f\u4e86\u4ec0\u4e48\uff1f',
    nextStep: '\u660e\u5929\u7b2c\u4e00\u6b65\u662f\u4ec0\u4e48\uff1f',
    mood: '\u4eca\u5929\u72b6\u6001\u5982\u4f55\uff1f',
    confirm: '\u5185\u5bb9\u6211\u8bb0\u597d\u4e86\uff0c\u73b0\u5728\u4fdd\u5b58\u590d\u76d8\u5417\uff1f'
  },
  track: {
    name: '\u8fd9\u6761\u8f68\u9053\u53eb\u4ec0\u4e48\uff1f',
    type: '\u8fd9\u6761\u8f68\u9053\u8981\u7528\u54ea\u79cd\u7c7b\u578b\uff1f',
    confirm: '\u6211\u53ef\u4ee5\u73b0\u5728\u521b\u5efa\u8fd9\u6761\u8f68\u9053\uff0c\u8981\u7ee7\u7eed\u5417\uff1f'
  },
  learningCard: {
    confirm: '\u8981\u6211\u73b0\u5728\u5237\u65b0\u4eca\u65e5\u5b66\u4e60\u5361\u5417\uff1f',
    done: '\u4eca\u65e5\u5b66\u4e60\u5361\u5df2\u7ecf\u7ed9\u4f60\u91cd\u65b0\u751f\u6210\u4e86\u3002'
  },
  creatorItem: {
    type: '\u8fd9\u6761\u5185\u5bb9\u662f\u70ed\u70b9\u3001\u9009\u9898\uff0c\u8fd8\u662f\u8349\u7a3f\uff1f',
    title: '\u5185\u5bb9\u6807\u9898\u662f\u4ec0\u4e48\uff1f',
    platform: '\u76ee\u6807\u5e73\u53f0\u662f\u4ec0\u4e48\uff1f\u4e0d\u786e\u5b9a\u53ef\u4ee5\u56de\u590d\u201c\u8df3\u8fc7\u201d\u3002',
    confirm: '\u6211\u53ef\u4ee5\u73b0\u5728\u521b\u5efa\u8fd9\u6761\u5185\u5bb9\uff0c\u8981\u7ee7\u7eed\u5417\uff1f'
  }
}

const flowChoicePresets = {
  habit: {
    frequency: [
      { label: '\u6bcf\u5929 1 \u6b21', value: 'daily:1' },
      { label: '\u6bcf\u5929 2 \u6b21', value: 'daily:2' },
      { label: '\u6bcf\u5929 3 \u6b21', value: 'daily:3' },
      { label: '\u6bcf\u5468 3 \u6b21', value: 'weekly:3' },
      { label: '\u6bcf\u5468 5 \u6b21', value: 'weekly:5' }
    ],
    reminderEnabled: [
      { label: '\u9700\u8981', value: 'yes' },
      { label: '\u6682\u4e0d\u9700\u8981', value: 'no' }
    ],
    enableComments: [
      { label: '\u5f00\u542f', value: 'yes' },
      { label: '\u4e0d\u5f00\u542f', value: 'no' }
    ],
    confirm: [
      { label: '\u786e\u8ba4\u521b\u5efa', value: 'create' },
      { label: '\u5148\u4e0d\u521b\u5efa', value: 'cancel' }
    ]
  },
  plan: {
    confirm: [
      { label: '\u5148\u521b\u5efa', value: 'create' },
      { label: '\u518d\u60f3\u60f3', value: 'cancel' }
    ],
    outlineAfterCreate: [
      { label: '\u8981\uff0c\u751f\u6210\u5927\u7eb2', value: 'outline' },
      { label: '\u5148\u4e0d\u7528', value: 'skip' }
    ]
  },
  capture: {
    type: [
      { label: '\u60f3\u6cd5', value: 'idea' },
      { label: '\u4efb\u52a1', value: 'task' },
      { label: '\u5b66\u4e60', value: 'learning' },
      { label: '\u8ba1\u5212', value: 'plan' },
      { label: '\u4e60\u60ef', value: 'habit' }
    ],
    confirm: [
      { label: '\u521b\u5efa\u6536\u96c6', value: 'create' },
      { label: '\u5148\u4e0d\u521b\u5efa', value: 'cancel' }
    ]
  },
  review: {
    type: [
      { label: '\u4eca\u65e5', value: 'daily' },
      { label: '\u5468\u590d\u76d8', value: 'weekly' }
    ],
    confirm: [
      { label: '\u4fdd\u5b58\u590d\u76d8', value: 'create' },
      { label: '\u5148\u4e0d\u4fdd\u5b58', value: 'cancel' }
    ]
  },
  track: {
    type: [
      { label: '\u4e60\u60ef', value: 'habit' },
      { label: '\u5b66\u4e60', value: 'learning' },
      { label: '\u4e13\u6ce8', value: 'focus' },
      { label: '\u8ba1\u5212', value: 'project' },
      { label: '\u81ea\u5b9a\u4e49', value: 'custom' }
    ],
    confirm: [
      { label: '\u521b\u5efa\u8f68\u9053', value: 'create' },
      { label: '\u5148\u4e0d\u521b\u5efa', value: 'cancel' }
    ]
  },
  learningCard: {
    confirm: [
      { label: '\u5237\u65b0\u5b66\u4e60\u5361', value: 'refresh' },
      { label: '\u5148\u4e0d\u5237\u65b0', value: 'cancel' }
    ]
  },
  creatorItem: {
    type: [
      { label: '\u9009\u9898', value: 'topic' },
      { label: '\u70ed\u70b9', value: 'trend' },
      { label: '\u8349\u7a3f', value: 'draft' }
    ],
    confirm: [
      { label: '\u521b\u5efa\u5185\u5bb9', value: 'create' },
      { label: '\u5148\u4e0d\u521b\u5efa', value: 'cancel' }
    ]
  }
}

const animationMap = {
  idle: { row: 0, frames: 6, duration: 6400 },
  working: { row: 1, frames: 8, duration: 1250 },
  thinking: { row: 2, frames: 8, duration: 1250 },
  done: { row: 4, frames: 5, duration: 900 },
  sleeping: { row: 5, frames: 6, duration: 4200 },
  'running-right': { row: 1, frames: 8, duration: 1250 },
  'running-left': { row: 2, frames: 8, duration: 1250 },
  waving: { row: 3, frames: 4, duration: 1050 },
  jumping: { row: 4, frames: 5, duration: 900 },
  failed: { row: 5, frames: 8, duration: 1750 },
  waiting: { row: 6, frames: 6, duration: 5400 },
  running: { row: 7, frames: 6, duration: 1450 },
  review: { row: 8, frames: 6, duration: 4200 }
}

const getCurrentPetScale = () => Number((props.scale ?? getPetScale(petSettings.value.size)) || 0.88)

const builtInPet = computed(() => ({
  id: 'builtin-baie',
  name: '默认像素宠物',
  sourceType: 'builtin',
  spritesheetUrl: spriteUrl,
  previewUrl: spriteUrl,
  stateMap: DEFAULT_PET_STATE_MAP,
  config: {}
}))

const activePet = computed(() => {
  const activeId = petSettings.value.activePetId
  if (!activeId) return builtInPet.value
  return petCatalog.value.find((pet) => Number(pet.id) === Number(activeId)) || builtInPet.value
})

const activeStateMap = computed(() => normalizePetStateMap(activePet.value?.stateMap || DEFAULT_PET_STATE_MAP))

const clampPosition = (x, y) => {
  if (typeof window === 'undefined') return { x, y }
  const scale = getCurrentPetScale()
  const width = Math.max(120, Math.round(CELL_WIDTH * scale))
  const height = Math.max(140, Math.round(CELL_HEIGHT * scale))
  const maxX = Math.max(12, window.innerWidth - width - 12)
  const maxY = Math.max(12, window.innerHeight - height - 12)

  return {
    x: Math.min(Math.max(12, Math.round(x)), maxX),
    y: Math.min(Math.max(12, Math.round(y)), maxY)
  }
}

const readInitialPosition = () => {
  if (typeof window === 'undefined') return { x: 280, y: 620 }

  const saved = window.localStorage.getItem(POSITION_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        return clampPosition(parsed.x, parsed.y)
      }
    } catch (error) {
      console.warn('Failed to read workspace pet position', error)
    }
  }

  return clampPosition(280, window.innerHeight - 250)
}

const isPanelOpen = ref(false)
const isVisualReady = ref(false)
const speechText = ref('')
const activeTransientState = ref('')
const frameIndex = ref(0)
const isDragging = ref(false)
const dragMoved = ref(false)
const position = ref(readInitialPosition())
const messagesBody = ref(null)
const draft = ref('')
const isAsking = ref(false)
const lastActions = ref([])
const lastSource = ref('')
const messages = ref([
  {
    id: 'welcome',
    role: 'assistant',
    content: ui.welcome
  }
])
const flowState = ref(null)
const lastCreatedHabit = ref(null)
const lastCreatedPlan = ref(null)
const pendingOutline = ref(null)
const pointerState = ref({
  pointerId: null,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0
})

let frameTimer = 0
let frameStartedAt = 0
let stateTimer = 0
let clearSpeechTimer = 0

const activeState = computed(() => {
  if (animationMap[activeTransientState.value]) return activeTransientState.value
  if (props.state && animationMap[props.state]) return props.state
  return 'idle'
})

const renderState = computed(() => resolvePetRenderState(activeState.value))
const activeMeta = computed(() => activeStateMap.value[renderState.value] || activeStateMap.value.idle || DEFAULT_PET_STATE_MAP.idle)
const displayScale = computed(() => getCurrentPetScale())

const rootStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

const shouldOpenPanelLeft = computed(() => (
  typeof window !== 'undefined' && position.value.x > window.innerWidth - 520
))

const spriteStyle = computed(() => {
  const scale = displayScale.value || 1
  const meta = activeMeta.value
  const imageUrl = activePet.value?.spritesheetUrl || spriteUrl

  return {
    width: `${Math.round(CELL_WIDTH * scale)}px`,
    height: `${Math.round(CELL_HEIGHT * scale)}px`,
    backgroundImage: `url("${imageUrl}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${Math.round(SHEET_WIDTH * scale)}px ${Math.round(SHEET_HEIGHT * scale)}px`,
    backgroundPosition: `${Math.round(-frameIndex.value * CELL_WIDTH * scale)}px ${Math.round(-meta.row * CELL_HEIGHT * scale)}px`
  }
})

const statusLabel = computed(() => {
  const map = {
    idle: '\u9759\u5f85',
    working: '\u5de5\u4f5c\u4e2d',
    thinking: '\u601d\u8003',
    done: '\u5b8c\u6210',
    sleeping: '\u4f11\u606f',
    'running-right': '\u5411\u524d',
    'running-left': '\u56de\u671b',
    waving: '\u56de\u5e94',
    jumping: '\u9f13\u52b1',
    failed: '\u63d0\u9192',
    waiting: '\u7b49\u4f60',
    running: '\u5de5\u4f5c\u4e2d',
    review: '\u590d\u76d8'
  }
  return map[activeState.value] || map.idle
})

const statusHint = computed(() => {
  const map = {
    idle: '\u5b89\u9759\u5b88\u5728\u9875\u9762\u8fb9\u4e0a',
    working: '\u6b63\u5728\u5904\u7406\u4f60\u7684\u8bf7\u6c42',
    thinking: '\u6b63\u5728\u5224\u65ad\u4e0b\u4e00\u6b65',
    done: '\u64cd\u4f5c\u5df2\u6536\u53e3',
    sleeping: '\u6682\u65f6\u4f11\u606f',
    'running-right': '\u6b63\u5728\u63a8\u8fdb\u4e0b\u4e00\u6b65',
    'running-left': '\u6b63\u5728\u56de\u770b\u8fdb\u5ea6',
    waving: '\u6536\u5230\u4f60\u7684\u64cd\u4f5c',
    jumping: '\u5b8c\u6210\u65f6\u7ed9\u4e00\u70b9\u53cd\u9988',
    failed: '\u9047\u5230\u95ee\u9898\u4f1a\u63d0\u9192',
    waiting: '\u7b49\u4f60\u8865\u5145\u8981\u6c42',
    running: '\u6b63\u5728\u8bfb\u53d6\u5de5\u4f5c\u53f0\u4e0a\u4e0b\u6587',
    review: '\u9002\u5408\u6536\u5c3e\u548c\u590d\u76d8'
  }
  return map[activeState.value] || map.idle
})

const petTitle = computed(() => `${ui.name} / ${statusLabel.value}`)

const assistantStatus = computed(() => {
  const source = lastSource.value === 'remote'
    ? ui.remoteMode
    : lastSource.value === 'configured'
      ? ui.configuredMode
      : ui.notConfiguredMode
  return `${statusLabel.value} / ${source} / ${statusHint.value}`
})

const canSend = computed(() => Boolean(draft.value.trim()) && !isAsking.value)

const flowSummary = computed(() => {
  if (!flowState.value) return ''
  const data = flowState.value.data || {}
  if (flowState.value.kind === 'habit') {
    const targetText = data.frequency && data.target ? `${data.frequency === 'daily' ? '每天' : '每周'} ${data.target} 次` : ''
    return [
      data.name ? `名称：${data.name}` : '',
      targetText ? `频率：${targetText}` : '',
      typeof data.reminderEnabled === 'boolean' ? `提醒：${data.reminderEnabled ? '开启' : '关闭'}` : '',
      typeof data.enableComments === 'boolean' ? `首日留言：${data.enableComments ? '开启' : '关闭'}` : '',
      Array.isArray(data.reminderTimes) && data.reminderTimes.length ? `提醒时间：${data.reminderTimes.join('、')}` : ''
    ].filter(Boolean).join(' · ')
  }

  if (flowState.value.kind === 'plan') {
    return data.title ? `标题：${data.title}` : ''
  }

  if (flowState.value.kind === 'capture') {
    return [
      data.type ? `类型：${getCaptureTypeLabel(data.type)}` : '',
      data.content ? `内容：${data.content.slice(0, 42)}${data.content.length > 42 ? '...' : ''}` : ''
    ].filter(Boolean).join(' · ')
  }

  if (flowState.value.kind === 'review') {
    return [
      data.type ? `范围：${getReviewTypeLabel(data.type)}` : '',
      data.completed ? `完成：${data.completed.slice(0, 18)}` : '',
      data.blocked ? `卡点：${data.blocked.slice(0, 18)}` : '',
      data.nextStep ? `下一步：${data.nextStep.slice(0, 18)}` : ''
    ].filter(Boolean).join(' · ')
  }

  if (flowState.value.kind === 'track') {
    return [
      data.name ? `名称：${data.name}` : '',
      data.type ? `类型：${getTrackTypeLabel(data.type)}` : ''
    ].filter(Boolean).join(' · ')
  }

  if (flowState.value.kind === 'learningCard') {
    return '刷新后会替换今日学习卡内容。'
  }

  if (flowState.value.kind === 'creatorItem') {
    return [
      data.type ? `类型：${getCreatorTypeLabel(data.type)}` : '',
      data.title ? `标题：${data.title.slice(0, 32)}` : '',
      data.platform ? `平台：${data.platform}` : ''
    ].filter(Boolean).join(' · ')
  }

  return ''
})

const flowQuestion = computed(() => {
  if (!flowState.value) return ''
  const kind = flowState.value.kind
  const step = flowState.value.step
  if (kind === 'habit') return flowStepQuestions.habit[step] || ''
  if (kind === 'plan') return flowStepQuestions.plan[step] || ''
  if (kind === 'capture') return flowStepQuestions.capture[step] || ''
  if (kind === 'review') return flowStepQuestions.review[step] || ''
  if (kind === 'track') return flowStepQuestions.track[step] || ''
  if (kind === 'learningCard') return flowStepQuestions.learningCard[step] || ''
  if (kind === 'creatorItem') return flowStepQuestions.creatorItem[step] || ''
  return ''
})

const flowChoices = computed(() => {
  if (!flowState.value) return []
  const kind = flowState.value.kind
  const step = flowState.value.step
  if (kind === 'habit') {
    if (step === 'frequency') return flowChoicePresets.habit.frequency
    if (step === 'reminderEnabled') return flowChoicePresets.habit.reminderEnabled
    if (step === 'enableComments') return flowChoicePresets.habit.enableComments
    if (step === 'confirm') return flowChoicePresets.habit.confirm
  }
  if (kind === 'plan') {
    if (step === 'confirm') return flowChoicePresets.plan.confirm
    if (step === 'outlineAfterCreate') return flowChoicePresets.plan.outlineAfterCreate
  }
  if (kind === 'capture') {
    if (step === 'type') return flowChoicePresets.capture.type
    if (step === 'confirm') return flowChoicePresets.capture.confirm
  }
  if (kind === 'review') {
    if (step === 'type') return flowChoicePresets.review.type
    if (step === 'confirm') return flowChoicePresets.review.confirm
  }
  if (kind === 'track') {
    if (step === 'type') return flowChoicePresets.track.type
    if (step === 'confirm') return flowChoicePresets.track.confirm
  }
  if (kind === 'learningCard') {
    if (step === 'confirm') return flowChoicePresets.learningCard.confirm
  }
  if (kind === 'creatorItem') {
    if (step === 'type') return flowChoicePresets.creatorItem.type
    if (step === 'confirm') return flowChoicePresets.creatorItem.confirm
  }
  return []
})

const parseYesNo = (value) => {
  const text = String(value || '').trim()
  if (!text) return null
  if (/^(y|yes|true|1|是|要|需要|开启|开|好|对|确认|可以|行|嗯)$/i.test(text)) return true
  if (/^(n|no|false|0|否|不要|不需要|关闭|关|不用|取消|算了)$/i.test(text)) return false
  return null
}

const parseFrequencyTarget = (value) => {
  const text = String(value || '').trim()
  const digits = text.match(/(\d{1,3})/)
  const target = digits ? Math.max(1, Math.min(100, Number(digits[1]))) : null
  if (/每周|weekly|周/i.test(text)) {
    return {
      frequency: 'weekly',
      target: target || 1
    }
  }
  if (/每天|每日|daily|日/i.test(text) || target !== null) {
    return {
      frequency: 'daily',
      target: target || (/一次|1次|一/.test(text) ? 1 : 2)
    }
  }
  return null
}

const parseReminderTimes = (value) => {
  return String(value || '')
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter((item) => /^\d{1,2}:\d{2}$/.test(item))
    .map((item) => {
      const [hours, minutes] = item.split(':').map((part) => Number(part))
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
      return `${String(Math.max(0, Math.min(23, hours))).padStart(2, '0')}:${String(Math.max(0, Math.min(59, minutes))).padStart(2, '0')}`
    })
    .filter(Boolean)
}

const getCaptureTypeLabel = (value) => ({
  idea: '想法',
  task: '任务',
  learning: '学习',
  plan: '计划',
  habit: '习惯'
}[value] || '想法')

const getReviewTypeLabel = (value) => (value === 'weekly' ? '周复盘' : '今日复盘')

const getTrackTypeLabel = (value) => ({
  habit: '习惯',
  learning: '学习',
  focus: '专注',
  project: '计划',
  custom: '自定义'
}[value] || '自定义')

const getCreatorTypeLabel = (value) => ({
  trend: '热点',
  topic: '选题',
  draft: '草稿'
}[value] || '选题')

const extractGoalText = (text, keyword) => {
  const source = String(text || '').trim()
  if (!source) return ''
  const cleaned = source
    .replace(/^(帮我|请帮我|给我|麻烦|可以帮我|帮我来|想要我)?/g, '')
    .replace(/^(新建|创建|添加|做一个|建一个|安排一个|弄一个)/g, '')
    .replace(/^(一个|一份|一套|个)/g, '')
    .trim()
  if (keyword === 'habit') {
    return cleaned.replace(/\s*习惯.*$/g, '').replace(/^(一个|个)/g, '').trim()
  }
  if (keyword === 'plan') {
    return cleaned.replace(/\s*计划.*$/g, '').replace(/^(一个|一份|一套)/g, '').trim()
  }
  return cleaned
}

const startAssistantMessage = (content) => {
  messages.value.push({
    id: createMessageId(),
    role: 'assistant',
    content
  })
  return scrollMessagesToBottom()
}

const resetFlow = () => {
  flowState.value = null
}

const startHabitFlow = async (text) => {
  const candidate = extractGoalText(text, 'habit')
  flowState.value = {
    kind: 'habit',
    step: candidate ? 'frequency' : 'name',
    data: {
      name: candidate && !/习惯$/.test(candidate) ? candidate : ''
    }
  }
  if (flowState.value.data.name) {
    await startAssistantMessage(`我先记为：${flowState.value.data.name}。${flowQuestion.value}`)
    return
  }
  await startAssistantMessage(flowQuestion.value)
}

const startPlanFlow = async (text) => {
  const candidate = extractGoalText(text, 'plan')
  flowState.value = {
    kind: 'plan',
    step: 'title',
    data: {
      title: candidate && !/计划$/.test(candidate) ? candidate : ''
    }
  }

  if (flowState.value.data.title) {
    await startAssistantMessage(`${flowStepQuestions.plan.title}\n\n我先记为：${flowState.value.data.title}。`)
    flowState.value.step = 'confirm'
    await startAssistantMessage(flowQuestion.value)
    return
  }

  await startAssistantMessage(flowQuestion.value)
}

const startCaptureFlow = async (text) => {
  const candidate = String(text || '').trim()
  flowState.value = {
    kind: 'capture',
    step: 'type',
    data: {
      type: /学习/.test(candidate) ? 'learning' : /任务/.test(candidate) ? 'task' : /习惯/.test(candidate) ? 'habit' : 'idea',
      content: candidate
    }
  }
  if (candidate) {
    await startAssistantMessage('我先帮你把它放进收集箱。先告诉我这条收集更像什么类型？')
    return
  }
  await startAssistantMessage(flowQuestion.value)
}

const startReviewFlow = async (text) => {
  const lower = String(text || '').toLowerCase()
  flowState.value = {
    kind: 'review',
    step: 'type',
    data: {
      type: /周|weekly/.test(lower) ? 'weekly' : 'daily',
      completed: '',
      blocked: '',
      nextStep: '',
      mood: ''
    }
  }
  await startAssistantMessage(flowState.value.data.type === 'weekly'
    ? '我先按周复盘处理。你也可以直接点“周复盘”确认。'
    : '我先按今日复盘处理。你也可以直接点“今日”确认。')
  await startAssistantMessage(flowQuestion.value)
}

const startTrackFlow = async (text) => {
  const candidate = String(text || '').trim()
  flowState.value = {
    kind: 'track',
    step: candidate ? 'type' : 'name',
    data: {
      name: candidate && !/轨道$/.test(candidate) ? candidate : '',
      type: 'custom',
      color: '#18181b'
    }
  }
  if (flowState.value.data.name) {
    await startAssistantMessage(`我先记为：${flowState.value.data.name}。${flowQuestion.value}`)
    return
  }
  await startAssistantMessage(flowQuestion.value)
}

const startLearningCardFlow = async () => {
  flowState.value = {
    kind: 'learningCard',
    step: 'confirm',
    data: {}
  }
  await startAssistantMessage(flowQuestion.value)
}

const startCreatorItemFlow = async (text) => {
  const candidate = String(text || '')
    .replace(/^(新建|创建|添加|给我|帮我)/, '')
    .replace(/(内容条目|内容|选题|热点|草稿|视频脚本|小红书|公众号)/g, '')
    .trim()
  const type = /热点/.test(text) ? 'trend' : /草稿|脚本/.test(text) ? 'draft' : 'topic'
  flowState.value = {
    kind: 'creatorItem',
    step: candidate ? 'platform' : 'type',
    data: {
      type,
      title: candidate.slice(0, 120),
      platform: ''
    }
  }
  if (candidate) {
    await startAssistantMessage(`我先记为：${candidate}。${flowStepQuestions.creatorItem.platform}`)
    return
  }
  await startAssistantMessage(flowQuestion.value)
}

const askNextFlowQuestion = async () => {
  if (!flowState.value) return
  await startAssistantMessage(flowQuestion.value)
}

const completeHabitFlow = async () => {
  if (!flowState.value || flowState.value.kind !== 'habit') return
  isAsking.value = true
  sendState('working', 1600, ui.thinking)

  try {
    const data = flowState.value.data
    const payload = {
      name: data.name,
      description: '',
      icon: 'pin',
      color: '#111827',
      category: '其他',
      frequency: data.frequency || 'daily',
      target: Number(data.target || 1),
      enableComments: Boolean(data.enableComments),
      reminderEnabled: Boolean(data.reminderEnabled),
      reminderTimes: data.reminderEnabled ? (data.reminderTimes || []) : [],
      reminderTime: data.reminderEnabled && data.reminderTimes?.length ? data.reminderTimes[0] : null
    }
    const result = await runPetBackendAction('create_habit', payload)
    const entity = result.entity || {}

    lastCreatedHabit.value = entity
    resetFlow()
    await startAssistantMessage(`${result.message || `已创建习惯「${entity.name || data.name}」。`} 我没有替你打卡，只是把结构建好了。`)
    lastActions.value = normalizeBackendSuggestions(result.suggestions)
    sendState(result.actionState || 'done', 1200, ui.answered)
  } catch (error) {
    console.warn('Workspace pet create habit failed', error)
    await startAssistantMessage(`创建失败：${error.message || '接口暂时不可用'}。我先保留这组信息，你可以稍后再确认一次。`)
    sendState('failed', 1500, ui.error)
  } finally {
    isAsking.value = false
    await scrollMessagesToBottom()
  }
}

const completePlanFlow = async () => {
  if (!flowState.value || flowState.value.kind !== 'plan') return
  isAsking.value = true
  sendState('working', 1600, ui.thinking)

  try {
    const data = flowState.value.data
    const result = await runPetBackendAction('create_plan', {
      title: data.title,
      status: 'not_started',
      priority: 'medium',
      type: 'project'
    })
    const entity = result.entity || {}

    lastCreatedPlan.value = entity
    pendingOutline.value = {
      planId: entity.id,
      title: entity.title || data.title,
      prompt: data.title
    }
    flowState.value = {
      kind: 'plan',
      step: 'outlineAfterCreate',
      data: {
        title: entity.title || data.title,
        planId: entity.id
      }
    }
    await startAssistantMessage(`${result.message || `计划「${entity.title || data.title}」已经创建。`} 要我继续生成一个初始大纲吗？`)
    lastActions.value = normalizeBackendSuggestions(result.suggestions)
    sendState(result.actionState || 'done', 1200, ui.answered)
  } catch (error) {
    console.warn('Workspace pet create plan failed', error)
    await startAssistantMessage(`创建失败：${error.message || '接口暂时不可用'}。我先不乱写，等接口恢复再继续。`)
    sendState('failed', 1500, ui.error)
  } finally {
    isAsking.value = false
    await scrollMessagesToBottom()
  }
}

const generateOutlineForCreatedPlan = async () => {
  const plan = pendingOutline.value
  if (!plan?.planId) return
  isAsking.value = true
  sendState('thinking', 1800, ui.thinking)

  try {
    const response = await generatePlanOutlineAI({
      providerId: workspaceAiStore.normalizedSelectedProviderId,
      title: plan.title,
      prompt: `请为「${plan.title}」生成一份可执行的一周计划大纲，包含目标、每日安排、准备事项和复盘问题。`,
      status: 'not_started',
      priority: 'medium',
      planType: 'project'
    })

    const blocks = Array.isArray(response?.data?.blocks) ? response.data.blocks : []
    const summary = response?.data?.summary || ''
    resetFlow()
    pendingOutline.value = null

    if (!response?.success || (!summary && !blocks.length)) {
      throw new Error(response?.error || response?.message || 'outline empty')
    }

    const lines = blocks.slice(0, 5).map((block, index) => `${index + 1}. ${block.title || block.text || block.summary || '行动项'}`)
    await startAssistantMessage(`大纲草稿已生成。先给你看核心骨架，是否写入计划正文下一步我再做确认：\n${summary ? `${summary}\n` : ''}${lines.join('\n')}`)
    lastActions.value = [
      {
        type: 'open_plan',
        label: '打开计划',
        title: plan.title,
        payload: { to: `/plan/${plan.planId}` }
      }
    ]
    sendState('review', 1400, ui.answered)
  } catch (error) {
    console.warn('Workspace pet plan outline failed', error)
    resetFlow()
    await startAssistantMessage(`大纲生成暂时失败：${error.message || 'AI 服务不稳定'}。计划已经创建，你可以先打开计划继续编辑。`)
    lastActions.value = [
      {
        type: 'open_plan',
        label: '打开计划',
        title: plan.title,
        payload: { to: `/plan/${plan.planId}` }
      }
    ]
    sendState('failed', 1500, ui.error)
  } finally {
    isAsking.value = false
    await scrollMessagesToBottom()
  }
}

const handleCaptureFlowInput = async (value) => {
  const data = flowState.value.data
  const step = flowState.value.step
  const text = String(value || '').trim()

  if (step === 'type') {
    if (['idea', 'task', 'learning', 'plan', 'habit'].includes(text)) {
      data.type = text
      flowState.value.step = data.content ? 'confirm' : 'content'
      return askNextFlowQuestion()
    }
    const labelMatch = {
      想法: 'idea',
      任务: 'task',
      学习: 'learning',
      计划: 'plan',
      习惯: 'habit'
    }[text]
    if (labelMatch) {
      data.type = labelMatch
      flowState.value.step = data.content ? 'confirm' : 'content'
      return askNextFlowQuestion()
    }
    return startAssistantMessage('你也可以直接点按钮，或者回复“想法 / 任务 / 学习 / 计划 / 习惯”。')
  }

  if (step === 'content') {
    if (!text) return startAssistantMessage('收集内容不能为空，随便写一句也行。')
    data.content = text.slice(0, 1200)
    flowState.value.step = 'confirm'
    return askNextFlowQuestion()
  }

  if (step === 'confirm') {
    if (text === 'create' || parseYesNo(text) === true) {
      isAsking.value = true
      sendState('working', 1400, ui.thinking)
      try {
        const result = await runPetBackendAction('create_capture', {
          type: data.type || 'idea',
          content: data.content
        })
        const entity = result.entity || {}
        resetFlow()
        await startAssistantMessage(result.message || `已加入收集箱：${entity.content || data.content}`)
        lastActions.value = normalizeBackendSuggestions(result.suggestions)
        sendState(result.actionState || 'done', 1200, ui.answered)
      } catch (error) {
        console.warn('Workspace pet create capture failed', error)
        await startAssistantMessage(`收集失败：${error.message || '接口暂时不可用'}。我先不继续写入。`)
        sendState('failed', 1400, ui.error)
      } finally {
        isAsking.value = false
      }
      return
    }
    if (text === 'cancel' || parseYesNo(text) === false) {
      resetFlow()
      return startAssistantMessage('好，先不放进收集箱。')
    }
    return startAssistantMessage('确认创建就回复“确认”，不创建就回复“不用”。')
  }
}

const handleReviewFlowInput = async (value) => {
  const data = flowState.value.data
  const step = flowState.value.step
  const text = String(value || '').trim()

  if (step === 'type') {
    if (['daily', 'weekly'].includes(text)) {
      data.type = text
      flowState.value.step = 'completed'
      return askNextFlowQuestion()
    }
    const labelMatch = {
      今日: 'daily',
      日: 'daily',
      周: 'weekly',
      周复盘: 'weekly'
    }[text]
    if (labelMatch) {
      data.type = labelMatch
      flowState.value.step = 'completed'
      return askNextFlowQuestion()
    }
    return startAssistantMessage('你也可以直接点“今日 / 周复盘”。')
  }

  if (step === 'completed') {
    data.completed = text.slice(0, 2000)
    flowState.value.step = 'blocked'
    return askNextFlowQuestion()
  }

  if (step === 'blocked') {
    data.blocked = text.slice(0, 2000)
    flowState.value.step = 'nextStep'
    return askNextFlowQuestion()
  }

  if (step === 'nextStep') {
    data.nextStep = text.slice(0, 2000)
    flowState.value.step = 'mood'
    return askNextFlowQuestion()
  }

  if (step === 'mood') {
    data.mood = text.slice(0, 120)
    flowState.value.step = 'confirm'
    return askNextFlowQuestion()
  }

  if (step === 'confirm') {
    if (text === 'create' || parseYesNo(text) === true) {
      isAsking.value = true
      sendState('working', 1400, ui.thinking)
      try {
        const result = await runPetBackendAction('save_review', {
          reviewDate: SHANGHAI_DATE_FORMATTER.format(new Date()),
          type: data.type || 'daily',
          completed: data.completed,
          blocked: data.blocked,
          nextStep: data.nextStep,
          mood: data.mood,
          summary_snapshot: {}
        })
        resetFlow()
        await startAssistantMessage(result.message || '复盘已保存。你可以去复盘页继续补充，或者把今天收口到明天第一步。')
        lastActions.value = normalizeBackendSuggestions(result.suggestions)
        sendState(result.actionState || 'review', 1200, ui.answered)
      } catch (error) {
        console.warn('Workspace pet save review failed', error)
        await startAssistantMessage(`复盘保存失败：${error.message || '接口暂时不可用'}。`)
        sendState('failed', 1400, ui.error)
      } finally {
        isAsking.value = false
      }
      return
    }
    if (text === 'cancel' || parseYesNo(text) === false) {
      resetFlow()
      return startAssistantMessage('好，先不保存复盘。')
    }
    return startAssistantMessage('确认保存就回复“确认”，不保存就回复“不用”。')
  }
}

const handleTrackFlowInput = async (value) => {
  const data = flowState.value.data
  const step = flowState.value.step
  const text = String(value || '').trim()

  if (step === 'name') {
    if (!text) return startAssistantMessage('轨道名称不能为空。')
    data.name = text.slice(0, 100)
    flowState.value.step = 'type'
    return askNextFlowQuestion()
  }

  if (step === 'type') {
    if (['habit', 'learning', 'focus', 'project', 'custom'].includes(text)) {
      data.type = text
      flowState.value.step = 'confirm'
      return askNextFlowQuestion()
    }
    const labelMatch = {
      习惯: 'habit',
      学习: 'learning',
      专注: 'focus',
      计划: 'project',
      自定义: 'custom'
    }[text]
    if (labelMatch) {
      data.type = labelMatch
      flowState.value.step = 'confirm'
      return askNextFlowQuestion()
    }
    return startAssistantMessage('你也可以直接点“习惯 / 学习 / 专注 / 计划 / 自定义”。')
  }

  if (step === 'confirm') {
    if (text === 'create' || parseYesNo(text) === true) {
      isAsking.value = true
      sendState('working', 1400, ui.thinking)
      try {
        const result = await runPetBackendAction('create_track', {
          name: data.name,
          type: data.type || 'custom',
          color: data.color || '#18181b',
          source_type: 'custom',
          config: {}
        })
        const entity = result.entity || {}
        resetFlow()
        await startAssistantMessage(result.message || `轨道「${entity.name || data.name}」已创建。你可以去轨道页继续补充。`)
        lastActions.value = normalizeBackendSuggestions(result.suggestions)
        sendState(result.actionState || 'done', 1200, ui.answered)
      } catch (error) {
        console.warn('Workspace pet create track failed', error)
        await startAssistantMessage(`轨道创建失败：${error.message || '接口暂时不可用'}。`)
        sendState('failed', 1400, ui.error)
      } finally {
        isAsking.value = false
      }
      return
    }
    if (text === 'cancel' || parseYesNo(text) === false) {
      resetFlow()
      return startAssistantMessage('好，先不创建轨道。')
    }
    return startAssistantMessage('确认创建就回复“确认”，不创建就回复“不用”。')
  }
}

const handleLearningCardFlowInput = async (value) => {
  const text = String(value || '').trim()
  if (!text) return startAssistantMessage('如果要刷新学习卡，就回复“要”或者点按钮。')
  if (text === 'refresh' || parseYesNo(text) === true) {
    isAsking.value = true
    sendState('working', 1200, ui.thinking)
    try {
      const result = await runPetBackendAction('refresh_learning_card')
      resetFlow()
      await startAssistantMessage(result.message || '今日学习卡已经刷新好了。要我顺手带你去学习页吗？')
      lastActions.value = normalizeBackendSuggestions(result.suggestions)
      sendState(result.actionState || 'review', 1200, ui.answered)
    } catch (error) {
      console.warn('Workspace pet refresh learning card failed', error)
      await startAssistantMessage(`学习卡刷新失败：${error.message || '接口暂时不可用'}。`)
      sendState('failed', 1400, ui.error)
    } finally {
      isAsking.value = false
    }
    return
  }
  if (text === 'cancel' || parseYesNo(text) === false) {
    resetFlow()
    return startAssistantMessage('好，那先不刷新。')
  }
  return startAssistantMessage('确认刷新就回复“要”，不刷新就回复“不用”。')
}

const handleCreatorItemFlowInput = async (value) => {
  const data = flowState.value.data
  const step = flowState.value.step
  const text = String(value || '').trim()

  if (step === 'type') {
    const labelMatch = {
      热点: 'trend',
      选题: 'topic',
      草稿: 'draft'
    }[text]
    if (['trend', 'topic', 'draft'].includes(text) || labelMatch) {
      data.type = labelMatch || text
      flowState.value.step = 'title'
      return askNextFlowQuestion()
    }
    return startAssistantMessage('你也可以直接点“选题 / 热点 / 草稿”。')
  }

  if (step === 'title') {
    if (!text) return startAssistantMessage('内容标题不能为空。先给我一个短标题就行。')
    data.title = text.slice(0, 120)
    flowState.value.step = 'platform'
    return askNextFlowQuestion()
  }

  if (step === 'platform') {
    if (!/^(跳过|不用|无|none|skip)$/i.test(text)) {
      data.platform = text.slice(0, 80)
    }
    flowState.value.step = 'confirm'
    return askNextFlowQuestion()
  }

  if (step === 'confirm') {
    if (text === 'create' || parseYesNo(text) === true) {
      await runSuggestedBackendAction({
        action: 'create_creator_item',
        title: data.title,
        payload: {
          title: data.title,
          type: data.type || 'topic',
          stage: 'inbox',
          platform: data.platform || ''
        }
      })
      resetFlow()
      return
    }
    if (text === 'cancel' || parseYesNo(text) === false) {
      resetFlow()
      return startAssistantMessage('好，先不创建内容条目。')
    }
    return startAssistantMessage('确认创建就回复“确认”，不创建就回复“不用”。')
  }
}

const handleHabitFlowInput = async (value) => {
  const data = flowState.value.data
  const step = flowState.value.step
  const text = String(value || '').trim()

  if (step === 'name') {
    if (!text) return startAssistantMessage('名称不能为空。给我一个短一点的习惯名就行。')
    data.name = text.slice(0, 100)
    flowState.value.step = 'frequency'
    return askNextFlowQuestion()
  }

  if (step === 'frequency') {
    const parsed = text.includes(':')
      ? { frequency: text.split(':')[0], target: Number(text.split(':')[1]) || 1 }
      : parseFrequencyTarget(text)
    if (!parsed) return startAssistantMessage('我需要知道频率。比如：每天 1 次、每天 3 次、每周 5 次。')
    data.frequency = parsed.frequency
    data.target = parsed.target
    flowState.value.step = 'reminderEnabled'
    return askNextFlowQuestion()
  }

  if (step === 'reminderEnabled') {
    const parsed = parseYesNo(text)
    if (parsed === null) return startAssistantMessage('这里回答“需要”或“不需要”就行。')
    data.reminderEnabled = parsed
    flowState.value.step = parsed ? 'reminderTimes' : 'enableComments'
    return askNextFlowQuestion()
  }

  if (step === 'reminderTimes') {
    const times = parseReminderTimes(text)
    if (!times.length) return startAssistantMessage('给我一个 24 小时制时间，例如 08:00。多个时间可以写 08:00, 20:00。')
    data.reminderTimes = times
    flowState.value.step = 'enableComments'
    return askNextFlowQuestion()
  }

  if (step === 'enableComments') {
    const parsed = parseYesNo(text)
    if (parsed === null) return startAssistantMessage('这里回答“开启”或“不用”就行。')
    data.enableComments = parsed
    flowState.value.step = 'confirm'
    return askNextFlowQuestion()
  }

  if (step === 'confirm') {
    if (text === 'create' || parseYesNo(text) === true) return completeHabitFlow()
    if (text === 'cancel' || parseYesNo(text) === false) {
      resetFlow()
      return startAssistantMessage('好，我先不创建。信息也不自动写入，避免误操作。')
    }
    return startAssistantMessage('确认创建就回复“确认”或点按钮；不创建就回复“不用”。')
  }
}

const handlePlanFlowInput = async (value) => {
  const data = flowState.value.data
  const step = flowState.value.step
  const text = String(value || '').trim()

  if (step === 'title') {
    if (!text) return startAssistantMessage('计划标题不能为空。给我一个明确标题就行。')
    data.title = text.slice(0, 120)
    flowState.value.step = 'confirm'
    return askNextFlowQuestion()
  }

  if (step === 'confirm') {
    const parsed = text === 'create' ? true : text === 'cancel' ? false : parseYesNo(text)
    if (parsed === false) {
      resetFlow()
      return startAssistantMessage('好，先不创建。等你想清楚标题和范围，我再接着办。')
    }
    if (parsed === true) return completePlanFlow()
    return startAssistantMessage('确认创建就回复“确认”，不创建就回复“不用”。')
  }

  if (step === 'outlineAfterCreate') {
    if (text === 'outline' || parseYesNo(text) === true) return generateOutlineForCreatedPlan()
    if (text === 'skip' || parseYesNo(text) === false) {
      const plan = pendingOutline.value
      resetFlow()
      pendingOutline.value = null
      await startAssistantMessage('好，先保留空计划。你可以进入编辑器后再让我生成、润色或拆成待办。')
      if (plan?.planId) {
        lastActions.value = [{ type: 'open_plan', label: '打开计划', title: plan.title, payload: { to: `/plan/${plan.planId}` } }]
      }
      return
    }
    return startAssistantMessage('需要大纲就回复“要”，不需要就回复“不用”。')
  }
}

const handleFlowInput = async (value) => {
  if (!flowState.value) return false
  if (flowState.value.kind === 'habit') await handleHabitFlowInput(value)
  if (flowState.value.kind === 'plan') await handlePlanFlowInput(value)
  if (flowState.value.kind === 'capture') await handleCaptureFlowInput(value)
  if (flowState.value.kind === 'review') await handleReviewFlowInput(value)
  if (flowState.value.kind === 'track') await handleTrackFlowInput(value)
  if (flowState.value.kind === 'learningCard') await handleLearningCardFlowInput(value)
  if (flowState.value.kind === 'creatorItem') await handleCreatorItemFlowInput(value)
  await scrollMessagesToBottom()
  return true
}

const submitFlowChoice = async (value) => {
  if (!flowState.value || isAsking.value) return
  await handleFlowInput(value)
}

const createMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const scrollMessagesToBottom = async () => {
  await nextTick()
  if (!messagesBody.value) return
  messagesBody.value.scrollTop = messagesBody.value.scrollHeight
}

const getAssistantPayload = (response) => response?.data?.data || response?.data || response || {}

const normalizeBackendSuggestions = (suggestions = []) => (
  Array.isArray(suggestions)
    ? suggestions.slice(0, 3).map((item) => ({
      type: item.type || 'navigate',
      action: item.action || '',
      label: item.label || ui.goHandle,
      title: item.title || item.to || ui.goHandle,
      payload: item.payload && typeof item.payload === 'object'
        ? { ...item.payload, to: item.to || item.payload.to || '' }
        : { to: item.to || '' },
      flow: item.flow || ''
    }))
    : []
)

const runPetBackendAction = async (action, payload = {}) => {
  const response = await runMascotAssistantAction({
    action,
    payload: {
      ...payload,
      providerId: workspaceAiStore.normalizedSelectedProviderId
    }
  })
  if (!response?.success) {
    throw new Error(response?.error || response?.message || 'pet action failed')
  }
  return response.data || {}
}

const runSuggestedBackendAction = async (action) => {
  if (!action?.action || isAsking.value) return
  isAsking.value = true
  lastActions.value = []
  sendState('working', 1600, ui.thinking)
  try {
    const result = await runPetBackendAction(action.action, action.payload || {})
    await startAssistantMessage(result.message || '动作已完成。')
    lastActions.value = normalizeBackendSuggestions(result.suggestions)
    sendState(result.actionState || 'done', 1300, ui.answered)
  } catch (error) {
    console.warn('Workspace pet action failed', error)
    await startAssistantMessage(`执行失败：${error.message || '接口暂时不可用'}。`)
    sendState('failed', 1500, ui.error)
  } finally {
    isAsking.value = false
    await scrollMessagesToBottom()
  }
}

const savePosition = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(POSITION_KEY, JSON.stringify(position.value))
}

const clearTimers = () => {
  if (frameTimer) window.cancelAnimationFrame(frameTimer)
  if (stateTimer) window.clearTimeout(stateTimer)
  if (clearSpeechTimer) window.clearTimeout(clearSpeechTimer)
  frameTimer = 0
  stateTimer = 0
  clearSpeechTimer = 0
}

const endTransientState = () => {
  activeTransientState.value = ''
}

const sendState = (state, duration = 1200, text = '') => {
  if (!animationMap[state]) return
  activeTransientState.value = state
  speechText.value = text
  if (stateTimer) window.clearTimeout(stateTimer)
  if (clearSpeechTimer) window.clearTimeout(clearSpeechTimer)
  stateTimer = window.setTimeout(endTransientState, duration)
  clearSpeechTimer = window.setTimeout(() => {
    speechText.value = ''
  }, Math.max(900, duration + 260))
}

const openPanel = () => {
  isPanelOpen.value = true
  sendState('waving', 900, ui.here)
  scrollMessagesToBottom()
}

const closePanel = () => {
  isPanelOpen.value = false
}

const handleClick = () => {
  if (dragMoved.value) {
    dragMoved.value = false
    return
  }
  isPanelOpen.value ? closePanel() : openPanel()
}

const handlePointerDown = (event) => {
  if (event.button !== 0) return
  const target = event.currentTarget
  target?.setPointerCapture?.(event.pointerId)
  pointerState.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: position.value.x,
    originY: position.value.y
  }
  isDragging.value = false
  dragMoved.value = false
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerup', handlePointerUp, { passive: true, once: true })
}

const handlePointerMove = (event) => {
  if (pointerState.value.pointerId == null) return
  const dx = event.clientX - pointerState.value.startX
  const dy = event.clientY - pointerState.value.startY

  if (!isDragging.value && Math.hypot(dx, dy) > 4) {
    isDragging.value = true
    dragMoved.value = true
  }

  if (!isDragging.value) return
  position.value = clampPosition(pointerState.value.originX + dx, pointerState.value.originY + dy)
}

const handlePointerUp = () => {
  window.removeEventListener('pointermove', handlePointerMove)
  if (isDragging.value) savePosition()
  window.setTimeout(() => {
    isDragging.value = false
    pointerState.value.pointerId = null
  }, 0)
}

const openQuickCapture = () => {
  window.dispatchEvent(new CustomEvent('workspace-quick-capture-open'))
  sendState('waiting', 1200, ui.collect)
  closePanel()
}

const askPrompt = (prompt) => {
  draft.value = prompt
  submitQuestion()
}

const submitQuestion = async () => {
  const question = draft.value.trim()
  if (!question || isAsking.value) return

  draft.value = ''
  messages.value.push({ id: createMessageId(), role: 'user', content: question })

  if (flowState.value) {
    await handleFlowInput(question)
    return
  }

  isAsking.value = true
  lastActions.value = []
  sendState('thinking', 1800, ui.thinking)
  await scrollMessagesToBottom()

  try {
    const response = await chatWithMascotAssistant({
      message: question,
      providerId: workspaceAiStore.normalizedSelectedProviderId
    })

    if (!response?.success) {
      if (response?.code === 'AI_NOT_CONFIGURED') {
        lastSource.value = 'not_configured'
        messages.value.push({ id: createMessageId(), role: 'assistant', content: '尚未配置 AI 能力。请先到“我的”页面进入 AI 供应商配置。' })
        lastActions.value = [
          { type: 'open_profile', label: '前往配置', title: 'AI 供应商配置', payload: { to: '/profile/ai-providers' } }
        ]
        sendState('failed', 1300, '需要配置')
        return
      }
      throw new Error(response?.error || response?.message || 'assistant request failed')
    }

    const payload = getAssistantPayload(response)
    const answer = payload.reply || payload.answer || payload.message || 'AI 没有返回可用内容。'
    lastSource.value = payload.source || 'configured'
    lastActions.value = Array.isArray(payload.proposedActions) ? payload.proposedActions.slice(0, 3) : []
    messages.value.push({ id: createMessageId(), role: 'assistant', content: answer })
    sendState('waving', 1300, ui.answered)
  } catch (error) {
    console.warn('Workspace pet assistant failed', error)
    lastSource.value = 'configured'
    messages.value.push({ id: createMessageId(), role: 'assistant', content: error.message || 'AI 请求失败' })
    sendState('failed', 1600, ui.error)
  } finally {
    isAsking.value = false
    await scrollMessagesToBottom()
  }
}

const runProposedAction = (action) => {
  if (action?.type === 'assistant_action') {
    void runSuggestedBackendAction(action)
    return
  }

  if (action?.type === 'start_flow') {
    const flow = action.flow || action.payload?.flow
    if (flow === 'creatorItem') {
      void startCreatorItemFlow(action.title || '')
      return
    }
    if (flow === 'review') {
      void startReviewFlow('')
      return
    }
    if (flow === 'plan') {
      void startPlanFlow('')
      return
    }
    if (flow === 'habit') {
      void startHabitFlow('')
      return
    }
    if (flow === 'capture') {
      void startCaptureFlow('')
      return
    }
    if (flow === 'track') {
      void startTrackFlow('')
      return
    }
  }

  const target = action?.payload?.to
  if (target) {
    router.push(target)
    sendState('review', 1000, action.label || ui.goHandle)
    closePanel()
    return
  }

  if (action?.type === 'open_quick_capture') {
    openQuickCapture()
    return
  }

  sendState('waving', 1100, ui.received)
}

const loadPetProfile = async () => {
  try {
    const response = await listWorkspacePets()
    if (!response?.success) return
    const data = response.data || {}
    const nextSettings = normalizePetSettings(data.setting || {})
    petSettings.value = nextSettings
    writeCachedPetSettings(nextSettings)
    petCatalog.value = Array.isArray(data.pets) ? data.pets : []
    position.value = clampPosition(position.value.x, position.value.y)
    savePosition()
  } catch (error) {
    console.warn('Workspace pet profile load failed', error)
  }
}

const handleExternalPetState = (event) => {
  const detail = event?.detail || {}
  if (!detail.state) return
  sendState(detail.state, detail.duration || 1200, detail.text || '')
}

const handlePetSettingsUpdated = async () => {
  await loadPetProfile()
}

const tick = (now) => {
  const meta = activeMeta.value
  if (!frameStartedAt) frameStartedAt = now
  const elapsed = now - frameStartedAt
  const frameDuration = meta.duration / meta.frames
  frameIndex.value = Math.floor(elapsed / frameDuration) % meta.frames
  frameTimer = window.requestAnimationFrame(tick)
}

watch([activeState, renderState], () => {
  frameStartedAt = 0
  frameIndex.value = 0
})

onMounted(() => {
  loadPetProfile()
  window.requestAnimationFrame(() => {
    isVisualReady.value = true
    frameTimer = window.requestAnimationFrame(tick)
  })
  window.addEventListener('workspace-pet-state', handleExternalPetState)
  window.addEventListener(PET_SETTINGS_UPDATED_EVENT, handlePetSettingsUpdated)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('workspace-pet-state', handleExternalPetState)
  window.removeEventListener(PET_SETTINGS_UPDATED_EVENT, handlePetSettingsUpdated)
  window.removeEventListener('pointermove', handlePointerMove)
})
</script>

<style scoped>
.workspace-pet-root {
  position: fixed;
  z-index: 48;
  opacity: 0;
  visibility: hidden;
  user-select: none;
}

.workspace-pet-root.is-ready {
  opacity: 1;
  visibility: visible;
}

.workspace-pet {
  position: relative;
  display: grid;
  place-items: end center;
  border: 0;
  background: transparent;
  padding: 0;
  pointer-events: auto;
  cursor: grab;
  transform-origin: 50% 100%;
  filter: drop-shadow(0 18px 22px rgba(24, 24, 27, 0.12));
}

.workspace-pet.is-dragging {
  cursor: grabbing;
}

.workspace-pet-sprite {
  display: block;
  image-rendering: auto;
  will-change: background-position, transform;
}

.workspace-pet-speech {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.55rem);
  transform: translateX(-50%);
  border: 1px solid rgba(228, 228, 231, 0.86);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.32rem 0.72rem;
  color: rgb(63, 63, 70);
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 16px 36px rgba(24, 24, 27, 0.12);
}

.workspace-pet-panel {
  position: absolute;
  left: calc(100% + 0.85rem);
  bottom: 0;
  width: min(31rem, calc(100vw - 2rem));
  max-height: min(42rem, calc(100vh - 2rem));
  display: flex;
  flex-direction: column;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 1.1);
  background: var(--workbench-surface);
  padding: 0;
  box-shadow: 0 24px 70px rgba(24, 24, 27, 0.14);
  backdrop-filter: blur(var(--workbench-backdrop-blur)) saturate(130%);
  -webkit-backdrop-filter: blur(var(--workbench-backdrop-blur)) saturate(130%);
  overflow: hidden;
}

.workspace-pet-root.is-panel-left .workspace-pet-panel {
  right: calc(100% + 0.85rem);
  left: auto;
}

.workspace-pet-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.8rem;
  border-bottom: 1px solid var(--workbench-border);
  background: linear-gradient(180deg, var(--workbench-surface-muted), transparent);
}

.workspace-pet-kicker {
  color: var(--workbench-text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.24em;
}

.workspace-pet-title {
  margin-top: 0.22rem;
  color: var(--workbench-text);
  font-size: 1.08rem;
  font-weight: 860;
  letter-spacing: -0.03em;
}

.workspace-pet-subtitle {
  max-width: 22rem;
  color: var(--workbench-text-muted);
  font-size: 0.7rem;
  line-height: 1.5;
}

.workspace-pet-panel-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
  margin: 0;
  padding: 0.75rem 1rem 0;
}

.workspace-pet-panel-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.7rem;
  padding: 0 0.7rem;
  border: 1px solid var(--workbench-border);
  border-radius: 9999px;
  background: var(--workbench-surface-muted);
  color: var(--workbench-text-muted);
  font-size: 0.66rem;
  font-weight: 820;
  letter-spacing: 0.02em;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.workspace-pet-panel-body {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 0.72rem;
  margin-top: 0;
  padding: 0.85rem 1rem 0;
  overflow: hidden;
}

.workspace-pet-panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.workspace-pet-section-title {
  color: var(--workbench-text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.workspace-pet-close,
.workspace-pet-chip,
.workspace-pet-ghost,
.workspace-pet-send,
.workspace-pet-suggestion {
  border: 1px solid var(--workbench-border);
  border-radius: 9999px;
  background: var(--workbench-surface-muted);
  color: var(--workbench-text);
  font-size: 0.72rem;
  font-weight: 820;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.workspace-pet-close {
  min-height: 2rem;
  padding: 0 0.8rem;
}

.workspace-pet-close:hover,
.workspace-pet-chip:hover,
.workspace-pet-ghost:hover,
.workspace-pet-suggestion:hover {
  border-color: rgba(24, 24, 27, 0.26);
  transform: translateY(-1px);
}

.workspace-pet-messages {
  display: grid;
  gap: 0.65rem;
  min-height: 0;
  padding-right: 0.18rem;
  max-height: 18.5rem;
  overflow-y: auto;
  scrollbar-width: thin;
}

.workspace-pet-message {
  max-width: 92%;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.75);
  padding: 0.72rem 0.82rem;
  background: var(--workbench-surface-muted);
  color: var(--workbench-text);
  box-shadow: 0 8px 22px rgba(24, 24, 27, 0.035);
}

.workspace-pet-message--user {
  justify-self: end;
  border-color: var(--workbench-text);
  background: var(--workbench-text);
  color: var(--workbench-page);
}

.workspace-pet-message-name {
  display: block;
  margin-bottom: 0.22rem;
  color: var(--workbench-text-muted);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.12em;
}

.workspace-pet-message--user .workspace-pet-message-name {
  color: rgba(255, 255, 255, 0.66);
}

.workspace-pet-message p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.64;
  white-space: pre-wrap;
}

.workspace-pet-chips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  padding: 0.2rem 0 0.05rem;
}

.workspace-pet-chip {
  min-height: 2rem;
  padding: 0 0.76rem;
  background: var(--workbench-surface-muted);
}

.workspace-pet-chip:disabled,
.workspace-pet-send:disabled {
  cursor: not-allowed;
  opacity: 0.52;
  transform: none;
}

.workspace-pet-suggestions {
  display: grid;
  gap: 0.45rem;
  padding-top: 0.62rem;
  border-top: 1px solid rgba(255, 255, 255, 0.34);
}

.workspace-pet-flow {
  margin-top: 0.18rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.78);
  background: var(--workbench-surface-muted);
  padding: 0.76rem;
  box-shadow: 0 10px 22px rgba(24, 24, 27, 0.035);
}

.workspace-pet-flow-kicker {
  color: rgb(113, 113, 122);
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.14em;
}

.workspace-pet-flow-question {
  margin-top: 0.28rem;
  color: rgb(24, 24, 27);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.45;
}

.workspace-pet-flow-summary {
  margin-top: 0.36rem;
  color: rgb(82, 82, 91);
  font-size: 0.72rem;
  line-height: 1.55;
}

.workspace-pet-flow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.6rem;
}

.workspace-pet-flow-chip {
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.66);
  padding: 0.42rem 0.72rem;
  color: rgb(24, 24, 27);
  font-size: 0.7rem;
  font-weight: 820;
}

.workspace-pet-flow-chip:hover {
  border-color: rgba(24, 24, 27, 0.25);
  transform: translateY(-1px);
}

.workspace-pet-suggestions-title {
  margin: 0;
  color: rgb(113, 113, 122);
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.14em;
}

.workspace-pet-suggestion {
  display: grid;
  gap: 0.18rem;
  border-radius: 0.95rem;
  padding: 0.58rem 0.7rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.54);
}

.workspace-pet-suggestion span {
  color: rgb(113, 113, 122);
  font-size: 0.64rem;
}

.workspace-pet-suggestion strong {
  color: rgb(24, 24, 27);
  font-size: 0.76rem;
  line-height: 1.35;
}

.workspace-pet-composer {
  margin: 0.85rem 1rem 1rem;
  border: 1px solid var(--workbench-border);
  border-radius: calc(var(--workbench-radius) * 0.82);
  background: var(--workbench-surface-muted);
  padding: 0.62rem;
  box-shadow: 0 10px 22px rgba(24, 24, 27, 0.035);
}

.workspace-pet-input {
  width: 100%;
  min-height: 3.25rem;
  resize: none;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--workbench-text);
  font-size: 0.8rem;
  line-height: 1.55;
}

.workspace-pet-input::placeholder {
  color: rgb(161, 161, 170);
}

.workspace-pet-composer-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.55rem;
  margin-top: 0.52rem;
}

.workspace-pet-ghost,
.workspace-pet-send {
  min-height: 2.12rem;
  padding: 0 0.9rem;
}

.workspace-pet-send {
  border-color: rgba(24, 24, 27, 0.82);
  background: rgba(24, 24, 27, 0.86);
  color: white;
}

.workspace-pet-send:not(:disabled):hover {
  transform: translateY(-1px);
  background: rgba(9, 9, 11, 0.96);
}

.workspace-pet.is-state-running-right {
  animation: pet-walk-right 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-running-left {
  animation: pet-walk-left 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-running {
  animation: pet-work 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-working {
  animation: pet-work 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-thinking {
  animation: pet-review 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-waving {
  animation: pet-wave 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-jumping {
  animation: pet-hop 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-done {
  animation: pet-hop 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-sleeping {
  animation: pet-sag 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-failed {
  animation: pet-sag 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-waiting {
  animation: pet-watch 5.2s ease-in-out infinite;
}

.workspace-pet.is-state-review {
  animation: pet-review 5.2s ease-in-out infinite;
}

@keyframes pet-walk-right {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-1px) translateX(1px); }
}

@keyframes pet-walk-left {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-1px) translateX(-1px); }
}

@keyframes pet-work {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-1px) scale(1.01); }
}

@keyframes pet-wave {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-2px) rotate(-1.5deg); }
}

@keyframes pet-hop {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes pet-sag {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(1px); }
}

@keyframes pet-watch {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-1px) rotate(1deg); }
}

@keyframes pet-review {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-1px) rotate(-0.8deg); }
}

:global(.dark) .workspace-pet-panel {
  border-color: var(--workbench-border);
  background: var(--workbench-surface);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
}

:global(.dark) .workspace-pet-panel-header,
:global(.dark) .workspace-pet-suggestions {
  border-color: var(--workbench-border);
}

:global(.dark) .workspace-pet-flow {
  border-color: var(--workbench-border);
  background: var(--workbench-surface-muted);
}

:global(.dark) .workspace-pet-kicker,
:global(.dark) .workspace-pet-subtitle,
:global(.dark) .workspace-pet-message-name,
:global(.dark) .workspace-pet-suggestions-title,
:global(.dark) .workspace-pet-suggestion span,
:global(.dark) .workspace-pet-flow-kicker,
:global(.dark) .workspace-pet-flow-summary {
  color: rgb(161, 161, 170);
}

:global(.dark) .workspace-pet-title,
:global(.dark) .workspace-pet-message,
:global(.dark) .workspace-pet-flow-question,
:global(.dark) .workspace-pet-suggestion strong,
:global(.dark) .workspace-pet-input {
  color: white;
}

:global(.dark) .workspace-pet-flow-chip {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.86);
  color: white;
}

:global(.dark) .workspace-pet-close,
:global(.dark) .workspace-pet-chip,
:global(.dark) .workspace-pet-ghost,
:global(.dark) .workspace-pet-suggestion,
:global(.dark) .workspace-pet-composer {
  border-color: var(--workbench-border);
  background: var(--workbench-surface-muted);
  color: white;
}

:global(.dark) .workspace-pet-panel-badge {
  border-color: var(--workbench-border);
  background: var(--workbench-surface-muted);
  color: rgb(212, 212, 216);
}

:global(.dark) .workspace-pet-message {
  border-color: var(--workbench-border);
  background: var(--workbench-surface-muted);
}

:global(.dark) .workspace-pet-message--user,
:global(.dark) .workspace-pet-send {
  border-color: white;
  background: rgba(255, 255, 255, 0.92);
  color: rgb(9, 9, 11);
}

@media (prefers-reduced-motion: reduce) {
  .workspace-pet,
  .workspace-pet.is-state-running-right,
  .workspace-pet.is-state-running-left,
  .workspace-pet.is-state-running,
  .workspace-pet.is-state-working,
  .workspace-pet.is-state-thinking,
  .workspace-pet.is-state-waving,
  .workspace-pet.is-state-jumping,
  .workspace-pet.is-state-done,
  .workspace-pet.is-state-sleeping,
  .workspace-pet.is-state-failed,
  .workspace-pet.is-state-waiting,
  .workspace-pet.is-state-review {
    animation: none !important;
  }
}

@media (max-width: 1023px) {
  .workspace-pet-root {
    display: none;
  }
}
</style>

