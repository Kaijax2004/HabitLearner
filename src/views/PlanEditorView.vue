<template>
  <AppLayout title="计划编辑" :showBackButton="true" :onBack="handleBack">
    <div class="plan-editor-workbench" :class="{ 'plan-editor-workbench-ai-open': aiPanel.show }">
      <div class="plan-editor-left-rail">
        <PlanEditorPageTree
          :pages="editorPageTree"
          :current-page-id="editorPageId"
          @open="openEditorPage"
          @create="createEditorChildPage"
        />
        <PlanEditorOutline :outline-items="outlineItems" @scroll-to-block="scrollToBlock" />
      </div>

      <div class="plan-editor-shell w-full px-3 pb-20 pt-4 sm:px-6 lg:px-8">
      <div class="plan-editor-surface w-full">
        <PlanEditorTopbar
          :plan-id="planId"
          :title="title"
          :status="status"
          :priority="priority"
          :plan-type="planType"
          :custom-type-name="customTypeName"
          :due-date="dueDate"
          :is-custom-plan-type="isCustomPlanType"
          :status-label="statusLabel"
          :priority-label="priorityLabel"
          :type-label="typeLabel"
          :save-status-text="saveStatusText"
          :save-dot-class="saveDotClass"
          :selected-block-count="selectedBlockCount"
          :unscheduled-count="unscheduledBlocks.length"
          @update:title="title = $event"
          @update:status="status = $event"
          @update:priority="priority = $event"
          @update:planType="planType = $event"
          @update:customTypeName="customTypeName = $event"
          @update:dueDate="dueDate = $event"
          @title-input="handleTitleInput"
          @dirty="markDirty"
          @clear-selection="clearSelectedBlocks"
          @open-unscheduled="showUnscheduledPanel = true"
          @import="triggerImport"
          @export="toggleExportMenu"
          @delete="deleteCurrentPlan"
        />
        <div v-if="isLoading" class="plan-editor-loading" aria-live="polite">
          <div class="plan-loading-title"></div>
          <div class="plan-loading-line w-11/12"></div>
          <div class="plan-loading-line w-4/5"></div>
          <div class="plan-loading-line w-10/12"></div>
          <div class="plan-loading-gap"></div>
          <div class="plan-loading-line w-2/3"></div>
          <div class="plan-loading-line w-5/6"></div>
          <span>正在整理计划正文...</span>
        </div>
        <div v-else-if="loadError" class="plan-load-error">
          <div class="text-lg font-semibold text-zinc-900 dark:text-white">{{ loadError.title }}</div>
          <p class="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{{ loadError.message }}</p>
          <div class="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" class="btn-primary px-4 py-2 text-sm" @click="loadPlan">重试</button>
            <button type="button" class="btn-secondary px-4 py-2 text-sm" @click="router.push('/plan')">返回计划</button>
          </div>
        </div>

        <section v-else class="plan-document">
          <div v-if="!blocks.length" class="plan-empty-state" @click="createFirstBlock">
            <div class="text-lg font-semibold text-zinc-900 dark:text-white">开始写计划</div>
            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              输入空行后按 <code>/</code> 打开命令菜单，或者点击这里插入第一行。
            </p>
          </div>

          <PlanEditorBlockRow
            v-for="(block, index) in blocks"
            :key="block.id"
            :block="block"
            :index="index"
            :all-blocks="blocks"
            :plan-title="title"
            :plan-id="planId"
            :resolve-block="resolveBlock"
            :active-block-id="activeBlockId"
            :hovered-block-id="hoveredBlockId"
            :selected-block-ids="selectedBlockIds"
            :block-selection="blockSelection"
            :drag-state="dragState"
            @hover="(_id, rowIndex) => { hoveredBlockId = block.id; extendBlockSelection(rowIndex) }"
            @leave="hoveredBlockId = null"
            @row-click="handleBlockRowClick"
            @drag-over="onRowDragOver"
            @drop="onRowDrop"
            @begin-selection="beginBlockSelection"
            @drag-start="onHandleDragStart"
            @drag-end="onHandleDragEnd"
            @open-menu="openRowMenu"
            @open-type-menu="openHandleTypeSelector"
            @update-content="updateBlockContent"
            @toggle-complete="toggleBlockComplete"
            @delete-block="removeBlock"
            @create-new-block="insertTextAfter"
            @open-ai="openAiComposerFromBlock"
            @open-slash-menu="(event, rowIndex) => openCommandMenu(event, rowIndex, 'replace-current')"
            @change-type="changeBlockType"
            @insert-blocks="insertBlocksAfter"
            @focus="handleBlockFocus"
            @blur="clearActiveBlock"
          >
            <template #default="{ block: slotBlock }">
              <PlanEditorAiComposer
                v-if="aiComposer.show && aiComposer.context?.blockId === slotBlock.id"
                :context="aiComposer.context"
                :skills="aiSkills"
                v-model:model="aiSelectedModel"
                :model-options="aiModelOptions"
                :model-loading="aiMediaModelsLoading"
                :loading="aiComposer.loading"
                :result="aiComposer.result"
                @run="runAiComposer"
                @load-models="ensureAiMediaModelsLoaded"
                @apply="applyAiComposerText"
                @apply-blocks="applyAiComposerBlocks"
                @manage-skills="router.push('/profile/ai-skills')"
                @close="closeAiComposer"
              />
            </template>
          </PlanEditorBlockRow>

          <button v-if="blocks.length" type="button" class="plan-new-line" @click="appendTextBlock">
            <span class="mr-2">+</span>
            <span>添加一行</span>
          </button>
        </section>
      </div>
      </div>

      <PlanEditorAiPanel
        v-if="aiPanel.show"
        :state="aiWorkspaceState"
        :actions="aiPanelActions"
        @tab-change="openAiPanel"
      />
      <PlanEditorInspector
        v-else
        :status-label="statusLabel"
        :priority-label="priorityLabel"
        :due-date="dueDate"
        :unscheduled-blocks="unscheduledBlocks"
        :schedule-blocks="scheduleBlocks"
        :schedule-status-label="scheduleStatusLabel"
        @open-unscheduled="showUnscheduledPanel = true"
        @open-ai="openAiWorkspace"
        @open-creator="router.push('/creator')"
      />
    </div>

    <PlanEditorSlashMenu
      :command-menu="commandMenu"
      :command-categories="commandCategories"
      :visible-command-items="visibleCommandItems"
      :paged-command-items="pagedCommandItems"
      :current-page="currentCommandPage"
      :total-pages="totalCommandPages"
      :page-item-range-text="pageItemRangeText"
      @close="closeCommandMenu"
      @query="commandMenu.query = $event"
      @keydown="handleCommandKeydown"
      @category="setCommandCategory"
      @highlight="commandMenu.highlight = $event"
      @select="selectCommandItem"
      @page="goToCommandPage"
    />
    <input ref="fileInputRef" type="file" accept=".md,.markdown,.json,.html,.htm,.csv" class="hidden" @change="handleImport" />

    <Teleport to="body">
      <div v-if="showExportMenu" class="fixed inset-0 z-[1000]" @click="showExportMenu = false">
        <div class="absolute right-6 top-20 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950" @click.stop>
          <button type="button" class="export-menu-item" @click="handleExport('markdown')">导出为 Markdown</button>
          <button type="button" class="export-menu-item" @click="handleExport('html')">导出为 HTML</button>
          <button type="button" class="export-menu-item" @click="handleExport('json')">导出为 JSON</button>
          <button type="button" class="export-menu-item" @click="handleExport('csv')">导出为 CSV</button>
          <button type="button" class="export-menu-item" @click="handleExport('workspace')">导出整个工作区</button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="inlineAiToolbar.show"
        class="inline-ai-toolbar"
        :style="{ top: `${inlineAiToolbar.top}px`, left: `${inlineAiToolbar.left}px` }"
      >
        <button
          v-for="action in [{ label: 'AI' }]"
          :key="`toolbar-workspace-${action.label}`"
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': aiComposer.show }"
          @mousedown.prevent="openAiComposer({ ...inlineAiToolbar })"
        >
          {{ action.label }}
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="inlineFormatToolbar.show"
        class="inline-format-toolbar inline-ai-toolbar"
        :style="{ top: `${inlineFormatToolbar.top}px`, left: `${inlineFormatToolbar.left}px` }"
      >
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.bold }"
          title="Bold"
          @mousedown.prevent="applyInlineFormat('bold')"
        >
          B
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn italic"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.italic }"
          title="Italic"
          @mousedown.prevent="applyInlineFormat('italic')"
        >
          I
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.code }"
          title="Inline code"
          @mousedown.prevent="applyInlineFormat('code')"
        >
          <span class="text-xs">&lt;/&gt;</span>
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.strike }"
          title="Strikethrough"
          @mousedown.prevent="applyInlineFormat('strike')"
        >
          <span class="line-through">S</span>
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.highlight }"
          title="Highlight"
          @mousedown.prevent="applyInlineFormat('highlight')"
        >
          H
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.link }"
          title="Link"
          @mousedown.prevent="applyInlineFormat('link')"
        >
          <span class="text-xs">Link</span>
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-primary"
          title="AI"
          @mousedown.prevent="applyInlineFormat('ai')"
        >
          AI
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="rowMenu.show"
        class="fixed z-[1100] w-44 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        :style="{ top: `${rowMenu.top}px`, left: `${rowMenu.left}px` }"
      >
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('add-above')">在上方插入</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('add-below')">在下方插入</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('schedule')">安排到日程</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('duplicate')">复制当前块</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('change-type')">切换类型</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('move-up')">上移</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('move-down')">下移</button>
        <button type="button" class="row-menu-item text-red-600 dark:text-red-300" @click="handleRowMenuAction('delete')">删除</button>
      </div>
    </Teleport>

    <Teleport to="body">
      <BlockTypeSelector
        :show="blockTypeSelector.show"
        @close="closeBlockTypeSelector"
        @select="handleBlockTypeSelect"
      />
    </Teleport>

    <PlanEditorSchedulePanel
      :show-unscheduled-panel="showUnscheduledPanel"
      :schedule-dialog="scheduleDialog"
      :filtered-unscheduled-blocks="filteredUnscheduledBlocks"
      :schedule-blocks-loading="scheduleBlocksLoading"
      :unscheduled-search="unscheduledSearch"
      :unscheduled-type-filter="unscheduledTypeFilter"
      :unscheduled-type-options="unscheduledTypeOptions"
      :unscheduled-empty-text="unscheduledEmptyText"
      :get-block-text-content="getBlockTextContent"
      :block-type-label="blockTypeLabel"
      @close-unscheduled="showUnscheduledPanel = false"
      @update-search="unscheduledSearch = $event"
      @update-type="unscheduledTypeFilter = $event"
      @schedule="openScheduleDialogFromShelf"
      @close-dialog="closeScheduleDialog"
      @submit="submitScheduleDialog"
    />


  </AppLayout>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import BlockTypeSelector from '@/components/BlockTypeSelector.vue'
import PlanEditorOutline from '@/views/plan/PlanEditorOutline.vue'
import PlanEditorInspector from '@/views/plan/PlanEditorInspector.vue'
import PlanEditorTopbar from '@/views/plan/PlanEditorTopbar.vue'
import PlanEditorBlockRow from '@/views/plan/PlanEditorBlockRow.vue'
import PlanEditorSlashMenu from '@/views/plan/PlanEditorSlashMenu.vue'
import PlanEditorPageTree from '@/views/plan/PlanEditorPageTree.vue'
import PlanEditorSchedulePanel from '@/views/plan/PlanEditorSchedulePanel.vue'
import PlanEditorAiComposer from '@/views/plan/PlanEditorAiComposer.vue'
import PlanEditorAiPanel from '@/views/plan/PlanEditorAiPanel.vue'
import {
  generatePlanImageAI,
  getPlanImageStatusAI,
  listPlanImageHistoryAI,
  deletePlanImageHistoryAI,
  createPlanVideoAI,
  getPlanVideoStatusAI,
  listPlanVideoHistoryAI,
  deletePlanVideoHistoryAI,
  getPlanById
} from '@/api/plans'
import {
  createEditorBlock,
  createEditorPage,
  getEditorPageTree,
  getPlanEditorBootstrap,
  updateEditorBlock,
  deleteEditorBlock,
  reorderEditorBlocks
} from '@/api/editor'
import { createScheduleBlock, listScheduleBlocks } from '@/api/scheduleBlocks'
import {
  listAiProviderModels,
  listAiProviders,
  listAiSkills,
  runWorkspaceAi,
  chatWithMascotAssistant,
  listAiConversations,
  getAiConversation,
  createAiConversation,
  updateAiConversation,
  deleteAiConversation as deleteAiConversationRequest
} from '@/api/workspace'
import { uploadImage } from '@/api/uploads'
import { useImportExport } from '@/composables/useImportExport'
import { useEditorDocument } from '@/composables/useEditorDocument'
import { useEditorHistory } from '@/composables/useEditorHistory'
import { useEditorPersistence } from '@/composables/useEditorPersistence'
import { useEditorKeyboard } from '@/composables/useEditorKeyboard'
import { useToast } from '@/composables/useToast'
import { alertDialog, confirmDialog } from '@/composables/useGlobalDialog'
import { usePlanStore } from '@/stores/plan'
import { useWorkspaceAiStore } from '@/stores/workspaceAi'
import { resolveMediaUrl } from '@/utils/media'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const workspaceAiStore = useWorkspaceAiStore()
const editorDocument = useEditorDocument()
const editorHistory = useEditorHistory()
const editorPersistence = useEditorPersistence()
const { exportPlan, exportWorkspaceBackup, importPlan } = useImportExport()
const { success: showSuccess, error: showError, info: showInfo } = useToast()

const planId = computed(() => route.params.id)
const isLoading = ref(false)
const loadError = ref(null)
const title = ref('')
const status = ref('not_started')
const priority = ref('medium')
const planType = ref('project')
const customTypeName = ref('')
const dueDate = ref('')
const blocks = ref([])
const editorPageId = ref(null)
const editorPageTree = ref([])
const outlineItems = computed(() => blocks.value
  .filter((block) => ['heading', 'page'].includes(block.type))
  .map((block) => {
    const content = block.content && typeof block.content === 'object' ? block.content : {}
    const label = String(content.text || content.title || content.value || '').trim()
    return {
      id: block.id,
      level: Math.min(3, Math.max(1, Number(content.level || 1))),
      label: label || '未命名标题'
    }
  })
  .filter((item) => item.label))
const activeBlockId = ref(null)
const hoveredBlockId = ref(null)
const selectedBlockIds = ref(new Set())
const blockSelection = ref({ active: false, anchorIndex: -1, lastIndex: -1, mode: 'replace' })
const saveStatus = ref('saved')
const pendingBlockIds = ref(new Set())
const showExportMenu = ref(false)
const fileInputRef = ref(null)
const titleRef = ref(null)
const rowMenu = ref({ show: false, blockId: null, blockIndex: -1, top: 0, left: 0 })
const blockTypeSelector = ref({ show: false, blockId: null, blockIndex: -1 })
const suppressHandleClickUntil = ref(0)
const scheduleDialog = ref({
  show: false,
  blockId: null,
  title: '',
  date: '',
  startTime: '',
  durationMinutes: 60,
  isSubmitting: false
})
const scheduleBlocks = ref([])
const scheduleBlocksLoading = ref(false)
const showUnscheduledPanel = ref(false)
const unscheduledSearch = ref('')
const unscheduledTypeFilter = ref('all')
const dragState = ref({ draggingId: null, draggingIds: [], fromIndex: -1, overIndex: -1, position: 'after' })
const commandMenu = ref({ show: false, mode: 'insert-after', index: null, top: 0, left: 0, query: '', selectedCategory: 'all', highlight: 0 })
const aiPanel = ref({ show: false, tab: 'chat' })
const aiChatMessages = ref([])
const aiChatDraft = ref('')
const aiChatLoading = ref(false)
const aiConversations = ref([])
const aiConversationId = ref('')
const aiConversationLoading = ref(false)
const aiConversationSaving = ref(false)
const aiConversationContextExpanded = ref(false)
const aiSelectedModel = ref(workspaceAiStore.normalizedSelectedModel || '')
const aiSkills = ref([])
const aiComposer = ref({
  show: false,
  context: null,
  loading: false,
  result: null
})
const aiImageMode = ref('text_to_image')
const aiImageModel = ref('')
const aiImagePrompt = ref('')
const aiImageNegativePrompt = ref('')
const aiImageSize = ref('1024x1024')
const aiImageRatio = ref('1:1')
const aiImageLoading = ref(false)
const aiImageResult = ref(null)
const aiImageSources = ref([])
const aiImageHistory = ref([])
const aiImageHistoryLoading = ref(false)
const aiImageDeletingTaskId = ref('')
const aiImagePollingTimer = ref(null)
const aiVideoMode = ref('text_to_video')
const aiVideoModel = ref('')
const aiVideoPrompt = ref('')
const aiVideoNegativePrompt = ref('')
const aiVideoWidth = ref(720)
const aiVideoHeight = ref(1280)
const aiVideoFrames = ref(121)
const aiVideoFrameRate = ref(24)
const aiVideoLoading = ref(false)
const aiVideoResult = ref(null)
const aiVideoSources = ref([])
const aiVideoSourceUrl = ref('')
const aiVideoSourceUploading = ref(false)
const aiVideoSourceUploadProgress = ref(0)
const aiVideoHistory = ref([])
const aiVideoHistoryLoading = ref(false)
const aiVideoDeletingTaskId = ref('')
const aiVideoPollingTimer = ref(null)
const aiMediaModelOptions = ref([])
const aiMediaModelsLoading = ref(false)
const aiMediaModelError = ref('')
const aiActionCooldownUntil = ref({
  image: 0,
  video: 0
})
const aiCooldownTick = ref(Date.now())
let planLoadSeq = 0
let editorPageTreeRequest = null
let aiSkillsRequest = null
const inlineAiToolbar = ref({
  show: false,
  blockId: null,
  fieldKey: '',
  itemIndex: null,
  top: 0,
  left: 0,
  rangeStart: 0,
  rangeEnd: 0,
  hasSelection: false,
  selectedText: '',
  sourceText: ''
})
const inlineFormatToolbar = ref({
  show: false,
  blockId: null,
  fieldKey: '',
  itemIndex: null,
  top: 0,
  left: 0,
  rangeStart: 0,
  rangeEnd: 0,
  hasSelection: false,
  selectedText: '',
  sourceText: '',
  marks: {
    bold: false,
    italic: false,
    code: false,
    strike: false,
    highlight: false,
    link: false
  }
})
let removeKeydownListener = null
let removeClickListener = null
let removeSelectionChangeListener = null
let removeMouseupListener = null
let removeMousemoveListener = null
let removeEditorKeyupListener = null
let removeResizeListener = null
let removeEditorHistoryKeydown = null
let aiCooldownTimer = null
const commandItemsPerPage = 6

const getEditorHistorySnapshot = () => ({
  title: title.value,
  status: status.value,
  priority: priority.value,
  planType: planType.value,
  customTypeName: customTypeName.value,
  dueDate: dueDate.value,
  blocks: blocks.value.map((block) => ({
    type: block.type,
    content: cloneContent(block.content),
    order: block.order
  }))
})

const restoreEditorHistorySnapshot = async (snapshot) => {
  if (!snapshot) return
  await replaceAllBlocks(snapshot)
}

function undoEditor() {
  return restoreEditorHistorySnapshot(editorHistory.undo())
}

function redoEditor() {
  return restoreEditorHistorySnapshot(editorHistory.redo())
}

const editorKeyboard = useEditorKeyboard({
  onSave: () => saveEverything(),
  onUndo: undoEditor,
  onRedo: redoEditor
})

const blockComponents = {
  heading: defineAsyncComponent(() => import('@/views/plan/blocks/HeadingBlock.vue')),
  text: defineAsyncComponent(() => import('@/views/plan/blocks/LazyRichTextBlock.vue')),
  page: defineAsyncComponent(() => import('@/views/plan/blocks/PageBlock.vue')),
  todo: defineAsyncComponent(() => import('@/views/plan/blocks/TodoBlock.vue')),
  toggle: defineAsyncComponent(() => import('@/views/plan/blocks/ToggleBlock.vue')),
  collapse: defineAsyncComponent(() => import('@/views/plan/blocks/ToggleBlock.vue')),
  divider: defineAsyncComponent(() => import('@/views/plan/blocks/DividerBlock.vue')),
  link_page: defineAsyncComponent(() => import('@/views/plan/blocks/LinkPageBlock.vue')),
  image: defineAsyncComponent(() => import('@/views/plan/blocks/ImageBlock.vue')),
  video: defineAsyncComponent(() => import('@/views/plan/blocks/VideoBlock.vue')),
  audio: defineAsyncComponent(() => import('@/views/plan/blocks/AudioBlock.vue')),
  quote: defineAsyncComponent(() => import('@/views/plan/blocks/QuoteBlock.vue')),
  callout: defineAsyncComponent(() => import('@/views/plan/blocks/CalloutBlock.vue')),
  code: defineAsyncComponent(() => import('@/views/plan/blocks/CodeBlock.vue')),
  file: defineAsyncComponent(() => import('@/views/plan/blocks/FileBlock.vue')),
  bookmark: defineAsyncComponent(() => import('@/views/plan/blocks/BookmarkBlock.vue')),
  table: defineAsyncComponent(() => import('@/views/plan/blocks/TableBlock.vue')),
  list: defineAsyncComponent(() => import('@/views/plan/blocks/ListBlock.vue')),
  columns: defineAsyncComponent(() => import('@/views/plan/blocks/ColumnsBlock.vue')),
  database: defineAsyncComponent(() => import('@/views/plan/blocks/DatabaseViewBlock.vue')),
  toc: defineAsyncComponent(() => import('@/views/plan/blocks/TableOfContentsBlock.vue')),
  button: defineAsyncComponent(() => import('@/views/plan/blocks/ButtonBlock.vue')),
  breadcrumb: defineAsyncComponent(() => import('@/views/plan/blocks/BreadcrumbBlock.vue')),
  equation: defineAsyncComponent(() => import('@/views/plan/blocks/EquationBlock.vue')),
  formula: defineAsyncComponent(() => import('@/views/plan/blocks/EquationBlock.vue')),
  template_button: defineAsyncComponent(() => import('@/views/plan/blocks/TemplateButtonBlock.vue')),
  synced_block: defineAsyncComponent(() => import('@/views/plan/blocks/SyncedBlock.vue')),
  embed: defineAsyncComponent(() => import('@/views/plan/blocks/EmbedBlock.vue'))
}

const createBlockContent = (type) => ({
  heading: { text: '', level: 1 },
  text: { text: '' },
  page: { title: '子页面', summary: '', pageId: null, icon: 'P' },
  todo: { text: '', done: false },
  toggle: { title: '', text: '', open: true },
  collapse: { title: '', text: '', open: true },
  divider: { style: 'solid' },
  link_page: { pageId: '', pageTitle: '', note: '' },
  image: { url: '', alt: '', displayStyle: 'full-width' },
  video: { url: '', title: '', mimeType: '' },
  audio: { url: '', title: '', mimeType: '' },
  quote: { text: '' },
  callout: { text: '', variant: 'info' },
  code: { lang: 'javascript', code: '' },
  file: { url: '', name: '', caption: '', size: 0, mimeType: '' },
  bookmark: { url: '', title: '', description: '' },
  table: { headers: ['列 1', '列 2'], rows: [['', '']] },
  list: { listType: 'unordered', items: ['列表项 1', '列表项 2'] },
  columns: { cols: 2, columns: [[], []] },
  database: { title: '数据库', viewType: 'table', rows: [{ id: '1', title: '条目 1', status: '未开始', date: '', note: '' }] },
  toc: { title: '目录' },
  button: { label: '按钮', url: '', style: 'primary' },
  breadcrumb: { rootLabel: '首页', currentLabel: '' },
  equation: { latex: '' },
  formula: { latex: '' },
  template_button: { label: '插入模板', template: 'meeting' },
  synced_block: { syncKey: '', role: 'source', text: '' },
  embed: { variant: 'embed', url: '', title: '' }
}[type] || { text: '' })

const commandItems = [
  { key: 'text', category: '文本', type: 'text', icon: 'TXT', label: 'Text', description: '普通正文段落', tags: ['文本', 'paragraph', 'text'] },
  { key: 'page', category: '文本', type: 'page', icon: 'PAGE', label: 'Page', description: '插入一个子页面块', tags: ['页面', 'subpage'] },
  { key: 'todo', category: '文本', type: 'todo', icon: 'TODO', label: 'To-do list', description: '可勾选的待办清单', tags: ['待办', 'task', 'checkbox'] },
  { key: 'heading-1', category: '文本', type: 'heading', icon: 'H1', label: 'Heading 1', description: '一级标题', tags: ['标题', 'h1'], createContent: () => ({ text: '', level: 1 }) },
  { key: 'heading-2', category: '文本', type: 'heading', icon: 'H2', label: 'Heading 2', description: '二级标题', tags: ['标题', 'h2'], createContent: () => ({ text: '', level: 2 }) },
  { key: 'heading-3', category: '文本', type: 'heading', icon: 'H3', label: 'Heading 3', description: '三级标题', tags: ['标题', 'h3'], createContent: () => ({ text: '', level: 3 }) },
  { key: 'bulleted-list', category: '文本', type: 'list', icon: 'UL', label: 'Bulleted list', description: '项目符号列表', tags: ['bullet', '项目列表'], createContent: () => ({ listType: 'unordered', items: ['列表项 1'] }) },
  { key: 'numbered-list', category: '文本', type: 'list', icon: 'OL', label: 'Numbered list', description: '编号列表', tags: ['ordered', '编号列表'], createContent: () => ({ listType: 'ordered', items: ['列表项 1'] }) },
  { key: 'toggle', category: '文本', type: 'toggle', icon: 'TOG', label: 'Toggle list', description: '可折叠内容块', tags: ['toggle', '折叠'] },
  { key: 'quote', category: '文本', type: 'quote', icon: 'QTE', label: 'Quote', description: '引用说明块', tags: ['quote', '引用'] },
  { key: 'divider', category: '文本', type: 'divider', icon: '---', label: 'Divider', description: '插入分割线', tags: ['divider', '分割线'] },
  { key: 'link-page', category: '文本', type: 'link_page', icon: 'LINK', label: 'Link to page', description: '链接到其他页面', tags: ['页面链接', 'link'] },
  { key: 'callout', category: '文本', type: 'callout', icon: 'NOTE', label: 'Callout', description: '重点标注块', tags: ['callout', '提示块'] },

  { key: 'image', category: '媒体', type: 'image', icon: 'IMG', label: 'Image', description: '图片块', tags: ['图片', 'image'] },
  { key: 'video', category: '媒体', type: 'video', icon: 'VID', label: 'Video', description: '视频块', tags: ['视频', 'video'] },
  { key: 'audio', category: '媒体', type: 'audio', icon: 'AUD', label: 'Audio', description: '音频块', tags: ['音频', 'audio'] },
  { key: 'code', category: '媒体', type: 'code', icon: 'CODE', label: 'Code', description: '代码块', tags: ['代码', 'snippet'] },
  { key: 'file', category: '媒体', type: 'file', icon: 'FILE', label: 'File', description: '通用文件附件', tags: ['文件', 'attachment'] },
  { key: 'bookmark', category: '媒体', type: 'bookmark', icon: 'WEB', label: 'Web bookmark', description: '网页书签卡片', tags: ['书签', 'bookmark', 'web'] },

  { key: 'db-table', category: '数据库', type: 'database', icon: 'DB', label: 'Table', description: '表格视图数据库', tags: ['database', 'table'], createContent: () => ({ ...createBlockContent('database'), viewType: 'table' }) },
  { key: 'db-board', category: '数据库', type: 'database', icon: 'KAN', label: 'Board', description: '看板视图数据库', tags: ['database', 'board', 'kanban'], createContent: () => ({ ...createBlockContent('database'), viewType: 'board' }) },
  { key: 'db-gallery', category: '数据库', type: 'database', icon: 'GAL', label: 'Gallery', description: '画廊视图数据库', tags: ['database', 'gallery'], createContent: () => ({ ...createBlockContent('database'), viewType: 'gallery' }) },
  { key: 'db-list', category: '数据库', type: 'database', icon: 'LST', label: 'List', description: '列表视图数据库', tags: ['database', 'list'], createContent: () => ({ ...createBlockContent('database'), viewType: 'list' }) },
  { key: 'db-calendar', category: '数据库', type: 'database', icon: 'CAL', label: 'Calendar', description: '日历视图数据库', tags: ['database', 'calendar'], createContent: () => ({ ...createBlockContent('database'), viewType: 'calendar' }) },
  { key: 'db-timeline', category: '数据库', type: 'database', icon: 'TL', label: 'Timeline', description: '时间轴视图数据库', tags: ['database', 'timeline'], createContent: () => ({ ...createBlockContent('database'), viewType: 'timeline' }) },

  { key: 'toc', category: '高级', type: 'toc', icon: 'TOC', label: 'Table of contents', description: '自动目录', tags: ['目录', 'toc'] },
  { key: 'button', category: '高级', type: 'button', icon: 'BTN', label: 'Button', description: '操作按钮块', tags: ['按钮', 'button'] },
  { key: 'breadcrumb', category: '高级', type: 'breadcrumb', icon: 'BC', label: 'Breadcrumb', description: '面包屑导航', tags: ['breadcrumb', '导航'] },
  { key: 'equation', category: '高级', type: 'equation', icon: 'EQ', label: 'Equation', description: '公式块', tags: ['公式', 'equation', 'latex'] },
  { key: 'template-button', category: '高级', type: 'template_button', icon: 'TPL', label: 'Template button', description: '一键插入模板', tags: ['模板按钮', 'template'] },
  { key: 'synced-block', category: '高级', type: 'synced_block', icon: 'SYNC', label: 'Synced block', description: '同步块', tags: ['同步块', 'sync'] },

  { key: 'embed', category: '嵌入', type: 'embed', icon: 'EMB', label: 'Embed', description: '嵌入网页或服务', tags: ['嵌入', 'embed'], createContent: () => ({ variant: 'embed', url: '', title: '' }) },
  { key: 'google-drive', category: '嵌入', type: 'embed', icon: 'DRV', label: 'Google Drive', description: '嵌入云端文件', tags: ['drive', 'google drive'], createContent: () => ({ variant: 'google_drive', url: '', title: 'Google Drive' }) },
  { key: 'tweet', category: '嵌入', type: 'embed', icon: 'TWT', label: 'Tweet', description: '嵌入社交动态', tags: ['tweet', 'twitter'], createContent: () => ({ variant: 'tweet', url: '', title: 'Tweet' }) },
  { key: 'gist', category: '嵌入', type: 'embed', icon: 'GST', label: 'GitHub Gist', description: '嵌入代码片段', tags: ['gist', 'github gist'], createContent: () => ({ variant: 'github_gist', url: '', title: 'GitHub Gist' }) },
  { key: 'maps', category: '嵌入', type: 'embed', icon: 'MAP', label: 'Maps', description: '嵌入地图', tags: ['maps', 'map'], createContent: () => ({ variant: 'maps', url: '', title: 'Maps' }) }
]

const inlineFormatAllowedFields = ['text', 'title', 'summary', 'pageTitle', 'note', 'label', 'rootLabel', 'currentLabel']

const inlineAiFieldMap = {
  heading: 'text',
  text: 'text',
  todo: 'text',
  quote: 'text',
  callout: 'text',
  code: 'code',
  page: 'title',
  toggle: 'title',
  collapse: 'title',
  link_page: 'pageTitle',
  list: 'items',
  button: 'label',
  breadcrumb: 'rootLabel',
  equation: 'latex',
  formula: 'latex',
  synced_block: 'text'
}

const getAiCooldownRemaining = (action) => {
  const until = Number(aiActionCooldownUntil.value[action] || 0)
  return Math.max(0, Math.ceil((until - aiCooldownTick.value) / 1000))
}

const isAiCoolingDown = (action) => getAiCooldownRemaining(action) > 0

const startAiCooldown = (action, seconds = 12) => {
  aiActionCooldownUntil.value = {
    ...aiActionCooldownUntil.value,
    [action]: Date.now() + (seconds * 1000)
  }
}

const maybeStartAiCooldown = (action, response, seconds = 12) => {
  const message = `${response?.error || ''} ${response?.message || ''}`
  if (response?.code === 429 || /频繁|过于频繁|rate limit|too many requests/i.test(message)) {
    startAiCooldown(action, seconds)
    return true
  }
  return false
}

const getAiActionButtonText = (action, idleText, loading, loadingText = '处理中...') => {
  if (loading) return loadingText
  const cooldown = getAiCooldownRemaining(action)
  return cooldown > 0 ? `${cooldown}s 后再试` : idleText
}

const normalizeAiModelOption = (item) => {
  const value = String(item?.id || item?.value || item?.name || item || '').trim()
  if (!value) return null
  return {
    value,
    label: String(item?.name || item?.label || value).trim()
  }
}

const applyAiModelOptions = (items = []) => {
  const options = (Array.isArray(items) ? items : [])
    .map(normalizeAiModelOption)
    .filter(Boolean)

  aiMediaModelOptions.value = options
  const firstImageModel = options.find((item) => /image|img|draw|vision/i.test(item.value)) || options[0]
  const firstVideoModel = options.find((item) => /video|wan|kling|runway|sora/i.test(item.value)) || options[0]
  if (!aiSelectedModel.value && workspaceAiStore.normalizedSelectedModel) {
    aiSelectedModel.value = workspaceAiStore.normalizedSelectedModel
  }
  if (!aiSelectedModel.value && options[0]?.value) aiSelectedModel.value = options[0].value
  if (!aiImageModel.value && firstImageModel?.value) aiImageModel.value = firstImageModel.value
  if (!aiVideoModel.value && firstVideoModel?.value) aiVideoModel.value = firstVideoModel.value
  if (!options.length) aiMediaModelError.value = '上游未返回模型列表。'
  return options
}

const loadAiModelsFallback = async () => {
  const providersResponse = await listAiProviders()
  if (!providersResponse?.success) throw new Error(providersResponse?.error || 'Mentor-X 模型引擎配置读取失败')
  const providers = Array.isArray(providersResponse.data?.providers) ? providersResponse.data.providers : []
  const providerId = workspaceAiStore.hasExplicitSelection ? String(workspaceAiStore.normalizedSelectedProviderId) : ''
  const provider = providerId
    ? providers.find((item) => String(item.id) === providerId && item.status === 'active')
    : providers.find((item) => item.is_default && item.status === 'active') || providers.find((item) => item.status === 'active')
  if (!provider?.id) throw new Error('尚未配置 Mentor-X 的模型引擎')
  const response = await listAiProviderModels({ id: provider.id })
  if (!response?.success) throw new Error(response?.error || '模型列表获取失败')
  workspaceAiStore.setModelOptions?.(response.data?.models || [], provider.id)
  return response.data?.models || []
}

const aiImageModelOptions = computed(() => aiMediaModelOptions.value)
const aiVideoModelOptions = computed(() => aiMediaModelOptions.value)
const aiModelOptions = computed(() => aiMediaModelOptions.value)
const aiMediaModelHint = computed(() => {
  if (aiMediaModelsLoading.value) return '正在读取当前模型引擎模型列表...'
  if (aiMediaModelError.value) return aiMediaModelError.value
  if (aiMediaModelOptions.value.length) return '模型来自当前默认引擎。'
  return '尚未读取到模型列表。'
})

const runWhenIdle = (task, delay = 0) => {
  if (typeof window === 'undefined') {
    void task()
    return
  }

  window.setTimeout(() => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => void task(), { timeout: 1800 })
      return
    }
    void task()
  }, delay)
}

const ensureAiMediaModelsLoaded = async ({ force = false } = {}) => {
  if (aiMediaModelsLoading.value) return
  if (!force && aiMediaModelOptions.value.length) return

  const cachedOptions = Array.isArray(workspaceAiStore.modelOptions) ? workspaceAiStore.modelOptions : []
  if (!force && cachedOptions.length) {
    applyAiModelOptions(cachedOptions)
    return
  }

  aiMediaModelsLoading.value = true
  aiMediaModelError.value = ''

  try {
    const loadedOptions = typeof workspaceAiStore.loadModelOptions === 'function'
      ? await workspaceAiStore.loadModelOptions({ force })
      : await loadAiModelsFallback()
    applyAiModelOptions(loadedOptions)
  } catch (err) {
    aiMediaModelError.value = err.message || '模型列表获取失败。'
  } finally {
    aiMediaModelsLoading.value = false
  }
}

const aiImageSizeOptions = [
  '1024x1024',
  '1024x1536',
  '1536x1024',
  '2048x2048'
]

const aiImageRatioOptions = ['1:1', '3:2', '2:3', '16:9', '9:16']

const aiVideoResolutionOptions = [
  { label: '竖版 720x1280', width: 720, height: 1280 },
  { label: '横版 1280x720', width: 1280, height: 720 },
  { label: '方形 1024x1024', width: 1024, height: 1024 }
]

const cloneContent = (value) => JSON.parse(JSON.stringify(value ?? null))
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getBlockTextContent = (block) => {
  const content = block?.content || {}
  switch (block?.type) {
    case 'heading':
    case 'text':
    case 'todo':
    case 'quote':
    case 'callout':
      return content.text || ''
    case 'page':
      return [content.title, content.summary].filter(Boolean).join('\n')
    case 'toggle':
    case 'collapse':
      return [content.title, content.text].filter(Boolean).join('\n')
    case 'link_page':
      return [content.pageTitle, content.note].filter(Boolean).join('\n')
    case 'code':
      return content.code || ''
    case 'file':
      return [content.name, content.caption].filter(Boolean).join('\n')
    case 'bookmark':
      return [content.title, content.description, content.url].filter(Boolean).join('\n')
    case 'list':
      return Array.isArray(content.items) ? content.items.join('\n') : ''
    case 'table': {
      const headers = Array.isArray(content.headers) ? content.headers.join(', ') : ''
      const rows = Array.isArray(content.rows) ? content.rows.map((row) => row.join(', ')).join('\n') : ''
      return [headers, rows].filter(Boolean).join('\n')
    }
    case 'columns':
      return Array.isArray(content.columns)
        ? content.columns
            .map((column) => Array.isArray(column) ? column.join('\n') : String(column || ''))
            .filter(Boolean)
            .join('\n')
        : ''
    case 'database':
      return Array.isArray(content.rows) ? content.rows.map((row) => row.title || '').join('\n') : ''
    case 'equation':
    case 'formula':
      return content.latex || ''
    case 'button':
      return [content.label, content.url].filter(Boolean).join(' ')
    case 'breadcrumb':
      return [content.rootLabel, content.currentLabel || title.value].filter(Boolean).join(' / ')
    case 'synced_block':
      return content.text || ''
    case 'embed':
      return [content.title, content.url].filter(Boolean).join(' ')
    case 'image':
      return content.alt || ''
    default:
      return content.text || ''
  }
}

const blockTypeLabel = (type) => ({
  heading: '标题',
  text: '文本',
  todo: '待办',
  list: '列表',
  quote: '引用',
  callout: '标注',
  page: '子页面',
  toggle: '折叠列表',
  collapse: '折叠列表',
  link_page: '页面链接',
  image: '图片',
  video: '视频',
  audio: '音频',
  code: '代码',
  file: '文件',
  bookmark: '网页书签',
  table: '表格',
  columns: '多列',
  database: '数据库视图',
  equation: '公式',
  formula: '公式',
  button: '按钮',
  breadcrumb: '面包屑',
  synced_block: '同步块',
  embed: '嵌入'
}[type] || '计划块')

const getBlockById = (blockId) => blocks.value.find((block) => String(block.id) === String(blockId)) || null

const getBlockIndexById = (blockId) => blocks.value.findIndex((block) => String(block.id) === String(blockId))

const supportsInlineAi = (block) => !!inlineAiFieldMap[block?.type]

const createInlineAiTarget = (block, context = {}) => {
  const itemIndex = Number.isInteger(context?.itemIndex)
    ? context.itemIndex
    : (Number.isFinite(Number(context?.itemIndex)) ? Number(context.itemIndex) : null)

  return {
    fieldKey: context?.fieldKey || inlineAiFieldMap[block?.type] || 'text',
    itemIndex
  }
}

const getInlineAiEditableText = (block, context = {}) => {
  if (!block || !supportsInlineAi(block)) return ''
  const content = block.content || {}
  const target = createInlineAiTarget(block, context)

  switch (block.type) {
    case 'list':
      if (target.fieldKey === 'items' && Number.isInteger(target.itemIndex)) {
        return String((Array.isArray(content.items) ? content.items[target.itemIndex] : '') || '')
      }
      return Array.isArray(content.items) ? content.items.join('\n') : ''
    case 'page':
      return String(content[target.fieldKey === 'summary' ? 'summary' : 'title'] || '')
    case 'toggle':
    case 'collapse':
      return String(content[target.fieldKey === 'text' ? 'text' : 'title'] || '')
    case 'link_page':
      return String(content[target.fieldKey === 'note' ? 'note' : 'pageTitle'] || '')
    case 'button':
      return String(content[target.fieldKey === 'url' ? 'url' : 'label'] || '')
    case 'breadcrumb':
      return String(content[target.fieldKey === 'currentLabel' ? 'currentLabel' : 'rootLabel'] || '')
    case 'equation':
    case 'formula':
      return String(content.latex || '')
    case 'synced_block':
      return String(content[target.fieldKey === 'syncKey' ? 'syncKey' : 'text'] || '')
    default:
      return String(content[target.fieldKey] || '')
  }
}

const buildInlineAiPreviewText = (value, emptyFallback = '当前块为空，先写一点内容再调用 AI。') => {
  const text = String(value || '').trim()
  if (!text) return emptyFallback
  return text.length > 140 ? `${text.slice(0, 140)}...` : text
}

const getInlineAiOutlineLabel = (block) => {
  const typeLabels = {
    heading: '标题',
    text: '文本',
    todo: '待办',
    list: '列表',
    table: '表格',
    callout: '标注',
    quote: '引用',
    code: '代码'
  }
  return typeLabels[block?.type] || '数据库'
}

const getInlineAiOutlinePreview = (block) => buildInlineAiPreviewText(getBlockTextContent(block), '这个块暂时没有可预览内容。')

const normalizeTodoItems = (text = '') => {
  return String(text || '')
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)]|[\u2610\u2611])\s*/, '').trim())
    .filter(Boolean)
}

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result || ''))
  reader.onerror = () => reject(new Error('读取文件失败'))
  reader.readAsDataURL(file)
})

const normalizeMediaLabel = (fileName = '') => fileName || `素材-${Date.now()}`
const isPublicHttpUrl = (value = '') => /^https?:\/\//i.test(String(value || '').trim())
const isProviderReachableHttpUrl = (value = '') => {
  const trimmed = String(value || '').trim()
  if (!isPublicHttpUrl(trimmed)) return false

  try {
    const { hostname } = new URL(trimmed)
    if (!hostname) return false
    if (/^(localhost|127\.)/i.test(hostname)) return false
    if (/^10\./.test(hostname)) return false
    if (/^192\.168\./.test(hostname)) return false
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return false
    if (/^\[?::1\]?$/.test(hostname)) return false
    return true
  } catch (error) {
    return false
  }
}
const createRemoteMediaSource = (url, name = '', options = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: normalizeMediaLabel(name || `参考图-${Date.now()}`),
  previewUrl: String(options.previewUrl || url || '').trim(),
  remoteUrl: String(url || '').trim(),
  absoluteUrl: String(options.absoluteUrl || options.previewUrl || url || '').trim(),
  isPublic: options.isPublic !== false
})

const clearAiImagePolling = () => {
  if (aiImagePollingTimer.value) {
    window.clearInterval(aiImagePollingTimer.value)
    aiImagePollingTimer.value = null
  }
}

const clearAiVideoPolling = () => {
  if (aiVideoPollingTimer.value) {
    window.clearInterval(aiVideoPollingTimer.value)
    aiVideoPollingTimer.value = null
  }
}

const insertGeneratedImageBlock = async (item) => {
  const url = item?.previewUrl || item?.url
  if (!url) return
  const anchorIndex = activeBlock.value
    ? blocks.value.findIndex((block) => block.id === activeBlock.value.id)
    : blocks.value.length - 1
  await insertBlocksAfter(anchorIndex, [{
    type: 'image',
    content: {
      url,
      alt: aiImagePrompt.value.trim() || 'AI 生成图片',
      displayStyle: 'full-width'
    }
  }])
  showSuccess('图片已插入当前计划')
}

const insertGeneratedVideoBlock = async (video) => {
  const url = video?.url
  if (!url) return
  const anchorIndex = activeBlock.value
    ? blocks.value.findIndex((block) => block.id === activeBlock.value.id)
    : blocks.value.length - 1
  await insertBlocksAfter(anchorIndex, [{
    type: 'video',
    content: {
      url,
      title: aiVideoPrompt.value.trim() || 'AI 生成视频',
      mimeType: 'video/mp4'
    }
  }])
  showSuccess('视频已插入当前计划')
}

const scrollToBlock = async (blockId) => {
  await nextTick()
  const row = document.querySelector(`.plan-row[data-block-id="${String(blockId)}"]`)
  if (!row) return
  row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  activeBlockId.value = blockId
}

const getBlockEditor = (blockId, context = {}) => {
  const row = document.querySelector(`.plan-row[data-block-id="${String(blockId)}"]`)
  const fieldKey = context?.fieldKey || ''
  const itemIndex = Number.isInteger(context?.itemIndex) ? context.itemIndex : null

  if (row && fieldKey) {
    if (itemIndex !== null) {
      const indexed = row.querySelector(`[data-ai-field="${fieldKey}"][data-ai-item-index="${String(itemIndex)}"]`)
      if (indexed) return indexed
    }
    const fieldEditor = row.querySelector(`[data-ai-field="${fieldKey}"]`)
    if (fieldEditor) return fieldEditor
  }

  return row?.querySelector('textarea, input, [contenteditable="true"]') || null
}

const focusBlockRange = async (blockId, start = 0, end = start, context = {}) => {
  await nextTick()
  const editor = getBlockEditor(blockId, context)
  editor?.focus?.()
  if (typeof editor?.__setSelectionRange === 'function') {
    editor.__setSelectionRange(start, end)
    return
  }
  if (typeof editor?.setSelectionRange === 'function') {
    editor.setSelectionRange(start, end)
  }
}

const setInlineAiEditableText = async (block, nextText, selectionStart = null, selectionEnd = selectionStart, context = {}) => {
  if (!block || !supportsInlineAi(block)) return false
  const current = cloneContent(block.content) || createBlockContent(block.type)
  const field = context.fieldKey || inlineAiFieldMap[block.type]
  let nextContent = current

  if (block.type === 'list') {
    const items = Array.isArray(current.items) ? [...current.items] : []
    if (Number.isInteger(context.itemIndex) && context.itemIndex >= 0) {
      items[context.itemIndex] = String(nextText || '')
    } else {
      const listItems = String(nextText || '').split('\n').map((line) => line.trim()).filter(Boolean)
      nextContent = {
        ...current,
        items: listItems.length ? listItems : items.length ? items : ['']
      }
    }
    if (!nextContent.items) {
      nextContent = { ...current, items: items.length ? items : [''] }
    }
  } else {
    nextContent = {
      ...current,
      [field]: String(nextText || '')
    }
  }

  updateBlockContent(block, nextContent)
  if (selectionStart !== null) {
    await focusBlockRange(block.id, selectionStart, selectionEnd ?? selectionStart, context)
  }
  return true
}

const closeInlineAiToolbar = () => {
  inlineAiToolbar.value = {
    show: false,
    blockId: null,
    fieldKey: '',
    itemIndex: null,
    top: 0,
    left: 0,
    rangeStart: 0,
    rangeEnd: 0,
    hasSelection: false,
    selectedText: '',
    sourceText: ''
  }
}

const closeInlineFormatToolbar = () => {
  inlineFormatToolbar.value = {
    show: false,
    blockId: null,
    fieldKey: '',
    itemIndex: null,
    top: 0,
    left: 0,
    rangeStart: 0,
    rangeEnd: 0,
    hasSelection: false,
    selectedText: '',
    sourceText: '',
    marks: {
      bold: false,
      italic: false,
      code: false,
      strike: false,
      highlight: false,
      link: false
    }
  }
}

const isTextBlockEditable = (element) => !!element?.closest?.('.text-block')

const supportsInlineFormatContext = (context, element) => {
  if (!context?.blockId) return false
  if (isTextBlockEditable(element)) return false
  return inlineFormatAllowedFields.includes(context.fieldKey || '')
}

const isWrappedSelection = (value, start, end, leftToken, rightToken = leftToken) => {
  if (start < leftToken.length || end + rightToken.length > value.length) return false
  return value.slice(start - leftToken.length, start) === leftToken
    && value.slice(end, end + rightToken.length) === rightToken
}

const isWrappedCursor = (value, cursor, leftToken, rightToken = leftToken) => {
  if (cursor < leftToken.length || cursor + rightToken.length > value.length) return false
  return value.slice(cursor - leftToken.length, cursor) === leftToken
    && value.slice(cursor, cursor + rightToken.length) === rightToken
}

const getInlineFormatMarks = (value = '', start = 0, end = 0) => {
  const text = String(value || '')
  const collapsed = start === end
  const wrapped = (leftToken, rightToken = leftToken) => (
    collapsed
      ? isWrappedCursor(text, start, leftToken, rightToken)
      : isWrappedSelection(text, start, end, leftToken, rightToken)
  )

  const segment = start === end ? '' : text.slice(start, end)
  const linkWrapped = collapsed
    ? /\[[^\]]*\]\((https?:\/\/|mailto:)[^)]*\)$/i.test(text.slice(0, start))
    : /^\[[\s\S]+\]\((https?:\/\/|mailto:)[^)]*\)$/i.test(segment)

  return {
    bold: wrapped('**'),
    italic: wrapped('*'),
    code: wrapped('`'),
    strike: wrapped('~~'),
    highlight: wrapped('=='),
    link: linkWrapped
  }
}

const buildInlineAiContextFromElement = (element, options = {}) => {
  const { allowCollapsed = true } = options
  if (!element?.closest) return null

  const row = element.closest('.plan-row')
  if (!row) return null

  const block = getBlockById(row.dataset.blockId)
  if (!supportsInlineAi(block)) return null

  const fieldKey = element.dataset?.aiField || inlineAiFieldMap[block.type] || 'text'
  const itemIndex = Number.isFinite(Number(element.dataset?.aiItemIndex)) ? Number(element.dataset.aiItemIndex) : null

  const value = typeof element.__getPlainText === 'function'
    ? element.__getPlainText()
    : (typeof element.value === 'string' ? element.value : getInlineAiEditableText(block, { fieldKey, itemIndex }))
  const selection = typeof element.__getSelectionRange === 'function'
    ? element.__getSelectionRange()
    : {
        start: Number.isInteger(element.selectionStart) ? element.selectionStart : value.length,
        end: Number.isInteger(element.selectionEnd) ? element.selectionEnd : value.length
      }
  const rangeStart = selection.start
  const rangeEnd = selection.end
  const hasSelection = rangeEnd > rangeStart

  if (!allowCollapsed && !hasSelection) return null

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + (rect.width / 2)

  return {
    blockId: block.id,
    fieldKey,
    itemIndex,
    sourceText: value,
    selectedText: hasSelection ? value.slice(rangeStart, rangeEnd) : '',
    hasSelection,
    rangeStart,
    rangeEnd,
    top: Math.max(16, rect.top - 44),
    left: clamp(centerX, 140, window.innerWidth - 140)
  }
}

const buildInlineFormatContextFromElement = (element, options = {}) => {
  const context = buildInlineAiContextFromElement(element, options)
  if (!context || !supportsInlineFormatContext(context, element)) return null

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + (rect.width / 2)

  return {
    ...context,
    top: Math.max(58, rect.top + 2),
    left: clamp(centerX, 140, window.innerWidth - 140),
    marks: getInlineFormatMarks(context.sourceText, context.rangeStart, context.rangeEnd)
  }
}

const refreshInlineAiToolbar = () => {
  if (aiComposer.value.show) {
    closeInlineAiToolbar()
    return
  }

  const activeElement = document.activeElement
  const context = buildInlineAiContextFromElement(activeElement, { allowCollapsed: true })
  if (!context) {
    closeInlineAiToolbar()
    return
  }

  inlineAiToolbar.value = {
    show: true,
    fieldKey: context.fieldKey || '',
    itemIndex: Number.isInteger(context.itemIndex) ? context.itemIndex : null,
    ...context
  }
}

const refreshInlineFormatToolbar = () => {
  if (aiComposer.value.show) {
    closeInlineFormatToolbar()
    return
  }

  const activeElement = document.activeElement
  const context = buildInlineFormatContextFromElement(activeElement, { allowCollapsed: true })
  if (!context) {
    closeInlineFormatToolbar()
    return
  }

  inlineFormatToolbar.value = {
    show: true,
    fieldKey: context.fieldKey || '',
    itemIndex: Number.isInteger(context.itemIndex) ? context.itemIndex : null,
    ...context
  }
}

const handleBlockFocus = (blockId) => {
  activeBlockId.value = blockId
  window.setTimeout(() => {
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }, 0)
}

const applyWrappedTextFormat = async (leftToken, rightToken = leftToken) => {
  const activeElement = document.activeElement
  const context = buildInlineFormatContextFromElement(activeElement, { allowCollapsed: true })
  if (!context?.blockId) return

  const block = getBlockById(context.blockId)
  if (!block) return

  const currentText = String(context.sourceText || '')
  const start = context.rangeStart || 0
  const end = context.rangeEnd || 0

  let nextText = currentText
  let nextStart = start
  let nextEnd = end

  if (start === end) {
    if (isWrappedCursor(currentText, start, leftToken, rightToken)) {
      nextText = `${currentText.slice(0, start - leftToken.length)}${currentText.slice(start + rightToken.length)}`
      nextStart = Math.max(0, start - leftToken.length)
      nextEnd = nextStart
    } else {
      nextText = `${currentText.slice(0, start)}${leftToken}${rightToken}${currentText.slice(end)}`
      nextStart = start + leftToken.length
      nextEnd = nextStart
    }
  } else if (isWrappedSelection(currentText, start, end, leftToken, rightToken)) {
    nextText = `${currentText.slice(0, start - leftToken.length)}${currentText.slice(start, end)}${currentText.slice(end + rightToken.length)}`
    nextStart = start - leftToken.length
    nextEnd = end - leftToken.length
  } else {
    nextText = `${currentText.slice(0, start)}${leftToken}${currentText.slice(start, end)}${rightToken}${currentText.slice(end)}`
    nextStart = start + leftToken.length
    nextEnd = end + leftToken.length
  }

  await setInlineAiEditableText(block, nextText, nextStart, nextEnd, context)
  await nextTick()
  refreshInlineFormatToolbar()
  refreshInlineAiToolbar()
}

const applyLinkTextFormat = async () => {
  const activeElement = document.activeElement
  const context = buildInlineFormatContextFromElement(activeElement, { allowCollapsed: true })
  if (!context?.blockId) return

  const block = getBlockById(context.blockId)
  if (!block) return

  const url = window.prompt('请输入链接地址', 'https://')
  if (!url) return

  const normalizedUrl = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`
  const currentText = String(context.sourceText || '')
  const start = context.rangeStart || 0
  const end = context.rangeEnd || 0
  const selected = currentText.slice(start, end)
  const label = window.prompt('请输入链接显示名称', selected || '链接文本')
  if (label === null) return
  const linkLabel = label.trim() || selected || normalizedUrl
  const linkText = `[${linkLabel}](${normalizedUrl})`
  const nextText = `${currentText.slice(0, start)}${linkText}${currentText.slice(end)}`
  const cursor = start + linkText.length

  await setInlineAiEditableText(block, nextText, cursor, cursor, context)
  await nextTick()
  refreshInlineFormatToolbar()
  refreshInlineAiToolbar()
}
const applyInlineFormat = async (action) => {
  switch (action) {
    case 'bold':
      await applyWrappedTextFormat('**')
      return
    case 'italic':
      await applyWrappedTextFormat('*')
      return
    case 'code':
      await applyWrappedTextFormat('`')
      return
    case 'strike':
      await applyWrappedTextFormat('~~')
      return
    case 'highlight':
      await applyWrappedTextFormat('==')
      return
    case 'link':
      await applyLinkTextFormat()
      return
    case 'ai':
      openAiComposer({ ...inlineFormatToolbar.value })
      return
    default:
  }
}

const summarizeBlocksForAi = (limit = 24) => {
  return blocks.value.slice(0, limit).map((block, index) => ({
    id: block.id,
    type: block.type,
    order: block.order || index + 1,
    summary: getBlockTextContent(block).slice(0, 240)
  }))
}

const activeBlock = computed(() => {
  if (!blocks.value.length) return null
  return blocks.value.find((block) => block.id === activeBlockId.value) || blocks.value[0] || null
})

const scheduleStatusLabel = (status) => ({
  scheduled: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  skipped: '已跳过'
}[status] || '待开始')

const selectedBlockCount = computed(() => selectedBlockIds.value.size)
const scheduledPlanBlockIds = computed(() => new Set(
  scheduleBlocks.value
    .filter((item) => item.plan_block_id || item.planBlockId)
    .map((item) => String(item.plan_block_id || item.planBlockId))
))
const unscheduledBlocks = computed(() => blocks.value.filter((block) => {
  if (!block?.id || String(block.id).startsWith('temp-')) return false
  if (scheduledPlanBlockIds.value.has(String(block.id))) return false
  return Boolean(getBlockTextContent(block).trim())
}))
const unscheduledTypeOptions = computed(() => {
  const map = new Map()
  unscheduledBlocks.value.forEach((block) => {
    if (!block?.type || map.has(block.type)) return
    map.set(block.type, blockTypeLabel(block.type))
  })
  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))
})
const filteredUnscheduledBlocks = computed(() => {
  const query = unscheduledSearch.value.trim().toLowerCase()
  return unscheduledBlocks.value.filter((block) => {
    if (unscheduledTypeFilter.value !== 'all' && block.type !== unscheduledTypeFilter.value) return false
    if (!query) return true
    const text = [getBlockTextContent(block), blockTypeLabel(block.type)].join(' ').toLowerCase()
    return text.includes(query)
  })
})
const unscheduledEmptyText = computed(() => {
  if (unscheduledBlocks.value.length && !filteredUnscheduledBlocks.value.length) {
    return '当前筛选条件下没有待安排计划块，可以清空搜索或切回全部类型。'
  }
  return '当前计划块都已经安排好了。你可以回到编辑器继续拆解下一步，或到今日工作台查看执行项。'
})

const aiWorkspaceState = reactive({
  aiPanel,
  aiChatMessages, aiChatDraft, aiChatLoading, aiSelectedModel, aiModelOptions,
  aiConversations, aiConversationId, aiConversationLoading, aiConversationSaving,
  aiConversationContextExpanded,
  aiMediaModelsLoading, aiMediaModelError,
  aiImageMode, aiImageModel, aiImageModelOptions, aiMediaModelHint, aiImageSize, aiImageSizeOptions,
  aiImageRatio, aiImageRatioOptions, aiImagePrompt, aiImageNegativePrompt, aiImageSources,
  aiImageLoading, aiImageResult, aiImageHistoryLoading, aiImageHistory, aiImageDeletingTaskId,
  aiVideoMode, aiVideoModel, aiVideoModelOptions, aiVideoPrompt, aiVideoNegativePrompt, aiVideoWidth,
  aiVideoHeight, aiVideoResolutionOptions, aiVideoFrames, aiVideoFrameRate, aiVideoSourceUrl,
  aiVideoSources, aiVideoSourceUploading, aiVideoSourceUploadProgress, aiVideoLoading, aiVideoResult,
  aiVideoHistoryLoading, aiVideoHistory, aiVideoDeletingTaskId
})

const aiConversationContext = computed(() => ({
  planTitle: title.value.trim() || '未命名计划',
  blockCount: blocks.value.length,
  model: aiSelectedModel.value || '未选择模型',
  blocks: summarizeBlocksForAi(8)
}))
aiWorkspaceState.aiConversationContext = aiConversationContext

const buildTableContentFromText = (text = '') => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return createBlockContent('table')

  const rows = lines.map((line) => line.split(/[,\t|]/).map((cell) => cell.trim()))
  const headers = rows.shift() || ['列 1', '列 2']
  const normalizedRows = rows.length ? rows : [new Array(headers.length || 2).fill('')]

  return {
    headers: headers.length ? headers : ['列 1', '列 2'],
    rows: normalizedRows.map((row) => {
      const width = Math.max(headers.length, row.length, 1)
      return Array.from({ length: width }, (_, index) => row[index] || '')
    })
  }
}

const migrateBlockContent = (block, targetType) => {
  const text = getBlockTextContent(block)
  const current = cloneContent(block?.content) || {}

  switch (targetType) {
    case 'heading':
      return { text, level: current.level || 1 }
    case 'text':
      return { text }
    case 'page':
      return { title: text || current.title || '子页面', summary: current.summary || '', pageId: current.pageId || null, icon: current.icon || 'P' }
    case 'todo':
      return { text, done: !!current.done }
    case 'toggle':
    case 'collapse':
      return { title: text || current.title || '', text: current.text || '', open: current.open ?? true }
    case 'quote':
      return { text }
    case 'callout':
      return { text, variant: current.variant || 'info' }
    case 'link_page':
      return { pageId: current.pageId || '', pageTitle: current.pageTitle || text || '', note: current.note || '' }
    case 'code':
      return { lang: current.lang || 'markdown', code: text }
    case 'file':
      return { url: current.url || '', name: current.name || text || '', caption: current.caption || '', size: current.size || 0, mimeType: current.mimeType || '' }
    case 'bookmark':
      return { url: current.url || '', title: current.title || text || '', description: current.description || '' }
    case 'list':
      return {
        listType: current.listType || 'unordered',
        items: text ? text.split('\n').map((line) => line.trim()).filter(Boolean) : ['列表项 1']
      }
    case 'table':
      return buildTableContentFromText(text)
    case 'columns':
      return {
        cols: current.cols || 2,
        columns: Array.from({ length: current.cols || 2 }, (_, index) => {
          if (index === 0 && text) return text.split('\n').map((line) => line.trim()).filter(Boolean)
          return Array.isArray(current.columns?.[index]) ? current.columns[index] : []
        })
      }
    case 'database':
      return {
        title: current.title || '数据库',
        viewType: current.viewType || 'table',
        rows: [{ id: `${Date.now()}`, title: text || '条目 1', status: '未开始', date: '', note: '' }]
      }
    case 'equation':
    case 'formula':
      return { latex: text }
    case 'button':
      return { label: text || current.label || '按钮', url: current.url || '', style: current.style || 'primary' }
    case 'breadcrumb':
      return { rootLabel: current.rootLabel || '首页', currentLabel: text || current.currentLabel || '' }
    case 'template_button':
      return { label: current.label || '插入模板', template: current.template || 'meeting' }
    case 'synced_block':
      return { syncKey: current.syncKey || '', role: current.role || 'source', text }
    case 'embed':
      return { variant: current.variant || 'embed', url: current.url || '', title: text || current.title || '' }
    case 'image':
      return {
        url: current.url || '',
        alt: current.alt || text,
        displayStyle: current.displayStyle || 'full-width'
      }
    default:
      return createBlockContent(targetType)
  }
}

const resolveBlock = (type) => blockComponents[type] || blockComponents.text

const statusLabel = computed(() => ({
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  archived: '已归档'
}[status.value] || '未开始'))

const priorityLabel = computed(() => ({
  low: '低优先级',
  medium: '中优先级',
  high: '高优先级'
}[priority.value] || '中优先级'))

const typeLabel = computed(() => ({
  project: '项目',
  task: '任务',
  goal: '目标',
  custom: customTypeName.value.trim() || '自定义'
}[planType.value] || '项目'))

const isCustomPlanType = computed(() => planType.value === 'custom')

const saveStatusText = computed(() => ({
  saved: '已保存',
  saving: '保存中',
  unsaved: '未保存',
  error: '保存失败'
}[saveStatus.value] || '已保存'))

const saveDotClass = computed(() => ({
  saved: 'bg-zinc-950 dark:bg-white',
  saving: 'bg-zinc-400',
  unsaved: 'bg-amber-500',
  error: 'bg-red-500'
}[saveStatus.value] || 'bg-zinc-500'))

const hasUnsavedChanges = computed(() => saveStatus.value !== 'saved' || pendingBlockIds.value.size > 0)

const filteredCommandItems = computed(() => {
  const query = commandMenu.value.query.trim().toLowerCase()
  if (!query) return commandItems
  return commandItems.filter((item) => {
    const searchText = [item.label, item.description, item.type, ...(item.tags || [])].join(' ').toLowerCase()
    return searchText.includes(query)
  })
})

const commandCategories = computed(() => {
  const sourceItems = filteredCommandItems.value
  const counts = sourceItems.reduce((map, item) => {
    map.set(item.category, (map.get(item.category) || 0) + 1)
    return map
  }, new Map())

  return [
    { key: 'all', label: '全部', count: sourceItems.length },
    ...Array.from(counts.entries()).map(([key, count]) => ({
      key,
      label: key,
      count
    }))
  ]
})

const visibleCommandItems = computed(() => {
  if (commandMenu.value.selectedCategory === 'all') {
    return filteredCommandItems.value
  }

  return filteredCommandItems.value.filter((item) => item.category === commandMenu.value.selectedCategory)
})

const totalCommandPages = computed(() => Math.max(1, Math.ceil(visibleCommandItems.value.length / commandItemsPerPage)))

const currentCommandPage = computed(() => {
  if (!visibleCommandItems.value.length) return 0
  const maxPage = totalCommandPages.value - 1
  return Math.min(Math.floor(commandMenu.value.highlight / commandItemsPerPage), maxPage)
})

const pagedCommandItems = computed(() => {
  const start = currentCommandPage.value * commandItemsPerPage
  return visibleCommandItems.value.slice(start, start + commandItemsPerPage)
})

const pageItemRangeText = computed(() => {
  if (!visibleCommandItems.value.length) return '0 / 0'
  const start = currentCommandPage.value * commandItemsPerPage + 1
  const end = Math.min(start + commandItemsPerPage - 1, visibleCommandItems.value.length)
  return `${start}-${end} / ${visibleCommandItems.value.length}`
})

const normalizeImportedStatus = (value) => ({
  '未开始': 'not_started',
  '进行中': 'in_progress',
  '已完成': 'completed',
  '已归档': 'archived',
  done: 'completed'
}[value] || value || 'not_started')

const normalizeImportedPriority = (value) => ({
  '低': 'low',
  '中': 'medium',
  '高': 'high'
}[value] || value || 'medium')

const normalizeImportedType = (value) => ({
  '项目': 'project',
  '任务': 'task',
  '目标': 'goal',
  '自定义': 'custom',
  custom: 'custom',
  note: 'goal'
}[value] || value || 'project')

const closeRowMenu = () => {
  rowMenu.value = { show: false, blockId: null, blockIndex: -1, top: 0, left: 0 }
}

const closeCommandMenu = () => {
  commandMenu.value = { show: false, mode: 'insert-after', index: null, top: 0, left: 0, query: '', selectedCategory: 'all', highlight: 0 }
}

const clearDragState = () => {
  dragState.value = { draggingId: null, draggingIds: [], fromIndex: -1, overIndex: -1, position: 'after' }
}

const clearSelectedBlocks = () => {
  selectedBlockIds.value = new Set()
}

const finishBlockSelection = () => {
  blockSelection.value = { active: false, anchorIndex: -1, lastIndex: -1, mode: 'replace' }
}

const setSelectedBlockRange = (anchorIndex, currentIndex, mode = 'replace') => {
  if (anchorIndex < 0 || currentIndex < 0 || !blocks.value.length) return
  const start = Math.min(anchorIndex, currentIndex)
  const end = Math.max(anchorIndex, currentIndex)
  const nextSelected = mode === 'add' ? new Set(selectedBlockIds.value) : new Set()
  blocks.value.slice(start, end + 1).forEach((block) => nextSelected.add(block.id))
  selectedBlockIds.value = nextSelected
  activeBlockId.value = blocks.value[currentIndex]?.id || blocks.value[start]?.id || null
}

const beginBlockSelection = (event, index) => {
  if (event.button !== 0) return
  event.preventDefault()
  closeRowMenu()
  closeCommandMenu()
  closeInlineAiToolbar()
  const mode = event.ctrlKey || event.metaKey ? 'add' : 'replace'
  blockSelection.value = { active: true, anchorIndex: index, lastIndex: index, mode }
  setSelectedBlockRange(index, index, mode)
}

const extendBlockSelection = (index) => {
  if (!blockSelection.value.active || index === blockSelection.value.lastIndex) return
  blockSelection.value.lastIndex = index
  setSelectedBlockRange(blockSelection.value.anchorIndex, index, blockSelection.value.mode)
}

const handleBlockRowClick = (event, index, block) => {
  if (!event.shiftKey && !event.ctrlKey && !event.metaKey) return
  if (event.target?.closest?.('select, option, button')) return

  event.preventDefault()

  if (event.ctrlKey || event.metaKey) {
    activeBlockId.value = block?.id || null
    const nextSelected = new Set(selectedBlockIds.value)
    if (nextSelected.has(block.id)) nextSelected.delete(block.id)
    else nextSelected.add(block.id)
    selectedBlockIds.value = nextSelected
    blockSelection.value = { active: false, anchorIndex: index, lastIndex: index, mode: 'add' }
    return
  }

  const previousActiveId = activeBlockId.value
  const selectedAnchor = blocks.value.findIndex((item) => selectedBlockIds.value.has(item.id))
  const activeAnchor = blocks.value.findIndex((item) => item.id === previousActiveId)
  const anchorIndex = selectedAnchor >= 0 ? selectedAnchor : (activeAnchor >= 0 ? activeAnchor : index)
  activeBlockId.value = block?.id || null
  setSelectedBlockRange(anchorIndex, index, 'replace')
  finishBlockSelection()
}

const isEditableElement = (target) => !!target?.closest?.('textarea, input, [contenteditable="true"], select')

const deleteSelectedBlocks = async () => {
  const idsToDelete = new Set(selectedBlockIds.value)
  if (!idsToDelete.size) return

  clearSelectedBlocks()
  closeRowMenu()
  closeCommandMenu()
  closeAiComposer()
  closeInlineAiToolbar()

  const remainingBlocks = blocks.value.filter((block) => !idsToDelete.has(block.id))
  const deletingBlocks = blocks.value.filter((block) => idsToDelete.has(block.id))

  deletingBlocks.forEach((block) => {
    clearBlockSaveTimer(block)
    pendingBlockIds.value.delete(block.id)
  })

  blocks.value = remainingBlocks
  activeBlockId.value = remainingBlocks[0]?.id || null

  if (!planId.value) {
    markDirty()
    return
  }

  const persistedBlocks = deletingBlocks.filter((block) => !String(block.id).startsWith('temp-'))
  const results = await Promise.allSettled(persistedBlocks.map((block) => deletePersistedBlock(block)))
  if (results.some((item) => item.status === 'rejected' || !item.value?.success)) {
    saveStatus.value = 'error'
    await loadPlan()
    return
  }

  const saved = await persistCurrentOrder()
  saveStatus.value = saved ? 'saved' : 'error'
}

const clearBlockSaveTimer = (block) => {
  if (block?.id !== undefined && block?.id !== null) {
    editorPersistence.clear(String(block.id))
  }
  if (block?.__saveTimer) {
    window.clearTimeout(block.__saveTimer)
    block.__saveTimer = null
  }
}

const clearAllBlockSaveTimers = () => {
  blocks.value.forEach((block) => clearBlockSaveTimer(block))
  editorPersistence.clearAll()
}

const markDirty = () => {
  if (saveStatus.value !== 'saving') saveStatus.value = 'unsaved'
}

const buildPlanAiPayload = (scope = 'text') => ({
  providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null,
  model: aiSelectedModel.value || null,
  title: title.value.trim() || '无标题',
  status: status.value,
  priority: priority.value,
  planType: planType.value,
  dueDate: dueDate.value || '',
  blocks: summarizeBlocksForAi()
})

const openAiPanel = (tab = 'chat') => {
  closeCommandMenu()
  closeRowMenu()
  aiPanel.value = { show: true, tab }
  ensureAiMediaModelsLoaded()
  if (tab === 'chat') {
    void loadAiConversations()
  }
  if (tab === 'image') {
    loadAiImageHistory({ restoreActive: true })
  }
  if (tab === 'video') {
    loadAiVideoHistory({ restoreActive: true })
  }
}

const openAiWorkspace = () => {
  closeAiComposer()
  openAiPanel('chat')
}

const closeAiPanel = () => {
  aiPanel.value.show = false
}

const setChatPrompt = (prompt) => {
  aiChatDraft.value = String(prompt || '')
}

const buildAiConversationContext = () => ({
  planId: Number(planId.value) || null,
  planTitle: title.value.trim(),
  blockCount: blocks.value.length,
  blocks: summarizeBlocksForAi(16).map((block) => ({
    type: block.type,
    text: block.summary
  })),
  model: aiSelectedModel.value || null,
  capturedAt: new Date().toISOString()
})

const upsertAiConversationSummary = (conversation) => {
  if (!conversation?.id) return
  const normalized = {
    ...conversation,
    id: String(conversation.id)
  }
  aiConversations.value = [
    normalized,
    ...aiConversations.value.filter((item) => String(item.id) !== normalized.id)
  ]
}

const loadAiConversations = async () => {
  if (!planId.value || aiConversationLoading.value) return
  aiConversationLoading.value = true
  try {
    const response = await listAiConversations({ planId: planId.value })
    if (!response?.success) {
      showInfo('对话历史暂时无法加载', { description: response?.error || '当前仍可以开始临时对话。' })
      return
    }

    const conversations = Array.isArray(response.data?.conversations)
      ? response.data.conversations
      : []
    aiConversations.value = conversations

    const currentId = aiConversationId.value
    const targetId = conversations.some((item) => String(item.id) === String(currentId))
      ? currentId
      : conversations[0]?.id

    if (targetId) {
      await selectAiConversation(targetId)
    } else {
      await startNewAiConversation()
    }
  } finally {
    aiConversationLoading.value = false
  }
}

const selectAiConversation = async (conversationId) => {
  const id = String(conversationId || '').trim()
  if (!id) return
  aiConversationLoading.value = true
  try {
    const response = await getAiConversation(id)
    if (!response?.success || !response.data?.conversation) {
      showError('打开对话失败', { description: response?.error || '这条对话可能已经被删除。' })
      aiConversations.value = aiConversations.value.filter((item) => String(item.id) !== id)
      return
    }

    const conversation = response.data.conversation
    aiConversationId.value = String(conversation.id)
    aiChatMessages.value = Array.isArray(conversation.messages)
      ? conversation.messages.map((message) => ({ ...message }))
      : []
    upsertAiConversationSummary(conversation)
    aiConversationContextExpanded.value = false
  } finally {
    aiConversationLoading.value = false
  }
}

const startNewAiConversation = async () => {
  aiChatMessages.value = []
  aiChatDraft.value = ''
  aiConversationId.value = ''
  aiConversationContextExpanded.value = false

  if (!planId.value || aiConversationSaving.value) return

  aiConversationSaving.value = true
  try {
    const response = await createAiConversation({
      planId: planId.value,
      title: '新对话',
      context: buildAiConversationContext(),
      providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null,
      model: aiSelectedModel.value || null
    })
    if (!response?.success || !response.data?.conversation) {
      showInfo('新对话暂未保存', { description: response?.error || '发送第一条消息时仍会尝试保存。' })
      return
    }

    const conversation = response.data.conversation
    aiConversationId.value = String(conversation.id)
    upsertAiConversationSummary(conversation)
  } finally {
    aiConversationSaving.value = false
  }
}

const saveAiConversation = async () => {
  if (!aiConversationId.value || aiConversationSaving.value) return
  aiConversationSaving.value = true
  try {
    const response = await updateAiConversation(aiConversationId.value, {
      title: aiChatMessages.value.find((message) => message.role === 'user')?.content?.slice(0, 40) || '新对话',
      messages: aiChatMessages.value,
      context: buildAiConversationContext(),
      providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null,
      model: aiSelectedModel.value || null
    })
    if (response?.success && response.data?.conversation) {
      upsertAiConversationSummary(response.data.conversation)
    }
  } finally {
    aiConversationSaving.value = false
  }
}

const deleteCurrentAiConversation = async () => {
  const id = String(aiConversationId.value || '')
  if (!id || !(await confirmDialog('确认删除这条 AI 对话吗？'))) return

  const response = await deleteAiConversationRequest(id)
  if (!response?.success) {
    showError('删除对话失败', { description: response?.error || '请稍后重试。' })
    return
  }

  aiConversations.value = aiConversations.value.filter((item) => String(item.id) !== id)
  aiConversationId.value = ''
  aiChatMessages.value = []
  const nextConversation = aiConversations.value[0]
  if (nextConversation) await selectAiConversation(nextConversation.id)
  else await startNewAiConversation()
}

const resetAiWorkspaceChat = () => {
  void startNewAiConversation()
}

const runAiWorkspaceChat = async () => {
  const question = aiChatDraft.value.trim()
  if (!question || aiChatLoading.value) return

  if (!aiConversationId.value) {
    await startNewAiConversation()
  }

  aiChatDraft.value = ''
  aiChatMessages.value.push({
    id: `user-${Date.now()}`,
    role: 'user',
    content: question,
    createdAt: new Date().toISOString(),
    model: aiSelectedModel.value || null,
    source: 'user'
  })
  aiChatLoading.value = true

  try {
    const response = await chatWithMascotAssistant({
      message: question,
      conversationId: Number(aiConversationId.value) || null,
      providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null,
      model: aiSelectedModel.value || null,
      context: {
        planId: Number(planId.value) || null,
        planTitle: title.value.trim(),
        blocks: summarizeBlocksForAi(16).map((block) => ({
          type: block.type,
          text: block.summary
        }))
      }
    })

    if (!response?.success) {
      aiChatMessages.value.push({
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: response?.code === 'AI_NOT_CONFIGURED'
          ? '尚未配置 Mentor-X 能力，请先到“我的 / Mentor-X 模型引擎配置”中完成配置。'
          : getAiFailureDescription(response)
      })
      return
    }

    const payload = response.data || {}
      aiChatMessages.value.push({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: payload.reply || payload.answer || 'AI 暂时没有返回可用内容。',
        createdAt: new Date().toISOString(),
        model: payload.model || aiSelectedModel.value || null,
        source: payload.source || 'provider'
      })
      await saveAiConversation()
    } catch (error) {
      aiChatMessages.value.push({
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: error.message || 'Mentor-X 工作区暂时无法连接。',
        createdAt: new Date().toISOString(),
        source: 'error'
      })
  } finally {
    aiChatLoading.value = false
  }
}

const loadAiSkills = async ({ force = false, silent = false } = {}) => {
  if (!force && aiSkills.value.length) return { success: true, data: { skills: aiSkills.value } }
  if (aiSkillsRequest) return aiSkillsRequest

  aiSkillsRequest = (async () => {
    const response = await listAiSkills()
    if (!response?.success) {
      if (!silent) {
        showInfo('Mentor-X 技能暂时无法加载', { description: response?.error || '你仍然可以使用默认提示。' })
      }
      return response
    }
    aiSkills.value = Array.isArray(response.data?.skills) ? response.data.skills : []
    return response
  })()

  try {
    return await aiSkillsRequest
  } finally {
    aiSkillsRequest = null
  }
}

const closeAiComposer = () => {
  aiComposer.value = {
    show: false,
    context: null,
    loading: false,
    result: null
  }
}

const openAiComposer = (context = {}) => {
  if (!context?.blockId) {
    showInfo('未定位到可编辑块', { description: '请先聚焦一个文本块，再打开 AI。' })
    return
  }

  const block = getBlockById(context.blockId)
  if (!block || !supportsInlineAi(block)) {
    showInfo('当前内容不支持文本 AI', { description: '请先选择文本、标题、待办、引用或标注块。' })
    return
  }

  closeCommandMenu()
  void ensureAiMediaModelsLoaded()
  closeRowMenu()
  closeInlineAiToolbar()
  closeInlineFormatToolbar()
  closeAiPanel()
  activeBlockId.value = block.id
  aiComposer.value = {
    show: true,
    context: {
      ...context,
      blockId: block.id,
      fieldKey: context.fieldKey || inlineAiFieldMap[block.type] || 'text',
      sourceText: context.sourceText || getInlineAiEditableText(block, context),
      selectedText: context.selectedText || '',
      rangeStart: Number(context.rangeStart || 0),
      rangeEnd: Number(context.rangeEnd || 0),
      hasSelection: Boolean(context.hasSelection)
    },
    loading: false,
    result: null
  }
}

const openAiComposerFromBlock = async (block) => {
  if (!block || !supportsInlineAi(block)) {
    showInfo('当前内容不支持文本 AI', { description: '请先选择文本、标题、待办、引用或标注块。' })
    return
  }

  activeBlockId.value = block.id
  await focusBlockById(block.id)
  const editor = getBlockEditor(block.id)
  const context = buildInlineAiContextFromElement(editor, { allowCollapsed: true }) || {
    blockId: block.id,
    fieldKey: inlineAiFieldMap[block.type] || 'text',
    sourceText: getInlineAiEditableText(block),
    selectedText: '',
    hasSelection: false,
    rangeStart: getInlineAiEditableText(block).length,
    rangeEnd: getInlineAiEditableText(block).length
  }
  openAiComposer(context)
}

const openAiComposerFromActiveBlock = async () => {
  const block = activeBlock.value || blocks.value.find((item) => supportsInlineAi(item))
  if (!block) {
    showInfo('还没有可用的文本块', { description: '先新建一个文本块，再打开 AI。' })
    return
  }
  await openAiComposerFromBlock(block)
}

const runAiComposer = async ({ prompt = '', intent = 'custom', outputMode = 'text', skillIds = [] } = {}) => {
  const context = aiComposer.value.context
  if (!context?.blockId) return
  const block = getBlockById(context.blockId)
  if (!block) return

  aiComposer.value.loading = true
  aiComposer.value.result = null
  const sourceText = getInlineAiEditableText(block, context)

  try {
    const response = await runWorkspaceAi({
      ...buildPlanAiPayload('text'),
      prompt,
      intent,
      outputMode,
      skillIds,
      context: {
        scope: context.hasSelection ? 'selection' : 'block',
        planId: Number(planId.value) || null,
        // 新编辑器块属于 WorkspaceBlock，不传给旧 PlanBlock 归属校验。
        blockId: null,
        blockType: block.type,
        selectedText: context.hasSelection ? context.selectedText : '',
        blockText: sourceText,
        planTitle: title.value,
        blocks: summarizeBlocksForAi()
      }
    })

    if (!response?.success) {
      showError('AI 生成失败', { description: getAiFailureDescription(response) })
      return
    }

    aiComposer.value.result = response.data || null
  } finally {
    aiComposer.value.loading = false
  }
}

const applyAiComposerText = async (mode = 'replace-selection') => {
  const context = aiComposer.value.context
  const resultText = String(aiComposer.value.result?.text || '').trim()
  const block = getBlockById(context?.blockId)
  if (!context || !block || !resultText) return

  const currentText = getInlineAiEditableText(block, context)
  const selectionStart = Number(context.rangeStart || 0)
  const selectionEnd = Number(context.rangeEnd || selectionStart)
  let nextText = currentText
  let focusStart = 0
  let focusEnd = 0

  if (mode === 'insert-cursor') {
    const cursor = context.hasSelection ? selectionEnd : selectionStart
    const joiner = currentText && cursor > 0 && !/\s$/.test(currentText.slice(0, cursor)) ? '\n' : ''
    nextText = currentText.slice(0, cursor) + joiner + resultText + currentText.slice(cursor)
    focusStart = cursor + joiner.length
    focusEnd = focusStart + resultText.length
  } else if (mode === 'append-end') {
    const joiner = currentText && !/\s$/.test(currentText) ? '\n' : ''
    nextText = currentText + joiner + resultText
    focusStart = currentText.length + joiner.length
    focusEnd = focusStart + resultText.length
  } else {
    const start = context.hasSelection ? selectionStart : 0
    const end = context.hasSelection ? selectionEnd : currentText.length
    nextText = currentText.slice(0, start) + resultText + currentText.slice(end)
    focusStart = start
    focusEnd = start + resultText.length
  }

  const applied = await setInlineAiEditableText(block, nextText, focusStart, focusEnd, context)
  if (!applied) return
  showSuccess('AI 结果已写回')
  closeAiComposer()
}

const applyAiComposerBlocks = async () => {
  const context = aiComposer.value.context
  const block = getBlockById(context?.blockId)
  const result = aiComposer.value.result
  const index = getBlockIndexById(block?.id)
  if (index < 0 || !Array.isArray(result?.blocks) || !result.blocks.length) return

  await insertBlocksAfter(index, result.blocks)
  showSuccess('AI 结果已插入为新块')
  closeAiComposer()
}


const applyTextToBlock = (block, text) => {
  if (!block) return false
  const nextText = String(text || '').trim()
  if (!nextText) return false

  const current = cloneContent(block.content) || {}
  let nextContent = null

  switch (block.type) {
    case 'heading':
      nextContent = { ...current, text: nextText, level: current.level || 1 }
      break
    case 'text':
      nextContent = { ...current, text: nextText }
      break
    case 'todo':
      nextContent = { ...current, text: nextText, done: !!current.done }
      break
    case 'quote':
      nextContent = { ...current, text: nextText }
      break
    case 'callout':
      nextContent = { ...current, text: nextText, variant: current.variant || 'info' }
      break
    case 'page':
      nextContent = { ...current, title: nextText, summary: current.summary || '' }
      break
    case 'toggle':
    case 'collapse':
      nextContent = { ...current, title: nextText, text: current.text || '', open: current.open ?? true }
      break
    case 'link_page':
      nextContent = { ...current, pageTitle: nextText, note: current.note || '' }
      break
    case 'button':
      nextContent = { ...current, label: nextText, url: current.url || '', style: current.style || 'primary' }
      break
    case 'breadcrumb':
      nextContent = { ...current, rootLabel: nextText, currentLabel: current.currentLabel || '' }
      break
    case 'equation':
    case 'formula':
      nextContent = { ...current, latex: nextText }
      break
    case 'synced_block':
      nextContent = { ...current, text: nextText, syncKey: current.syncKey || '', role: current.role || 'source' }
      break
    default:
      return false
  }

  updateBlockContent(block, nextContent)
  return true
}

const getAiFailureDescription = (res) => {
  const request = res?.data?.request || res?.details?.data?.request || res?.details?.data || null
  const provider = res?.data?.provider || res?.details?.data?.provider || null
  const debugParts = [
    request?.protocol || provider?.protocol,
    request?.requestUrl,
    request?.model || provider?.model
  ].filter(Boolean)
  const debugText = debugParts.length ? `（${debugParts.join(' · ')}）` : ''

  if (res?.code === 'AI_NOT_CONFIGURED') return '尚未配置 Mentor-X 能力，请先到“我的 / Mentor-X 模型引擎配置”中添加并设为默认。'
  if (res?.code === 'AI_PROVIDER_NOT_FOUND') return '当前选择的 Mentor-X 模型引擎不存在或已停用，请回到 Mentor-X 模型引擎配置重新设置默认模型引擎。'
  if (res?.code === 404) return `模型引擎接口不存在，请检查 Base URL 是否只填到 /v1，协议是否选对。${debugText}`
  if (res?.code === 401 || res?.code === 403) return `API Key 无效、权限不足或模型无权访问，请检查 Key 与模型名。${debugText}`
  if (res?.code === 402) return `当前API Key 额度不足或账户不可用，请检查模型引擎余额与计费状态。${debugText}`
  if (res?.code === 429) return `${res?.error || '模型引擎请求过于频繁，请稍后再试。'}${debugText}`
  if (res?.code === 422) return `${res?.error || '当前模式或参数不被供应商支持。'}${debugText}`
  if (res?.code === 502) return `${res?.error || '模型引擎服务暂时不可达，请检查后端网络、Base URL 或上游状态。'}${debugText}`
  if (res?.code === 503) return `${res?.error || '当前推理模型不可用，请检查模型配置。'}${debugText}`
  if (res?.code === 504 || res?.code === 0) return `${res?.error || '模型引擎请求超时或网络不可达，请确认服务器网络后重试。'}${debugText}`
  if (/No available channel for model/i.test(res?.error || '')) return `当前模型引擎账号未开通该模型，请确认模型权限。${debugText}`
  return `${res?.error || '请稍后再试。'}${debugText}`
}

const formatAiVideoTimestamp = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAiVideoModeLabel = (mode) => ({
  text_to_video: '文生视频',
  image_to_video: '图生视频',
  keyframes: '关键帧动画'
}[mode] || '视频任务')

const getAiImageModeLabel = (mode) => ({
  text_to_image: '文生图',
  image_to_image: '图生图',
  multi_image: '多图合成'
}[mode] || '图片任务')

const terminalAiStatuses = ['completed', 'succeeded', 'success', 'done', 'ready', 'failed', 'error', 'canceled', 'cancelled']

const mergeAiImageHistoryItem = (item) => {
  if (!item?.id) return
  const nextItem = {
    ...item,
    sourceImages: Array.isArray(item.sourceImages) ? item.sourceImages : [],
    items: Array.isArray(item.items) ? item.items : [],
    timeline: Array.isArray(item.timeline) ? item.timeline : []
  }
  const existingIndex = aiImageHistory.value.findIndex((entry) => entry.id === nextItem.id)
  if (existingIndex === -1) {
    aiImageHistory.value = [nextItem, ...aiImageHistory.value].slice(0, 12)
    return
  }
  const nextHistory = [...aiImageHistory.value]
  nextHistory.splice(existingIndex, 1)
  aiImageHistory.value = [nextItem, ...nextHistory].slice(0, 12)
}

const mergeAiVideoHistoryItem = (item) => {
  if (!item?.id) return
  const nextItem = {
    ...item,
    sourceImages: Array.isArray(item.sourceImages) ? item.sourceImages : [],
    timeline: Array.isArray(item.timeline) ? item.timeline : []
  }
  const existingIndex = aiVideoHistory.value.findIndex((entry) => entry.id === nextItem.id)
  if (existingIndex === -1) {
    aiVideoHistory.value = [nextItem, ...aiVideoHistory.value].slice(0, 12)
    return
  }
  const nextHistory = [...aiVideoHistory.value]
  nextHistory.splice(existingIndex, 1)
  aiVideoHistory.value = [nextItem, ...nextHistory].slice(0, 12)
}

const setAiVideoResolution = (value) => {
  const [nextWidth, nextHeight] = String(value || '').split('x').map((item) => Number(item))
  if (Number.isFinite(nextWidth) && Number.isFinite(nextHeight)) {
    aiVideoWidth.value = nextWidth
    aiVideoHeight.value = nextHeight
  }
}

const getAvailableAiVideoSources = () => aiVideoSources.value.filter((item) => isProviderReachableHttpUrl(item.remoteUrl))

const handleAiImageFiles = async (event) => {
  const files = Array.from(event?.target?.files || [])
  if (!files.length) return
  try {
    const sources = []
    for (const file of files.slice(0, 6)) {
      const dataUrl = await readFileAsDataUrl(file)
      sources.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: normalizeMediaLabel(file.name),
        previewUrl: dataUrl,
        dataUrl
      })
    }
    aiImageSources.value = sources
    aiImageResult.value = null
  } catch (error) {
    showError('读取图片失败', { description: error.message || '请重新选择文件' })
  } finally {
    if (event?.target) event.target.value = ''
  }
}

const handleAiVideoUploadFiles = async (event) => {
  const files = Array.from(event?.target?.files || []).slice(0, 6)
  if (!files.length) return

  aiVideoSourceUploading.value = true
  aiVideoSourceUploadProgress.value = 0

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      let res = null
      try {
        res = await uploadImage(file, (progress) => {
          aiVideoSourceUploadProgress.value = Math.max(
            aiVideoSourceUploadProgress.value,
            Math.floor(((index + progress / 100) / files.length) * 100)
          )
        })
      } catch (error) {
        showError('上传参考图失败', { description: error.message || '请稍后再试' })
        continue
      }

      if (!res?.success) {
        showError('上传参考图失败', { description: res?.error || '请稍后再试' })
        continue
      }

      const publicUrl = String(res.data?.publicUrl || '').trim()
      const absoluteUrl = String(res.data?.absoluteUrl || resolveMediaUrl(res.data?.url || '')).trim()
      const previewUrl = absoluteUrl || publicUrl
      const canUseForProvider = isProviderReachableHttpUrl(publicUrl)

      const nextSource = createRemoteMediaSource(
        canUseForProvider ? publicUrl : '',
        file.name,
        {
          previewUrl,
          absoluteUrl,
          isPublic: canUseForProvider
        }
      )

      aiVideoSources.value = [...aiVideoSources.value, nextSource].slice(0, 6)
      aiVideoResult.value = null

      if (!canUseForProvider) {
        showInfo('图片已上传，但当前返回的不是公网 URL', {
          description: '如果当前模型引擎要求公网图片，请配置后端的 PUBLIC_MEDIA_BASE_URL，或直接手动填入公网图片地址。'
        })
      }
    }
  } finally {
    aiVideoSourceUploading.value = false
    aiVideoSourceUploadProgress.value = 0
    if (event?.target) event.target.value = ''
  }
}

const appendAiVideoSourceUrl = () => {
  const url = String(aiVideoSourceUrl.value || '').trim()
  if (!url) {
    showInfo('请输入参考图 URL')
    return
  }
  if (!isProviderReachableHttpUrl(url)) {
    showInfo('请输入公网可访问的图片 URL', { description: '例如 https://example.com/demo.png' })
    return
  }
  if (aiVideoSources.value.some((item) => item.remoteUrl === url)) {
    showInfo('该参考图 URL 已存在')
    return
  }
  aiVideoSources.value = [
    ...aiVideoSources.value,
    createRemoteMediaSource(url, `参考图 ${aiVideoSources.value.length + 1}`, { isPublic: true })
  ].slice(0, 6)
  aiVideoResult.value = null
  aiVideoSourceUrl.value = ''
}

const removeAiImageSource = (id) => {
  aiImageSources.value = aiImageSources.value.filter((item) => item.id !== id)
}

const removeAiVideoSource = (id) => {
  aiVideoSources.value = aiVideoSources.value.filter((item) => item.id !== id)
}

const pollAiImageStatus = async () => {
  const taskId = aiImageResult.value?.taskId
  if (!taskId) return

  const res = await getPlanImageStatusAI({ ...buildPlanAiPayload('image'), taskId })
  if (!res.success) {
    showError('获取生图状态失败', { description: getAiFailureDescription(res) })
    clearAiImagePolling()
    return
  }

  aiImageResult.value = {
    ...(aiImageResult.value || {}),
    ...(res.data || {})
  }
  mergeAiImageHistoryItem(aiImageResult.value)

  const normalizedStatus = String(aiImageResult.value?.status || '').toLowerCase()
  if (['completed', 'succeeded', 'success', 'done', 'ready'].includes(normalizedStatus)) {
    clearAiImagePolling()
    showSuccess('AI 生图已完成')
  }
  if (['failed', 'error', 'canceled', 'cancelled'].includes(normalizedStatus)) {
    clearAiImagePolling()
    showError('AI 生图失败', { description: aiImageResult.value?.error || '任务执行失败' })
  }
}

const loadAiImageHistory = async ({ restoreActive = true } = {}) => {
  if (!planId.value) {
    aiImageHistory.value = []
    return
  }

  aiImageHistoryLoading.value = true
  try {
    const res = await listPlanImageHistoryAI({ ...buildPlanAiPayload('image'), planId: planId.value, limit: 12 })
    if (!res.success) {
      showError('加载生图历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiImageHistory.value = Array.isArray(res.data) ? res.data : []

    if (restoreActive && aiImageHistory.value.length) {
      const pendingTask = aiImageHistory.value.find((item) => !terminalAiStatuses.includes(String(item.status || '').toLowerCase()))
      restoreAiImageTask(pendingTask || aiImageHistory.value[0])
    }
  } finally {
    aiImageHistoryLoading.value = false
  }
}

const restoreAiImageTask = (task) => {
  if (!task) return
  clearAiImagePolling()
  aiImageResult.value = { ...task }
  mergeAiImageHistoryItem(task)
  if (task.model) aiSelectedModel.value = task.model
  if (task.mode) aiImageMode.value = task.mode
  aiImageSources.value = Array.isArray(task.sourceImages)
    ? task.sourceImages.slice(0, 6).map((item, index) => ({
        id: 'restored-image-' + index + '-' + Date.now(),
        name: '\u53c2\u8003\u56fe ' + (index + 1),
        previewUrl: item,
        dataUrl: item
      }))
    : []

  const normalizedStatus = String(task.status || '').toLowerCase()
  if (!terminalAiStatuses.includes(normalizedStatus) && task.taskId) {
    aiImagePollingTimer.value = window.setInterval(() => {
      pollAiImageStatus()
    }, 3500)
    pollAiImageStatus()
  }
}

const deleteAiImageHistory = async (task) => {
  const taskId = String(task?.taskId || '').trim()
  if (!taskId) return

  aiImageDeletingTaskId.value = taskId
  try {
    const res = await deletePlanImageHistoryAI(taskId, buildPlanAiPayload('image'))
    if (!res.success) {
      showError('删除生图历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiImageHistory.value = aiImageHistory.value.filter((item) => item.taskId !== taskId)
    if (aiImageResult.value?.taskId === taskId) {
      clearAiImagePolling()
      aiImageResult.value = null
    }
    showSuccess('生图历史已删除')
  } finally {
    aiImageDeletingTaskId.value = ''
  }
}

const loadAiVideoHistory = async ({ restoreActive = true } = {}) => {
  if (!planId.value) {
    aiVideoHistory.value = []
    return
  }

  aiVideoHistoryLoading.value = true
  try {
    const res = await listPlanVideoHistoryAI({ ...buildPlanAiPayload('video'), planId: planId.value, limit: 12 })
    if (!res.success) {
      showError('加载视频历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiVideoHistory.value = Array.isArray(res.data) ? res.data : []

    if (restoreActive && aiVideoHistory.value.length) {
      const pendingTask = aiVideoHistory.value.find((item) => !terminalAiStatuses.includes(String(item.status || '').toLowerCase()))
      restoreAiVideoTask(pendingTask || aiVideoHistory.value[0])
    }
  } finally {
    aiVideoHistoryLoading.value = false
  }
}

const restoreAiVideoTask = (task) => {
  if (!task) return
  clearAiVideoPolling()
  aiVideoResult.value = { ...task }
  mergeAiVideoHistoryItem(task)
  if (task.model) aiSelectedModel.value = task.model
  if (task.mode) aiVideoMode.value = task.mode

  const sources = Array.isArray(task.sourceImages)
    ? task.sourceImages
      .filter((item) => isProviderReachableHttpUrl(item))
      .map((item, index) => createRemoteMediaSource(item, `参考图 ${index + 1}`, { isPublic: true }))
    : []

  if (sources.length) {
    aiVideoSources.value = sources
  }

  const normalizedStatus = String(task.status || '').toLowerCase()
  if (!terminalAiStatuses.includes(normalizedStatus) && task.videoId) {
    aiVideoPollingTimer.value = window.setInterval(() => {
      pollAiVideoStatus()
    }, 5000)
    pollAiVideoStatus()
  }
}

const deleteAiVideoHistory = async (task) => {
  const taskId = String(task?.taskId || '').trim()
  if (!taskId) return

  aiVideoDeletingTaskId.value = taskId
  try {
    const res = await deletePlanVideoHistoryAI(taskId, buildPlanAiPayload('video'))
    if (!res.success) {
      showError('删除视频历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiVideoHistory.value = aiVideoHistory.value.filter((item) => item.taskId !== taskId)
    if (aiVideoResult.value?.taskId === taskId) {
      clearAiVideoPolling()
      aiVideoResult.value = null
    }
    showSuccess('视频历史已删除')
  } finally {
    aiVideoDeletingTaskId.value = ''
  }
}

const runAiImage = async () => {
  if (isAiCoolingDown('image')) {
    showInfo('模型引擎请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('image') + ' 秒后再试。' })
    return
  }

  if (!aiImagePrompt.value.trim()) {
    showInfo('请输入图片提示词')
    return
  }

  if (aiImageMode.value !== 'text_to_image' && !aiImageSources.value.length) {
    showInfo('请先上传参考图片')
    return
  }

  if (!aiSelectedModel.value.trim()) {
    await ensureAiMediaModelsLoaded()
    if (!aiSelectedModel.value.trim()) {
      showInfo('请选择推理模型', { description: aiMediaModelError.value || '当前模型引擎未返回可用模型。' })
      return
    }
  }

  clearAiImagePolling()
  aiImageLoading.value = true
  aiImageResult.value = null
  try {
    const res = await generatePlanImageAI({
      ...buildPlanAiPayload('image'),
      planId: planId.value,
      model: aiSelectedModel.value,
      mode: aiImageMode.value,
      prompt: aiImagePrompt.value.trim(),
      negativePrompt: aiImageNegativePrompt.value.trim(),
      size: aiImageSize.value,
      ratio: aiImageRatio.value,
      responseFormat: 'url',
      inputImages: aiImageMode.value === 'text_to_image'
        ? []
        : aiImageSources.value.map((item) => item.dataUrl)
    })

    if (!res.success) {
      maybeStartAiCooldown('image', res, 15)
      showError('AI 生图失败', { description: getAiFailureDescription(res) })
      return
    }

    aiImageResult.value = {
      ...(res.data || {}),
      mode: aiImageMode.value
    }
    mergeAiImageHistoryItem(aiImageResult.value)

    const normalizedStatus = String(aiImageResult.value?.status || '').toLowerCase()
    if (!terminalAiStatuses.includes(normalizedStatus) && aiImageResult.value?.taskId) {
      aiImagePollingTimer.value = window.setInterval(() => {
        pollAiImageStatus()
      }, 3500)
      await pollAiImageStatus()
    }
  } finally {
    aiImageLoading.value = false
  }
}

const pollAiVideoStatus = async () => {
  const videoId = aiVideoResult.value?.videoId
  if (!videoId) return

  const res = await getPlanVideoStatusAI({
    providerId: workspaceAiStore.hasExplicitSelection ? workspaceAiStore.normalizedSelectedProviderId : null,
    videoId,
    model: aiVideoResult.value?.model || aiVideoModel.value
  })

  if (!res.success) {
    showError('获取视频状态失败', { description: getAiFailureDescription(res) })
    clearAiVideoPolling()
    return
  }

  aiVideoResult.value = {
    ...(aiVideoResult.value || {}),
    ...(res.data || {})
  }
  mergeAiVideoHistoryItem(aiVideoResult.value)

  if (['completed', 'succeeded', 'success', 'done', 'ready'].includes(String(aiVideoResult.value?.status || '').toLowerCase())) {
    clearAiVideoPolling()
    showSuccess('AI 视频已生成完成')
  }

  if (['failed', 'error', 'canceled'].includes(String(aiVideoResult.value?.status || '').toLowerCase())) {
    clearAiVideoPolling()
    showError('AI 生成视频失败', { description: aiVideoResult.value?.error || '任务执行失败' })
  }
}

const runAiVideo = async () => {
  const availableSources = getAvailableAiVideoSources()

  if (isAiCoolingDown('video')) {
    showInfo('模型引擎请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('video') + ' 秒后再试。' })
    return
  }

  if (!aiVideoPrompt.value.trim()) {
    showInfo('请输入视频提示词')
    return
  }

  if (aiVideoMode.value !== 'text_to_video' && !availableSources.length) {
    showInfo('请提供可公网访问的参考图', { description: '可以直接填写图片 URL，或先上传图片并确认后端返回了 publicUrl。' })
    return
  }

  if (aiVideoMode.value === 'keyframes' && availableSources.length < 2) {
    showInfo('关键帧动画至少需要 2 张参考图 URL')
    return
  }

  if (!aiSelectedModel.value.trim()) {
    await ensureAiMediaModelsLoaded()
    if (!aiSelectedModel.value.trim()) {
      showInfo('请选择推理模型', { description: aiMediaModelError.value || '当前模型引擎未返回可用模型。' })
      return
    }
  }

  clearAiVideoPolling()
  aiVideoLoading.value = true
  aiVideoResult.value = null
  try {
    const res = await createPlanVideoAI({
      ...buildPlanAiPayload('video'),
      planId: planId.value,
      model: aiSelectedModel.value,
      mode: aiVideoMode.value,
      prompt: aiVideoPrompt.value.trim(),
      negativePrompt: aiVideoNegativePrompt.value.trim(),
      width: aiVideoWidth.value,
      height: aiVideoHeight.value,
      numFrames: aiVideoFrames.value,
      frameRate: aiVideoFrameRate.value,
      inputImages: aiVideoMode.value === 'text_to_video'
        ? []
        : availableSources.map((item) => item.remoteUrl).filter(Boolean)
    })

    if (!res.success) {
      maybeStartAiCooldown('video', res, 15)
      showError('AI 生成视频失败', { description: getAiFailureDescription(res) })
      return
    }

    aiVideoResult.value = {
      ...(res.data || {}),
      mode: aiVideoMode.value
    }
    mergeAiVideoHistoryItem(aiVideoResult.value)

    if (aiVideoResult.value?.videoId) {
      clearAiVideoPolling()
      aiVideoPollingTimer.value = window.setInterval(() => {
        pollAiVideoStatus()
      }, 5000)
      await pollAiVideoStatus()
    }
  } finally {
    aiVideoLoading.value = false
  }
}

const focusBlockById = async (blockId) => {
  await nextTick()
  const row = document.querySelector(`.plan-row[data-block-id="${String(blockId)}"]`)
  const editor = row?.querySelector('textarea, input, [contenteditable="true"]')
  editor?.focus?.()
}

const resizeTitle = () => {
  if (!titleRef.value) return
  titleRef.value.style.height = 'auto'
  titleRef.value.style.height = `${titleRef.value.scrollHeight}px`
}

const handleTitleInput = () => {
  markDirty()
  nextTick(() => resizeTitle())
}

const clearActiveBlock = (blockId) => {
  window.setTimeout(() => {
    if (activeBlockId.value === blockId) activeBlockId.value = null
  }, 120)
}

const isEditorDocument = computed(() => Boolean(editorPageId.value))

const updatePersistedBlock = async (block, payload) => {
  if (!block) return { success: false, error: '块不存在' }

  if (!isEditorDocument.value) {
    return planStore.updateBlock(block.id, payload, planId.value)
  }

  const nextPayload = { ...payload }
  if (nextPayload.order !== undefined && nextPayload.position === undefined) {
    nextPayload.position = nextPayload.order
    delete nextPayload.order
  }
  const response = await updateEditorBlock(block.id, nextPayload)
  if (response.success && response.data) {
    Object.assign(block, response.data, {
      order: response.data.position || block.order
    })
  }
  return response
}

const createPersistedBlock = async (type, content, index) => {
  if (!isEditorDocument.value) {
    return planStore.addBlock(planId.value, type, content)
  }

  return createEditorBlock(editorPageId.value, {
    type,
    content,
    position: index + 1
  })
}

const deletePersistedBlock = async (block) => {
  if (!block) return { success: false, error: '块不存在' }
  if (!isEditorDocument.value) {
    return planStore.deleteBlock(block.id, planId.value)
  }
  return deleteEditorBlock(block.id)
}

const reorderPersistedBlocks = async () => {
  if (!planId.value || !blocks.value.length) return { success: true }
  if (!isEditorDocument.value) {
    return planStore.reorder(planId.value, blocks.value.map((item) => item.id))
  }
  return reorderEditorBlocks(editorPageId.value, blocks.value.map((item) => item.id))
}

const syncPlan = async () => {
  if (!planId.value) return true
  if (planType.value === 'custom' && !customTypeName.value.trim()) {
    saveStatus.value = 'error'
    return false
  }
  const res = await planStore.updatePlan(planId.value, {
    title: title.value.trim() || '无标题',
    status: status.value,
    priority: priority.value,
    type: planType.value,
    custom_type_name: planType.value === 'custom' ? customTypeName.value.trim() : null,
    due_date: dueDate.value || null
  })
  return !!res.success
}

const persistCurrentOrder = async () => {
  if (!planId.value || !blocks.value.length) return true
  const res = await reorderPersistedBlocks()
  return !!res.success
}

const loadPlanScheduleBlocks = async (targetPlanId = planId.value, { silent = false } = {}) => {
  if (!targetPlanId) {
    scheduleBlocks.value = []
    return
  }

  scheduleBlocksLoading.value = true
  try {
    const response = await listScheduleBlocks({ planId: targetPlanId, limit: 200 })
    if (String(targetPlanId) !== String(planId.value)) return

    if (response.success) {
      scheduleBlocks.value = Array.isArray(response.data) ? response.data : []
      return
    }

    scheduleBlocks.value = []
    if (!silent) showInfo('日程暂时无法加载', { description: response.error || '这不会影响正文编辑。' })
  } catch (error) {
    if (String(targetPlanId) === String(planId.value)) {
      scheduleBlocks.value = []
      if (!silent) showInfo('日程暂时无法加载', { description: error?.message || '这不会影响正文编辑。' })
    }
  } finally {
    if (String(targetPlanId) === String(planId.value)) {
      scheduleBlocksLoading.value = false
    }
  }
}

const loadEditorPageTree = async ({ force = false } = {}) => {
  if (!force && editorPageTree.value.length) return { success: true, data: editorPageTree.value }
  if (editorPageTreeRequest) return editorPageTreeRequest

  editorPageTreeRequest = (async () => {
    const response = await getEditorPageTree()
    if (response.success) editorPageTree.value = Array.isArray(response.data) ? response.data : []
    return response
  })()

  try {
    return await editorPageTreeRequest
  } finally {
    editorPageTreeRequest = null
  }
}

const openEditorPage = (page) => {
  if (!page?.id) return
  if (page.source_plan_id) {
    router.push(`/plan/${page.source_plan_id}`)
    return
  }
  router.push(`/workspace/pages/${page.id}`)
}

const createEditorChildPage = async (parentId = null) => {
  const response = await createEditorPage({
    parent_id: parentId || null,
    title: '无标题页面',
    icon: 'P'
  })
  if (!response.success || !response.data?.page?.id) {
    showError('页面创建失败', { description: response.error || '请稍后重试' })
    return
  }
  await loadEditorPageTree()
  router.push(`/workspace/pages/${response.data.page.id}`)
}

const normalizePlanForEditor = (plan = {}) => ({
  ...plan,
  status: plan.status === 'done' ? 'completed' : (plan.status || 'not_started'),
  priority: plan.priority || 'medium',
  type: plan.type === 'note' ? 'goal' : (plan.type || 'project'),
  custom_type_name: String(plan.custom_type_name || plan.customTypeName || '').trim()
})

const loadCurrentPlanRecord = async () => {
  const id = String(planId.value || '')
  if (!id) return null

  const cached = planStore.plans.find((item) => String(item.id) === id)
  if (cached) return normalizePlanForEditor(cached)

  const response = await getPlanById(id)
  if (!response.success || !response.data) return null

  const plan = normalizePlanForEditor(response.data)
  planStore.plans = [plan, ...planStore.plans.filter((item) => String(item.id) !== id)]
  return plan
}

const loadPlan = async () => {
  const currentLoadSeq = ++planLoadSeq
  isLoading.value = true
  loadError.value = null
  try {
    clearAllBlockSaveTimers()
    finishBlockSelection()
    clearSelectedBlocks()
    clearAiImagePolling()
    clearAiVideoPolling()
    aiImageResult.value = null
    aiImageHistory.value = []
    aiVideoResult.value = null
    aiVideoHistory.value = []

    scheduleBlocks.value = []
    scheduleBlocksLoading.value = false

    const bootstrapResponse = await getPlanEditorBootstrap(planId.value)

    if (currentLoadSeq !== planLoadSeq) return

    if (bootstrapResponse.success && bootstrapResponse.data?.page) {
      const bootstrap = bootstrapResponse.data
      const plan = normalizePlanForEditor(bootstrap.plan || {})
      title.value = plan.title || ''
      status.value = plan.status || 'not_started'
      priority.value = plan.priority || 'medium'
      planType.value = plan.type || 'project'
      customTypeName.value = plan.custom_type_name || ''
      dueDate.value = plan.due_date || ''
      editorPageId.value = bootstrap.editorPageId || bootstrap.page?.id || null
      editorPageTree.value = Array.isArray(bootstrap.pageTree) ? bootstrap.pageTree : []
      blocks.value = (bootstrap.blocks || []).map((block, index) => ({
        ...block,
        order: block.position || index + 1,
        content: block.content || createBlockContent(block.type)
      }))
      scheduleBlocks.value = Array.isArray(bootstrap.scheduleBlocks) ? bootstrap.scheduleBlocks : []
      editorDocument.page.value = bootstrap.page || null
      editorDocument.blocks.value = (bootstrap.blocks || []).map((block, index) => ({
        ...block,
        order: block.position || index + 1,
        content: block.content || createBlockContent(block.type)
      }))
      editorDocument.properties.value = bootstrap.properties || []
      editorDocument.databaseViews.value = bootstrap.databaseViews || []
    } else {
      const [plan, editorResponse] = await Promise.all([
        loadCurrentPlanRecord(),
        editorDocument.loadForPlan(planId.value, route.query.editorPageId || null)
      ])

      if (currentLoadSeq !== planLoadSeq) return

      if (!plan) {
        loadError.value = {
          title: '计划不存在',
          message: `没有找到计划 ${planId.value || ''}，可能已被删除或当前账号无权访问。`
        }
        return
      }

      title.value = plan.title || ''
      status.value = plan.status || 'not_started'
      priority.value = plan.priority || 'medium'
      planType.value = plan.type || 'project'
      customTypeName.value = plan.custom_type_name || ''
      dueDate.value = plan.due_date || ''

      if (editorResponse.success && editorResponse.data?.page) {
        editorPageId.value = editorResponse.data.page.id
        blocks.value = (editorResponse.data.blocks || []).map((block, index) => ({
          ...block,
          order: block.position || index + 1,
          content: block.content || createBlockContent(block.type)
        }))
      } else {
        loadError.value = {
          title: editorResponse.code === 'EDITOR_PAGE_NOT_FOUND' ? '编辑器页面不存在' : '编辑器加载失败',
          message: editorResponse.error || '计划已找到，但正文页面没有成功加载。请重试；如果仍失败，请检查后端是否已重启并完成数据库同步。'
        }
        return
      }
    }

    pendingBlockIds.value = new Set()
    saveStatus.value = 'saved'
    editorHistory.reset(getEditorHistorySnapshot())
    runWhenIdle(() => {
      if (currentLoadSeq !== planLoadSeq) return
      void Promise.allSettled(
        bootstrapResponse.success && bootstrapResponse.data?.page
          ? [loadAiSkills({ silent: true })]
          : [
              loadPlanScheduleBlocks(planId.value, { silent: true }),
              loadEditorPageTree(),
              loadAiSkills({ silent: true })
            ]
      )
    })
    nextTick(() => resizeTitle())
  } catch (error) {
    if (currentLoadSeq !== planLoadSeq) return
    loadError.value = {
      title: '计划加载失败',
      message: error?.message || '页面初始化时发生错误，请重试。'
    }
  } finally {
    if (currentLoadSeq === planLoadSeq) {
      isLoading.value = false
    }
  }
}

const savePendingBlocks = async () => {
  if (!planId.value || !pendingBlockIds.value.size) return true
  saveStatus.value = 'saving'
  const ids = [...pendingBlockIds.value]
  const results = await Promise.allSettled(ids.map(async (blockId) => {
    const block = blocks.value.find((item) => item.id === blockId)
    if (!block) return true
    clearBlockSaveTimer(block)
    const payload = block.__pendingPayload || { content: block.content }
    const res = await updatePersistedBlock(block, payload)
    if (!res.success) throw new Error(res.error || '保存失败')
    block.__pendingPayload = null
    pendingBlockIds.value.delete(blockId)
    return true
  }))

  if (results.some((item) => item.status === 'rejected')) {
    saveStatus.value = 'error'
    return false
  }

  saveStatus.value = pendingBlockIds.value.size ? 'unsaved' : 'saved'
  return true
}

const saveEverything = async () => {
  saveStatus.value = 'saving'
  clearAllBlockSaveTimers()
  const blocksSaved = await savePendingBlocks()
  const planSaved = await syncPlan()
  const orderSaved = await persistCurrentOrder()
  saveStatus.value = blocksSaved && planSaved && orderSaved ? 'saved' : 'error'
  return blocksSaved && planSaved && orderSaved
}

const updateBlockContent = (block, value, extraPayload = {}) => {
  block.content = value || createBlockContent(block.type)
  block.__pendingPayload = {
    ...(block.__pendingPayload || {}),
    ...extraPayload,
    content: block.content
  }
  pendingBlockIds.value.add(block.id)
  saveStatus.value = 'unsaved'
  editorHistory.record(getEditorHistorySnapshot())
  clearBlockSaveTimer(block)
  editorPersistence.schedule(String(block.id), async () => {
    if (!planId.value) return
    saveStatus.value = 'saving'
    try {
      const payload = block.__pendingPayload || { content: block.content }
      const res = await updatePersistedBlock(block, payload)
      if (res.success) {
        block.__pendingPayload = null
        pendingBlockIds.value.delete(block.id)
        saveStatus.value = pendingBlockIds.value.size ? 'unsaved' : 'saved'
      } else {
        saveStatus.value = 'error'
      }
    } catch {
      saveStatus.value = 'error'
    }
  })
}

const addBlock = async (type, index = blocks.value.length, content = null, options = {}) => {
  const { focus = true, reorder = true } = options
  const nextContent = content ? cloneContent(content) : createBlockContent(type)
  const tempBlock = {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content: nextContent,
    order: index + 1
  }

  if (!planId.value) {
    blocks.value.splice(index, 0, tempBlock)
    markDirty()
    if (focus) await focusBlockById(tempBlock.id)
    return tempBlock
  }

  const res = await createPersistedBlock(type, nextContent, index)
  if (!res.success) {
    blocks.value.splice(index, 0, tempBlock)
    markDirty()
    if (focus) await focusBlockById(tempBlock.id)
    return tempBlock
  }

  const serverBlock = {
    ...res.data,
    order: res.data.position || res.data.order || index + 1,
    content: res.data.content || nextContent
  }
  blocks.value.splice(index, 0, serverBlock)
  if (reorder) await persistCurrentOrder()
  saveStatus.value = 'saved'
  if (focus) await focusBlockById(serverBlock.id)
  return serverBlock
}

const replaceAllBlocks = async (payload) => {
  clearAllBlockSaveTimers()
  const nextBlocks = (payload.blocks || []).map((block, index) => ({
    ...block,
    content: block.content || createBlockContent(block.type),
    order: index + 1
  }))

  title.value = payload.title || title.value || '无标题'
  if (payload.status) status.value = normalizeImportedStatus(payload.status)
  if (payload.priority) priority.value = normalizeImportedPriority(payload.priority)
  if (payload.planType) planType.value = normalizeImportedType(payload.planType)
  if (payload.customTypeName !== undefined) customTypeName.value = payload.customTypeName || ''
  if (payload.dueDate !== undefined) dueDate.value = payload.dueDate || ''

  if (!planId.value) {
    blocks.value = nextBlocks.map((block) => ({
      ...block,
      id: block.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }))
    pendingBlockIds.value = new Set(blocks.value.map((block) => block.id))
    markDirty()
    nextTick(() => resizeTitle())
    return
  }

  saveStatus.value = 'saving'
  await Promise.allSettled(
    blocks.value
      .filter((block) => !String(block.id).startsWith('temp-'))
      .map((block) => deletePersistedBlock(block))
  )
  blocks.value = []
  pendingBlockIds.value = new Set()

  for (const block of nextBlocks) {
    await addBlock(block.type, blocks.value.length, block.content, { focus: false, reorder: false })
  }

  await persistCurrentOrder()
  await syncPlan()
  saveStatus.value = 'saved'
  nextTick(() => resizeTitle())
}

const appendTextBlock = async () => {
  activeBlockId.value = null
  await addBlock('text')
}

const createFirstBlock = async () => {
  if (blocks.value.length) return
  await addBlock('text', 0)
}

const insertTextAfter = async (index) => {
  await addBlock('text', index + 1)
}

const insertBlocksAfter = async (index, payloadBlocks = []) => {
  let insertionIndex = index + 1
  for (const item of payloadBlocks) {
    await addBlock(item.type, insertionIndex, item.content, { focus: false, reorder: false })
    insertionIndex += 1
  }
  if (planId.value) {
    const saved = await persistCurrentOrder()
    saveStatus.value = saved ? 'saved' : 'error'
  } else {
    markDirty()
  }
  const firstInserted = blocks.value[index + 1]
  if (firstInserted?.id) {
    await focusBlockById(firstInserted.id)
  }
}

const openCommandMenu = (event, index, mode = 'insert-after') => {
  closeRowMenu()
  const target = event?.currentTarget || event?.target
  if (!target?.getBoundingClientRect) return
  const rect = target.getBoundingClientRect()
  const panelWidth = 320
  const left = Math.min(
    Math.max(20, rect.left - 8),
    Math.max(20, window.innerWidth - panelWidth - 20)
  )
  commandMenu.value = {
    show: true,
    mode,
    index,
    top: rect.bottom + 8,
    left,
    query: '',
    selectedCategory: commandItems[0]?.category || 'all',
    highlight: 0
  }
  nextTick(() => document.querySelector('.slash-search')?.focus())
}

const setCommandCategory = (categoryKey) => {
  commandMenu.value.selectedCategory = categoryKey
  commandMenu.value.highlight = 0
  nextTick(() => document.querySelector('.slash-search')?.focus())
}

const goToCommandPage = (page) => {
  if (!visibleCommandItems.value.length) return
  const nextPage = Math.max(0, Math.min(page, totalCommandPages.value - 1))
  const nextIndex = nextPage * commandItemsPerPage
  commandMenu.value.highlight = Math.min(nextIndex, visibleCommandItems.value.length - 1)
}

const handleCommandKeydown = (event) => {
  if (event.key === 'Escape') {
    closeCommandMenu()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!visibleCommandItems.value.length) return
    commandMenu.value.highlight = (commandMenu.value.highlight + 1) % visibleCommandItems.value.length
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!visibleCommandItems.value.length) return
    commandMenu.value.highlight = (commandMenu.value.highlight - 1 + visibleCommandItems.value.length) % visibleCommandItems.value.length
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const item = visibleCommandItems.value[commandMenu.value.highlight]
    if (item) selectCommandItem(item)
    return
  }
  if (event.key === 'PageDown' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight')) {
    event.preventDefault()
    goToCommandPage(currentCommandPage.value + 1)
    return
  }
  if (event.key === 'PageUp' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft')) {
    event.preventDefault()
    goToCommandPage(currentCommandPage.value - 1)
  }
}

const selectCommandItem = async (item) => {
  const index = commandMenu.value.index
  const block = blocks.value[index]
  const mode = commandMenu.value.mode
  const content = item.createContent ? item.createContent() : createBlockContent(item.type)
  closeCommandMenu()

  if (mode === 'replace-current' && block) {
    changeBlockType(block, item.type, content)
    return
  }

  if (mode === 'insert-above') {
    await addBlock(item.type, index, content)
    return
  }

  if (mode === 'insert-below' || mode === 'insert-after') {
    await addBlock(item.type, index + 1, content)
    return
  }

  await addBlock(item.type, blocks.value.length, content)
}

const openRowMenu = (event, index, block) => {
  closeCommandMenu()
  const rect = event.currentTarget.getBoundingClientRect()
  rowMenu.value = {
    show: true,
    blockId: block.id,
    blockIndex: index,
    top: rect.bottom + 8,
    left: rect.left
  }
}

const openBlockTypeSelector = (block, index) => {
  if (!block) return
  closeRowMenu()
  closeCommandMenu()
  blockTypeSelector.value = {
    show: true,
    blockId: block.id,
    blockIndex: index
  }
}

const openHandleTypeSelector = (index, block) => {
  if (Date.now() < suppressHandleClickUntil.value) return
  openBlockTypeSelector(block, index)
}

const closeBlockTypeSelector = () => {
  blockTypeSelector.value = { show: false, blockId: null, blockIndex: -1 }
}

const handleBlockTypeSelect = async (type) => {
  const context = blockTypeSelector.value
  const block = blocks.value.find((item) => String(item.id) === String(context.blockId))
  if (!block || !type) {
    closeBlockTypeSelector()
    return
  }

  changeBlockType(block, type, createBlockContent(type))
  closeBlockTypeSelector()
}

const changeBlockType = (block, type, preferredContent = null) => {
  if (!block) return
  if (block.type === type && preferredContent) {
    block.content = preferredContent
    updateBlockContent(block, preferredContent, { type })
    return
  }
  if (block.type === type) return
  const nextContent = preferredContent || migrateBlockContent(block, type)
  block.type = type
  block.content = nextContent
  updateBlockContent(block, nextContent, { type })
}

const toggleBlockComplete = (block) => {
  if (block.type !== 'todo') return
  updateBlockContent(block, { ...block.content })
}

const duplicateBlock = async (index) => {
  const source = blocks.value[index]
  if (!source) return
  await addBlock(source.type, index + 1, source.content)
}

const removeBlock = async (block) => {
  const index = blocks.value.findIndex((item) => item.id === block.id)
  if (index === -1) return
  clearBlockSaveTimer(block)
  if (selectedBlockIds.value.has(block.id)) {
    const nextSelected = new Set(selectedBlockIds.value)
    nextSelected.delete(block.id)
    selectedBlockIds.value = nextSelected
  }
  blocks.value.splice(index, 1)
  pendingBlockIds.value.delete(block.id)
  const fallbackFocusId = blocks.value[index]?.id || blocks.value[index - 1]?.id || null

  if (!planId.value || String(block.id).startsWith('temp-')) {
    markDirty()
    if (fallbackFocusId) focusBlockById(fallbackFocusId)
    return
  }

  const res = await deletePersistedBlock(block)
  if (res.success) {
    await persistCurrentOrder()
    saveStatus.value = 'saved'
    if (fallbackFocusId) focusBlockById(fallbackFocusId)
  } else {
    saveStatus.value = 'error'
  }
}

const moveBlock = async (fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= blocks.value.length) return
  const nextBlocks = [...blocks.value]
  const [block] = nextBlocks.splice(fromIndex, 1)
  nextBlocks.splice(toIndex, 0, block)
  blocks.value = nextBlocks

  if (!planId.value) {
    markDirty()
    if (block?.id) focusBlockById(block.id)
    return
  }

  const saved = await persistCurrentOrder()
  saveStatus.value = saved ? 'saved' : 'error'
  if (saved && block?.id) focusBlockById(block.id)
}

const getActionBlockIds = () => {
  if (selectedBlockIds.value.size) return [...selectedBlockIds.value]
  return activeBlockId.value ? [activeBlockId.value] : []
}

const duplicateActionBlocks = async () => {
  const ids = getActionBlockIds()
  if (!ids.length) return
  const sourceBlocks = blocks.value.filter((block) => ids.includes(block.id))
  const lastIndex = Math.max(...sourceBlocks.map((block) => blocks.value.findIndex((item) => item.id === block.id)))
  let insertIndex = lastIndex + 1
  const insertedIds = []
  for (const block of sourceBlocks) {
    const inserted = await addBlock(block.type, insertIndex, block.content, { focus: false, reorder: false })
    insertedIds.push(inserted.id)
    insertIndex += 1
  }
  selectedBlockIds.value = new Set(insertedIds)
  activeBlockId.value = insertedIds[0] || null
  await persistCurrentOrder()
  if (activeBlockId.value) await focusBlockById(activeBlockId.value)
}

const moveActionBlocks = async (direction) => {
  const ids = new Set(getActionBlockIds())
  if (!ids.size) return
  const indexes = blocks.value
    .map((block, index) => (ids.has(block.id) ? index : -1))
    .filter((index) => index >= 0)

  if (!indexes.length) return
  if (direction < 0 && indexes[0] === 0) return
  if (direction > 0 && indexes[indexes.length - 1] === blocks.value.length - 1) return

  const nextBlocks = [...blocks.value]
  const orderedIndexes = direction < 0 ? indexes : [...indexes].reverse()
  orderedIndexes.forEach((index) => {
    const targetIndex = index + direction
    const current = nextBlocks[index]
    nextBlocks[index] = nextBlocks[targetIndex]
    nextBlocks[targetIndex] = current
  })
  blocks.value = nextBlocks
  selectedBlockIds.value = ids
  const saved = await persistCurrentOrder()
  saveStatus.value = saved ? 'saved' : 'error'
}

const getTodayDateKey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date())

const openScheduleDialog = (block) => {
  if (!block || String(block.id).startsWith('temp-')) {
    showError('安排失败', { description: '请先等待当前块保存完成' })
    return
  }

  const blockTitle = (getBlockTextContent(block) || title.value || '未命名计划块').trim().slice(0, 120)
  scheduleDialog.value = {
    show: true,
    blockId: block.id,
    title: blockTitle,
    date: getTodayDateKey(),
    startTime: '',
    durationMinutes: 60,
    isSubmitting: false
  }
}

const openScheduleDialogFromShelf = (block) => {
  showUnscheduledPanel.value = false
  openScheduleDialog(block)
}

const closeScheduleDialog = () => {
  if (scheduleDialog.value.isSubmitting) return
  scheduleDialog.value = {
    show: false,
    blockId: null,
    title: '',
    date: '',
    startTime: '',
    durationMinutes: 60,
    isSubmitting: false
  }
}

const submitScheduleDialog = async () => {
  const dialog = scheduleDialog.value
  const block = blocks.value.find((item) => String(item.id) === String(dialog.blockId))
  if (!block) {
    showError('安排失败', { description: '计划块不存在或已被删除' })
    closeScheduleDialog()
    return
  }

  const scheduledTitle = String(dialog.title || '').trim()
  if (!scheduledTitle) {
    showError('安排失败', { description: '请先填写执行标题' })
    return
  }

  if (!dialog.date) {
    showError('安排失败', { description: '请选择执行日期' })
    return
  }

  const durationMinutes = Math.min(Math.max(Number(dialog.durationMinutes || 60), 5), 480)
  scheduleDialog.value.isSubmitting = true
  const response = await createScheduleBlock({
    source_type: 'plan_block',
    plan_id: planId.value,
    plan_block_id: block.id,
    title: scheduledTitle.slice(0, 255),
    scheduled_date: dialog.date,
    start_time: dialog.startTime || null,
    duration_minutes: durationMinutes
  })
  scheduleDialog.value.isSubmitting = false

  if (!response.success) {
    showError('安排失败', { description: response.error || '请稍后重试' })
    return
  }

  if (response.data?.conflict_count) {
    showInfo('已安排到日程，但时间有重叠', {
      description: '可以到计划日程视图改期、延期或缩短时长，避免同一时间段任务过载。'
    })
  } else {
    showSuccess('已安排到日程', { description: '你可以在今日工作台和后续日程视图查看这个执行项' })
  }
  await loadPlanScheduleBlocks()
  closeScheduleDialog()
}

const handleRowMenuAction = async (action) => {
  const index = rowMenu.value.blockIndex
  const block = blocks.value[index]
  if (!block) {
    closeRowMenu()
    return
  }

  const anchor = document.querySelector(`.plan-row[data-block-id="${String(block.id)}"] .plan-row-select`)
    || document.querySelector(`.plan-row[data-block-id="${String(block.id)}"] .plan-row-handle`)

  switch (action) {
    case 'add-above':
      openCommandMenu({ currentTarget: anchor }, index, 'insert-above')
      closeRowMenu()
      return
    case 'add-below':
      openCommandMenu({ currentTarget: anchor }, index, 'insert-below')
      closeRowMenu()
      return
    case 'schedule':
      openScheduleDialog(block)
      closeRowMenu()
      return
    case 'duplicate':
      await duplicateBlock(index)
      break
    case 'change-type':
      openBlockTypeSelector(block, index)
      closeRowMenu()
      return
    case 'move-up':
      await moveBlock(index, index - 1)
      break
    case 'move-down':
      await moveBlock(index, index + 1)
      break
    case 'delete':
      await removeBlock(block)
      break
  }

  closeRowMenu()
}

const onHandleDragStart = (event, index, block) => {
  finishBlockSelection()
  const draggingIds = selectedBlockIds.value.has(block.id)
    ? blocks.value.filter((item) => selectedBlockIds.value.has(item.id)).map((item) => item.id)
    : [block.id]

  if (!selectedBlockIds.value.has(block.id)) {
    selectedBlockIds.value = new Set([block.id])
  }

  dragState.value = {
    draggingId: block.id,
    draggingIds,
    fromIndex: index,
    overIndex: index,
    position: 'after'
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/x-habitlearner-blocks', JSON.stringify(draggingIds))
  event.dataTransfer.setData('text/plain', '')
}

const mergeableBlockTypes = new Set(['text', 'heading', 'quote', 'callout'])

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const getTextDocumentContent = (block) => {
  const document = block?.content?.document
  if (block?.type === 'text' && document?.type === 'doc' && Array.isArray(document.content)) {
    return cloneContent(document.content)
  }

  const text = getBlockTextContent(block).trim()
  return text
    ? [{ type: 'paragraph', content: [{ type: 'text', text }] }]
    : [{ type: 'paragraph' }]
}

const getTextHtmlContent = (block) => {
  if (block?.type === 'text' && block.content?.html) {
    return String(block.content.html)
  }
  return `<p>${escapeHtml(getBlockTextContent(block).trim())}</p>`
}

const buildMergedBlockContent = (targetBlock, sourceBlocks) => {
  const text = [targetBlock, ...sourceBlocks]
    .map((block) => getBlockTextContent(block).trim())
    .filter(Boolean)
    .join('\n')
  const nextContent = cloneContent(targetBlock.content) || {}

  nextContent.text = text
  if (targetBlock.type === 'text') {
    nextContent.document = {
      type: 'doc',
      content: [targetBlock, ...sourceBlocks].flatMap(getTextDocumentContent)
    }
    nextContent.html = [targetBlock, ...sourceBlocks]
      .map(getTextHtmlContent)
      .join('')
  }
  return nextContent
}

const mergeBlocksInto = async (targetBlock, draggingIds) => {
  const sourceBlocks = blocks.value.filter((block) => (
    draggingIds.includes(block.id)
    && block.id !== targetBlock.id
    && !String(block.id).startsWith('temp-')
  ))
  if (
    !sourceBlocks.length
    || String(targetBlock.id).startsWith('temp-')
    || !mergeableBlockTypes.has(targetBlock.type)
    || sourceBlocks.some((block) => !mergeableBlockTypes.has(block.type))
  ) {
    return false
  }

  const mergedContent = buildMergedBlockContent(targetBlock, sourceBlocks)
  editorHistory.record(getEditorHistorySnapshot())
  targetBlock.content = mergedContent
  targetBlock.__pendingPayload = null
  pendingBlockIds.value.delete(targetBlock.id)

  const targetResponse = await updatePersistedBlock(targetBlock, { content: mergedContent })
  if (!targetResponse.success) {
    saveStatus.value = 'error'
    return true
  }

  for (const sourceBlock of sourceBlocks) {
    const response = await deletePersistedBlock(sourceBlock)
    if (!response.success) {
      saveStatus.value = 'error'
      await loadPlan()
      return true
    }
  }

  const sourceIds = new Set(sourceBlocks.map((block) => block.id))
  blocks.value = blocks.value.filter((block) => !sourceIds.has(block.id))
  selectedBlockIds.value = new Set()
  await persistCurrentOrder()
  saveStatus.value = 'saved'
  return true
}

const onRowDragOver = (event, index) => {
  if (!dragState.value.draggingId) return
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = (event.clientY - rect.top) / Math.max(rect.height, 1)
  const position = event.altKey
    ? (ratio < 0.5 ? 'before' : 'after')
    : (ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'merge')
  dragState.value = { ...dragState.value, overIndex: index, position }
}

const onRowDrop = async (index, event = null) => {
  if (!dragState.value.draggingId) return
  const { draggingIds, draggingId, position } = dragState.value
  const targetBlock = blocks.value[index]
  if (!targetBlock) {
    clearDragState()
    return
  }

  if (draggingIds.includes(targetBlock.id)) {
    clearDragState()
    return
  }

  if (position === 'merge') {
    const merged = await mergeBlocksInto(targetBlock, draggingIds)
    if (merged) {
      activeBlockId.value = targetBlock.id
      clearDragState()
      return
    }
  }

  const movingBlocks = blocks.value
    .filter((block) => draggingIds.includes(block.id))
    .map((block) => ({
      ...block,
      content: cloneContent(block.content)
    }))
  const nextBlocks = blocks.value.filter((block) => !draggingIds.includes(block.id))
  const targetIndex = nextBlocks.findIndex((block) => block.id === targetBlock.id)
  const insertionIndex = targetIndex === -1
    ? nextBlocks.length
    : (position === 'before' ? targetIndex : targetIndex + 1)

  nextBlocks.splice(insertionIndex, 0, ...movingBlocks)
  blocks.value = nextBlocks

  if (!planId.value) {
    markDirty()
  } else {
    const saved = await persistCurrentOrder()
    saveStatus.value = saved ? 'saved' : 'error'
  }

  activeBlockId.value = draggingId
  clearDragState()
}

const onHandleDragEnd = () => {
  suppressHandleClickUntil.value = Date.now() + 180
  clearDragState()
}

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const buildWorkspaceBackup = async () => {
  if (!planStore.plans.length) {
    await planStore.loadPlans()
  }
  await Promise.all(planStore.plans.map(async (plan) => {
    if (!planStore.getBlocks(plan.id)?.length) {
      await planStore.loadBlocks(plan.id)
    }
  }))

  return {
    plans: planStore.plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      status: plan.status,
      priority: plan.priority,
      planType: plan.type,
      customTypeName: plan.custom_type_name || '',
      dueDate: plan.due_date,
      blocks: (planStore.getBlocks(plan.id) || []).map((block, index) => ({
        id: block.id,
        type: block.type,
        order: block.order || index + 1,
        content: block.content || createBlockContent(block.type)
      }))
    }))
  }
}

const handleExport = async (format) => {
  showExportMenu.value = false
  if (format === 'workspace') {
    const workspace = await buildWorkspaceBackup()
    await exportWorkspaceBackup(workspace, `${title.value || '计划'}-workspace-backup`)
    return
  }

  await exportPlan({
    title: title.value || '计划',
    dueDate: dueDate.value,
    status: status.value,
    priority: priority.value,
    planType: planType.value,
    customTypeName: customTypeName.value,
    blocks: blocks.value
  }, format)
}

const triggerImport = () => {
  fileInputRef.value?.click()
}

const handleImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (blocks.value.length && !(await confirmDialog('导入会替换当前页面中的块内容，是否继续？'))) {
    event.target.value = ''
    return
  }

  const res = await importPlan(file)
  if (res.success) {
    await replaceAllBlocks({
      title: res.title,
      dueDate: res.dueDate,
      status: res.status,
      priority: res.priority,
      planType: res.planType,
      customTypeName: res.customTypeName,
      blocks: res.blocks
    })
  } else {
    await alertDialog(res.error || '导入失败，请检查文件格式', '导入失败')
  }
  event.target.value = ''
}

const deleteCurrentPlan = async () => {
  if (!planId.value) return
  if (!(await confirmDialog(`确认要删除计划“${title.value || '无标题'}”吗？`))) return
  const res = await planStore.deletePlan(planId.value)
  if (res.success) router.push('/plan')
}

const aiPanelActions = {
  closeAiPanel, openAiPanel,
  runAiWorkspaceChat, resetAiWorkspaceChat, setChatPrompt,
  loadAiConversations, selectAiConversation, startNewAiConversation, deleteCurrentAiConversation,
  ensureAiMediaModelsLoaded, handleAiImageFiles, removeAiImageSource, runAiImage,
  pollAiImageStatus, formatAiVideoTimestamp, insertGeneratedImageBlock, loadAiImageHistory,
  restoreAiImageTask, deleteAiImageHistory, getAiImageModeLabel, handleAiVideoUploadFiles,
  appendAiVideoSourceUrl, removeAiVideoSource, setAiVideoResolution, runAiVideo,
  pollAiVideoStatus, insertGeneratedVideoBlock, loadAiVideoHistory, restoreAiVideoTask,
  deleteAiVideoHistory, getAiVideoModeLabel, isAiCoolingDown, getAiActionButtonText
}
const confirmLeaveIfNeeded = async () => {
  if (!hasUnsavedChanges.value) return true
  const saved = await saveEverything()
  if (saved) return true
  return confirmDialog('自动保存失败，离开页面可能会丢失修改，仍然要离开吗？')
}

const handleBack = async () => {
  if (!(await confirmLeaveIfNeeded())) return
  router.push('/plan')
}

watch(() => `${route.params.id}:${route.query.editorPageId || ''}`, loadPlan, { immediate: true })
watch(() => commandMenu.value.query, () => {
  commandMenu.value.highlight = 0
  if (!commandMenu.value.query.trim() && commandMenu.value.show) {
    commandMenu.value.selectedCategory = commandItems[0]?.category || 'all'
  }
})
watch(() => visibleCommandItems.value.length, (length) => {
  if (!length) {
    commandMenu.value.highlight = 0
    return
  }
  if (commandMenu.value.highlight > length - 1) {
    commandMenu.value.highlight = length - 1
  }
})
watch(aiSelectedModel, (model) => {
  if (!model) return
  workspaceAiStore.setSelectedModel?.(model)
  aiImageModel.value = model
  aiVideoModel.value = model
})
watch(unscheduledTypeOptions, (options) => {
  if (unscheduledTypeFilter.value === 'all') return
  if (!options.some((option) => option.value === unscheduledTypeFilter.value)) {
    unscheduledTypeFilter.value = 'all'
  }
})
watch(
  () => blocks.value.map((block) => String(block.id)).join(','),
  () => {
    if (aiComposer.value.context?.blockId && !getBlockById(aiComposer.value.context.blockId)) {
      closeAiComposer()
    }
    if (inlineAiToolbar.value.blockId && !getBlockById(inlineAiToolbar.value.blockId)) {
      closeInlineAiToolbar()
    }
    if (inlineFormatToolbar.value.blockId && !getBlockById(inlineFormatToolbar.value.blockId)) {
      closeInlineFormatToolbar()
    }
  }
)
onBeforeRouteLeave(async () => {
  const canLeave = await confirmLeaveIfNeeded()
  if (!canLeave) return false
  clearAllBlockSaveTimers()
  clearAiImagePolling()
  clearAiVideoPolling()
  return true
})

onMounted(() => {
  runWhenIdle(() => {
    void Promise.allSettled([
      loadEditorPageTree(),
      loadAiSkills({ silent: true })
    ])
  }, 300)
  aiCooldownTimer = window.setInterval(() => {
    aiCooldownTick.value = Date.now()
  }, 1000)

  const onKeydown = async (event) => {
    if (event.defaultPrevented) return

    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const formatContext = buildInlineFormatContextFromElement(document.activeElement, { allowCollapsed: true })
      if (formatContext) {
        const key = event.key.toLowerCase()
        if (key === 'b') {
          event.preventDefault()
          await applyInlineFormat('bold')
          return
        }
        if (key === 'i') {
          event.preventDefault()
          await applyInlineFormat('italic')
          return
        }
        if (key === '`') {
          event.preventDefault()
          await applyInlineFormat('code')
          return
        }
        if (key === 'k') {
          event.preventDefault()
          await applyInlineFormat('link')
          return
        }
        if (event.shiftKey && key === 's') {
          event.preventDefault()
          await applyInlineFormat('strike')
          return
        }
        if (event.shiftKey && key === 'h') {
          event.preventDefault()
          await applyInlineFormat('highlight')
          return
        }
      }
    }

    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlockIds.value.size) {
      if (!isEditableElement(event.target)) {
        event.preventDefault()
        await deleteSelectedBlocks()
        return
      }
    }

    if (event.key === 'Escape') {
      if (selectedBlockIds.value.size) {
        clearSelectedBlocks()
      }
      finishBlockSelection()
      if (blockTypeSelector.value.show) {
        closeBlockTypeSelector()
        return
      }
      if (aiComposer.value.show) {
        closeAiComposer()
        return
      }
      if (aiPanel.value.show) {
        closeAiPanel()
        return
      }
      closeRowMenu()
      closeCommandMenu()
      closeInlineAiToolbar()
      closeInlineFormatToolbar()
      showExportMenu.value = false
      return
    }

    if ((event.ctrlKey || event.metaKey) && !event.altKey && !isEditableElement(event.target)) {
      const key = event.key.toLowerCase()
      if (key === 'a') {
        event.preventDefault()
        selectedBlockIds.value = new Set(blocks.value.map((block) => block.id))
        return
      }
      if (key === 'd') {
        event.preventDefault()
        await duplicateActionBlocks()
        return
      }
      if (event.shiftKey && event.key === 'ArrowUp') {
        event.preventDefault()
        await moveActionBlocks(-1)
        return
      }
      if (event.shiftKey && event.key === 'ArrowDown') {
        event.preventDefault()
        await moveActionBlocks(1)
        return
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (aiPanel.value.show) {
        closeAiPanel()
        return
      }
      openAiComposerFromActiveBlock()
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
      const context = buildInlineAiContextFromElement(document.activeElement, { allowCollapsed: true })
      if (context) {
        event.preventDefault()
        openAiComposer(context)
      }
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      await saveEverything()
    }
  }

  const onWindowClick = (event) => {
    const target = event.target
    if (rowMenu.value.show && !target.closest('.plan-row-select') && !target.closest('.row-menu-item')) {
      closeRowMenu()
    }
    if (commandMenu.value.show && !target.closest('.slash-panel')) {
      closeCommandMenu()
    }
    if (
      inlineAiToolbar.value.show &&
      !target.closest('.inline-ai-toolbar') &&
      !target.closest('.inline-format-toolbar') &&
      !target.closest('.plan-row')
    ) {
      closeInlineAiToolbar()
      closeInlineFormatToolbar()
    }
    if (
      selectedBlockIds.value.size
      && !blockSelection.value.active
      && !event.ctrlKey
      && !event.metaKey
      && !event.shiftKey
      && !target.closest('.plan-row-select')
    ) {
      if (!target.closest('.plan-row-selected') && !target.closest('.plan-row-handle')) {
        clearSelectedBlocks()
      }
    }
  }

  const onSelectionChange = () => {
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }

  const onEditorMousemove = (event) => {
    if (!blockSelection.value.active) return
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.plan-row')
    if (!row) return
    const index = blocks.value.findIndex((block) => String(block.id) === row.dataset.blockId)
    if (index >= 0) extendBlockSelection(index)
  }

  const onEditorMouseup = () => {
    if (blockSelection.value.active) {
      finishBlockSelection()
    }
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }

  const onEditorKeyup = () => {
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }

  const onResize = () => {
    closeInlineAiToolbar()
    closeInlineFormatToolbar()
  }

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('mousemove', onEditorMousemove)
  document.addEventListener('mouseup', onEditorMouseup)
  document.addEventListener('keyup', onEditorKeyup)
  document.addEventListener('keydown', editorKeyboard.handleKeydown)
  window.addEventListener('resize', onResize)
  window.addEventListener('click', onWindowClick)
  removeKeydownListener = () => document.removeEventListener('keydown', onKeydown)
  removeSelectionChangeListener = () => document.removeEventListener('selectionchange', onSelectionChange)
  removeMousemoveListener = () => document.removeEventListener('mousemove', onEditorMousemove)
  removeMouseupListener = () => document.removeEventListener('mouseup', onEditorMouseup)
  removeEditorKeyupListener = () => document.removeEventListener('keyup', onEditorKeyup)
  removeEditorHistoryKeydown = () => document.removeEventListener('keydown', editorKeyboard.handleKeydown)
  removeResizeListener = () => window.removeEventListener('resize', onResize)
  removeClickListener = () => window.removeEventListener('click', onWindowClick)
  nextTick(() => resizeTitle())
})

onBeforeUnmount(() => {
  clearAllBlockSaveTimers()
  clearAiImagePolling()
  clearAiVideoPolling()
  if (aiCooldownTimer) window.clearInterval(aiCooldownTimer)
  if (removeKeydownListener) removeKeydownListener()
  if (removeSelectionChangeListener) removeSelectionChangeListener()
  if (removeMousemoveListener) removeMousemoveListener()
  if (removeMouseupListener) removeMouseupListener()
  if (removeEditorKeyupListener) removeEditorKeyupListener()
  if (removeEditorHistoryKeydown) removeEditorHistoryKeydown()
  if (removeResizeListener) removeResizeListener()
  if (removeClickListener) removeClickListener()
})
</script>

<style scoped>
.plan-editor-workbench {
  display: grid;
  grid-template-columns: minmax(170px, 0.18fr) minmax(0, 1fr) minmax(220px, 0.24fr);
  align-items: start;
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

.plan-editor-workbench-ai-open {
  grid-template-columns: minmax(150px, 0.16fr) minmax(520px, 1fr) minmax(420px, 0.42fr);
}

.plan-editor-left-rail {
  display: grid;
  align-content: start;
  gap: 1rem;
  min-width: 0;
}

.plan-editor-rail {
  position: sticky;
  top: 6.3rem;
  display: grid;
  gap: 1rem;
  min-width: 0;
  border: 1px solid rgba(228, 228, 231, 0.86);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.66);
  padding: 1rem;
}

.dark .plan-editor-rail {
  border-color: rgba(63, 63, 70, 0.86);
  background: rgba(18, 18, 20, 0.66);
}

.plan-rail-heading {
  display: grid;
  gap: 0.35rem;
}

.plan-rail-heading strong {
  color: rgb(24 24 27);
  font-size: 1rem;
  letter-spacing: -0.03em;
}

.dark .plan-rail-heading strong {
  color: white;
}

.plan-rail-eyebrow,
.plan-inspector-label {
  color: rgb(113 113 122);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.plan-outline-list {
  display: grid;
  gap: 0.2rem;
}

.plan-outline-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 0.7rem;
  background: transparent;
  color: rgb(82 82 91);
  padding: 0.52rem 0.45rem;
  text-align: left;
  font-size: 0.75rem;
  transition: background 150ms ease, color 150ms ease;
}

.plan-outline-item:hover {
  background: rgba(228, 228, 231, 0.72);
  color: rgb(24 24 27);
}

.plan-outline-level-2 {
  padding-left: 0.85rem;
}

.plan-outline-level-3 {
  padding-left: 1.3rem;
}

.plan-outline-dot {
  width: 0.32rem;
  height: 0.32rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgb(161 161 170);
}

.plan-rail-empty {
  color: rgb(161 161 170);
  font-size: 0.73rem;
  line-height: 1.65;
}

.plan-inspector-section {
  display: grid;
  gap: 0.38rem;
  border-bottom: 1px solid rgba(228, 228, 231, 0.72);
  padding-bottom: 0.8rem;
}

.dark .plan-inspector-section {
  border-color: rgba(63, 63, 70, 0.72);
}

.plan-inspector-value {
  overflow: hidden;
  color: rgb(39 39 42);
  font-size: 0.82rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .plan-inspector-value {
  color: rgb(244 244 245);
}

.plan-inspector-divider {
  height: 1px;
  background: rgba(228, 228, 231, 0.72);
}

.dark .plan-inspector-divider {
  background: rgba(63, 63, 70, 0.72);
}

.plan-inspector-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 0;
  border-radius: 0.9rem;
  background: transparent;
  color: rgb(39 39 42);
  padding: 0.7rem 0.5rem;
  text-align: left;
  transition: background 150ms ease;
}

.plan-inspector-action:hover {
  background: rgba(228, 228, 231, 0.6);
}

.plan-inspector-action strong,
.plan-inspector-action small {
  display: block;
}

.plan-inspector-action strong {
  font-size: 0.78rem;
}

.plan-inspector-action small {
  margin-top: 0.25rem;
  color: rgb(113 113 122);
  font-size: 0.68rem;
  line-height: 1.45;
}

.plan-inspector-timeline {
  min-width: 0;
}

.plan-inspector-timeline-item {
  display: grid;
  grid-template-columns: 2.8rem minmax(0, 1fr);
  gap: 0.55rem;
  border-bottom: 1px solid rgba(228, 228, 231, 0.72);
  padding: 0.55rem 0;
}

.plan-inspector-timeline-item > span {
  color: rgb(113 113 122);
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
}

.plan-inspector-timeline-item strong,
.plan-inspector-timeline-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-inspector-timeline-item strong {
  color: rgb(39 39 42);
  font-size: 0.7rem;
  font-weight: 750;
}

.plan-inspector-timeline-item small {
  margin-top: 0.18rem;
  color: rgb(161 161 170);
  font-size: 0.62rem;
}

.dark .plan-inspector-timeline-item {
  border-color: rgba(63, 63, 70, 0.72);
}

.dark .plan-inspector-timeline-item strong {
  color: rgb(244 244 245);
}

.dark .plan-inspector-action {
  color: rgb(244 244 245);
}

.plan-editor-shell {
  min-height: calc(100vh - 7rem);
}

.plan-editor-surface {
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  padding: 2rem 2rem 3rem;
}

.plan-load-error {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.plan-editor-loading {
  display: grid;
  gap: 0.85rem;
  min-height: 360px;
  align-content: center;
  padding: 3rem clamp(1rem, 5vw, 5rem);
  color: var(--workbench-text-muted, #71717a);
  font-size: 0.78rem;
  font-weight: 700;
}

.plan-loading-title,
.plan-loading-line {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(228, 228, 231, 0.72);
}

.plan-loading-title {
  width: min(440px, 80%);
  height: 2.6rem;
  margin-bottom: 0.65rem;
}

.plan-loading-line {
  height: 0.82rem;
}

.plan-loading-gap {
  height: 1.25rem;
}

.plan-loading-title::after,
.plan-loading-line::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
  content: '';
  transform: translateX(-100%);
  animation: plan-loading-sheen 1.25s ease-in-out infinite;
}

.dark .plan-loading-title,
.dark .plan-loading-line {
  background: rgba(63, 63, 70, 0.62);
}

.dark .plan-loading-title::after,
.dark .plan-loading-line::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
}

.dark .plan-editor-surface {
  border-color: rgba(39, 39, 42, 0.9);
  background: rgba(9, 9, 11, 0.92);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.plan-title-input {
  width: 100%;
  resize: none;
  overflow: hidden;
  border: 0;
  background: transparent;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.05em;
  color: rgb(9 9 11);
  outline: none;
}

.plan-title-input::placeholder {
  color: rgb(161 161 170);
}

.dark .plan-title-input {
  color: white;
}

.plan-meta-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border-radius: 18px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(250, 250, 250, 0.85);
  padding: 0.85rem 0.95rem;
}

.dark .plan-meta-field {
  border-color: rgba(39, 39, 42, 0.9);
  background: rgba(24, 24, 27, 0.9);
}

.plan-meta-field span {
  font-size: 0.75rem;
  color: rgb(113 113 122);
}

.plan-meta-field select,
.plan-meta-field input {
  border: 0;
  background: transparent;
  color: rgb(24 24 27);
  font-size: 0.95rem;
  outline: none;
  padding: 0;
}

.dark .plan-meta-field select,
.dark .plan-meta-field input {
  color: white;
}

.plan-meta-type-row {
  display: flex;
  min-width: 0;
}

.plan-meta-type-row-custom {
  align-items: center;
  gap: 0.8rem;
}

.plan-meta-type-row-custom select {
  flex: 0 0 8.5rem;
}

.plan-meta-type-input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 2.55rem;
  border: 1px solid rgba(228, 228, 231, 0.92) !important;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72) !important;
  padding: 0 0.9rem !important;
}

.plan-meta-type-input::placeholder {
  color: rgb(161 161 170);
}

.dark .plan-meta-type-input {
  border-color: rgba(63, 63, 70, 0.92) !important;
  background: rgba(9, 9, 11, 0.55) !important;
}

@media (max-width: 1023px) {
  .plan-editor-workbench {
    display: block;
  }

  .plan-editor-shell {
    min-height: auto;
    padding-inline: 0 !important;
    padding-top: 0.35rem !important;
    padding-bottom: calc(8rem + env(safe-area-inset-bottom, 0px)) !important;
  }

  .plan-editor-rail {
    position: static;
    margin: 0.75rem 0;
  }

  .plan-editor-outline-rail,
  .plan-editor-inspector-rail {
    display: none;
  }

  .plan-meta-type-row-custom {
    flex-direction: column;
    align-items: stretch;
    gap: 0.55rem;
  }

  .plan-meta-type-row-custom select {
    flex-basis: auto;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .plan-editor-workbench-ai-open {
    grid-template-columns: minmax(0, 1fr) minmax(400px, 0.48fr);
  }

  .plan-editor-workbench-ai-open .plan-editor-left-rail {
    display: none;
  }
}

.plan-document {
  position: relative;
}

.plan-empty-state {
  border-radius: 28px;
  border: 1px dashed rgba(212, 212, 216, 0.9);
  padding: 5rem 1.5rem;
  text-align: center;
  cursor: text;
}

.dark .plan-empty-state {
  border-color: rgba(63, 63, 70, 0.9);
}

.plan-row {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: start;
  gap: 0.5rem;
  padding: 0.15rem 0;
  border-radius: 16px;
}

.plan-row::before,
.plan-row::after {
  content: '';
  position: absolute;
  left: 54px;
  right: 0;
  height: 2px;
  background: rgb(24 24 27);
  opacity: 0;
  pointer-events: none;
}

.dark .plan-row::before,
.dark .plan-row::after {
  background: white;
}

.plan-row-drop-before::before {
  top: -2px;
  opacity: 1;
}

.plan-row-drop-after::after {
  bottom: -2px;
  opacity: 1;
}

.plan-row-active {
  background: rgba(244, 244, 245, 0.8);
}

.plan-row-selected {
  background: rgba(228, 228, 231, 0.78);
}

.plan-row-dragging {
  opacity: 0.45;
}

.dark .plan-row-active {
  background: rgba(24, 24, 27, 0.72);
}

.dark .plan-row-selected {
  background: rgba(39, 39, 42, 0.88);
}

.plan-row-gutter {
  display: grid;
  grid-template-columns: repeat(2, 24px);
  grid-template-rows: 28px;
  justify-content: center;
  align-items: start;
  gap: 0.2rem;
  padding-top: 0.35rem;
}

.plan-row-select,
.plan-row-handle,
.plan-row-plus,
.plan-row-ai {
  display: inline-flex;
  height: 24px;
  width: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: rgba(244, 244, 245, 0.86);
  color: rgb(82 82 91);
  opacity: 1;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(14px);
  transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.plan-row-handle {
  height: 28px;
  width: 28px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(255, 255, 255, 0.96);
  color: rgb(39 39 42);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.plan-row-handle span {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.12em;
  transform: translateY(-1px);
}

.dark .plan-row-handle {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(24, 24, 27, 0.98);
  color: white;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.34);
}

.plan-row-select span {
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  border: 1.5px solid currentColor;
}

.plan-row-select-active {
  opacity: 1;
  background: rgba(24, 24, 27, 0.92);
  color: white;
}

.plan-row-select-active span {
  background: currentColor;
}

.dark .plan-row-select-active {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.plan-row-select:hover,
.plan-row-handle:hover,
.plan-row-plus:hover,
.plan-row-ai:hover {
  background: rgba(228, 228, 231, 0.96);
  color: rgb(24 24 27);
}

.dark .plan-row-select:hover,
.dark .plan-row-handle:hover,
.dark .plan-row-plus:hover,
.dark .plan-row-ai:hover {
  background: rgba(39, 39, 42, 0.98);
  color: white;
}

.plan-row-ai {
  width: 34px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.plan-row-content {
  min-width: 0;
  padding-top: 0.05rem;
}

.plan-row-content :deep(textarea) {
  overflow-y: hidden;
}

.inline-ai-toolbar {
  position: fixed;
  z-index: 1250;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  max-width: min(720px, calc(100vw - 24px));
  overflow-x: auto;
  transform: translateX(-50%) translateY(calc(-100% - 2px));
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(20px);
  padding: 0.35rem;
}

.inline-format-toolbar {
  z-index: 1246;
}

.dark .inline-ai-toolbar {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(9, 9, 11, 0.82);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
}

.inline-ai-toolbar::-webkit-scrollbar {
  height: 4px;
}

.inline-ai-toolbar::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(161, 161, 170, 0.55);
}

.inline-ai-toolbar-btn,
.inline-ai-toolbar-primary,
.inline-ai-toolbar-link,
.inline-ai-chip,
.inline-ai-close,
.inline-ai-run-btn,
.inline-ai-apply-btn,
.inline-ai-ghost-btn {
  border: 0;
  border-radius: 9999px;
  font-size: 0.78rem;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.inline-ai-toolbar-primary,
.inline-ai-toolbar-btn {
  min-height: 36px;
  border: 1px solid transparent;
  background: transparent;
  color: rgb(63 63 70);
  padding: 0.5rem 0.9rem;
  white-space: nowrap;
  font-weight: 600;
}

.inline-ai-toolbar-primary {
  background: rgba(24, 24, 27, 0.08);
  color: rgb(24 24 27);
  font-weight: 600;
}

.inline-ai-toolbar-btn-active {
  border-color: rgba(24, 24, 27, 0.08);
  background: rgba(24, 24, 27, 0.92);
  color: white;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
}

.inline-ai-toolbar-primary:hover,
.inline-ai-toolbar-btn:hover {
  background: rgba(228, 228, 231, 0.9);
  color: rgb(24 24 27);
}

.inline-ai-toolbar-link {
  background: transparent;
  color: rgb(113 113 122);
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
}

.inline-ai-toolbar-link:hover {
  background: rgba(244, 244, 245, 0.96);
  color: rgb(24 24 27);
}

.dark .inline-ai-toolbar-primary,
.dark .inline-ai-toolbar-btn {
  color: rgb(228 228 231);
}

.dark .inline-ai-toolbar-btn-active {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.96);
  color: rgb(9 9 11);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.32);
}

.dark .inline-ai-toolbar-primary {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.dark .inline-ai-toolbar-primary:hover,
.dark .inline-ai-toolbar-btn:hover {
  background: rgba(39, 39, 42, 0.96);
  color: white;
}

.dark .inline-ai-toolbar-link {
  color: rgb(161 161 170);
}

.dark .inline-ai-toolbar-link:hover {
  background: rgba(39, 39, 42, 0.96);
  color: white;
}

.plan-new-line {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: rgb(113 113 122);
  margin-top: 1rem;
  padding: 0.55rem 0;
  font-size: 0.95rem;
}

.plan-new-line:hover {
  color: rgb(24 24 27);
}

.dark .plan-new-line:hover {
  color: white;
}

.row-menu-item,
.export-menu-item {
  width: 100%;
  border: 0;
  background: transparent;
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  text-align: left;
  font-size: 0.9rem;
  color: rgb(39 39 42);
}

.row-menu-item:hover,
.export-menu-item:hover {
  background: rgba(244, 244, 245, 1);
}

.dark .row-menu-item,
.dark .export-menu-item {
  color: rgb(244 244 245);
}

.dark .row-menu-item:hover,
.dark .export-menu-item:hover {
  background: rgba(39, 39, 42, 1);
}

.slash-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
}

.slash-panel {
  position: fixed;
  z-index: 1201;
  width: 320px;
  border-radius: 22px;
  border: 1px solid rgba(228, 228, 231, 0.95);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  padding: 0.65rem;
}

.dark .slash-panel {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(9, 9, 11, 0.98);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.slash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.55rem 0.45rem;
  font-size: 0.75rem;
  color: rgb(113 113 122);
}

.slash-search {
  width: 100%;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 14px;
  background: transparent;
  padding: 0.7rem 0.85rem;
  font-size: 0.9rem;
  outline: none;
  color: rgb(24 24 27);
}

.dark .slash-search {
  border-color: rgba(39, 39, 42, 0.95);
  color: white;
}

.slash-category-tabs {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0 0.2rem 0.6rem;
  margin-bottom: 0.3rem;
  scrollbar-width: none;
}

.slash-category-tabs::-webkit-scrollbar {
  display: none;
}

.slash-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.96);
  padding: 0.38rem 0.72rem;
  font-size: 0.74rem;
  color: rgb(82 82 91);
  transition: all 0.18s ease;
}

.slash-category-chip:hover,
.slash-category-chip-active {
  border-color: rgba(24, 24, 27, 0.12);
  background: rgb(24 24 27);
  color: white;
}

.dark .slash-category-chip {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.96);
  color: rgb(212 212 216);
}

.dark .slash-category-chip:hover,
.dark .slash-category-chip-active {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(244, 244, 245, 0.12);
  color: white;
}

.slash-category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(113, 113, 122, 0.14);
  padding: 0 0.35rem;
  font-size: 0.68rem;
}

.slash-list {
  max-height: 340px;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.slash-list::-webkit-scrollbar {
  width: 8px;
}

.slash-list::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(161, 161, 170, 0.35);
}

.dark .slash-list::-webkit-scrollbar-thumb {
  background: rgba(113, 113, 122, 0.5);
}

.slash-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  background: transparent;
  border-radius: 16px;
  padding: 0.7rem 0.75rem;
  text-align: left;
}

.slash-item:hover,
.slash-item-active {
  background: rgba(244, 244, 245, 1);
}

.dark .slash-item:hover,
.dark .slash-item-active {
  background: rgba(39, 39, 42, 1);
}

.slash-item-icon {
  display: inline-flex;
  height: 34px;
  width: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(244, 244, 245, 1);
  font-size: 0.8rem;
  font-weight: 700;
  color: rgb(39 39 42);
}

.dark .slash-item-icon {
  background: rgba(39, 39, 42, 1);
  color: rgb(244 244 245);
}

.slash-item-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  flex: 1;
}

.slash-item-text span:first-child {
  font-size: 0.92rem;
  color: rgb(24 24 27);
}

.slash-item-text span:last-child {
  font-size: 0.74rem;
  color: rgb(113 113 122);
}

.dark .slash-item-text span:first-child {
  color: white;
}

.slash-item-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgba(244, 244, 245, 1);
  padding: 0.25rem 0.55rem;
  font-size: 0.68rem;
  color: rgb(113 113 122);
}

.dark .slash-item-badge {
  background: rgba(39, 39, 42, 1);
  color: rgb(212 212 216);
}

.slash-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.4rem 0.1rem;
}

.slash-page-btn {
  border: 0;
  border-radius: 9999px;
  background: rgba(244, 244, 245, 1);
  padding: 0.45rem 0.8rem;
  font-size: 0.75rem;
  color: rgb(39 39 42);
}

.slash-page-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.slash-page-indicator {
  font-size: 0.75rem;
  color: rgb(113 113 122);
}

.dark .slash-page-btn {
  background: rgba(39, 39, 42, 1);
  color: rgb(244 244 245);
}

.dark .slash-page-indicator {
  color: rgb(161 161 170);
}

.unscheduled-filter-field {
  display: grid;
  gap: 0.42rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(82 82 91);
}

.unscheduled-filter-field input,
.unscheduled-filter-field select {
  min-height: 2.65rem;
  width: 100%;
  border: 1px solid rgba(212, 212, 216, 0.9);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  padding: 0 0.9rem;
  color: rgb(24 24 27);
  font-size: 0.875rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.unscheduled-filter-field input:focus,
.unscheduled-filter-field select:focus {
  border-color: rgb(24 24 27);
  box-shadow: 0 0 0 4px rgba(24, 24, 27, 0.08);
}

.dark .unscheduled-filter-field {
  color: rgb(161 161 170);
}

.dark .unscheduled-filter-field input,
.dark .unscheduled-filter-field select {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.82);
  color: white;
}

.dark .unscheduled-filter-field input:focus,
.dark .unscheduled-filter-field select:focus {
  border-color: white;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

@media (max-width: 768px) {
  .plan-editor-surface {
    border-radius: 1.25rem;
    padding: 1rem 0.7rem 2.5rem;
    box-shadow: 0 14px 42px rgba(24, 24, 27, 0.06);
  }

  .plan-row {
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 0.25rem;
    padding-block: 0.2rem;
  }

  .plan-row::before,
  .plan-row::after {
    left: 42px;
  }

  .plan-row-gutter {
    grid-template-columns: repeat(2, 19px);
    grid-template-rows: 30px;
    opacity: 0.78;
  }

  .plan-document {
    min-height: 50dvh;
  }

  .plan-empty-state {
    border-radius: 1.15rem;
    padding: 3.25rem 1rem;
  }

  .plan-new-line {
    margin-left: 2.65rem;
    margin-bottom: 1.5rem;
  }

  .slash-panel {
    width: min(320px, calc(100vw - 24px));
  }

}

@media (max-width: 420px) {
  .plan-editor-surface {
    margin-inline: -0.15rem;
    padding-inline: 0.45rem;
  }

  .plan-row {
    grid-template-columns: 36px minmax(0, 1fr);
  }

  .plan-row::before,
  .plan-row::after {
    left: 36px;
  }

  .plan-row-gutter {
    grid-template-columns: repeat(2, 17px);
  }
}
</style>

<style scoped>
@keyframes plan-loading-sheen {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .plan-loading-title::after,
  .plan-loading-line::after {
    animation: none;
  }
}
</style>
