<script setup lang="ts">
const props = defineProps<{
  showSource: boolean
  source: string
  bindRoot: (el: Element | null) => void
  bindSource: (el: Element | null) => void
}>()

defineEmits<{
  (e: 'edit-input'): void
  (e: 'edit-click', ev: MouseEvent): void
  (e: 'edit-mousedown', ev: MouseEvent): void
  (e: 'edit-keydown', ev: KeyboardEvent): void
  (e: 'edit-mouseup'): void
}>()

function setRoot(el: any) { props.bindRoot(el) }
function setSource(el: any) { props.bindSource(el) }
</script>

<template>
  <main class="layout">
    <section class="editor-pane">
      <div
        :ref="setRoot"
        id="editor"
        class="editor"
        contenteditable="true"
        spellcheck="true"
        :hidden="showSource"
        @input="$emit('edit-input')"
        @click="$emit('edit-click', $event)"
        @mousedown="$emit('edit-mousedown', $event)"
        @keydown="$emit('edit-keydown', $event)"
        @mouseup="$emit('edit-mouseup')"
      >
        <p class="placeholder">Type or paste your content here!</p>
      </div>
      <pre
        :ref="setSource"
        id="source"
        class="source"
        :hidden="!showSource"
      >{{ source }}</pre>
    </section>
    <slot name="sidebar" />
  </main>
</template>
