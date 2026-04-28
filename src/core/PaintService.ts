import type { SelectionService } from './SelectionService'

export interface PaintStyle {
  color: string
  backgroundColor: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
}

export class PaintService {
  active = false
  style: PaintStyle | null = null

  constructor(private selection: SelectionService) {}

  start(): boolean {
    this.selection.remember()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return false
    const node = sel.getRangeAt(0).startContainer.parentElement
    if (!node) return false
    const cs = window.getComputedStyle(node)
    this.style = {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      textDecoration: cs.textDecorationLine
    }
    this.active = true
    return true
  }

  apply(): boolean {
    if (!this.active || !this.style) return false
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || sel.isCollapsed) return false
    const span = document.createElement('span')
    Object.assign(span.style, this.style)
    span.appendChild(sel.getRangeAt(0).extractContents())
    sel.getRangeAt(0).insertNode(span)
    this.active = false
    this.style = null
    return true
  }

  cancel(): void {
    this.active = false
    this.style = null
  }
}
