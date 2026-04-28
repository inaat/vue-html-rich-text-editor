import type { EditorCommand } from './EditorCommand'

export interface RichTextEditorProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  commands?: EditorCommand[]
}

export interface RichTextEditorEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}
