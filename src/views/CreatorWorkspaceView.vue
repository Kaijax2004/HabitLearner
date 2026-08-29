<template>
  <AppLayout title="内容创作">
    <div class="creator-page">
      <section class="creator-header">
        <div>
          <p class="workspace-kicker">Creator Track</p>
          <h1>从真实来源到稳定发布</h1>
          <p>内容创作不是孤立的热点列表，而是一条闭环：收集来源、判断选题、协作成稿、进入专注、发布复盘。</p>
        </div>
        <div class="creator-header-meta">
          <span>{{ summary.total || 0 }} 条进行中内容</span>
          <button type="button" class="creator-secondary-button" :disabled="isLoading" @click="loadWorkspace">
            {{ isLoading ? '同步中' : '刷新' }}
          </button>
        </div>
      </section>

      <section class="creator-command-panel">
        <article class="creator-command-card creator-command-card-primary">
          <p class="workspace-kicker">Today Focus</p>
          <h2>{{ creatorFocusItem?.title || '先建立一条可推进内容' }}</h2>
          <p>{{ creatorFocusCopy }}</p>
          <div class="creator-command-actions">
            <button v-if="creatorFocusItem" type="button" class="creator-primary-button" @click="openDetails(creatorFocusItem)">
              打开并推进
            </button>
            <button v-else type="button" class="creator-secondary-button" @click="focusQuickEntry">
              新增来源或选题
            </button>
          </div>
        </article>

        <article class="creator-command-card">
          <p class="workspace-kicker">Source Health</p>
          <strong>{{ sourceHealthLabel }}</strong>
          <p>{{ sourceHealthCopy }}</p>
          <div class="creator-source-meter" aria-label="信息来源完整度">
            <span :style="{ width: `${sourceReadiness}%` }"></span>
          </div>
        </article>

        <article class="creator-command-card creator-command-card-agent">
          <p class="workspace-kicker">Mentor-X Studio</p>
          <strong>让智能体先做判断，不替你编造来源</strong>
          <p>基于当前流水线生成选题判断、缺口检查和下一步动作。未配置模型引擎时会明确提示。</p>
          <div class="creator-agent-actions">
            <button type="button" class="creator-secondary-button" :disabled="isCreatorAiLoading" @click="askCreatorMentor('请基于我的内容流水线，判断今天最该推进哪一条内容，并给出可确认下一步。')">
              今日推进建议
            </button>
            <button type="button" class="creator-secondary-button" :disabled="isCreatorAiLoading" @click="askCreatorMentor('请检查我的内容流水线里哪些条目缺少真实来源、目标用户、核心观点或发布准备。')">
              检查信息缺口
            </button>
          </div>
        </article>
      </section>

      <section v-if="creatorAiReply || creatorAiActions.length" class="creator-ai-result">
        <div>
          <p class="workspace-kicker">Mentor-X Output</p>
          <p>{{ creatorAiReply }}</p>
        </div>
        <div v-if="creatorAiActions.length" class="creator-ai-actions">
          <span v-for="action in creatorAiActions" :key="`${action.type}-${action.action || action.title}`">
            {{ action.label || '待确认' }} · {{ action.title || action.action }}
          </span>
        </div>
      </section>

      <section class="creator-layout">
        <BaseCard :hover="false" class="creator-capture-card">
          <div class="creator-section-heading">
            <div>
              <p class="workspace-kicker">Quick Entry</p>
              <h2>新增内容</h2>
            </div>
            <span class="creator-count">{{ form.type === 'trend' ? '热点' : form.type === 'draft' ? '草稿' : '选题' }}</span>
          </div>

          <div class="creator-type-switch">
            <button
              v-for="option in typeOptions"
              :key="option.value"
              type="button"
              :class="{ 'is-active': form.type === option.value }"
              @click="form.type = option.value"
            >
              {{ option.label }}
            </button>
          </div>

          <label class="creator-field">
            <span>标题</span>
            <input v-model.trim="form.title" maxlength="255" placeholder="例如：平台开始偏好更短的知识型视频" />
          </label>

          <label class="creator-field">
            <span>{{ form.type === 'trend' ? '热点说明' : '内容说明' }}</span>
            <textarea
              v-model.trim="form.body"
              rows="5"
              :placeholder="form.type === 'trend' ? '记录你看到的变化、关键信息和为什么值得关注。' : '写下核心观点、目标受众或下一步制作说明。'"
            ></textarea>
          </label>

          <template v-if="form.type === 'trend'">
            <div class="creator-two-column">
              <label class="creator-field">
                <span>来源名称</span>
                <input v-model.trim="form.sourceName" placeholder="例如：平台热榜 / 官方公告" />
              </label>
              <label class="creator-field">
                <span>来源 URL</span>
                <input v-model.trim="form.sourceUrl" type="url" placeholder="https://..." />
              </label>
            </div>
            <label class="creator-field">
              <span>来源时间</span>
              <input v-model="form.sourcePublishedAt" type="datetime-local" />
            </label>
          </template>

          <div class="creator-two-column">
            <label class="creator-field">
              <span>目标平台</span>
              <select v-model="form.platform">
                <option value="">暂不指定</option>
                <option value="小红书">小红书</option>
                <option value="抖音">抖音</option>
                <option value="视频号">视频号</option>
                <option value="B 站">B 站</option>
                <option value="公众号">公众号</option>
              </select>
            </label>
            <label class="creator-field">
              <span>标签</span>
              <input v-model.trim="form.tags" placeholder="成长,效率,AI" />
            </label>
          </div>

          <details class="creator-details">
            <summary>补充内容字段</summary>
            <div class="creator-details-grid">
              <label class="creator-field">
                <span>目标用户</span>
                <input v-model.trim="form.targetAudience" placeholder="例如：刚开始做自媒体的上班族" />
              </label>
              <label class="creator-field">
                <span>热度等级</span>
                <select v-model="form.hotLevel">
                  <option value="">暂不判断</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </label>
              <label class="creator-field creator-field-wide">
                <span>核心观点</span>
                <textarea v-model.trim="form.corePoint" rows="2" placeholder="这条内容最想让用户记住什么？"></textarea>
              </label>
              <label class="creator-field creator-field-wide">
                <span>开头钩子</span>
                <textarea v-model.trim="form.hook" rows="2" placeholder="第一句话如何让用户继续看下去？"></textarea>
              </label>
              <label class="creator-field creator-field-wide">
                <span>内容大纲</span>
                <textarea v-model.trim="form.outline" rows="3" placeholder="按段落或镜头写下内容结构。"></textarea>
              </label>
              <label class="creator-field">
                <span>发布时间</span>
                <input v-model="form.publishAt" type="datetime-local" />
              </label>
              <label class="creator-field">
                <span>发布链接</span>
                <input v-model.trim="form.publishUrl" type="url" placeholder="发布后粘贴链接" />
              </label>
              <label class="creator-field creator-field-wide">
                <span>复盘结论</span>
                <textarea v-model.trim="form.reviewNotes" rows="2" placeholder="发布后记录结果和下一次要调整的地方。"></textarea>
              </label>
            </div>
          </details>

          <button type="button" class="creator-primary-button" :disabled="isCreating" @click="submitItem">
            {{ isCreating ? '保存中...' : form.type === 'trend' ? '放入热点池' : '加入内容流水线' }}
          </button>
          <p class="creator-note">热点尽量保留来源和时间，后续 Mentor-X 只基于真实素材协作成稿。</p>
        </BaseCard>

        <section class="creator-pipeline">
          <div class="creator-pipeline-toolbar">
            <div>
              <p class="workspace-kicker">Pipeline</p>
              <h2>内容流水线</h2>
              <p class="creator-toolbar-copy">热点雷达只展示你保存的真实来源，不自动编造趋势。</p>
            </div>
            <div class="creator-toolbar-actions">
              <div class="creator-filter-switch" role="tablist" aria-label="内容筛选">
                <button v-for="option in filterOptions" :key="option.value" type="button" :class="{ 'is-active': activeFilter === option.value }" @click="activeFilter = option.value">
                  {{ option.label }}
                </button>
              </div>
              <div class="creator-stage-summary">
                <span v-for="stage in stages" :key="stage.value">
                  {{ stage.short }} {{ summary.counts?.[stage.value] || 0 }}
                </span>
              </div>
              <div class="creator-view-switch" role="tablist" aria-label="内容视图">
                <button type="button" :class="{ 'is-active': viewMode === 'list' }" @click="viewMode = 'list'">列表</button>
                <button type="button" :class="{ 'is-active': viewMode === 'board' }" @click="viewMode = 'board'">流水线</button>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="creator-error">{{ errorMessage }}</div>
          <div v-if="isLoading" class="creator-loading">正在同步内容工作台...</div>
          <div v-else-if="viewMode === 'list'" class="creator-list">
            <div class="creator-list-header">
              <span>内容</span>
              <span>阶段</span>
              <span>平台</span>
              <span>下一步</span>
            </div>
            <article v-for="item in visibleItems" :key="item.id" class="creator-list-row">
              <div class="creator-list-title creator-list-open" role="button" tabindex="0" @click="openDetails(item)" @keydown.enter="openDetails(item)" @keydown.space.prevent="openDetails(item)">
                <div class="creator-item-topline">
                  <span>{{ typeLabel(item.type) }}</span>
                  <button type="button" title="归档" @click.stop="archiveItem(item)">×</button>
                </div>
                <h3>{{ item.title }}</h3>
                <p v-if="item.body">{{ item.body }}</p>
                <p v-if="item.metadata?.corePoint" class="creator-metadata-preview">核心观点：{{ item.metadata.corePoint }}</p>
                <a v-if="item.source_url" :href="item.source_url" target="_blank" rel="noreferrer" @click.stop>
                  {{ item.source_name || '查看来源' }}
                </a>
              </div>
              <select :value="item.stage" @change="moveItem(item, $event.target.value)">
                <option v-for="option in stages" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <span class="creator-platform">{{ item.platform || '未指定' }}</span>
              <span class="creator-next-step">{{ nextStepLabel(item.stage) }}</span>
            </article>
            <div v-if="!visibleItems.length" class="creator-empty">当前筛选下还没有内容，先记录一个热点或选题。</div>
          </div>
          <div v-else class="creator-board">
            <article v-for="stage in stages" :key="stage.value" class="creator-column">
              <header>
                <div>
                  <span class="creator-column-dot" :class="`stage-${stage.value}`"></span>
                  <strong>{{ stage.label }}</strong>
                </div>
                <span>{{ itemsByStage(stage.value).length }}</span>
              </header>

              <div class="creator-column-list">
              <article v-for="item in itemsByStage(stage.value)" :key="item.id" class="creator-item-card" @click="openDetails(item)">
                  <div class="creator-item-topline">
                    <span>{{ typeLabel(item.type) }}</span>
                    <button type="button" title="归档" @click.stop="archiveItem(item)">×</button>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p v-if="item.body">{{ item.body }}</p>
                  <p v-if="item.metadata?.corePoint" class="creator-metadata-preview">核心观点：{{ item.metadata.corePoint }}</p>
                  <a v-if="item.source_url" :href="item.source_url" target="_blank" rel="noreferrer" @click.stop>
                    {{ item.source_name || '查看来源' }}
                  </a>
                  <div class="creator-item-footer">
                    <span v-if="item.platform">{{ item.platform }}</span>
                    <select :value="item.stage" @click.stop @change.stop="moveItem(item, $event.target.value)">
                      <option v-for="option in stages" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </div>
                </article>
                <div v-if="!itemsByStage(stage.value).length" class="creator-empty">暂无内容</div>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="isDetailOpen" class="creator-drawer-backdrop" @click.self="closeDetails">
        <aside class="creator-drawer" aria-label="内容详情">
          <header class="creator-drawer-header">
            <div>
              <p class="workspace-kicker">Content Detail</p>
              <h2>编辑内容</h2>
            </div>
            <button type="button" class="creator-drawer-close" aria-label="关闭" @click="closeDetails">×</button>
          </header>

          <div class="creator-drawer-body">
            <label class="creator-field">
              <span>标题</span>
              <input v-model.trim="detailDraft.title" maxlength="255" />
            </label>

            <div class="creator-two-column">
              <label class="creator-field">
                <span>类型</span>
                <select v-model="detailDraft.type">
                  <option v-for="option in typeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label class="creator-field">
                <span>内容阶段</span>
                <select v-model="detailDraft.stage">
                  <option v-for="option in stages" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
            </div>

            <label class="creator-field">
              <span>正文说明</span>
              <textarea v-model.trim="detailDraft.body" rows="5"></textarea>
            </label>

            <div class="creator-two-column">
              <label class="creator-field">
                <span>来源名称</span>
                <input v-model.trim="detailDraft.sourceName" />
              </label>
              <label class="creator-field">
                <span>来源 URL</span>
                <input v-model.trim="detailDraft.sourceUrl" type="url" />
              </label>
            </div>

            <label class="creator-field">
              <span>来源时间</span>
              <input v-model="detailDraft.sourcePublishedAt" type="datetime-local" />
            </label>

            <div class="creator-two-column">
              <label class="creator-field">
                <span>目标平台</span>
                <input v-model.trim="detailDraft.platform" />
              </label>
              <label class="creator-field">
                <span>标签</span>
                <input v-model.trim="detailDraft.tags" placeholder="成长,效率,AI" />
              </label>
            </div>

            <label class="creator-field">
              <span>目标用户</span>
              <input v-model.trim="detailDraft.targetAudience" />
            </label>
            <label class="creator-field">
              <span>核心观点</span>
              <textarea v-model.trim="detailDraft.corePoint" rows="3"></textarea>
            </label>
            <label class="creator-field">
              <span>开头钩子</span>
              <textarea v-model.trim="detailDraft.hook" rows="3"></textarea>
            </label>
            <label class="creator-field">
              <span>内容大纲</span>
              <textarea v-model.trim="detailDraft.outline" rows="5"></textarea>
            </label>

            <div class="creator-two-column">
              <label class="creator-field">
                <span>发布时间</span>
                <input v-model="detailDraft.publishAt" type="datetime-local" />
              </label>
              <label class="creator-field">
                <span>发布链接</span>
                <input v-model.trim="detailDraft.publishUrl" type="url" />
              </label>
            </div>

            <label class="creator-field">
              <span>复盘结论</span>
              <textarea v-model.trim="detailDraft.reviewNotes" rows="4"></textarea>
            </label>

            <div class="creator-drawer-links">
              <button
                v-if="detailDraft.planId"
                type="button"
                class="creator-secondary-button"
                @click="router.push(`/plan/${detailDraft.planId}`)"
              >
                打开关联计划
              </button>
              <button
                v-if="['drafting', 'production'].includes(detailDraft.stage)"
                type="button"
                class="creator-secondary-button"
                @click="startFocus"
              >
                开始专注
              </button>
              <button
                v-if="!detailDraft.planId"
                type="button"
                class="creator-secondary-button"
                :disabled="isCreatingPlan"
                @click="createPlanFromItem"
              >
                {{ isCreatingPlan ? '创建中...' : '创建计划' }}
              </button>
            </div>

            <section class="creator-detail-ai">
              <div>
                <p class="workspace-kicker">Mentor-X Co-create</p>
                <h3>基于这条内容协作</h3>
                <p>只使用当前标题、来源、目标用户、核心观点和大纲做判断。信息不足时会提示补齐，不会编造热点。</p>
              </div>
              <div class="creator-agent-actions">
                <button type="button" class="creator-secondary-button" :disabled="isCreatorAiLoading" @click="askCreatorMentor('请基于当前内容条目，补出 3 个开头钩子、一个可执行大纲和下一步制作清单。', selectedItem)">
                  钩子与大纲
                </button>
                <button type="button" class="creator-secondary-button" :disabled="isCreatorAiLoading" @click="askCreatorMentor('请检查当前内容条目还缺哪些真实来源、论据、目标用户或发布准备信息。', selectedItem)">
                  缺口检查
                </button>
                <button type="button" class="creator-secondary-button" :disabled="isCreatorAiLoading" @click="askCreatorMentor('请把当前内容条目整理成发布前检查清单，并建议是否应该进入专注制作。', selectedItem)">
                  发布检查
                </button>
              </div>
            </section>

            <section v-if="detailAiReply" class="creator-detail-ai-result">
              <p class="workspace-kicker">Mentor-X Draft</p>
              <p>{{ detailAiReply }}</p>
            </section>
          </div>

          <footer class="creator-drawer-footer">
            <button type="button" class="creator-secondary-button" :disabled="isSavingDetails" @click="closeDetails">取消</button>
            <button type="button" class="creator-primary-button creator-drawer-save" :disabled="isSavingDetails" @click="saveDetails">
              {{ isSavingDetails ? '保存中...' : '保存修改' }}
            </button>
          </footer>
        </aside>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import { archiveCreatorItem, createCreatorItem, getCreatorSummary, updateCreatorItem } from '@/api/creator.js'
import { createPlan } from '@/api/plans.js'
import { chatWithMascotAssistant } from '@/api/workspace.js'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import { useWorkspaceAiStore } from '@/stores/workspaceAi.js'

const { success, error } = useToast()
const router = useRouter()
const workspaceAiStore = useWorkspaceAiStore()
const isLoading = ref(false)
const isCreating = ref(false)
const isSavingDetails = ref(false)
const isCreatingPlan = ref(false)
const isCreatorAiLoading = ref(false)
const errorMessage = ref('')
const items = ref([])
const summary = ref({ counts: {}, total: 0 })
const viewMode = ref('list')
const activeFilter = ref('all')
const selectedItem = ref(null)
const isDetailOpen = ref(false)
const detailSnapshot = ref(null)
const creatorAiReply = ref('')
const detailAiReply = ref('')
const creatorAiActions = ref([])
const detailDraft = reactive({
  title: '',
  type: 'topic',
  stage: 'inbox',
  body: '',
  sourceName: '',
  sourceUrl: '',
  sourcePublishedAt: '',
  platform: '',
  tags: '',
  targetAudience: '',
  corePoint: '',
  hook: '',
  outline: '',
  publishAt: '',
  publishUrl: '',
  reviewNotes: '',
  planId: null
})
const form = reactive({
  type: 'topic',
  title: '',
  body: '',
  sourceName: '',
  sourceUrl: '',
  sourcePublishedAt: '',
  platform: '',
  tags: '',
  targetAudience: '',
  hotLevel: '',
  corePoint: '',
  hook: '',
  outline: '',
  publishAt: '',
  publishUrl: '',
  reviewNotes: ''
})

const typeOptions = [
  { value: 'trend', label: '热点' },
  { value: 'topic', label: '选题' },
  { value: 'draft', label: '草稿' }
]

const stages = [
  { value: 'inbox', label: '收件箱', short: '收' },
  { value: 'research', label: '研究中', short: '研' },
  { value: 'drafting', label: '写作中', short: '写' },
  { value: 'production', label: '制作中', short: '制' },
  { value: 'scheduled', label: '待发布', short: '发' },
  { value: 'published', label: '已发布', short: '已' },
  { value: 'review', label: '复盘', short: '复' }
]

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'trend', label: '热点雷达' },
  { value: 'topic', label: '选题' },
  { value: 'draft', label: '草稿' }
]

const visibleItems = computed(() => activeFilter.value === 'all'
  ? items.value
  : items.value.filter((item) => item.type === activeFilter.value))
const itemsByStage = (stage) => visibleItems.value.filter((item) => item.stage === stage)
const typeLabel = (type) => ({ trend: '热点', topic: '选题', draft: '草稿' }[type] || '内容')
const nextStepLabel = (stage) => ({
  inbox: '判断是否继续',
  research: '补齐来源与观点',
  drafting: '完成可发布草稿',
  production: '准备素材与制作',
  scheduled: '确认发布时间',
  published: '记录发布结果',
  review: '沉淀复盘结论'
}[stage] || '继续推进')

const activeCreatorItems = computed(() => items.value.filter((item) => !['archived', 'published', 'review'].includes(item.stage)))
const creatorFocusItem = computed(() => {
  const stageRank = {
    drafting: 1,
    production: 2,
    scheduled: 3,
    research: 4,
    inbox: 5,
    published: 6,
    review: 7
  }
  return activeCreatorItems.value
    .slice()
    .sort((a, b) => (stageRank[a.stage] || 9) - (stageRank[b.stage] || 9) || new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0] || null
})
const creatorFocusCopy = computed(() => {
  const item = creatorFocusItem.value
  if (!item) return '先把真实来源、选题或草稿放进流水线，Mentor-X 才能基于真实素材协作。'
  return `${typeLabel(item.type)} · ${nextStepLabel(item.stage)}。${item.metadata?.corePoint ? `核心观点：${item.metadata.corePoint}` : '建议先补齐核心观点，再进入制作。'}`
})
const sourceStats = computed(() => {
  const total = Math.max(items.value.length, 0)
  const withSource = items.value.filter((item) => item.source_url || item.source_name).length
  const withAudience = items.value.filter((item) => item.metadata?.targetAudience).length
  const withCorePoint = items.value.filter((item) => item.metadata?.corePoint).length
  const withPublishPlan = items.value.filter((item) => item.metadata?.publishAt || item.stage === 'scheduled' || item.stage === 'published').length
  return { total, withSource, withAudience, withCorePoint, withPublishPlan }
})
const sourceReadiness = computed(() => {
  if (!sourceStats.value.total) return 0
  const score = sourceStats.value.withSource + sourceStats.value.withAudience + sourceStats.value.withCorePoint + sourceStats.value.withPublishPlan
  return Math.round((score / (sourceStats.value.total * 4)) * 100)
})
const sourceHealthLabel = computed(() => {
  if (!sourceStats.value.total) return '等待第一条真实来源'
  if (sourceReadiness.value >= 75) return '素材结构健康'
  if (sourceReadiness.value >= 45) return '可以推进，但缺少部分判断依据'
  return '来源和观点仍偏薄'
})
const sourceHealthCopy = computed(() => {
  const stats = sourceStats.value
  if (!stats.total) return '先保存一个来源 URL、平台热榜、用户反馈或灵感，再进入选题判断。'
  return `${stats.withSource}/${stats.total} 有来源，${stats.withCorePoint}/${stats.total} 有核心观点，${stats.withAudience}/${stats.total} 有目标用户。`
})

const focusQuickEntry = () => {
  const input = document.querySelector('.creator-capture-card input')
  input?.focus?.()
}

const buildCreatorContextBlocks = (item = null) => {
  const sourceItems = item ? [item] : items.value.slice(0, 8)
  return sourceItems.map((entry) => ({
    type: 'creator_item',
    text: [
      `标题：${entry.title || ''}`,
      `类型：${typeLabel(entry.type)} / 阶段：${nextStepLabel(entry.stage)}`,
      entry.body ? `说明：${entry.body}` : '',
      entry.source_name || entry.source_url ? `来源：${entry.source_name || ''} ${entry.source_url || ''}` : '来源：未补齐',
      entry.platform ? `平台：${entry.platform}` : '',
      entry.metadata?.targetAudience ? `目标用户：${entry.metadata.targetAudience}` : '',
      entry.metadata?.corePoint ? `核心观点：${entry.metadata.corePoint}` : '',
      entry.metadata?.hook ? `钩子：${entry.metadata.hook}` : '',
      entry.metadata?.outline ? `大纲：${entry.metadata.outline}` : ''
    ].filter(Boolean).join('\n')
  }))
}

const askCreatorMentor = async (prompt, item = null) => {
  if (isCreatorAiLoading.value) return
  isCreatorAiLoading.value = true
  creatorAiActions.value = []
  if (item) detailAiReply.value = ''
  else creatorAiReply.value = ''

  try {
    const response = await chatWithMascotAssistant({
      message: prompt,
      providerId: workspaceAiStore.normalizedSelectedProviderId,
      context: {
        planTitle: item ? `内容条目：${item.title}` : '内容创作工作台',
        blocks: buildCreatorContextBlocks(item)
      }
    })
    if (!response?.success) {
      if (response?.code === 'AI_NOT_CONFIGURED') {
        error('需要先配置 Mentor-X 模型引擎', { description: '配置后才能基于内容流水线生成创作建议。' })
        return
      }
      throw new Error(response?.error || response?.message || 'Mentor-X 暂时无法协作')
    }
    const payload = response.data || {}
    const reply = payload.reply || payload.answer || payload.message || 'Mentor-X 没有返回可用内容。'
    if (item) detailAiReply.value = reply
    else creatorAiReply.value = reply
    const actions = Array.isArray(payload.actionPlan?.actions) ? payload.actionPlan.actions : Array.isArray(payload.proposedActions) ? payload.proposedActions : []
    creatorAiActions.value = actions.slice(0, 3)
  } catch (err) {
    error('Mentor-X 协作失败', { description: err.message || '请稍后重试' })
  } finally {
    isCreatorAiLoading.value = false
  }
}

const toDateTimeInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const openDetails = (item) => {
  selectedItem.value = item
  detailSnapshot.value = JSON.parse(JSON.stringify(item))
  const metadata = item.metadata || {}
  Object.assign(detailDraft, {
    title: item.title || '',
    type: item.type || 'topic',
    stage: item.stage || 'inbox',
    body: item.body || '',
    sourceName: item.source_name || '',
    sourceUrl: item.source_url || '',
    sourcePublishedAt: toDateTimeInput(item.source_published_at),
    platform: item.platform || '',
    tags: Array.isArray(item.tags) ? item.tags.join(',') : item.tags || '',
    targetAudience: metadata.targetAudience || '',
    corePoint: metadata.corePoint || '',
    hook: metadata.hook || '',
    outline: metadata.outline || '',
    publishAt: toDateTimeInput(metadata.publishAt),
    publishUrl: metadata.publishUrl || '',
    reviewNotes: metadata.reviewNotes || '',
    planId: metadata.planId || null
  })
  isDetailOpen.value = true
}

const closeDetails = () => {
  if (isSavingDetails.value) return
  isDetailOpen.value = false
  selectedItem.value = null
  detailSnapshot.value = null
}

const saveDetails = async () => {
  if (!selectedItem.value || !detailDraft.title) {
    error('请先填写内容标题')
    return
  }
  isSavingDetails.value = true
  const item = selectedItem.value
  const response = await updateCreatorItem(item.id, {
    title: detailDraft.title,
    type: detailDraft.type,
    stage: detailDraft.stage,
    body: detailDraft.body,
    sourceName: detailDraft.sourceName,
    sourceUrl: detailDraft.sourceUrl,
    sourcePublishedAt: detailDraft.sourcePublishedAt || null,
    platform: detailDraft.platform,
    tags: detailDraft.tags,
    metadata: {
      ...(item.metadata || {}),
      targetAudience: detailDraft.targetAudience,
      corePoint: detailDraft.corePoint,
      hook: detailDraft.hook,
      outline: detailDraft.outline,
      publishAt: detailDraft.publishAt || null,
      publishUrl: detailDraft.publishUrl,
      reviewNotes: detailDraft.reviewNotes
    }
  })
  isSavingDetails.value = false
  if (!response.success) {
    Object.assign(item, detailSnapshot.value || {})
    error('内容保存失败', { description: response.error || '请稍后重试' })
    return
  }
  Object.assign(item, response.data || {})
  success('内容已更新')
  closeDetails()
  await loadWorkspace()
}

const startFocus = () => {
  if (!selectedItem.value) return
  router.push({ path: '/focus', query: { title: selectedItem.value.title, source: 'creator' } })
}

const createPlanFromItem = async () => {
  if (!selectedItem.value || isCreatingPlan.value) return
  isCreatingPlan.value = true
  const item = selectedItem.value
  const response = await createPlan({
    title: item.title,
    type: 'project',
    priority: item.metadata?.hotLevel === 'high' ? 'high' : 'medium',
    due_date: item.metadata?.publishAt || null
  })
  if (!response.success) {
    isCreatingPlan.value = false
    error('计划创建失败', { description: response.error || '请稍后重试' })
    return
  }

  const planId = response.data?.id
  const updateResponse = await updateCreatorItem(item.id, {
    metadata: { ...(item.metadata || {}), planId }
  })
  isCreatingPlan.value = false
  if (!updateResponse.success) {
    error('计划已创建，但内容关联失败', { description: updateResponse.error || '可稍后在详情中重试' })
    return
  }

  Object.assign(item, updateResponse.data || {})
  success('已创建关联计划')
  router.push(`/plan/${planId}`)
}

const loadWorkspace = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const response = await getCreatorSummary()
  isLoading.value = false
  if (!response.success) {
    errorMessage.value = response.error || '内容工作台加载失败'
    return
  }
  summary.value = response.data || { counts: {}, total: 0 }
  items.value = Array.isArray(response.data?.items) ? response.data.items : []
}

const submitItem = async () => {
  if (!form.title) {
    error('请先填写内容标题')
    return
  }
  isCreating.value = true
  const response = await createCreatorItem({
    type: form.type,
    title: form.title,
    body: form.body,
    sourceName: form.sourceName,
    sourceUrl: form.sourceUrl,
    sourcePublishedAt: form.sourcePublishedAt || null,
    platform: form.platform,
    tags: form.tags,
    metadata: {
      targetAudience: form.targetAudience,
      hotLevel: form.hotLevel,
      corePoint: form.corePoint,
      hook: form.hook,
      outline: form.outline,
      publishAt: form.publishAt || null,
      publishUrl: form.publishUrl,
      reviewNotes: form.reviewNotes
    }
  })
  isCreating.value = false
  if (!response.success) {
    error('内容保存失败', { description: response.error || '请稍后重试' })
    return
  }
  Object.assign(form, {
    title: '',
    body: '',
    sourceName: '',
    sourceUrl: '',
    sourcePublishedAt: '',
    platform: '',
    tags: '',
    targetAudience: '',
    hotLevel: '',
    corePoint: '',
    hook: '',
    outline: '',
    publishAt: '',
    publishUrl: '',
    reviewNotes: ''
  })
  success('已加入内容流水线')
  await loadWorkspace()
}

const moveItem = async (item, stage) => {
  const previousStage = item.stage
  item.stage = stage
  const response = await updateCreatorItem(item.id, { stage })
  if (!response.success) {
    item.stage = previousStage
    error('内容阶段更新失败', { description: response.error || '请稍后重试' })
    return
  }
  summary.value.counts = {
    ...(summary.value.counts || {}),
    [previousStage]: Math.max(0, Number(summary.value.counts?.[previousStage] || 1) - 1),
    [stage]: Number(summary.value.counts?.[stage] || 0) + 1
  }
}

const archiveItem = async (item) => {
  const response = await archiveCreatorItem(item.id)
  if (!response.success) {
    error('归档失败', { description: response.error || '请稍后重试' })
    return
  }
  items.value = items.value.filter((candidate) => candidate.id !== item.id)
  if (selectedItem.value?.id === item.id) closeDetails()
  summary.value.total = Math.max(0, Number(summary.value.total || 1) - 1)
  success('内容已归档')
}

onMounted(loadWorkspace)
</script>

<style scoped>
.creator-page { display: grid; gap: 1.25rem; width: 100%; }
.creator-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; padding: 0.75rem 0 0.25rem; }
.creator-header h1, .creator-pipeline h2, .creator-capture-card h2 { margin: 0.35rem 0 0; color: rgb(24, 24, 27); font-size: clamp(1.45rem, 2.4vw, 2.4rem); font-weight: 700; letter-spacing: -0.045em; }
.creator-header p:not(.workspace-kicker) { max-width: 720px; margin: 0.7rem 0 0; color: rgb(113, 113, 122); font-size: 0.9rem; line-height: 1.75; }
.workspace-kicker { margin: 0; color: rgb(113, 113, 122); font-size: 0.68rem; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; }
.creator-header-meta, .creator-stage-summary, .creator-item-footer { display: flex; align-items: center; gap: 0.6rem; }
.creator-header-meta { flex-shrink: 0; color: rgb(113, 113, 122); font-size: 0.78rem; font-weight: 700; }
.creator-command-panel { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.68fr) minmax(260px, 0.82fr); gap: 0.85rem; }
.creator-command-card { display: grid; align-content: space-between; gap: 0.72rem; min-height: 11.5rem; border: 1px solid rgb(228, 228, 231); border-radius: 1.35rem; background: rgba(255, 255, 255, 0.72); padding: 1rem; box-shadow: 0 18px 48px rgba(24, 24, 27, 0.055); backdrop-filter: blur(18px); }
.creator-command-card-primary { background: radial-gradient(circle at 92% 8%, rgba(24, 24, 27, 0.08), transparent 32%), rgba(255, 255, 255, 0.82); }
.creator-command-card-agent { background: linear-gradient(135deg, rgba(24, 24, 27, 0.035), rgba(255, 255, 255, 0.82)); }
.creator-command-card h2 { margin: 0; color: rgb(24, 24, 27); font-size: clamp(1.2rem, 2vw, 1.85rem); font-weight: 760; letter-spacing: -0.055em; line-height: 1.05; }
.creator-command-card strong { color: rgb(24, 24, 27); font-size: 1rem; line-height: 1.35; }
.creator-command-card p:not(.workspace-kicker), .creator-ai-result p:not(.workspace-kicker), .creator-detail-ai p:not(.workspace-kicker), .creator-detail-ai-result p:not(.workspace-kicker) { margin: 0; color: rgb(113, 113, 122); font-size: 0.76rem; line-height: 1.65; }
.creator-command-actions, .creator-agent-actions, .creator-ai-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.creator-command-actions .creator-primary-button, .creator-command-actions .creator-secondary-button, .creator-agent-actions .creator-secondary-button { width: auto; min-height: 2.25rem; padding: 0 0.85rem; font-size: 0.72rem; }
.creator-source-meter { overflow: hidden; height: 0.42rem; border-radius: 999px; background: rgb(244, 244, 245); }
.creator-source-meter span { display: block; height: 100%; border-radius: inherit; background: rgb(24, 24, 27); transition: width 0.25s ease; }
.creator-ai-result { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, 0.38fr); gap: 0.85rem; border: 1px solid rgb(228, 228, 231); border-radius: 1.2rem; background: rgba(250, 250, 250, 0.8); padding: 0.95rem 1rem; }
.creator-ai-actions span { display: inline-flex; align-items: center; border: 1px solid rgb(228, 228, 231); border-radius: 999px; background: white; padding: 0.35rem 0.58rem; color: rgb(82, 82, 91); font-size: 0.65rem; font-weight: 800; }
.creator-secondary-button, .creator-primary-button { min-height: 2.55rem; border-radius: 999px; padding: 0 1rem; font-size: 0.78rem; font-weight: 800; }
.creator-secondary-button { border: 1px solid rgb(212, 212, 216); background: rgb(255, 255, 255); color: rgb(63, 63, 70); }
.creator-primary-button { width: 100%; background: rgb(24, 24, 27); color: white; }
.creator-primary-button:disabled { cursor: not-allowed; opacity: 0.55; }
.creator-layout { display: grid; grid-template-columns: minmax(280px, 0.3fr) minmax(0, 1fr); gap: 1.25rem; align-items: start; }
.creator-capture-card { display: grid; gap: 1rem; }
.creator-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.creator-count, .creator-stage-summary span { border-radius: 999px; background: rgb(244, 244, 245); color: rgb(113, 113, 122); font-size: 0.7rem; font-weight: 800; padding: 0.35rem 0.6rem; }
.creator-type-switch { display: flex; gap: 0.4rem; }
.creator-type-switch button { flex: 1; min-height: 2.2rem; border: 1px solid rgb(228, 228, 231); border-radius: 0.8rem; background: rgb(250, 250, 250); color: rgb(113, 113, 122); font-size: 0.75rem; font-weight: 800; }
.creator-type-switch button.is-active { border-color: rgb(24, 24, 27); background: rgb(24, 24, 27); color: white; }
.creator-field { display: grid; gap: 0.45rem; color: rgb(82, 82, 91); font-size: 0.75rem; font-weight: 800; }
.creator-field input, .creator-field select, .creator-field textarea { width: 100%; border: 1px solid rgb(228, 228, 231); border-radius: 0.9rem; background: rgb(250, 250, 250); color: rgb(24, 24, 27); outline: none; padding: 0.75rem 0.85rem; font-size: 0.82rem; }
.creator-field textarea { resize: vertical; line-height: 1.65; }
.creator-two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.creator-details { border-top: 1px solid rgb(228, 228, 231); padding-top: 0.85rem; }
.creator-details summary { cursor: pointer; color: rgb(82, 82, 91); font-size: 0.75rem; font-weight: 800; list-style: none; }
.creator-details summary::-webkit-details-marker { display: none; }
.creator-details summary::after { content: '+'; float: right; color: rgb(161, 161, 170); font-size: 1rem; line-height: 1; }
.creator-details[open] summary::after { content: '−'; }
.creator-details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-top: 0.85rem; }
.creator-field-wide { grid-column: 1 / -1; }
.creator-note { margin: 0; color: rgb(161, 161, 170); font-size: 0.7rem; line-height: 1.6; }
.creator-pipeline { min-width: 0; }
.creator-pipeline-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 0.85rem; }
.creator-toolbar-copy { margin: 0.5rem 0 0; color: rgb(161, 161, 170); font-size: 0.7rem; line-height: 1.5; }
.creator-toolbar-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 0.7rem; }
.creator-stage-summary { flex-wrap: wrap; justify-content: flex-end; }
.creator-filter-switch { display: inline-flex; gap: 0.15rem; border-bottom: 1px solid rgb(228, 228, 231); padding-bottom: 0.25rem; }
.creator-filter-switch button { border: 0; border-bottom: 2px solid transparent; background: transparent; color: rgb(113, 113, 122); padding: 0.3rem 0.5rem; font-size: 0.7rem; font-weight: 800; }
.creator-filter-switch button.is-active { border-bottom-color: rgb(24, 24, 27); color: rgb(24, 24, 27); }
.creator-view-switch { display: inline-flex; gap: 0.2rem; border: 1px solid rgb(228, 228, 231); border-radius: 999px; background: rgb(250, 250, 250); padding: 0.2rem; }
.creator-view-switch button { min-height: 2rem; border: 0; border-radius: 999px; background: transparent; color: rgb(113, 113, 122); padding: 0 0.75rem; font-size: 0.7rem; font-weight: 800; }
.creator-view-switch button.is-active { background: rgb(24, 24, 27); color: white; }
.creator-list { display: grid; gap: 0.5rem; }
.creator-list-header, .creator-list-row { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(7rem, 0.75fr) minmax(5rem, 0.55fr) minmax(9rem, 0.85fr); gap: 1rem; align-items: center; }
.creator-list-header { padding: 0 1rem 0.45rem; color: rgb(161, 161, 170); font-size: 0.65rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
.creator-list-row { min-height: 6.8rem; border: 1px solid rgb(228, 228, 231); border-radius: 1rem; background: rgba(255, 255, 255, 0.84); padding: 0.9rem 1rem; }
.creator-list-row select { max-width: 8rem; border: 1px solid rgb(228, 228, 231); border-radius: 999px; background: rgb(250, 250, 250); color: rgb(82, 82, 91); padding: 0.45rem 0.65rem; font-size: 0.7rem; }
.creator-list-title { min-width: 0; }
.creator-list-open { display: block; width: 100%; cursor: pointer; color: inherit; padding: 0; text-align: left; }
.creator-list-open:focus-visible { border-radius: 0.5rem; outline: 2px solid rgb(161, 161, 170); outline-offset: 0.2rem; }
.creator-list-title h3 { margin-top: 0.3rem; overflow: hidden; color: rgb(24, 24, 27); font-size: 0.86rem; font-weight: 800; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.creator-list-title p { display: -webkit-box; margin-top: 0.28rem; overflow: hidden; color: rgb(113, 113, 122); font-size: 0.7rem; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.creator-metadata-preview { color: rgb(82, 82, 91) !important; font-weight: 700; }
.creator-platform, .creator-next-step { color: rgb(113, 113, 122); font-size: 0.72rem; line-height: 1.5; }
.creator-next-step { color: rgb(39, 39, 42); font-weight: 700; }
.creator-board { display: grid; grid-template-columns: repeat(7, minmax(10rem, 1fr)); gap: 0.7rem; overflow-x: auto; padding-bottom: 0.25rem; }
.creator-column { min-height: 28rem; border: 1px solid rgb(228, 228, 231); border-radius: 1.2rem; background: rgba(250, 250, 250, 0.78); padding: 0.75rem; }
.creator-column > header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; color: rgb(82, 82, 91); font-size: 0.75rem; }
.creator-column > header > div { display: flex; align-items: center; gap: 0.45rem; }
.creator-column > header > span { color: rgb(161, 161, 170); font-size: 0.7rem; }
.creator-column-dot { width: 0.45rem; height: 0.45rem; border-radius: 50%; background: rgb(161, 161, 170); }
.stage-research { background: rgb(245, 158, 11); } .stage-drafting { background: rgb(59, 130, 246); } .stage-production { background: rgb(139, 92, 246); } .stage-scheduled { background: rgb(16, 185, 129); } .stage-published { background: rgb(24, 24, 27); } .stage-review { background: rgb(180, 83, 9); }
.creator-column-list { display: grid; gap: 0.6rem; margin-top: 0.75rem; }
.creator-item-card { border: 1px solid rgb(228, 228, 231); border-radius: 0.95rem; background: white; padding: 0.75rem; }
.creator-item-topline { display: flex; align-items: center; justify-content: space-between; color: rgb(161, 161, 170); font-size: 0.65rem; font-weight: 800; }
.creator-item-topline button { border: 0; background: transparent; color: rgb(161, 161, 170); font-size: 1rem; }
.creator-item-card h3 { margin: 0.55rem 0 0; color: rgb(24, 24, 27); font-size: 0.82rem; line-height: 1.45; }
.creator-item-card p { display: -webkit-box; margin: 0.45rem 0 0; overflow: hidden; color: rgb(113, 113, 122); font-size: 0.72rem; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
.creator-item-card a { display: block; margin-top: 0.55rem; overflow: hidden; color: rgb(37, 99, 235); font-size: 0.68rem; text-overflow: ellipsis; white-space: nowrap; }
.creator-item-footer { justify-content: space-between; margin-top: 0.7rem; color: rgb(161, 161, 170); font-size: 0.65rem; }
.creator-item-footer select { max-width: 5.4rem; border: 0; background: transparent; color: rgb(82, 82, 91); font-size: 0.65rem; }
.creator-empty, .creator-loading, .creator-error { border: 1px dashed rgb(212, 212, 216); border-radius: 0.9rem; color: rgb(161, 161, 170); font-size: 0.7rem; line-height: 1.6; padding: 1.25rem 0.6rem; text-align: center; }
.creator-error { margin-bottom: 0.75rem; border-style: solid; border-color: rgb(254, 202, 202); color: rgb(185, 28, 28); }
.creator-drawer-backdrop { position: fixed; z-index: 80; inset: 0; display: flex; justify-content: flex-end; background: rgba(24, 24, 27, 0.28); }
.creator-drawer { display: flex; width: min(38rem, 100vw); height: 100%; flex-direction: column; border-left: 1px solid rgb(228, 228, 231); background: rgb(255, 255, 255); box-shadow: -1rem 0 3rem rgba(24, 24, 27, 0.12); }
.creator-drawer-header, .creator-drawer-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.35rem; }
.creator-drawer-header { border-bottom: 1px solid rgb(228, 228, 231); }
.creator-drawer-header h2 { margin: 0.3rem 0 0; color: rgb(24, 24, 27); font-size: 1.15rem; }
.creator-drawer-close { border: 0; background: transparent; color: rgb(113, 113, 122); font-size: 1.5rem; line-height: 1; }
.creator-drawer-body { display: grid; gap: 1rem; overflow-y: auto; padding: 1.35rem; }
.creator-drawer-footer { justify-content: flex-end; border-top: 1px solid rgb(228, 228, 231); }
.creator-drawer-save { width: auto; min-width: 8rem; }
.creator-drawer-links { display: flex; flex-wrap: wrap; gap: 0.6rem; padding-top: 0.25rem; }
.creator-drawer-links .creator-secondary-button { min-height: 2.3rem; }
.creator-detail-ai, .creator-detail-ai-result { display: grid; gap: 0.72rem; border: 1px solid rgb(228, 228, 231); border-radius: 1.1rem; background: rgb(250, 250, 250); padding: 0.95rem; }
.creator-detail-ai h3 { margin: 0.2rem 0 0; color: rgb(24, 24, 27); font-size: 1rem; letter-spacing: -0.025em; }
.creator-detail-ai-result { background: white; }
.dark .creator-drawer { border-color: rgb(63, 63, 70); background: rgb(24, 24, 27); }
.dark .creator-drawer-header, .dark .creator-drawer-footer { border-color: rgb(63, 63, 70); }
.dark .creator-drawer-header h2 { color: white; }
.dark .creator-header h1, .dark .creator-pipeline h2, .dark .creator-capture-card h2, .dark .creator-item-card h3, .dark .creator-command-card h2, .dark .creator-command-card strong, .dark .creator-detail-ai h3 { color: white; }
.dark .creator-header p:not(.workspace-kicker), .dark .workspace-kicker, .dark .creator-header-meta, .dark .creator-field, .dark .creator-item-footer, .dark .creator-command-card p:not(.workspace-kicker), .dark .creator-ai-result p:not(.workspace-kicker), .dark .creator-detail-ai p:not(.workspace-kicker), .dark .creator-detail-ai-result p:not(.workspace-kicker) { color: rgb(161, 161, 170); }
.dark .creator-secondary-button, .dark .creator-type-switch button, .dark .creator-field input, .dark .creator-field select, .dark .creator-field textarea, .dark .creator-column, .dark .creator-item-card, .dark .creator-count, .dark .creator-stage-summary span, .dark .creator-command-card, .dark .creator-ai-result, .dark .creator-detail-ai, .dark .creator-detail-ai-result, .dark .creator-ai-actions span { border-color: rgb(63, 63, 70); background: rgb(24, 24, 27); color: rgb(228, 228, 231); }
.dark .creator-type-switch button.is-active { border-color: white; background: white; color: rgb(24, 24, 27); }
.dark .creator-view-switch, .dark .creator-list-row, .dark .creator-list-row select { border-color: rgb(63, 63, 70); background: rgb(24, 24, 27); color: rgb(228, 228, 231); }
.dark .creator-view-switch button.is-active { background: white; color: rgb(24, 24, 27); }
.dark .creator-list-title h3, .dark .creator-next-step { color: white; }
.dark .creator-filter-switch { border-color: rgb(63, 63, 70); }
.dark .creator-filter-switch button.is-active { border-bottom-color: white; color: white; }
.dark .creator-details { border-color: rgb(63, 63, 70); }
.dark .creator-details summary, .dark .creator-metadata-preview { color: rgb(212, 212, 216) !important; }
.dark .creator-source-meter { background: rgb(39, 39, 42); }
.dark .creator-source-meter span { background: white; }
@media (max-width: 1100px) { .creator-layout, .creator-command-panel { grid-template-columns: 1fr; } }
@media (max-width: 720px) {
  .creator-page { gap: 1rem; }
  .creator-header, .creator-pipeline-toolbar { align-items: flex-start; flex-direction: column; }
  .creator-header { padding-top: 0.15rem; }
  .creator-header h1, .creator-pipeline h2, .creator-capture-card h2 { font-size: clamp(1.35rem, 8vw, 1.9rem); }
  .creator-header p:not(.workspace-kicker) { font-size: 0.82rem; line-height: 1.65; }
  .creator-command-card { min-height: auto; border-radius: 1.1rem; }
  .creator-ai-result { grid-template-columns: 1fr; }
  .creator-layout { display: flex; flex-direction: column; gap: 1rem; }
  .creator-pipeline { order: 1; width: 100%; }
  .creator-capture-card { order: 2; width: 100%; }
  .creator-toolbar-actions { width: 100%; justify-content: flex-start; }
  .creator-filter-switch { width: 100%; overflow-x: auto; }
  .creator-stage-summary { width: 100%; justify-content: flex-start; }
  .creator-view-switch { width: 100%; justify-content: space-between; }
  .creator-view-switch button { flex: 1; }
  .creator-two-column, .creator-details-grid { grid-template-columns: 1fr; }
  .creator-board { grid-template-columns: repeat(7, minmax(11rem, 1fr)); }
  .creator-list-header { display: none; }
  .creator-list-row {
    grid-template-columns: 1fr;
    gap: 0.65rem;
    border-radius: 1rem;
    padding: 0.85rem;
  }
  .creator-list-row select { grid-column: 2; grid-row: 1; }
  .creator-list-row select {
    grid-column: auto;
    grid-row: auto;
    max-width: 100%;
    width: 100%;
  }
  .creator-platform, .creator-next-step { grid-column: 1 / -1; }
  .creator-drawer-backdrop {
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
    background: rgba(24, 24, 27, 0.36);
  }
  .creator-drawer {
    width: 100vw;
    max-width: none;
    border-left: 0;
    border-radius: 0;
  }
  .creator-drawer-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(16px);
    padding: calc(0.95rem + env(safe-area-inset-top, 0px)) 1rem 0.9rem;
  }
  .creator-drawer-body {
    padding: 1rem 1rem calc(6.5rem + env(safe-area-inset-bottom, 0px));
  }
  .creator-drawer-footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(16px);
    padding: 0.8rem 1rem calc(0.8rem + env(safe-area-inset-bottom, 0px));
  }
  .creator-drawer-footer > * {
    flex: 1;
  }
  .dark .creator-drawer-header,
  .dark .creator-drawer-footer {
    background: rgba(24, 24, 27, 0.94);
  }
}
</style>
