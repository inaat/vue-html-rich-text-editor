import { STORAGE_KEY } from './Constants'

export interface Draft {
  filename: string
  html: string
  ts: number
}

export class DraftService {
  private timer: ReturnType<typeof setTimeout> | null = null

  scheduleSave(getDraft: () => Draft, delay = 700): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.save(getDraft()), delay)
  }

  save(draft: Draft): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch { /* storage full / disabled */ }
  }

  load(): Draft | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as Draft
    } catch {
      return null
    }
  }
}
