<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from '../Icon.vue'

export interface DropdownItem {
  label: string
  icon?: string
  shortcut?: string
  arrow?: boolean
  style?: string
  children?: DropdownItem[]
  onClick: () => void
}

const props = defineProps<{
  items: DropdownItem[]
}>()

const visible = ref(false)
const posX = ref(0)
const posY = ref(0)
const panelEl = ref<HTMLElement | null>(null)
const submenuEl = ref<HTMLElement | null>(null)
const activeSubmenu = ref<DropdownItem | null>(null)
const submenuX = ref(0)
const submenuY = ref(0)

const iconMode = computed(() => props.items.every((i: DropdownItem) => i.icon))

function openAt(x: number, y: number) {
  posX.value = x
  posY.value = y
  visible.value = true
  activeSubmenu.value = null
}

function close() {
  visible.value = false
  activeSubmenu.value = null
}

function select(item: DropdownItem, event: MouseEvent) {
  if (item.children?.length) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    submenuX.value = rect.left
    submenuY.value = rect.bottom + 2
    activeSubmenu.value = activeSubmenu.value === item ? null : item
    return
  }
  close()
  item.onClick()
}

function selectSub(item: DropdownItem) {
  close()
  item.onClick()
}

function onOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    panelEl.value && !panelEl.value.contains(target) &&
    (submenuEl.value == null || !submenuEl.value.contains(target))
  ) {
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
          :class="{ 'tb--has-sub': item.children?.length }"
          :title="item.label + (item.shortcut ? ' (' + item.shortcut + ')' : '')"
          @mousedown.prevent
          @click="select(item, $event)"
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
          @click="select(item, $event)"
        >
          <span class="tb-menu-label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="tb-menu-shortcut">{{ item.shortcut }}</span>
          <Icon v-if="item.children?.length" name="chevron_right" :size="12" class="tb-menu-arrow" />
        </button>
      </template>
    </div>

    <!-- submenu panel -->
    <div
      v-if="visible && activeSubmenu"
      ref="submenuEl"
      class="ck-dd"
      :style="{ top: submenuY + 'px', left: submenuX + 'px' }"
    >
      <button
        v-for="child in activeSubmenu.children"
        :key="child.label"
        type="button"
        class="tb-menu-item"
        :style="child.style"
        @mousedown.prevent
        @click="selectSub(child)"
      >
        <span class="tb-menu-label">{{ child.label }}</span>
        <span v-if="child.shortcut" class="tb-menu-shortcut">{{ child.shortcut }}</span>
      </button>
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

.tb-menu-arrow {
  margin-left: auto;
  opacity: 0.45;
  flex-shrink: 0;
}

.tb--has-sub {
  position: relative;
}
.tb--has-sub::after {
  content: '';
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 5px 5px;
  border-color: transparent transparent currentColor transparent;
  opacity: 0.5;
}
</style>
