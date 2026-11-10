import type { Plugin } from 'vite'
import { html } from './dsl/compile'

/** Import `.mk` files as HTML strings: `import page from './page.mk'`. */
export function mokui(): Plugin {
  return {
    name: 'mokui',
    transform(code, id) {
      if (!id.endsWith('.mk')) return
      return { code: `export default ${JSON.stringify(html(code))}`, map: null }
    },
  }
}
