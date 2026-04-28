<script setup lang="ts">
import { ref } from 'vue'
import ToolbarRow1 from './ToolbarRow1.vue'
import ToolbarRow2 from './ToolbarRow2.vue'

defineEmits<{
  (e: 'toggle-source'): void
  (e: 'import-files'): void
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
    <ToolbarRow1
      @toggle-source="$emit('toggle-source')"
      @import-files="$emit('import-files')"
      @open-heading-menu="openHeadingMenu"
    />
    <ToolbarRow2 />
  </div>
</template>
