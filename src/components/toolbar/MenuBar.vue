<script setup lang="ts">
import { ref } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'
import { pickFile } from '@/core/InsertService'

const ctx = useEditorContext()
const emit = defineEmits<{
  (e: 'toggle-source'): void
  (e: 'import-files'): void
  (e: 'open-find-replace'): void
  (e: 'open-link', payload: { rect: { top: number; left: number; bottom: number } }): void
}>()

const activeMenu = ref<string | null>(null)

function exec(name: string, val?: string) { ctx.engine.exec(name, val) }

async function pickImage() {
  const f = await pickFile('image/*')
  if (f) await ctx.insert.imageFromFile(f)
}
async function pickAttachedFile() {
  const f = await pickFile('*/*')
  if (f) await ctx.insert.fileLinkFromFile(f)
}
function insertLink(anchor: HTMLElement) {
  const r = anchor.getBoundingClientRect()
  emit('open-link', { rect: { top: r.top, left: r.left, bottom: r.bottom } })
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
function clearAll() {
  if (confirm('Clear the document?')) {
    ctx.root.innerHTML = '<p><br></p>'
    ctx.scheduleSave()
  }
}
function findAndReplace() {
  emit('open-find-replace')
}
function selectAll() {
  const range = document.createRange()
  range.selectNodeContents(ctx.root)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}
function pickTable(anchor: HTMLElement) {
  ctx.popup.showTableGrid(anchor, (r, c) => ctx.insert.table(r, c))
}
function showAbout() {
  alert('Vue HTML Rich Text Editor\n\nKeyboard shortcuts:\n  Ctrl+B  Bold\n  Ctrl+I  Italic\n  Ctrl+U  Underline\n  Ctrl+Z  Undo\n  Ctrl+Y  Redo\n  Ctrl+K  Insert link\n  Ctrl+F  Find / Replace')
}

type MenuKey = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'help'

function open(key: MenuKey, ev: MouseEvent) {
  const anchor = ev.currentTarget as HTMLElement
  activeMenu.value = key
  const close = () => { if (activeMenu.value === key) activeMenu.value = null }
  const items = (() => {
    switch (key) {
      case 'file': return [
        { label: 'New (clear document)', onClick: clearAll },
        { separator: true },
        { label: 'Import from Word / HTML…', onClick: () => emit('import-files') },
        { label: 'Export to Word', onClick: () => ctx.export.toWordDoc(ctx.getFilename()) },
        { label: 'Export to PDF', onClick: () => ctx.export.toPdf(ctx.page.current) },
        { separator: true },
        { label: 'Preview in new tab', onClick: () => ctx.export.preview(ctx.getFilename(), ctx.page.current) }
      ]
      case 'edit': return [
        { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => exec('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => exec('redo') },
        { separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => exec('cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => exec('copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => exec('paste') },
        { separator: true },
        { label: 'Find and replace…', shortcut: 'Ctrl+F', onClick: findAndReplace },
        { label: 'Select all', shortcut: 'Ctrl+A', onClick: selectAll }
      ]
      case 'view': return [
        { label: 'Toggle source code (HTML)', onClick: () => emit('toggle-source') },
        { label: 'Preview in new tab', onClick: () => ctx.export.preview(ctx.getFilename(), ctx.page.current) }
      ]
      case 'insert': return [
        { label: 'Image…', onClick: pickImage },
        { label: 'File attachment…', onClick: pickAttachedFile },
        { label: 'Table…', onClick: () => pickTable(anchor) },
        { label: 'Link…', shortcut: 'Ctrl+K', onClick: () => insertLink(anchor) },
        { label: 'Bookmark…', onClick: () => { const n = prompt('Bookmark name:'); if (n) ctx.insert.bookmark(n) } },
        { label: 'Footnote', onClick: () => ctx.insert.footnote() },
        { separator: true },
        { label: 'Video / media…', onClick: insertVideo },
        { label: 'Embed HTML…', onClick: insertEmbed },
        { separator: true },
        { label: 'Block quote', onClick: () => exec('formatBlock', '<blockquote>') },
        { label: 'Code block', onClick: () => ctx.insert.codeBlock(window.getSelection()?.toString() ?? '') },
        { label: 'Page break', onClick: () => ctx.insert.pageBreak() },
        { label: 'Horizontal line', onClick: () => ctx.insert.hr() },
        { label: 'Special character…', onClick: insertSymbol },
        { label: 'Emoji…', onClick: () => { const e = prompt('Emoji:'); if (e) ctx.insert.emoji(e) } },
        { label: 'Math equation…', onClick: insertMath },
        { separator: true },
        { label: 'Merge field…', onClick: () => { const f = prompt('Field name:', 'customer.name'); if (f) ctx.insert.mergeField(f) } },
        { label: 'Table of contents', onClick: () => ctx.insert.toc() }
      ]
      case 'format': return [
        { label: 'Bold', shortcut: 'Ctrl+B', onClick: () => exec('bold') },
        { label: 'Italic', shortcut: 'Ctrl+I', onClick: () => exec('italic') },
        { label: 'Underline', shortcut: 'Ctrl+U', onClick: () => exec('underline') },
        { label: 'Strikethrough', onClick: () => exec('strikeThrough') },
        { separator: true },
        { label: 'Paragraph', onClick: () => exec('formatBlock', '<p>') },
        { label: 'Heading 1', onClick: () => exec('formatBlock', '<h1>') },
        { label: 'Heading 2', onClick: () => exec('formatBlock', '<h2>') },
        { label: 'Heading 3', onClick: () => exec('formatBlock', '<h3>') },
        { label: 'Heading 4', onClick: () => exec('formatBlock', '<h4>') },
        { separator: true },
        { label: 'Align left', onClick: () => exec('justifyLeft') },
        { label: 'Align center', onClick: () => exec('justifyCenter') },
        { label: 'Align right', onClick: () => exec('justifyRight') },
        { label: 'Justify', onClick: () => exec('justifyFull') },
        { separator: true },
        { label: 'Clear formatting', onClick: () => exec('removeFormat') }
      ]
      case 'help': return [
        { label: 'About / Keyboard shortcuts', onClick: showAbout }
      ]
    }
  })()
  ctx.popup.showMenu(anchor, items as any)
  setTimeout(() => {
    const obs = new MutationObserver(() => {
      if (!document.querySelector('.tb-popup.tb-menu')) {
        close(); obs.disconnect()
      }
    })
    obs.observe(document.body, { childList: true })
  }, 0)
}
</script>

<template>
  <div class="mb-row" role="menubar" aria-label="Editor menu bar">
    <div class="mb-logo">
      <div class="mb-logomark" aria-hidden="true">
        <svg viewBox="0 0 13 13" fill="none" width="13" height="13">
          <rect x="1" y="1" width="11" height="11" rx="2" stroke="white" stroke-width="1.5"/>
          <path d="M3 4.5h7M3 6.5h5M3 8.5h6" stroke="white" stroke-width="1.25" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="mb-title">Document Editor</span>
    </div>
    <span class="mb-divider" />
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'file' }" @click="open('file', $event)">File</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'edit' }" @click="open('edit', $event)">Edit</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'view' }" @click="open('view', $event)">View</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'insert' }" @click="open('insert', $event)">Insert</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'format' }" @click="open('format', $event)">Format</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'help' }" @click="open('help', $event)">Help</button>
  </div>
</template>
