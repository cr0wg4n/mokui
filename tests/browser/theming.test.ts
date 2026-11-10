import { describe, expect, it } from 'vitest'
import { contrastOn, defineTheme, mount, themeFromColor } from '../../src/index'
import { css, render } from './helpers'

const q = (r: ParentNode, sel: string) => r.querySelector(sel)!
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`
}
const primary = (r: ParentNode) => css(q(r, 'mk-button'))

describe('accent', () => {
  it('colors primary buttons, checked controls, progress and the active tab', () => {
    const r = render('stack accent=indigo g=sm\n  button primary "Go"\n  checkbox checked "A"\n  switch on "B"\n  progress 50\n  tabs "One|Two"')
    expect(primary(r).backgroundColor).toBe(rgb('#4f46e5'))
    expect(primary(r).color).toBe('rgb(255, 255, 255)')
    expect(css(q(q(r, 'mk-checkbox').shadowRoot!, '.box')).backgroundColor).toBe(rgb('#4f46e5'))
    expect(css(q(q(r, 'mk-switch').shadowRoot!, '.box')).backgroundColor).toBe(rgb('#4f46e5'))
    expect(css(q(q(r, 'mk-progress').shadowRoot!, '.bar')).backgroundColor).toBe(rgb('#4f46e5'))
    expect(css(q(q(r, 'mk-tabs').shadowRoot!, '.tabbtn')).borderBottomColor).toBe(rgb('#4f46e5'))
  })
  it('works on the same element as a theme, and a dark theme uses the lighter variant', () => {
    const r = render('stack theme=dark accent=indigo\n  button primary "Go"')
    expect(primary(r).backgroundColor).toBe(rgb('#818cf8'))
    expect(primary(r).color).toBe(rgb(contrastOn('#818cf8')))
  })
  it('survives a nested theme: the nearest theme sets the surface, the accent still applies', () => {
    const r = render('stack accent=emerald\n  button primary "light"\n  stack theme=dark p=md\n    button primary "dark"')
    const [light, dark] = Array.from(r.querySelectorAll('mk-button')).map(css)
    expect(light!.backgroundColor).toBe(rgb('#059669'))
    expect(dark!.backgroundColor).toBe(rgb('#34d399'))
    expect(css(q(r, 'mk-stack mk-stack')).backgroundColor).toBe('rgb(9, 9, 11)')
  })
  it('a nearer accent wins', () => {
    const r = render('stack accent=rose\n  button primary "a"\n  stack accent=blue\n    button primary "b"')
    const [a, b] = Array.from(r.querySelectorAll('mk-button')).map(css)
    expect(a!.backgroundColor).toBe(rgb('#e11d48'))
    expect(b!.backgroundColor).toBe(rgb('#2563eb'))
  })
  it('badges, chips and the calendar follow it too', () => {
    const r = render('stack accent=violet g=sm\n  badge primary "B"\n  chip active "C"\n  calendar value=12')
    expect(css(q(r, 'mk-badge')).backgroundColor).toBe(rgb('#7c3aed'))
    expect(css(q(r, 'mk-chip')).backgroundColor).toBe(rgb('#7c3aed'))
    expect(css(q(q(r, 'mk-calendar').shadowRoot!, '.sel')).backgroundColor).toBe(rgb('#7c3aed'))
  })
  it('readable text on a light accent', () => {
    expect(primary(render('stack accent=amber\n  button primary "x"')).color).toBe(rgb(contrastOn('#d97706')))
  })
})

describe('radius and font', () => {
  it('radius changes containers and controls, and applies to descendants', () => {
    const sharp = render('stack radius=sharp\n  box\n  button "x"\n  input "y"')
    expect(css(q(sharp, 'mk-box')).borderRadius).toBe('2px')
    expect(css(q(sharp, 'mk-button')).borderRadius).toBe('2px')
    expect(css(q(q(sharp, 'mk-input').shadowRoot!, '.field')).borderRadius).toBe('2px')
    const round = render('stack radius=round\n  box\n  button "x"')
    expect(css(q(round, 'mk-box')).borderRadius).toBe('20px')
    expect(css(q(round, 'mk-button')).borderRadius).toBe('12px')
    expect(css(q(render('box'), 'mk-box')).borderRadius).toBe('12px')
  })
  it('radius survives a nested theme', () => {
    const r = render('stack radius=sharp\n  stack theme=dark\n    box')
    expect(css(q(r, 'mk-box')).borderRadius).toBe('2px')
  })
  it('font switches the typeface for the subtree', () => {
    expect(css(q(render('stack font=serif\n  text "x"'), 'mk-text')).fontFamily).toContain('Georgia')
    expect(css(q(render('stack font=mono\n  button "x"'), 'mk-button')).fontFamily).toContain('monospace')
    expect(css(q(render('text "x"'), 'mk-text')).fontFamily).toContain('system-ui')
  })
  it('all three combine with a theme', () => {
    const r = render('stack theme=wire accent=teal radius=round font=serif\n  button primary "x"')
    const b = primary(r)
    expect(b.backgroundColor).toBe(rgb('#0d9488'))
    expect(b.borderRadius).toBe('12px')
    expect(b.fontFamily).toContain('Georgia')
    expect(b.boxShadow).toBe('none') // wire has no shadows
  })
})

describe('mount with theme options', () => {
  const host = (src: string, theme: Parameters<typeof mount>[2] extends infer O ? (O extends { theme?: infer T } ? T : never) : never) => {
    const h = document.createElement('div')
    document.body.append(h)
    mount(h, src, { theme })
    return h
  }
  it('base, accent, radius and font apply to the whole mock', () => {
    const h = host('stack p=md\n  button primary "Go"\n  box', { base: 'dark', accent: 'teal', radius: 'round', font: 'serif' })
    expect(css(h).backgroundColor).toBe('rgb(9, 9, 11)')
    expect(primary(h).backgroundColor).toBe(rgb('#2dd4bf'))
    expect(css(q(h, 'mk-box')).borderRadius).toBe('20px')
    expect(css(q(h, 'mk-box')).fontFamily).toContain('Georgia')
    h.remove()
  })
  it('a hex accent gets readable text; token overrides apply', () => {
    const h = host('stack\n  button primary "x"\n  text "t"', { accent: '#ff6600', tokens: { fg: '#aa0000' } })
    expect(primary(h).backgroundColor).toBe(rgb('#ff6600'))
    expect(primary(h).color).toBe(rgb(contrastOn('#ff6600')))
    expect(css(q(h, 'mk-text')).color).toBe(rgb('#aa0000'))
    h.remove()
  })
  it('the chosen accent reaches a nested theme inside the mock', () => {
    const h = host('stack theme=wire\n  button primary "x"', { accent: 'teal' })
    expect(primary(h).backgroundColor).toBe(rgb('#0d9488'))
    h.remove()
  })
  it('mounting again replaces the look instead of leaving the old one behind', () => {
    const h = document.createElement('div')
    document.body.append(h)
    mount(h, 'button primary "x"', { theme: { base: 'dark', accent: 'rose', radius: 'round', font: 'serif' } })
    expect(primary(h).backgroundColor).toBe(rgb('#fb7185'))
    expect(css(h).backgroundColor).toBe('rgb(9, 9, 11)')
    mount(h, 'button primary "x"', { theme: { accent: 'blue' } }) // no radius, font or dark base this time
    expect(primary(h).backgroundColor).toBe(rgb('#2563eb'))
    expect(css(h).backgroundColor).toBe('rgb(255, 255, 255)')
    expect(primary(h).borderRadius).toBe('8px')
    expect(primary(h).fontFamily).toContain('system-ui')
    mount(h, 'button primary "x"') // no theme at all: back to the default look
    expect(primary(h).backgroundColor).toBe(rgb('#18181b'))
    expect(h.style.getPropertyValue('--mk-u-accent')).toBe('')
    expect(h.style.background).toBe('')
    h.remove()
  })
  it('styles the container set by the page itself are left alone', () => {
    const h = document.createElement('div')
    h.style.padding = '7px'
    document.body.append(h)
    mount(h, 'text "x"', { theme: 'dark' })
    mount(h, 'text "x"')
    expect(h.style.padding).toBe('7px')
    h.remove()
  })
  it('a name still works', () => {
    const h = host('text "x"', 'dark')
    expect(css(h).backgroundColor).toBe('rgb(9, 9, 11)')
    h.remove()
  })
})

describe('custom themes', () => {
  it('defineTheme styles elements that already exist, and the DSL then accepts the name', () => {
    const early = document.createElement('div')
    document.body.append(early)
    early.innerHTML = '<mk-stack theme="runtime-theme"><mk-text>hi</mk-text></mk-stack>'
    expect(css(q(early, 'mk-text')).color).toBe('rgb(24, 24, 27)') // not defined yet: modern
    defineTheme('runtime-theme', { base: 'dark', tokens: { bg: '#102030', fg: '#fedcba' } })
    expect(css(q(early, 'mk-stack')).backgroundColor).toBe(rgb('#102030'))
    expect(css(q(early, 'mk-text')).color).toBe(rgb('#fedcba'))
    const r = render('stack theme=runtime-theme p=md\n  box')
    expect(css(q(r, 'mk-stack')).backgroundColor).toBe(rgb('#102030'))
    early.remove()
  })
  it('a theme made from one brand color re-skins a whole screen', () => {
    defineTheme('brand-rose', { tokens: themeFromColor('#e11d48') })
    const r = render('stack theme=brand-rose p=md g=sm\n  button primary "Save"\n  box fill\n    text "In a box"')
    expect(primary(r).backgroundColor).toBe(rgb('#e11d48'))
    expect(primary(r).color).toBe('rgb(255, 255, 255)')
    // neutrals are tinted with the hue, so the fill is no longer the neutral zinc
    expect(css(q(r, 'mk-box')).backgroundColor).not.toBe('rgb(244, 244, 245)')
    const [red, green, blue] = css(q(r, 'mk-box')).backgroundColor.match(/\d+/g)!.map(Number) as [number, number, number]
    expect(red).toBeGreaterThan(green!)
    expect(red).toBeGreaterThan(blue!)
  })
  it('a dark theme from a color gets dark surfaces and a lightened accent', () => {
    defineTheme('brand-dark', { base: 'dark', tokens: themeFromColor('#4f46e5', { mode: 'dark' }) })
    const r = render('stack theme=brand-dark p=md\n  button primary "x"')
    expect(css(q(r, 'mk-stack')).colorScheme).toBe('dark')
    expect(luminanceOf(css(q(r, 'mk-stack')).backgroundColor)).toBeLessThan(0.05)
    const ratio = (luminanceOf(primary(r).backgroundColor) + 0.05) / (luminanceOf(css(q(r, 'mk-stack')).backgroundColor) + 0.05)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
  it('a user accent still overrides a custom theme', () => {
    defineTheme('brand-plain', { tokens: themeFromColor('#e11d48') })
    const r = render('stack theme=brand-plain accent=blue\n  button primary "x"')
    expect(primary(r).backgroundColor).toBe(rgb('#2563eb'))
  })
})

function luminanceOf(c: string) {
  const [r, g, b] = c.match(/\d+/g)!.map((x) => {
    const v = Number(x) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
