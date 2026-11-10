import { contrastOn, luminance } from './color'
import { accents, fonts, radii, scale, themes, themeVars, v } from './scale'
import type { TagSpec } from '../tags/types'

/** Styles shared by every element. */
/** CSS for one theme: its tokens, a background and text color, and the matching color-scheme. */
export const themeRule = (name: string): string => {
  const t = themes[name]!
  const dark = luminance(t.bg) < 0.25
  return `:host([theme="${name}"]){${themeVars(t).join(';')};background:${t.bg};color:${t.fg};color-scheme:${dark ? 'dark' : 'light'}}`
}

/** Accent, radius and font presets. They set `--mk-u-*`, which every theme reads, so they survive nested themes. */
const userCss = () =>
  Object.entries(accents).map(([n, [l, d]]) => `:host([accent="${n}"]){--mk-u-accent:light-dark(${l},${d});--mk-u-on-accent:light-dark(${contrastOn(l)},${contrastOn(d)})}`).join('') +
  Object.entries(radii).map(([n, [r, rs]]) => `:host([radius="${n}"]){--mk-u-r:${r};--mk-u-r-sm:${rs}}`).join('') +
  Object.entries(fonts).map(([n, f]) => `:host([font="${n}"]){--mk-u-font:${f}}`).join('')

/** Styles shared by every element. Built when elements are defined, so registered themes are included. */
export const baseCss = (): string =>
  `:host{display:block;box-sizing:border-box;font-family:${v('font')};color:${v('fg')};line-height:1.5;-webkit-font-smoothing:antialiased;text-align:start}` +
  ':host *{box-sizing:border-box}:host([hidden]){display:none !important}' +
  ':host([opens]),:host([toggles]),:host([closes]){cursor:pointer}' +
  Object.keys(themes).map(themeRule).join('') +
  userCss()

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
