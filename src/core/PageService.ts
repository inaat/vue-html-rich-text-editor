import { PAGE_KEY, LH_KEY } from '@/core/Constants'
import { PAGE_PRESETS, type PageSettings, type PagePreset } from '@/types'

export class PageService {
  current: PageSettings

  constructor(private root: HTMLElement) {
    this.current = this.loadPage() ?? { preset: 'letter', ...PAGE_PRESETS.letter }
  }

  apply(p: PageSettings): void {
    const root = document.documentElement.style
    root.setProperty('--page-w', p.w + 'px')
    root.setProperty('--page-h', p.h + 'px')
    root.setProperty('--page-pad-t', p.pT + 'px')
    root.setProperty('--page-pad-r', p.pR + 'px')
    root.setProperty('--page-pad-b', p.pB + 'px')
    root.setProperty('--page-pad-l', p.pL + 'px')

    const pxToIn = (n: number) => (n / 96).toFixed(4) + 'in'
    this.ensurePrintStyle().textContent =
      `@page { size: ${pxToIn(p.w)} ${pxToIn(p.h)}; margin: 0; }`

    try { localStorage.setItem(PAGE_KEY, JSON.stringify(p)) } catch { /* */ }
    this.current = p
  }

  applyPreset(preset: Exclude<PagePreset, 'custom'>): void {
    this.apply({ preset, ...PAGE_PRESETS[preset] })
  }

  applyDocLineHeight(v: string | number | null): void {
    if (v === '' || v == null) {
      this.root.style.lineHeight = ''
      try { localStorage.removeItem(LH_KEY) } catch { /* */ }
    } else {
      this.root.style.lineHeight = String(v)
      try { localStorage.setItem(LH_KEY, String(v)) } catch { /* */ }
    }
  }

  loadDocLineHeight(): string | null {
    try { return localStorage.getItem(LH_KEY) } catch { return null }
  }

  private loadPage(): PageSettings | null {
    try {
      const raw = localStorage.getItem(PAGE_KEY)
      if (raw) return JSON.parse(raw) as PageSettings
    } catch { /* */ }
    return null
  }

  private ensurePrintStyle(): HTMLStyleElement {
    let el = document.getElementById('dynamicPrintStyle') as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = 'dynamicPrintStyle'
      document.head.appendChild(el)
    }
    return el
  }
}
