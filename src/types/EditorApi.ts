export interface EditorApi {
  focus(): void
  getHTML(): string
  setHTML(html: string): void
  exec(command: string, value?: string): void
  isActive(command: string): boolean
}
