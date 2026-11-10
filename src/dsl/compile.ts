import { specs } from '../specs'
import { MkError, parse, toHTML, type MkNode } from './parse'

/** Expand recipes (top-down) until only primitives remain. */
export function expand(nodes: MkNode[]): MkNode[] {
  return nodes.flatMap((n) => {
    const spec = specs[n.tag]
    if (spec?.expand) return expand(spec.expand(n))
    return [{ ...n, children: expand(n.children) }]
  })
}

export interface CompileOptions {
  /** Names of stateful elements to draw open (modal, drawer, dropdown, collapse, toast, sidebar...). */
  open?: string[]
}

const find = (nodes: MkNode[], name: string): MkNode | undefined => {
  for (const n of nodes) {
    if (n.attrs.name === name) return n
    const f = find(n.children, name)
    if (f) return f
  }
}

/** DSL source -> primitive-only node tree, optionally with some states drawn open. */
export function compile(src: string, opts: CompileOptions = {}): MkNode[] {
  const nodes = expand(parse(src))
  const errors: string[] = []
  for (const name of opts.open ?? []) {
    const n = find(nodes, name)
    if (!n) errors.push(`open: no element named #${name}`)
    else if (!specs[n.tag]?.stateful) errors.push(`open: #${name} is <${n.tag}>, which has no open state`)
    else if (specs[n.tag]!.stateAttr === 'closed') delete n.attrs.closed
    else n.attrs.open = ''
  }
  if (errors.length) throw new MkError(errors)
  return nodes
}

/** Does this tree contain an overlay (modal, drawer) that needs room in its container? */
export const hasOverlay = (nodes: MkNode[]): boolean => nodes.some((n) => specs[n.tag]?.overlay || hasOverlay(n.children))

/** DSL source -> HTML string of custom elements. */
export const html = (src: string, opts?: CompileOptions): string => toHTML(compile(src, opts))
