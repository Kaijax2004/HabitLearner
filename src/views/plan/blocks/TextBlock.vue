<template>
  <div class="relative text-block">
    <div
      v-if="showToolbar"
      class="text-selection-toolbar absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-1"
      :class="selectionRange.end > selectionRange.start ? '-top-11' : '-top-10'"
    >
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': isBold }"
        title="加粗 (Ctrl+B)"
        @mousedown.prevent="toggleBold"
      >
        B
      </button>
      <button
        type="button"
        class="toolbar-btn italic"
        :class="{ 'toolbar-btn-active': isItalic }"
        title="斜体 (Ctrl+I)"
        @mousedown.prevent="toggleItalic"
      >
        I
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': isCode }"
        title="行内代码 (Ctrl+`)"
        @mousedown.prevent="toggleInlineCode"
      >
        <span class="text-xs">&lt;/&gt;</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': isStrikethrough }"
        title="删除线 (Ctrl+Shift+S)"
        @mousedown.prevent="toggleStrike"
      >
        <span class="line-through">S</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': isHighlight }"
        title="高亮 (Ctrl+Shift+H)"
        @mousedown.prevent="toggleHighlight"
      >
        H
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': isLink }"
        title="插入链接 (Ctrl+K)"
        @mousedown.prevent="insertLink"
      >
        <span class="text-xs">Link</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        title="AI 助手"
        @mousedown.prevent="emit('open-ai')"
      >
        AI
      </button>
    </div>

    <div
      class="rounded-md px-3 py-2 transition-colors duration-150"
      :class="isFocused ? 'bg-zinc-50 shadow-sm dark:bg-zinc-800/50' : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30'"
      @click="focusEditor"
    >
      <div
        ref="editorRef"
        contenteditable="true"
        class="text-editor min-h-[1.65rem] w-full bg-transparent text-sm leading-relaxed text-zinc-900 outline-none dark:text-white"
        :data-placeholder="placeholder"
        spellcheck="true"
        @focus="onFocus"
        @blur="onBlur"
        @click="onEditorClick"
        @input="onInput"
        @keydown="onKeydown"
        @mouseup="handleSelectionChange"
        @keyup="handleSelectionChange"
        @paste="onPaste"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ text: '', html: '' }) },
  placeholder: { type: String, default: "输入 '/' 打开命令菜单..." }
})

const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'open-ai',
  'create-new-block',
  'delete-block',
  'change-type',
  'open-slash-menu'
])

const editorRef = ref(null)
const isFocused = ref(false)
const showToolbar = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isCode = ref(false)
const isStrikethrough = ref(false)
const isHighlight = ref(false)
const isLink = ref(false)
const selectionRange = ref({ start: 0, end: 0 })
let hideToolbarTimer = null

const model = computed(() => props.modelValue || { text: '', html: '' })

const patchModel = (patch) => {
  emit('update:modelValue', {
    ...model.value,
    ...patch
  })
}

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const normalizePlainText = (value = '') => String(value)
  .replace(/\u00a0/g, ' ')
  .replace(/\r\n?/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/\s+$/g, '')

const textToHtml = (value = '') => {
  let html = escapeHtml(normalizePlainText(value))
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/~~([^~\n]+)~~/g, '<s>$1</s>')
  html = html.replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  html = html.replace(/\n/g, '<br>')
  return html
}

const sanitizeHref = (href = '') => {
  const value = String(href || '').trim()
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value
  return 'https://'
}

const serializeTextFromNode = (node) => {
  if (!node) return ''
  if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  if (node.tagName === 'BR') return '\n'

  const text = Array.from(node.childNodes).map(serializeTextFromNode).join('')

  if (node.tagName === 'DIV' || node.tagName === 'P') {
    return text.endsWith('\n') ? text : `${text}\n`
  }

  return text
}

const extractPlainTextFromHtml = (html = '') => {
  const container = document.createElement('div')
  container.innerHTML = html
  return normalizePlainText(Array.from(container.childNodes).map(serializeTextFromNode).join(''))
}

const serializeNodeToHtml = (node) => {
  if (!node) return ''
  if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.nodeValue || '')
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName
  const children = Array.from(node.childNodes).map(serializeNodeToHtml).join('')

  if (tag === 'BR') return '<br>'
  if (tag === 'B' || tag === 'STRONG') return `<strong>${children}</strong>`
  if (tag === 'I' || tag === 'EM') return `<em>${children}</em>`
  if (tag === 'CODE') return `<code>${children}</code>`
  if (tag === 'S' || tag === 'STRIKE') return `<s>${children}</s>`
  if (tag === 'MARK') return `<mark>${children}</mark>`
  if (tag === 'A') return `<a href="${escapeHtml(sanitizeHref(node.getAttribute('href')))}">${children}</a>`
  if (tag === 'DIV' || tag === 'P') return children ? `${children}<br>` : '<br>'

  return children
}

const normalizeEditorHtml = (html = '') => {
  const container = document.createElement('div')
  container.innerHTML = html
  let normalized = Array.from(container.childNodes).map(serializeNodeToHtml).join('')
  normalized = normalized.replace(/(?:<br>){3,}/g, '<br><br>')
  normalized = normalized.replace(/^(<br>)+|(<br>)+$/g, '')
  return normalized
}

const getNodeTextLength = (node) => {
  if (!node) return 0
  if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue || '').length
  if (node.nodeType !== Node.ELEMENT_NODE) return 0
  if (node.tagName === 'BR') return 1
  return Array.from(node.childNodes).reduce((sum, child) => sum + getNodeTextLength(child), 0)
}

const getOffsetWithin = (root, targetNode, targetOffset) => {
  let length = 0
  let found = false

  const walk = (node) => {
    if (!node || found) return

    if (node === targetNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        length += Math.min(targetOffset, (node.nodeValue || '').length)
      } else {
        const children = Array.from(node.childNodes)
        for (let index = 0; index < Math.min(targetOffset, children.length); index += 1) {
          length += getNodeTextLength(children[index])
        }
      }
      found = true
      return
    }

    if (node.nodeType === Node.TEXT_NODE) {
      length += (node.nodeValue || '').length
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      length += 1
      return
    }

    Array.from(node.childNodes).forEach(walk)
  }

  walk(root)
  return length
}

const locateOffset = (node, offset) => {
  if (!node) return { node: editorRef.value, offset: 0 }

  if (node.nodeType === Node.TEXT_NODE) {
    return {
      node,
      offset: Math.max(0, Math.min(offset, (node.nodeValue || '').length))
    }
  }

  const children = Array.from(node.childNodes)

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index]

    if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'BR') {
      if (offset <= 0) return { node, offset: index }
      if (offset === 1) return { node, offset: index + 1 }
      offset -= 1
      continue
    }

    const length = getNodeTextLength(child)
    if (offset <= length) {
      return locateOffset(child, offset)
    }
    offset -= length
  }

  return { node, offset: children.length }
}

const getEditorSelectionRange = () => {
  const editor = editorRef.value
  const selection = window.getSelection()

  if (!editor || !selection?.rangeCount) {
    return { start: 0, end: 0 }
  }

  const range = selection.getRangeAt(0)
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) {
    const text = extractPlainTextFromHtml(editor.innerHTML)
    return { start: text.length, end: text.length }
  }

  const start = getOffsetWithin(editor, range.startContainer, range.startOffset)
  const end = getOffsetWithin(editor, range.endContainer, range.endOffset)
  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  }
}

const setEditorSelectionRange = (start = 0, end = start) => {
  const editor = editorRef.value
  if (!editor) return

  const range = document.createRange()
  const selection = window.getSelection()
  const startPoint = locateOffset(editor, start)
  const endPoint = locateOffset(editor, end)

  range.setStart(startPoint.node, startPoint.offset)
  range.setEnd(endPoint.node, endPoint.offset)
  selection?.removeAllRanges()
  selection?.addRange(range)
  captureSelection()
  updateToolbarState()
}

const syncEditorDataset = () => {
  const editor = editorRef.value
  if (!editor) return
  const html = normalizeEditorHtml(editor.innerHTML)
  editor.dataset.plainText = extractPlainTextFromHtml(html)
}

const getCanonicalHtml = () => {
  const plainText = normalizePlainText(model.value.text || '')
  const richHtml = normalizeEditorHtml(model.value.html || '')

  if (richHtml && extractPlainTextFromHtml(richHtml) === plainText) {
    return richHtml
  }

  return textToHtml(plainText)
}

const syncEditorFromModel = (force = false) => {
  const editor = editorRef.value
  if (!editor) return

  const nextHtml = getCanonicalHtml()
  const currentHtml = normalizeEditorHtml(editor.innerHTML)

  if (force || !isFocused.value || currentHtml !== nextHtml) {
    if (currentHtml !== nextHtml) {
      editor.innerHTML = nextHtml
    }
  }

  syncEditorDataset()
}

const emitEditorState = () => {
  const editor = editorRef.value
  if (!editor) return

  const html = normalizeEditorHtml(editor.innerHTML)
  const text = extractPlainTextFromHtml(html)

  patchModel({ text, html })
  syncEditorDataset()
}

const focusEditor = () => {
  editorRef.value?.focus()
}

const captureSelection = () => {
  selectionRange.value = getEditorSelectionRange()
}

const hasAncestorTag = (tagNames) => {
  const editor = editorRef.value
  const selection = window.getSelection()
  let node = selection?.anchorNode || null

  if (!editor || !node) return false
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement

  while (node && editor.contains(node)) {
    if (tagNames.includes(node.tagName)) return true
    node = node.parentElement
  }

  return false
}

const updateToolbarState = () => {
  const editor = editorRef.value
  if (!editor) return

  isBold.value = document.queryCommandState?.('bold') || hasAncestorTag(['B', 'STRONG'])
  isItalic.value = document.queryCommandState?.('italic') || hasAncestorTag(['I', 'EM'])
  isStrikethrough.value = document.queryCommandState?.('strikeThrough') || hasAncestorTag(['S', 'STRIKE'])
  isCode.value = hasAncestorTag(['CODE'])
  isHighlight.value = hasAncestorTag(['MARK'])
  isLink.value = hasAncestorTag(['A'])
}

const afterFormatMutation = async () => {
  emitEditorState()
  await nextTick()
  captureSelection()
  updateToolbarState()
}

const execCommand = async (command, value = null) => {
  focusEditor()
  document.execCommand(command, false, value)
  await afterFormatMutation()
}

const wrapSelectionWithElement = async (tagName, attributes = {}, placeholder = '') => {
  focusEditor()
  const editor = editorRef.value
  const selection = window.getSelection()
  if (!editor || !selection?.rangeCount) return

  const range = selection.getRangeAt(0)
  if (!editor.contains(range.commonAncestorContainer)) return

  const element = document.createElement(tagName)
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))

  if (range.collapsed) {
    element.textContent = placeholder
    range.insertNode(element)
    range.selectNodeContents(element)
  } else {
    const contents = range.extractContents()
    element.appendChild(contents)
    range.insertNode(element)
    range.selectNodeContents(element)
  }

  selection.removeAllRanges()
  selection.addRange(range)
  await afterFormatMutation()
}

const unwrapAncestorTag = async (tagName) => {
  const editor = editorRef.value
  const selection = window.getSelection()
  let node = selection?.anchorNode || null

  if (!editor || !node) return false
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement

  while (node && editor.contains(node)) {
    if (node.tagName === tagName) {
      const parent = node.parentNode
      while (node.firstChild) parent.insertBefore(node.firstChild, node)
      parent.removeChild(node)
      await afterFormatMutation()
      return true
    }
    node = node.parentElement
  }

  return false
}

const toggleBold = () => execCommand('bold')
const toggleItalic = () => execCommand('italic')
const toggleStrike = () => execCommand('strikeThrough')

const toggleInlineCode = async () => {
  if (await unwrapAncestorTag('CODE')) return
  await wrapSelectionWithElement('code', {}, '代码')
}

const toggleHighlight = async () => {
  if (await unwrapAncestorTag('MARK')) return
  await wrapSelectionWithElement('mark', {}, '高亮')
}

const insertLink = async () => {
  const editor = editorRef.value
  const selection = window.getSelection()
  if (!editor || !selection?.rangeCount) return

  const range = selection.getRangeAt(0)
  if (!editor.contains(range.commonAncestorContainer)) return

  const selectedText = selection.toString().trim()
  const href = window.prompt('输入链接地址', 'https://')
  if (!href) return
  const label = window.prompt('输入链接显示名称', selectedText || '链接文本')
  if (label === null) return

  const anchor = document.createElement('a')
  anchor.setAttribute('href', sanitizeHref(href))
  anchor.textContent = label.trim() || selectedText || sanitizeHref(href)

  const nextRange = range.cloneRange()
  range.deleteContents()
  range.insertNode(anchor)
  nextRange.selectNodeContents(anchor)
  nextRange.collapse(false)
  selection.removeAllRanges()
  selection.addRange(nextRange)
  await afterFormatMutation()
}

const insertPlainText = async (text) => {
  focusEditor()
  if (document.queryCommandSupported?.('insertText')) {
    document.execCommand('insertText', false, text)
    await afterFormatMutation()
    return
  }

  const selection = window.getSelection()
  if (!selection?.rangeCount) return
  const range = selection.getRangeAt(0)
  range.deleteContents()
  range.insertNode(document.createTextNode(text))
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
  await afterFormatMutation()
}

const onFocus = () => {
  if (hideToolbarTimer) {
    window.clearTimeout(hideToolbarTimer)
    hideToolbarTimer = null
  }
  isFocused.value = true
  showToolbar.value = true
  syncEditorDataset()
  captureSelection()
  updateToolbarState()
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
  hideToolbarTimer = window.setTimeout(() => {
    showToolbar.value = false
    hideToolbarTimer = null
  }, 120)
  emitEditorState()
  syncEditorFromModel(true)
  emit('blur')
}

const onInput = () => {
  emitEditorState()
  captureSelection()
  updateToolbarState()

  const text = normalizePlainText(editorRef.value?.dataset.plainText || '')

  if (text === '# ') {
    patchModel({ text: '', html: '' })
    if (editorRef.value) editorRef.value.innerHTML = ''
    emit('change-type', 'heading')
    return
  }

  if (text === '[] ') {
    patchModel({ text: '', html: '' })
    if (editorRef.value) editorRef.value.innerHTML = ''
    emit('change-type', 'todo')
    return
  }

  if (text === '> ') {
    patchModel({ text: '', html: '' })
    if (editorRef.value) editorRef.value.innerHTML = ''
    emit('change-type', 'quote')
    return
  }

  if (text === '```') {
    patchModel({ text: '', html: '' })
    if (editorRef.value) editorRef.value.innerHTML = ''
    emit('change-type', 'code')
    return
  }

  if (text === '- ') {
    patchModel({ text: '', html: '' })
    if (editorRef.value) editorRef.value.innerHTML = ''
    emit('change-type', 'list')
  }
}

const onPaste = async (event) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  if (!text) return
  await insertPlainText(text)
}

const handleSelectionChange = () => {
  captureSelection()
  updateToolbarState()
}

const onEditorClick = (event) => {
  const anchor = event.target?.closest?.('a[href]')
  if (!anchor) return
  event.preventDefault()
  event.stopPropagation()
  window.open(sanitizeHref(anchor.getAttribute('href')), '_blank', 'noopener,noreferrer')
}

const onKeydown = async (event) => {
  const plainText = normalizePlainText(editorRef.value?.dataset.plainText || model.value.text || '')

  if (event.ctrlKey || event.metaKey) {
    const key = event.key.toLowerCase()
    if (key === 'b') {
      event.preventDefault()
      await toggleBold()
      return
    }
    if (key === 'i') {
      event.preventDefault()
      await toggleItalic()
      return
    }
    if (key === 'k') {
      event.preventDefault()
      await insertLink()
      return
    }
    if (event.key === '`') {
      event.preventDefault()
      await toggleInlineCode()
      return
    }
    if (key === 'backspace') {
      event.preventDefault()
      emit('delete-block')
      return
    }
    if (event.shiftKey && key === 's') {
      event.preventDefault()
      await toggleStrike()
      return
    }
    if (event.shiftKey && key === 'h') {
      event.preventDefault()
      await toggleHighlight()
      return
    }
  }

  if (event.key === '/' && !plainText.trim()) {
    event.preventDefault()
    emit('open-slash-menu', event)
    return
  }

  if (event.key === 'Backspace' && !plainText) {
    event.preventDefault()
    emit('delete-block')
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('create-new-block')
    return
  }

  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault()
    await insertPlainText('\n')
    return
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    await insertPlainText('  ')
  }
}

watch(() => [model.value.text, model.value.html], async () => {
  await nextTick()
  syncEditorFromModel()
  updateToolbarState()
}, { immediate: true, deep: true })

onMounted(() => {
  syncEditorFromModel(true)
  if (editorRef.value) {
    editorRef.value.__getPlainText = () => normalizePlainText(editorRef.value?.dataset.plainText || '')
    editorRef.value.__getSelectionRange = () => getEditorSelectionRange()
    editorRef.value.__setSelectionRange = (start, end) => setEditorSelectionRange(start, end)
  }
})

onBeforeUnmount(() => {
  if (hideToolbarTimer) {
    window.clearTimeout(hideToolbarTimer)
    hideToolbarTimer = null
  }

  if (editorRef.value) {
    delete editorRef.value.__getPlainText
    delete editorRef.value.__getSelectionRange
    delete editorRef.value.__setSelectionRange
  }
})
</script>

<style scoped>
.text-selection-toolbar {
  border: 1px solid rgba(228, 228, 231, 0.92);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(18px);
  padding: 0.35rem;
}

.dark .text-selection-toolbar {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(9, 9, 11, 0.84);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.toolbar-btn {
  display: inline-flex;
  height: 34px;
  min-width: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: rgb(82 82 91);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0 0.7rem;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.toolbar-btn:hover {
  background: rgba(228, 228, 231, 0.9);
  color: rgb(24 24 27);
}

.toolbar-btn-active {
  border-color: rgba(24, 24, 27, 0.08);
  background: rgba(24, 24, 27, 0.92);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
  color: white;
}

.dark .toolbar-btn {
  color: rgb(212 212 216);
}

.dark .toolbar-btn:hover,
.dark .toolbar-btn-active {
  background: rgba(39, 39, 42, 0.96);
  color: white;
}

.dark .toolbar-btn-active {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
}

.text-editor {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.65;
  font-family: inherit;
}

.text-editor:empty::before {
  content: attr(data-placeholder);
  color: rgb(161 161 170);
  pointer-events: none;
}

.dark .text-editor:empty::before {
  color: rgb(113 113 122);
}

.text-editor :deep(strong) {
  font-weight: 700;
}

.text-editor :deep(em) {
  font-style: italic;
}

.text-editor :deep(code) {
  border-radius: 0.45rem;
  background: rgba(24, 24, 27, 0.08);
  color: rgb(24 24 27);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.92em;
  padding: 0.12rem 0.38rem;
}

.dark .text-editor :deep(code) {
  background: rgba(255, 255, 255, 0.12);
  color: rgb(250 250 250);
}

.text-editor :deep(mark) {
  border-radius: 0.35rem;
  background: rgba(250, 204, 21, 0.26);
  color: inherit;
  padding: 0.02rem 0.15rem;
}

.text-editor :deep(s) {
  text-decoration-thickness: 1.5px;
}

.text-editor :deep(a) {
  color: rgb(37 99 235);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18rem;
}

.dark .text-editor :deep(a) {
  color: rgb(147 197 253);
}
</style>
