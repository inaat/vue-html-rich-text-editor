import type { PageSettings } from '@/types'

export interface ImportResult {
  filename: string
  bytes: number
  imagesFound: number
  pageOverride: PageSettings | null
}

export class ImportService {
  constructor(
    private root: HTMLElement,
    private apiBase: string
  ) {}

  async importHtml(file: File, allFiles: File[] = []): Promise<ImportResult> {
    const raw = await this.readHtmlFile(file)
    let body = this.extractBody(raw)
    let styles = this.extractHeadStyles(raw)
    if (allFiles.length > 1) {
      const map = this.buildAssetMap(allFiles, file)
      body = this.rewriteAssetRefs(body, map)
      styles = this.rewriteAssetRefs(styles, map)
    }
    body = this.normaliseWordSystemColors(body)
    styles = this.normaliseWordSystemColors(styles)
    const filename = file.name.replace(/\.html?$/i, '')
    this.root.innerHTML = styles + `<div class="imported-html">${body}</div>`

    const wordPage = this.parseWordPageRule(styles)
    const pageOverride: PageSettings | null = wordPage ? {
      preset: 'custom',
      w: Math.round(wordPage.w!),
      h: Math.round(wordPage.h!),
      pT: Math.round(wordPage.pT ?? 96),
      pR: Math.round(wordPage.pR ?? 96),
      pB: Math.round(wordPage.pB ?? 96),
      pL: Math.round(wordPage.pL ?? 96)
    } : null

    return {
      filename,
      bytes: file.size,
      imagesFound: (body.match(/<img\b/gi) || []).length,
      pageOverride
    }
  }

  async convertDocx(file: File): Promise<{ html: string; filename: string; bytes: number; meta: any }> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${this.apiBase}/api/convert`, { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
  }

  async inspectDocx(file: File): Promise<unknown> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${this.apiBase}/api/inspect`, { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
  }

  private extractBody(raw: string): string {
    const m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(raw)
    return (m ? m[1] : raw).trim()
  }

  private extractHeadStyles(raw: string): string {
    const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(raw)
    if (!head) return ''
    return (head[1].match(/<style[\s\S]*?<\/style>/gi) || []).join('\n')
  }

  private async readHtmlFile(file: File): Promise<string> {
    const buf = new Uint8Array(await file.arrayBuffer())
    const declared = this.detectCharsetFromBytes(buf)
    const candidates = [declared, 'utf-8', 'windows-1256', 'windows-1252'].filter(Boolean) as string[]
    for (const enc of candidates) {
      try {
        const dec = new TextDecoder(enc, { fatal: false })
        const text = dec.decode(buf)
        if (!/�/.test(text)) return text
      } catch { /* try next */ }
    }
    return new TextDecoder('utf-8').decode(buf)
  }

  private detectCharsetFromBytes(bytes: Uint8Array): string | null {
    const head = new TextDecoder('latin1').decode(bytes.slice(0, 4096)).toLowerCase()
    let m = /<meta[^>]+charset\s*=\s*["']?([a-z0-9_\-]+)/i.exec(head)
    if (m) return m[1]
    m = /content\s*=\s*["'][^"']*charset\s*=\s*([a-z0-9_\-]+)/i.exec(head)
    return m ? m[1] : null
  }

  private buildAssetMap(files: File[], htmlFile: File): Map<string, string> {
    const map = new Map<string, string>()
    for (const f of files) {
      if (f === htmlFile) continue
      const url = URL.createObjectURL(f)
      map.set(f.name.toLowerCase(), url)
      const rel = ((f as any).webkitRelativePath || '').toLowerCase()
      if (rel) map.set(rel, url)
    }
    return map
  }

  private rewriteAssetRefs(html: string, assetMap: Map<string, string>): string {
    if (!assetMap.size) return html
    const lookup = (rawUrl: string): string | null => {
      if (!rawUrl || /^(https?:|data:|blob:|#)/i.test(rawUrl)) return null
      const decoded = decodeURIComponent(rawUrl).replace(/\\/g, '/')
      const candidates = [decoded.toLowerCase(), decoded.split('/').pop()!.toLowerCase()]
      for (const k of candidates) {
        if (assetMap.has(k)) return assetMap.get(k)!
      }
      return null
    }
    html = html.replace(/\b(src|href)\s*=\s*(["'])([^"']+)\2/gi, (m, attr, q, url) => {
      const blob = lookup(url)
      return blob ? `${attr}=${q}${blob}${q}` : m
    })
    html = html.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/gi, (m, q, url) => {
      const blob = lookup(url)
      return blob ? `url(${q}${blob}${q})` : m
    })
    return html
  }

  private normaliseWordSystemColors(s: string): string {
    return s
      .replace(/\bwindowtext\b/gi, '#000')
      .replace(/\bwindowframe\b/gi, '#000')
      .replace(/\bbuttonshadow\b/gi, '#808080')
      .replace(/\bbuttonface\b/gi, '#dcdcdc')
      .replace(/\binfobackground\b/gi, '#fffacd')
  }

  private parseLengthToPx(s: string): number | null {
    const m = /(-?[\d.]+)\s*([a-z%]*)/i.exec(String(s).trim())
    if (!m) return null
    const v = parseFloat(m[1])
    switch ((m[2] || 'px').toLowerCase()) {
      case 'in': return v * 96
      case 'cm': return v * 96 / 2.54
      case 'mm': return v * 96 / 25.4
      case 'pt': return v * 96 / 72
      case 'pc': return v * 16
      case 'px': default: return v
    }
  }

  private parseWordPageRule(stylesText: string): { w: number; h: number; pT?: number; pR?: number; pB?: number; pL?: number } | null {
    const blocks: string[] = []
    const re = /@page\b[^{]*\{([^}]+)\}/gi
    let m
    while ((m = re.exec(stylesText)) !== null) blocks.push(m[1])
    if (!blocks.length) return null
    for (const block of blocks) {
      const decls: Record<string, string> = {}
      block.split(';').forEach((d) => {
        const idx = d.indexOf(':')
        if (idx < 0) return
        const key = d.slice(0, idx).trim().toLowerCase()
        const val = d.slice(idx + 1).trim()
        if (key) decls[key] = val
      })
      const out: any = {}
      if (decls.size) {
        const parts = decls.size.split(/\s+/).filter((p) => /^[\d.]/.test(p))
        if (parts.length >= 2) {
          out.w = this.parseLengthToPx(parts[0])
          out.h = this.parseLengthToPx(parts[1])
        } else if (parts.length === 1) {
          out.w = out.h = this.parseLengthToPx(parts[0])
        }
      }
      if (decls.margin) {
        const parts = decls.margin.split(/\s+/).map((p) => this.parseLengthToPx(p)).filter((n) => n != null) as number[]
        if (parts.length === 1) [out.pT, out.pR, out.pB, out.pL] = [parts[0], parts[0], parts[0], parts[0]]
        else if (parts.length === 2) [out.pT, out.pR, out.pB, out.pL] = [parts[0], parts[1], parts[0], parts[1]]
        else if (parts.length === 3) [out.pT, out.pR, out.pB, out.pL] = [parts[0], parts[1], parts[2], parts[1]]
        else if (parts.length >= 4) [out.pT, out.pR, out.pB, out.pL] = parts
      }
      if (out.w && out.h) return out
    }
    return null
  }
}
