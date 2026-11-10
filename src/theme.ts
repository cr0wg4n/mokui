import { contrastOn, luminance, parseHex, themeFromColor, type FromColorOptions } from './color'
import { INTENT } from './registry'
import { accents, fonts, radii, themeListeners, themes, themeVars, TOKENS, type ThemeName, type TokenSet } from './scale'

/**
 * A theme is data: tokens, with no logic. Options combine a base theme with an accent (a named color or
 * a hex), a radius and a font, plus any token overrides.
 */
export interface ThemeOptions {
  /** Built-in or registered theme to start from (default `modern`). */
  base?: ThemeName
  /** A named accent (`indigo`, `emerald`, ...) or a hex color. */
  accent?: string
  radius?: 'sharp' | 'soft' | 'round'
  font?: 'sans' | 'serif' | 'mono'
  tokens?: Partial<TokenSet>
}
export type ThemeInput = ThemeName | ThemeOptions
/** The JSON shape of a theme file. `name` registers it for the `theme=` attribute. */
export type ThemeFile = ThemeOptions & { name?: string }

const names = (o: object) => Object.keys(o).join(' ')
const isDark = (t: TokenSet) => luminance(t.bg) < 0.25

function baseOf(name: string | undefined): TokenSet {
  const n = name ?? 'modern'
  const t = Object.hasOwn(themes, n) ? themes[n] : undefined
  if (!t) throw new Error(`unknown theme "${n}". Valid: ${names(themes)}`)
  return t
}

const accentColor = (accent: string, dark: boolean): [string, string] => {
  const preset = Object.hasOwn(accents, accent) ? accents[accent] : undefined
  const c = preset ? preset[dark ? 1 : 0] : accent
  if (!preset && !parseHex(c)) throw new Error(`unknown accent "${accent}". Valid: ${names(accents)} or a hex color like #4f46e5`)
  return [c, contrastOn(c)]
}
const radiusPair = (r: string) => {
  if (!Object.hasOwn(radii, r)) throw new Error(`unknown radius "${r}". Valid: ${names(radii)}`)
  return radii[r]!
}
const fontStack = (f: string) => {
  if (!Object.hasOwn(fonts, f)) throw new Error(`unknown font "${f}". Valid: ${names(fonts)}`)
  return fonts[f]!
}

/**
 * Inline style (custom properties plus background, color, color-scheme) that applies a theme to an
 * element. Accent, radius and font go into `--mk-u-*` variables, so they also reach nested themes.
 */
export function themeStyle(input: ThemeInput = 'modern'): Record<string, string> {
  const o: ThemeOptions = typeof input === 'string' ? { base: input } : input
  const tokens: TokenSet = { ...baseOf(o.base), ...o.tokens }
  const style: Record<string, string> = {}
  for (const decl of themeVars(tokens)) {
    const i = decl.indexOf(':')
    style[decl.slice(0, i)] = decl.slice(i + 1)
  }
  if (o.accent) {
    const preset = Object.hasOwn(accents, o.accent) ? accents[o.accent] : undefined
    if (preset) {
      // light-dark() lets a named accent adapt to a nested dark subtree
      style['--mk-u-accent'] = `light-dark(${preset[0]},${preset[1]})`
      style['--mk-u-on-accent'] = `light-dark(${contrastOn(preset[0])},${contrastOn(preset[1])})`
    } else {
      const [a, on] = accentColor(o.accent, isDark(tokens))
      style['--mk-u-accent'] = a
      style['--mk-u-on-accent'] = on
    }
  }
  if (o.radius) [style['--mk-u-r'], style['--mk-u-r-sm']] = radiusPair(o.radius) as [string, string]
  if (o.font) style['--mk-u-font'] = fontStack(o.font)
  return { ...style, background: tokens.bg, color: tokens.fg, colorScheme: isDark(tokens) ? 'dark' : 'light' }
}

/** The same theme as a CSS block for a host app: `:root{--mk-fg:...}`. */
export function themeCssText(input: ThemeInput = 'modern', selector = ':root'): string {
  const decls = Object.entries(themeStyle(input)).filter(([k]) => k.startsWith('--')).map(([k, val]) => `${k}:${val}`)
  return `${selector}{${decls.join(';')}}`
}

function resolveTokens(o: ThemeOptions): TokenSet {
  const t: TokenSet = { ...baseOf(o.base), ...o.tokens }
  if (o.accent) [t.accent, t['on-accent']] = accentColor(o.accent, isDark(t))
  if (o.radius) [t.r, t['r-sm']] = radiusPair(o.radius) as [string, string]
  if (o.font) t.font = fontStack(o.font)
  return t
}

/**
 * Register a custom theme for the `theme=` attribute. Existing and future elements get its CSS, the parser
 * accepts the name, and the cheat sheet lists it.
 */
export function defineTheme(name: string, options: ThemeOptions = {}): void {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`theme name "${name}" must be lowercase letters, digits and dashes, starting with a letter`)
  if (Object.hasOwn(themes, name)) throw new Error(`theme "${name}" already exists`)
  themes[name] = resolveTokens(options)
  INTENT.theme!.rules![name] = ''
  themeListeners.forEach((fn) => fn(name))
}

const FILE_KEYS = ['name', 'base', 'accent', 'radius', 'font', 'tokens']

/** Validate a parsed theme file; throws one error listing every problem. */
export function loadTheme(json: unknown): ThemeFile {
  const errors: string[] = []
  if (typeof json !== 'object' || json === null || Array.isArray(json)) throw new Error('theme file must be a JSON object')
  const o = json as Record<string, unknown>
  for (const k of Object.keys(o)) if (!FILE_KEYS.includes(k)) errors.push(`unknown key "${k}". Valid: ${FILE_KEYS.join(' ')}`)
  for (const k of ['name', 'base', 'accent', 'radius', 'font']) if (k in o && typeof o[k] !== 'string') errors.push(`"${k}" must be a string`)
  const check = (fn: () => unknown) => {
    try {
      fn()
    } catch (e) {
      errors.push((e as Error).message)
    }
  }
  if (typeof o.base === 'string') check(() => baseOf(o.base as string))
  if (typeof o.accent === 'string') check(() => accentColor(o.accent as string, false))
  if (typeof o.radius === 'string') check(() => radiusPair(o.radius as string))
  if (typeof o.font === 'string') check(() => fontStack(o.font as string))
  if ('tokens' in o) {
    if (typeof o.tokens !== 'object' || o.tokens === null || Array.isArray(o.tokens)) errors.push('"tokens" must be an object')
    else
      for (const [k, val] of Object.entries(o.tokens)) {
        if (!(TOKENS as string[]).includes(k)) errors.push(`unknown token "${k}". Valid: ${TOKENS.join(' ')}`)
        else if (typeof val !== 'string') errors.push(`token "${k}" must be a string`)
      }
  }
  if (errors.length) throw new Error(`invalid theme file:\n  ${errors.join('\n  ')}`)
  return o as ThemeFile
}

/** A theme file (ready to save as JSON) from one brand color. */
export function themeFile(color: string, opts: FromColorOptions & { name?: string; radius?: ThemeOptions['radius']; font?: ThemeOptions['font'] } = {}): ThemeFile {
  const file: ThemeFile = { base: opts.mode === 'dark' ? 'dark' : 'modern', tokens: themeFromColor(color, opts) }
  if (opts.name) file.name = opts.name
  if (opts.radius) file.radius = opts.radius
  if (opts.font) file.font = opts.font
  return { ...(file.name ? { name: file.name } : {}), base: file.base, ...(file.radius ? { radius: file.radius } : {}), ...(file.font ? { font: file.font } : {}), tokens: file.tokens }
}

export { themeFromColor }
