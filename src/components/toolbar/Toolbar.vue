<script setup lang="ts">
import { ref } from 'vue'
import MenuBar from './MenuBar.vue'
import ToolbarRow1 from './ToolbarRow1.vue'
import ToolbarRow2 from './ToolbarRow2.vue'

defineProps<{
  zoom: number
  fullscreen: boolean
}>()

defineEmits<{
  (e: 'toggle-source'): void
  (e: 'import-files'): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'toggle-fullscreen'): void
  (e: 'open-find-replace'): void
  (e: 'open-link', payload: { rect: { top: number; left: number; bottom: number } }): void
}>()

const root = ref<HTMLDivElement | null>(null)
defineExpose({ rootEl: root })

const headingSelect = ref<HTMLSelectElement | null>(null)
function openHeadingMenu() {
  headingSelect.value?.focus()
  ;(headingSelect.value as any)?.showPicker?.()
}
</script>

<template>
  <div ref="root" class="toolbar" id="toolbar">
    <span class="status floating" />
    <MenuBar
      @toggle-source="$emit('toggle-source')"
      @import-files="$emit('import-files')"
      @open-find-replace="$emit('open-find-replace')"
      @open-link="(p) => $emit('open-link', p)"
    />
    <ToolbarRow1
      :zoom="zoom"
      :fullscreen="fullscreen"
      @toggle-source="$emit('toggle-source')"
      @import-files="$emit('import-files')"
      @open-heading-menu="openHeadingMenu"
      @zoom-in="$emit('zoom-in')"
      @zoom-out="$emit('zoom-out')"
      @toggle-fullscreen="$emit('toggle-fullscreen')"
      @open-find-replace="$emit('open-find-replace')"
      @open-link="(p) => $emit('open-link', p)"
    />
    <ToolbarRow2 />
  </div>
</template>
