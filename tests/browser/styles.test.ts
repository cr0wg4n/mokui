import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '../../src/index'

let host: HTMLElement
const render = (src: string) => {
  host = document.createElement('div')
  document.body.append(host)
  mount(host, src)
  return host
}
const css = (el: Element) => getComputedStyle(el)
afterEach(() => host?.remove())

describe('layout primitives (real browser)', () => {
  it('row is a horizontal flex container', () => {
    const row = render('row').querySelector('mk-row')!
    expect(css(row).display).toBe('flex')
    expect(css(row).flexDirection).toBe('row')
  })
  it('stack is a vertical flex container', () => {
    const stack = render('stack').querySelector('mk-stack')!
    expect(css(stack).flexDirection).toBe('column')
  })
  it.each([
    ['xs', '4px'], ['sm', '8px'], ['md', '12px'], ['lg', '16px'], ['xl', '24px'],
  ])('g=%s maps to gap %s', (k, px) => {
    const row = render(`row g=${k}`).querySelector('mk-row')!
    expect(css(row).gap).toBe(px)
  })
  it('p=lg maps to padding 16px', () => {
    const row = render('row p=lg').querySelector('mk-row')!
    expect(css(row).paddingTop).toBe('16px')
  })
  it('align and justify map to flex properties', () => {
    const row = render('row align=center justify=between').querySelector('mk-row')!
    expect(css(row).alignItems).toBe('center')
    expect(css(row).justifyContent).toBe('space-between')
  })
  it('unknown scale value changes nothing', () => {
    const row = render('row g=huge').querySelector('mk-row')!
    expect(css(row).gap).toBe('normal')
  })
})

describe('text', () => {
  it.each([['sm', '13px'], ['lg', '18px'], ['xl', '24px']])('s=%s maps to %s', (k, px) => {
    const t = render(`text ${k} "Hi"`).querySelector('mk-text')!
    expect(css(t).fontSize).toBe(px)
  })
  it('defaults to md (15px)', () => {
    expect(css(render('text "Hi"').querySelector('mk-text')!).fontSize).toBe('15px')
  })
})

describe('theming', () => {
  it('host can override a scale token through custom properties', () => {
    const el = render('row g=md')
    el.style.setProperty('--mk-s-md', '40px')
    expect(css(el.querySelector('mk-row')!).gap).toBe('40px')
  })
})

describe('icons', () => {
  it('renders an svg with paths for a known icon', () => {
    const icon = render('icon search').querySelector('mk-icon')!
    expect(icon.shadowRoot!.querySelector('svg circle')).not.toBeNull()
    expect(icon.getBoundingClientRect().width).toBeGreaterThan(0)
  })
  it('renders a placeholder and warns for an unknown icon', () => {
    const icon = render('icon nope').querySelector('mk-icon')!
    expect(icon.shadowRoot!.querySelector('svg rect')).not.toBeNull()
  })
  it('updates when the n attribute changes', () => {
    const icon = render('icon search').querySelector('mk-icon')!
    icon.setAttribute('n', 'plus')
    expect(icon.shadowRoot!.querySelector('svg circle')).toBeNull()
  })
})

describe('isolation', () => {
  it('host CSS does not leak into shadow content', () => {
    const style = document.createElement('style')
    style.textContent = 'div, span, svg { display: none !important }'
    document.head.append(style)
    const icon = render('icon search').querySelector('mk-icon')!
    expect(css(icon.shadowRoot!.querySelector('svg')!).display).not.toBe('none')
    style.remove()
  })
})

describe('composition', () => {
  it('lays out children horizontally with the requested gap', () => {
    const row = render('row g=lg\n  icon search\n  icon plus').querySelector('mk-row')!
    const [a, b] = Array.from(row.querySelectorAll('mk-icon')).map((e) => e.getBoundingClientRect())
    expect(b!.left - a!.right).toBeCloseTo(16, 0)
    expect(b!.top).toBeCloseTo(a!.top, 0)
  })
})
