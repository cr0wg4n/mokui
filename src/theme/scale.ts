/** Named scales. Hosts can retheme by overriding the --mk-* custom properties. */
export const scale = {
  /** spacing: gap, padding. Theme vars: --mk-s-<name> */
  space: { none: '0', xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  /** font size. Theme vars: --mk-f-<name> */
  font: { xs: '11px', sm: '13px', md: '15px', lg: '18px', xl: '24px' },
  /** width / height. Theme vars: --mk-z-<name> */
  size: { xs: '24px', sm: '48px', md: '96px', lg: '160px', xl: '240px' },
  /** min column width for auto-reflow grids. Theme vars: --mk-m-<name> */
  min: { xs: '80px', sm: '120px', md: '200px', lg: '280px', xl: '400px' },
  /** container-query breakpoints (container width, mobile-first) */
  bp: { sm: '480px', md: '768px', lg: '1024px' },
} as const


export type Space = keyof typeof scale.space
export type FontSize = keyof typeof scale.font
export type Breakpoint = keyof typeof scale.bp

const SANS = 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif'

/** Every visual token a theme defines. Each is read through a CSS variable (--mk-<name>). */
export interface TokenSet {
  fg: string
  bg: string
  muted: string
  line: string
  fill: string
  accent: string
  'on-accent': string
  danger: string
  success: string
  warning: string
  info: string
  r: string
  'r-sm': string
  font: string
  shadow: string
  'shadow-lg': string
  backdrop: string
}
export type Token = keyof TokenSet

const modern: TokenSet = {
  fg: '#18181b', bg: '#ffffff', muted: '#71717a', line: '#e4e4e7', fill: '#f4f4f5',
  accent: '#18181b', 'on-accent': '#ffffff', danger: '#dc2626', success: '#16a34a', warning: '#d97706', info: '#2563eb',
  r: '12px', 'r-sm': '8px', font: SANS,
  shadow: '0 1px 2px rgba(0,0,0,.05),0 1px 3px rgba(0,0,0,.08)',
  'shadow-lg': '0 12px 32px rgba(0,0,0,.16),0 2px 6px rgba(0,0,0,.08)',
  backdrop: 'rgba(9,9,11,.45)',
}
const dark: TokenSet = {
  fg: '#fafafa', bg: '#09090b', muted: '#a1a1aa', line: '#27272a', fill: '#18181b',
  accent: '#fafafa', 'on-accent': '#09090b', danger: '#f87171', success: '#4ade80', warning: '#fbbf24', info: '#60a5fa',
  r: '12px', 'r-sm': '8px', font: SANS,
  shadow: '0 1px 2px rgba(0,0,0,.4)', 'shadow-lg': '0 12px 32px rgba(0,0,0,.6)', backdrop: 'rgba(0,0,0,.6)',
}
const wire: TokenSet = {
  fg: '#222222', bg: '#ffffff', muted: '#777777', line: '#bbbbbb', fill: '#f2f2f2',
  accent: '#222222', 'on-accent': '#ffffff', danger: '#222222', success: '#222222', warning: '#222222', info: '#222222',
  r: '4px', 'r-sm': '3px', font: SANS,
  shadow: 'none', 'shadow-lg': 'none', backdrop: 'rgba(0,0,0,.25)',
}

/** Built-in themes, plus any registered with `defineTheme`. */
export const themes: Record<string, TokenSet> = { modern, dark, wire }
export type ThemeName = string
export const TOKENS = Object.keys(modern) as Token[]

/**
 * Tokens a user can choose separately from the theme (accent, radius, font). A theme defines them as
 * `var(--mk-u-<token>, <theme value>)`, so an `accent=indigo` set on any ancestor survives a nested theme.
 */
export const USER_TOKENS: Token[] = ['accent', 'on-accent', 'r', 'r-sm', 'font']
const isUser = (t: string) => (USER_TOKENS as string[]).includes(t)

/** `var(--mk-<token>, <modern default>)`: modern is the default, any theme overrides the variable. */
export const v = (t: Token) => (isUser(t) ? `var(--mk-${t},var(--mk-u-${t},${modern[t]}))` : `var(--mk-${t},${modern[t]})`)

/** The declarations (`--mk-fg:#fff`, ...) that make up a theme. */
export const themeVars = (tokens: TokenSet): string[] =>
  (Object.keys(tokens) as Token[]).map((k) => `--mk-${k}:${isUser(k) ? `var(--mk-u-${k},${tokens[k]})` : tokens[k]}`)

/** Named accents: [light, dark]. The dark value is lighter so it reads on a dark surface. */
export const accents: Record<string, [string, string]> = {
  zinc: ['#18181b', '#fafafa'],
  blue: ['#2563eb', '#60a5fa'],
  indigo: ['#4f46e5', '#818cf8'],
  violet: ['#7c3aed', '#a78bfa'],
  pink: ['#db2777', '#f472b6'],
  rose: ['#e11d48', '#fb7185'],
  red: ['#dc2626', '#f87171'],
  orange: ['#ea580c', '#fb923c'],
  amber: ['#d97706', '#fbbf24'],
  green: ['#16a34a', '#4ade80'],
  emerald: ['#059669', '#34d399'],
  teal: ['#0d9488', '#2dd4bf'],
  cyan: ['#0891b2', '#22d3ee'],
}
/** Corner roundness presets: [containers, controls]. */
export const radii: Record<string, [string, string]> = { sharp: ['2px', '2px'], soft: ['12px', '8px'], round: ['20px', '12px'] }
export const fonts: Record<string, string> = {
  sans: SANS,
  serif: 'ui-serif,Georgia,Cambria,"Times New Roman",serif',
  mono: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
}

/** Called when `defineTheme` registers a theme, so already-created elements get its CSS. */
export const themeListeners = new Set<(name: string) => void>()
