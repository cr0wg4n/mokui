import { compile, MkError, type MkNode } from '../src/core'

export interface Expect {
  /** Minimum count per tag (after recipes expand to primitives, recipes also counted as written). */
  tags?: Record<string, number>
  /** Each inner list: at least one of these tags must appear. */
  anyOf?: string[][]
  /** Strings that must appear in some text, label or placeholder. */
  text?: string[]
  minElements?: number
  /** A requirement note (note=...) must be present. */
  noted?: boolean
}

export interface Score {
  parses: boolean
  errors: string[]
  missing: string[]
  ok: boolean
}

import { parse } from '../src/core'

function flatten(nodes: MkNode[], out: MkNode[] = []): MkNode[] {
  for (const n of nodes) (out.push(n), flatten(n.children, out))
  return out
}

/** Strip a markdown code fence if the model added one. */
export function extractDsl(reply: string): string {
  const m = /```[a-z]*\n([\s\S]*?)```/.exec(reply)
  return (m ? m[1]! : reply).trim()
}

export function score(dsl: string, expect: Expect): Score {
  let written: MkNode[]
  try {
    written = parse(dsl)
    compile(dsl)
  } catch (e) {
    return { parses: false, errors: e instanceof MkError ? e.errors : [(e as Error).message], missing: [], ok: false }
  }
  const asWritten = flatten(written)
  const primitives = flatten(compile(dsl))
  const count = (tag: string) => asWritten.filter((n) => n.tag === tag).length || primitives.filter((n) => n.tag === tag).length
  const haystack = [...asWritten, ...primitives].flatMap((n) => [n.text, n.attrs.label, n.attrs.ph, n.attrs.opts, n.attrs.value]).filter(Boolean).join('\n').toLowerCase()
  const missing: string[] = []
  for (const [tag, min] of Object.entries(expect.tags ?? {})) if (count(tag) < min) missing.push(`${tag} x${min} (found ${count(tag)})`)
  for (const group of expect.anyOf ?? []) if (!group.some((t) => count(t) > 0)) missing.push(`one of ${group.join('|')}`)
  for (const t of expect.text ?? []) if (!haystack.includes(t.toLowerCase())) missing.push(`text "${t}"`)
  if (expect.minElements && asWritten.length < expect.minElements) missing.push(`>= ${expect.minElements} elements (found ${asWritten.length})`)
  if (expect.noted && !asWritten.some((n) => n.attrs.note)) missing.push('a note= on the highlighted element')
  return { parses: true, errors: [], missing, ok: missing.length === 0 }
}
