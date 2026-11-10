export interface MkNode {
  tag: string
  attrs: Record<string, string>
  text?: string
  children: MkNode[]
}

/** Bare (positional) tokens map to an attribute, per tag. */
const positional: Record<string, string> = { icon: 'n', text: 's' }

function tokenize(line: string, no: number): string[] {
  const out: string[] = []
  const re = /"((?:[^"\\]|\\.)*)"|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) out.push(m[1] !== undefined ? `"${m[1]}` : m[2]!)
  if (!out.length) throw new Error(`line ${no}: empty`)
  return out
}

/**
 * Indentation DSL (2 spaces per level):
 *   row g=md p=lg
 *     icon search
 *     text lg "Title"
 */
export function parse(src: string): MkNode[] {
  const roots: MkNode[] = []
  const stack: { node: MkNode; depth: number }[] = []
  src.split('\n').forEach((raw, i) => {
    if (!raw.trim() || raw.trim().startsWith('#')) return
    const no = i + 1
    const indent = raw.length - raw.trimStart().length
    if (indent % 2) throw new Error(`line ${no}: indent must be a multiple of 2 spaces`)
    const depth = indent / 2
    const [tag, ...rest] = tokenize(raw.trim(), no)
    const node: MkNode = { tag: tag!, attrs: {}, children: [] }
    for (const t of rest) {
      if (t.startsWith('"')) node.text = t.slice(1).replace(/\\"/g, '"')
      else if (t.includes('=')) {
        const [k, ...v] = t.split('=')
        node.attrs[k!] = v.join('=')
      } else if (positional[node.tag] && !(positional[node.tag]! in node.attrs)) {
        node.attrs[positional[node.tag]!] = t
      } else throw new Error(`line ${no}: unexpected "${t}" on <${node.tag}>`)
    }
    while (stack.length && stack[stack.length - 1]!.depth >= depth) stack.pop()
    if (depth > stack.length) throw new Error(`line ${no}: indent jumps more than one level`)
    ;(stack.length ? stack[stack.length - 1]!.node.children : roots).push(node)
    stack.push({ node, depth })
  })
  return roots
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

export function toHTML(nodes: MkNode[]): string {
  return nodes
    .map((n) => {
      const attrs = Object.entries(n.attrs).map(([k, v]) => ` ${k}="${esc(v)}"`).join('')
      return `<mk-${n.tag}${attrs}>${n.text ? esc(n.text) : ''}${toHTML(n.children)}</mk-${n.tag}>`
    })
    .join('')
}
