import { expand } from '../dsl/compile'
import { parse, type MkNode } from '../dsl/parse'
import { print } from '../dsl/print'
import { specs } from '../tags'

const INTERACTIVE = ['button', 'input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'slider', 'tabs', 'collapse', 'dropdown', 'popover', 'segmented', 'upload', 'otp']

function walk(nodes: MkNode[], fn: (n: MkNode) => void) {
  for (const n of nodes) {
    fn(n)
    walk(n.children, fn)
  }
}

const labelOf = (n: MkNode) => n.attrs.label ?? n.attrs.ph ?? n.text ?? n.attrs.opts ?? n.attrs.name ?? ''
const who = (n: MkNode) => `${n.tag}${labelOf(n) && labelOf(n) !== n.attrs.name ? ` "${labelOf(n)}"` : ''}${n.attrs.name ? ` #${n.attrs.name}` : ''}`

/**
 * Structural view of a mock for an agent: canonical tree, then an inventory of interactive
 * elements, the declared interactions, the states that can be drawn open, and requirement notes.
 * Recipes stay as written unless `expandRecipes`.
 */
export function outline(src: string, opts: { expandRecipes?: boolean } = {}): string {
  const parsed = parse(src)
  const nodes = opts.expandRecipes ? expand(parsed) : parsed
  let count = 0
  const inter: string[] = []
  const flows: string[] = []
  const states: string[] = []
  const notes: string[] = []
  walk(nodes, (n) => {
    count++
    if (INTERACTIVE.includes(n.tag)) {
      const type = n.attrs.type ? `:${n.attrs.type}` : ''
      inter.push(`${n.tag}${type} "${labelOf(n)}"${n.attrs.name ? ` #${n.attrs.name}` : ''}`)
    }
    const to: string[] = []
    if (n.attrs.closes !== undefined) to.push(n.attrs.closes ? `closes #${n.attrs.closes}` : 'closes its overlay')
    if (n.attrs.opens) to.push(`opens #${n.attrs.opens}`)
    if (n.attrs.toggles) to.push(`toggles #${n.attrs.toggles}`)
    if (to.length) flows.push(`${who(n)} -> ${to.join(', ')}`)
    const spec = specs[n.tag]
    if (spec?.stateful) {
      const start = spec.stateAttr === 'closed' ? (n.attrs.closed !== undefined ? 'starts closed' : 'starts open') : n.attrs.open !== undefined ? 'starts open' : 'starts closed'
      states.push(`${who(n)} (${start})`)
    }
    if (n.attrs.note) notes.push(`${n.attrs.name ? '#' + n.attrs.name : n.tag}: ${n.attrs.note}`)
  })
  const out = [`outline (${count} elements)`, print(nodes)]
  const section = (title: string, rows: string[]) => rows.length && out.push('', title, ...rows.map((s) => `  ${s}`))
  section(`interactive (${inter.length}):`, inter)
  section(`interactions (${flows.length}):`, flows)
  section('states (draw one open with: mokui render --open <name>):', states)
  section('notes:', notes)
  return out.join('\n')
}
