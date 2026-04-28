import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { TableService } from '../core/TableService'
import type { SelectionService } from '../core/SelectionService'

export interface TableToolsState {
  visible: boolean
  top: number
  left: number
  width: number
  height: number
  table: HTMLTableElement | null
  cell: HTMLTableCellElement | null
}

export function useTableTools(
  root: Ref<HTMLElement | null>,
  selection: () => SelectionService | null,
  table: () => TableService | null,
  toolbarBottomGetter: () => number
) {
  const state = ref<TableToolsState>({
    visible: false, top: 0, left: 0, width: 0, height: 0, table: null, cell: null
  })

  let editorHasFocus = false
  let toolsSize = { w: 220, h: 32 }

  function setToolsSize(w: number, h: number) { toolsSize = { w, h } }

  function hide() {
    if (state.value.table) state.value.table.classList.remove('active-table')
    state.value = { visible: false, top: 0, left: 0, width: 0, height: 0, table: null, cell: null }
  }

  function position() {
    const t = state.value.table
    if (!t || !document.contains(t)) { hide(); return }
    const r = t.getBoundingClientRect()
    const toolbarBottom = toolbarBottomGetter()
    if (r.bottom < toolbarBottom || r.top > window.innerHeight) {
      state.value = { ...state.value, visible: false }
      return
    }
    const gap = 6
    let top = r.top - toolsSize.h - gap
    if (top < toolbarBottom + 4) top = Math.max(toolbarBottom + 4, r.top + gap)
    if (top + toolsSize.h > window.innerHeight - 4) top = window.innerHeight - toolsSize.h - 4
    let left = r.left
    const maxLeft = window.innerWidth - toolsSize.w - 8
    if (left < 8) left = 8
    if (left > maxLeft) left = maxLeft
    state.value = {
      ...state.value,
      visible: true,
      top: window.scrollY + top,
      left: window.scrollX + left,
      width: r.width + 2,
      height: r.height + 2
    }
  }

  function sync() {
    const sel = window.getSelection()
    const ed = root.value
    const selSvc = selection()
    if (!editorHasFocus || !ed || !selSvc) { hide(); return }
    if (!sel || !sel.rangeCount || !ed.contains(sel.anchorNode)) { hide(); return }
    const t = selSvc.closestTable(sel.anchorNode)
    const c = selSvc.closestCell(sel.anchorNode)
    if (!t || !c) { hide(); return }
    if (state.value.table && state.value.table !== t) state.value.table.classList.remove('active-table')
    state.value = { ...state.value, table: t, cell: c }
    t.classList.add('active-table')
    position()
  }

  function onFocus() { editorHasFocus = true }
  function onBlur() {
    setTimeout(() => {
      const ae = document.activeElement
      const ed = root.value
      if (ae && ed && ae !== ed && !ed.contains(ae)) {
        const inTools = (ae as HTMLElement).closest?.('.table-tools, .tt-props-panel, .tbl-overlay')
        if (!inTools) { editorHasFocus = false; hide() }
      }
    }, 0)
  }

  onMounted(() => {
    document.addEventListener('selectionchange', sync)
    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)
    const ed = root.value
    if (ed) {
      ed.addEventListener('focus', onFocus)
      ed.addEventListener('blur', onBlur)
    }
  })
  onBeforeUnmount(() => {
    document.removeEventListener('selectionchange', sync)
    window.removeEventListener('scroll', position, true)
    window.removeEventListener('resize', position)
    const ed = root.value
    if (ed) {
      ed.removeEventListener('focus', onFocus)
      ed.removeEventListener('blur', onBlur)
    }
  })

  return { state, hide, position, sync, setToolsSize }
}
