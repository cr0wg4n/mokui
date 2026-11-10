import { specs } from '../tags'
import type { MkNode } from './parse'

const q = (s: string) => `"${s.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
const val = (v: string) => (/^[^\s"]+$/.test(v) ? v : q(v))

/** Canonical DSL for a node tree (stable, round-trips through parse). */
export function print(nodes: MkNode[], depth = 0): string {
  return nodes
    .map((n) => {
      const spec = specs[n.tag]
      const parts: string[] = [n.tag]
      const textAttr = spec?.text && spec.text !== 'content' ? spec.text : undefined
      let freeBareUsed = false
      for (const [k, v] of Object.entries(n.attrs)) {
        if (k === 'name') continue
        if (k === textAttr) continue
        const def = spec?.attrs[k]
        if (k === 'opens' || k === 'toggles') parts.push(`${k}=#${v}`)
        else if (k === 'closes') parts.push(v === '' ? 'closes' : `closes=#${v}`)
        else if (v === '') parts.push(k)
        // Bare form only where the parser resolves it back to the same attribute.
        else if (def?.bare && def.rules && /^[^\s"=#]+$/.test(v)) parts.push(v)
        else if (def?.bare && def.free && !freeBareUsed && /^[^\s"=#]+$/.test(v) && !(v in (spec?.attrs ?? {}))) (parts.push(v), (freeBareUsed = true))
        else parts.push(`${k}=${val(v)}`)
      }
      if (n.attrs.name) parts.push(`#${n.attrs.name}`)
      const text = textAttr ? n.attrs[textAttr] : n.text
      if (text !== undefined) parts.push(q(text))
      return ['  '.repeat(depth) + parts.join(' '), ...(n.children.length ? [print(n.children, depth + 1)] : [])].join('\n')
    })
    .join('\n')
}
