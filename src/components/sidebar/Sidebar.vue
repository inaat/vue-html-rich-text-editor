<script setup lang="ts">
import PageSettings from './PageSettings.vue'
import StylePanel from './StylePanel.vue'
import DocumentMeta from './DocumentMeta.vue'
import type { DocumentMeta as DocMeta } from '../../types'

defineProps<{ meta: DocMeta }>()
</script>

<template>
  <aside class="sidebar">
    <h3>Page</h3>
    <PageSettings />
    <h3>Style</h3>
    <StylePanel />
    <h3>Document</h3>
    <DocumentMeta :meta="meta" />
  </aside>
</template>
