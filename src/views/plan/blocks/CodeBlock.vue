<template>
  <div class="code-block-shell">
    <div class="code-block-window">
      <div class="code-block-topbar">
        <div class="code-block-lights" aria-hidden="true">
          <span class="code-light code-light-close"></span>
          <span class="code-light code-light-minimize"></span>
          <span class="code-light code-light-expand"></span>
        </div>

        <div class="code-block-meta">
          <div class="code-block-title">
            <span class="code-block-title-dot"></span>
            <span>Code Console</span>
          </div>
          <span class="code-block-badge">{{ activeLanguageLabel }}</span>
        </div>

        <div class="code-block-actions">
          <span class="code-block-count">{{ lineCount }} 行</span>
          <select
            v-model="language"
            class="code-language-select"
            title="切换语言"
          >
            <option v-for="item in languageOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="code-block-body">
        <div ref="lineNumbersRef" class="code-block-gutter" aria-hidden="true">
          <span
            v-for="lineNumber in lineNumbers"
            :key="`line-${lineNumber}`"
            class="code-block-line-number"
          >
            {{ lineNumber }}
          </span>
        </div>

        <div class="code-block-editor">
          <pre ref="highlightRef" class="code-block-highlight" :class="`language-${prismLanguage}`"><code v-html="highlightedCode"></code></pre>
          <textarea
            ref="textareaRef"
            :value="code"
            class="code-block-textarea"
            :placeholder="placeholder"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            rows="8"
            @focus="emit('focus')"
            @blur="emit('blur')"
            @input="onInput"
            @scroll="syncScroll"
            @keydown="onKeydown"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-bash'

const languageOptions = [
  { value: 'javascript', label: 'JavaScript', prism: 'javascript' },
  { value: 'typescript', label: 'TypeScript', prism: 'typescript' },
  { value: 'python', label: 'Python', prism: 'python' },
  { value: 'java', label: 'Java', prism: 'java' },
  { value: 'html', label: 'HTML', prism: 'markup' },
  { value: 'css', label: 'CSS', prism: 'css' },
  { value: 'json', label: 'JSON', prism: 'json' },
  { value: 'sql', label: 'SQL', prism: 'sql' },
  { value: 'bash', label: 'Bash', prism: 'bash' }
]

const props = defineProps({
  modelValue: { type: Object, default: () => ({ lang: 'javascript', code: '' }) }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'create-new-block', 'delete-block'])

const textareaRef = ref(null)
const highlightRef = ref(null)
const lineNumbersRef = ref(null)

const model = computed(() => props.modelValue || { lang: 'javascript', code: '' })
const code = computed(() => model.value.code || '')
const language = computed({
  get: () => model.value.lang || 'javascript',
  set: (value) => emit('update:modelValue', { ...model.value, lang: value })
})

const prismLanguage = computed(() => {
  const matched = languageOptions.find((item) => item.value === language.value)
  return matched?.prism || 'javascript'
})

const activeLanguageLabel = computed(() => {
  const matched = languageOptions.find((item) => item.value === language.value)
  return matched?.label || 'JavaScript'
})

const lineCount = computed(() => Math.max(1, code.value.split('\n').length))
const lineNumbers = computed(() => Array.from({ length: lineCount.value }, (_, index) => index + 1))

const highlightedCode = computed(() => {
  const source = code.value || ''
  const safeCode = source.endsWith('\n') ? `${source} ` : source || ' '
  const grammar = Prism.languages[prismLanguage.value] || Prism.languages.javascript
  return Prism.highlight(safeCode, grammar, prismLanguage.value)
})

const placeholder = '输入代码，按 Tab 缩进，Ctrl/Cmd + Enter 新建下一块'

const syncScroll = () => {
  if (!textareaRef.value) return
  const top = textareaRef.value.scrollTop
  const left = textareaRef.value.scrollLeft
  if (highlightRef.value) {
    highlightRef.value.scrollTop = top
    highlightRef.value.scrollLeft = left
  }
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = top
  }
}

const resizeTextarea = () => {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  textareaRef.value.style.height = `${Math.max(textareaRef.value.scrollHeight, 240)}px`
  if (highlightRef.value) {
    highlightRef.value.style.height = textareaRef.value.style.height
  }
}

const onInput = (event) => {
  emit('update:modelValue', { ...model.value, code: event.target.value })
  nextTick(() => {
    resizeTextarea()
    syncScroll()
  })
}

const insertAtSelection = (target, content) => {
  const start = target.selectionStart
  const end = target.selectionEnd
  const value = target.value
  emit('update:modelValue', {
    ...model.value,
    code: `${value.slice(0, start)}${content}${value.slice(end)}`
  })
  nextTick(() => {
    target.focus()
    const cursor = start + content.length
    target.setSelectionRange(cursor, cursor)
    resizeTextarea()
    syncScroll()
  })
}

const onKeydown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault()
    insertAtSelection(event.target, '  ')
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    emit('create-new-block')
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Backspace') {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Backspace' && !code.value) {
    event.preventDefault()
    emit('delete-block')
  }
}

watch(() => code.value, async () => {
  await nextTick()
  resizeTextarea()
  syncScroll()
}, { immediate: true })

watch(() => language.value, async () => {
  await nextTick()
  syncScroll()
})

onMounted(() => {
  resizeTextarea()
  syncScroll()
})
</script>

<style scoped>
.code-block-shell {
  position: relative;
}

.code-block-window {
  overflow: hidden;
  border: 1px solid rgba(24, 24, 27, 0.08);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.16), transparent 28%),
    linear-gradient(180deg, #1c1e26 0%, #12141a 100%);
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.dark .code-block-window {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 22px 50px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.code-block-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  padding: 0.85rem 1rem;
}

.code-block-lights {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.code-light {
  height: 12px;
  width: 12px;
  border-radius: 9999px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.28);
}

.code-light-close {
  background: #ff5f57;
}

.code-light-minimize {
  background: #febc2e;
}

.code-light-expand {
  background: #28c840;
}

.code-block-meta,
.code-block-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.code-block-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(244, 244, 245, 0.94);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.code-block-title-dot {
  height: 6px;
  width: 6px;
  border-radius: 9999px;
  background: #7dd3fc;
  box-shadow: 0 0 14px rgba(125, 211, 252, 0.72);
}

.code-block-badge,
.code-block-count {
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(228, 228, 231, 0.86);
  font-size: 0.72rem;
  padding: 0.32rem 0.62rem;
}

.code-language-select {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  color: #f4f4f5;
  font-size: 0.76rem;
  outline: none;
  padding: 0.38rem 0.8rem;
}

.code-language-select option {
  color: #111827;
}

.code-block-body {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  min-height: 240px;
}

.code-block-gutter {
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  color: rgba(161, 161, 170, 0.72);
  font-family: 'SF Mono', 'JetBrains Mono', Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.75;
  padding: 1rem 0.65rem 1rem 0;
  text-align: right;
  user-select: none;
}

.code-block-line-number {
  display: block;
}

.code-block-editor {
  position: relative;
  min-width: 0;
}

.code-block-highlight,
.code-block-textarea {
  overflow: auto;
  margin: 0;
  padding: 1rem 1.15rem;
  font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 0.92rem;
  font-variant-ligatures: contextual;
  line-height: 1.75;
  tab-size: 2;
  white-space: pre;
}

.code-block-highlight {
  pointer-events: none;
  color: #e5e7eb;
}

.code-block-textarea {
  position: absolute;
  inset: 0;
  resize: none;
  border: 0;
  background: transparent;
  color: transparent;
  caret-color: #f8fafc;
  outline: none;
}

.code-block-textarea::placeholder {
  color: rgba(161, 161, 170, 0.75);
}

.code-block-textarea::selection {
  background: rgba(125, 211, 252, 0.22);
}

.code-block-highlight::-webkit-scrollbar,
.code-block-textarea::-webkit-scrollbar,
.code-block-gutter::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.code-block-highlight::-webkit-scrollbar-thumb,
.code-block-textarea::-webkit-scrollbar-thumb,
.code-block-gutter::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.14);
}

.code-block-highlight :deep(.token.comment),
.code-block-highlight :deep(.token.prolog),
.code-block-highlight :deep(.token.doctype),
.code-block-highlight :deep(.token.cdata) {
  color: #6b7280;
}

.code-block-highlight :deep(.token.punctuation) {
  color: #d4d4d8;
}

.code-block-highlight :deep(.token.namespace) {
  opacity: 0.7;
}

.code-block-highlight :deep(.token.property),
.code-block-highlight :deep(.token.tag),
.code-block-highlight :deep(.token.constant),
.code-block-highlight :deep(.token.symbol),
.code-block-highlight :deep(.token.deleted) {
  color: #f38ba8;
}

.code-block-highlight :deep(.token.boolean),
.code-block-highlight :deep(.token.number) {
  color: #fab387;
}

.code-block-highlight :deep(.token.selector),
.code-block-highlight :deep(.token.attr-name),
.code-block-highlight :deep(.token.string),
.code-block-highlight :deep(.token.char),
.code-block-highlight :deep(.token.builtin),
.code-block-highlight :deep(.token.inserted) {
  color: #a6e3a1;
}

.code-block-highlight :deep(.token.operator),
.code-block-highlight :deep(.token.entity),
.code-block-highlight :deep(.token.url),
.code-block-highlight :deep(.language-css .token.string),
.code-block-highlight :deep(.style .token.string) {
  color: #89dceb;
}

.code-block-highlight :deep(.token.atrule),
.code-block-highlight :deep(.token.attr-value),
.code-block-highlight :deep(.token.keyword) {
  color: #cba6f7;
}

.code-block-highlight :deep(.token.function),
.code-block-highlight :deep(.token.class-name) {
  color: #f9e2af;
}

.code-block-highlight :deep(.token.regex),
.code-block-highlight :deep(.token.important),
.code-block-highlight :deep(.token.variable) {
  color: #94e2d5;
}

.code-block-highlight :deep(.token.bold) {
  font-weight: 700;
}

.code-block-highlight :deep(.token.italic) {
  font-style: italic;
}

@media (max-width: 768px) {
  .code-block-topbar {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .code-block-actions {
    width: 100%;
    justify-content: space-between;
  }

  .code-block-body {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .code-block-highlight,
  .code-block-textarea {
    padding: 0.9rem;
    font-size: 0.86rem;
  }
}
</style>
