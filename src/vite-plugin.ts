import type { Plugin } from 'vite'
import { parse, toHTML } from './dsl/parse'

/** Import `.mk` files as HTML strings: `import html from './page.mk'`. */
export function mokui(): Plugin {
  return {
    name: 'mokui',
    transform(code, id) {
      if (!id.endsWith('.mk')) return
      return { code: `export default ${JSON.stringify(toHTML(parse(code)))}`, map: null }
    },
  }
}
