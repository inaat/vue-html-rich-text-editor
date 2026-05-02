import { onMounted, onBeforeUnmount } from 'vue'
import type { EditorContext } from '@/composables/useEditorContext'
import { DirectionService } from '@/core/DirectionService'

export function useShortcuts(getContext: () => EditorContext | null) {
  function onKey(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return
    const ctx = getContext()
    if (!ctx) return
    const k = e.key.toLowerCase()
    if (k === 's') {
      e.preventDefault()
      ctx.draft.save({ filename: ctx.getFilename(), html: ctx.root.innerHTML, ts: Date.now() })
      ctx.setStatus('Draft saved', 'ok')
    } else if (e.shiftKey && k === 'l') {
      e.preventDefault()
      DirectionService.setBlockDir(ctx.selection.selectionBlock(), 'ltr')
    } else if (e.shiftKey && k === 'r') {
      e.preventDefault()
      DirectionService.setBlockDir(ctx.selection.selectionBlock(), 'rtl')
    }
  }

  onMounted(() => document.addEventListener('keydown', onKey))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
}
