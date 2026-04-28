<script setup lang="ts">
import { ref } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import { pickFile } from '../../core/InsertService'

const props = defineProps<{
  visible: boolean
  toolsTop: number
  toolsLeft: number
  enterTopY: number
  enterBottomY: number
  enterX: number
  sizeLabel: string
  active: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'reposition'): void
  (e: 'deselect'): void
}>()

const ctx = useEditorContext()
const openMenu = ref<string | null>(null)

function toggleMenu(id: string) { openMenu.value = openMenu.value === id ? null : id }
function close() { openMenu.value = null }

function withWrap(fn: (wrap: HTMLElement) => void) {
  if (props.active) {
    ctx.history.snapshotNow()
    fn(props.active)
    ctx.scheduleSave()
    emit('reposition')
  }
  close()
}

function setAlt() {
  if (!props.active) return
  const img = props.active.querySelector('img') as HTMLImageElement | null
  if (!img) return
  const v = prompt('Alt text:', img.getAttribute('alt') || '')
  if (v !== null) img.setAttribute('alt', v)
}

function customSize() {
  if (!props.active) return
  const img = props.active.querySelector('img') as HTMLImageElement | null
  if (!img) return
  const cur = img.getBoundingClientRect().width
  const v = prompt('Width (px or %, e.g. 320 or 60%):', Math.round(cur) + 'px')
  if (v) ctx.image.applyCustomSize(props.active, v)
}

async function replace() {
  if (!props.active) return
  const img = props.active.querySelector('img') as HTMLImageElement | null
  if (!img) return
  const f = await pickFile('image/*')
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    img.src = reader.result as string
    if (f.name) img.alt = f.name
    img.onload = () => emit('reposition')
  }
  reader.readAsDataURL(f)
}

function insertParagraph(where: 'above' | 'below') {
  const wrap = props.active
  if (!wrap) return
  let block: HTMLElement | null = wrap.parentElement
  while (block && block !== ctx.root && !/^(P|DIV|H[1-6]|LI|BLOCKQUOTE|PRE)$/.test(block.tagName || '')) {
    block = block.parentElement
  }
  if (!block || block === ctx.root) block = wrap
  ctx.history.snapshotNow()
  const p = document.createElement('p')
  p.appendChild(document.createElement('br'))
  if (where === 'above') block.parentNode!.insertBefore(p, block)
  else block.parentNode!.insertBefore(p, block.nextSibling)
  const range = document.createRange()
  range.setStart(p, 0)
  range.collapse(true)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
  ctx.root.focus()
  emit('deselect')
  ctx.scheduleSave()
}
</script>

<template>
  <div class="image-tools-host">
  <button
    class="image-enter image-enter-top"
    type="button"
    :hidden="!visible"
    :style="{ top: enterTopY + 'px', left: enterX + 'px' }"
    title="Insert paragraph above"
    @mousedown.prevent
    @click="insertParagraph('above')"
  >
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 18 V13 a3 3 0 0 0 -3 -3 H6 M10 14 L6 10 L10 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
  <button
    class="image-enter image-enter-bottom"
    type="button"
    :hidden="!visible"
    :style="{ top: enterBottomY + 'px', left: enterX + 'px' }"
    title="Insert paragraph below"
    @mousedown.prevent
    @click="insertParagraph('below')"
  >
    <svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 6 V11 a3 3 0 0 1 -3 3 H6 M10 10 L6 14 L10 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
  <div
    class="image-tools"
    :hidden="!visible"
    :style="{ top: toolsTop + 'px', left: toolsLeft + 'px' }"
    @mousedown.prevent
  >
    <button type="button" class="it-btn" title="Change image text alternative" @click="setAlt"><span class="it-alt">ALT</span></button>
    <button type="button" class="it-btn" title="Inline image" @click="withWrap((w) => ctx.image.clearAlign(w))">
      <svg viewBox="0 0 24 18" width="22" height="16"><rect x="1" y="6" width="9" height="11" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 9 L5 11 L7 9 L9 12" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M12 8 H22 M12 12 H20 M12 16 H22" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
    </button>

    <div class="it-dd">
      <button type="button" class="it-btn it-ddbtn" title="Wrap text left" @click="toggleMenu('left')">
        <svg viewBox="0 0 24 18" width="22" height="16"><rect x="1" y="3" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M13 5 H22 M13 9 H22 M13 13 H22" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        <span class="it-arrow">▾</span>
      </button>
      <div class="it-menu" :hidden="openMenu !== 'left'">
        <button type="button" @click="withWrap((w) => ctx.image.alignLeft(w))">Left aligned</button>
        <button type="button" @click="withWrap((w) => ctx.image.clearAlign(w))">No wrap</button>
      </div>
    </div>

    <div class="it-dd">
      <button type="button" class="it-btn it-ddbtn" title="Wrap text right" @click="toggleMenu('right')">
        <svg viewBox="0 0 24 18" width="22" height="16"><rect x="13" y="3" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 5 H11 M2 9 H11 M2 13 H11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        <span class="it-arrow">▾</span>
      </button>
      <div class="it-menu" :hidden="openMenu !== 'right'">
        <button type="button" @click="withWrap((w) => ctx.image.alignRight(w))">Right aligned</button>
        <button type="button" @click="withWrap((w) => ctx.image.clearAlign(w))">No wrap</button>
      </div>
    </div>

    <div class="it-dd">
      <button type="button" class="it-btn it-ddbtn" title="Center image" @click="toggleMenu('center')">
        <svg viewBox="0 0 24 18" width="22" height="16"><rect x="6" y="3" width="12" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 5 H4 M20 5 H22 M2 9 H4 M20 9 H22 M2 13 H4 M20 13 H22" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        <span class="it-arrow">▾</span>
      </button>
      <div class="it-menu" :hidden="openMenu !== 'center'">
        <button type="button" @click="withWrap((w) => ctx.image.alignCenter(w))">Centered</button>
        <button type="button" @click="withWrap((w) => ctx.image.alignBlock(w))">Block (full row)</button>
      </div>
    </div>

    <div class="it-dd it-size-dd">
      <button type="button" class="it-btn it-ddbtn" title="Resize image" @click="toggleMenu('size')">
        <svg viewBox="0 0 24 18" width="22" height="16"><rect x="3" y="3" width="14" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M14 12 L20 12 L20 6 M17 9 L20 6 L23 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="it-size-label">{{ sizeLabel }}</span>
        <span class="it-arrow">▾</span>
      </button>
      <div class="it-menu" :hidden="openMenu !== 'size'">
        <button type="button" @click="withWrap((w) => ctx.image.setSizePct(w, 25))">25%</button>
        <button type="button" @click="withWrap((w) => ctx.image.setSizePct(w, 50))">50%</button>
        <button type="button" @click="withWrap((w) => ctx.image.setSizePct(w, 75))">75%</button>
        <button type="button" @click="withWrap((w) => ctx.image.setSizePct(w, 100))">100%</button>
        <button type="button" @click="withWrap((w) => ctx.image.resetSize(w))">Original size</button>
        <hr />
        <button type="button" @click="customSize">Custom…</button>
      </div>
    </div>

    <button type="button" class="it-btn" title="Replace image" @click="replace">
      <svg viewBox="0 0 24 18" width="22" height="16"><rect x="2" y="3" width="14" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6" cy="7" r="1.2" fill="currentColor"/><path d="M16 12 L8 12 L13 7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M18 6 L21 9 L18 12 M21 9 H15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
  </div>
</template>

<style scoped>
.image-tools-host { display: contents; }
</style>
