import { ICONS } from '../icons/registry'
import type { MergeFieldCategory, MergeFieldItem } from '../types/MergeField'

export interface PopupItem {
  label?: string
  shortcut?: string
  separator?: boolean
  disabled?: boolean
  icon?: string
  onClick?(): void
}

export class PopupService {
  private active: HTMLElement | null = null
  private outsideHandler: ((e: MouseEvent) => void) | null = null

  showMenu(anchor: HTMLElement, items: PopupItem[]): void {
    this.close()
    const pop = document.createElement('div')
    pop.className = 'tb-popup tb-menu'
    for (const it of items) {
      if (it.separator) {
        const sep = document.createElement('div')
        sep.className = 'tb-menu-sep'
        pop.appendChild(sep)
        continue
      }
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'tb-menu-item'
      if (it.disabled) b.setAttribute('disabled', '')
      if (it.icon && ICONS[it.icon]) {
        const def = ICONS[it.icon]
        const ico = document.createElement('span')
        ico.className = 'tb-menu-icon'
        ico.innerHTML = `<svg viewBox="${def.viewBox}" width="16" height="16" fill="currentColor" aria-hidden="true">${def.content}</svg>`
        b.appendChild(ico)
      }
      const label = document.createElement('span')
      label.className = 'tb-menu-label'
      label.textContent = it.label ?? ''
      b.appendChild(label)
      if (it.shortcut) {
        const k = document.createElement('span')
        k.className = 'tb-menu-shortcut'
        k.textContent = it.shortcut
        b.appendChild(k)
      }
      b.addEventListener('mousedown', (e) => e.preventDefault())
      b.addEventListener('click', () => {
        if (it.disabled) return
        this.close()
        it.onClick?.()
      })
      pop.appendChild(b)
    }
    this.position(pop, anchor)
  }

  showMergeFieldMenu(anchor: HTMLElement, categories: MergeFieldCategory[], onInsert: (item: MergeFieldItem) => void): void {
    this.close()
    const pop = document.createElement('div')
    pop.className = 'tb-popup tb-menu tb-merge-menu'

    const searchWrap = document.createElement('div')
    searchWrap.className = 'tb-menu-search-wrap'
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = 'Search merge field'
    searchInput.className = 'tb-menu-search'
    searchWrap.appendChild(searchInput)
    pop.appendChild(searchWrap)

    const listEl = document.createElement('div')
    listEl.className = 'tb-merge-list'
    pop.appendChild(listEl)

    const renderList = (query: string) => {
      listEl.innerHTML = ''
      const q = query.toLowerCase()
      for (const cat of categories) {
        const visible = cat.fields.filter(f =>
          !q || f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q)
        )
        if (!visible.length) continue
        const header = document.createElement('div')
        header.className = 'tb-menu-category'
        header.textContent = cat.label
        listEl.appendChild(header)
        for (const field of visible) {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'tb-menu-item'
          const label = document.createElement('span')
          label.className = 'tb-menu-label'
          label.textContent = field.label
          btn.appendChild(label)
          if (field.type === 'image') {
            const badge = document.createElement('span')
            badge.className = 'tb-merge-badge'
            badge.textContent = 'image'
            btn.appendChild(badge)
          }
          btn.addEventListener('mousedown', e => e.preventDefault())
          btn.addEventListener('click', () => { this.close(); onInsert(field) })
          listEl.appendChild(btn)
        }
      }
    }

    renderList('')
    searchInput.addEventListener('input', () => renderList(searchInput.value))
    this.position(pop, anchor)
    setTimeout(() => searchInput.focus(), 50)
  }

  showElementMenu(anchor: HTMLElement, onInsert: (tag: string, isBlock: boolean, content?: string) => void): void {
    this.close()
    const pop = document.createElement('div')
    pop.className = 'tb-popup tb-menu tb-elem-menu'

    const searchWrap = document.createElement('div')
    searchWrap.className = 'tb-menu-search-wrap'
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = 'Search element…'
    searchInput.className = 'tb-menu-search'
    searchWrap.appendChild(searchInput)
    pop.appendChild(searchWrap)

    const listEl = document.createElement('div')
    listEl.className = 'tb-merge-list'
    pop.appendChild(listEl)

    const CATS: Array<{ label: string; items: Array<{ tag: string; desc: string; isBlock: boolean; content?: string }> }> = [
      { label: 'Text / Block', items: [
        { tag: 'p',          desc: 'Paragraph',               isBlock: true },
        { tag: 'div',        desc: 'Generic container',        isBlock: true },
        { tag: 'h1',         desc: 'Heading 1',               isBlock: true },
        { tag: 'h2',         desc: 'Heading 2',               isBlock: true },
        { tag: 'h3',         desc: 'Heading 3',               isBlock: true },
        { tag: 'h4',         desc: 'Heading 4',               isBlock: true },
        { tag: 'h5',         desc: 'Heading 5',               isBlock: true },
        { tag: 'h6',         desc: 'Heading 6',               isBlock: true },
        { tag: 'blockquote', desc: 'Long quotation',           isBlock: true },
        { tag: 'pre',        desc: 'Preformatted / code block',isBlock: true },
      ]},
      { label: 'Layout', items: [
        { tag: 'section',    desc: 'Thematic section',         isBlock: true },
        { tag: 'article',    desc: 'Self-contained article',   isBlock: true },
        { tag: 'aside',      desc: 'Sidebar / aside',          isBlock: true },
        { tag: 'main',       desc: 'Main content area',        isBlock: true },
        { tag: 'header',     desc: 'Page or section header',   isBlock: true },
        { tag: 'footer',     desc: 'Page or section footer',   isBlock: true },
        { tag: 'nav',        desc: 'Navigation links',         isBlock: true },
        { tag: 'figure',     desc: 'Figure container',         isBlock: true },
        { tag: 'figcaption', desc: 'Figure caption',           isBlock: true },
        { tag: 'address',    desc: 'Contact information',      isBlock: true },
      ]},
      { label: 'Lists & Table', items: [
        { tag: 'ul',         desc: 'Unordered list',           isBlock: true, content: '<li><br></li>' },
        { tag: 'ol',         desc: 'Ordered list',             isBlock: true, content: '<li><br></li>' },
        { tag: 'li',         desc: 'List item',                isBlock: true },
        { tag: 'dl',         desc: 'Description list',         isBlock: true, content: '<dt>Term</dt><dd>Description</dd>' },
        { tag: 'dt',         desc: 'Description term',         isBlock: true },
        { tag: 'dd',         desc: 'Description detail',       isBlock: true },
        { tag: 'table',      desc: 'Table',                    isBlock: true, content: '<thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td><br></td><td><br></td></tr></tbody>' },
        { tag: 'thead',      desc: 'Table head section',       isBlock: true, content: '<tr><th>Header</th></tr>' },
        { tag: 'tbody',      desc: 'Table body section',       isBlock: true, content: '<tr><td><br></td></tr>' },
        { tag: 'tfoot',      desc: 'Table foot section',       isBlock: true, content: '<tr><td><br></td></tr>' },
        { tag: 'tr',         desc: 'Table row',                isBlock: true, content: '<td><br></td><td><br></td>' },
        { tag: 'td',         desc: 'Table data cell',          isBlock: true },
        { tag: 'th',         desc: 'Table header cell',        isBlock: true },
        { tag: 'caption',    desc: 'Table caption',            isBlock: true },
      ]},
      { label: 'Form', items: [
        { tag: 'form',       desc: 'Form element',             isBlock: true, content: '<p><label>Label <input type="text" name="field"></label></p>' },
        { tag: 'fieldset',   desc: 'Field group',              isBlock: true, content: '<legend>Group</legend><p><label>Field <input type="text"></label></p>' },
        { tag: 'legend',     desc: 'Fieldset caption',         isBlock: true },
        { tag: 'label',      desc: 'Form label',               isBlock: false },
        { tag: 'input',      desc: 'Input field',              isBlock: false, content: '' },
        { tag: 'textarea',   desc: 'Multi-line text input',    isBlock: false, content: '' },
        { tag: 'select',     desc: 'Dropdown select',          isBlock: false, content: '<option>Option 1</option><option>Option 2</option>' },
        { tag: 'option',     desc: 'Select option',            isBlock: false },
        { tag: 'optgroup',   desc: 'Option group',             isBlock: false, content: '<option>Option</option>' },
        { tag: 'button',     desc: 'Button',                   isBlock: false },
        { tag: 'datalist',   desc: 'Datalist (autocomplete)',  isBlock: false, content: '<option value="Option 1"><option value="Option 2">' },
        { tag: 'output',     desc: 'Form output',              isBlock: false },
        { tag: 'progress',   desc: 'Progress bar',             isBlock: false, content: '' },
        { tag: 'meter',      desc: 'Scalar measurement',       isBlock: false, content: '' },
      ]},
      { label: 'Media', items: [
        { tag: 'img',        desc: 'Image',                    isBlock: false, content: '' },
        { tag: 'video',      desc: 'Video player',             isBlock: true,  content: '<source src="" type="video/mp4">Your browser does not support video.' },
        { tag: 'audio',      desc: 'Audio player',             isBlock: true,  content: '<source src="" type="audio/mpeg">Your browser does not support audio.' },
        { tag: 'picture',    desc: 'Responsive image',         isBlock: false, content: '<source srcset=""><img src="" alt="">' },
        { tag: 'canvas',     desc: 'Drawing canvas',           isBlock: true,  content: 'Canvas not supported.' },
        { tag: 'iframe',     desc: 'Inline frame',             isBlock: true,  content: '' },
        { tag: 'object',     desc: 'External resource',        isBlock: true,  content: '' },
        { tag: 'embed',      desc: 'Embedded content',         isBlock: false, content: '' },
        { tag: 'svg',        desc: 'Inline SVG',               isBlock: false, content: '<circle cx="50" cy="50" r="40" fill="currentColor"/>' },
        { tag: 'map',        desc: 'Image map',                isBlock: false, content: '' },
      ]},
      { label: 'Interactive', items: [
        { tag: 'details',    desc: 'Expandable disclosure',    isBlock: true, content: '<summary>Summary</summary><p>Content…</p>' },
        { tag: 'summary',    desc: 'Details summary',          isBlock: true },
        { tag: 'dialog',     desc: 'Dialog / modal',           isBlock: true, content: '<p>Dialog content</p><button>Close</button>' },
        { tag: 'menu',       desc: 'Menu / toolbar',           isBlock: true, content: '<li><button>Action</button></li>' },
      ]},
      { label: 'Inline Text', items: [
        { tag: 'span',       desc: 'Inline container',         isBlock: false },
        { tag: 'a',          desc: 'Hyperlink / anchor',       isBlock: false },
        { tag: 'strong',     desc: 'Important (bold)',         isBlock: false },
        { tag: 'em',         desc: 'Emphasis (italic)',        isBlock: false },
        { tag: 'mark',       desc: 'Highlighted text',         isBlock: false },
        { tag: 'abbr',       desc: 'Abbreviation',             isBlock: false },
        { tag: 'time',       desc: 'Time / date',              isBlock: false },
        { tag: 'cite',       desc: 'Citation / reference',     isBlock: false },
        { tag: 'code',       desc: 'Inline code',              isBlock: false },
        { tag: 'kbd',        desc: 'Keyboard input',           isBlock: false },
        { tag: 'var',        desc: 'Variable name',            isBlock: false },
        { tag: 'samp',       desc: 'Sample output',            isBlock: false },
        { tag: 'small',      desc: 'Fine print / small text',  isBlock: false },
        { tag: 'q',          desc: 'Inline quotation',         isBlock: false },
        { tag: 'del',        desc: 'Deleted text',             isBlock: false },
        { tag: 'ins',        desc: 'Inserted text',            isBlock: false },
        { tag: 'sup',        desc: 'Superscript',              isBlock: false },
        { tag: 'sub',        desc: 'Subscript',                isBlock: false },
        { tag: 'dfn',        desc: 'Definition term',          isBlock: false },
        { tag: 'bdi',        desc: 'Bidirectional isolation',  isBlock: false },
        { tag: 'bdo',        desc: 'Bidirectional override',   isBlock: false },
        { tag: 'ruby',       desc: 'Ruby annotation',          isBlock: false },
        { tag: 'rt',         desc: 'Ruby text',                isBlock: false },
        { tag: 'rp',         desc: 'Ruby parenthesis',         isBlock: false },
        { tag: 'u',          desc: 'Underline (non-CSS)',       isBlock: false },
        { tag: 's',          desc: 'Strikethrough',            isBlock: false },
        { tag: 'i',          desc: 'Italic (non-semantic)',    isBlock: false },
        { tag: 'b',          desc: 'Bold (non-semantic)',      isBlock: false },
        { tag: 'wbr',        desc: 'Word break opportunity',   isBlock: false },
        { tag: 'br',         desc: 'Line break',               isBlock: false, content: '' },
        { tag: 'data',       desc: 'Machine-readable value',   isBlock: false },
      ]},
    ]

    const renderList = (query: string) => {
      listEl.innerHTML = ''
      const q = query.toLowerCase()
      for (const cat of CATS) {
        const visible = cat.items.filter(it => !q || it.tag.includes(q) || it.desc.toLowerCase().includes(q))
        if (!visible.length) continue
        const header = document.createElement('div')
        header.className = 'tb-menu-category'
        header.textContent = cat.label
        listEl.appendChild(header)
        for (const item of visible) {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'tb-menu-item'
          const tagEl = document.createElement('span')
          tagEl.className = 'tb-elem-tag'
          tagEl.textContent = `<${item.tag}>`
          btn.appendChild(tagEl)
          const desc = document.createElement('span')
          desc.className = 'tb-elem-desc'
          desc.textContent = item.desc
          btn.appendChild(desc)
          if (!item.isBlock) {
            const badge = document.createElement('span')
            badge.className = 'tb-merge-badge'
            badge.textContent = 'inline'
            btn.appendChild(badge)
          }
          btn.addEventListener('mousedown', e => e.preventDefault())
          btn.addEventListener('click', () => { this.close(); onInsert(item.tag, item.isBlock, item.content) })
          listEl.appendChild(btn)
        }
      }
    }

    renderList('')
    searchInput.addEventListener('input', () => renderList(searchInput.value))
    this.position(pop, anchor)
    setTimeout(() => searchInput.focus(), 50)
  }

  showTableGrid(anchor: HTMLElement, onPick: (rows: number, cols: number) => void): void {
    this.close()
    const MAX = 10
    const pop = document.createElement('div')
    pop.className = 'tb-popup tb-grid'
    const label = document.createElement('div')
    label.className = 'tb-grid-label'
    label.textContent = '0 × 0'
    const grid = document.createElement('div')
    grid.className = 'tb-grid-cells'
    grid.style.gridTemplateColumns = `repeat(${MAX}, 18px)`
    for (let r = 1; r <= MAX; r++) {
      for (let c = 1; c <= MAX; c++) {
        const cell = document.createElement('span')
        cell.className = 'tb-grid-cell'
        cell.dataset.r = String(r)
        cell.dataset.c = String(c)
        cell.addEventListener('mouseenter', () => {
          label.textContent = `${r} × ${c}`
          for (const el of Array.from(grid.children) as HTMLElement[]) {
            const er = +(el.dataset.r || 0)
            const ec = +(el.dataset.c || 0)
            el.classList.toggle('on', er <= r && ec <= c)
          }
        })
        cell.addEventListener('click', () => {
          this.close()
          onPick(r, c)
        })
        grid.appendChild(cell)
      }
    }
    pop.appendChild(grid)
    pop.appendChild(label)
    this.position(pop, anchor)
  }

  close(): void {
    if (this.active) {
      this.active.remove()
      this.active = null
    }
    if (this.outsideHandler) {
      document.removeEventListener('mousedown', this.outsideHandler, true)
      this.outsideHandler = null
    }
  }

  private position(pop: HTMLElement, anchor: HTMLElement): void {
    document.body.appendChild(pop)
    const r = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Horizontal: default align to anchor left, flip right if overflow
    let left = window.scrollX + r.left
    const popW = pop.offsetWidth || 300
    if (r.left + popW > vw) {
      left = window.scrollX + r.right - popW
      if (left < 0) left = 4
    }

    // Vertical: default below anchor, flip above if overflow
    let top = window.scrollY + r.bottom + 4
    const popH = pop.offsetHeight || 400
    if (r.bottom + popH > vh) {
      top = window.scrollY + r.top - popH - 4
      if (top < window.scrollY) top = window.scrollY + 4
    }

    pop.style.top = top + 'px'
    pop.style.left = left + 'px'
    this.active = pop
    this.outsideHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (this.active && !this.active.contains(target) && !target.closest('.tb')) {
        this.close()
      }
    }
    setTimeout(() => {
      if (this.outsideHandler) {
        document.addEventListener('mousedown', this.outsideHandler, true)
      }
    }, 0)
  }
}
