import type { SelectionService } from './SelectionService'

export type TableAction =
  | 'row-above' | 'row-below' | 'row-del'
  | 'col-left' | 'col-right' | 'col-del'
  | 'merge-right' | 'merge-down' | 'merge-row' | 'merge-col' | 'split-cell'
  | 'table-dir' | 'table-del'

export interface TableContext {
  table: HTMLTableElement | null
  cell: HTMLTableCellElement | null
}

export class TableService {
  constructor(private selection: SelectionService) {}

  current(): TableContext {
    const sel = window.getSelection()
    const node = sel?.rangeCount ? sel.anchorNode : null
    return {
      table: node ? this.selection.closestTable(node) : null,
      cell: node ? this.selection.closestCell(node) : null
    }
  }

  run(action: TableAction, ctx: TableContext = this.current()): void {
    let { table, cell } = ctx
    if (!table) return

    if (action === 'table-dir') {
      table.setAttribute('dir', table.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl')
      return
    }
    if (action === 'table-del') {
      table.remove()
      return
    }
    if (!cell) return

    const row = cell.parentNode as HTMLTableRowElement
    const colIdx = Array.from(row.children).indexOf(cell)
    const tbody = row.parentNode as HTMLElement

    const newRow = (): HTMLTableRowElement => {
      const tr = document.createElement('tr')
      for (let i = 0; i < row.children.length; i++) {
        const td = document.createElement('td')
        td.appendChild(document.createElement('br'))
        tr.appendChild(td)
      }
      return tr
    }

    switch (action) {
      case 'row-above': tbody.insertBefore(newRow(), row); break
      case 'row-below': tbody.insertBefore(newRow(), row.nextSibling); break
      case 'row-del':   row.remove(); break
      case 'col-left':
      case 'col-right': {
        for (const r of table.querySelectorAll('tr')) {
          const tag = (r.parentNode as HTMLElement).tagName === 'THEAD' ? 'th' : 'td'
          const td = document.createElement(tag)
          td.appendChild(document.createElement('br'))
          const ref = r.children[colIdx]
          if (action === 'col-left') r.insertBefore(td, ref)
          else r.insertBefore(td, ref ? ref.nextSibling : null)
        }
        break
      }
      case 'col-del': {
        for (const r of table.querySelectorAll('tr')) {
          if (r.children[colIdx]) r.children[colIdx].remove()
        }
        break
      }
      case 'merge-right': {
        const next = cell.nextElementSibling as HTMLTableCellElement | null
        if (next) {
          cell.colSpan = (cell.colSpan || 1) + (next.colSpan || 1)
          while (next.firstChild) cell.appendChild(next.firstChild)
          next.remove()
        }
        break
      }
      case 'merge-down': {
        const nextRow = row.nextElementSibling as HTMLTableRowElement | null
        if (nextRow) {
          const below = nextRow.children[colIdx] as HTMLTableCellElement | undefined
          if (below) {
            cell.rowSpan = (cell.rowSpan || 1) + (below.rowSpan || 1)
            while (below.firstChild) cell.appendChild(below.firstChild)
            below.remove()
          }
        }
        break
      }
      case 'merge-row': {
        let sib = cell.nextElementSibling as HTMLTableCellElement | null
        while (sib) {
          cell.colSpan = (cell.colSpan || 1) + (sib.colSpan || 1)
          while (sib.firstChild) cell.appendChild(sib.firstChild)
          const after = sib.nextElementSibling as HTMLTableCellElement | null
          sib.remove()
          sib = after
        }
        let prev = cell.previousElementSibling as HTMLTableCellElement | null
        while (prev) {
          cell.colSpan = (cell.colSpan || 1) + (prev.colSpan || 1)
          while (prev.firstChild) cell.insertBefore(prev.firstChild, cell.firstChild)
          const before = prev.previousElementSibling as HTMLTableCellElement | null
          prev.remove()
          prev = before
        }
        break
      }
      case 'merge-col': {
        const allRows = Array.from(table.querySelectorAll('tr'))
        const startIdx = allRows.indexOf(row)
        let span = cell.rowSpan || 1
        for (let i = startIdx + 1; i < allRows.length; i++) {
          const r = allRows[i]
          const below = r.children[colIdx] as HTMLTableCellElement | undefined
          if (!below) break
          span += (below.rowSpan || 1)
          while (below.firstChild) cell.appendChild(below.firstChild)
          below.remove()
        }
        cell.rowSpan = span
        break
      }
      case 'split-cell': {
        const cs = cell.colSpan || 1
        const rs = cell.rowSpan || 1
        if (cs > 1) {
          cell.colSpan = 1
          for (let i = 1; i < cs; i++) {
            const td = document.createElement('td')
            td.appendChild(document.createElement('br'))
            row.insertBefore(td, cell.nextSibling)
          }
        }
        if (rs > 1) {
          cell.rowSpan = 1
          let r = row.nextElementSibling as HTMLTableRowElement | null
          for (let i = 1; i < rs && r; i++, r = r.nextElementSibling as HTMLTableRowElement | null) {
            const td = document.createElement('td')
            td.appendChild(document.createElement('br'))
            const ref = r.children[colIdx]
            if (ref) r.insertBefore(td, ref); else r.appendChild(td)
          }
        }
        break
      }
    }
  }

  changeCellType(cell: HTMLTableCellElement, want: 'td' | 'th'): HTMLTableCellElement {
    if (cell.tagName.toLowerCase() === want) return cell
    const repl = document.createElement(want) as HTMLTableCellElement
    while (cell.attributes.length) {
      const a = cell.attributes[0]
      repl.setAttribute(a.name, a.value)
      cell.removeAttribute(a.name)
    }
    while (cell.firstChild) repl.appendChild(cell.firstChild)
    cell.replaceWith(repl)
    return repl
  }
}
