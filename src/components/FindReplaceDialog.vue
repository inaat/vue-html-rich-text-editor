<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorContext } from '../composables/useEditorContext'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const ctx = useEditorContext()

const findText = ref('')
const replaceText = ref('')
const advancedOpen = ref(false)
const matchCase = ref(false)
const wholeWord = ref(false)
const matchCount = ref(0)
const cursor = ref(-1) // index into matches
const findInputRef = ref<HTMLInputElement | null>(null)

interface Match { node: Text; start: number; end: number }
const matches = ref<Match[]>([])

watch(() => props.visible, async (v) => {
  if (v) {
    await nextTick()
    findInputRef.value?.focus()
    findInputRef.value?.select()
    rescan()
  } else {
    clearHighlights()
  }
})

watch([findText, matchCase, wholeWord], () => rescan())

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildRegex(): RegExp | null {
  const q = findText.value
  if (!q) return null
  let pat = escapeRegex(q)
  if (wholeWord.value) pat = `\\b${pat}\\b`
  return new RegExp(pat, matchCase.value ? 'g' : 'gi')
}

function rescan() {
  matches.value = []
  cursor.value = -1
  matchCount.value = 0
  clearHighlights()
  const re = buildRegex()
  if (!re || !ctx.root) return
  const walker = document.createTreeWalker(ctx.root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = (n as Text).parentElement
      if (!p) return NodeFilter.FILTER_REJECT
      if (p.closest('script,style,.find-highlight')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })
  let n: Node | null
  while ((n = walker.nextNode())) {
    const text = (n as Text).data
    re.lastIndex = 0
    let m
    while ((m = re.exec(text))) {
      matches.value.push({ node: n as Text, start: m.index, end: m.index + m[0].length })
      if (m[0].length === 0) re.lastIndex++
    }
  }
  matchCount.value = matches.value.length
  if (matchCount.value > 0) cursor.value = 0
  applyHighlights()
}

function clearHighlights() {
  if (!ctx.root) return
  ctx.root.querySelectorAll('.find-highlight').forEach((el) => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
    parent.normalize()
  })
}

function applyHighlights() {
  // group matches by node so we wrap in reverse order
  const byNode = new Map<Text, Match[]>()
  for (const m of matches.value) {
    if (!byNode.has(m.node)) byNode.set(m.node, [])
    byNode.get(m.node)!.push(m)
  }
  let idx = 0
  byNode.forEach((arr, node) => {
    if (!node.parentNode) { idx += arr.length; return }
    const sorted = [...arr].sort((a, b) => a.start - b.start)
    const text = node.data
    const frag = document.createDocumentFragment()
    let last = 0
    for (const m of sorted) {
      if (m.start > last) frag.appendChild(document.createTextNode(text.slice(last, m.start)))
      const span = document.createElement('span')
      span.className = 'find-highlight'
      span.dataset.idx = String(idx++)
      span.textContent = text.slice(m.start, m.end)
      frag.appendChild(span)
      last = m.end
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    node.parentNode.replaceChild(frag, node)
  })
  highlightCursor()
}

function highlightCursor() {
  if (!ctx.root) return
  ctx.root.querySelectorAll('.find-highlight.current').forEach((el) => el.classList.remove('current'))
  const el = ctx.root.querySelector(`.find-highlight[data-idx="${cursor.value}"]`) as HTMLElement | null
  if (el) {
    el.classList.add('current')
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

function findNext() {
  if (!matchCount.value) return
  cursor.value = (cursor.value + 1) % matchCount.value
  highlightCursor()
}
function findPrev() {
  if (!matchCount.value) return
  cursor.value = (cursor.value - 1 + matchCount.value) % matchCount.value
  highlightCursor()
}

function replaceCurrent() {
  if (!ctx.root || cursor.value < 0) return
  const el = ctx.root.querySelector(`.find-highlight[data-idx="${cursor.value}"]`) as HTMLElement | null
  if (!el || !el.parentNode) return
  const replacement = document.createTextNode(replaceText.value ?? '')
  el.parentNode.replaceChild(replacement, el)
  ctx.root.normalize?.()
  ctx.scheduleSave()
  rescan()
}

function replaceAll() {
  if (!ctx.root || matchCount.value === 0) return
  const els = Array.from(ctx.root.querySelectorAll('.find-highlight')) as HTMLElement[]
  for (const el of els) {
    const repl = document.createTextNode(replaceText.value ?? '')
    el.parentNode?.replaceChild(repl, el)
  }
  ctx.root.normalize?.()
  ctx.scheduleSave()
  ctx.setStatus(`Replaced ${els.length} occurrence${els.length === 1 ? '' : 's'}`, 'ok')
  rescan()
}

function close() { emit('close') }

const counterText = computed(() => {
  if (!findText.value) return ''
  if (!matchCount.value) return 'No results'
  return `${cursor.value + 1} of ${matchCount.value}`
})

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') { ev.preventDefault(); close() }
  else if (ev.key === 'Enter') {
    ev.preventDefault()
    if (ev.shiftKey) findPrev()
    else findNext()
  }
}
</script>

<template>
  <div v-if="visible" class="fr-backdrop" @click.self="close">
    <div class="fr-dialog" role="dialog" aria-label="Find and replace" @keydown="onKeydown">
      <div class="fr-header">
        <span class="fr-title">Find and replace</span>
        <button type="button" class="fr-close" aria-label="Close" @click="close">×</button>
      </div>
      <div class="fr-body">
        <div class="fr-row">
          <input
            ref="findInputRef"
            v-model="findText"
            class="fr-input"
            type="text"
            placeholder="Find in text…"
          />
          <button type="button" class="fr-iconbtn" title="Previous (Shift+Enter)" :disabled="!matchCount" @click="findPrev">
            <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor"><path d="M.941 6.477a.75.75 0 1 0 1.06 1.06l3.006-3.005 3.005 3.005a.75.75 0 1 0 1.06-1.06l-3.549-3.55a.75.75 0 0 0-1.168.137z"/></svg>
          </button>
          <button type="button" class="fr-iconbtn" title="Next (Enter)" :disabled="!matchCount" @click="findNext">
            <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136z"/></svg>
          </button>
        </div>
        <div class="fr-row">
          <input
            v-model="replaceText"
            class="fr-input"
            type="text"
            placeholder="Replace with…"
          />
        </div>

        <div class="fr-counter" v-if="findText">{{ counterText }}</div>

        <div class="fr-advanced">
          <button type="button" class="fr-adv-toggle" :class="{ open: advancedOpen }" @click="advancedOpen = !advancedOpen">
            <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136z"/></svg>
            <span>Advanced options</span>
          </button>
          <div v-if="advancedOpen" class="fr-adv-body">
            <label class="fr-toggle">
              <span>Match case</span>
              <input type="checkbox" v-model="matchCase" />
              <span class="fr-switch" :class="{ on: matchCase }"><span class="fr-knob" /></span>
            </label>
            <label class="fr-toggle">
              <span>Whole words only</span>
              <input type="checkbox" v-model="wholeWord" />
              <span class="fr-switch" :class="{ on: wholeWord }"><span class="fr-knob" /></span>
            </label>
          </div>
        </div>
      </div>
      <div class="fr-footer">
        <button type="button" class="fr-btn fr-btn-text" :disabled="!matchCount" @click="replaceAll">Replace all</button>
        <button type="button" class="fr-btn fr-btn-text" :disabled="!matchCount" @click="replaceCurrent">Replace</button>
        <button type="button" class="fr-btn fr-btn-primary" :disabled="!matchCount" @click="findNext">Find</button>
      </div>
    </div>
  </div>
</template>
