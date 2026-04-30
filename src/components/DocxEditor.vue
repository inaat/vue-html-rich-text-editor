<script setup lang="ts">
import { ref, computed, toRef, watch } from 'vue'
import '../styles/editor.css'
import { useEditor } from '../composables/useEditor'
import { provideEditorContext } from '../composables/useEditorContext'
import { useSelectionBubble } from '../composables/useSelectionBubble'
import { useTableTools } from '../composables/useTableTools'
import { useTableInteractions } from '../composables/useTableInteractions'
import { useImageTools } from '../composables/useImageTools'
import { useShortcuts } from '../composables/useShortcuts'
import { formatBytes } from '../core/Format'
import { DirectionService } from '../core/DirectionService'
import type { DocumentMeta, MergeFieldCategory } from '../types'
import { EMPTY_META } from '../types'
import Toolbar from './toolbar/Toolbar.vue'
import EditorPane from './EditorPane.vue'
import Sidebar from './sidebar/Sidebar.vue'
import BubbleToolbar from './bubble/BubbleToolbar.vue'
import TableTools from './table/TableTools.vue'
import TableOverlay from './table/TableOverlay.vue'
import TablePropsPanel from './table/TablePropsPanel.vue'
import ImageTools from './image/ImageTools.vue'
import FindReplaceDialog from './FindReplaceDialog.vue'
import LinkPopover from './LinkPopover.vue'
import ImageUrlDialog from './ImageUrlDialog.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  apiBase?: string
  fields?: MergeFieldCategory[]
}>(), { modelValue: '' })

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const showSource = ref(false)
const source = ref('')
const status = ref<{ msg: string; kind: '' | 'ok' | 'err' }>({ msg: '', kind: '' })
const meta = ref<DocumentMeta>({ ...EMPTY_META })
const fileInputRef = ref<HTMLInputElement | null>(null)
const toolbarRef = ref<InstanceType<typeof Toolbar> | null>(null)
const zoom = ref(100)
const fullscreen = ref(false)
const wordCount = ref(0)
const charCount = ref(0)
const pageCount = ref(1)
const findReplaceVisible = ref(false)
const linkPopover = ref<{ visible: boolean; top: number; left: number }>({ visible: false, top: 0, left: 0 })
const imageUrlVisible = ref(false)

function zoomIn()  { zoom.value = Math.min(200, zoom.value + 10) }
function zoomOut() { zoom.value = Math.max(50,  zoom.value - 10) }
function toggleFullscreen() { fullscreen.value = !fullscreen.value }
function openFindReplace() { findReplaceVisible.value = true }
function openLinkPopover(payload: { rect: { top: number; left: number; bottom: number } }) {
  const r = payload.rect
  linkPopover.value = {
    visible: true,
    top: r.bottom + 10,
    left: Math.max(8, r.left)
  }
}
function openImageUrl() { imageUrlVisible.value = true }
function onImageUrlSubmit(url: string) {
  if (url) context.value?.insert.imageFromUrl(url)
}

const modelValue = toRef(props, 'modelValue')

const { rootRef, sourceRef, context, ready } = useEditor({
  modelValue,
  apiBase: props.apiBase,
  onChange(html) {
    emit('update:modelValue', html)
    emit('change', html)
  },
  onStatus(msg, kind) {
    status.value = { msg, kind }
    if (kind === 'ok') setTimeout(() => { if (status.value.msg === msg) status.value = { msg: '', kind: '' } }, 2500)
  }
})

const bindRoot = (el: Element | null) => { rootRef.value = el as HTMLElement | null }
const bindSource = (el: Element | null) => { sourceRef.value = el as HTMLElement | null }

function recountStats() {
  if (!rootRef.value) return
  const text = (rootRef.value.innerText || '').trim()
  wordCount.value = text ? text.split(/\s+/).length : 0
  charCount.value = (rootRef.value.innerText || '').length
  pageCount.value = Math.max(1, rootRef.value.querySelectorAll('.pagebreak').length + 1)
}

watch(() => context.value, (c) => { if (c) recountStats() })

provideEditorContext(new Proxy({} as any, {
  get(_t, key) { return (context.value as any)?.[key] }
}))

function toolbarBottom(): number {
  const el = (toolbarRef.value as any)?.rootEl as HTMLElement | undefined
  return el ? el.getBoundingClientRect().bottom : 0
}

const bubble = useSelectionBubble(() => rootRef.value, toolbarBottom)
const tableTools = useTableTools(rootRef, () => context.value?.selection ?? null, () => context.value?.table ?? null, toolbarBottom)
const tableInteractions = useTableInteractions(
  rootRef,
  () => tableTools.state.value.table,
  () => context.value?.scheduleSave()
)
const imageTools = useImageTools(rootRef, () => context.value?.image ?? null, () => context.value?.scheduleSave())

watch(
  () => [tableTools.state.value.table, tableTools.state.value.top, tableTools.state.value.left],
  () => tableInteractions.positionOverlay()
)

useShortcuts(() => context.value)

const propsPanel = ref<{ visible: boolean; mode: 'cell' | 'table'; top: number; left: number }>({
  visible: false, mode: 'cell', top: 0, left: 0
})

function openProps(mode: 'cell' | 'table', anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect()
  const w = 320
  let left = r.left
  if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8
  propsPanel.value = {
    visible: true,
    mode,
    top: window.scrollY + r.bottom + 6,
    left: window.scrollX + left
  }
}

function toggleSource() {
  if (!ready.value || !rootRef.value) return
  if (showSource.value) {
    rootRef.value.innerHTML = source.value
    showSource.value = false
  } else {
    source.value = rootRef.value.innerHTML
    showSource.value = true
  }
}

function importFiles() {
  fileInputRef.value?.click()
}

async function onFileChange() {
  const inp = fileInputRef.value
  if (!inp || !inp.files || !inp.files.length || !context.value) return
  const files = Array.from(inp.files)
  const file = files[0]
  const ctx = context.value

  try {
    const htmlFile = files.find((f) => /\.html?$/i.test(f.name))
    if (htmlFile) {
      ctx.setStatus(`Loading ${htmlFile.name}…`, '')
      const result = await ctx.import.importHtml(htmlFile, files)
      ctx.setFilename(result.filename)
      DirectionService.autoDirection(ctx.root)
      source.value = ctx.root.innerHTML
      if (result.pageOverride) ctx.page.apply(result.pageOverride)
      meta.value = {
        ...EMPTY_META,
        file: htmlFile.name,
        size: formatBytes(result.bytes),
        images: String(result.imagesFound),
        api: 'html'
      }
      ctx.setStatus(`Loaded ${htmlFile.name}`, 'ok')
      ctx.scheduleSave()
      return
    }

    ctx.setStatus(`Uploading ${file.name}…`, '')
    const data = await ctx.import.convertDocx(file)
    ctx.setFilename(data.filename.replace(/\.docx$/i, ''))
    ctx.root.innerHTML = data.html
    DirectionService.autoDirection(ctx.root)
    source.value = ctx.root.innerHTML
    const imgs = data.meta?.images ?? 0
    const inj = data.meta?.injected ?? 0
    meta.value = {
      file: data.filename,
      size: formatBytes(data.bytes),
      blocks: data.meta?.blocks ?? '—',
      images: inj > 0 ? `${imgs} (${inj} recovered)` : `${imgs}`,
      zipMedia: data.meta?.mediaInZip ?? '—',
      unsupported: (data.meta?.mediaUnsupported || []).join(', ') || 'none',
      recovered: (() => {
        const rec = data.meta?.recovered || {}
        const parts: string[] = []
        if (rec.textboxes) parts.push(`${rec.textboxes} textbox${rec.textboxes > 1 ? 'es' : ''}`)
        if (rec.headers) parts.push(`${rec.headers} header line${rec.headers > 1 ? 's' : ''}`)
        if (rec.footers) parts.push(`${rec.footers} footer line${rec.footers > 1 ? 's' : ''}`)
        return parts.length ? parts.join(', ') : 'none'
      })(),
      api: data.meta?.apiVersion?.join('.') ?? '—'
    }
    ctx.setStatus(`Loaded ${data.filename}`, 'ok')
    ctx.scheduleSave()
  } catch (err: any) {
    ctx.setStatus(err.message ?? 'Import failed', 'err')
  } finally {
    inp.value = ''
  }
}

function onEditorMouseup() {
  const ctx = context.value
  if (ctx?.paint.active && ctx.paint.apply()) ctx.setStatus('Format applied', 'ok')
}

function focusCellEnd(cell: HTMLTableCellElement) {
  const range = document.createRange()
  range.selectNodeContents(cell)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function onEditorKeydown(e: KeyboardEvent) {
  const sel = window.getSelection()
  const ed = rootRef.value
  if (e.key === 'Enter') {
    console.log('[enter] keydown fired ' + JSON.stringify({
      hasSel: !!sel,
      rangeCount: sel?.rangeCount ?? 0,
      hasEd: !!ed,
      anchorNodeType: sel?.anchorNode?.nodeType,
      anchorTag: sel?.anchorNode?.nodeType === 1 ? (sel.anchorNode as Element).tagName : null,
      parentTag: (sel?.anchorNode as any)?.parentElement?.tagName,
      shift: e.shiftKey
    }))
  }
  if (!sel || !sel.rangeCount || !ed) return
  const cell = (sel.anchorNode?.nodeType === 1 ? (sel.anchorNode as Element) : sel.anchorNode?.parentElement)?.closest('td, th') as HTMLTableCellElement | null
  if (e.key === 'Enter') {
    console.log('[enter] cell check ' + JSON.stringify({
      hasCell: !!cell,
      edContainsCell: cell ? ed.contains(cell) : null,
      cellTag: cell?.tagName
    }))
  }
  if (!cell || !ed.contains(cell)) return

  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const br = document.createElement('br')
    range.insertNode(br)
    const atEnd = !br.nextSibling || (br.nextSibling.nodeType === 1 && (br.nextSibling as Element).tagName === 'BR')
    const trailing = atEnd ? document.createElement('br') : null
    if (trailing) br.parentNode?.insertBefore(trailing, br.nextSibling)
    const after = document.createRange()
    after.setStartAfter(br)
    after.collapse(true)
    sel.removeAllRanges()
    sel.addRange(after)
    console.log('[enter] inserted ' + JSON.stringify({
      atEnd,
      cellHTML: cell.innerHTML.slice(0, 200)
    }))
    context.value?.scheduleSave()
    return
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    const row = cell.parentElement as HTMLTableRowElement | null
    if (!row) return
    const cells = Array.from(row.cells)
    const idx = cells.indexOf(cell)
    if (e.shiftKey) {
      if (idx > 0) { focusCellEnd(cells[idx - 1]); return }
      const prevRow = row.previousElementSibling as HTMLTableRowElement | null
      if (prevRow && prevRow.cells.length) focusCellEnd(prevRow.cells[prevRow.cells.length - 1])
      return
    }
    if (idx < cells.length - 1) { focusCellEnd(cells[idx + 1]); return }
    const nextRow = row.nextElementSibling as HTMLTableRowElement | null
    if (nextRow && nextRow.cells.length) { focusCellEnd(nextRow.cells[0]); return }
    const ctx = context.value
    if (ctx) {
      ctx.history.snapshotNow()
      ctx.table.run('row-below', { table: tableTools.state.value.table, cell })
      ctx.scheduleSave()
      const newRow = row.nextElementSibling as HTMLTableRowElement | null
      if (newRow && newRow.cells.length) focusCellEnd(newRow.cells[0])
    }
    return
  }
}

function onEditorClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const del = target.closest('.pb-delete')
  if (del) {
    e.preventDefault()
    const pb = del.closest('.pagebreak')
    if (pb) { pb.remove(); context.value?.scheduleSave() }
  }
}

const statusClasses = computed(() => `status floating ${status.value.kind} ${status.value.msg ? 'visible' : ''}`.trim())
</script>

<template>
  <div class="rte-root" :class="{ 'is-fullscreen': fullscreen }" :style="{ '--rte-zoom': zoom / 100 }">
    <input
      ref="fileInputRef"
      type="file"
      accept=".docx,.html,.htm,.gif,.png,.jpg,.jpeg,.bmp,.svg,.webp,.css"
      multiple
      hidden
      @change="onFileChange"
    />

    <Toolbar
      ref="toolbarRef"
      :zoom="zoom"
      :fullscreen="fullscreen"
      :fields="props.fields"
      @toggle-source="toggleSource"
      @import-files="importFiles"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @toggle-fullscreen="toggleFullscreen"
      @open-find-replace="openFindReplace"
      @open-link="openLinkPopover"
      @open-image-url="openImageUrl"
    />

    <FindReplaceDialog
      v-if="ready"
      :visible="findReplaceVisible"
      @close="findReplaceVisible = false"
    />

    <LinkPopover
      v-if="ready"
      :visible="linkPopover.visible"
      :top="linkPopover.top"
      :left="linkPopover.left"
      @close="linkPopover.visible = false"
    />

    <ImageUrlDialog
      v-if="ready"
      :visible="imageUrlVisible"
      @close="imageUrlVisible = false"
      @submit="onImageUrlSubmit"
    />
    <span :class="statusClasses">{{ status.msg }}</span>

    <BubbleToolbar
      v-if="ready"
      :visible="bubble.pos.value.visible"
      :top="bubble.pos.value.top"
      :left="bubble.pos.value.left"
    />

    <TableTools
      v-if="ready"
      :visible="tableTools.state.value.visible"
      :top="tableTools.state.value.top"
      :left="tableTools.state.value.left"
      :table="tableTools.state.value.table"
      :cell="tableTools.state.value.cell"
      @open-props="openProps"
      @reposition="tableTools.position"
    />

    <TableOverlay
      v-if="ready"
      :visible="tableInteractions.overlay.value.visible"
      :top="tableInteractions.overlay.value.top"
      :left="tableInteractions.overlay.value.left"
      :width="tableInteractions.overlay.value.width"
      :height="tableInteractions.overlay.value.height"
      :enter-top-y="tableInteractions.overlay.value.enterTopY"
      :enter-bottom-y="tableInteractions.overlay.value.enterBottomY"
      :enter-x="tableInteractions.overlay.value.enterX"
      @drag-start="tableInteractions.startDrag"
      @insert-paragraph="tableInteractions.insertParagraph"
    />

    <TablePropsPanel
      v-if="ready"
      :visible="propsPanel.visible"
      :top="propsPanel.top"
      :left="propsPanel.left"
      :mode="propsPanel.mode"
      :table="tableTools.state.value.table"
      :cell="tableTools.state.value.cell"
      @close="propsPanel.visible = false"
    />

    <ImageTools
      v-if="ready"
      :visible="imageTools.state.value.visible"
      :tools-top="imageTools.state.value.toolsTop"
      :tools-left="imageTools.state.value.toolsLeft"
      :enter-top-y="imageTools.state.value.enterTopY"
      :enter-bottom-y="imageTools.state.value.enterBottomY"
      :enter-x="imageTools.state.value.enterX"
      :size-label="imageTools.state.value.sizeLabel"
      :active="imageTools.state.value.active"
      @reposition="imageTools.position"
      @deselect="imageTools.deselect"
    />

    <EditorPane
      :show-source="showSource"
      :source="source"
      :bind-root="bindRoot"
      :bind-source="bindSource"
      @edit-mouseup="onEditorMouseup"
      @edit-click="onEditorClick"
      @edit-keydown="onEditorKeydown"
      @edit-input="recountStats"
    >
      <template #sidebar>
        <Sidebar v-if="ready" :meta="meta" />
      </template>
    </EditorPane>

    <div class="statusbar">
      <span class="sb-dot" />
      <span>Ready</span>
      <span class="sb-div" />
      <span>Words: {{ wordCount }}</span>
      <span>Characters: {{ charCount }}</span>
      <span class="sb-div" />
      <span>{{ pageCount }} {{ pageCount === 1 ? 'page' : 'pages' }}</span>
      <span class="sb-spacer" />
      <span class="sb-branding">✓ </span>
    </div>
  </div>
</template>
