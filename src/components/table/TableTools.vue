<script setup lang="ts">
import { ref } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import type { TableAction, TableContext } from '../../core/TableService'

const props = defineProps<{
  visible: boolean
  top: number
  left: number
  table: HTMLTableElement | null
  cell: HTMLTableCellElement | null
}>()

const emit = defineEmits<{
  (e: 'open-props', mode: 'cell' | 'table', anchor: HTMLElement): void
  (e: 'reposition'): void
}>()

const ctx = useEditorContext()
const openMenu = ref<string | null>(null)

function context(): TableContext { return { table: props.table, cell: props.cell } }

function run(action: TableAction) {
  ctx.history.snapshotNow()
  ctx.table.run(action, context())
  openMenu.value = null
  ctx.scheduleSave()
  emit('reposition')
}

function toggleMenu(id: string) {
  openMenu.value = openMenu.value === id ? null : id
}

function openProps(mode: 'cell' | 'table', ev: MouseEvent) {
  emit('open-props', mode, ev.currentTarget as HTMLElement)
}

function insertLineBreak() {
  const cell = props.cell
  if (!cell) return
  const sel = window.getSelection()
  let range: Range
  if (sel && sel.rangeCount && cell.contains(sel.anchorNode)) {
    range = sel.getRangeAt(0)
  } else {
    range = document.createRange()
    range.selectNodeContents(cell)
    range.collapse(false)
  }
  range.deleteContents()
  const br = document.createElement('br')
  range.insertNode(br)
  const atEnd = !br.nextSibling || (br.nextSibling.nodeType === 1 && (br.nextSibling as Element).tagName === 'BR')
  if (atEnd) br.parentNode?.insertBefore(document.createElement('br'), br.nextSibling)
  const after = document.createRange()
  after.setStartAfter(br)
  after.collapse(true)
  sel?.removeAllRanges()
  sel?.addRange(after)
  ctx.scheduleSave()
  emit('reposition')
}
</script>

<template>
  <div
    class="table-tools"
    :hidden="!visible"
    :style="{ top: top + 'px', left: left + 'px' }"
    @mousedown.prevent
  >
    <div class="tt-dd">
      <button type="button" class="tt-ddbtn" :aria-expanded="openMenu === 'col'" @click="toggleMenu('col')" title="Column">
        <svg viewBox="0 0 20 16" width="18" height="14"><rect x="1" y="1" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="7" y="1" width="6" height="14" fill="currentColor" opacity="0.85"/></svg>
        <span class="tt-arrow">▾</span>
      </button>
      <div class="tt-menu" :hidden="openMenu !== 'col'">
        <button type="button" @click="run('col-left')">Insert column left</button>
        <button type="button" @click="run('col-right')">Insert column right</button>
        <button type="button" @click="run('col-del')">Delete column</button>
      </div>
    </div>
    <div class="tt-dd">
      <button type="button" class="tt-ddbtn" :aria-expanded="openMenu === 'row'" @click="toggleMenu('row')" title="Row">
        <svg viewBox="0 0 20 16" width="18" height="14"><rect x="1" y="1" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="6" width="18" height="4" fill="currentColor" opacity="0.85"/></svg>
        <span class="tt-arrow">▾</span>
      </button>
      <div class="tt-menu" :hidden="openMenu !== 'row'">
        <button type="button" @click="run('row-above')">Insert row above</button>
        <button type="button" @click="run('row-below')">Insert row below</button>
        <button type="button" @click="run('row-del')">Delete row</button>
      </div>
    </div>
    <div class="tt-dd">
      <button type="button" class="tt-ddbtn" :aria-expanded="openMenu === 'merge'" @click="toggleMenu('merge')" title="Merge / Split cell">
        <svg viewBox="0 0 20 16" width="18" height="14"><rect x="1" y="1" width="8" height="14" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="11" y="1" width="8" height="14" fill="currentColor" opacity="0.5"/></svg>
        <span class="tt-arrow">▾</span>
      </button>
      <div class="tt-menu" :hidden="openMenu !== 'merge'">
        <button type="button" @click="run('merge-right')">Merge cell right</button>
        <button type="button" @click="run('merge-down')">Merge cell down</button>
        <button type="button" @click="run('merge-row')">Merge entire row</button>
        <button type="button" @click="run('merge-col')">Merge entire column</button>
        <hr />
        <button type="button" @click="run('split-cell')">Split cell</button>
      </div>
    </div>
    <button type="button" class="tt-iconbtn" title="Cell properties" @click="openProps('cell', $event)">
      <svg viewBox="0 0 20 16" width="18" height="14"><rect x="1" y="1" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="7" y1="1" x2="7" y2="15" stroke="currentColor" stroke-width="1"/><line x1="13" y1="1" x2="13" y2="15" stroke="currentColor" stroke-width="1"/><line x1="1" y1="8" x2="19" y2="8" stroke="currentColor" stroke-width="1"/><polygon points="16,2 16.6,3.5 18.2,3.6 17,4.6 17.4,6.2 16,5.3 14.6,6.2 15,4.6 13.8,3.6 15.4,3.5" fill="currentColor"/></svg>
    </button>
    <button type="button" class="tt-iconbtn" title="Table properties" @click="openProps('table', $event)">
      <svg viewBox="0 0 20 16" width="18" height="14"><rect x="1" y="1" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="7" y1="1" x2="7" y2="15" stroke="currentColor" stroke-width="1"/><line x1="13" y1="1" x2="13" y2="15" stroke="currentColor" stroke-width="1"/><line x1="1" y1="8" x2="19" y2="8" stroke="currentColor" stroke-width="1"/><polygon points="4,2 4.6,3.5 6.2,3.6 5,4.6 5.4,6.2 4,5.3 2.6,6.2 3,4.6 1.8,3.6 3.4,3.5" fill="currentColor"/></svg>
    </button>
    <button type="button" class="tt-iconbtn" title="Toggle table direction" @click="run('table-dir')">
      <svg viewBox="0 0 20 14" width="18" height="14"><rect x="1" y="1" width="18" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="6" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
    <button type="button" class="tt-iconbtn tt-enter" title="Insert line break in cell" @click="insertLineBreak">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
    </button>
  </div>
</template>
