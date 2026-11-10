import { describe, expect, it } from 'vitest'
import { contrast, contrastOn, hslToHex, luminance, parseHex, rgbToHsl } from '../../src/color'
import { cheatsheet, defineTheme, loadTheme, parse, themeCssText, themeFile, themeFromColor, themeStyle, themes } from '../../src/core'

const lum = (c: string | undefined) => luminance(c!)

describe('color helpers', () => {
  it('parses #rgb and #rrggbb, rejects the rest', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255])
    expect(parseHex('4f46e5')).toEqual([79, 70, 229])
    expect(parseHex('red')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
  })
  it('round-trips hsl', () => {
    const [h, s, l] = rgbToHsl(parseHex('#4f46e5')!)
    expect(hslToHex(h, s, l)).toBe('#4f46e5')
  })
  it('luminance runs from black to white and contrast is symmetric', () => {
    expect(luminance('#000')).toBeCloseTo(0, 3)
    expect(luminance('#fff')).toBeCloseTo(1, 3)
    expect(contrast('#000', '#fff')).toBeCloseTo(21, 0)
    expect(contrast('#123456', '#fedcba')).toBeCloseTo(contrast('#fedcba', '#123456'), 5)
  })
  it('contrastOn picks readable text', () => {
    expect(contrastOn('#4f46e5')).toBe('#ffffff')
    expect(contrastOn('#18181b')).toBe('#ffffff')
    expect(contrastOn('#fbbf24')).toBe('#0b0b0f')
    expect(contrastOn('#ffffff')).toBe('#0b0b0f')
  })
})

describe('themeFromColor', () => {
  it('light: the accent is the color, with readable text and neutrals ordered dark to light', () => {
    const t = themeFromColor('#4f46e5')
    expect(t.accent).toBe('#4f46e5')
    expect(t['on-accent']).toBe('#ffffff')
    expect(lum(t.fg)).toBeLessThan(lum(t.muted))
    expect(lum(t.muted)).toBeLessThan(lum(t.line))
    expect(lum(t.line)).toBeLessThan(lum(t.fill))
    expect(lum(t.fill)).toBeLessThanOrEqual(lum(t.bg))
    expect(t.bg).toBe('#ffffff')
  })
  it('the neutrals carry the hue of the color', () => {
    const hue = (c: string) => rgbToHsl(parseHex(c)!)[0]
    const t = themeFromColor('#4f46e5')
    expect(Math.abs(hue(t.fill!) - hue('#4f46e5'))).toBeLessThan(8)
    expect(Math.abs(hue(t.fg!) - hue('#4f46e5'))).toBeLessThan(8)
  })
  it('dark: surfaces are dark, text is light, and the accent is lightened to read on them', () => {
    const t = themeFromColor('#4f46e5', { mode: 'dark' })
    expect(lum(t.bg)).toBeLessThan(lum(t.fill))
    expect(lum(t.fill)).toBeLessThan(lum(t.line))
    expect(lum(t.line)).toBeLessThan(lum(t.muted))
    expect(lum(t.muted)).toBeLessThan(lum(t.fg))
    expect(lum(t.accent)).toBeGreaterThan(lum('#4f46e5'))
  })
  it.each(['#4f46e5', '#2563eb', '#7c3aed', '#e11d48', '#0d9488', '#18181b', '#000000'])('dark: %s always reads on the dark surface (contrast at least 4.5:1)', (c) => {
    const t = themeFromColor(c, { mode: 'dark' })
    expect(contrast(t.accent!, t.bg!)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(themeFromColor(c, { mode: 'dark', neutrals: false }).accent!, '#09090b')).toBeGreaterThanOrEqual(4.5)
  })
  it('neutrals: false changes only the accent and its text', () => {
    expect(Object.keys(themeFromColor('#e11d48', { neutrals: false })).sort()).toEqual(['accent', 'on-accent'])
  })
  it('rejects a color that is not hex', () => {
    expect(() => themeFromColor('indigo')).toThrow('"indigo" is not a hex color')
  })
})

describe('themeStyle', () => {
  it('a name gives every token, text and background colors and the color scheme', () => {
    const s = themeStyle('dark')
    expect(s['--mk-fg']).toBe('#fafafa')
    expect(s.background).toBe('#09090b')
    expect(s.color).toBe('#fafafa')
    expect(s.colorScheme).toBe('dark')
    expect(themeStyle('modern').colorScheme).toBe('light')
  })
  it('accent, radius and font tokens read a user variable first, so they reach nested themes', () => {
    const s = themeStyle('dark')
    expect(s['--mk-accent']).toBe('var(--mk-u-accent,#fafafa)')
    expect(s['--mk-r']).toBe('var(--mk-u-r,12px)')
    expect(s['--mk-font']).toContain('var(--mk-u-font,')
    expect(s['--mk-fg']).toBe('#fafafa')
  })
  it('a named accent adapts with light-dark; a hex stays as given with readable text', () => {
    const named = themeStyle({ accent: 'indigo' })
    expect(named['--mk-u-accent']).toBe('light-dark(#4f46e5,#818cf8)')
    expect(named['--mk-u-on-accent']).toContain('light-dark(')
    const hex = themeStyle({ accent: '#ff6600' })
    expect(hex['--mk-u-accent']).toBe('#ff6600')
    expect(hex['--mk-u-on-accent']).toBe(contrastOn('#ff6600'))
  })
  it('radius, font and token overrides', () => {
    const s = themeStyle({ base: 'wire', radius: 'round', font: 'serif', tokens: { fg: '#123456' } })
    expect(s['--mk-u-r']).toBe('20px')
    expect(s['--mk-u-r-sm']).toBe('12px')
    expect(s['--mk-u-font']).toContain('Georgia')
    expect(s['--mk-fg']).toBe('#123456')
    expect(s.color).toBe('#123456')
  })
  it('explains what is wrong and what is valid', () => {
    expect(() => themeStyle('neon')).toThrow('unknown theme "neon". Valid: modern dark wire')
    expect(() => themeStyle({ accent: 'chartreuse' })).toThrow('unknown accent "chartreuse". Valid: zinc blue indigo')
    expect(() => themeStyle({ radius: 'blobby' as never })).toThrow('Valid: sharp soft round')
    expect(() => themeStyle({ font: 'comic' as never })).toThrow('Valid: sans serif mono')
    expect(() => themeStyle({ base: 'constructor' })).toThrow('unknown theme')
  })
  it('themeCssText is a :root block of the variables only', () => {
    const css = themeCssText({ base: 'dark', accent: 'teal' })
    expect(css.startsWith(':root{--mk-')).toBe(true)
    expect(css).toContain('--mk-u-accent:light-dark(#0d9488,#2dd4bf)')
    expect(css).not.toContain('background:')
    expect(themeCssText('modern', '.app')).toContain('.app{')
  })
})

describe('defineTheme', () => {
  it('registers a theme the parser, themeStyle and cheat sheet then know', () => {
    expect(() => parse('stack theme=acme')).toThrow('Valid: modern dark wire')
    defineTheme('acme', { base: 'dark', accent: 'rose', radius: 'sharp', tokens: { bg: '#101010' } })
    expect(themes.acme!.bg).toBe('#101010')
    expect(themes.acme!.accent).toBe('#fb7185') // dark variant of rose, baked into the theme
    expect(themes.acme!.r).toBe('2px')
    expect(() => parse('stack theme=acme')).not.toThrow()
    expect(themeStyle('acme').background).toBe('#101010')
    expect(cheatsheet()).toContain('theme=modern|dark|wire|acme')
    expect(() => parse('stack theme=nope')).toThrow('Valid: modern dark wire acme')
  })
  it('validates the name and refuses duplicates and built-ins', () => {
    expect(() => defineTheme('Bad Name')).toThrow('must be lowercase')
    expect(() => defineTheme('dark')).toThrow('"dark" already exists')
    defineTheme('once')
    expect(() => defineTheme('once')).toThrow('already exists')
  })
  it('a theme from one color can be registered', () => {
    defineTheme('from-color', { tokens: themeFromColor('#0d9488') })
    expect(themes['from-color']!.accent).toBe('#0d9488')
    expect(themes['from-color']!['on-accent']).toBe(contrastOn('#0d9488'))
  })
})

describe('theme files', () => {
  it('a complete file loads and comes back as options', () => {
    const f = loadTheme({ name: 'brand', base: 'dark', accent: 'violet', radius: 'round', font: 'mono', tokens: { fg: '#eee' } })
    expect(f.accent).toBe('violet')
    expect(f.tokens).toEqual({ fg: '#eee' })
  })
  it('reports every problem at once', () => {
    try {
      loadTheme({ base: 'neon', accent: 'chartreuse', radius: 3, tokens: { colour: '#fff', fg: 5 }, extra: 1 })
      throw new Error('should have thrown')
    } catch (e) {
      const m = (e as Error).message
      expect(m).toContain('invalid theme file')
      expect(m).toContain('unknown key "extra"')
      expect(m).toContain('unknown theme "neon"')
      expect(m).toContain('unknown accent "chartreuse"')
      expect(m).toContain('"radius" must be a string')
      expect(m).toContain('unknown token "colour"')
      expect(m).toContain('token "fg" must be a string')
    }
    expect(() => loadTheme([])).toThrow('must be a JSON object')
    expect(() => loadTheme({ tokens: [] })).toThrow('"tokens" must be an object')
  })
  it('themeFile makes a file that loads back and uses the color', () => {
    const f = themeFile('#e11d48', { mode: 'dark', name: 'brand', radius: 'round', font: 'serif' })
    expect(f).toMatchObject({ name: 'brand', base: 'dark', radius: 'round', font: 'serif' })
    expect(f.tokens!.accent).toBeDefined()
    expect(loadTheme(JSON.parse(JSON.stringify(f)))).toEqual(f)
    expect(themeFile('#e11d48').base).toBe('modern')
  })
})

describe('theme attributes in the DSL', () => {
  it('accent, radius and font accept their presets and nothing else', () => {
    expect(() => parse('stack theme=dark accent=indigo radius=round font=serif\n  button primary "x"')).not.toThrow()
    expect(() => parse('stack accent=chartreuse')).toThrow('accent="chartreuse" invalid. Valid: zinc blue indigo violet')
    expect(() => parse('stack radius=blobby')).toThrow('Valid: sharp soft round')
    expect(() => parse('stack font=comic')).toThrow('Valid: sans serif mono')
  })
  it('the cheat sheet lists them once, for every tag', () => {
    const s = cheatsheet()
    expect(s).toContain('accent=zinc|blue|indigo')
    expect(s).toContain('radius=sharp|soft|round')
    expect(s).toContain('font=sans|serif|mono')
  })
})
