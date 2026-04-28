<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import { DirectionService } from '../../core/DirectionService'

const props = defineProps<{
  visible: boolean
  top: number
  left: number
}>()

defineEmits<{
  (e: 'measure', w: number, h: number): void
}>()

const ctx = useEditorContext()
const root = ref<HTMLDivElement | null>(null)

function measure() {
  if (root.value) {
    const w = root.value.offsetWidth
    const h = root.value.offsetHeight
    if (w && h) (root.value as any).__measured = { w, h }
  }
}

onMounted(measure)
watch(() => props.visible, () => setTimeout(measure, 0))

function insertLink() {
  const url = prompt('Link URL:', 'https://')
  if (url) ctx.engine.exec('createLink', url)
}
</script>

<template>
  <div
    ref="root"
    class="bubble"
    :hidden="!visible"
    :style="{ top: top + 'px', left: left + 'px' }"
    @mousedown.prevent="ctx.selection.remember()"
  >
    <button @click="ctx.engine.exec('bold')"><b>B</b></button>
    <button @click="ctx.engine.exec('italic')"><i>I</i></button>
    <button @click="ctx.engine.exec('underline')"><u>U</u></button>
    <button @click="insertLink">🔗</button>
    <button @click="DirectionService.setBlockDir(ctx.selection.selectionBlock(), 'ltr')">LTR</button>
    <button @click="DirectionService.setBlockDir(ctx.selection.selectionBlock(), 'rtl')">RTL</button>
  </div>
</template>
