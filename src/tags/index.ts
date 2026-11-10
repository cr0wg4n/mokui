import { coreRecipes } from './core/recipes'
import { content } from './core/content'
import { controls } from './core/controls'
import { layout } from './core/layout'
import { chartTag } from './data/chart'
import { calendarTag } from './data/calendar'
import { dataMisc } from './data/misc'
import { dataRecipes } from './data/recipes'
import { feedback } from './feedback/primitives'
import { feedbackRecipes } from './feedback/recipes'
import { formControls } from './forms/controls'
import { formRecipes } from './forms/recipes'
import { navRecipes } from './nav/recipes'
import { dialogs } from './overlay/dialogs'
import { floating } from './overlay/floating'
import { panels } from './overlay/panels'
import { INTENT, INTERACT } from './shared'
import type { AttrDef, Pack, TagSpec } from './types'

/** Tags that become custom elements. */
export const primitives: TagSpec[] = [
  ...layout, ...content, ...controls,
  ...dialogs, ...floating, ...panels,
  ...formControls,
  ...feedback,
  ...chartTag, ...calendarTag, ...dataMisc,
]
/** Tags that expand into primitives before rendering. */
export const recipes: TagSpec[] = [...coreRecipes, ...formRecipes, ...feedbackRecipes, ...dataRecipes, ...navRecipes]

export const all: TagSpec[] = [...primitives, ...recipes]
export const specs: Record<string, TagSpec> = Object.fromEntries(all.map((s) => [s.tag, s]))
export const isRecipe = (tag: string) => !!specs[tag]?.expand

/** Look up an attribute definition, including intent and interaction attrs and breakpoint variants (cols-md). */
export function attrDef(spec: TagSpec, name: string): AttrDef | undefined {
  if (Object.hasOwn(spec.attrs, name)) return spec.attrs[name]
  if (Object.hasOwn(INTENT, name)) return INTENT[name]
  if (Object.hasOwn(INTERACT, name)) return INTERACT[name]
  const m = /^(.+)-(sm|md|lg)$/.exec(name)
  const base = m && Object.hasOwn(spec.attrs, m[1]!) ? spec.attrs[m[1]!] : undefined
  return base && base.responsive ? base : undefined
}

/**
 * Tags grouped by pack, derived from each spec's `pack`. The default cheat sheet covers `core` and `overlay`;
 * the parser accepts every tag whichever packs were documented.
 */
export const PACK_ORDER: Pack[] = ['core', 'overlay', 'forms', 'feedback', 'data', 'nav']
export const PACKS: Record<string, string[]> = Object.fromEntries(PACK_ORDER.map((p) => [p, all.filter((s) => s.pack === p).map((s) => s.tag)]))
export const DEFAULT_PACKS: Pack[] = ['core', 'overlay']
export const packOf = (tag: string): Pack | undefined => specs[tag]?.pack
