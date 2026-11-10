import type { TokenSet } from './scale'

/** Small color helpers (hex only, no dependencies). */
export function parseHex(input: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim())
  if (!m) return null
  let h = m[1]!
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')).join('')

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [R, G, B] = [r / 255, g / 255, b / 255]
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  return [h * 60, s * 100, l * 100]
}

export function hslToHex(h: number, s: number, l: number): string {
  const S = Math.min(100, Math.max(0, s)) / 100
  const L = Math.min(100, Math.max(0, l)) / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = S * Math.min(L, 1 - L)
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return toHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 1
  const [r, g, b] = rgb.map((c) => {
    const x = c / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** Text color (near-white or near-black) that reads best on this background. */
export const contrastOn = (bg: string) => (contrast(bg, '#ffffff') >= contrast(bg, '#0b0b0f') ? '#ffffff' : '#0b0b0f')

export interface FromColorOptions {
  mode?: 'light' | 'dark'
  /** Tint the neutral surfaces and text with the color's hue (default true). */
  neutrals?: boolean
}

/**
 * A theme from one brand color: the accent, readable text on it and, unless `neutrals: false`,
 * surfaces and text tinted with its hue. Returns only the tokens it changes (merge with a base theme).
 */
export function themeFromColor(color: string, opts: FromColorOptions = {}): Partial<TokenSet> {
  const rgb = parseHex(color)
  if (!rgb) throw new Error(`themeFromColor: "${color}" is not a hex color (use #rgb or #rrggbb)`)
  const [h, s, l] = rgbToHsl(rgb)
  const dark = opts.mode === 'dark'
  const hue = Math.round(h)
  const darkBg = opts.neutrals === false ? '#09090b' : hslToHex(hue, 22, 6)
  // On a dark surface the accent is lightened until it has at least 4.5:1 contrast with it (WCAG AA).
  let accent = toHex(...rgb)
  if (dark) {
    let light = Math.max(l, 55)
    accent = hslToHex(h, s, light)
    while (contrast(accent, darkBg) < 4.5 && light < 92) accent = hslToHex(h, s, (light += 2))
  }
  const out: Partial<TokenSet> = { accent, 'on-accent': contrastOn(accent) }
  if (opts.neutrals === false) return out
  return dark
    ? { ...out, bg: darkBg, fg: hslToHex(hue, 15, 96), muted: hslToHex(hue, 8, 65), line: hslToHex(hue, 14, 17), fill: hslToHex(hue, 18, 10) }
    : { ...out, bg: '#ffffff', fg: hslToHex(hue, 22, 9), muted: hslToHex(hue, 8, 45), line: hslToHex(hue, 14, 90), fill: hslToHex(hue, 22, 96) }
}
