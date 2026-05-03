<script setup lang="ts">
import { ref } from 'vue'
import PageSettings from '@/components/sidebar/PageSettings.vue'
import StylePanel from '@/components/sidebar/StylePanel.vue'
import DocumentMeta from '@/components/sidebar/DocumentMeta.vue'
import { useLocale } from '@/composables/useLocale'
import type { DocumentMeta as DocMeta } from '@/types'

defineProps<{ meta: DocMeta }>()

const lc = useLocale()
const pageOpen = ref(true)
const styleOpen = ref(true)
const docOpen = ref(false)

function chevron() {
  return '<svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136z"/></svg>'
}
</script>

<template>
  <aside class="sidebar">
    <div class="rp-section">
      <div class="rp-hdr" @click="pageOpen = !pageOpen">
        <span class="rp-title">{{ lc.sidebarPage }}</span>
        <span class="rp-chevron" :class="{ open: pageOpen }" v-html="chevron()" />
      </div>
      <div v-if="pageOpen" class="rp-body">
        <PageSettings />
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-hdr" @click="styleOpen = !styleOpen">
        <span class="rp-title">{{ lc.sidebarStyle }}</span>
        <span class="rp-chevron" :class="{ open: styleOpen }" v-html="chevron()" />
      </div>
      <div v-if="styleOpen" class="rp-body">
        <StylePanel />
      </div>
    </div>

    <div class="rp-section">
      <div class="rp-hdr" @click="docOpen = !docOpen">
        <span class="rp-title">{{ lc.sidebarDocument }}</span>
        <span class="rp-chevron" :class="{ open: docOpen }" v-html="chevron()" />
      </div>
      <div v-if="docOpen" class="rp-body">
        <DocumentMeta :meta="meta" />
      </div>
    </div>
  </aside>
</template>
