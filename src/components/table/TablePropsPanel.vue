<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'
import { parseLen } from '@/core/Format'

const props = defineProps<{
  visible: boolean
  top: number
  left: number
  mode: 'cell' | 'table'
  table: HTMLTableElement | null
  cell: HTMLTableCellElement | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const ctx = useEditorContext()

const borderStyle = ref('solid')
const borderW = ref('1px')
const borderColor = ref('#000000')
const cellType = ref<'td' | 'th'>('td')
const cellBg = ref('#ffffff')
const cellW = ref('')
const cellH = ref('')
const cellPad = ref('')

const title = computed(() => props.mode === 'table' ? 'Table properties' : 'Cell properties')

function targets(): HTMLTableCellElement[] {
  if (props.mode === 'table' && props.table) {
    return Array.from(props.table.querySelectorAll('th, td'))
  }
  return props.cell ? [props.cell] : []
}

watch(() => props.cell, (c) => {
  if (!c) return
  cellType.value = (c.tagName.toLowerCase() as 'td' | 'th')
  cellW.value = String(parseInt(String(c.getBoundingClientRect().width), 10) || '')
  cellH.value = String(parseInt(String(c.getBoundingClientRect().height), 10) || '')
})

function applyBorder() {
  for (const c of targets()) {
    c.style.border = `${parseLen(borderW.value) || '1px'} ${borderStyle.value || 'solid'} ${borderColor.value || '#000'}`
  }
  ctx.scheduleSave()
}

function applyBg() {
  for (const c of targets()) c.style.backgroundColor = cellBg.value
  ctx.scheduleSave()
}

function clearBg() {
  for (const c of targets()) c.style.backgroundColor = ''
  cellBg.value = ''
  ctx.scheduleSave()
}

function applyPad() {
  const v = parseLen(cellPad.value)
  for (const c of targets()) c.style.padding = v
  ctx.scheduleSave()
}

function applyW() {
  if (!props.cell) return
  const v = cellW.value.trim()
  props.cell.style.width = v ? v + 'px' : ''
  const idx = props.cell.cellIndex
  if (idx >= 0 && props.table) {
    const cols = props.table.querySelectorAll(':scope > colgroup > col')
    if (cols[idx]) (cols[idx] as HTMLElement).style.width = v ? v + 'px' : ''
  }
  ctx.scheduleSave()
}

function applyH() {
  if (!props.cell) return
  const v = cellH.value.trim()
  props.cell.style.height = v ? v + 'px' : ''
  const tr = props.cell.parentElement
  if (tr && tr.tagName === 'TR') (tr as HTMLElement).style.height = v ? v + 'px' : ''
  ctx.scheduleSave()
}

function changeType() {
  if (!props.cell) return
  ctx.table.changeCellType(props.cell, cellType.value)
  ctx.scheduleSave()
}

function setAlign(prop: 'textAlign' | 'verticalAlign', val: string) {
  for (const c of targets()) c.style[prop] = val
  ctx.scheduleSave()
}

function deleteTable() {
  if (props.table) { props.table.remove(); ctx.scheduleSave() }
  emit('close')
}
</script>

<template>
  <div
    class="tt-props-panel"
    :hidden="!visible"
    :style="{ top: top + 'px', left: left + 'px' }"
    @mousedown.stop
  >
    <div class="tt-props-header">
      <button type="button" class="tt-back" @click="emit('close')">‹</button>
      <span>{{ title }}</span>
    </div>
    <div class="tt-props-body">
      <div class="tt-props-row">
        <div class="tt-props-section">Border</div>
        <div class="tt-props-grid-3">
          <label class="tt-stack">Style
            <select v-model="borderStyle" @change="applyBorder">
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="none">None</option>
            </select>
          </label>
          <label class="tt-stack">Width
            <input v-model="borderW" type="text" placeholder="1px" @input="applyBorder">
          </label>
          <label class="tt-stack">Color
            <span class="tt-color-field">
              <input v-model="borderColor" type="text" placeholder="#000000" @input="applyBorder">
              <input v-model="borderColor" type="color" @input="applyBorder">
            </span>
          </label>
        </div>
      </div>

      <div class="tt-props-row">
        <div class="tt-props-section">Cell</div>
        <div class="tt-props-grid-2">
          <label class="tt-stack">Cell type
            <select v-model="cellType" @change="changeType">
              <option value="td">Data cell</option>
              <option value="th">Header cell</option>
            </select>
          </label>
          <label class="tt-stack">Background
            <span class="tt-color-field">
              <input v-model="cellBg" type="text" placeholder="Color" @input="applyBg">
              <input v-model="cellBg" type="color" @input="applyBg">
              <button type="button" class="tt-color-clear" @click="clearBg">⌀</button>
            </span>
          </label>
        </div>
      </div>

      <div class="tt-props-row">
        <div class="tt-props-section">Dimensions</div>
        <div class="tt-props-dims">
          <input v-model="cellW" type="text" placeholder="Width" @input="applyW">
          <span class="tt-dim-x">×</span>
          <input v-model="cellH" type="text" placeholder="Height" @input="applyH">
          <input v-model="cellPad" type="text" placeholder="Padding" @input="applyPad">
        </div>
      </div>

      <div class="tt-props-row">
        <div class="tt-props-section">Table cell text alignment</div>
        <div class="tt-align-row">
          <div class="tt-align-group">
            <button type="button" @click="setAlign('textAlign', 'left')" title="Align left">⇤</button>
            <button type="button" @click="setAlign('textAlign', 'center')" title="Align center">↔</button>
            <button type="button" @click="setAlign('textAlign', 'right')" title="Align right">⇥</button>
            <button type="button" @click="setAlign('textAlign', 'justify')" title="Justify">⇔</button>
          </div>
          <div class="tt-align-group">
            <button type="button" @click="setAlign('verticalAlign', 'top')" title="Top">⤒</button>
            <button type="button" @click="setAlign('verticalAlign', 'middle')" title="Middle">≡</button>
            <button type="button" @click="setAlign('verticalAlign', 'bottom')" title="Bottom">⤓</button>
          </div>
        </div>
      </div>

      <div v-if="mode === 'table'" class="tt-props-row">
        <div class="tt-props-section">Table</div>
        <div class="tt-props-fields">
          <button type="button" class="tt-mini tt-danger" @click="deleteTable">Delete table</button>
        </div>
      </div>

      <div class="tt-props-footer">
        <button type="button" class="tt-mini" @click="emit('close')">Cancel</button>
        <button type="button" class="tt-save" @click="emit('close')">Save</button>
      </div>
    </div>
  </div>
</template>
