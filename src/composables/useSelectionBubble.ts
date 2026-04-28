import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface BubblePosition {
  visible: boolean
  top: number
  left: number
}

export function useSelectionBubble(
  root: () => HTMLElement | null,
  toolbarBottomGetter: () => number
) {
  const pos = ref<BubblePosition>({ visible: false, top: 0, left: 0 })
  const widthRef = ref(0)
  const heightRef = ref(0)

  function setBubbleSize(w: number, h: number) {
    widthRef.value = w
    heightRef.value = h
  }

  function update() {
    const sel = window.getSelection()
    const editor = root()
    if (!sel || !sel.rangeCount || sel.isCollapsed || !editor || !editor.contains(sel.anchorNode)) {
      pos.value = { visible: false, top: 0, left: 0 }
      return
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    if (!rect.width || rect.width < 2) {
      pos.value = { visible: false, top: 0, left: 0 }
      return
    }
    const toolbarBottom = toolbarBottomGetter()
    if (rect.bottom <= toolbarBottom + 4) {
      pos.value = { visible: false, top: 0, left: 0 }
      return
    }
    const gap = 8
    const w = widthRef.value || 200
    const h = heightRef.value || 36
    let top = rect.top - h - gap
    if (top < toolbarBottom + 4) top = rect.bottom + gap
    let left = rect.left + rect.width / 2 - w / 2
    const maxLeft = window.innerWidth - w - 8
    if (left < 8) left = 8
    if (left > maxLeft) left = maxLeft
    pos.value = {
      visible: true,
      top: window.scrollY + top,
      left: window.scrollX + left
    }
  }

  onMounted(() => document.addEventListener('selectionchange', update))
  onBeforeUnmount(() => document.removeEventListener('selectionchange', update))

  return { pos, update, setBubbleSize }
}
