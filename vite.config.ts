import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueHtmlRichTextEditor',
      fileName: 'vue-html-rich-text-editor'
    },
    rollupOptions: {
      external: ['vue'],
      output: { globals: { vue: 'Vue' } }
    }
  }
})
