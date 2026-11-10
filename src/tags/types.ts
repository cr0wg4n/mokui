/** Packs group tags so an agent loads only the reference it needs (constitution 2.9). */
export type Pack = 'core' | 'overlay' | 'forms' | 'feedback' | 'data' | 'nav'

/** One attribute of a tag. */
export interface AttrDef {
  doc: string
  /** Closed value set: value -> CSS declarations. Invalid values are rejected. */
  rules?: Record<string, string>
  /** Boolean flag (`bold`, `disabled`): present or absent. CSS applied when present. */
  flag?: string
  /** Free-text value (no CSS), e.g. label, placeholder, icon name. */
  free?: boolean
  /** A bare word that fits no closed set lands here (first free+bare attr wins). */
  bare?: boolean
  /** Also accepts `<attr>-sm|md|lg` container-query variants (mobile-first). */
  responsive?: boolean
  /** Required attribute: validation fails when missing. */
  required?: boolean
}

export interface TagSpec {
  tag: string
  doc: string
  /** Declarations for :host (primitives only). */
  css?: string
  /** Extra raw CSS appended to the generated sheet (shadow parts etc.). */
  extra?: string
  attrs: Record<string, AttrDef>
  /** Where quoted text goes: child text (default), or an attribute name. */
  text?: 'content' | string
  /** Default ARIA role set on the host. */
  role?: string
  /** Can be opened, closed or toggled by `opens` / `closes` / `toggles`. */
  stateful?: boolean
  /** Which attribute holds the state: `open` (default) or `closed` (visible unless `closed`). */
  stateAttr?: 'open' | 'closed'
  /** Covers the mount container (modal, drawer): the container needs room. */
  overlay?: boolean
  /** Only valid as a direct child of this tag (e.g. `menu` in `dropdown`). */
  within?: string
  /** Which pack documents this tag. The default cheat sheet covers `core` and `overlay`. */
  pack: Pack
  /** Recipe: expand into other nodes. Recipes have no element. */
  expand?: (node: RNode) => RNode[]
}

/** Minimal node shape shared with the parser (avoids a circular import). */
export interface RNode {
  tag: string
  attrs: Record<string, string>
  text?: string
  children: RNode[]
  line?: number
}

/** Give every spec of a group its pack, so a pack is declared where the tag lives. */
export const inPack = (pack: Pack, specs: Omit<TagSpec, 'pack'>[]): TagSpec[] => specs.map((s) => ({ ...s, pack }))
