<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MLStyle {
  title: string
  levels: [string, string, string]
}

const STYLES: MLStyle[] = [
  { title: 'Decimal → Alpha → Roman',              levels: ['decimal',             'lower-alpha', 'lower-roman'] },
  { title: 'Roman → Alpha → Decimal',              levels: ['upper-roman',         'upper-alpha', 'decimal'] },
  { title: 'Alpha → Decimal → Alpha',              levels: ['upper-alpha',         'decimal',     'lower-alpha'] },
  { title: 'Decimal leading-zero → Roman → Alpha', levels: ['decimal-leading-zero','lower-roman', 'upper-alpha'] },
]

const emit = defineEmits<{
  (e: 'pick', l1: string, l2: string, l3: string): void
}>()

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const panelEl = ref<HTMLElement | null>(null)

function openAt(x: number, y: number) { posX.value = x; posY.value = y; visible.value = true }
function close() { visible.value = false }
function pick(s: MLStyle) { close(); emit('pick', s.levels[0], s.levels[1], s.levels[2]) }

function onOutside(e: MouseEvent) {
  if (panelEl.value && !panelEl.value.contains(e.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', onOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOutside))
defineExpose({ openAt })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="panelEl" class="ck-ml" :style="{ top: posY + 'px', left: posX + 'px' }">
      <div class="ck-ml-grid">
        <button
          v-for="style in STYLES"
          :key="style.title"
          type="button"
          class="ck-ml-btn"
          :title="style.title"
          @mousedown.prevent
          @click="pick(style)"
        >
          <ol class="ck-ml-l1" :style="{ listStyleType: style.levels[0] }">
            <li>
              <span class="ck-ml-line" />
              <ol class="ck-ml-l2" :style="{ listStyleType: style.levels[1] }">
                <li>
                  <span class="ck-ml-line ck-ml-line--med" />
                  <ol class="ck-ml-l3" :style="{ listStyleType: style.levels[2] }">
                    <li><span class="ck-ml-line ck-ml-line--short" /></li>
                  </ol>
                </li>
              </ol>
            </li>
          </ol>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ck-ml {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  padding: 5px;
}
.ck-ml-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}
.ck-ml-btn {
  display: flex;
  justify-content: center;
  padding: 8px 6px;
  border: 2px solid transparent;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  color: #374151;
}
.ck-ml-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.ck-ml-l1 {
  margin: 0;
  padding-left: 16px;
  font-size: 9px;
  line-height: 2;
  color: inherit;
  pointer-events: none;
  text-align: left;
}
.ck-ml-l2 {
  margin: 0;
  padding-left: 14px;
  font-size: 9px;
  line-height: 2;
}
.ck-ml-l3 {
  margin: 0;
  padding-left: 14px;
  font-size: 9px;
  line-height: 2;
}
.ck-ml-line {
  display: inline-block;
  height: 1.5px;
  width: 20px;
  background: currentColor;
  border-radius: 1px;
  vertical-align: middle;
  opacity: 0.7;
}
.ck-ml-line--med   { width: 15px; }
.ck-ml-line--short { width: 11px; }
</style>
