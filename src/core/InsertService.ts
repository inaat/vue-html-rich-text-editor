import type { SelectionService } from './SelectionService'

export class InsertService {
  constructor(private selection: SelectionService) {}

  htmlAtCursor(html: string): void {
    this.selection.ensure()
    document.execCommand('insertHTML', false, html)
  }

  table(rows: number, cols: number): void {
    if (!rows || !cols) return
    let html = '<table><tbody>'
    for (let i = 0; i < rows; i++) {
      html += '<tr>'
      for (let j = 0; j < cols; j++) html += '<td><br></td>'
      html += '</tr>'
    }
    html += '</tbody></table><p><br></p>'
    this.htmlAtCursor(html)
  }

  link(url: string): void {
    this.selection.ensure()
    document.execCommand('createLink', false, url)
  }

  video(url: string): void {
    if (!url) return
    let embed: string
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (yt) embed = `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe></div>`
    else if (vm) embed = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vm[1]}" allowfullscreen></iframe></div>`
    else embed = `<video controls src="${url}"></video>`
    this.htmlAtCursor(embed)
  }

  embed(html: string): void {
    if (html) this.htmlAtCursor(html)
  }

  symbol(char: string): void {
    if (char) this.htmlAtCursor(char)
  }

  math(tex: string): void {
    if (tex) this.htmlAtCursor(`<span class="math-tex">\\(${tex}\\)</span>`)
  }

  pageBreak(): void {
    this.htmlAtCursor('<div class="pagebreak" contenteditable="false"><span class="pb-label">Page break</span><button type="button" class="pb-delete" title="Delete page break" aria-label="Delete page break">×</button></div><p><br></p>')
  }

  inlineCode(text: string): void {
    this.htmlAtCursor(`<code>${text || 'code'}</code>`)
  }

  hr(): void {
    this.selection.ensure()
    document.execCommand('insertHorizontalRule')
  }

  imageFromFile(file: File): Promise<void> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        this.htmlAtCursor(`<img src="${reader.result}" alt="${file.name}">`)
        resolve()
      }
      reader.readAsDataURL(file)
    })
  }

  imageFromUrl(url: string): void {
    if (url) this.htmlAtCursor(`<img src="${url}" alt="">`)
  }

  fileLinkFromFile(file: File): Promise<void> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        this.htmlAtCursor(`<a href="${reader.result}" download="${file.name}">${file.name}</a>`)
        resolve()
      }
      reader.readAsDataURL(file)
    })
  }
}

export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.accept = accept
    inp.onchange = () => resolve(inp.files?.[0] ?? null)
    inp.click()
  })
}
