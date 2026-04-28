<script setup lang="ts">
import { computed } from 'vue'
import { ICONS } from '../icons/registry'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: 18
})

const icon = computed(() => ICONS[props.name])
</script>

<template>
  <svg
    v-if="icon"
    class="rte__icon"
    :viewBox="icon.viewBox"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(p, i) in icon.paths"
      :key="i"
      :d="p.d"
      :fill="p.fill ?? 'none'"
      :stroke="p.stroke ?? 'none'"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :transform="p.transform"
    />
  </svg>
  <span v-else class="rte__icon-fallback">{{ name }}</span>
</template>

<style scoped>
.rte__icon { display: inline-block; vertical-align: middle; }
.rte__icon-fallback { font-size: 11px; opacity: 0.6; }
</style>
