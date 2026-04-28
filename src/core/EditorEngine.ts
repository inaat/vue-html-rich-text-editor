import type { EditorApi } from '../types'

export interface EditorEngine extends EditorApi {
  attach(element: HTMLElement): void
  detach(): void
}
