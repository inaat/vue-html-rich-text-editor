<script setup lang="ts">
import Icon from '@/components/Icon.vue'

defineProps<{
  icon?: string
  text?: string
  title?: string
  active?: boolean
  hasArrow?: boolean
}>()

defineEmits<{
  (e: 'invoke', ev: MouseEvent): void
}>()
</script>

<template>
  <button
    type="button"
    class="tb"
    :class="{ 'has-arrow': hasArrow, active }"
    :title="title"
    @mousedown.prevent
    @click="$emit('invoke', $event)"
  >
    <Icon v-if="icon" :name="icon" />
    <span v-else-if="text" v-html="text" />
  </button>
</template>
