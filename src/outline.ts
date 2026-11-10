import { expand } from './dsl/compile'
import { parse, type MkNode } from './dsl/parse'
import { print } from './dsl/print'

const INTERACTIVE = ['button', 'input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'slider']

function walk(nodes: MkNode[], fn: (n: MkNode) => void) {
  for (const n of nodes) {
    fn(n)
    walk(n.children, fn)
  }
}

const labelOf = (n: MkNode) => n.attrs.label ?? n.attrs.ph ?? n.text ?? n.attrs.opts ?? n.attrs.name ?? ''

/**
 * Structural view of a mock for an agent: canonical tree, then an inventory of
 * interactive elements and requirement notes. Recipes stay as written unless `expandRecipes`.
 */
export function outline(src: string, opts: { expandRecipes?: boolean } = {}): string {
  const parsed = parse(src)
  const nodes = opts.expandRecipes ? expand(parsed) : parsed
  let count = 0
  const inter: string[] = []
  const notes: string[] = []
  walk(nodes, (n) => {
    count++
    if (INTERACTIVE.includes(n.tag)) {
      const type = n.attrs.type ? `:${n.attrs.type}` : ''
      inter.push(`${n.tag}${type} "${labelOf(n)}"${n.attrs.name ? ` #${n.attrs.name}` : ''}`)
    }
    if (n.attrs.note) notes.push(`${n.attrs.name ? '#' + n.attrs.name : n.tag}: ${n.attrs.note}`)
  })
  const out = [`outline (${count} elements)`, print(nodes)]
  if (inter.length) out.push('', `interactive (${inter.length}):`, ...inter.map((s) => `  ${s}`))
  if (notes.length) out.push('', 'notes:', ...notes.map((s) => `  ${s}`))
  return out.join('\n')
}
