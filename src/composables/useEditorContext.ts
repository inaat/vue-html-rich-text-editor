import { inject, provide, type InjectionKey } from 'vue'
import type { SelectionService } from '../core/SelectionService'
import type { HistoryService } from '../core/HistoryService'
import type { ExecCommandEngine } from '../core/ExecCommandEngine'
import type { DraftService } from '../core/DraftService'
import type { PageService } from '../core/PageService'
import type { TableService } from '../core/TableService'
import type { ImageService } from '../core/ImageService'
import type { PaintService } from '../core/PaintService'
import type { ExportService } from '../core/ExportService'
import type { ImportService } from '../core/ImportService'
import type { InsertService } from '../core/InsertService'
import type { PopupService } from '../core/PopupService'

export interface EditorContext {
  root: HTMLElement
  source: HTMLElement
  selection: SelectionService
  history: HistoryService
  engine: ExecCommandEngine
  draft: DraftService
  page: PageService
  table: TableService
  image: ImageService
  paint: PaintService
  export: ExportService
  import: ImportService
  insert: InsertService
  popup: PopupService
  scheduleSave(): void
  setStatus(msg: string, kind?: '' | 'ok' | 'err'): void
  setFilename(name: string): void
  getFilename(): string
}

export const EDITOR_CONTEXT: InjectionKey<EditorContext> = Symbol('rte-context')

export function provideEditorContext(ctx: EditorContext): void {
  provide(EDITOR_CONTEXT, ctx)
}

export function useEditorContext(): EditorContext {
  const ctx = inject(EDITOR_CONTEXT)
  if (!ctx) throw new Error('useEditorContext must be used inside <DocxEditor>')
  return ctx
}
