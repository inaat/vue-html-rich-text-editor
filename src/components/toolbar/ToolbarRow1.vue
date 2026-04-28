<script setup lang="ts">
import { useEditorContext } from '../../composables/useEditorContext'
import { pickFile } from '../../core/InsertService'
import ToolbarButton from '../ToolbarButton.vue'

const ctx = useEditorContext()
const emit = defineEmits<{
  (e: 'toggle-source'): void
  (e: 'open-heading-menu'): void
  (e: 'import-files'): void
}>()

async function pickImage(ev: MouseEvent) {
  ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
    { label: 'Upload from device…', onClick: async () => {
      const f = await pickFile('image/*')
      if (f) await ctx.insert.imageFromFile(f)
    } },
    { label: 'Insert from URL…', onClick: () => {
      const url = prompt('Image URL:', 'https://')
      if (url) ctx.insert.imageFromUrl(url)
    } }
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
function insertMath() {
  const tex = prompt('Math (LaTeX), wrapped as \\(...\\):')
  if (tex) ctx.insert.math(tex)
}
function insertLink() {
  const url = prompt('Link URL:', 'https://')
  if (url) ctx.engine.exec('createLink', url)
}
function insertCode() {
  ctx.insert.inlineCode(window.getSelection()?.toString() ?? '')
}
function quoteBlock() { ctx.engine.exec('formatBlock', '<blockquote>') }

function onHighlight(ev: Event) {
  const target = ev.target as HTMLInputElement
  ctx.engine.exec('hiliteColor', target.value)
}
</script>

<template>
  <div class="tb-row">
    <ToolbarButton icon="source" title="Source code" @invoke="emit('toggle-source')" />
    <ToolbarButton icon="heading" title="Heading" has-arrow @invoke="emit('open-heading-menu')" />
    <span class="tb-sep" />
    <ToolbarButton icon="word-import" title="Import (Word .docx or .html)" @invoke="emit('import-files')" />
    <ToolbarButton icon="word-export" title="Export to Word" @invoke="ctx.export.toWordDoc(ctx.getFilename())" />
    <ToolbarButton icon="pdf" title="Export to PDF" @invoke="ctx.export.toPdf()" />
    <ToolbarButton icon="preview" title="Preview in new tab" @invoke="ctx.export.preview(ctx.getFilename(), ctx.page.current)" />
    <ToolbarButton icon="form" title="Form / template" @invoke="ctx.root.innerHTML = '<p><br></p>'; ctx.scheduleSave()" />
    <span class="tb-sep" />
    <label class="tb tb-color has-arrow" title="Highlight color">
      <span class="hl-letter">A</span>
      <span class="hl-bar" :style="{ background: '#fff59d' }" />
      <input
        type="color"
        value="#fff59d"
        @input="onHighlight"
      />
    </label>
    <ToolbarButton icon="link" title="Insert link" @invoke="insertLink" />
    <ToolbarButton icon="image" title="Insert image" has-arrow @invoke="pickImage" />
    <ToolbarButton icon="file" title="Insert file" has-arrow @invoke="pickAttachedFile" />
    <ToolbarButton icon="table" title="Insert table" has-arrow @invoke="pickTable" />
    <ToolbarButton icon="quote" title="Quote" @invoke="quoteBlock" />
    <ToolbarButton icon="video" title="Embed video" @invoke="insertVideo" />
    <ToolbarButton icon="embed" title="Embed HTML" @invoke="insertEmbed" />
    <ToolbarButton icon="pagebreak" title="Page break" @invoke="ctx.insert.pageBreak()" />
    <ToolbarButton icon="hr" title="Horizontal line" @invoke="ctx.insert.hr()" />
    <ToolbarButton icon="symbol" title="Special character" @invoke="insertSymbol" />
    <ToolbarButton icon="math" title="Math equation" @invoke="insertMath" />
    <ToolbarButton icon="code" title="Inline code" @invoke="insertCode" />
  </div>
</template>
