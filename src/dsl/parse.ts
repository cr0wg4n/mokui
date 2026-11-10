import { INTENT, INTERACT, type RNode } from '../registry'
import { attrDef, specs } from '../specs'

export type MkNode = RNode

export class MkError extends Error {
  constructor(public errors: string[]) {
    super(errors.join('\n'))
    this.name = 'MkError'
  }
}

type Tok = { k: 'attr'; key: string; val: string } | { k: 'text'; val: string } | { k: 'bare'; val: string }

function tokenize(line: string): Tok[] {
  const out: Tok[] = []
  const re = /([\w-]+)=(?:"((?:[^"\\]|\\.)*)"|(\S+))|"((?:[^"\\]|\\.)*)"|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m[1] !== undefined) out.push({ k: 'attr', key: m[1], val: (m[2] ?? m[3])!.replace(/\\"/g, '"') })
    else if (m[4] !== undefined) out.push({ k: 'text', val: m[4].replace(/\\"/g, '"') })
    else out.push({ k: 'bare', val: m[5]! })
  }
  return out
}

const list = (xs: string[]) => xs.join(' ')

/**
 * Indentation DSL (2 spaces per level):
 *   row g=md p=lg #header
 *     icon search
 *     text lg "Title"
 * Collects every error (with line numbers) and throws one MkError.
 */
export function parse(src: string): MkNode[] {
  const roots: MkNode[] = []
  const errors: string[] = []
  const stack: { node: MkNode; depth: number }[] = []

  src.split('\n').forEach((raw, i) => {
    const t = raw.trim()
    if (!t || t.startsWith('//')) return
    const no = i + 1
    const err = (msg: string) => errors.push(`line ${no}: ${msg}`)
    const indent = raw.length - raw.trimStart().length
    if (indent % 2) return err('indent must be a multiple of 2 spaces')
    const depth = indent / 2

    const [first, ...rest] = tokenize(t)
    if (!first || first.k !== 'bare') return err('line must start with a tag')
    const spec = Object.hasOwn(specs, first.val) ? specs[first.val] : undefined
    if (!spec) return err(`unknown tag "${first.val}". Valid: ${list(Object.keys(specs))}`)

    const node: MkNode = { tag: spec.tag, attrs: {}, children: [], line: no }
    const setAttr = (key: string, val: string) => {
      const def = attrDef(spec, key)
      if (!def) return err(`<${spec.tag}> has no attribute "${key}". Valid: ${list([...Object.keys(spec.attrs), ...Object.keys(INTENT), ...Object.keys(INTERACT)])}`)
      if (def.flag !== undefined) {
        if (val === 'false') return
        node.attrs[key] = ''
        return
      }
      if (def.rules && !Object.hasOwn(def.rules, val)) return err(`<${spec.tag}> ${key}="${val}" invalid. Valid: ${list(Object.keys(def.rules))}`)
      node.attrs[key] = Object.hasOwn(INTERACT, key) ? val.replace(/^#/, '') : val
    }

    for (const tok of rest) {
      if (tok.k === 'attr') setAttr(tok.key, tok.val)
      else if (tok.k === 'text') {
        if (spec.text && spec.text !== 'content') node.attrs[spec.text] = tok.val
        else if (node.text !== undefined) err(`<${spec.tag}> has more than one quoted text`)
        else node.text = tok.val
      } else if (tok.val.startsWith('#') && tok.val.length > 1) {
        node.attrs.name = tok.val.slice(1)
      } else {
        // bare word: flag by name, closed-set attr marked bare, else first free bare attr
        const w = tok.val
        if (w === 'closes') {
          node.attrs.closes = ''
          continue
        }
        if (w === 'opens' || w === 'toggles') {
          err(`${w} needs a target, e.g. ${w}=#name`)
          continue
        }
        const flag = Object.hasOwn(spec.attrs, w) ? spec.attrs[w] : undefined
        if (flag && flag.flag !== undefined) node.attrs[w] = ''
        else {
          const closed = Object.entries(spec.attrs).find(([, d]) => d.bare && d.rules && Object.hasOwn(d.rules, w))
          if (closed) node.attrs[closed[0]] = w
          else {
            const free = Object.entries(spec.attrs).find(([k, d]) => d.bare && d.free && !(k in node.attrs))
            if (free) node.attrs[free[0]] = w
            else err(`<${spec.tag}> unexpected "${w}"`)
          }
        }
      }
    }
    for (const [k, d] of Object.entries(spec.attrs)) if (d.required && !(k in node.attrs)) err(`<${spec.tag}> needs ${k}`)

    while (stack.length && stack[stack.length - 1]!.depth >= depth) stack.pop()
    if (depth > stack.length) return err('indent jumps more than one level')
    const parent = stack.length ? stack[stack.length - 1]!.node : undefined
    if (spec.within && parent?.tag !== spec.within) err(`<${spec.tag}> must be directly inside <${spec.within}>`)
    ;(parent ? parent.children : roots).push(node)
    stack.push({ node, depth })
  })
  checkRefs(roots, errors)
  if (errors.length) throw new MkError(errors)
  return roots
}

/** Names must be unique; opens/toggles/closes must point at an element that can open and close. */
function checkRefs(roots: MkNode[], errors: string[]) {
  const named = new Map<string, MkNode>()
  const all: { node: MkNode; inOverlay: boolean }[] = []
  const walk = (nodes: MkNode[], inOverlay: boolean) => {
    for (const n of nodes) {
      all.push({ node: n, inOverlay })
      const nm = n.attrs.name
      if (nm) {
        const first = named.get(nm)
        if (first) errors.push(`line ${n.line}: duplicate name #${nm} (first used on line ${first.line})`)
        else named.set(nm, n)
      }
      walk(n.children, inOverlay || !!specs[n.tag]?.stateful)
    }
  }
  walk(roots, false)
  const statefulTags = Object.values(specs).filter((s) => s.stateful).map((s) => s.tag)
  for (const { node, inOverlay } of all) {
    for (const key of ['opens', 'toggles', 'closes'] as const) {
      const ref = node.attrs[key]
      if (ref === undefined) continue
      if (ref === '') {
        if (key !== 'closes') errors.push(`line ${node.line}: ${key} needs a target, e.g. ${key}=#name`)
        else if (!inOverlay) errors.push(`line ${node.line}: closes needs an enclosing overlay, or a target: closes=#name`)
        continue
      }
      const target = named.get(ref)
      if (!target) errors.push(`line ${node.line}: ${key}=#${ref} has no target. Names: ${[...named.keys()].join(' ') || '(none; add #name to the element)'}`)
      else if (!specs[target.tag]?.stateful) errors.push(`line ${node.line}: ${key}=#${ref} targets <${target.tag}>. Only ${statefulTags.join(' ')} can open or close`)
    }
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Nodes -> HTML custom elements. Run recipes through `compile` first. */
export function toHTML(nodes: MkNode[]): string {
  return nodes
    .map((n) => {
      const attrs = Object.entries(n.attrs).map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${esc(v)}"`)).join('')
      return `<mk-${n.tag}${attrs}>${n.text ? esc(n.text) : ''}${toHTML(n.children)}</mk-${n.tag}>`
    })
    .join('')
}
