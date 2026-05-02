import type { EditorApi } from '@/types/EditorApi'

export type CommandGroup =
  | 'inline'
  | 'block'
  | 'list'
  | 'align'
  | 'tools'
  | 'history'
  | 'link'

export interface EditorCommand {
  id: string
  icon: string
  label?: string
  title?: string
  group: CommandGroup
  run(api: EditorApi, value?: string): void
  isActive?(api: EditorApi): boolean
}
