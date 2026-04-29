<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const PRESETS = [
  { color: '#FFF59D', name: 'Yellow' },
  { color: '#CCFF90', name: 'Green' },
  { color: '#FF99CC', name: 'Pink' },
  { color: '#B3D9FF', name: 'Blue' },
  { color: '#FFD580', name: 'Orange' },
  { color: '#FF9999', name: 'Red' },
  { color: '#E5CCFF', name: 'Purple' },
]

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const panelEl = ref<HTMLElement | null>(null)

function openAt(x: number, y: number) {
  posX.value = x
  posY.value = y
  visible.value = true
}

function close() { visible.value = false }

function pick(color: string) {
  document.execCommand('hiliteColor', false, color)
  close()
}

function removeHighlight() {
  document.execCommand('hiliteColor', false, 'transparent')
  close()
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
    <div v-if="visible" ref="panelEl" class="ck-hl" :style="{ top: posY + 'px', left: posX + 'px' }">
      <button
        v-for="item in PRESETS"
        :key="item.color"
        type="button"
        class="ck-hl-btn"
        :title="item.name"
        @mousedown.prevent
        @click="pick(item.color)"
      >
        <!-- highlighter marker pen -->
        <svg viewBox="0 0 14 18" width="13" height="17" aria-hidden="true" fill="currentColor">
          <rect x="3" y="1" width="8" height="11" rx="1.5"/>
          <polygon points="3,12 11,12 9.5,16 4.5,16"/>
          <rect x="5.5" y="15.5" width="3" height="1.5" rx="0.5" opacity=".5"/>
        </svg>
        <span class="ck-hl-bar" :style="{ background: item.color }" />
      </button>

      <!-- eraser / remove -->
      <button type="button" class="ck-hl-btn" title="Remove highlight" @mousedown.prevent @click="removeHighlight">
        <svg viewBox="0 0 20 20" width="13" height="17" aria-hidden="true" fill="currentColor">
          <path d="M17.293 4.293a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.707.293H4a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l9-9a1 1 0 0 1 1.414 0l3.586 3.586zM13 6.414 5 14.414V16h1.586l8-8L13 6.414z"/>
          <rect x="2" y="17.5" width="16" height="1.5" rx=".75"/>
        </svg>
        <span class="ck-hl-bar ck-hl-bar--erase" />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ck-hl {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 5px 6px;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.ck-hl-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 4px 3px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  color: #374151;
}
.ck-hl-btn:hover { background: #f3f4f6; }
.ck-hl-bar {
  width: 14px;
  height: 3px;
  border-radius: 1px;
}
.ck-hl-bar--erase {
  background: repeating-linear-gradient(
    45deg,
    #f00 0px,
    #f00 1.5px,
    transparent 1.5px,
    transparent 4px
  );
  border: 1px solid #ddd;
}
</style>
