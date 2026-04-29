<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', url: string): void
}>()

const url = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.visible, async (v) => {
  if (v) {
    url.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

const canInsert = computed(() => url.value.trim().length > 0)

function close() { emit('close') }
function submit() {
  if (!canInsert.value) return
  emit('submit', url.value.trim())
  emit('close')
}
function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') { ev.preventDefault(); close() }
  else if (ev.key === 'Enter') { ev.preventDefault(); submit() }
}
</script>

<template>
  <div v-if="visible" class="iu-backdrop" @click.self="close">
    <div class="iu-dialog" role="dialog" aria-label="Image via URL" @keydown="onKeydown">
      <div class="iu-header">
        <span class="iu-title">Image via URL</span>
        <button type="button" class="iu-close" aria-label="Close" @click="close">&times;</button>
      </div>
      <div class="iu-body">
        <div class="iu-field">
          <label class="iu-flabel">Insert image via URL</label>
          <input
            ref="inputRef"
            v-model="url"
            type="url"
            class="iu-input"
            placeholder="https://example.com/image.png"
          />
        </div>
      </div>
      <div class="iu-footer">
        <button type="button" class="iu-btn iu-btn-text" @click="close">Cancel</button>
        <button type="button" class="iu-btn iu-btn-primary" :disabled="!canInsert" @click="submit">Insert</button>
      </div>
    </div>
  </div>
</template>
