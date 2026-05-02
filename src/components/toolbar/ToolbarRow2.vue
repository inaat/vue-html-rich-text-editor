<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'
import { useLocale } from '@/composables/useLocale'
import { useFormatting } from '@/composables/useFormatting'
import { DirectionService } from '@/core/DirectionService'
import ToolbarButton from '@/components/ToolbarButton.vue'
import CkDropdown from '@/components/toolbar/ck-dropdown.vue'
import type { DropdownItem } from '@/components/toolbar/ck-dropdown.vue'
import CkColorPicker from '@/components/toolbar/ck-color-picker.vue'
import CkHighlightPicker from '@/components/toolbar/ck-highlight-picker.vue'
import CkListPicker from '@/components/toolbar/ck-list-picker.vue'
import CkMultilevelPicker from '@/components/toolbar/ck-multilevel-picker.vue'

const ctx = useEditorContext()
const lc = useLocale()
const { applyBasic, fontSizeChildren, fontFamilyChildren } = useFormatting()
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

const bulletItems = computed<DropdownItem[]>(() => [
  { label: lc.value.bulletDisc,   icon: 'list-disc',   onClick: () => applyList('ul', 'disc') },
  { label: lc.value.bulletCircle, icon: 'list-circle', onClick: () => applyList('ul', 'circle') },
  { label: lc.value.bulletSquare, icon: 'list-square', onClick: () => applyList('ul', 'square') },
])

function pickBullet(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  bulletDropdown.value?.openAt(rect.left, rect.bottom + 2)
}
function pickOrdered(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  listPickerEl.value?.openAt(rect.left, rect.bottom + 2)
}

const basicItems = computed<DropdownItem[]>(() => [
  { label: lc.value.fontSizeLabel,     icon: 'font_size',     children: fontSizeChildren,   onClick: () => {} },
  { label: lc.value.fontFamilyLabel,   icon: 'font_family',   children: fontFamilyChildren, onClick: () => {} },
  { label: lc.value.fontColorLabel,    icon: 'font_color',    arrow: true, onClick: () => colorPickerEl.value?.openAt(lastPickerRect.left, lastPickerRect.bottom + 2, 'foreColor') },
  { label: lc.value.highlightLabel,    icon: 'remove_color',  arrow: true, onClick: () => highlightPickerEl.value?.openAt(lastPickerRect.left, lastPickerRect.bottom + 2) },
  { label: lc.value.italicLabel,       icon: 'italic',        shortcut: 'Ctrl+I',       onClick: () => applyBasic('italic') },
  { label: lc.value.underlineLabel,    icon: 'underline',     shortcut: 'Ctrl+U',       onClick: () => applyBasic('underline') },
  { label: lc.value.strikethroughLabel,icon: 'strikethrough', shortcut: 'Ctrl+Shift+X', onClick: () => applyBasic('strike') },
  { label: lc.value.inlineCodeLabel,   icon: 'code',                                    onClick: () => applyBasic('code') },
  { label: lc.value.superscriptLabel,  icon: 'superscript',   shortcut: 'Ctrl+.',       onClick: () => applyBasic('sup') },
  { label: lc.value.subscriptLabel,    icon: 'subscript',     shortcut: 'Ctrl+,',       onClick: () => applyBasic('sub') },
])

function setDir(dir: 'ltr' | 'rtl') {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount || !ctx.root.contains(sel.anchorNode)) return
  const block = ctx.selection.selectionBlock() ?? (sel.anchorNode?.nodeType === 1 ? sel.anchorNode as HTMLElement : sel.anchorNode?.parentElement ?? null)
  DirectionService.setBlockDir(block, dir)
  ctx.scheduleSave()
}

const alignItems = computed<DropdownItem[]>(() => [
  { label: lc.value.alignLeft,    icon: 'align-left',    shortcut: 'Ctrl+Shift+L', onClick: () => ctx.engine.exec('justifyLeft') },
  { label: lc.value.alignCenter,  icon: 'align-center',  shortcut: 'Ctrl+Shift+E', onClick: () => ctx.engine.exec('justifyCenter') },
  { label: lc.value.alignRight,   icon: 'align-right',   shortcut: 'Ctrl+Shift+R', onClick: () => ctx.engine.exec('justifyRight') },
  { label: lc.value.justify,      icon: 'align-justify', shortcut: 'Ctrl+Shift+J', onClick: () => ctx.engine.exec('justifyFull') },
  { label: lc.value.leftToRight,  icon: 'ltr',                                      onClick: () => setDir('ltr') },
  { label: lc.value.rightToLeft,  icon: 'rtl',                                      onClick: () => setDir('rtl') },
])

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
    <select v-model="block" class="tb-sel wide" :title="lc.paragraph" @change="applyBlock">
      <option value="">{{ lc.paragraph }}</option>
      <option value="h1">{{ lc.heading1 }}</option>
      <option value="h2">{{ lc.heading2 }}</option>
      <option value="h3">{{ lc.heading3 }}</option>
      <option value="h4">{{ lc.heading4 }}</option>
      <option value="h5">{{ lc.heading5 }}</option>
      <option value="h6">{{ lc.heading6 }}</option>
      <option value="blockquote">{{ lc.blockQuoteOption }}</option>
      <option value="pre">{{ lc.codeBlockOption }}</option>
    </select>
    <select v-model="styleSel" class="tb-sel" :title="lc.stylesPlaceholder" @change="applyStyle">
      <option value="">{{ lc.stylesPlaceholder }}</option>
      <option value="default">{{ lc.defaultStyle }}</option>
      <option value="red">{{ lc.redHeading }}</option>
      <option value="blue">{{ lc.blueHeading }}</option>
      <option value="info">{{ lc.infoBox }}</option>
      <option value="warn">{{ lc.warningBox }}</option>
    </select>
    <span class="tb-sep" />

    <ToolbarButton icon="bold" :title="lc.bold" @invoke="ctx.engine.exec('bold')" />
    <ToolbarButton icon="italic" :title="lc.italic" @invoke="ctx.engine.exec('italic')" />
    <ToolbarButton icon="underline" :title="lc.underline" @invoke="ctx.engine.exec('underline')" />
    <ToolbarButton icon="strikethrough" :title="lc.strikethrough" @invoke="ctx.engine.exec('strikeThrough')" />
    <ToolbarButton icon="basic_styles" :title="lc.basicStyles" has-arrow @invoke="pickBasic" />
    <CkDropdown ref="basicDropdown" :items="basicItems" />

    <CkColorPicker ref="colorPickerEl" />
    <CkHighlightPicker ref="highlightPickerEl" />

    <ToolbarButton icon="removeformat" :title="lc.removeFormat" @invoke="ctx.engine.exec('removeFormat')" />
    <span class="tb-sep" />

    <ToolbarButton icon="alignment" :title="lc.textAlignment" has-arrow @invoke="pickAlign" />
    <CkDropdown ref="alignDropdown" :items="alignItems" />
    <ToolbarButton icon="lineheight" :title="lc.lineHeightBtn" has-arrow @invoke="pickLineHeight" />
    <CkDropdown ref="lineHeightDropdown" :items="lineHeightItems" />
    <span class="tb-sep" />

    <select v-model="tplSel" class="tb-sel" :title="lc.templatesPlaceholder" @change="applyTemplate">
      <option value="">{{ lc.templatesPlaceholder }}</option>
      <option value="Signature (multi-line)">{{ lc.templateSignature }}</option>
      <option value="Projections Table">{{ lc.templateProjections }}</option>
      <option value="Balance Sheet">{{ lc.templateBalance }}</option>
      <option value="Company Letterhead">{{ lc.templateLetterhead }}</option>
    </select>
    <ToolbarButton icon="toc" :title="lc.tableOfContents" @invoke="ctx.insert.toc()" />
    <span class="tb-sep" />

    <ToolbarButton icon="bulletlist" :title="lc.bulletedList" has-arrow @invoke="pickBullet" />
    <CkDropdown ref="bulletDropdown" :items="bulletItems" />
    <ToolbarButton icon="numberedlist" :title="lc.numberedList" has-arrow @invoke="pickOrdered" />
    <CkListPicker ref="listPickerEl" @pick="(style) => applyList('ol', style)" />
    <ToolbarButton icon="multilevel" :title="lc.multiLevelList" has-arrow @invoke="pickMultiLevel" />
    <CkMultilevelPicker ref="multilevelPickerEl" @pick="(l1, l2, l3) => applyMultiLevel(l1, l2, l3)" />
    <ToolbarButton icon="todolist" :title="lc.todoList" @invoke="ctx.insert.todoList()" />
    <span class="tb-sep" />

    <ToolbarButton icon="outdent" :title="lc.decreaseIndent" @invoke="ctx.engine.exec('outdent')" />
    <ToolbarButton icon="indent" :title="lc.increaseIndent" @invoke="ctx.engine.exec('indent')" />
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
