<script setup lang="ts">
import { ref } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import ToolbarButton from '../ToolbarButton.vue'

const ctx = useEditorContext()

const block = ref('')
const fontSize = ref('')
const fontFamily = ref('')
const align = ref('')
const lineHeight = ref('')
const bullet = ref('')
const ordered = ref('')

function applyBlock() {
  if (block.value) ctx.engine.exec('formatBlock', block.value)
  block.value = ''
}
function applyFontSize() {
  if (fontSize.value) ctx.engine.exec('fontSize', fontSize.value)
  fontSize.value = ''
}
function applyFontFamily() {
  if (fontFamily.value) ctx.engine.exec('fontName', fontFamily.value)
  fontFamily.value = ''
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

function startPaint() {
  if (ctx.paint.start()) ctx.setStatus('Format painter active — select text to apply', 'ok')
}
</script>

<template>
  <div class="tb-row">
    <select v-model="block" class="tb-sel wide" title="Paragraph format" @change="applyBlock">
      <option value="">Paragraph</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
      <option value="h4">Heading 4</option>
      <option value="h5">Heading 5</option>
      <option value="h6">Heading 6</option>
      <option value="blockquote">Quote</option>
      <option value="pre">Preformatted</option>
    </select>
    <span class="tb-sep" />
    <ToolbarButton icon="bold" title="Bold (Ctrl+B)" @invoke="ctx.engine.exec('bold')" />
    <ToolbarButton icon="italic" title="Italic (Ctrl+I)" @invoke="ctx.engine.exec('italic')" />
    <ToolbarButton icon="underline" title="Underline (Ctrl+U)" @invoke="ctx.engine.exec('underline')" />
    <ToolbarButton icon="strikethrough" title="Strikethrough" @invoke="ctx.engine.exec('strikeThrough')" />
    <ToolbarButton icon="superscript" title="Superscript" @invoke="ctx.engine.exec('superscript')" />
    <ToolbarButton icon="subscript" title="Subscript" @invoke="ctx.engine.exec('subscript')" />
    <ToolbarButton icon="code" title="Inline code" @invoke="ctx.insert.inlineCode(window.getSelection()?.toString() ?? '')" />
    <span class="tb-sep" />
    <select v-model="fontSize" class="tb-sel narrow has-arrow" title="Font size" @change="applyFontSize">
      <option value="">Aa</option>
      <option value="1">8</option>
      <option value="2">10</option>
      <option value="3">12</option>
      <option value="4">14</option>
      <option value="5">18</option>
      <option value="6">24</option>
      <option value="7">36</option>
    </select>
    <ToolbarButton icon="remove-format" title="Clear formatting" @invoke="ctx.engine.exec('removeFormat')" />
    <ToolbarButton icon="paint" title="Format painter" has-arrow @invoke="startPaint" />
    <select v-model="fontFamily" class="tb-sel has-arrow" title="Font family" @change="applyFontFamily">
      <option value="">Aa</option>
      <option value="Arial, sans-serif">Arial</option>
      <option value="Calibri, sans-serif">Calibri</option>
      <option value="'Times New Roman', serif">Times New Roman</option>
      <option value="Georgia, serif">Georgia</option>
      <option value="'Courier New', monospace">Courier New</option>
      <option value="Tahoma, sans-serif">Tahoma</option>
      <option value="Verdana, sans-serif">Verdana</option>
    </select>
    <span class="tb-sep" />
    <select v-model="align" class="tb-sel narrow has-arrow" title="Alignment" @change="applyAlign">
      <option value="">≡</option>
      <option value="justifyLeft">⇤ Left</option>
      <option value="justifyCenter">↔ Center</option>
      <option value="justifyRight">⇥ Right</option>
      <option value="justifyFull">⇔ Justify</option>
    </select>
    <select v-model="lineHeight" class="tb-sel narrow has-arrow" title="Line height (current paragraph)" @change="applyLineHeight">
      <option value="">↕</option>
      <option value="1">1.0</option>
      <option value="1.15">1.15</option>
      <option value="1.25">1.25</option>
      <option value="1.5">1.5</option>
      <option value="1.75">1.75</option>
      <option value="2">2.0</option>
      <option value="2.5">2.5</option>
      <option value="3">3.0</option>
    </select>
    <select v-model="bullet" class="tb-sel narrow has-arrow" title="Bullet list" @change="applyBullet">
      <option value="">•</option>
      <option value="disc">• disc</option>
      <option value="circle">○ circle</option>
      <option value="square">■ square</option>
    </select>
    <select v-model="ordered" class="tb-sel narrow has-arrow" title="Numbered list" @change="applyOrdered">
      <option value="">1.</option>
      <option value="decimal">1. decimal</option>
      <option value="lower-alpha">a. alpha</option>
      <option value="upper-alpha">A. ALPHA</option>
      <option value="lower-roman">i. roman</option>
      <option value="upper-roman">I. ROMAN</option>
    </select>
    <ToolbarButton icon="outdent" title="Decrease indent" @invoke="ctx.engine.exec('outdent')" />
    <ToolbarButton icon="indent" title="Increase indent" @invoke="ctx.engine.exec('indent')" />
    <span class="tb-sep" />
    <ToolbarButton icon="undo" title="Undo (Ctrl+Z)" @invoke="ctx.engine.exec('undo')" />
    <ToolbarButton icon="redo" title="Redo (Ctrl+Y)" @invoke="ctx.engine.exec('redo')" />
  </div>
</template>
