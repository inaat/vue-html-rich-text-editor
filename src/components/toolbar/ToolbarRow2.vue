<script setup lang="ts">
import { ref } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import ToolbarButton from '../ToolbarButton.vue'

const ctx = useEditorContext()

const block = ref('')
const styleSel = ref('')
const fontSize = ref('')
const align = ref('')
const lineHeight = ref('')
const bullet = ref('')
const ordered = ref('')
const tplSel = ref('')

function applyBlock() {
  if (block.value) ctx.engine.exec('formatBlock', block.value)
  block.value = ''
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
function applyFontSize() {
  if (fontSize.value) ctx.engine.exec('fontSize', fontSize.value)
  fontSize.value = ''
}
function applyAlign() {
  if (align.value) ctx.engine.exec(align.value)
  align.value = ''
}
function applyLineHeight() {
  const v = lineHeight.value
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount || !ctx.root.contains(sel.anchorNode)) {
    lineHeight.value = ''
    return
  }
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
  targets.forEach((b) => { b.style.lineHeight = v || '' })
  lineHeight.value = ''
  ctx.scheduleSave()
}
function applyList(kind: 'ul' | 'ol', style: string) {
  ctx.engine.exec(kind === 'ul' ? 'insertUnorderedList' : 'insertOrderedList')
  if (!style) return
  let list = ctx.selection.selectionBlock() as HTMLElement | null
  while (list && list.tagName !== 'UL' && list.tagName !== 'OL') list = list.parentNode as HTMLElement | null
  if (list) list.style.listStyleType = style
}
function applyBullet() { applyList('ul', bullet.value); bullet.value = '' }
function applyOrdered() { applyList('ol', ordered.value); ordered.value = '' }

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
function pickBasic(ev: MouseEvent) {
  ctx.popup.showMenu(ev.currentTarget as HTMLElement, [
    { label: 'Superscript (Ctrl+.)', onClick: () => applyBasic('sup') },
    { label: 'Subscript (Ctrl+,)',   onClick: () => applyBasic('sub') },
    { label: 'Inline Code',          onClick: () => applyBasic('code') },
    { label: 'Strikethrough',        onClick: () => applyBasic('strike') },
    { label: 'Underline',            onClick: () => applyBasic('underline') },
    { label: 'Italic',               onClick: () => applyBasic('italic') },
    { label: 'Bold',                 onClick: () => applyBasic('bold') }
  ])
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
    <ToolbarButton icon="basicstyles" title="Basic styles" has-arrow @invoke="pickBasic" />
    <span class="tb-sep" />

    <ToolbarButton icon="removeformat" title="Remove Format" @invoke="ctx.engine.exec('removeFormat')" />
    <span class="tb-sep" />

    <select v-model="align" class="tb-sel narrow" title="Text alignment" @change="applyAlign">
      <option value="">Align</option>
      <option value="justifyLeft">Left</option>
      <option value="justifyCenter">Center</option>
      <option value="justifyRight">Right</option>
      <option value="justifyFull">Justify</option>
    </select>
    <select v-model="lineHeight" class="tb-sel narrow" title="Line height" @change="applyLineHeight">
      <option value="">Line</option>
      <option value="1">1.0</option>
      <option value="1.15">1.15</option>
      <option value="1.5">1.5</option>
      <option value="2">2.0</option>
      <option value="2.5">2.5</option>
    </select>
    <span class="tb-sep" />

    <select v-model="fontSize" class="tb-sel narrow" title="Font size" @change="applyFontSize">
      <option value="">Aa</option>
      <option value="1">8</option>
      <option value="2">10</option>
      <option value="3">12</option>
      <option value="4">14</option>
      <option value="5">18</option>
      <option value="6">24</option>
      <option value="7">36</option>
    </select>
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

    <select v-model="bullet" class="tb-sel narrow" title="Bulleted list" @change="applyBullet">
      <option value="">•</option>
      <option value="disc">• disc</option>
      <option value="circle">○ circle</option>
      <option value="square">■ square</option>
    </select>
    <select v-model="ordered" class="tb-sel narrow" title="Numbered list" @change="applyOrdered">
      <option value="">1.</option>
      <option value="decimal">1. decimal</option>
      <option value="lower-alpha">a. alpha</option>
      <option value="upper-alpha">A. ALPHA</option>
      <option value="lower-roman">i. roman</option>
      <option value="upper-roman">I. ROMAN</option>
    </select>
    <ToolbarButton icon="multilevel" title="Multi-level list" @invoke="ctx.insert.multiLevelList()" />
    <ToolbarButton icon="todolist" title="To-do list" @invoke="ctx.insert.todoList()" />
    <span class="tb-sep" />

    <ToolbarButton icon="outdent" title="Decrease indent" @invoke="ctx.engine.exec('outdent')" />
    <ToolbarButton icon="indent" title="Increase indent" @invoke="ctx.engine.exec('indent')" />
  </div>
</template>
