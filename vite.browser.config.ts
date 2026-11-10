import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// IIFE bundle used by the PNG renderer (window.mokui).
export default defineConfig({
  build: {
    outDir: 'dist/browser',
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'mokui',
      formats: ['iife'],
      fileName: () => 'mokui.iife.js',
    },
  },
})
