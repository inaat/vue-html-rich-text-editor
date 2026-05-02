<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'
import { useLocale } from '@/composables/useLocale'
import { rgbToHex } from '@/core/Format'

const ctx = useEditorContext()
const lc = useLocale()

const tagLabel = ref('—')
const breadcrumb = ref<HTMLElement[]>([])
const active = ref<HTMLElement | null>(null)
const pinned = ref<HTMLElement | null>(null)
const allProps = ref<Array<{ name: string; value: string; dirty: boolean }>>([])
const filter = ref('')
const showAll = ref(false)
const newName = ref('')
const newVal = ref('')

const values = ref<Record<string, string>>({})
const colors = ref<Record<string, string>>({
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  color: '#000000'
})

const filteredProps = computed(() => {
  const q = filter.value.toLowerCase().trim()
  if (!q) return allProps.value
  return allProps.value.filter((r) => r.name.includes(q))
})

function findTarget(): HTMLElement | null {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount || !ctx.root.contains(sel.anchorNode)) return null

  // Detect cursor adjacent to an img node (collapsed or wrapping the img)
  const range = sel.getRangeAt(0)
  if (range.startContainer.nodeType === 1) {
    const parent = range.startContainer as Element
    const at = parent.childNodes[range.startOffset] as Element | undefined
    const before = parent.childNodes[range.startOffset - 1] as Element | undefined
    if (at?.tagName === 'IMG') return at as HTMLImageElement
    if (before?.tagName === 'IMG') return before as HTMLImageElement
  }

  let n: Node | null = sel.anchorNode
  if (n && n.nodeType === 3) n = n.parentNode
  while (n && n !== ctx.root) {
    const el = n as HTMLElement
    if (el.tagName) return el
    n = n.parentNode
  }
  return null
}

function buildBreadcrumb(el: HTMLElement | null) {
  if (!el) { breadcrumb.value = []; tagLabel.value = '—'; return }
  tagLabel.value = el.tagName.toLowerCase()
  const chain: HTMLElement[] = []
  let n: HTMLElement | null = el
  while (n && n !== ctx.root && n.tagName) {
    chain.unshift(n)
    n = n.parentElement
  }
  breadcrumb.value = chain
}

function readPanel(el: HTMLElement | null) {
  buildBreadcrumb(el)
  if (!el) {
    values.value = {}
    colors.value = { borderColor: '#000000', backgroundColor: '#ffffff', color: '#000000' }
    return
  }
  const cs = window.getComputedStyle(el)
  const get = (prop: string, raw = false): string => {
    const v = (el.style as any)[prop] || (cs as any)[prop] || ''
    return raw ? v : (v + '').replace(/^0px$/, '0')
  }
  values.value = {
    width: get('width'),
    height: get('height'),
    lineHeight: get('lineHeight', true),
    fontSize: get('fontSize'),
    paddingTop: get('paddingTop'),
    paddingRight: get('paddingRight'),
    paddingBottom: get('paddingBottom'),
    paddingLeft: get('paddingLeft'),
    marginTop: get('marginTop'),
    marginRight: get('marginRight'),
    marginBottom: get('marginBottom'),
    marginLeft: get('marginLeft'),
    borderTopWidth: get('borderTopWidth'),
    borderRightWidth: get('borderRightWidth'),
    borderBottomWidth: get('borderBottomWidth'),
    borderLeftWidth: get('borderLeftWidth'),
    borderStyle: el.style.borderStyle || '',
    borderRadius: get('borderRadius')
  }
  colors.value = {
    borderColor: rgbToHex(el.style.borderColor || cs.borderColor) || '#000000',
    backgroundColor: rgbToHex(el.style.backgroundColor || cs.backgroundColor) || '#ffffff',
    color: rgbToHex(el.style.color || cs.color) || '#000000'
  }
}

function renderAll(el: HTMLElement | null) {
  if (!el) { allProps.value = []; return }
  const cs = window.getComputedStyle(el)
  const inlineSet = new Set<string>()
  for (let i = 0; i < el.style.length; i++) inlineSet.add(el.style[i])
  const names: string[] = []
  for (let i = 0; i < cs.length; i++) names.push(cs[i])
  names.sort()
  const out: Array<{ name: string; value: string; dirty: boolean }> = []
  for (const name of names) {
    const dirty = inlineSet.has(name)
    if (!showAll.value && !dirty) continue
    out.push({
      name,
      value: el.style.getPropertyValue(name) || cs.getPropertyValue(name),
      dirty
    })
  }
  allProps.value = out
}

function sync() {
  const ae = document.activeElement as HTMLElement | null
  if (ae && (ae.closest('.style-panel') || ae.closest('#toolbar') || ae.closest('.table-tools'))) return
  if (pinned.value && document.contains(pinned.value)) {
    if (active.value !== pinned.value) {
      active.value = pinned.value
      readPanel(pinned.value)
      renderAll(pinned.value)
    }
    return
  }
  const el = findTarget()
  if (!el && active.value && document.contains(active.value)) return
  active.value = el
  readPanel(el)
  renderAll(el)
}

function pickFromBreadcrumb(node: HTMLElement) {
  active.value = node
  pinned.value = node
  readPanel(node)
  renderAll(node)
}

const BORDER_WIDTH_TO_STYLE: Record<string, string> = {
  borderTopWidth: 'borderTopStyle',
  borderRightWidth: 'borderRightStyle',
  borderBottomWidth: 'borderBottomStyle',
  borderLeftWidth: 'borderLeftStyle',
}

function onFieldInput(prop: string, ev: Event, raw = false) {
  const target = ev.target as HTMLInputElement
  if (!active.value) return
  values.value[prop] = target.value
  const v = target.value.trim()
  const style: any = active.value.style
  if (v === '') {
    style[prop] = ''
  } else if (!raw && /^-?\d+(\.\d+)?$/.test(v)) {
    style[prop] = v + 'px'
  } else {
    style[prop] = v
  }
  // Ensure border is visible when width is set
  const styleKey = BORDER_WIDTH_TO_STYLE[prop]
  if (styleKey && v !== '' && !style[styleKey]) {
    style[styleKey] = 'solid'
  }
  ctx.scheduleSave()
}

function onColorChange(prop: string, ev: Event) {
  const target = ev.target as HTMLInputElement
  if (!active.value) return
  colors.value[prop] = target.value
  ;(active.value.style as any)[prop] = target.value
  ctx.scheduleSave()
}

function clearStyles() {
  if (!active.value) return
  active.value.removeAttribute('style')
  readPanel(active.value)
  renderAll(active.value)
  ctx.scheduleSave()
}

function insertChild(ev: MouseEvent) {
  if (!active.value) return
  const parent = active.value
  ctx.popup.showElementMenu(ev.currentTarget as HTMLElement, (tag, _isBlock, content) => {
    const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])
    const el = document.createElement(tag)
    if (!VOID.has(tag)) el.innerHTML = content ?? '<br>'
    parent.appendChild(el)
    pinned.value = el
    active.value = el
    readPanel(el)
    renderAll(el)
    // move cursor inside new child
    const sel = window.getSelection()
    if (sel && !VOID.has(tag)) {
      const cursor = document.createRange()
      cursor.setStart(el, 0)
      cursor.collapse(true)
      sel.removeAllRanges()
      sel.addRange(cursor)
    }
    ctx.scheduleSave()
  })
}

function deleteEl() {
  const el = active.value
  if (!el || el === ctx.root || !ctx.root.contains(el)) return
  ctx.history.snapshotNow()
  let target: HTMLElement = el
  const wrap = el.closest('.img-handle-wrap') as HTMLElement | null
  if (wrap && ctx.root.contains(wrap)) target = wrap
  target.remove()
  active.value = null
  pinned.value = null
  readPanel(null)
  ctx.scheduleSave()
}

function addProp() {
  if (!active.value) return
  const name = newName.value.trim()
  if (!name) return
  active.value.style.setProperty(name, newVal.value.trim())
  newName.value = ''
  newVal.value = ''
  renderAll(active.value)
  ctx.scheduleSave()
}

function setRaw(name: string, ev: Event) {
  const target = ev.target as HTMLInputElement
  if (!active.value) return
  active.value.style.setProperty(name, target.value)
  renderAll(active.value)
  ctx.scheduleSave()
}

function setElementDir(dir: 'ltr' | 'rtl') {
  if (!active.value) return
  active.value.setAttribute('dir', dir)
  ctx.scheduleSave()
}

function setDocumentDir(dir: 'ltr' | 'rtl') {
  ctx.root.setAttribute('dir', dir)
  ctx.scheduleSave()
}

function onEditorMousedown(e: MouseEvent) {
  const target = e.target as HTMLElement
  // Image click: target is the <img> itself or a handle span inside .img-handle-wrap
  const wrap = target.closest('.img-handle-wrap') as HTMLElement | null
  const img = (target.tagName === 'IMG' ? target : wrap?.querySelector('img')) as HTMLImageElement | null
  if (img && ctx.root.contains(img)) {
    pinned.value = img
    active.value = img
    readPanel(img)
    renderAll(img)
  } else {
    pinned.value = null
  }
}

onMounted(() => {
  document.addEventListener('selectionchange', sync)
  ctx.root.addEventListener('mousedown', onEditorMousedown)
})
onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', sync)
  ctx.root.removeEventListener('mousedown', onEditorMousedown)
})
</script>

<template>
  <div class="style-panel">
    <div class="sp-doc-dir">
      <span class="sp-tag-label">{{ lc.docDirection }}</span>
      <button type="button" class="sp-dir-btn" @mousedown.prevent @click="setDocumentDir('ltr')">{{ lc.ltr }}</button>
      <button type="button" class="sp-dir-btn" @mousedown.prevent @click="setDocumentDir('rtl')">{{ lc.rtl }}</button>
    </div>
    <div class="sp-tag-row">
      <span class="sp-tag-label">{{ lc.selectedElement }}</span>
      <span class="sp-tag">{{ tagLabel }}</span>
      <button type="button" class="sp-dir-btn" :title="lc.setLtrOnElement" :disabled="!active" @mousedown.prevent @click="setElementDir('ltr')">{{ lc.ltr }}</button>
      <button type="button" class="sp-dir-btn" :title="lc.setRtlOnElement" :disabled="!active" @mousedown.prevent @click="setElementDir('rtl')">{{ lc.rtl }}</button>
      <button type="button" class="sp-child-btn" :title="lc.insertChildEl" :disabled="!active" @mousedown.prevent @click="insertChild">{{ lc.addChildBtn }}</button>
      <button type="button" class="sp-del" :title="lc.deleteElement" @click="deleteEl">🗑</button>
    </div>
    <div class="sp-breadcrumb">
      <span v-if="!breadcrumb.length">{{ lc.clickIntoEditor }}</span>
      <span
        v-for="(node, i) in breadcrumb"
        :key="i"
        class="sp-crumb-wrap"
      >
        <span v-if="i > 0" class="crumb-sep">›</span>
        <button
          type="button"
          class="crumb"
          :class="{ current: node === active }"
          @mousedown.prevent
          @click="pickFromBreadcrumb(node)"
        >{{ node.tagName.toLowerCase() }}</button>
      </span>
    </div>

    <details open>
      <summary>{{ lc.sizeSection }}</summary>
      <div class="sp-row">
        <label>{{ lc.widthLabel }} <input :value="values.width" placeholder="auto" @input="onFieldInput('width', $event)" /></label>
        <label>{{ lc.heightLabel }} <input :value="values.height" placeholder="auto" @input="onFieldInput('height', $event)" /></label>
      </div>
      <div class="sp-row">
        <label>{{ lc.lineHeightLabel }} <input :value="values.lineHeight" placeholder="normal" @input="onFieldInput('lineHeight', $event, true)" /></label>
        <label>{{ lc.fontSizePanelLabel }} <input :value="values.fontSize" placeholder="inherit" @input="onFieldInput('fontSize', $event)" /></label>
      </div>
    </details>

    <details>
      <summary>{{ lc.paddingSection }}</summary>
      <div class="sp-grid">
        <label>T <input :value="values.paddingTop" @input="onFieldInput('paddingTop', $event)" /></label>
        <label>R <input :value="values.paddingRight" @input="onFieldInput('paddingRight', $event)" /></label>
        <label>B <input :value="values.paddingBottom" @input="onFieldInput('paddingBottom', $event)" /></label>
        <label>L <input :value="values.paddingLeft" @input="onFieldInput('paddingLeft', $event)" /></label>
      </div>
    </details>

    <details>
      <summary>{{ lc.marginSection }}</summary>
      <div class="sp-grid">
        <label>T <input :value="values.marginTop" @input="onFieldInput('marginTop', $event)" /></label>
        <label>R <input :value="values.marginRight" @input="onFieldInput('marginRight', $event)" /></label>
        <label>B <input :value="values.marginBottom" @input="onFieldInput('marginBottom', $event)" /></label>
        <label>L <input :value="values.marginLeft" @input="onFieldInput('marginLeft', $event)" /></label>
      </div>
    </details>

    <details>
      <summary>{{ lc.borderSection }}</summary>
      <div class="sp-grid">
        <label>T <input :value="values.borderTopWidth" @input="onFieldInput('borderTopWidth', $event)" /></label>
        <label>R <input :value="values.borderRightWidth" @input="onFieldInput('borderRightWidth', $event)" /></label>
        <label>B <input :value="values.borderBottomWidth" @input="onFieldInput('borderBottomWidth', $event)" /></label>
        <label>L <input :value="values.borderLeftWidth" @input="onFieldInput('borderLeftWidth', $event)" /></label>
      </div>
      <div class="sp-row">
        <label>Color <input type="color" :value="colors.borderColor" @input="onColorChange('borderColor', $event)" /></label>
        <label>Style
          <select :value="values.borderStyle || 'solid'" @change="onFieldInput('borderStyle', $event, true)">
            <option value="solid">solid</option>
            <option value="dashed">dashed</option>
            <option value="dotted">dotted</option>
            <option value="double">double</option>
            <option value="groove">groove</option>
            <option value="ridge">ridge</option>
            <option value="none">none</option>
          </select>
        </label>
      </div>
      <label class="sp-full">Radius <input :value="values.borderRadius" @input="onFieldInput('borderRadius', $event)" /></label>
    </details>

    <details>
      <summary>{{ lc.colorSection }}</summary>
      <div class="sp-row">
        <label>BG   <input type="color" :value="colors.backgroundColor" @input="onColorChange('backgroundColor', $event)" /></label>
        <label>Text <input type="color" :value="colors.color" @input="onColorChange('color', $event)" /></label>
      </div>
    </details>

    <details>
      <summary>{{ lc.allPropsSection }}</summary>
      <input v-model="filter" type="search" class="sp-filter" :placeholder="lc.filterPropsPlaceholder">
      <label class="sp-toggle"><input v-model="showAll" type="checkbox" @change="renderAll(active)"> {{ lc.showEveryProp }}</label>
      <div class="sp-all">
        <div
          v-for="row in filteredProps"
          :key="row.name"
          class="sp-prop"
          :class="{ dirty: row.dirty }"
        >
          <span class="pname" :title="row.name">{{ row.name }}</span>
          <input :value="row.value" @input="setRaw(row.name, $event)" />
        </div>
      </div>
      <div class="sp-add">
        <input v-model="newName" placeholder="property" autocomplete="off">
        <input v-model="newVal" placeholder="value" autocomplete="off" @keydown.enter="addProp">
        <button type="button" @click="addProp">＋</button>
      </div>
    </details>

    <button type="button" class="btn-secondary" @click="clearStyles">{{ lc.clearInlineStyles }}</button>
  </div>
</template>

<style scoped>
.sp-doc-dir,
.sp-tag-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}
.sp-dir-btn {
  font-size: 11px;
  padding: 1px 6px;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  background: #f9fafb;
  cursor: pointer;
  line-height: 1.6;
}
.sp-dir-btn:hover {
  background: #e8f5ee;
  border-color: #0d6b45;
  color: #0d6b45;
}
.sp-dir-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.sp-child-btn {
  font-size: 11px;
  padding: 1px 6px;
  border: 1px solid #6366f1;
  border-radius: 4px;
  background: #eef2ff;
  color: #4338ca;
  cursor: pointer;
  line-height: 1.6;
}
.sp-child-btn:hover {
  background: #e0e7ff;
  border-color: #4338ca;
}
.sp-child-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
