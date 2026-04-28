<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEditorContext } from '../../composables/useEditorContext'
import { PAGE_PRESETS, type PagePreset } from '../../types'

const ctx = useEditorContext()

const preset = ref<PagePreset>(ctx.page.current.preset)
const w = ref(ctx.page.current.w)
const h = ref(ctx.page.current.h)
const pT = ref(ctx.page.current.pT)
const pR = ref(ctx.page.current.pR)
const pB = ref(ctx.page.current.pB)
const pL = ref(ctx.page.current.pL)
const docLh = ref('')

onMounted(() => {
  const saved = ctx.page.loadDocLineHeight()
  if (saved) {
    docLh.value = saved
    ctx.page.applyDocLineHeight(saved)
  }
})

function syncFromCtx() {
  const p = ctx.page.current
  preset.value = p.preset; w.value = p.w; h.value = p.h
  pT.value = p.pT; pR.value = p.pR; pB.value = p.pB; pL.value = p.pL
}

watch(preset, (v) => {
  if (v !== 'custom' && v in PAGE_PRESETS) {
    ctx.page.applyPreset(v as Exclude<PagePreset, 'custom'>)
    syncFromCtx()
  }
})

function onCustomInput() {
  ctx.page.apply({
    preset: 'custom',
    w: +w.value || 816,
    h: +h.value || 1056,
    pT: +pT.value || 0,
    pR: +pR.value || 0,
    pB: +pB.value || 0,
    pL: +pL.value || 0
  })
  preset.value = 'custom'
}

function reset() {
  ctx.page.applyPreset('letter')
  syncFromCtx()
}

watch(docLh, (v) => ctx.page.applyDocLineHeight(v))
</script>

<template>
  <div class="page-settings">
    <label>Preset
      <select v-model="preset">
        <option value="letter">Letter (8.5 × 11 in)</option>
        <option value="a4">A4 (210 × 297 mm)</option>
        <option value="legal">Legal (8.5 × 14 in)</option>
        <option value="custom">Custom</option>
      </select>
    </label>
    <label>Width <input v-model.number="w" type="number" min="200" max="2000" step="1" @input="onCustomInput"> px</label>
    <label>Height <input v-model.number="h" type="number" min="200" max="3000" step="1" @input="onCustomInput"> px</label>
    <div class="margin-grid">
      <label>Top    <input v-model.number="pT" type="number" min="0" max="400" step="1" @input="onCustomInput"> px</label>
      <label>Right  <input v-model.number="pR" type="number" min="0" max="400" step="1" @input="onCustomInput"> px</label>
      <label>Bottom <input v-model.number="pB" type="number" min="0" max="400" step="1" @input="onCustomInput"> px</label>
      <label>Left   <input v-model.number="pL" type="number" min="0" max="400" step="1" @input="onCustomInput"> px</label>
    </div>
    <label>Line-height (whole document)
      <input v-model="docLh" type="number" min="0.8" max="3" step="0.05" placeholder="1.4">
    </label>
    <button type="button" class="btn-secondary" @click="reset">Reset to Letter / 1in margins</button>
  </div>
</template>
