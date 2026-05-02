<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'

const props = defineProps<{
  visible: boolean
  top: number
  left: number
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const ctx = useEditorContext()

const displayed = ref('')
const url = ref('')
const showBookmarks = ref(false)
const urlInputRef = ref<HTMLInputElement | null>(null)

interface BookmarkItem { id: string; label: string }
const bookmarks = ref<BookmarkItem[]>([])

watch(() => props.visible, async (v) => {
  if (!v) return
  // Pre-fill from current selection
  const sel = window.getSelection()
  const text = sel?.toString() ?? ''
  displayed.value = text
  url.value = ''
  showBookmarks.value = false
  loadBookmarks()
  await nextTick()
  urlInputRef.value?.focus()
})

function loadBookmarks() {
  if (!ctx.root) { bookmarks.value = []; return }
  const list: BookmarkItem[] = []
  ctx.root.querySelectorAll<HTMLAnchorElement>('a.bookmark[id]').forEach((a) => {
    const id = a.id
    const label = a.title?.replace(/^Bookmark:\s*/i, '') || id.replace(/^bookmark-/, '')
    list.push({ id, label })
  })
  // Also include heading IDs (so TOC/footnote items can be linked)
  ctx.root.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id]').forEach((h) => {
    list.push({ id: h.id, label: (h.textContent || h.id).slice(0, 40) })
  })
  bookmarks.value = list
}

function insertLink() {
  const u = url.value.trim()
  if (!u) return
  const text = displayed.value.trim() || u
  // Build a real anchor
  const html = `<a href="${u}">${escapeHtml(text)}</a>`
  ctx.insert.htmlAtCursor(html)
  ctx.scheduleSave()
  emit('close')
}

function pickBookmark(b: BookmarkItem) {
  const text = displayed.value.trim() || b.label || b.id
  const html = `<a href="#${b.id}">${escapeHtml(text)}</a>`
  ctx.insert.htmlAtCursor(html)
  ctx.scheduleSave()
  emit('close')
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string))
}

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') { ev.preventDefault(); emit('close') }
  else if (ev.key === 'Enter') {
    if (showBookmarks.value) return
    ev.preventDefault()
    insertLink()
  }
}

const positionStyle = computed(() => ({
  top: props.top + 'px',
  left: props.left + 'px'
}))
</script>

<template>
  <div v-if="visible" class="link-pop-backdrop" @click.self="emit('close')">
    <div class="link-pop" :style="positionStyle" role="dialog" aria-label="Insert link" @keydown="onKeydown">
      <div class="link-pop-arrow" />
      <div class="link-pop-header">Link</div>
      <div class="link-pop-body">
        <input
          v-model="displayed"
          class="link-pop-input"
          type="text"
          placeholder="Displayed text"
        />
        <div class="link-pop-row">
          <div class="link-pop-field">
            <span class="link-pop-flabel">Link URL</span>
            <input
              ref="urlInputRef"
              v-model="url"
              class="link-pop-input link-pop-input--floating"
              type="url"
              placeholder=""
            />
          </div>
          <button type="button" class="link-pop-insert" :disabled="!url.trim()" @click="insertLink">Insert</button>
        </div>
      </div>
      <div class="link-pop-section">
        <button type="button" class="link-pop-row-btn" @click="showBookmarks = !showBookmarks">
          <span>Bookmarks</span>
          <span class="link-pop-chev" :class="{ open: showBookmarks }">›</span>
        </button>
        <ul v-if="showBookmarks" class="link-pop-list">
          <li v-if="!bookmarks.length" class="link-pop-empty">No bookmarks in document</li>
          <li v-for="b in bookmarks" :key="b.id">
            <button type="button" class="link-pop-bookmark" @click="pickBookmark(b)">
              <span class="link-pop-bookmark-id">#{{ b.id }}</span>
              <span class="link-pop-bookmark-label">{{ b.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
