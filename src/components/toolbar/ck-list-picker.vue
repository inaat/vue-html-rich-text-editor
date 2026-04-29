<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ListStyle { type: string; title: string }

const STYLES: ListStyle[] = [
  { type: 'decimal',              title: 'Decimal (1, 2, 3)' },
  { type: 'decimal-leading-zero', title: 'Decimal leading zero (01, 02, 03)' },
  { type: 'lower-roman',          title: 'Lower Roman (i, ii, iii)' },
  { type: 'lower-alpha',          title: 'Lower Alpha (a, b, c)' },
  { type: 'upper-alpha',          title: 'Upper Alpha (A, B, C)' },
  { type: 'upper-roman',          title: 'Upper Roman (I, II, III)' },
]

const emit = defineEmits<{
  (e: 'pick', style: string): void
}>()

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const panelEl = ref<HTMLElement | null>(null)

function openAt(x: number, y: number) { posX.value = x; posY.value = y; visible.value = true }
function close() { visible.value = false }

function pick(type: string) {
  close()
  emit('pick', type)
}

function onOutside(e: MouseEvent) {
  if (panelEl.value && !panelEl.value.contains(e.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', onOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOutside))

defineExpose({ openAt })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="panelEl" class="ck-lp" :style="{ top: posY + 'px', left: posX + 'px' }">
      <div class="ck-lp-grid">
        <button
          v-for="style in STYLES"
          :key="style.type"
          type="button"
          class="ck-lp-btn"
          :title="style.title"
          @mousedown.prevent
          @click="pick(style.type)"
        >
          <ol class="ck-lp-preview" :style="{ listStyleType: style.type }">
            <li><span class="ck-lp-line" /></li>
            <li><span class="ck-lp-line ck-lp-line--short" /></li>
            <li><span class="ck-lp-line ck-lp-line--med" /></li>
          </ol>
        </button>
      </div>
      <div class="ck-lp-divider" />
      <button type="button" class="ck-lp-props" @mousedown.prevent @click="close">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
        </svg>
        List properties
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ck-lp {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  padding: 5px;
}
.ck-lp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
.ck-lp-btn {
  display: flex;
  justify-content: center;
  padding: 7px 4px;
  border: 2px solid transparent;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  color: #374151;
}
.ck-lp-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.ck-lp-preview {
  margin: 0;
  padding-left: 18px;
  font-size: 9.5px;
  line-height: 1.75;
  color: inherit;
  pointer-events: none;
  text-align: left;
  min-width: 34px;
}
.ck-lp-line {
  display: inline-block;
  height: 1.5px;
  width: 22px;
  background: currentColor;
  border-radius: 1px;
  vertical-align: middle;
  opacity: 0.7;
}
.ck-lp-line--short { width: 14px; }
.ck-lp-line--med   { width: 19px; }
.ck-lp-divider {
  height: 1px;
  background: #e4e7ec;
  margin: 4px 0;
}
.ck-lp-props {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12.5px;
  color: #374151;
  text-align: left;
}
.ck-lp-props:hover { background: #f3f4f6; }
</style>
