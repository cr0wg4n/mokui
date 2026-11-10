import { content, controls, INTENT, INTERACT, layout, type AttrDef, type TagSpec } from './registry'
import { extras } from './extras'
import { interactive } from './interactive'
import { recipes } from './recipes'

export const primitives: TagSpec[] = [...layout, ...content, ...controls, ...interactive, ...extras]

export const all: TagSpec[] = [...primitives, ...recipes]
export const specs: Record<string, TagSpec> = Object.fromEntries(all.map((s) => [s.tag, s]))
export const isRecipe = (tag: string) => !!specs[tag]?.expand

/** Look up an attribute definition, including intent attrs and breakpoint variants (cols-md). */
export function attrDef(spec: TagSpec, name: string): AttrDef | undefined {
  if (Object.hasOwn(spec.attrs, name)) return spec.attrs[name]
  if (Object.hasOwn(INTENT, name)) return INTENT[name]
  if (Object.hasOwn(INTERACT, name)) return INTERACT[name]
  const m = /^(.+)-(sm|md|lg)$/.exec(name)
  const base = m && Object.hasOwn(spec.attrs, m[1]!) ? spec.attrs[m[1]!] : undefined
  return base && base.responsive ? base : undefined
}

/** Tags grouped into packs. The default cheat sheet covers `core` and `overlay`; the parser accepts every tag. */
export const PACKS: Record<string, string[]> = {
  core: 'stack row grid box spacer divider scroll frame text link icon image avatar badge button input textarea select checkbox radio switch slider card navbar list table tr'.split(' '),
  overlay: 'modal drawer sidebar dropdown menu item popover tooltip toast collapse tabs tab'.split(' '),
  forms: 'segmented upload otp radios checkboxes'.split(' '),
  feedback: 'alert progress spinner skeleton rating chip empty stat'.split(' '),
  data: 'chart calendar timeline avatars code kbd video'.split(' '),
  nav: 'breadcrumb pagination steps tabbar toolbar command hero footer'.split(' '),
}
export const DEFAULT_PACKS = ['core', 'overlay']
export const packOf = (tag: string): string | undefined => Object.keys(PACKS).find((p) => PACKS[p]!.includes(tag))
