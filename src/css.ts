import { scale } from './scale'
import type { TagSpec } from './registry'

/** Styles shared by every element. */
export const baseCss =
  ':host{display:block;box-sizing:border-box;font-family:system-ui,sans-serif;color:var(--mk-fg,#222)}' +
  ':host *{box-sizing:border-box}:host([hidden]){display:none}'

/** Generate the stylesheet for one tag from its spec. Attribute rules come first, then breakpoint variants. */
export function cssFor(spec: TagSpec): string {
  let out = `:host{${spec.css ?? ''}}`
  for (const [name, def] of Object.entries(spec.attrs)) {
    if (def.rules) for (const [v, decl] of Object.entries(def.rules)) out += `:host([${name}="${v}"]){${decl}}`
    if (def.flag !== undefined) out += `:host([${name}]){${def.flag}}`
  }
  for (const [bp, px] of Object.entries(scale.bp)) {
    let inner = ''
    for (const [name, def] of Object.entries(spec.attrs)) {
      if (def.responsive && def.rules) {
        for (const [v, decl] of Object.entries(def.rules)) inner += `:host([${name}-${bp}="${v}"]){${decl}}`
      }
    }
    if (inner) out += `@container (min-width:${px}){${inner}}`
  }
  return out + (spec.extra ?? '')
}
