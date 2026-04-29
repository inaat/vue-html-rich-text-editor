import { ICONS } from '../icons/registry'

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
    pop.style.top = (window.scrollY + r.bottom + 4) + 'px'
    pop.style.left = (window.scrollX + r.left) + 'px'
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
