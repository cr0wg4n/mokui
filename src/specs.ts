import { INTENT, primitives, type AttrDef, type TagSpec } from './registry'
import { recipes } from './recipes'

export const all: TagSpec[] = [...primitives, ...recipes]
export const specs: Record<string, TagSpec> = Object.fromEntries(all.map((s) => [s.tag, s]))
export const isRecipe = (tag: string) => !!specs[tag]?.expand

/** Look up an attribute definition, including intent attrs and breakpoint variants (cols-md). */
export function attrDef(spec: TagSpec, name: string): AttrDef | undefined {
  if (Object.hasOwn(spec.attrs, name)) return spec.attrs[name]
  if (Object.hasOwn(INTENT, name)) return INTENT[name]
  const m = /^(.+)-(sm|md|lg)$/.exec(name)
  const base = m && Object.hasOwn(spec.attrs, m[1]!) ? spec.attrs[m[1]!] : undefined
  return base && base.responsive ? base : undefined
}
