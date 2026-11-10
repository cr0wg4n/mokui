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

/** Visual tokens per theme. Every value is read through a CSS custom property (--mk-<name>). */
export const themes = {
  modern: {
    fg: '#18181b', bg: '#ffffff', muted: '#71717a', line: '#e4e4e7', fill: '#f4f4f5',
    accent: '#18181b', 'on-accent': '#ffffff', danger: '#dc2626',
    r: '12px', 'r-sm': '8px',
    shadow: '0 1px 2px rgba(0,0,0,.05),0 1px 3px rgba(0,0,0,.08)',
    'shadow-lg': '0 12px 32px rgba(0,0,0,.16),0 2px 6px rgba(0,0,0,.08)',
    backdrop: 'rgba(9,9,11,.45)',
  },
  dark: {
    fg: '#fafafa', bg: '#09090b', muted: '#a1a1aa', line: '#27272a', fill: '#18181b',
    accent: '#fafafa', 'on-accent': '#09090b', danger: '#f87171',
    r: '12px', 'r-sm': '8px',
    shadow: '0 1px 2px rgba(0,0,0,.4)',
    'shadow-lg': '0 12px 32px rgba(0,0,0,.6)',
    backdrop: 'rgba(0,0,0,.6)',
  },
  wire: {
    fg: '#222222', bg: '#ffffff', muted: '#777777', line: '#bbbbbb', fill: '#f2f2f2',
    accent: '#222222', 'on-accent': '#ffffff', danger: '#222222',
    r: '4px', 'r-sm': '3px',
    shadow: 'none', 'shadow-lg': 'none',
    backdrop: 'rgba(0,0,0,.25)',
  },
} as const

export type ThemeName = keyof typeof themes
export type Token = keyof typeof themes.modern

/** `var(--mk-<token>, <modern default>)`: modern is the default, any theme overrides the variable. */
export const v = (t: Token) => `var(--mk-${t},${themes.modern[t]})`

/** Inline style that applies a theme to an element (for hosts that cannot set the `theme` attribute). */
export function themeStyle(name: ThemeName): Record<string, string> {
  const t = themes[name]
  return { ...Object.fromEntries(Object.entries(t).map(([k, val]) => [`--mk-${k}`, val])), background: t.bg, color: t.fg, colorScheme: name === 'dark' ? 'dark' : 'light' }
}
