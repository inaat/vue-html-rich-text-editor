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

  emoji(char: string): void {
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

  codeBlock(text?: string): void {
    const safe = (text || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
    this.htmlAtCursor(`<pre><code>${safe || '// code'}</code></pre><p><br></p>`)
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

  /* ── New design features ── */

  mergeField(name: string): void {
    if (!name) return
    const safe = name.trim().replace(/[<>]/g, '')
    this.htmlAtCursor(`<span class="merge-field" data-merge="${safe}" contenteditable="false">{{${safe}}}</span>&nbsp;`)
  }

  footnote(): void {
    const root = this.selection.root
    if (!root) return

    // Find or create the footnotes section at the bottom of the document
    let section = root.querySelector('.footnotes-section') as HTMLElement | null
    if (!section) {
      section = document.createElement('section')
      section.className = 'footnotes-section'
      section.setAttribute('contenteditable', 'false')
      section.innerHTML =
        '<div class="footnotes-divider"></div>' +
        '<div class="footnotes-badge">Footnotes</div>' +
        '<ol class="footnotes-list"></ol>'
      root.appendChild(section)
    }

    const list = section.querySelector('.footnotes-list') as HTMLOListElement
    const num = list.children.length + 1
    const refId = `fn-ref-${num}-${Math.random().toString(36).slice(2, 6)}`
    const noteId = `fn-${num}-${Math.random().toString(36).slice(2, 6)}`

    // 1) Insert the inline numbered superscript at the caret
    this.htmlAtCursor(
      `<sup class="footnote-ref" id="${refId}"><a href="#${noteId}">${num}</a></sup>`
    )

    // 2) Append a footnote item with an editable text field
    const li = document.createElement('li')
    li.className = 'footnote-item'
    li.id = noteId
    li.innerHTML =
      `<a href="#${refId}" class="footnote-back" contenteditable="false" title="Back to reference">^</a> ` +
      `<span class="footnote-text" contenteditable="true" data-placeholder="Footnote text…"></span>`
    list.appendChild(li)

    // 3) Move caret into the new editable footnote text
    const span = li.querySelector('.footnote-text') as HTMLElement
    if (span) {
      const range = document.createRange()
      range.selectNodeContents(span)
      range.collapse(true)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      span.focus?.()
    }
  }

  bookmark(name: string): void {
    if (!name) return
    const safe = name.trim().replace(/[^a-zA-Z0-9_-]/g, '-')
    this.htmlAtCursor(`<a id="bookmark-${safe}" class="bookmark" title="Bookmark: ${safe}"></a>`)
  }

  toc(): void {
    const root = this.selection.root
    if (!root) return
    const headings = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h4'))
    if (!headings.length) {
      this.htmlAtCursor('<div class="toc"><div class="toc-title">Table of contents</div><p><em>(No headings in document)</em></p></div>')
      return
    }
    const items = headings.map((h, i) => {
      const id = h.id || `toc-${i}-${Math.random().toString(36).slice(2, 6)}`
      h.id = id
      const lvl = Number(h.tagName.slice(1))
      return `<li class="toc-l${lvl}"><a href="#${id}">${h.textContent || ''}</a></li>`
    }).join('')
    this.htmlAtCursor(
      `<div class="toc"><div class="toc-title">Table of contents</div><ul class="toc-list">${items}</ul></div>`
    )
  }

  todoList(): void {
    this.htmlAtCursor(
      '<ul class="todo-list"><li class="todo-item"><label contenteditable="false"><input type="checkbox"></label><span class="todo-text">Task</span></li></ul>'
    )
  }

  multiLevelList(): void {
    this.htmlAtCursor(
      '<ol class="multilevel"><li>Item 1<ol><li>Item 1.1</li></ol></li><li>Item 2</li></ol>'
    )
  }

  template(name: string): void {
    const tpls: Record<string, string> = {
      'Signature (multi-line)':
        '<p>—<br>Best regards,<br><strong>Your Name</strong><br>Title · Company<br>email@example.com</p>',
      'Projections Table':
        '<table><thead><tr><th>Metric</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody><tr><td>Revenue</td><td></td><td></td><td></td><td></td></tr><tr><td>Costs</td><td></td><td></td><td></td><td></td></tr><tr><td>Net</td><td></td><td></td><td></td><td></td></tr></tbody></table>',
      'Balance Sheet':
        '<h3>Balance Sheet</h3><table><thead><tr><th>Assets</th><th>Amount</th></tr></thead><tbody><tr><td>Cash</td><td></td></tr><tr><td>Receivables</td><td></td></tr><tr><td>Inventory</td><td></td></tr></tbody></table>',
      'Company Letterhead':
        '<header><h2>Company Name</h2><p>Address line · Phone · email@example.com</p></header><hr><p>Date: ____________</p><p>Dear …,</p><p><br></p>'
    }
    const html = tpls[name]
    if (html) this.htmlAtCursor(html)
  }

  caseChange(mode: 'upper' | 'lower' | 'title' | 'sentence' | 'toggle'): void {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const text = sel.toString()
    if (!text) return
    let out = text
    switch (mode) {
      case 'upper': out = text.toUpperCase(); break
      case 'lower': out = text.toLowerCase(); break
      case 'title':
        out = text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
        break
      case 'sentence':
        out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
        break
      case 'toggle':
        out = text.split('').map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('')
        break
    }
    document.execCommand('insertText', false, out)
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
