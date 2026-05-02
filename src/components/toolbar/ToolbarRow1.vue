<script setup lang="ts">
import { useEditorContext } from '@/composables/useEditorContext'
import { useLocale } from '@/composables/useLocale'
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
const lc = useLocale()
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
  ctx.setStatus(spellOn.value ? lc.value.spellcheckOnMsg : lc.value.spellcheckOffMsg, 'ok')
}

const highlightColor = ref('#fff59d')
function applyHighlight(ev: Event) {
  const target = ev.target as HTMLInputElement
  highlightColor.value = target.value
  ctx.engine.exec('hiliteColor', target.value)
}
function insertMath() {
  const tex = prompt(lc.value.promptMath)
  if (tex) ctx.insert.math(tex)
}

async function pickImage(ev: MouseEvent) {
  ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
    { label: lc.value.uploadFromComputer, icon: 'image', onClick: async () => {
      const f = await pickFile('image/*')
      if (f) await ctx.insert.imageFromFile(f)
    } },
    { label: lc.value.fileManager, icon: 'filemanager', onClick: async () => {
      const f = await pickFile('image/*')
      if (f) await ctx.insert.imageFromFile(f)
    } },
    { label: lc.value.insertViaUrl, icon: 'link', onClick: () => emit('open-image-url') }
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
  const name = prompt(lc.value.promptMergeField, 'field')
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
      { label: lc.value.customField, onClick: insertMergeField }
    ])
  }
}
function insertFootnote() {
  ctx.insert.footnote()
}
function insertBookmark() {
  const n = prompt(lc.value.promptBookmark)
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
    { label: lc.value.upperCase,    onClick: () => ctx.insert.caseChange('upper') },
    { label: lc.value.lowerCase,    onClick: () => ctx.insert.caseChange('lower') },
    { label: lc.value.titleCase,    onClick: () => ctx.insert.caseChange('title') },
    { label: lc.value.sentenceCase, onClick: () => ctx.insert.caseChange('sentence') },
    { label: lc.value.toggleCase,   onClick: () => ctx.insert.caseChange('toggle') }
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
  if (ctx.paint.start()) ctx.setStatus(lc.value.paintFormatActive, 'ok')
}
function quoteBlock() { ctx.engine.exec('formatBlock', '<blockquote>') }
</script>

<template>
  <div class="tb-row">
    <ToolbarButton icon="undo" :title="lc.undo" @invoke="ctx.engine.exec('undo')" />
    <ToolbarButton icon="redo" :title="lc.redo" @invoke="ctx.engine.exec('redo')" />
    <span class="tb-sep" />

    <div class="tb-split">
      <ToolbarButton icon="mergefield" :title="lc.insertMergeField" @invoke="insertMergeField" />
      <button type="button" class="tb-arr" :title="lc.chooseMergeField" @mousedown.prevent @click="pickMergeField">
        <svg viewBox="0 0 10 10"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136z"/></svg>
      </button>
    </div>
    <span class="tb-sep" />

    <ToolbarButton icon="word-import" :title="lc.importFromWord" @invoke="emit('import-files')" />
    <ToolbarButton icon="word-export" :title="lc.exportToWord" @invoke="ctx.export.toWordDoc(ctx.getFilename())" />
    <ToolbarButton icon="pdf" :title="lc.exportToPdf" @invoke="ctx.export.toPdf(ctx.page.current, ctx.getFilename())" />
    <ToolbarButton icon="print" :title="lc.print" @invoke="ctx.export.preview(ctx.getFilename(), ctx.page.current)" />
    <span class="tb-sep" />

    <ToolbarButton icon="paint" :title="lc.paintFormat" @invoke="startPaint" />
    <ToolbarButton icon="casechange" :title="lc.caseChange" has-arrow @invoke="pickCaseChange" />
    <ToolbarButton icon="findreplace" :title="lc.findAndReplace" @invoke="findReplace" />
    <ToolbarButton icon="selectall" :title="lc.selectAll" @invoke="selectAll" />
    <ToolbarButton icon="spellcheck" :title="spellOn ? lc.spellcheckOn : lc.spellcheckOff" :active="spellOn" @invoke="toggleSpellcheck" />
    <span class="tb-sep" />

    <label class="tb tb-color" :title="lc.highlightColor">
      <span class="hl-letter">A</span>
      <span class="hl-bar" :style="{ background: highlightColor }" />
      <input type="color" :value="highlightColor" @input="applyHighlight" />
    </label>
    <ToolbarButton icon="link" :title="lc.insertLink" @invoke="insertLink" />
    <ToolbarButton icon="footnote" :title="lc.insertFootnote" @invoke="insertFootnote" />
    <ToolbarButton icon="bookmark" :title="lc.insertBookmark" @invoke="insertBookmark" />
    <span class="tb-sep" />

    <ToolbarButton icon="image" :title="lc.insertImage" has-arrow @invoke="pickImage" />
    <ToolbarButton icon="filemanager" :title="lc.fileManager" @invoke="pickAttachedFile" />
    <ToolbarButton icon="table" :title="lc.insertTable" has-arrow @invoke="pickTable" />
    <ToolbarButton icon="blockquote" :title="lc.blockQuote" @invoke="quoteBlock" />
    <ToolbarButton icon="media" :title="lc.insertMedia" @invoke="insertVideo" />
    <ToolbarButton icon="embed" :title="lc.embedHtml" @invoke="insertEmbed" />
    <ToolbarButton icon="htmlblock" :title="lc.insertHtmlElement" has-arrow @invoke="pickElement" />
    <ToolbarButton icon="codeblock" :title="lc.insertCodeBlock" @invoke="insertCodeBlock" />
    <ToolbarButton icon="pagebreak" :title="lc.pageBreak" @invoke="ctx.insert.pageBreak()" />
    <ToolbarButton icon="hrule" :title="lc.horizontalLine" @invoke="ctx.insert.hr()" />
    <ToolbarButton icon="emoji" :title="lc.insertEmoji" has-arrow @invoke="insertEmoji" />
    <ToolbarButton icon="special" :title="lc.specialChars" @invoke="insertSymbol" />
    <ToolbarButton icon="math" :title="lc.mathEquation" @invoke="insertMath" />
    <ToolbarButton icon="source" :title="lc.toggleSource" @invoke="emit('toggle-source')" />

    <div class="tb-spacer">
      <button type="button" class="tb" :title="lc.zoomOut" @click="emit('zoom-out')"><Icon name="zoomout" /></button>
      <span class="tb-zoom-label">{{ zoom }}%</span>
      <button type="button" class="tb" :title="lc.zoomIn" @click="emit('zoom-in')"><Icon name="zoomin" /></button>
      <ToolbarButton :icon="'fullscreen'" :title="fullscreen ? lc.exitFullscreen : lc.enterFullscreen" @invoke="emit('toggle-fullscreen')" />
    </div>
  </div>
</template>
