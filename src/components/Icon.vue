<script setup lang="ts">
import { computed } from 'vue'
import { ICONS } from '@/icons/registry'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: 16
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
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    v-html="icon.content"
  />
  <span v-else class="rte__icon-fallback">{{ name }}</span>
</template>

<style scoped>
.rte__icon { display: inline-block; vertical-align: middle; flex-shrink: 0; pointer-events: none; }
.rte__icon-fallback { font-size: 11px; opacity: 0.6; }
</style>
