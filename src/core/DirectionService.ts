import { RTL_RE, RTL_RE_G } from '@/core/Constants'

export class DirectionService {
  static autoDirection(root: HTMLElement): void {
    for (const t of root.querySelectorAll('table')) {
      if (t.hasAttribute('dir')) continue
      const text = t.textContent || ''
      const rtl = (text.match(RTL_RE_G) || []).length
      const ltr = (text.match(/[A-Za-z]/g) || []).length
      if (rtl > 0 && rtl >= ltr * 0.5) t.setAttribute('dir', 'rtl')
    }
    for (const el of root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, blockquote, li')) {
      if (el.hasAttribute('dir')) continue
      const t = (el.textContent || '').trim()
      if (RTL_RE.test(t.charAt(0))) el.setAttribute('dir', 'rtl')
    }
  }

  static setBlockDir(block: HTMLElement | null, dir: 'ltr' | 'rtl'): void {
    if (block) block.setAttribute('dir', dir)
  }
}
