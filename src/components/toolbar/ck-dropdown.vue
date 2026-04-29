<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from '../Icon.vue'

export interface DropdownItem {
  label: string
  icon?: string
  shortcut?: string
  onClick: () => void
}

const props = defineProps<{
  items: DropdownItem[]
}>()

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const panelEl = ref<HTMLElement | null>(null)

const iconMode = computed(() => props.items.every((i: DropdownItem) => i.icon))

function openAt(x: number, y: number) {
  posX.value = x
  posY.value = y
  visible.value = true
}

function close() {
  visible.value = false
}

function select(item: DropdownItem) {
  close()
  item.onClick()
}

function onOutside(e: MouseEvent) {
  if (panelEl.value && !panelEl.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', onOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOutside))

defineExpose({ openAt })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="panelEl"
      class="ck-dd"
      :style="{ top: posY + 'px', left: posX + 'px' }"
    >
      <!-- horizontal icon strip -->
      <template v-if="iconMode">
        <button
          v-for="item in props.items"
          :key="item.label"
          type="button"
          class="tb"
          :title="item.label + (item.shortcut ? ' (' + item.shortcut + ')' : '')"
          @mousedown.prevent
          @click="select(item)"
        >
          <Icon :name="item.icon ?? ''" />
        </button>
      </template>

      <!-- fallback: vertical text list -->
      <template v-else>
        <button
          v-for="item in props.items"
          :key="item.label"
          type="button"
          class="tb-menu-item"
          @mousedown.prevent
          @click="select(item)"
        >
          <span class="tb-menu-label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="tb-menu-shortcut">{{ item.shortcut }}</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.ck-dd {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 3px 4px;
  background: #fff;
  border: 1px solid var(--border-default, #e4e7ec);
  border-radius: var(--radius-md, 6px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.10));
}

/* vertical list mode */
.ck-dd:has(.tb-menu-item) {
  flex-direction: column;
  align-items: stretch;
  padding: 4px;
  min-width: 200px;
}
</style>
