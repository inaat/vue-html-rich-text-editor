import type { App } from 'vue'
import DocxEditor from './components/DocxEditor.vue'

export interface InstallOptions {
  componentName?: string
}

export const RichTextEditorPlugin = {
  install(app: App, options: InstallOptions = {}): void {
    app.component(options.componentName ?? 'DocxEditor', DocxEditor)
  }
}
