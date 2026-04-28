import type { EditorEngine } from './EditorEngine'
import type { HistoryService } from './HistoryService'
import type { SelectionService } from './SelectionService'

export class ExecCommandEngine implements EditorEngine {
  private element: HTMLElement | null = null

  constructor(
    private history?: HistoryService,
    private selection?: SelectionService
  ) {}

  attach(element: HTMLElement): void {
    this.element = element
  }

  detach(): void {
    this.element = null
  }

  focus(): void {
    this.element?.focus()
  }

  getHTML(): string {
    return this.element?.innerHTML ?? ''
  }

  setHTML(html: string): void {
    if (this.element && this.element.innerHTML !== html) {
      this.element.innerHTML = html
    }
  }

  exec(command: string, value?: string): void {
    if (command === 'undo') { this.history?.undo(); return }
    if (command === 'redo') { this.history?.redo(); return }
    this.history?.snapshotNow()
    this.selection?.ensure()
    document.execCommand(command, false, value)
    this.history?.snapshotSoon()
  }

  isActive(command: string): boolean {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }
}
