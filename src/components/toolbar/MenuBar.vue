<script setup lang="ts">
import { ref } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'
import { useLocale } from '@/composables/useLocale'
import { pickFile } from '@/core/InsertService'

const ctx = useEditorContext()
const lc = useLocale()
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
  const url = prompt(lc.value.promptVideo)
  if (url) ctx.insert.video(url)
}
function insertEmbed() {
  const html = prompt(lc.value.promptEmbed)
  if (html) ctx.insert.embed(html)
}
function insertSymbol() {
  const ch = prompt(lc.value.promptSpecialChar, '©')
  if (ch) ctx.insert.symbol(ch)
}
function insertMath() {
  const tex = prompt(lc.value.promptMath)
  if (tex) ctx.insert.math(tex)
}
function clearAll() {
  if (confirm(lc.value.confirmClear)) {
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
  alert(lc.value.aboutText)
}

type MenuKey = 'file' | 'edit' | 'view' | 'insert' | 'format' | 'help'

function open(key: MenuKey, ev: MouseEvent) {
  const anchor = ev.currentTarget as HTMLElement
  activeMenu.value = key
  const close = () => { if (activeMenu.value === key) activeMenu.value = null }
  const l = lc.value
  const items = (() => {
    switch (key) {
      case 'file': return [
        { label: l.fileNew, onClick: clearAll },
        { separator: true },
        { label: l.fileImport, onClick: () => emit('import-files') },
        { label: l.fileExportWord, onClick: () => ctx.export.toWordDoc(ctx.getFilename()) },
        { label: l.fileExportPdf, onClick: () => ctx.export.toPdf(ctx.page.current) },
        { separator: true },
        { label: l.filePreview, onClick: () => ctx.export.preview(ctx.getFilename(), ctx.page.current) },
        { label: l.filePrint, onClick: () => ctx.export.print(ctx.getFilename(), ctx.page.current) }
      ]
      case 'edit': return [
        { label: l.editUndo, shortcut: 'Ctrl+Z', onClick: () => exec('undo') },
        { label: l.editRedo, shortcut: 'Ctrl+Y', onClick: () => exec('redo') },
        { separator: true },
        { label: l.editCut,   shortcut: 'Ctrl+X', onClick: () => exec('cut') },
        { label: l.editCopy,  shortcut: 'Ctrl+C', onClick: () => exec('copy') },
        { label: l.editPaste, shortcut: 'Ctrl+V', onClick: () => exec('paste') },
        { separator: true },
        { label: l.editFind,      shortcut: 'Ctrl+F', onClick: findAndReplace },
        { label: l.editSelectAll, shortcut: 'Ctrl+A', onClick: selectAll }
      ]
      case 'view': return [
        { label: l.viewSource,  onClick: () => emit('toggle-source') },
        { label: l.viewPreview, onClick: () => ctx.export.preview(ctx.getFilename(), ctx.page.current) }
      ]
      case 'insert': return [
        { label: l.insertImageMenu,       onClick: pickImage },
        { label: l.insertFileAttachment,  onClick: pickAttachedFile },
        { label: l.insertTableMenu,       onClick: () => pickTable(anchor) },
        { label: l.insertLinkMenu,        shortcut: 'Ctrl+K', onClick: () => insertLink(anchor) },
        { label: l.insertBookmarkMenu,    onClick: () => { const n = prompt(l.promptBookmark); if (n) ctx.insert.bookmark(n) } },
        { label: l.insertFootnoteMenu,    onClick: () => ctx.insert.footnote() },
        { separator: true },
        { label: l.insertVideoMenu,  onClick: insertVideo },
        { label: l.insertEmbedMenu,  onClick: insertEmbed },
        { separator: true },
        { label: l.insertBlockQuoteMenu, onClick: () => exec('formatBlock', '<blockquote>') },
        { label: l.insertCodeBlockMenu,  onClick: () => ctx.insert.codeBlock(window.getSelection()?.toString() ?? '') },
        { label: l.insertPageBreakMenu,  onClick: () => ctx.insert.pageBreak() },
        { label: l.insertHruleMenu,      onClick: () => ctx.insert.hr() },
        { label: l.insertSpecialCharMenu, onClick: insertSymbol },
        { label: l.insertEmojiMenu,      onClick: () => { const e = prompt(l.promptEmoji); if (e) ctx.insert.emoji(e) } },
        { label: l.insertMathMenu,       onClick: insertMath },
        { separator: true },
        { label: l.insertMergeFieldMenu, onClick: () => { const f = prompt(l.promptMergeField, 'customer.name'); if (f) ctx.insert.mergeField(f) } },
        { label: l.insertTocMenu,        onClick: () => ctx.insert.toc() }
      ]
      case 'format': return [
        { label: l.formatBold,        shortcut: 'Ctrl+B', onClick: () => exec('bold') },
        { label: l.formatItalic,      shortcut: 'Ctrl+I', onClick: () => exec('italic') },
        { label: l.formatUnderline,   shortcut: 'Ctrl+U', onClick: () => exec('underline') },
        { label: l.formatStrikethrough, onClick: () => exec('strikeThrough') },
        { separator: true },
        { label: l.formatParagraph, onClick: () => exec('formatBlock', '<p>') },
        { label: l.formatH1,        onClick: () => exec('formatBlock', '<h1>') },
        { label: l.formatH2,        onClick: () => exec('formatBlock', '<h2>') },
        { label: l.formatH3,        onClick: () => exec('formatBlock', '<h3>') },
        { label: l.formatH4,        onClick: () => exec('formatBlock', '<h4>') },
        { separator: true },
        { label: l.formatAlignLeft,   onClick: () => exec('justifyLeft') },
        { label: l.formatAlignCenter, onClick: () => exec('justifyCenter') },
        { label: l.formatAlignRight,  onClick: () => exec('justifyRight') },
        { label: l.formatJustify,     onClick: () => exec('justifyFull') },
        { separator: true },
        { label: l.formatClearFormatting, onClick: () => exec('removeFormat') }
      ]
      case 'help': return [
        { label: l.helpAbout, onClick: showAbout }
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
      <span class="mb-title">{{ lc.appTitle }}</span>
    </div>
    <span class="mb-divider" />
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'file' }" @click="open('file', $event)">{{ lc.menuFile }}</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'edit' }" @click="open('edit', $event)">{{ lc.menuEdit }}</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'view' }" @click="open('view', $event)">{{ lc.menuView }}</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'insert' }" @click="open('insert', $event)">{{ lc.menuInsert }}</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'format' }" @click="open('format', $event)">{{ lc.menuFormat }}</button>
    <button type="button" class="mb-item" :class="{ active: activeMenu === 'help' }" @click="open('help', $event)">{{ lc.menuHelp }}</button>
  </div>
</template>
