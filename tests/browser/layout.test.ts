import { describe, expect, it } from 'vitest'
import { css, rect, render, tracks } from './helpers'

describe('grid', () => {
  it.each([1, 2, 3, 6])('cols=%i makes that many equal columns', (n) => {
    const g = render(`grid ${n}`).querySelector('mk-grid')!
    expect(tracks(g)).toHaveLength(n)
  })
  it('min= reflows with the container width, no breakpoints needed', () => {
    const wide = render('grid min=md g=md\n  box\n  box\n  box\n  box', 900).querySelector('mk-grid')!
    const narrow = render('grid min=md g=md\n  box\n  box\n  box\n  box', 300).querySelector('mk-grid')!
    expect(tracks(wide).length).toBeGreaterThan(tracks(narrow).length)
    expect(tracks(narrow)).toHaveLength(1)
  })
})

describe('breakpoints (container queries, mobile-first)', () => {
  const src = 'grid cols=1 cols-md=3 g-md=xl'
  it('uses the base value below the breakpoint', () => {
    const g = render(src, 400).querySelector('mk-grid')!
    expect(tracks(g)).toHaveLength(1)
    expect(css(g).columnGap).toBe('normal')
  })
  it('applies the variant at and above the breakpoint', () => {
    const g = render(src, 800).querySelector('mk-grid')!
    expect(tracks(g)).toHaveLength(3)
    expect(css(g).columnGap).toBe('24px')
  })
  it('switches a row to a column below its breakpoint with dir', () => {
    const small = render('row dir=col dir-md=row\n  box\n  box', 400).querySelector('mk-row')!
    const big = render('row dir=col dir-md=row\n  box\n  box', 900).querySelector('mk-row')!
    expect(css(small).flexDirection).toBe('column')
    expect(css(big).flexDirection).toBe('row')
  })
  it('frame is its own query container, so a mobile frame stays single-column in a wide page', () => {
    const f = render('frame mobile\n  grid cols=1 cols-md=3\n    box\n    box\n    box', 1200)
    expect(rect(f.querySelector('mk-frame')!).width).toBeLessThanOrEqual(375)
    expect(tracks(f.querySelector('mk-grid')!)).toHaveLength(1)
  })
  it('frame widths', () => {
    expect(rect(render('frame tablet', 1400).querySelector('mk-frame')!).width).toBeCloseTo(768, 0)
    expect(rect(render('frame desktop', 1400).querySelector('mk-frame')!).width).toBeCloseTo(1280, 0)
  })
})

describe('box, spacer, divider, scroll', () => {
  it('box has a border and optional fill', () => {
    const b = render('box fill p=md').querySelector('mk-box')!
    expect(css(b).borderTopWidth).toBe('1px')
    expect(css(b).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(css(b).paddingTop).toBe('12px')
  })
  it('spacer pushes siblings to opposite ends', () => {
    const row = render('row\n  text "L"\n  spacer\n  text "R"', 500).querySelector('mk-row')!
    const [l, r] = Array.from(row.querySelectorAll('mk-text')).map(rect)
    expect(l!.left).toBeCloseTo(rect(row).left, 0)
    expect(r!.right).toBeCloseTo(rect(row).right, 0)
  })
  it('divider is a 1px line, vertical flag flips it', () => {
    const d = render('stack\n  divider').querySelector('mk-divider')!
    expect(rect(d).height).toBeCloseTo(1, 0)
    const v = render('row h=sm\n  divider vertical').querySelector('mk-divider')!
    expect(rect(v).width).toBeCloseTo(1, 0)
    expect(rect(v).height).toBeGreaterThan(10)
  })
  it('scroll constrains height and scrolls', () => {
    const s = render('scroll h=sm\n  stack\n    text "a"\n    text "b"\n    text "c"\n    text "d"').querySelector('mk-scroll')!
    expect(rect(s).height).toBeCloseTo(48, 0)
    expect(s.scrollHeight).toBeGreaterThan(48)
  })
  it('w=full fills the container', () => {
    const b = render('row\n  box w=full', 500).querySelector('mk-box')!
    expect(rect(b).width).toBeCloseTo(500, 0)
  })
})
