import { inject, ref, computed, onMounted, onUnmounted } from 'vue'
import type { InjectionKey } from 'vue'
import { useEditorContext } from '@/composables/useEditorContext'
import type { DropdownItem } from '@/components/toolbar/ck-dropdown.vue'
import type { FontDefinition } from '@/types'

export const FONTS_KEY: InjectionKey<FontDefinition[] | null> = Symbol('fonts')

interface FontEntry { label: string; value: string }

const BUILTIN_LATIN: FontEntry[] = [
  { label: 'Arial',               value: 'Arial' },
  { label: 'Courier New',         value: 'Courier New' },
  { label: 'Georgia',             value: 'Georgia' },
  { label: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' },
  { label: 'Tahoma',              value: 'Tahoma' },
  { label: 'Times New Roman',     value: 'Times New Roman' },
  { label: 'Trebuchet MS',        value: 'Trebuchet MS' },
  { label: 'Verdana',             value: 'Verdana' },
]

const BUILTIN_ARABIC: FontEntry[] = [
  { label: 'IBM Plex Arabic',  value: 'IBM Plex Arabic' },
  { label: 'Noto Sans Arabic', value: 'Noto Sans Arabic' },
  { label: 'Cairo',            value: 'Cairo' },
  { label: 'Amiri',            value: 'Amiri' },
]

const FONT_SIZES = ['10', '12', '14', '18', '20', '22', '24', '36']

function fontStyle(value: string) {
  return `font-family:${value.includes(' ') ? `"${value}"` : value}`
}

export function useFormatting() {
  const ctx = useEditorContext()
  const customFonts = inject(FONTS_KEY, null)

  function applyBasic(kind: string) {
    switch (kind) {
      case 'sup':       ctx.engine.exec('superscript'); break
      case 'sub':       ctx.engine.exec('subscript'); break
      case 'code':      ctx.insert.inlineCode(window.getSelection()?.toString() ?? ''); break
      case 'strike':    ctx.engine.exec('strikeThrough'); break
      case 'underline': ctx.engine.exec('underline'); break
      case 'italic':    ctx.engine.exec('italic'); break
      case 'bold':      ctx.engine.exec('bold'); break
    }
  }

  function applyFontSize(size: string) {
    if (!size) { document.execCommand('removeFormat'); return }
    const before = new Set(ctx.root.querySelectorAll('font[size="7"]'))
    ctx.engine.exec('fontSize', '7')
    for (const font of ctx.root.querySelectorAll('font[size="7"]')) {
      if (before.has(font)) continue
      const span = document.createElement('span')
      span.style.fontSize = size + 'px'
      while (font.firstChild) span.appendChild(font.firstChild)
      font.replaceWith(span)
    }
    ctx.scheduleSave()
  }

  function applyFontFamily(family: string) {
    if (family) document.execCommand('fontName', false, family)
    else document.execCommand('removeFormat')
  }

  const currentFont = ref('')
  const currentSize = ref('')

  function updateActiveState() {
    try {
      const root = ctx.root
      if (!root) { currentFont.value = ''; currentSize.value = ''; return }
      const sel = window.getSelection()
      if (!sel || !sel.rangeCount) { currentFont.value = ''; currentSize.value = ''; return }
      const node = sel.anchorNode
      const el = (node?.nodeType === 3 ? node.parentElement : node) as HTMLElement | null
      if (!el || !root.contains(el)) { currentFont.value = ''; currentSize.value = ''; return }
      const cs = window.getComputedStyle(el)
      currentFont.value = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
      currentSize.value = Math.round(parseFloat(cs.fontSize)).toString()
    } catch {
      currentFont.value = ''
      currentSize.value = ''
    }
  }

  onMounted(() => document.addEventListener('selectionchange', updateActiveState))
  onUnmounted(() => document.removeEventListener('selectionchange', updateActiveState))

  const fontSizeChildren = computed<DropdownItem[]>(() => {
    const cs = currentSize.value
    return [
      { label: '10',     style: 'font-size:10px', active: cs === '10',  onClick: () => applyFontSize('10') },
      { label: '12',     style: 'font-size:12px', active: cs === '12',  onClick: () => applyFontSize('12') },
      { label: '14',     style: 'font-size:14px', active: cs === '14',  onClick: () => applyFontSize('14') },
      { label: 'Default',                          active: !FONT_SIZES.includes(cs), onClick: () => applyFontSize('') },
      { label: '18',     style: 'font-size:18px', active: cs === '18',  onClick: () => applyFontSize('18') },
      { label: '20',     style: 'font-size:20px', active: cs === '20',  onClick: () => applyFontSize('20') },
      { label: '22',     style: 'font-size:22px', active: cs === '22',  onClick: () => applyFontSize('22') },
      { label: '24',     style: 'font-size:24px', active: cs === '24',  onClick: () => applyFontSize('24') },
      { label: '36',     style: 'font-size:36px', active: cs === '36',  onClick: () => applyFontSize('36') },
    ]
  })

  const fontFamilyChildren = computed<DropdownItem[]>(() => {
    const cf = currentFont.value.toLowerCase()

    function toItem(f: FontEntry): DropdownItem {
      return {
        label: f.label,
        style: fontStyle(f.value),
        active: cf === f.value.toLowerCase(),
        onClick: () => applyFontFamily(f.value),
      }
    }

    return [
      { label: 'Default', active: !cf, onClick: () => applyFontFamily('') },
      ...BUILTIN_LATIN.map(toItem),
      { separator: true },
      ...BUILTIN_ARABIC.map(toItem),
      ...(customFonts ?? []).map(f => toItem({ label: f.label, value: f.value })),
    ]
  })

  return { applyBasic, applyFontSize, applyFontFamily, fontSizeChildren, fontFamilyChildren }
}
