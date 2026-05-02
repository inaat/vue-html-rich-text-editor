<script setup lang="ts">
import { useEditorContext } from '@/composables/useEditorContext'
import { pickFile } from '@/core/InsertService'
import ToolbarButton from '@/components/ToolbarButton.vue'
import Icon from '@/components/Icon.vue'
import type { MergeFieldCategory } from '@/types'

import { ref } from 'vue'

const props = defineProps<{
  zoom: number
  fullscreen: boolean
  fields?: MergeFieldCategory[]
}>()

const ctx = useEditorContext()
const emit = defineEmits<{
  (e: 'toggle-source'): void
  (e: 'open-heading-menu'): void
  (e: 'import-files'): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'toggle-fullscreen'): void
  (e: 'open-find-replace'): void
  (e: 'open-link', payload: { rect: { top: number; left: number; bottom: number } }): void
  (e: 'open-image-url'): void
}>()

const spellOn = ref(true)
function toggleSpellcheck() {
  spellOn.value = !spellOn.value
  if (ctx.root) ctx.root.setAttribute('spellcheck', String(spellOn.value))
  ctx.setStatus(spellOn.value ? 'Spellcheck on' : 'Spellcheck off', 'ok')
}

const highlightColor = ref('#fff59d')
function applyHighlight(ev: Event) {
  const target = ev.target as HTMLInputElement
  highlightColor.value = target.value
  ctx.engine.exec('hiliteColor', target.value)
}
function insertMath() {
  const tex = prompt('Math (LaTeX), wrapped as \\(...\\):')
  if (tex) ctx.insert.math(tex)
}

async function pickImage(ev: MouseEvent) {
  ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
    { label: 'Upload from computer', icon: 'image', onClick: async () => {
      const f = await pickFile('image/*')
      if (f) await ctx.insert.imageFromFile(f)
    } },
    { label: 'Insert with file manager', icon: 'filemanager', onClick: async () => {
      const f = await pickFile('image/*')
      if (f) await ctx.insert.imageFromFile(f)
    } },
    { label: 'Insert via URL', icon: 'link', onClick: () => emit('open-image-url') }
  ])
}

async function pickAttachedFile() {
  const f = await pickFile('*/*')
  if (f) await ctx.insert.fileLinkFromFile(f)
}

function pickTable(ev: MouseEvent) {
  ctx.popup.showTableGrid(ev.currentTarget as HTMLElement, (r, c) => ctx.insert.table(r, c))
}

function insertVideo() {
  const url = prompt('Video URL (YouTube/Vimeo or .mp4):')
  if (url) ctx.insert.video(url)
}
function insertEmbed() {
  const html = prompt('Paste HTML to embed:')
  if (html) ctx.insert.embed(html)
}
function insertSymbol() {
  const ch = prompt('Special character (e.g. © ™ ° ± × ÷ Ω π ∞):', '©')
  if (ch) ctx.insert.symbol(ch)
}
function insertEmoji(ev: MouseEvent) {
  ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
    '😀', '😁', '😂', '🤣', '😍', '🥰', '😎', '🤔',
    '👍', '👎', '🙏', '🎉', '🔥', '✨', '✅', '❌'
  ].map((e) => ({ label: e, onClick: () => ctx.insert.emoji(e) })))
}
function insertLink(ev: MouseEvent) {
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  emit('open-link', { rect: { top: r.top, left: r.left, bottom: r.bottom } })
}
function insertMergeField() {
  ctx.selection.remember()
  const name = prompt('Merge field name (e.g. customer.name):', 'field')
  if (name) ctx.insert.mergeField(name)
}
function pickMergeField(ev: MouseEvent) {
  ctx.selection.remember()
  if (props.fields?.length) {
    ctx.popup.showMergeFieldMenu(ev.currentTarget as HTMLElement, props.fields, (item) => {
      if (item.type === 'image') {
        ctx.insert.imagePlaceholder(item.value, item.label)
      } else {
        ctx.insert.mergeField(item.value, item.label)
      }
    })
  } else {
    ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
      { label: 'customer.name', onClick: () => ctx.insert.mergeField('customer.name') },
      { label: 'customer.email', onClick: () => ctx.insert.mergeField('customer.email') },
      { label: 'invoice.number', onClick: () => ctx.insert.mergeField('invoice.number') },
      { label: 'invoice.date', onClick: () => ctx.insert.mergeField('invoice.date') },
      { label: 'invoice.total', onClick: () => ctx.insert.mergeField('invoice.total') },
      { separator: true },
      { label: 'Custom field…', onClick: insertMergeField }
    ])
  }
}
function insertFootnote() {
  ctx.insert.footnote()
}
function insertBookmark() {
  const n = prompt('Bookmark name:')
  if (n) ctx.insert.bookmark(n)
}
function insertCodeBlock() {
  ctx.insert.codeBlock(window.getSelection()?.toString() ?? '')
}
function pickElement(ev: MouseEvent) {
  ctx.selection.remember()
  ctx.popup.showElementMenu(ev.currentTarget as HTMLElement, (tag, isBlock, content) => {
    ctx.insert.insertElement(tag, isBlock, content)
  })
}
function pickCaseChange(ev: MouseEvent) {
  ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
    { label: 'UPPER CASE', onClick: () => ctx.insert.caseChange('upper') },
    { label: 'lower case', onClick: () => ctx.insert.caseChange('lower') },
    { label: 'Title Case', onClick: () => ctx.insert.caseChange('title') },
    { label: 'Sentence case', onClick: () => ctx.insert.caseChange('sentence') },
    { label: 'tOGGLE cASE', onClick: () => ctx.insert.caseChange('toggle') }
  ])
}
function findReplace() {
  emit('open-find-replace')
}
function selectAll() {
  const range = document.createRange()
  range.selectNodeContents(ctx.root)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}
function startPaint() {
  if (ctx.paint.start()) ctx.setStatus('Format painter active — select text to apply', 'ok')
}
function quoteBlock() { ctx.engine.exec('formatBlock', '<blockquote>') }
</script>

<template>
  <div class="tb-row">
    <ToolbarButton icon="undo" title="Undo (Ctrl+Z)" @invoke="ctx.engine.exec('undo')" />
    <ToolbarButton icon="redo" title="Redo (Ctrl+Y)" @invoke="ctx.engine.exec('redo')" />
    <span class="tb-sep" />

    <div class="tb-split">
      <ToolbarButton icon="mergefield" title="Insert merge field" @invoke="insertMergeField" />
      <button type="button" class="tb-arr" title="Choose merge field" @mousedown.prevent @click="pickMergeField">
        <svg viewBox="0 0 10 10"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136z"/></svg>
      </button>
    </div>
    <span class="tb-sep" />

    <ToolbarButton icon="word-import" title="Import from Word / HTML" @invoke="emit('import-files')" />
    <ToolbarButton icon="word-export" title="Export to Word" @invoke="ctx.export.toWordDoc(ctx.getFilename())" />
    <ToolbarButton icon="pdf" title="Export to PDF" @invoke="ctx.export.toPdf(ctx.page.current, ctx.getFilename())" />
    <ToolbarButton icon="print" title="Print" @invoke="ctx.export.preview(ctx.getFilename(), ctx.page.current)" />
    <span class="tb-sep" />

    <ToolbarButton icon="paint" title="Paint formatting (Ctrl+Alt+C)" @invoke="startPaint" />
    <ToolbarButton icon="casechange" title="Case change (Shift+F3)" has-arrow @invoke="pickCaseChange" />
    <ToolbarButton icon="findreplace" title="Find and replace (Ctrl+F)" @invoke="findReplace" />
    <ToolbarButton icon="selectall" title="Select all (Ctrl+A)" @invoke="selectAll" />
    <ToolbarButton icon="spellcheck" :title="spellOn ? 'Spellcheck (on)' : 'Spellcheck (off)'" :active="spellOn" @invoke="toggleSpellcheck" />
    <span class="tb-sep" />

    <label class="tb tb-color" title="Highlight color">
      <span class="hl-letter">A</span>
      <span class="hl-bar" :style="{ background: highlightColor }" />
      <input type="color" :value="highlightColor" @input="applyHighlight" />
    </label>
    <ToolbarButton icon="link" title="Link (Ctrl+K)" @invoke="insertLink" />
    <ToolbarButton icon="footnote" title="Insert footnote" @invoke="insertFootnote" />
    <ToolbarButton icon="bookmark" title="Bookmark" @invoke="insertBookmark" />
    <span class="tb-sep" />

    <ToolbarButton icon="image" title="Insert image" has-arrow @invoke="pickImage" />
    <ToolbarButton icon="filemanager" title="File manager" @invoke="pickAttachedFile" />
    <ToolbarButton icon="table" title="Insert table" has-arrow @invoke="pickTable" />
    <ToolbarButton icon="blockquote" title="Block quote" @invoke="quoteBlock" />
    <ToolbarButton icon="media" title="Insert video / media" @invoke="insertVideo" />
    <ToolbarButton icon="embed" title="Embed HTML" @invoke="insertEmbed" />
    <ToolbarButton icon="htmlblock" title="Insert HTML element" has-arrow @invoke="pickElement" />
    <ToolbarButton icon="codeblock" title="Insert code block" @invoke="insertCodeBlock" />
    <ToolbarButton icon="pagebreak" title="Page break" @invoke="ctx.insert.pageBreak()" />
    <ToolbarButton icon="hrule" title="Horizontal line" @invoke="ctx.insert.hr()" />
    <ToolbarButton icon="emoji" title="Emoji" has-arrow @invoke="insertEmoji" />
    <ToolbarButton icon="special" title="Special characters" @invoke="insertSymbol" />
    <ToolbarButton icon="math" title="Math equation" @invoke="insertMath" />
    <ToolbarButton icon="source" title="Toggle HTML source" @invoke="emit('toggle-source')" />

    <div class="tb-spacer">
      <button type="button" class="tb" title="Zoom out" @click="emit('zoom-out')"><Icon name="zoomout" /></button>
      <span class="tb-zoom-label">{{ zoom }}%</span>
      <button type="button" class="tb" title="Zoom in" @click="emit('zoom-in')"><Icon name="zoomin" /></button>
      <ToolbarButton :icon="'fullscreen'" :title="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'" @invoke="emit('toggle-fullscreen')" />
    </div>
  </div>
</template>
