import { HISTORY_MAX } from './Constants'

export class HistoryService {
  private undoStack: string[] = []
  private redoStack: string[] = []
  private suppress = false
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(private root: HTMLElement) {}

  snapshotNow(): void {
    if (this.suppress) return
    const html = this.root.innerHTML
    const last = this.undoStack[this.undoStack.length - 1]
    if (last === html) return
    this.undoStack.push(html)
    if (this.undoStack.length > HISTORY_MAX) this.undoStack.shift()
    this.redoStack.length = 0
  }

  snapshotSoon(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.snapshotNow(), 350)
  }

  undo(): boolean {
    if (this.undoStack.length < 2) return false
    if (this.timer) {
      clearTimeout(this.timer)
      this.snapshotNow()
    }
    const cur = this.undoStack.pop()!
    this.redoStack.push(cur)
    this.apply(this.undoStack[this.undoStack.length - 1])
    return true
  }

  redo(): boolean {
    if (!this.redoStack.length) return false
    const next = this.redoStack.pop()!
    this.undoStack.push(next)
    this.apply(next)
    return true
  }

  private apply(html: string): void {
    this.suppress = true
    this.root.innerHTML = html
    setTimeout(() => { this.suppress = false }, 60)
  }
}
