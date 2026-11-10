import { describe, expect, it } from 'vitest'
import { css, rect, render } from './helpers'

describe('image', () => {
  it('is a labeled placeholder with the requested ratio', () => {
    const i = render('image 16:9 "Hero"').querySelector('mk-image')!
    const r = rect(i)
    expect(r.width / r.height).toBeCloseTo(16 / 9, 1)
    expect(i.textContent).toBe('Hero')
    expect(css(i).backgroundImage).toContain('linear-gradient')
  })
  it('w sets the width', () => {
    expect(rect(render('image w=md').querySelector('mk-image')!).width).toBeCloseTo(96, 0)
  })
})

describe('avatar and badge', () => {
  it('avatar is a circle showing initials', () => {
    const a = render('avatar "AM"').querySelector('mk-avatar')!
    expect(css(a).borderRadius).toBe('50%')
    expect(Math.round(rect(a).width)).toBe(Math.round(rect(a).height))
    expect(a.textContent).toBe('AM')
  })
  it('avatar scales with s', () => {
    const w = (s: string) => rect(render(`avatar ${s} "A"`).querySelector('mk-avatar')!).width
    expect(w('xl')).toBeGreaterThan(w('sm'))
  })
  it('badge is a pill; primary inverts', () => {
    const b = render('badge "New"').querySelector('mk-badge')!
    expect(parseFloat(css(b).borderRadius)).toBeGreaterThan(100)
    const p = render('badge primary "New"').querySelector('mk-badge')!
    expect(css(p).backgroundColor).not.toBe(css(b).backgroundColor)
  })
})

describe('text modifiers', () => {
  it('bold, muted, center', () => {
    const t = render('text bold muted center "x"').querySelector('mk-text')!
    expect(css(t).fontWeight).toBe('650')
    expect(css(t).textAlign).toBe('center')
    expect(css(t).color).not.toBe(css(render('text "x"').querySelector('mk-text')!).color)
  })
})

describe('recipes render', () => {
  it('card is a bordered box with a bold title', () => {
    const r = render('card "Plan"\n  text "body"')
    expect(css(r.querySelector('mk-box')!).borderTopWidth).toBe('1px')
    expect(css(r.querySelector('mk-text')!).fontWeight).toBe('650')
    expect(css(r.querySelector('mk-box')!).boxShadow).not.toBe('none')
  })
  it('navbar puts brand left and children right', () => {
    const r = render('navbar "Acme"\n  icon user', 600)
    const row = r.querySelector('mk-row')!
    expect(rect(r.querySelector('mk-icon')!).right).toBeLessThanOrEqual(rect(row).right)
    expect(rect(r.querySelector('mk-text')!).left).toBeLessThan(rect(r.querySelector('mk-icon')!).left)
  })
  it('table lines cells up in columns', () => {
    const r = render('table "Name|Role"\n  tr "Ana|Admin"\n  tr "Bo|Viewer"', 600)
    const grids = Array.from(r.querySelectorAll('mk-grid'))
    expect(grids).toHaveLength(3)
    const lefts = grids.map((g) => rect(g.querySelectorAll('mk-text')[1]!).left)
    expect(new Set(lefts.map(Math.round)).size).toBe(1)
  })
})
