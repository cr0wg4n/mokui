import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { mokui } from 'mokui/vite'

export default defineConfig({
  plugins: [
    mokui(), // lets you `import page from './page.mk'` (an HTML string)
    vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('mk-') } } }),
  ],
  server: { fs: { allow: ['../..'] } }, // the screens live in examples/screens
})
