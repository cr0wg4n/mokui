/** Named scales. Hosts can retheme by overriding the --mk-* custom properties. */
export const scale = {
  space: { none: '0', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  font: { xs: '11px', sm: '13px', md: '15px', lg: '18px', xl: '24px' },
} as const

export type Space = keyof typeof scale.space
export type FontSize = keyof typeof scale.font

const attr = (name: string, prop: string, map: Record<string, string>, token: string) =>
  Object.keys(map)
    .map((k) => `:host([${name}="${k}"]){${prop}:var(--mk-${token}-${k},${map[k]})}`)
    .join('')

const align: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' }
const justify: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }

const css =
  ':host{display:block;box-sizing:border-box;font-family:system-ui,sans-serif;color:#222}' +
  attr('g', 'gap', scale.space, 's') +
  attr('p', 'padding', scale.space, 's') +
  attr('align', 'align-items', align, 'a') +
  attr('justify', 'justify-content', justify, 'j') +
  attr('s', 'font-size', scale.font, 'f')

let sheet: CSSStyleSheet | undefined

/** One shared constructable stylesheet adopted by every element's shadow root. */
export function adopt(root: ShadowRoot, extra = ''): void {
  sheet ??= new CSSStyleSheet()
  if (!sheet.cssRules.length) sheet.replaceSync(css)
  const own = new CSSStyleSheet()
  own.replaceSync(extra)
  root.adoptedStyleSheets = [sheet, own]
}
