import type { PageSettings } from '../types'

const ARABIC_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@400;600;700&family=Cairo:wght@400;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">`

const ARABIC_FONT_FAMILY = `'IBM Plex Arabic', 'Noto Sans Arabic', 'Cairo', 'Amiri'`

export class ExportService {
  constructor(private root: HTMLElement) {}

  cleanHtml(rootHtml: string): string {
    const tmp = document.createElement('div')
    tmp.innerHTML = rootHtml
    for (const h of tmp.querySelectorAll('.img-handle')) h.remove()
    for (const w of tmp.querySelectorAll('.img-handle-wrap')) {
      while (w.firstChild) w.parentNode!.insertBefore(w.firstChild, w)
      w.remove()
    }
    return tmp.innerHTML
  }

  toWordDoc(filename: string): void {
    const html = `<!doctype html><html><head><meta charset="utf-8">${ARABIC_FONTS}<style>
  body{font-family:Calibri,Arial,${ARABIC_FONT_FAMILY},sans-serif}
  table{border-collapse:collapse} th,td{border:1px solid #888;padding:4px 8px}
  [dir=rtl],*:lang(ar){font-family:${ARABIC_FONT_FAMILY},sans-serif}
  </style></head><body>${this.cleanHtml(this.root.innerHTML)}</body></html>`
    const blob = new Blob(['﻿', html], { type: 'application/msword' })
    this.download(blob, `${filename}.doc`)
  }

  toHtmlPage(filename: string): void {
    const html = this.root.innerHTML
    const doc = `<!doctype html>
<html><head><meta charset="utf-8"><title>${filename}</title>
${ARABIC_FONTS}
<style>
  @page { size: A4; margin: 1in; }
  html, body { background: #f5f6f8; }
  body { font: 11pt/1.4 Calibri, "Segoe UI", Arial, ${ARABIC_FONT_FAMILY}, sans-serif; color: #1a1a1a; margin: 0; padding: 24px 0; }
  [dir=rtl], *:lang(ar) { font-family: ${ARABIC_FONT_FAMILY}, sans-serif; }
  .page { background: #fff; width: 816px; max-width: 100%; margin: 0 auto; padding: 96px;
    box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.06); }
  table { border-collapse: collapse; margin: 1em 0; width: 100%; table-layout: auto; }
  th, td { border: 1px solid #d0d4da; padding: 8px 12px; vertical-align: top; overflow-wrap: anywhere; }
  thead th { background: #f5f6f8; }
  blockquote { margin: 1em 0; padding: .4em 1em; border-left: 3px solid #d0d4da; color: #4b5563; }
  pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; overflow-x: auto;
        font: 13px/1.5 ui-monospace, Menlo, Consolas, monospace; }
  code { background: #f0f2f5; padding: 1px 4px; border-radius: 3px; }
  pre code { background: transparent; padding: 0; }
  img { max-width: 100%; height: auto; }
  hr.pagebreak { page-break-after: always; border: 0; border-top: 2px dashed #c4c4c4; margin: 24px 0; }
  .pagebreak { page-break-after: always; height: 0; margin: 0; border: 0; }
  .pagebreak .pb-label, .pagebreak .pb-delete { display: none; }
  p, li, th, td, h1, h2, h3, h4, h5, h6, blockquote { unicode-bidi: plaintext; }
  @media print {
    html, body { background: #fff; padding: 0; }
    .page { width: auto; max-width: none; margin: 0; padding: 0; box-shadow: none; }
  }
</style></head>
<body><div class="page">${html}</div></body></html>`
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' })
    this.download(blob, `${filename}.html`)
  }

  async toPdf(page?: PageSettings | null, filename?: string): Promise<void> {
    const p = page ?? { w: 816, h: 1056, pT: 96, pR: 96, pB: 96, pL: 96, preset: 'letter' as const }
    const name = (filename || 'document').replace(/\.pdf$/i, '')
    const content = this.cleanHtml(this.root.innerHTML)

    // Build a styled container rendered off-screen in the current page
    // (inherits already-loaded fonts including Arabic)
    const wrap = document.createElement('div')
    wrap.style.cssText = [
      'position:fixed', 'top:0', 'left:-9999px',
      `width:${p.w}px`,
      'background:#fff',
      `padding:${p.pT}px ${p.pR}px ${p.pB}px ${p.pL}px`,
      `font:11pt/1.4 Calibri,"Segoe UI",Arial,${ARABIC_FONT_FAMILY},sans-serif`,
      'color:#111',
    ].join(';')
    wrap.innerHTML = content
    document.body.appendChild(wrap)

    // Inline a minimal style tag so tables/images render correctly
    const style = document.createElement('style')
    style.textContent = `
      img{max-width:100%;height:auto}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #888;padding:4px 8px;vertical-align:top}
      blockquote{margin:1em 0;padding:.4em 1em;border-left:3px solid #d0d4da;color:#4b5563}
      pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:6px;font:13px/1.5 monospace}
      code{background:#f0f2f5;padding:1px 4px;border-radius:3px}
      pre code{background:transparent;padding:0}
      p,li,th,td,h1,h2,h3,h4,h5,h6,blockquote{unicode-bidi:plaintext}
      .pagebreak{page-break-after:always;height:0;margin:0}
      .pagebreak .pb-label,.pagebreak .pb-delete{display:none}
      .merge-field{background:#dbeafe;padding:0 2px;border-radius:2px}
    `
    wrap.prepend(style)

    try {
      const h2p = await this._loadHtml2Pdf()
      if (!h2p) throw new Error('load failed')

      const mmPad = (px: number) => +(px / 96 * 25.4).toFixed(1)
      await h2p().set({
        margin: [mmPad(p.pT), mmPad(p.pR), mmPad(p.pB), mmPad(p.pL)],
        filename: `${name}.pdf`,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(wrap).save()
    } catch {
      // Fallback: open a clean print popup
      this._printPopup(content, p, name)
    } finally {
      document.body.removeChild(wrap)
    }
  }

  private async _loadHtml2Pdf(): Promise<((el?: HTMLElement) => unknown) | null> {
    if ((window as Record<string, unknown>).html2pdf) {
      return (window as Record<string, unknown>).html2pdf as (el?: HTMLElement) => unknown
    }
    return new Promise((resolve) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      s.onload = () => resolve((window as Record<string, unknown>).html2pdf as (el?: HTMLElement) => unknown)
      s.onerror = () => resolve(null)
      document.head.appendChild(s)
    })
  }

  private _printPopup(content: string, p: PageSettings, name: string): void {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${name}</title>
${ARABIC_FONTS}
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;background:#fff}
  body{font:11pt/1.4 Calibri,"Segoe UI",Arial,${ARABIC_FONT_FAMILY},sans-serif;color:#111;
    padding:${p.pT}px ${p.pR}px ${p.pB}px ${p.pL}px}
  [dir=rtl],*:lang(ar){font-family:${ARABIC_FONT_FAMILY},sans-serif}
  img{max-width:100%;height:auto}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #888;padding:4px 8px;vertical-align:top}
  p,li,th,td,h1,h2,h3,h4,h5,h6,blockquote{unicode-bidi:plaintext}
  .pagebreak{page-break-after:always;height:0;margin:0}
  .pagebreak .pb-label,.pagebreak .pb-delete{display:none}
  @page{size:A4;margin:0}
</style></head>
<body>${content}
<script>window.addEventListener('load',()=>{window.print();window.addEventListener('afterprint',()=>window.close())})<\/script>
</body></html>`
    const url = URL.createObjectURL(new Blob([doc], { type: 'text/html;charset=utf-8' }))
    const win = window.open(url, '_blank', 'width=960,height=820,menubar=no,toolbar=no')
    if (!win) { URL.revokeObjectURL(url); alert('Allow popups for PDF export') }
    else setTimeout(() => URL.revokeObjectURL(url), 120_000)
  }

  preview(filename: string, page: PageSettings | null): void {
    const p = page ?? { w: 816, h: 1056, pT: 96, pR: 96, pB: 96, pL: 96, preset: 'letter' as const }
    const docLh = (document.getElementById('docLineHeight') as HTMLInputElement | null)?.value || ''
    const lhRule = docLh ? `line-height:${docLh};` : ''
    const title = (filename || 'Preview') + ' — Preview'
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
${ARABIC_FONTS}
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;background:#e5e7eb}
  body{font-family:Calibri,Arial,${ARABIC_FONT_FAMILY},sans-serif;color:#111;padding:24px 0;${lhRule}}
  [dir=rtl],*:lang(ar){font-family:${ARABIC_FONT_FAMILY},sans-serif}
  .page{background:#fff;width:${p.w}px;min-height:${p.h || 'auto'}px;margin:0 auto 16px;padding:${p.pT}px ${p.pR}px ${p.pB}px ${p.pL}px;box-shadow:0 2px 12px rgba(0,0,0,.12);border-radius:2px}
  img{max-width:100%;height:auto}
  table{border-collapse:collapse}
  th,td{border:1px solid #888;padding:4px 8px}
  a{color:#1a73e8}
  p, li, th, td, h1, h2, h3, h4, h5, h6, blockquote { unicode-bidi: plaintext; }
  @media print{body{background:#fff;padding:0}.page{box-shadow:none;margin:0;border-radius:0;width:100%;padding:1in}}
</style></head><body><div class="page">${this.cleanHtml(this.root.innerHTML)}</div></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (!win) {
      URL.revokeObjectURL(url)
      throw new Error('Popup blocked — allow popups to use Preview')
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  private download(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
}
