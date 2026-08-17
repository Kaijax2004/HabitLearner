export function useEditorKeyboard({ onSave, onUndo, onRedo } = {}) {
  const isEditable = (target) => !!target?.closest?.('textarea, input, [contenteditable="true"], select')

  const handleKeydown = async (event) => {
    if (event.defaultPrevented) return
    const modifier = event.ctrlKey || event.metaKey
    if (!modifier || event.altKey) return

    const key = event.key.toLowerCase()
    if (key === 's' && onSave) {
      event.preventDefault()
      await onSave()
    } else if (key === 'z' && !event.shiftKey && onUndo && isEditable(event.target)) {
      event.preventDefault()
      await onUndo()
    } else if ((key === 'y' || (key === 'z' && event.shiftKey)) && onRedo && isEditable(event.target)) {
      event.preventDefault()
      await onRedo()
    }
  }

  return { handleKeydown }
}
