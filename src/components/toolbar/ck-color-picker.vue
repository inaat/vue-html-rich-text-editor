<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

type Cmd = 'foreColor' | 'hiliteColor'

const COLORS = [
  // Grayscale
  '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff',
  // Vivid hues
  '#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff','#ff007f',
  // Very dark
  '#5c0000','#783f04','#7f6000','#274e13','#0c343d','#073763','#1c4587','#20124d','#4c1130','#880000',
  // Dark
  '#980000','#b45f06','#bf9000','#38761d','#134f5c','#0b5394','#1155cc','#351c75','#741b47','#990000',
  // Medium-dark
  '#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3d85c6','#3c78d8','#674ea7','#a64d79','#cc4125',
  // Medium-light
  '#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6fa8dc','#8e7cc3','#c27ba0','#e8aabb','#f4a460',
  // Light
  '#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8','#b4a7d6','#d5a6bd','#f0c4d4','#f4ccb0',
  // Very light
  '#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e4f7','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#fce5d5',
]

const emit = defineEmits<{
  (e: 'pick', color: string, cmd: Cmd): void
}>()

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const cmd = ref<Cmd>('foreColor')
const panelEl = ref<HTMLElement | null>(null)
const nativeEl = ref<HTMLInputElement | null>(null)

function openAt(x: number, y: number, command: Cmd) {
  posX.value = x
  posY.value = y
  cmd.value = command
  visible.value = true
}

function close() { visible.value = false }

function pick(color: string) {
  document.execCommand(cmd.value, false, color)
  emit('pick', color, cmd.value)
  close()
}

function removeColor() {
  if (cmd.value === 'hiliteColor') {
    document.execCommand('hiliteColor', false, 'transparent')
  } else {
    document.execCommand('removeFormat')
  }
  close()
}

function openNative() { nativeEl.value?.click() }
function onNative(e: Event) { pick((e.target as HTMLInputElement).value) }

function onOutside(e: MouseEvent) {
  if (panelEl.value && !panelEl.value.contains(e.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', onOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOutside))

defineExpose({ openAt })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="panelEl" class="ck-cp" :style="{ top: posY + 'px', left: posX + 'px' }">
      <button type="button" class="ck-cp-action" @mousedown.prevent @click="removeColor">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M8.69 14.915q.08.078.36.093a.366.366 0 0 1 .345.485l-.003.01a.74.74 0 0 1-.697.497h-2.67a.374.374 0 0 1-.353-.496l.013-.038a.68.68 0 0 1 .644-.458q.295-.018.386-.093a.3.3 0 0 0 .072-.11L9.592 4.5H6.269q-.538-.026-.75.09-.213.117-.442.563c-.192.29-.516.464-.864.464H4.17a.43.43 0 0 1-.407-.569L4.46 3h13.08l-.62 2.043a.81.81 0 0 1-.775.574h-.114a.486.486 0 0 1-.486-.486q.002-.426-.167-.54-.168-.114-.766-.091h-3.28l-2.68 10.257q-.009.111.038.158M3 17h8a.5.5 0 1 1 0 1H3a.5.5 0 1 1 0-1m11.299 1.17a.75.75 0 1 1-1.06-1.06l1.414-1.415-1.415-1.414a.75.75 0 0 1 1.06-1.06l1.415 1.414 1.414-1.415a.75.75 0 1 1 1.06 1.06l-1.413 1.415 1.414 1.415a.75.75 0 0 1-1.06 1.06l-1.415-1.414z"/>
        </svg>
        Remove color
      </button>

      <div class="ck-cp-grid">
        <button
          v-for="color in COLORS"
          :key="color"
          type="button"
          class="ck-cp-swatch"
          :style="{ background: color }"
          :title="color"
          @mousedown.prevent
          @click="pick(color)"
        />
      </div>

      <button type="button" class="ck-cp-action" @mousedown.prevent @click="openNative">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1M6.5 9.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
        </svg>
        Color picker
        <input ref="nativeEl" type="color" class="ck-cp-native" @change="onNative" />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ck-cp {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  padding: 6px;
}
.ck-cp-action {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  text-align: left;
  position: relative;
}
.ck-cp-action:hover { background: #f3f4f6; }
.ck-cp-grid {
  display: grid;
  grid-template-columns: repeat(10, 18px);
  gap: 2px;
  margin: 4px 2px;
}
.ck-cp-swatch {
  width: 18px;
  height: 18px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}
.ck-cp-swatch:hover {
  outline: 2px solid #4a86e8;
  outline-offset: 1px;
  position: relative;
  z-index: 1;
}
.ck-cp-native {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}
</style>
