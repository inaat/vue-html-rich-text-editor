export class ImageService {
  constructor(private root: HTMLElement) {}

  wrapImage(img: HTMLImageElement): HTMLElement | null {
    if (!img || !img.parentNode) return null
    if (img.parentElement?.classList.contains('img-handle-wrap')) return img.parentElement
    const wrap = document.createElement('span')
    wrap.className = 'img-handle-wrap'
    wrap.setAttribute('contenteditable', 'false')
    img.parentNode.insertBefore(wrap, img)
    wrap.appendChild(img)
    for (const c of ['tl', 'tr', 'bl', 'br'] as const) {
      const h = document.createElement('span')
      h.className = 'img-handle ' + c
      h.dataset.corner = c
      wrap.appendChild(h)
    }
    return wrap
  }

  wrapAll(): void {
    for (const img of this.root.querySelectorAll('img')) {
      if (!img.closest('.img-handle-wrap')) this.wrapImage(img as HTMLImageElement)
    }
  }

  clearAlign(wrap: HTMLElement): void {
    wrap.classList.remove('align-left', 'align-right', 'align-center', 'align-block', 'is-block')
    const parent = wrap.parentElement
    if (parent && parent !== this.root && parent.dataset.imgAlign) {
      parent.style.removeProperty('text-align')
      delete parent.dataset.imgAlign
    }
  }

  setParentAlign(wrap: HTMLElement, val: string): void {
    const parent = wrap.parentElement
    if (!parent || parent === this.root) return
    parent.style.setProperty('text-align', val, 'important')
    parent.dataset.imgAlign = val
  }

  setSizePct(wrap: HTMLElement, pct: number): void {
    const img = wrap.querySelector('img') as HTMLImageElement | null
    if (!img || !img.naturalWidth) return
    img.style.width = Math.round(img.naturalWidth * pct / 100) + 'px'
    img.style.height = 'auto'
  }

  resetSize(wrap: HTMLElement): void {
    const img = wrap.querySelector('img') as HTMLImageElement | null
    if (!img) return
    img.style.removeProperty('width')
    img.style.removeProperty('height')
  }

  applyCustomSize(wrap: HTMLElement, value: string): void {
    const img = wrap.querySelector('img') as HTMLImageElement | null
    if (!img) return
    img.style.width = /^\d+(\.\d+)?$/.test(value.trim()) ? value.trim() + 'px' : value.trim()
    img.style.height = 'auto'
  }

  alignLeft(wrap: HTMLElement): void { this.clearAlign(wrap); wrap.classList.add('align-left') }
  alignRight(wrap: HTMLElement): void { this.clearAlign(wrap); wrap.classList.add('align-right') }
  alignCenter(wrap: HTMLElement): void { this.clearAlign(wrap); wrap.classList.add('align-center'); this.setParentAlign(wrap, 'center') }
  alignBlock(wrap: HTMLElement): void {
    this.clearAlign(wrap)
    wrap.classList.add('align-block', 'is-block')
    const img = wrap.querySelector('img') as HTMLImageElement | null
    img?.style.removeProperty('width')
    img?.style.removeProperty('height')
  }
}
