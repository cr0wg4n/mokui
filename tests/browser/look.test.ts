import { describe, expect, it } from 'vitest'
import { mount } from '../../src/index'
import { css, render } from './helpers'

const q = (r: ParentNode, sel: string) => r.querySelector(sel)!

describe('modern default', () => {
  it('buttons are rounded with a soft border and weight 500', () => {
    const b = css(q(render('button "x"'), 'mk-button'))
    expect(b.borderRadius).toBe('8px')
    expect(b.fontWeight).toBe('500')
    expect(b.boxShadow).not.toBe('none')
  })
  it('primary uses the accent (near-black) and drops the shadow', () => {
    const b = css(q(render('button primary "x"'), 'mk-button'))
    expect(b.backgroundColor).toBe('rgb(24, 24, 27)')
    expect(b.color).toBe('rgb(255, 255, 255)')
    expect(b.boxShadow).toBe('none')
  })
  it('boxes use a 12px radius; raised adds elevation; cards are raised', () => {
    const r = render('box\nbox raised\ncard "T"')
    const [plain, raised, card] = Array.from(r.querySelectorAll('mk-box')).map(css)
    expect(plain!.borderRadius).toBe('12px')
    expect(plain!.boxShadow).toBe('none')
    expect(raised!.boxShadow).not.toBe('none')
    expect(card!.boxShadow).not.toBe('none')
  })
  it('fields have 40px height, 8px radius and soft border', () => {
    const f = css(q(q(render('input "x"'), 'mk-input').shadowRoot!, '.field'))
    expect(parseFloat(f.minHeight)).toBe(40)
    expect(f.borderRadius).toBe('8px')
  })
  it('accent drives checked states', () => {
    const on = css(q(q(render('checkbox checked "x"'), 'mk-checkbox').shadowRoot!, '.box'))
    expect(on.backgroundColor).toBe('rgb(24, 24, 27)')
    const sw = css(q(q(render('switch on "x"'), 'mk-switch').shadowRoot!, '.box'))
    expect(sw.backgroundColor).toBe('rgb(24, 24, 27)')
  })
  it('divider accent is a thick accent line', () => {
    const d = q(render('stack\n  divider accent'), 'mk-divider')
    expect(d.getBoundingClientRect().height).toBeCloseTo(2, 0)
    expect(css(d).backgroundColor).toBe('rgb(24, 24, 27)')
  })
})

describe('themes', () => {
  it('theme=dark switches colors for the whole subtree and paints a background', () => {
    const r = render('stack theme=dark p=md\n  text "Hi"\n  button primary "Go"\n  box\n    text "In"')
    const stack = css(q(r, 'mk-stack'))
    expect(stack.backgroundColor).toBe('rgb(9, 9, 11)')
    expect(css(q(r, 'mk-text')).color).toBe('rgb(250, 250, 250)')
    expect(css(q(r, 'mk-button')).backgroundColor).toBe('rgb(250, 250, 250)')
    expect(css(q(r, 'mk-box')).borderTopColor).toBe('rgb(39, 39, 42)')
  })
  it('theme=wire gives the plain wireframe look', () => {
    const r = render('stack theme=wire\n  box\n  button "x"')
    expect(css(q(r, 'mk-box')).borderRadius).toBe('4px')
    expect(css(q(r, 'mk-button')).boxShadow).toBe('none')
    expect(css(q(r, 'mk-box')).borderTopColor).toBe('rgb(187, 187, 187)')
  })
  it('a themed subtree can sit inside an unthemed page', () => {
    const r = render('stack\n  text "light"\n  stack theme=dark\n    text "dark"')
    const [a, b] = Array.from(r.querySelectorAll('mk-text')).map(css)
    expect(a!.color).toBe('rgb(24, 24, 27)')
    expect(b!.color).toBe('rgb(250, 250, 250)')
  })
  it('mount({ theme }) themes the whole container', () => {
    const host = document.createElement('div')
    document.body.append(host)
    mount(host, 'text "Hi"', { theme: 'dark' })
    expect(css(host).backgroundColor).toBe('rgb(9, 9, 11)')
    expect(css(q(host, 'mk-text')).color).toBe('rgb(250, 250, 250)')
    host.remove()
  })
  it('mount({ open }) draws a modal open', () => {
    const host = document.createElement('div')
    document.body.append(host)
    mount(host, 'modal #m "T"', { open: ['m'] })
    expect(css(q(host, 'mk-modal')).display).toBe('flex')
    host.remove()
  })
  it('an invalid theme value is rejected by the DSL', async () => {
    const { parse } = await import('../../src/core')
    expect(() => parse('stack theme=neon')).toThrow('Valid: modern dark wire')
  })
})

describe('browser built-in attribute behavior must not leak', () => {
  it('align=center on a row does not center the text of its children (legacy HTML align hint)', () => {
    const r = render('row align=center\n  input search "Search"\n  text "left"')
    expect(css(q(r, 'mk-input')).textAlign).toBe('start')
    expect(css(q(q(r, 'mk-input').shadowRoot!, '.txt')).textAlign).toBe('start')
    expect(css(q(r, 'mk-text')).textAlign).toBe('start')
  })
  it('the center flag on text still centers', () => {
    expect(css(q(render('row align=center\n  text center "x"'), 'mk-text')).textAlign).toBe('center')
  })
  it('no element gets a native tooltip from a title attribute', () => {
    const r = render('modal open "Dialog"\ncollapse "Section"\n  text "x"\ndrawer left "Menu"')
    for (const el of Array.from(r.querySelectorAll('*'))) expect(el.hasAttribute('title'), el.localName).toBe(false)
  })
})
