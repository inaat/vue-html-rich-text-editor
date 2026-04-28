import type { PageSettings } from '../types'

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
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{font-family:Calibri,Arial,sans-serif}
  table{border-collapse:collapse} th,td{border:1px solid #888;padding:4px 8px}
  </style></head><body>${this.cleanHtml(this.root.innerHTML)}</body></html>`
    const blob = new Blob(['﻿', html], { type: 'application/msword' })
    this.download(blob, `${filename}.doc`)
  }

  toHtmlPage(filename: string): void {
    const html = this.root.innerHTML
    const doc = `<!doctype html>
<html><head><meta charset="utf-8"><title>${filename}</title>
<style>
  @page { size: A4; margin: 1in; }
  html, body { background: #f5f6f8; }
  body { font: 11pt/1.4 Calibri, "Segoe UI", Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 24px 0; }
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

  toPdf(): void {
    window.print()
  }

  preview(filename: string, page: PageSettings | null): void {
    const p = page ?? { w: 816, h: 1056, pT: 96, pR: 96, pB: 96, pL: 96, preset: 'letter' as const }
    const docLh = (document.getElementById('docLineHeight') as HTMLInputElement | null)?.value || ''
    const lhRule = docLh ? `line-height:${docLh};` : ''
    const title = (filename || 'Preview') + ' — Preview'
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;background:#e5e7eb}
    body{font-family:Calibri,Arial,sans-serif;color:#111;padding:24px 0;${lhRule}}
    .page{background:#fff;width:${p.w}px;min-height:${p.h || 'auto'}px;margin:0 auto 16px;padding:${p.pT}px ${p.pR}px ${p.pB}px ${p.pL}px;box-shadow:0 2px 12px rgba(0,0,0,.12);border-radius:2px}
    img{max-width:100%;height:auto}
    table{border-collapse:collapse}
    th,td{border:1px solid #888;padding:4px 8px}
    a{color:#1a73e8}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none;margin:0;border-radius:0}}
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
