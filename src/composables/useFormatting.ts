import { useEditorContext } from './useEditorContext'
import type { DropdownItem } from '../components/toolbar/ck-dropdown.vue'

export function useFormatting() {
  const ctx = useEditorContext()

  function applyBasic(kind: string) {
    switch (kind) {
      case 'sup':       ctx.engine.exec('superscript'); break
      case 'sub':       ctx.engine.exec('subscript'); break
      case 'code':      ctx.insert.inlineCode(window.getSelection()?.toString() ?? ''); break
      case 'strike':    ctx.engine.exec('strikeThrough'); break
      case 'underline': ctx.engine.exec('underline'); break
      case 'italic':    ctx.engine.exec('italic'); break
      case 'bold':      ctx.engine.exec('bold'); break
    }
  }

  function applyFontSize(size: string) {
    if (!size) { document.execCommand('removeFormat'); return }
    const before = new Set(ctx.root.querySelectorAll('font[size="7"]'))
    ctx.engine.exec('fontSize', '7')
    for (const font of ctx.root.querySelectorAll('font[size="7"]')) {
      if (before.has(font)) continue
      const span = document.createElement('span')
      span.style.fontSize = size + 'px'
      while (font.firstChild) span.appendChild(font.firstChild)
      font.replaceWith(span)
    }
    ctx.scheduleSave()
  }

  function applyFontFamily(family: string) {
    if (family) document.execCommand('fontName', false, family)
    else document.execCommand('removeFormat')
  }

  const fontSizeChildren: DropdownItem[] = [
    { label: '10',     style: 'font-size:10px', onClick: () => applyFontSize('10') },
    { label: '12',     style: 'font-size:12px', onClick: () => applyFontSize('12') },
    { label: '14',     style: 'font-size:14px', onClick: () => applyFontSize('14') },
    { label: 'Default',                         onClick: () => applyFontSize('') },
    { label: '18',     style: 'font-size:18px', onClick: () => applyFontSize('18') },
    { label: '20',     style: 'font-size:20px', onClick: () => applyFontSize('20') },
    { label: '22',     style: 'font-size:22px', onClick: () => applyFontSize('22') },
    { label: '24',     style: 'font-size:24px', onClick: () => applyFontSize('24') },
    { label: '36',     style: 'font-size:36px', onClick: () => applyFontSize('36') },
  ]

  const fontFamilyChildren: DropdownItem[] = [
    { label: 'Default',             onClick: () => applyFontFamily('') },
    { label: 'Arial',               style: 'font-family:Arial',                 onClick: () => applyFontFamily('Arial') },
    { label: 'Courier New',         style: 'font-family:"Courier New"',         onClick: () => applyFontFamily('Courier New') },
    { label: 'Georgia',             style: 'font-family:Georgia',               onClick: () => applyFontFamily('Georgia') },
    { label: 'Lucida Sans Unicode', style: 'font-family:"Lucida Sans Unicode"', onClick: () => applyFontFamily('Lucida Sans Unicode') },
    { label: 'Tahoma',              style: 'font-family:Tahoma',                onClick: () => applyFontFamily('Tahoma') },
    { label: 'Times New Roman',     style: 'font-family:"Times New Roman"',     onClick: () => applyFontFamily('Times New Roman') },
    { label: 'Trebuchet MS',        style: 'font-family:"Trebuchet MS"',        onClick: () => applyFontFamily('Trebuchet MS') },
    { label: 'Verdana',             style: 'font-family:Verdana',               onClick: () => applyFontFamily('Verdana') },
    { separator: true },
    { label: 'IBM Plex Arabic',     style: 'font-family:"IBM Plex Arabic"',     onClick: () => applyFontFamily('IBM Plex Arabic') },
    { label: 'Noto Sans Arabic',    style: 'font-family:"Noto Sans Arabic"',    onClick: () => applyFontFamily('Noto Sans Arabic') },
    { label: 'Cairo',               style: 'font-family:Cairo',                 onClick: () => applyFontFamily('Cairo') },
    { label: 'Amiri',               style: 'font-family:Amiri',                 onClick: () => applyFontFamily('Amiri') },
  ]

  return { applyBasic, applyFontSize, applyFontFamily, fontSizeChildren, fontFamilyChildren }
}
