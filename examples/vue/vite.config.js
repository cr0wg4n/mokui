import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { mokui } from 'mokui/vite'

export default defineConfig({
  plugins: [
    mokui(), // lets you `import page from './screen.mk'`
    vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('mk-') } } }),
  ],
})
