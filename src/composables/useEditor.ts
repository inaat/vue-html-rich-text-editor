import { ref, onMounted, onBeforeUnmount, watch, shallowRef, type Ref } from 'vue'
import { SelectionService } from '../core/SelectionService'
import { HistoryService } from '../core/HistoryService'
import { ExecCommandEngine } from '../core/ExecCommandEngine'
import { DraftService } from '../core/DraftService'
import { PageService } from '../core/PageService'
import { TableService } from '../core/TableService'
import { ImageService } from '../core/ImageService'
import { PaintService } from '../core/PaintService'
import { ExportService } from '../core/ExportService'
import { ImportService } from '../core/ImportService'
import { InsertService } from '../core/InsertService'
import { PopupService } from '../core/PopupService'
import { DirectionService } from '../core/DirectionService'
import type { EditorContext } from './useEditorContext'

export interface UseEditorOptions {
  modelValue: Ref<string>
  apiBase?: string
  onChange(html: string): void
  onStatus?(msg: string, kind: '' | 'ok' | 'err'): void
}

export type EditorContextRef = Ref<EditorContext | null>

export interface UseEditorReturn {
  rootRef: Ref<HTMLElement | null>
  sourceRef: Ref<HTMLElement | null>
  context: EditorContextRef
  ready: Ref<boolean>
}

export function useEditor(options: UseEditorOptions): UseEditorReturn {
  const rootRef = ref<HTMLElement | null>(null)
  const sourceRef = ref<HTMLElement | null>(null)
  const context = shallowRef(null) as Ref<EditorContext | null>
  const ready = ref(false)

  let filename = 'document'

  onMounted(() => {
    const root = rootRef.value
    const source = sourceRef.value
    if (!root || !source) return

    const selection = new SelectionService(root)
    const history = new HistoryService(root)
    const engine = new ExecCommandEngine(history, selection)
    engine.attach(root)
    const draft = new DraftService()
    const page = new PageService(root)
    const table = new TableService(selection)
    const image = new ImageService(root)
    const paint = new PaintService(selection)
    const exportSvc = new ExportService(root)
    const importSvc = new ImportService(
      root,
      options.apiBase ?? (location.origin.startsWith('http') ? '' : 'http://localhost:3001')
    )
    const insert = new InsertService(selection)
    const popup = new PopupService()

    page.apply(page.current)

    const ctx: EditorContext = {
      root,
      source,
      selection,
      history,
      engine,
      draft,
      page,
      table,
      image,
      paint,
      export: exportSvc,
      import: importSvc,
      insert,
      popup,
      scheduleSave() {
        draft.scheduleSave(() => ({
          filename,
          html: root.innerHTML,
          ts: Date.now()
        }))
        options.onChange(root.innerHTML)
      },
      setStatus(msg, kind = '') {
        options.onStatus?.(msg, kind)
      },
      setFilename(name) { filename = name },
      getFilename() { return filename }
    }
    context.value = ctx

    if (options.modelValue.value && root.innerHTML !== options.modelValue.value) {
      root.innerHTML = options.modelValue.value
    } else {
      const restored = draft.load()
      if (restored?.html && restored.html.trim() && !root.querySelector(':not(.placeholder)')) {
        root.innerHTML = restored.html
        filename = restored.filename || 'document'
        ctx.setStatus(`Restored draft (${new Date(restored.ts).toLocaleString()})`, 'ok')
      }
    }

    DirectionService.autoDirection(root)
    image.wrapAll()

    const onInput = () => ctx.scheduleSave()
    root.addEventListener('input', onInput)

    const observer = new MutationObserver(() => image.wrapAll())
    observer.observe(root, { childList: true, subtree: true })

    onBeforeUnmount(() => {
      root.removeEventListener('input', onInput)
      observer.disconnect()
      engine.detach()
      popup.close()
    })

    ready.value = true
  })

  watch(() => options.modelValue.value, (next) => {
    const root = rootRef.value
    if (root && root.innerHTML !== next) root.innerHTML = next
  })

  return { rootRef, sourceRef, context, ready }
}
