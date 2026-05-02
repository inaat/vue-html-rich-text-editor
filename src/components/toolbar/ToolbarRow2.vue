<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import { DirectionService } from '../../core/DirectionService'
import ToolbarButton from '../ToolbarButton.vue'
import CkDropdown from './ck-dropdown.vue'
import type { DropdownItem } from './ck-dropdown.vue'
import CkColorPicker from './ck-color-picker.vue'
import CkHighlightPicker from './ck-highlight-picker.vue'
import CkListPicker from './ck-list-picker.vue'
import CkMultilevelPicker from './ck-multilevel-picker.vue'

const ctx = useEditorContext()
const basicDropdown = ref<InstanceType<typeof CkDropdown> | null>(null)
const alignDropdown = ref<InstanceType<typeof CkDropdown> | null>(null)
const lineHeightDropdown = ref<InstanceType<typeof CkDropdown> | null>(null)
const bulletDropdown = ref<InstanceType<typeof CkDropdown> | null>(null)
const listPickerEl = ref<InstanceType<typeof CkListPicker> | null>(null)
const multilevelPickerEl = ref<InstanceType<typeof CkMultilevelPicker> | null>(null)
const colorPickerEl = ref<InstanceType<typeof CkColorPicker> | null>(null)
const highlightPickerEl = ref<InstanceType<typeof CkHighlightPicker> | null>(null)

let lastPickerRect = { left: 0, bottom: 0 }

const block = ref('')
const styleSel = ref('')
const currentLineHeight = ref('')
const tplSel = ref('')

const BLOCK_TAGS: Record<string, string> = {
  H1: 'h1', H2: 'h2', H3: 'h3', H4: 'h4', H5: 'h5', H6: 'h6',
  BLOCKQUOTE: 'blockquote', PRE: 'pre',
}

function detectBlock() {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return
  const node = sel.anchorNode
  if (!node || !ctx.root.contains(node)) return
  let el: HTMLElement | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement
  while (el && el !== ctx.root) {
    const tag = BLOCK_TAGS[el.tagName]
    if (tag) { block.value = tag; return }
    el = el.parentElement
  }
  block.value = ''
}

onMounted(() => document.addEventListener('selectionchange', detectBlock))
onUnmounted(() => document.removeEventListener('selectionchange', detectBlock))

function applyBlock() {
  if (block.value) ctx.engine.exec('formatBlock', block.value)
}
function applyStyle() {
  const v = styleSel.value
  if (!v) return
  const sel = window.getSelection()
  if (sel && !sel.isCollapsed) {
    if (v === 'red')   document.execCommand('foreColor', false, '#dc2626')
    else if (v === 'blue')  document.execCommand('foreColor', false, '#2563eb')
    else if (v === 'info')  ctx.insert.htmlAtCursor(`<div class="callout callout-info">${sel.toString()}</div>`)
    else if (v === 'warn')  ctx.insert.htmlAtCursor(`<div class="callout callout-warn">${sel.toString()}</div>`)
    else document.execCommand('removeFormat')
  }
  styleSel.value = ''
}
function applyFontSize(size: string) {
  if (!size) { document.execCommand('removeFormat'); return }
  // execCommand('fontSize') only accepts 1-7; use 7 as a marker then swap with a real px span
  const before = new Set(ctx.root.querySelectorAll('font[size="7"]'))
  ctx.engine.exec('fontSize', '7')
  for (const font of ctx.root.querySelectorAll('font[size="7"]')) {
    if (before.has(font)) continue
    const span = document.createElement('span')
    span.style.fontSize = size + 'px'
    while (font.firstChild) span.appendChild(font.firstChild)
    font.replaceWith(span)
  }
  ctx.scheduleSave()
}
function applyFontFamily(family: string) {
  if (family) document.execCommand('fontName', false, family)
  else document.execCommand('removeFormat')
}

function applyLineHeight(v: string) {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount || !ctx.root.contains(sel.anchorNode)) return
  const range = sel.getRangeAt(0)
  const targets = new Set<HTMLElement>()
  if (range.collapsed) {
    const b = ctx.selection.closestBlock(sel.anchorNode)
    if (b) targets.add(b)
  } else {
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT)
    let n: Node | null
    while ((n = walker.nextNode())) {
      if (range.intersectsNode(n)) {
        const b = ctx.selection.closestBlock(n)
        if (b) targets.add(b)
      }
    }
    const sb = ctx.selection.closestBlock(range.startContainer)
    const eb = ctx.selection.closestBlock(range.endContainer)
    if (sb) targets.add(sb)
    if (eb) targets.add(eb)
  }
  targets.forEach((b) => { b.style.lineHeight = v })
  currentLineHeight.value = v
  ctx.scheduleSave()
}

const LINE_HEIGHTS = ['1', '1.15', '1.5', '2', '2.5', '3']
const lineHeightItems = computed<DropdownItem[]>(() =>
  LINE_HEIGHTS.map(v => ({
    label: v,
    shortcut: currentLineHeight.value === v ? '✓' : undefined,
    onClick: () => applyLineHeight(v),
  }))
)

function pickLineHeight(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  lineHeightDropdown.value?.openAt(rect.left, rect.bottom + 2)
}
function applyList(kind: 'ul' | 'ol', style: string) {
  ctx.engine.exec(kind === 'ul' ? 'insertUnorderedList' : 'insertOrderedList')
  if (!style) return
  let list = ctx.selection.selectionBlock() as HTMLElement | null
  while (list && list.tagName !== 'UL' && list.tagName !== 'OL') list = list.parentNode as HTMLElement | null
  if (list) list.style.listStyleType = style
}
const bulletItems: DropdownItem[] = [
  { label: 'Disc',   icon: 'list-disc',   onClick: () => applyList('ul', 'disc') },
  { label: 'Circle', icon: 'list-circle', onClick: () => applyList('ul', 'circle') },
  { label: 'Square', icon: 'list-square', onClick: () => applyList('ul', 'square') },
]
function pickBullet(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  bulletDropdown.value?.openAt(rect.left, rect.bottom + 2)
}
function pickOrdered(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  listPickerEl.value?.openAt(rect.left, rect.bottom + 2)
}

function applyBasic(kind: string) {
  switch (kind) {
    case 'sup':       ctx.engine.exec('superscript'); break
    case 'sub':       ctx.engine.exec('subscript'); break
    case 'code':      ctx.insert.inlineCode(window.getSelection()?.toString() ?? ''); break
    case 'strike':    ctx.engine.exec('strikeThrough'); break
    case 'underline': ctx.engine.exec('underline'); break
    case 'italic':    ctx.engine.exec('italic'); break
    case 'bold':      ctx.engine.exec('bold'); break
  }
}
const fontSizeChildren: DropdownItem[] = [
  { label: '10',      style: 'font-size:10px', onClick: () => applyFontSize('10') },
  { label: '12',      style: 'font-size:12px', onClick: () => applyFontSize('12') },
  { label: '14',      style: 'font-size:14px', onClick: () => applyFontSize('14') },
  { label: 'Default',                          onClick: () => applyFontSize('') },
  { label: '18',      style: 'font-size:18px', onClick: () => applyFontSize('18') },
  { label: '20',      style: 'font-size:20px', onClick: () => applyFontSize('20') },
  { label: '22',      style: 'font-size:22px', onClick: () => applyFontSize('22') },
  { label: '24',      style: 'font-size:24px', onClick: () => applyFontSize('24') },
  { label: '36',      style: 'font-size:36px', onClick: () => applyFontSize('36') },
]

const fontFamilyChildren: DropdownItem[] = [
  { label: 'Default',            onClick: () => applyFontFamily('') },
  { label: 'Arial',              style: 'font-family:Arial',                onClick: () => applyFontFamily('Arial') },
  { label: 'Courier New',        style: 'font-family:"Courier New"',        onClick: () => applyFontFamily('Courier New') },
  { label: 'Georgia',            style: 'font-family:Georgia',              onClick: () => applyFontFamily('Georgia') },
  { label: 'Lucida Sans Unicode',style: 'font-family:"Lucida Sans Unicode"',onClick: () => applyFontFamily('Lucida Sans Unicode') },
  { label: 'Tahoma',             style: 'font-family:Tahoma',               onClick: () => applyFontFamily('Tahoma') },
  { label: 'Times New Roman',    style: 'font-family:"Times New Roman"',    onClick: () => applyFontFamily('Times New Roman') },
  { label: 'Trebuchet MS',       style: 'font-family:"Trebuchet MS"',       onClick: () => applyFontFamily('Trebuchet MS') },
  { label: 'Verdana',            style: 'font-family:Verdana',              onClick: () => applyFontFamily('Verdana') },
  { separator: true },
  { label: 'IBM Plex Arabic',    style: 'font-family:"IBM Plex Arabic"',    onClick: () => applyFontFamily('IBM Plex Arabic') },
  { label: 'Noto Sans Arabic',   style: 'font-family:"Noto Sans Arabic"',   onClick: () => applyFontFamily('Noto Sans Arabic') },
  { label: 'Cairo',              style: 'font-family:Cairo',                onClick: () => applyFontFamily('Cairo') },
  { label: 'Amiri',              style: 'font-family:Amiri',                onClick: () => applyFontFamily('Amiri') },
]

const basicItems: DropdownItem[] = [
  { label: 'Font Size',     icon: 'font_size',     children: fontSizeChildren,   onClick: () => {} },
  { label: 'Font Family',   icon: 'font_family',   children: fontFamilyChildren, onClick: () => {} },
    { label: 'Font Color',    icon: 'font_color',    arrow: true, onClick: () => colorPickerEl.value?.openAt(lastPickerRect.left, lastPickerRect.bottom + 2, 'foreColor') },
  { label: 'Highlight',     icon: 'remove_color',  arrow: true, onClick: () => highlightPickerEl.value?.openAt(lastPickerRect.left, lastPickerRect.bottom + 2) },

  { label: 'Italic',        icon: 'italic',        shortcut: 'Ctrl+I',           onClick: () => applyBasic('italic') },
  { label: 'Underline',     icon: 'underline',     shortcut: 'Ctrl+U',           onClick: () => applyBasic('underline') },
  { label: 'Strikethrough', icon: 'strikethrough', shortcut: 'Ctrl+Shift+X',     onClick: () => applyBasic('strike') },
  { label: 'Inline Code',   icon: 'code',                                         onClick: () => applyBasic('code') },
  { label: 'Superscript',   icon: 'superscript',   shortcut: 'Ctrl+.',            onClick: () => applyBasic('sup') },
  { label: 'Subscript',     icon: 'subscript',     shortcut: 'Ctrl+,',            onClick: () => applyBasic('sub') },
]

function setDir(dir: 'ltr' | 'rtl') {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount || !ctx.root.contains(sel.anchorNode)) return
  const block = ctx.selection.selectionBlock() ?? (sel.anchorNode?.nodeType === 1 ? sel.anchorNode as HTMLElement : sel.anchorNode?.parentElement ?? null)
  DirectionService.setBlockDir(block, dir)
  ctx.scheduleSave()
}

const alignItems: DropdownItem[] = [
  { label: 'Align Left',    icon: 'align-left',    shortcut: 'Ctrl+Shift+L', onClick: () => ctx.engine.exec('justifyLeft') },
  { label: 'Align Center',  icon: 'align-center',  shortcut: 'Ctrl+Shift+E', onClick: () => ctx.engine.exec('justifyCenter') },
  { label: 'Align Right',   icon: 'align-right',   shortcut: 'Ctrl+Shift+R', onClick: () => ctx.engine.exec('justifyRight') },
  { label: 'Justify',       icon: 'align-justify', shortcut: 'Ctrl+Shift+J', onClick: () => ctx.engine.exec('justifyFull') },
  { label: 'Left to Right', icon: 'ltr',                                      onClick: () => setDir('ltr') },
  { label: 'Right to Left', icon: 'rtl',                                      onClick: () => setDir('rtl') },
]

function pickAlign(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  alignDropdown.value?.openAt(rect.left, rect.bottom + 2)
}

function pickBasic(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  lastPickerRect = { left: rect.left, bottom: rect.bottom }
  basicDropdown.value?.openAt(rect.left, rect.bottom + 2)
}

function applyMultiLevel(l1: string, l2: string, l3: string) {
  const html = `<ol style="list-style-type:${l1}"><li>Item 1<ol style="list-style-type:${l2}"><li>Item 1.1<ol style="list-style-type:${l3}"><li>Item 1.1.1</li></ol></li></ol></li><li>Item 2</li></ol>`
  ctx.insert.htmlAtCursor(html)
}
function pickMultiLevel(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  multilevelPickerEl.value?.openAt(rect.left, rect.bottom + 2)
}

function applyTemplate() {
  if (tplSel.value) ctx.insert.template(tplSel.value)
  tplSel.value = ''
}
</script>

<template>
  <div class="tb-row">
    <select v-model="block" class="tb-sel wide" title="Heading" @change="applyBlock">
      <option value="">Paragraph</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
      <option value="h4">Heading 4</option>
      <option value="h5">Heading 5</option>
      <option value="h6">Heading 6</option>
      <option value="blockquote">Block Quote</option>
      <option value="pre">Code Block</option>
    </select>
    <select v-model="styleSel" class="tb-sel" title="Styles" @change="applyStyle">
      <option value="">Styles</option>
      <option value="default">Default Style</option>
      <option value="red">Red Heading</option>
      <option value="blue">Blue Heading</option>
      <option value="info">Info Box</option>
      <option value="warn">Warning Box</option>
    </select>
    <span class="tb-sep" />

    <ToolbarButton icon="bold" title="Bold (Ctrl+B)" @invoke="ctx.engine.exec('bold')" />
    <ToolbarButton icon="italic" title="Italic (Ctrl+I)" @invoke="ctx.engine.exec('italic')" />
    <ToolbarButton icon="underline" title="Underline (Ctrl+U)" @invoke="ctx.engine.exec('underline')" />
    <ToolbarButton icon="strikethrough" title="Strikethrough (Ctrl+Shift+X)" @invoke="ctx.engine.exec('strikeThrough')" />
    <ToolbarButton icon="basic_styles" title="Basic styles" has-arrow @invoke="pickBasic" />
    <CkDropdown ref="basicDropdown" :items="basicItems" />

    <CkColorPicker ref="colorPickerEl" />
    <CkHighlightPicker ref="highlightPickerEl" />

    <ToolbarButton icon="removeformat" title="Remove Format" @invoke="ctx.engine.exec('removeFormat')" />
    <span class="tb-sep" />

    <ToolbarButton icon="alignment" title="Text alignment" has-arrow @invoke="pickAlign" />
    <CkDropdown ref="alignDropdown" :items="alignItems" />
    <ToolbarButton icon="lineheight" title="Line height" has-arrow @invoke="pickLineHeight" />
    <CkDropdown ref="lineHeightDropdown" :items="lineHeightItems" />
    <span class="tb-sep" />

 

    <select v-model="tplSel" class="tb-sel" title="Insert template" @change="applyTemplate">
      <option value="">Templates</option>
      <option value="Signature (multi-line)">Signature</option>
      <option value="Projections Table">Projections Table</option>
      <option value="Balance Sheet">Balance Sheet</option>
      <option value="Company Letterhead">Letterhead</option>
    </select>
    <ToolbarButton icon="toc" title="Table of contents" @invoke="ctx.insert.toc()" />
    <span class="tb-sep" />

    <ToolbarButton icon="bulletlist" title="Bulleted list" has-arrow @invoke="pickBullet" />
    <CkDropdown ref="bulletDropdown" :items="bulletItems" />
    <ToolbarButton icon="numberedlist" title="Numbered list" has-arrow @invoke="pickOrdered" />
    <CkListPicker ref="listPickerEl" @pick="(style) => applyList('ol', style)" />
    <ToolbarButton icon="multilevel" title="Multi-level list" has-arrow @invoke="pickMultiLevel" />
    <CkMultilevelPicker ref="multilevelPickerEl" @pick="(l1, l2, l3) => applyMultiLevel(l1, l2, l3)" />
    <ToolbarButton icon="todolist" title="To-do list" @invoke="ctx.insert.todoList()" />
    <span class="tb-sep" />

    <ToolbarButton icon="outdent" title="Decrease indent" @invoke="ctx.engine.exec('outdent')" />
    <ToolbarButton icon="indent" title="Increase indent" @invoke="ctx.engine.exec('indent')" />
  </div>
</template>

<style scoped>
.tb-clr-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 5px;
  height: auto;
  min-height: 28px;
}
.tb-clr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.tb-clr-bar {
  width: 13px;
  height: 3px;
  border-radius: 1px;
}
</style>
