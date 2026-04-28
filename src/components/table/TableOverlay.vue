<script setup lang="ts">
defineProps<{
  visible: boolean
  top: number
  left: number
  width: number
  height: number
  enterTopY: number
  enterBottomY: number
  enterX: number
}>()

const emit = defineEmits<{
  (e: 'drag-start', ev: MouseEvent): void
  (e: 'insert-paragraph', where: 'above' | 'below'): void
}>()

function onHandleDown(e: MouseEvent) {
  emit('drag-start', e)
}
</script>

<template>
  <Teleport to="body">
    <div
      class="tbl-overlay"
      :hidden="!visible"
      :style="{ top: top + 'px', left: left + 'px', width: width + 'px', height: height + 'px' }"
      @mousedown.prevent
    >
      <button
        type="button"
        class="tbl-handle"
        title="Drag to move table"
        data-ov-act="drag"
        @mousedown="onHandleDown"
      >
        <svg viewBox="0 0 16 16" width="14" height="14">
          <circle cx="4" cy="4" r="1.2" fill="currentColor" />
          <circle cx="8" cy="4" r="1.2" fill="currentColor" />
          <circle cx="12" cy="4" r="1.2" fill="currentColor" />
          <circle cx="4" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="12" cy="8" r="1.2" fill="currentColor" />
          <circle cx="4" cy="12" r="1.2" fill="currentColor" />
          <circle cx="8" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      </button>
    </div>
    <button
      class="tbl-enter"
      type="button"
      :hidden="!visible"
      :style="{ top: enterTopY + 'px', left: enterX + 'px' }"
      title="Insert paragraph above"
      @mousedown.prevent
      @click="emit('insert-paragraph', 'above')"
    >
      <svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 18 V13 a3 3 0 0 0 -3 -3 H6 M10 14 L6 10 L10 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button
      class="tbl-enter"
      type="button"
      :hidden="!visible"
      :style="{ top: enterBottomY + 'px', left: enterX + 'px' }"
      title="Insert paragraph below"
      @mousedown.prevent
      @click="emit('insert-paragraph', 'below')"
    >
      <svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 6 V11 a3 3 0 0 1 -3 3 H6 M10 10 L6 14 L10 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </Teleport>
</template>
