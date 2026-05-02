<script setup lang="ts">
import { ref } from 'vue'
import { useFormatting } from '../../composables/useFormatting'
import Icon from '../Icon.vue'
import CkDropdown from '../toolbar/ck-dropdown.vue'
import CkColorPicker from '../toolbar/ck-color-picker.vue'
import CkHighlightPicker from '../toolbar/ck-highlight-picker.vue'

defineProps<{
  visible: boolean
  top: number
  left: number
}>()

const { applyBasic, fontSizeChildren, fontFamilyChildren } = useFormatting()

const fontSizeDropdown  = ref<InstanceType<typeof CkDropdown> | null>(null)
const fontFamilyDropdown = ref<InstanceType<typeof CkDropdown> | null>(null)
const colorPickerEl     = ref<InstanceType<typeof CkColorPicker> | null>(null)
const highlightPickerEl = ref<InstanceType<typeof CkHighlightPicker> | null>(null)

function pickFontSize(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  fontSizeDropdown.value?.openAt(rect.left, rect.bottom + 2)
}
function pickFontFamily(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  fontFamilyDropdown.value?.openAt(rect.left, rect.bottom + 2)
}
function pickColor(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  colorPickerEl.value?.openAt(rect.left, rect.bottom + 2, 'foreColor')
}
function pickHighlight(ev: MouseEvent) {
  const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  highlightPickerEl.value?.openAt(rect.left, rect.bottom + 2)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="bubble-bar" :style="{ top: top + 'px', left: left + 'px' }">
      <button class="tb tb--has-sub" title="Font Size"   @mousedown.prevent @click="pickFontSize">
        <Icon name="font_size" />
      </button>
      <CkDropdown ref="fontSizeDropdown" :items="fontSizeChildren" />

      <button class="tb tb--has-sub" title="Font Family" @mousedown.prevent @click="pickFontFamily">
        <Icon name="font_family" />
      </button>
      <CkDropdown ref="fontFamilyDropdown" :items="fontFamilyChildren" />

      <button class="tb tb--has-sub" title="Font Color"  @mousedown.prevent @click="pickColor">
        <Icon name="font_color" />
      </button>
      <CkColorPicker ref="colorPickerEl" />

      <button class="tb tb--has-sub" title="Highlight"   @mousedown.prevent @click="pickHighlight">
        <Icon name="remove_color" />
      </button>
      <CkHighlightPicker ref="highlightPickerEl" />

      <span class="bubble-sep" />

      <button class="tb" title="Italic (Ctrl+I)"     @mousedown.prevent @click="applyBasic('italic')">
        <Icon name="italic" />
      </button>
      <button class="tb" title="Underline (Ctrl+U)"  @mousedown.prevent @click="applyBasic('underline')">
        <Icon name="underline" />
      </button>
      <button class="tb" title="Strikethrough"       @mousedown.prevent @click="applyBasic('strike')">
        <Icon name="strikethrough" />
      </button>
      <button class="tb" title="Inline Code"         @mousedown.prevent @click="applyBasic('code')">
        <Icon name="code" />
      </button>
      <button class="tb" title="Superscript (Ctrl+.)" @mousedown.prevent @click="applyBasic('sup')">
        <Icon name="superscript" />
      </button>
      <button class="tb" title="Subscript (Ctrl+,)"  @mousedown.prevent @click="applyBasic('sub')">
        <Icon name="subscript" />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.bubble-bar {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 3px 4px;
  background: #fff;
  border: 1px solid var(--border-default, #e4e7ec);
  border-radius: var(--radius-md, 6px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.12));
}

.bubble-sep {
  width: 1px;
  height: 18px;
  background: #e4e7ec;
  margin: 0 3px;
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
