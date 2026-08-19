<template>
  <div class="relative rich-text-block">
    <div
      v-if="showToolbar"
      class="rich-text-toolbar absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-1"
    >
      <button type="button" class="rich-text-toolbar-btn" :class="{ active: editor?.isActive('bold') }" title="加粗" @mousedown.prevent="toggle('bold')">B</button>
      <button type="button" class="rich-text-toolbar-btn italic" :class="{ active: editor?.isActive('italic') }" title="斜体" @mousedown.prevent="toggle('italic')">I</button>
      <button type="button" class="rich-text-toolbar-btn" :class="{ active: editor?.isActive('code') }" title="行内代码" @mousedown.prevent="toggle('code')">&lt;/&gt;</button>
      <button type="button" class="rich-text-toolbar-btn strike" :class="{ active: editor?.isActive('strike') }" title="删除线" @mousedown.prevent="toggle('strike')">S</button>
      <button type="button" class="rich-text-toolbar-btn" :class="{ active: editor?.isActive('highlight') }" title="高亮" @mousedown.prevent="toggle('highlight')">H</button>
      <button type="button" class="rich-text-toolbar-btn" :class="{ active: editor?.isActive('link') }" title="链接" @mousedown.prevent="setLink">Link</button>
      <button type="button" class="rich-text-toolbar-btn" title="AI 助手" @mousedown.prevent="emit('open-ai')">AI</button>
    </div>

    <div
      class="rich-text-shell rounded-md px-3 py-2"
      :class="{ focused: isFocused }"
      @click="focusEditor"
    >
      <EditorContent
        :editor="editor"
        class="rich-text-content min-h-[1.65rem] text-sm leading-relaxed text-zinc-900 outline-none dark:text-white"
      />
      <span v-if="isEmpty" class="rich-text-placeholder">{{ placeholder }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'

const props = defineProps({
  modelValue: { type: Object, default: () => ({ text: '', html: '', document: null }) },
  placeholder: { type: String, default: "输入 '/' 打开命令菜单..." },
  autoFocus: { type: Boolean, default: false }
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

const isFocused = ref(false)
const showToolbar = ref(false)
const isSyncing = ref(false)

const normalizeText = (value = '') => String(value)
  .replace(/\u00a0/g, ' ')
  .replace(/\r\n?/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trimEnd()

const getInitialContent = () => {
  if (props.modelValue?.document) return props.modelValue.document
  if (props.modelValue?.html) return props.modelValue.html
  return props.modelValue?.text || ''
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      history: { depth: 100 },
      link: false
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true
    }),
    Highlight.configure({ multicolor: false })
  ],
  content: getInitialContent(),
  editorProps: {
    attributes: {
      class: 'rich-text-prose focus:outline-none',
      spellcheck: 'true'
    },
    handleKeyDown: (_view, event) => {
      if (event.isComposing) return false

      const text = normalizeText(editor.value?.getText({ blockSeparator: '\n' }) || '')
      if (event.key === '/' && !text) {
        event.preventDefault()
        emit('open-slash-menu', event)
        return true
      }

      if (event.key === 'Backspace' && !text) {
        event.preventDefault()
        emit('delete-block')
        return true
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        emit('create-new-block')
        return true
      }

      return false
    }
  },
  onUpdate: ({ editor: nextEditor }) => {
    if (isSyncing.value) return
    emit('update:modelValue', {
      ...(props.modelValue || {}),
      text: normalizeText(nextEditor.getText({ blockSeparator: '\n' })),
      html: nextEditor.getHTML(),
      document: nextEditor.getJSON()
    })
  },
  onFocus: () => {
    isFocused.value = true
    showToolbar.value = true
    emit('focus')
  },
  onBlur: () => {
    isFocused.value = false
    window.setTimeout(() => {
      if (!isFocused.value) showToolbar.value = false
    }, 120)
    emit('blur')
  }
})

const isEmpty = computed(() => !normalizeText(editor.value?.getText({ blockSeparator: '\n' }) || ''))

const focusEditor = () => editor.value?.commands.focus()

const toggle = (mark) => {
  if (!editor.value) return
  const chain = editor.value.chain().focus()
  if (mark === 'bold') chain.toggleBold().run()
  if (mark === 'italic') chain.toggleItalic().run()
  if (mark === 'code') chain.toggleCode().run()
  if (mark === 'strike') chain.toggleStrike().run()
  if (mark === 'highlight') chain.toggleHighlight().run()
}

const setLink = () => {
  if (!editor.value) return
  const currentHref = editor.value.getAttributes('link').href || 'https://'
  const href = window.prompt('输入链接地址', currentHref)
  if (href === null) return
  if (!href.trim()) {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  editor.value.chain().focus().setLink({ href: href.trim() }).run()
}

const syncFromModel = async () => {
  if (!editor.value || isFocused.value) return

  const nextContent = getInitialContent()
  isSyncing.value = true
  editor.value.commands.setContent(nextContent || '', false)
  await nextTick()
  isSyncing.value = false
}

watch(
  () => [props.modelValue?.document, props.modelValue?.html, props.modelValue?.text],
  syncFromModel,
  { deep: true }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

nextTick(() => {
  if (props.autoFocus) editor.value?.commands.focus('end')
})
</script>

<style scoped>
.rich-text-shell {
  position: relative;
  transition: background-color 0.16s ease, box-shadow 0.16s ease;
}

.rich-text-shell:hover,
.rich-text-shell.focused {
  background: rgba(250, 250, 250, 0.7);
  box-shadow: 0 8px 24px rgba(24, 24, 27, 0.04);
}

.dark .rich-text-shell:hover,
.dark .rich-text-shell.focused {
  background: rgba(39, 39, 42, 0.42);
}

.rich-text-content :deep(.ProseMirror) {
  min-height: 1.65rem;
  white-space: pre-wrap;
}

.rich-text-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  float: left;
  height: 0;
  color: rgb(161, 161, 170);
  content: attr(data-placeholder);
  pointer-events: none;
}

.rich-text-content :deep(.ProseMirror strong) {
  font-weight: 750;
}

.rich-text-content :deep(.ProseMirror code) {
  border-radius: 0.35rem;
  background: rgba(228, 228, 231, 0.7);
  padding: 0.1rem 0.3rem;
  font-size: 0.9em;
}

.dark .rich-text-content :deep(.ProseMirror code) {
  background: rgba(63, 63, 70, 0.8);
}

.rich-text-content :deep(.ProseMirror mark) {
  border-radius: 0.2rem;
  background: rgba(250, 204, 21, 0.35);
}

.rich-text-placeholder {
  position: absolute;
  top: 0.55rem;
  left: 0.75rem;
  color: rgb(161, 161, 170);
  font-size: 0.875rem;
  pointer-events: none;
}

.rich-text-toolbar {
  top: -2.55rem;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 0.75rem;
  background: white;
  padding: 0.25rem;
  box-shadow: 0 12px 28px rgba(24, 24, 27, 0.12);
}

.dark .rich-text-toolbar {
  border-color: rgb(63, 63, 70);
  background: rgb(24, 24, 27);
}

.rich-text-toolbar-btn {
  min-width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.45rem;
  color: rgb(82, 82, 91);
  font-size: 0.72rem;
  font-weight: 800;
}

.rich-text-toolbar-btn:hover,
.rich-text-toolbar-btn.active {
  background: rgb(244, 244, 245);
  color: rgb(24, 24, 27);
}

.dark .rich-text-toolbar-btn {
  color: rgb(212, 212, 216);
}

.dark .rich-text-toolbar-btn:hover,
.dark .rich-text-toolbar-btn.active {
  background: rgb(63, 63, 70);
  color: white;
}

.rich-text-toolbar-btn.italic {
  font-style: italic;
}

.rich-text-toolbar-btn.strike {
  text-decoration: line-through;
}
</style>
