<script setup lang="ts">
import { ref } from 'vue'
import { DocxEditor } from '../src'

const html = ref('<p>Type or paste your content here!</p>')
</script>

<template>
  <DocxEditor v-model="html" />
</template>
