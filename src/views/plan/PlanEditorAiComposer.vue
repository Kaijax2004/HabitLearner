<template>
  <div class="ai-composer">
    <div class="ai-composer-head">
      <div>
        <div class="ai-composer-title">AI 助手</div>
        <div class="ai-composer-context">
          {{ context?.hasSelection ? '当前选中文本' : '当前块内容' }} · {{ contextPreview }}
        </div>
      </div>
      <button type="button" class="ai-composer-close" @click="$emit('close')">关闭</button>
    </div>

    <div class="ai-composer-input-row">
      <button type="button" class="ai-composer-plus" title="选择技能" @click="showSkillMenu = !showSkillMenu">+</button>
      <textarea
        v-model="prompt"
        class="ai-composer-input"
        rows="2"
        placeholder="告诉 AI 你希望怎么处理这段内容..."
        @keydown.meta.enter.prevent="run"
        @keydown.ctrl.enter.prevent="run"
      />
      <button type="button" class="ai-composer-run" :disabled="loading" @click="run">
        {{ loading ? '处理中...' : '生成' }}
      </button>
    </div>

    <label class="ai-composer-model-switch" title="当前模型">
      <span>模型</span>
      <select
        v-model="model"
        :disabled="modelLoading || !modelOptions.length"
        @focus="$emit('load-models')"
        @click="$emit('load-models')"
      >
        <option value="" disabled>{{ modelLoading ? '正在加载模型...' : '请选择模型' }}</option>
        <option v-for="item in modelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
    </label>

    <div v-if="showSkillMenu" class="ai-composer-skill-menu">
      <div class="ai-composer-menu-head">
        <span>选择技能</span>
        <button type="button" @click="$emit('manage-skills')">管理技能</button>
      </div>
      <button
        v-for="skill in activeSkills"
        :key="skill.id"
        type="button"
        class="ai-composer-skill-option"
        :class="{ active: selectedSkillIds.includes(String(skill.id)) }"
        @click="toggleSkill(skill)"
      >
        <span class="ai-composer-check">{{ selectedSkillIds.includes(String(skill.id)) ? '✓' : '+' }}</span>
        <span class="min-w-0">
          <strong>{{ skill.name }}</strong>
          <small>{{ skill.description || '无技能说明' }}</small>
        </span>
      </button>
      <div v-if="!activeSkills.length" class="ai-composer-empty">还没有可用技能。</div>
    </div>

    <div class="ai-composer-chips">
      <button
        v-for="intentItem in intentItems"
        :key="intentItem.value"
        type="button"
        class="ai-composer-chip"
        @click="useIntent(intentItem)"
      >
        {{ intentItem.label }}
      </button>
      <span v-for="skillId in selectedSkillIds" :key="`selected-${skillId}`" class="ai-composer-selected-skill">
        {{ skillName(skillId) }}
        <button type="button" @click="removeSkill(skillId)">×</button>
      </span>
    </div>

    <div v-if="result" class="ai-composer-result">
      <div class="ai-composer-result-head">
        <span>{{ result.source === 'provider' ? '已通过当前供应商生成' : 'AI 结果' }}</span>
        <span v-if="result.model">{{ result.model }}</span>
      </div>
      <pre v-if="result.kind === 'text'" class="ai-composer-result-text">{{ result.text }}</pre>
      <div v-else class="ai-composer-block-result">
        <div v-for="(block, index) in result.blocks || []" :key="`ai-block-${index}`" class="ai-composer-block-item">
          <span>{{ index + 1 }}</span>
          <div>{{ block.content?.text || block.content?.title || '未命名块' }}</div>
        </div>
      </div>
      <div class="ai-composer-result-actions">
        <template v-if="result.kind === 'text'">
          <button type="button" class="ai-composer-primary" @click="$emit('apply', 'replace-selection')">
            {{ context?.hasSelection ? '替换选中' : '替换当前块' }}
          </button>
          <button type="button" class="ai-composer-secondary" @click="$emit('apply', 'insert-cursor')">插入光标处</button>
          <button type="button" class="ai-composer-secondary" @click="$emit('apply', 'append-end')">追加到末尾</button>
        </template>
        <button v-if="result.kind === 'blocks'" type="button" class="ai-composer-primary" @click="$emit('apply-blocks')">
          插入为新块
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  context: { type: Object, default: () => ({}) },
  skills: { type: Array, default: () => [] },
  model: { type: String, default: '' },
  modelOptions: { type: Array, default: () => [] },
  modelLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  result: { type: Object, default: null }
})

const emit = defineEmits(['close', 'run', 'apply', 'apply-blocks', 'manage-skills', 'update:model', 'load-models'])

const prompt = ref('')
const intent = ref('custom')
const selectedSkillIds = ref([])
const showSkillMenu = ref(false)

const intentItems = [
  { value: 'continue', label: '继续写', prompt: '继续写下去，保持当前语气和结构。' },
  { value: 'rewrite', label: '改写', prompt: '在不改变原意的前提下改得更清晰、更简洁。' },
  { value: 'summarize', label: '总结', prompt: '提炼成一段简洁、可直接放入文档的总结。' },
  { value: 'todo', label: '转待办', prompt: '拆成可执行的待办事项，每行一项。' },
  { value: 'outline', label: '转大纲', prompt: '整理成标题、正文和待办组成的结构化大纲。' },
  { value: 'questions', label: '找问题', prompt: '找出目标、风险、完成标准和下一步中最值得补充的问题。' }
]

const activeSkills = computed(() => props.skills.filter((skill) => skill.status !== 'disabled'))
const contextPreview = computed(() => {
  const source = props.context?.hasSelection ? props.context?.selectedText : props.context?.sourceText
  const text = String(source || '').trim()
  return text ? (text.length > 100 ? `${text.slice(0, 100)}...` : text) : '暂无内容'
})

const model = computed({
  get: () => props.model,
  set: (value) => emit('update:model', value)
})
const modelOptions = computed(() => Array.isArray(props.modelOptions) ? props.modelOptions : [])
const modelLoading = computed(() => Boolean(props.modelLoading))

const skillName = (id) => activeSkills.value.find((skill) => String(skill.id) === String(id))?.name || '技能'

const toggleSkill = (skill) => {
  const id = String(skill.id)
  selectedSkillIds.value = selectedSkillIds.value.includes(id)
    ? selectedSkillIds.value.filter((item) => item !== id)
    : [...selectedSkillIds.value, id]
}

const removeSkill = (id) => {
  selectedSkillIds.value = selectedSkillIds.value.filter((item) => item !== String(id))
}

const useIntent = (item) => {
  intent.value = item.value
  prompt.value = item.prompt
}

const run = () => {
  emit('run', {
    prompt: prompt.value.trim(),
    intent: intent.value,
    outputMode: ['todo', 'outline'].includes(intent.value) ? 'blocks' : 'text',
    skillIds: selectedSkillIds.value
  })
}
</script>

<style scoped>
.ai-composer {
  position: relative;
  margin: 0.85rem 0 0.6rem;
  border: 1px solid rgba(212, 212, 216, 0.95);
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 40px rgba(24, 24, 27, 0.08);
  padding: 0.9rem;
  padding-bottom: 4.15rem;
}

.dark .ai-composer {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(24, 24, 27, 0.96);
}

.ai-composer-head,
.ai-composer-input-row,
.ai-composer-menu-head,
.ai-composer-result-head,
.ai-composer-result-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.ai-composer-title {
  color: rgb(24 24 27);
  font-size: 0.84rem;
  font-weight: 700;
}

.dark .ai-composer-title {
  color: white;
}

.ai-composer-context,
.ai-composer-result-head,
.ai-composer-menu-head {
  color: rgb(113 113 122);
  font-size: 0.72rem;
}

.ai-composer-context {
  max-width: 42rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-composer-close,
.ai-composer-menu-head button {
  border: 0;
  background: transparent;
  color: rgb(113 113 122);
  font-size: 0.75rem;
}

.ai-composer-input-row {
  align-items: stretch;
  margin-top: 0.75rem;
}

.ai-composer-plus,
.ai-composer-run {
  display: inline-grid;
  min-width: 2.25rem;
  place-items: center;
  border: 1px solid rgba(212, 212, 216, 0.95);
  border-radius: 0.75rem;
  background: rgb(250 250 250);
  color: rgb(63 63 70);
  font-weight: 700;
}

.ai-composer-plus {
  font-size: 1.2rem;
}

.ai-composer-run {
  min-width: 4.3rem;
  border-color: rgb(24 24 27);
  background: rgb(24 24 27);
  color: white;
  font-size: 0.78rem;
}

.ai-composer-run:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.dark .ai-composer-plus {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(39, 39, 42, 0.95);
  color: white;
}

.ai-composer-input {
  min-width: 0;
  flex: 1;
  resize: vertical;
  border: 1px solid rgba(212, 212, 216, 0.95);
  border-radius: 0.75rem;
  background: rgb(250 250 250);
  color: rgb(24 24 27);
  outline: none;
  padding: 0.7rem 0.8rem;
}

@media (max-width: 640px) {
  .ai-composer-input-row {
    flex-wrap: wrap;
  }

  .ai-composer-input {
    flex-basis: 100%;
  }
}

.dark .ai-composer-input {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(9, 9, 11, 0.8);
  color: white;
}

.ai-composer-model-switch {
  position: absolute;
  right: 0.85rem;
  bottom: 0.75rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: min(72%, 14rem);
  border: 1px solid rgba(212, 212, 216, 0.95);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.96);
  padding: 0.25rem 0.35rem 0.25rem 0.6rem;
  box-shadow: 0 10px 24px rgba(24, 24, 27, 0.1);
  backdrop-filter: blur(12px);
}

.ai-composer-model-switch span {
  flex: 0 0 auto;
  color: rgb(113 113 122);
  font-size: 0.66rem;
  font-weight: 700;
}

.ai-composer-model-switch select {
  width: 9rem;
  min-width: 0;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: rgb(39 39 42);
  font-size: 0.72rem;
  outline: none;
  padding: 0.25rem 0.35rem;
}

.ai-composer-model-switch select:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.dark .ai-composer-model-switch {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(24, 24, 27, 0.96);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.dark .ai-composer-model-switch select {
  color: white;
}

@media (max-width: 640px) {
  .ai-composer-model-switch {
    right: 0.65rem;
    bottom: 0.6rem;
    max-width: calc(100% - 1.3rem);
  }

  .ai-composer-model-switch select {
    width: 8rem;
  }
}

.ai-composer-skill-menu {
  position: absolute;
  z-index: 20;
  top: 5.7rem;
  left: 0.9rem;
  width: min(22rem, calc(100% - 1.8rem));
  border: 1px solid rgba(212, 212, 216, 0.95);
  border-radius: 1rem;
  background: white;
  box-shadow: 0 18px 42px rgba(24, 24, 27, 0.16);
  padding: 0.7rem;
}

.dark .ai-composer-skill-menu {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgb(24 24 27);
}

.ai-composer-skill-option {
  display: flex;
  width: 100%;
  gap: 0.65rem;
  border: 0;
  border-radius: 0.75rem;
  background: transparent;
  padding: 0.65rem;
  text-align: left;
}

.ai-composer-skill-option:hover,
.ai-composer-skill-option.active {
  background: rgb(244 244 245);
}

.dark .ai-composer-skill-option:hover,
.dark .ai-composer-skill-option.active {
  background: rgb(39 39 42);
}

.ai-composer-check {
  display: inline-grid;
  width: 1.3rem;
  height: 1.3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(161 161 170);
  border-radius: 0.4rem;
  color: rgb(39 39 42);
  font-size: 0.75rem;
}

.ai-composer-skill-option strong,
.ai-composer-skill-option small {
  display: block;
}

.ai-composer-skill-option strong {
  color: rgb(39 39 42);
  font-size: 0.78rem;
}

.ai-composer-skill-option small {
  margin-top: 0.2rem;
  color: rgb(113 113 122);
  font-size: 0.7rem;
  line-height: 1.4;
}

.dark .ai-composer-skill-option strong {
  color: white;
}

.ai-composer-empty {
  padding: 0.8rem 0.6rem;
  color: rgb(113 113 122);
  font-size: 0.75rem;
}

.ai-composer-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.7rem;
}

.ai-composer-chip,
.ai-composer-selected-skill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 999px;
  background: rgb(244 244 245);
  color: rgb(82 82 91);
  padding: 0.35rem 0.6rem;
  font-size: 0.7rem;
}

.dark .ai-composer-chip,
.dark .ai-composer-selected-skill {
  background: rgb(39 39 42);
  color: rgb(228 228 231);
}

.ai-composer-selected-skill button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 0.9rem;
  line-height: 1;
}

.ai-composer-result {
  margin-top: 0.8rem;
  border-top: 1px solid rgba(228, 228, 231, 0.9);
  padding-top: 0.8rem;
}

.dark .ai-composer-result {
  border-color: rgba(63, 63, 70, 0.9);
}

.ai-composer-result-text {
  max-height: 18rem;
  overflow: auto;
  margin: 0.65rem 0 0;
  white-space: pre-wrap;
  border-radius: 0.85rem;
  background: rgb(250 250 250);
  color: rgb(39 39 42);
  font: inherit;
  font-size: 0.84rem;
  line-height: 1.7;
  padding: 0.8rem;
}

.dark .ai-composer-result-text {
  background: rgb(9 9 11);
  color: rgb(244 244 245);
}

.ai-composer-block-result {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.ai-composer-block-item {
  display: flex;
  gap: 0.55rem;
  border-radius: 0.7rem;
  background: rgb(250 250 250);
  padding: 0.55rem 0.7rem;
  color: rgb(63 63 70);
  font-size: 0.82rem;
}

.dark .ai-composer-block-item {
  background: rgb(9 9 11);
  color: rgb(228 228 231);
}

.ai-composer-block-item > span {
  color: rgb(161 161 170);
}

.ai-composer-result-actions {
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 0.7rem;
}

.ai-composer-primary,
.ai-composer-secondary {
  border: 0;
  border-radius: 999px;
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
}

.ai-composer-primary {
  background: rgb(24 24 27);
  color: white;
}

.ai-composer-secondary {
  background: rgb(244 244 245);
  color: rgb(63 63 70);
}

.dark .ai-composer-primary {
  background: white;
  color: rgb(24 24 27);
}

.dark .ai-composer-secondary {
  background: rgb(39 39 42);
  color: rgb(244 244 245);
}
</style>
