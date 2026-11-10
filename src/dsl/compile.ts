import { specs } from '../specs'
import { parse, toHTML, type MkNode } from './parse'

/** Expand recipes (top-down) until only primitives remain. */
export function expand(nodes: MkNode[]): MkNode[] {
  return nodes.flatMap((n) => {
    const spec = specs[n.tag]
    if (spec?.expand) return expand(spec.expand(n))
    return [{ ...n, children: expand(n.children) }]
  })
}

/** DSL source -> primitive-only node tree. */
export const compile = (src: string): MkNode[] => expand(parse(src))

/** DSL source -> HTML string of custom elements. */
export const html = (src: string): string => toHTML(compile(src))
