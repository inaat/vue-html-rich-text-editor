<script setup lang="ts">
import type { DocumentMeta } from '../../types'

defineProps<{ meta: DocumentMeta }>()
</script>

<template>
  <dl id="meta">
    <dt>File</dt><dd>{{ meta.file }}</dd>
    <dt>Size</dt><dd>{{ meta.size }}</dd>
    <dt>Blocks</dt><dd>{{ meta.blocks }}</dd>
    <dt>Images</dt><dd>{{ meta.images }}</dd>
    <dt>Media in zip</dt><dd>{{ meta.zipMedia }}</dd>
    <dt>Unsupported</dt><dd>{{ meta.unsupported }}</dd>
    <dt>Recovered</dt><dd>{{ meta.recovered }}</dd>
    <dt>API</dt><dd>{{ meta.api }}</dd>
  </dl>
</template>
