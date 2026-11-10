import type { RNode } from './types'

/** Small builders shared by every recipe: make nodes, split `A|B|C` and `a:b` strings. */
export const n = (tag: string, attrs: Record<string, string> = {}, children: RNode[] = [], text?: string): RNode => {
  const node: RNode = { tag, attrs, children }
  if (text !== undefined) node.text = text
  return node
}
/** Attributes every recipe passes to its outer node. */
export const carry = (a: Record<string, string>) =>
  Object.fromEntries(Object.entries(a).filter(([k]) => ['name', 'role', 'note', 'theme', 'opens', 'toggles', 'closes', 'w', 'h'].includes(k)))
export const items = (s: string | undefined) => (s ? s.split('|').map((x) => x.trim()) : [])

export const parts = (s: string | undefined) => (s ? s.split(':').map((x) => x.trim()) : [])
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
export const txt = (t: string, a: Record<string, string> = {}) => n('text', a, [], t)
/** An attribute that takes any text. */
export const free = (doc: string, bare = false) => ({ doc, free: true as const, bare })
