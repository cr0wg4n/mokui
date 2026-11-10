import { describe, expect, it, vi } from 'vitest'
import { css, rect, render } from './helpers'

const sr = (el: Element) => el.shadowRoot!
const txt = (el: Element, sel: string) => sr(el).querySelector(sel)!.textContent

describe('button', () => {
  it('variants differ visually', () => {
    const [p, s, g] = ['primary', 'secondary', 'ghost'].map((v) => css(render(`button ${v} "x"`).querySelector('mk-button')!))
    expect(p!.backgroundColor).not.toBe(s!.backgroundColor)
    expect(g!.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(g!.borderTopColor).toBe('rgba(0, 0, 0, 0)')
  })
  it('sizes grow', () => {
    const h = (s: string) => rect(render(`button ${s} "x"`).querySelector('mk-button')!).height
    expect(h('sm')).toBeLessThan(h('md'))
    expect(h('md')).toBeLessThan(h('lg'))
  })
  it('renders a leading icon; disabled dims; full fills width', () => {
    const b = render('button icon=plus disabled full "Add"', 400).querySelector('mk-button')!
    expect(sr(b).querySelector('.ico svg')).not.toBeNull()
    expect(css(b).opacity).toBe('0.45')
    expect(rect(b).width).toBeCloseTo(400, 0)
    expect(b.textContent).toBe('Add')
  })
  it('exposes role=button; an explicit role wins', () => {
    expect(render('button role=link "x"').querySelector('mk-button')!.getAttribute('role')).toBe('link')
    expect(render('button "x"').querySelector('mk-button')!.getAttribute('role')).toBe('button')
  })
})

describe('input', () => {
  it('shows label and placeholder', () => {
    const i = render('input label="Email" "you@x.com"').querySelector('mk-input')!
    expect(txt(i, '.label')).toBe('Email')
    expect(txt(i, '.txt')).toBe('you@x.com')
    expect(sr(i).querySelector('.txt')!.className).toContain('ph')
  })
  it('value replaces the placeholder styling', () => {
    const i = render('input value=Ana "Name"').querySelector('mk-input')!
    expect(txt(i, '.txt')).toBe('Ana')
    expect(sr(i).querySelector('.txt')!.className).toContain('val')
  })
  it('type adds icons: search leading, date and password trailing', () => {
    expect(sr(render('input search "Find"').querySelector('mk-input')!).querySelector('.pre svg')).not.toBeNull()
    expect(sr(render('input date "When"').querySelector('mk-input')!).querySelector('.post svg')).not.toBeNull()
    expect(sr(render('input password "Pw"').querySelector('mk-input')!).querySelector('.post svg')).not.toBeNull()
    expect(sr(render('input text "x"').querySelector('mk-input')!).querySelector('svg')).toBeNull()
  })
  it('hides the label row when there is none', () => {
    expect(css(sr(render('input "x"').querySelector('mk-input')!).querySelector('.label')!).display).toBe('none')
  })
  it('updates when attributes change', () => {
    const i = render('input "x"').querySelector('mk-input')!
    i.setAttribute('label', 'Late')
    expect(txt(i, '.label')).toBe('Late')
  })
})

describe('textarea', () => {
  it('rows makes it taller', () => {
    const h = (r: number) => rect(render(`textarea ${r} "Notes"`).querySelector('mk-textarea')!).height
    expect(h(5)).toBeGreaterThan(h(2))
  })
})

describe('select', () => {
  it('shows the first option and a chevron', () => {
    const s = render('select label="Role" "Admin|Editor|Viewer"').querySelector('mk-select')!
    expect(txt(s, '.txt')).toBe('Admin')
    expect(sr(s).querySelector('.post svg')).not.toBeNull()
    expect(css(sr(s).querySelector('.list')!).display).toBe('none')
  })
  it('value picks the selected option; open lists them all', () => {
    const s = render('select open value=Editor "Admin|Editor|Viewer"').querySelector('mk-select')!
    expect(txt(s, '.txt')).toBe('Editor')
    const items = Array.from(sr(s).querySelectorAll('.list div'))
    expect(items.map((d) => d.textContent)).toEqual(['Admin', 'Editor', 'Viewer'])
    expect(items[1]!.hasAttribute('data-sel')).toBe(true)
  })
})

describe('checkbox, radio, switch', () => {
  it('checked state is visible', () => {
    const on = css(render('checkbox checked "A"').querySelector('mk-checkbox')!.shadowRoot!.querySelector('.box')!)
    const off = css(render('checkbox "A"').querySelector('mk-checkbox')!.shadowRoot!.querySelector('.box')!)
    expect(on.backgroundColor).not.toBe(off.backgroundColor)
  })
  it('radio is round; checked draws a dot', () => {
    const r = render('radio checked "A"').querySelector('mk-radio')!
    expect(css(sr(r).querySelector('.box')!).borderRadius).toBe('50%')
    expect(css(sr(r).querySelector('.box')!).borderTopWidth).toBe('5px')
    expect(css(sr(render('radio "A"').querySelector('mk-radio')!).querySelector('.box')!).borderTopWidth).toBe('1px')
  })
  it('switch knob moves when on', () => {
    const x = (src: string) => {
      const k = rect(render(src).querySelector('mk-switch')!.shadowRoot!.querySelector('.box')!)
      return k.width
    }
    expect(x('switch on "Wifi"')).toBe(x('switch "Wifi"'))
    const knob = (src: string) => getComputedStyle(render(src).querySelector('mk-switch')!.shadowRoot!.querySelector('.box')!, '::after').left
    expect(knob('switch on "x"')).not.toBe(knob('switch "x"'))
  })
  it('labels render in the light DOM slot; roles exposed', () => {
    const c = render('checkbox "Remember me"').querySelector('mk-checkbox')!
    expect(c.textContent).toBe('Remember me')
    expect(c.getAttribute('role')).toBe('checkbox')
  })
})

describe('slider', () => {
  it('value positions the thumb', () => {
    const left = (v: number) => parseFloat(render(`slider ${v}`).querySelector('mk-slider')!.shadowRoot!.querySelector<HTMLElement>('.thumb')!.style.left)
    expect(left(25)).toBe(25)
    expect(left(80)).toBe(80)
  })
  it('clamps out-of-range values', () => {
    const t = render('slider 250').querySelector('mk-slider')!.shadowRoot!.querySelector<HTMLElement>('.thumb')!
    expect(t.style.left).toBe('100%')
  })
})

describe('icon names', () => {
  it('warns for unknown icons', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render('icon nope')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown icon "nope"'))
    warn.mockRestore()
  })
  it('every bundled icon renders paths', async () => {
    const { icons } = await import('../../src/index')
    for (const name of Object.keys(icons)) {
      const i = render(`icon ${name}`).querySelector('mk-icon')!
      expect(i.shadowRoot!.querySelector('svg')!.children.length, name).toBeGreaterThan(0)
    }
  })
})

describe('fit inside narrow containers', () => {
  it('fields never overflow their card', () => {
    const r = render('card w=lg\n  input "a"\n  select "A|B"\n  slider 40')
    const box = rect(r.querySelector('mk-box')!)
    for (const sel of ['mk-input', 'mk-select', 'mk-slider']) {
      expect(rect(r.querySelector(sel)!).right, sel).toBeLessThanOrEqual(box.right)
    }
  })
})
