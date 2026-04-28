import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface TableOverlayState {
  visible: boolean
  top: number
  left: number
  width: number
  height: number
  enterTopY: number
  enterBottomY: number
  enterX: number
}

interface ResizeState {
  axis: 'col' | 'row'
  side: 'right' | 'bottom'
  cell: HTMLTableCellElement
  table: HTMLTableElement
  startX: number
  startY: number
  startW: number
  startH: number
}

interface DragState {
  table: HTMLTableElement
  target: Element | null
  place: 'before' | 'after'
}

const RESIZE_ZONE = 5

function closestTable(node: Node | null): HTMLTableElement | null {
  let n: Node | null = node
  while (n) {
    if (n.nodeType === 1 && (n as Element).tagName === 'TABLE') return n as HTMLTableElement
    n = n.parentNode
  }
  return null
}

function closestCell(node: Node | null): HTMLTableCellElement | null {
  let n: Node | null = node
  while (n) {
    if (n.nodeType === 1) {
      const tag = (n as Element).tagName
      if (tag === 'TD' || tag === 'TH') return n as HTMLTableCellElement
    }
    n = n.parentNode
  }
  return null
}

export function useTableInteractions(
  root: Ref<HTMLElement | null>,
  activeTable: () => HTMLTableElement | null,
  onChange: () => void
) {
  const overlay = ref<TableOverlayState>({ visible: false, top: 0, left: 0, width: 0, height: 0, enterTopY: 0, enterBottomY: 0, enterX: 0 })
  let currentTable: HTMLTableElement | null = null

  function detectActiveTable(): HTMLTableElement | null {
    const sel = window.getSelection()
    const ed = root.value
    if (!sel || !sel.rangeCount || !ed) return activeTable()
    const node = sel.anchorNode
    if (!ed.contains(node)) return activeTable()
    return closestTable(node) ?? activeTable()
  }

  function syncOverlay() {
    const t = detectActiveTable()
    currentTable = t
    if (!t || !document.contains(t)) {
      overlay.value = { visible: false, top: 0, left: 0, width: 0, height: 0, enterTopY: 0, enterBottomY: 0, enterX: 0 }
      return
    }
    const r = t.getBoundingClientRect()
    overlay.value = {
      visible: true,
      top: window.scrollY + r.top - 1,
      left: window.scrollX + r.left - 1,
      width: r.width + 2,
      height: r.height + 2,
      enterTopY: window.scrollY + r.top,
      enterBottomY: window.scrollY + r.bottom,
      enterX: window.scrollX + r.left + r.width / 2
    }
  }

  let resizeIndicator: HTMLDivElement | null = null
  let dragLine: HTMLDivElement | null = null
  let resizeState: ResizeState | null = null
  let dragState: DragState | null = null

  function ensureOverlayElems() {
    if (!resizeIndicator) {
      resizeIndicator = document.createElement('div')
      resizeIndicator.className = 'tbl-resize-indicator'
      resizeIndicator.style.cssText = 'position:fixed;z-index:9999;background:#2563eb;pointer-events:none;display:none;'
      document.body.appendChild(resizeIndicator)
    }
    if (!dragLine) {
      dragLine = document.createElement('div')
      dragLine.className = 'tbl-drag-line'
      dragLine.hidden = true
      document.body.appendChild(dragLine)
    }
  }

  const positionOverlay = syncOverlay

  function showIndicator(zone: { cell: HTMLTableCellElement; axis: 'col' | 'row'; side: 'right' | 'bottom' }, dragging = false) {
    if (!resizeIndicator) return
    const r = zone.cell.getBoundingClientRect()
    const table = closestTable(zone.cell)
    if (!table) return
    const tableR = table.getBoundingClientRect()
    const thickness = dragging ? 2 : 1
    resizeIndicator.style.opacity = dragging ? '1' : '0.55'
    if (zone.axis === 'col') {
      const x = (zone.side === 'right' ? r.right : r.left) - thickness / 2
      resizeIndicator.style.left = x + 'px'
      resizeIndicator.style.top = tableR.top + 'px'
      resizeIndicator.style.width = thickness + 'px'
      resizeIndicator.style.height = tableR.height + 'px'
    } else {
      const y = (zone.side === 'bottom' ? r.bottom : r.top) - thickness / 2
      resizeIndicator.style.left = tableR.left + 'px'
      resizeIndicator.style.top = y + 'px'
      resizeIndicator.style.width = tableR.width + 'px'
      resizeIndicator.style.height = thickness + 'px'
    }
    resizeIndicator.style.display = 'block'
  }
  function hideIndicator() {
    if (resizeIndicator) resizeIndicator.style.display = 'none'
  }

  function detectResizeZone(e: MouseEvent) {
    const ed = root.value
    if (!ed) return null
    const cell = closestCell(e.target as Node)
    if (!cell || !ed.contains(cell)) return null
    const r = cell.getBoundingClientRect()
    const fromRight = r.right - e.clientX
    const fromBottom = r.bottom - e.clientY
    const fromLeft = e.clientX - r.left
    const fromTop = e.clientY - r.top
    if (fromRight >= 0 && fromRight < RESIZE_ZONE && fromBottom > RESIZE_ZONE) {
      return { cell, axis: 'col' as const, side: 'right' as const }
    }
    if (fromLeft >= 0 && fromLeft < RESIZE_ZONE && fromBottom > RESIZE_ZONE && cell.cellIndex > 0) {
      const tr = cell.parentElement as HTMLTableRowElement | null
      const prev = tr && (tr.cells[cell.cellIndex - 1] as HTMLTableCellElement)
      if (prev) return { cell: prev, axis: 'col' as const, side: 'right' as const }
    }
    if (fromBottom >= 0 && fromBottom < RESIZE_ZONE && fromRight > RESIZE_ZONE) {
      return { cell, axis: 'row' as const, side: 'bottom' as const }
    }
    if (fromTop >= 0 && fromTop < RESIZE_ZONE && fromRight > RESIZE_ZONE) {
      const tr = cell.parentElement as HTMLTableRowElement | null
      const tbody = tr && (tr.parentElement as HTMLTableSectionElement | null)
      const idx = tr && tbody ? Array.from(tbody.children).indexOf(tr) : -1
      if (tbody && idx > 0) {
        const prevRow = tbody.children[idx - 1] as HTMLTableRowElement
        const prevCell = prevRow && (prevRow.cells[Math.min(cell.cellIndex, prevRow.cells.length - 1)] as HTMLTableCellElement)
        if (prevCell) return { cell: prevCell, axis: 'row' as const, side: 'bottom' as const }
      }
    }
    return null
  }

  function setCursorClass(kind: 'col' | 'row' | null) {
    document.body.classList.toggle('cur-col-resize', kind === 'col')
    document.body.classList.toggle('cur-row-resize', kind === 'row')
  }

  function onEditorMouseMove(e: MouseEvent) {
    if (resizeState) return
    const zone = detectResizeZone(e)
    if (zone) {
      setCursorClass(zone.axis)
      showIndicator(zone)
    } else {
      setCursorClass(null)
      hideIndicator()
    }
  }
  function onEditorMouseLeave() {
    if (!resizeState) { setCursorClass(null); hideIndicator() }
  }
  function onEditorMouseDown(e: MouseEvent) {
    const zone = detectResizeZone(e)
    if (!zone) return
    e.preventDefault()
    const table = closestTable(zone.cell)
    if (!table) return
    const r = zone.cell.getBoundingClientRect()
    resizeState = {
      ...zone,
      table,
      startX: e.clientX,
      startY: e.clientY,
      startW: r.width,
      startH: r.height
    }
    setCursorClass(zone.axis)
    document.body.style.userSelect = 'none'
  }

  function onWindowMouseMove(e: MouseEvent) {
    if (resizeState) {
      const { axis, cell, table, side, startX, startY, startW, startH } = resizeState
      if (axis === 'col') {
        const dx = e.clientX - startX
        const newW = Math.max(20, Math.round(startW + dx))
        const idx = cell.cellIndex
        const cols = table.querySelectorAll(':scope > colgroup > col')
        if (cols.length && cols[idx]) {
          (cols[idx] as HTMLElement).style.width = newW + 'px'
        } else {
          table.querySelectorAll<HTMLTableRowElement>(':scope > * > tr').forEach((tr) => {
            const c = tr.cells && (tr.cells[idx] as HTMLTableCellElement)
            if (c) c.style.width = newW + 'px'
          })
        }
        if (!table.style.tableLayout) table.style.tableLayout = 'fixed'
      } else {
        const dy = e.clientY - startY
        const newH = Math.max(16, Math.round(startH + dy))
        const tr = cell.parentElement as HTMLTableRowElement | null
        if (tr && tr.tagName === 'TR') tr.style.height = newH + 'px'
        cell.style.height = newH + 'px'
      }
      showIndicator({ cell, axis, side }, true)
      positionOverlay()
      return
    }
    if (dragState) {
      const ed = root.value
      if (!ed) return
      const y = e.clientY
      let best: Element | null = null
      let bestDist = Infinity
      let bestPlace: 'before' | 'after' = 'before'
      const candidates = ed.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, table, ul, ol, blockquote, pre, div, hr, figure')
      for (const node of Array.from(candidates)) {
        if (node === dragState.table || dragState.table.contains(node) || node.contains(dragState.table)) continue
        const r = node.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) continue
        const mid = (r.top + r.bottom) / 2
        const dist = Math.abs(mid - y)
        if (dist < bestDist) {
          bestDist = dist
          best = node
          bestPlace = y < mid ? 'before' : 'after'
        }
      }
      dragState.target = best
      dragState.place = bestPlace
      if (best && dragLine) {
        const r = best.getBoundingClientRect()
        dragLine.style.left = (window.scrollX + r.left) + 'px'
        dragLine.style.width = r.width + 'px'
        dragLine.style.top = (window.scrollY + (bestPlace === 'before' ? r.top - 1 : r.bottom - 1)) + 'px'
        dragLine.hidden = false
      } else if (dragLine) {
        dragLine.hidden = true
      }
    }
  }

  function onWindowMouseUp() {
    if (resizeState) {
      resizeState = null
      document.body.style.userSelect = ''
      setCursorClass(null)
      hideIndicator()
      onChange()
      positionOverlay()
    }
    if (dragState) {
      const { table, target, place } = dragState
      dragState = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      if (dragLine) dragLine.hidden = true
      if (target && target !== table && target.parentNode) {
        if (place === 'before') target.parentNode.insertBefore(table, target)
        else target.parentNode.insertBefore(table, target.nextSibling)
        onChange()
        positionOverlay()
      }
    }
  }

  function startDrag(e: MouseEvent) {
    const t = currentTable ?? activeTable()
    if (!t) return
    e.preventDefault()
    e.stopPropagation()
    dragState = { table: t, target: null, place: 'before' }
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }

  onMounted(() => {
    ensureOverlayElems()
    const ed = root.value
    if (ed) {
      ed.addEventListener('mousemove', onEditorMouseMove)
      ed.addEventListener('mouseleave', onEditorMouseLeave)
      ed.addEventListener('mousedown', onEditorMouseDown)
    }
    window.addEventListener('mousemove', onWindowMouseMove)
    window.addEventListener('mouseup', onWindowMouseUp)
    window.addEventListener('scroll', syncOverlay, true)
    window.addEventListener('resize', syncOverlay)
    document.addEventListener('selectionchange', syncOverlay)
  })
  onBeforeUnmount(() => {
    const ed = root.value
    if (ed) {
      ed.removeEventListener('mousemove', onEditorMouseMove)
      ed.removeEventListener('mouseleave', onEditorMouseLeave)
      ed.removeEventListener('mousedown', onEditorMouseDown)
    }
    window.removeEventListener('mousemove', onWindowMouseMove)
    window.removeEventListener('mouseup', onWindowMouseUp)
    window.removeEventListener('scroll', syncOverlay, true)
    window.removeEventListener('resize', syncOverlay)
    document.removeEventListener('selectionchange', syncOverlay)
    if (resizeIndicator) { resizeIndicator.remove(); resizeIndicator = null }
    if (dragLine) { dragLine.remove(); dragLine = null }
  })

  function insertParagraph(where: 'above' | 'below') {
    const t = currentTable ?? activeTable()
    if (!t || !t.parentNode) return
    const p = document.createElement('p')
    p.appendChild(document.createElement('br'))
    if (where === 'above') t.parentNode.insertBefore(p, t)
    else t.parentNode.insertBefore(p, t.nextSibling)
    const range = document.createRange()
    range.setStart(p, 0)
    range.collapse(true)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    root.value?.focus()
    onChange()
    positionOverlay()
  }

  return { overlay, positionOverlay, startDrag, insertParagraph }
}
