import { accents, scale, themes, v } from '../theme/scale'
import type { AttrDef } from './types'

const rulesFrom = (map: Record<string, string>, prop: string, token: string) =>
  Object.fromEntries(Object.entries(map).map(([k, val]) => [k, `${prop}:var(--mk-${token}-${k},${val})`]))

const space = (prop: string) => rulesFrom(scale.space, prop, 's')
const decl = (prop: string, m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, val]) => [k, `${prop}:${val}`]))

export const A = {
  g: { doc: 'gap between children', responsive: true, rules: space('gap') },
  p: { doc: 'padding', responsive: true, rules: space('padding') },
  align: { doc: 'cross-axis alignment', rules: decl('align-items', { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' }) },
  justify: { doc: 'main-axis distribution', rules: decl('justify-content', { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }) },
  wrap: { doc: 'allow wrapping', flag: 'flex-wrap:wrap' },
  grow: { doc: 'take remaining space', flag: 'flex:1 1 0;min-width:0' },
  bottom: { doc: 'push to the bottom edge of a column or frame', flag: 'margin-top:auto' },
  dir: { doc: 'direction (switch layout at a breakpoint)', responsive: true, rules: { row: 'flex-direction:row', col: 'flex-direction:column' } },
  w: { doc: 'width', responsive: true, rules: { ...rulesFrom(scale.size, 'width', 'z'), full: 'width:100%' } },
  h: { doc: 'height', rules: { ...rulesFrom(scale.size, 'height', 'z'), full: 'height:100%' } },
  s: { doc: 'font size', rules: rulesFrom(scale.font, 'font-size', 'f') },
} satisfies Record<string, AttrDef>

/** Intent and look attributes available on every tag. They never affect structure. */
export const INTENT: Record<string, AttrDef> = {
  name: { doc: 'identifier, e.g. #login-btn', free: true },
  role: { doc: 'semantic role, also the ARIA role', free: true },
  note: { doc: 'requirement note shown in the outline', free: true },
  theme: { doc: 'look for this subtree', rules: Object.fromEntries(Object.keys(themes).map((k) => [k, ''])) },
  accent: { doc: 'accent color for this subtree', rules: Object.fromEntries(Object.keys(accents).map((k) => [k, ''])) },
  radius: { doc: 'corner roundness', rules: { sharp: '', soft: '', round: '' } },
  font: { doc: 'typeface', rules: { sans: '', serif: '', mono: '' } },
}

/** Declared interactions, available on every tag. Targets are `#name` of a stateful element. */
export const INTERACT: Record<string, AttrDef> = {
  opens: { doc: 'click opens #name', free: true },
  toggles: { doc: 'click toggles #name', free: true },
  closes: { doc: 'click closes the enclosing overlay (flag) or #name', free: true },
}

export const withBare = (d: AttrDef): AttrDef => ({ ...d, bare: true })
export const num = (xs: number[]) => Object.fromEntries(xs.map((n) => [String(n), '']))
/** A 1px border in the theme's line color. */
export const line = `1px solid ${v('line')}`
