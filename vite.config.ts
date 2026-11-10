import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  
  resolve: { alias: { mokui: src('./src/index.ts') } },
  build: {
    lib: {
      entry: { index: src('./src/index.ts'), 'vite-plugin': src('./src/vite-plugin.ts') },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vite', /^node:/],
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'unit', environment: 'happy-dom', include: ['tests/unit/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.ts'],
          browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
        },
      },
    ],
  },
})
