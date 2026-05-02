import { BLOCK_TAGS } from '@/core/Constants'

export class SelectionService {
  private savedRange: Range | null = null

  constructor(public readonly root: HTMLElement) {}

  remember(): void {
    const sel = window.getSelection()
    if (sel && sel.rangeCount && this.root.contains(sel.anchorNode)) {
      this.savedRange = sel.getRangeAt(0).cloneRange()
    }
  }

  restore(): void {
    if (!this.savedRange) return
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(this.savedRange)
  }

  ensure(): void {
    this.root.focus()
    const sel = window.getSelection()
    if (!sel) return
    if (this.savedRange && this.root.contains(this.savedRange.startContainer)) {
      sel.removeAllRanges()
      sel.addRange(this.savedRange)
      return
    }
    if (!sel.rangeCount || !this.root.contains(sel.anchorNode)) {
      const range = document.createRange()
      range.selectNodeContents(this.root)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  hasSelection(): boolean {
    const sel = window.getSelection()
    return !!sel && !sel.isCollapsed
  }

  selectedText(): string {
    return window.getSelection()?.toString() ?? ''
  }

  closestBlock(node: Node | null): HTMLElement | null {
    let n: Node | null = node
    while (n && n !== this.root) {
      if (n.nodeType === 1) {
        const el = n as HTMLElement
        if (BLOCK_TAGS.test(el.tagName)) return el
      }
      n = n.parentNode
    }
    return null
  }

  closestCell(node: Node | null): HTMLTableCellElement | null {
    let n: Node | null = node
    while (n && n !== this.root) {
      if (n.nodeType === 1) {
        const el = n as HTMLElement
        if (el.tagName === 'TD' || el.tagName === 'TH') return el as HTMLTableCellElement
      }
      n = n.parentNode
    }
    return null
  }

  closestTable(node: Node | null): HTMLTableElement | null {
    let n: Node | null = node
    while (n && n !== this.root) {
      if (n.nodeType === 1 && (n as HTMLElement).tagName === 'TABLE') {
        return n as HTMLTableElement
      }
      n = n.parentNode
    }
    return null
  }

  selectionBlock(): HTMLElement | null {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return null
    return this.closestBlock(sel.getRangeAt(0).startContainer)
  }
}
