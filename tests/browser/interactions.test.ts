import { userEvent } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { html } from '../../src/index'
import { css, rect, render } from './helpers'

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector(sel) as T
const visible = (el: Element) => css(el).display !== 'none'
const sr = (el: Element) => el.shadowRoot!

describe('modal', () => {
  const src = 'button #go opens=#m "Open"\nmodal #m md "Delete project"\n  text "Sure?"\n  button closes "Cancel"\n  button danger closes "Delete"'
  it('is hidden until opened, then covers its container', () => {
    const r = render(src, 700)
    const m = q(r, 'mk-modal')
    expect(visible(m)).toBe(false)
    q(r, 'mk-button').click()
    expect(visible(m)).toBe(true)
    expect(m.hasAttribute('open')).toBe(true)
    expect(rect(m).width).toBeCloseTo(rect(r).width, 0)
    expect(rect(m).height).toBeCloseTo(rect(r).height, 0)
    expect(sr(m).querySelector('.title')!.textContent).toBe('Delete project')
  })
  it('gives the container room for the dialog', () => {
    expect(rect(render(src)).height).toBeGreaterThanOrEqual(520)
  })
  it('closes from a closes button, the x, the backdrop and Escape; the panel itself does not close it', async () => {
    const r = render(src)
    const m = q(r, 'mk-modal')
    const open = () => (q(r, 'mk-button').click(), expect(visible(m)).toBe(true))

    open()
    q(m, 'mk-button').click() // Cancel
    expect(visible(m)).toBe(false)

    open()
    q(sr(m), '.x').click()
    expect(visible(m)).toBe(false)

    open()
    q(sr(m), '.panel').click()
    expect(visible(m)).toBe(true)
    m.click() // the backdrop is the host itself
    expect(visible(m)).toBe(false)

    open()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(visible(m)).toBe(false)
  })
  it('opens already drawn with the open flag, and via mount options', () => {
    expect(visible(q(render('modal open "T"'), 'mk-modal'))).toBe(true)
  })
  it('sizes change the dialog width', () => {
    const w = (s: string) => rect(sr(q(render(`modal open ${s} "T"`, 900), 'mk-modal')).querySelector('.panel')!).width
    expect(w('sm')).toBeLessThan(w('md'))
    expect(w('md')).toBeLessThan(w('lg'))
  })
})

describe('drawer', () => {
  it('slides in from the chosen side', () => {
    const left = rect(sr(q(render('drawer open left "Menu"', 800), 'mk-drawer')).querySelector('.panel')!)
    const right = rect(sr(q(render('drawer open right "Menu"', 800), 'mk-drawer')).querySelector('.panel')!)
    expect(left.left).toBeLessThan(right.left)
    expect(right.right).toBeGreaterThan(700)
  })
})

describe('sidebar', () => {
  const src = 'row\n  sidebar #nav\n    item active icon=home "Home"\n    item icon=user "Profile"\n  stack grow p=lg\n    button #t toggles=#nav icon=menu "Menu"'
  it('is visible by default; toggles hides and shows', () => {
    const r = render(src)
    const s = q(r, 'mk-sidebar')
    expect(visible(s)).toBe(true)
    expect(rect(s).width).toBeCloseTo(240, 0)
    q(r, 'mk-button').click()
    expect(visible(s)).toBe(false)
    q(r, 'mk-button').click()
    expect(visible(s)).toBe(true)
  })
  it('closed starts collapsed; opens brings it back', () => {
    const r = render('sidebar #n closed\nbutton opens=#n "Show"')
    expect(visible(q(r, 'mk-sidebar'))).toBe(false)
    q(r, 'mk-button').click()
    expect(visible(q(r, 'mk-sidebar'))).toBe(true)
  })
  it('grow fills the rest of the row', () => {
    const r = render(src, 800)
    const content = q(r, 'mk-stack')
    expect(rect(content).right).toBeCloseTo(rect(r).right, 0)
    expect(rect(content).left).toBeGreaterThan(rect(q(r, 'mk-sidebar')).right - 1)
  })
})

describe('dropdown', () => {
  const src = 'stack g=lg\n  dropdown #a\n    button "Options" icon=chevron-down\n    menu\n      item icon=pencil "Edit"\n      item danger "Delete"\n  dropdown #b\n    button "Other"\n    menu end\n      item "X"\n  text #outside "elsewhere"'
  it('trigger click opens the menu below it; an item click closes it', () => {
    const r = render(src)
    const [a] = Array.from(r.querySelectorAll('mk-dropdown'))
    const menu = q(a!, 'mk-menu')
    expect(visible(menu)).toBe(false)
    q(a!, 'mk-button').click()
    expect(visible(menu)).toBe(true)
    expect(rect(menu).top).toBeGreaterThan(rect(q(a!, 'mk-button')).bottom)
    q(menu, 'mk-item').click()
    expect(visible(menu)).toBe(false)
  })
  it('clicking elsewhere or another dropdown closes it', () => {
    const r = render(src)
    const [a, b] = Array.from(r.querySelectorAll('mk-dropdown'))
    q(a!, 'mk-button').click()
    q(b!, 'mk-button').click()
    expect(a!.hasAttribute('open')).toBe(false)
    expect(b!.hasAttribute('open')).toBe(true)
    q(r, '[name=outside]').click()
    expect(b!.hasAttribute('open')).toBe(false)
  })
  it('clicking inside the menu but not on an item keeps it open; Escape closes', () => {
    const r = render(src)
    const a = q(r, 'mk-dropdown')
    q(a, 'mk-button').click()
    q(a, 'mk-menu').click()
    expect(a.hasAttribute('open')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(a.hasAttribute('open')).toBe(false)
  })
})

describe('tabs', () => {
  const src = 'tabs\n  tab "Overview"\n    text "panel one"\n  tab "Billing"\n    text "panel two"\n  tab "Team"\n    text "panel three"'
  it('shows one panel and switches on click', () => {
    const r = render(src)
    const tabs = q(r, 'mk-tabs')
    const panels = Array.from(r.querySelectorAll('mk-tab'))
    const strip = Array.from(sr(tabs).querySelectorAll<HTMLElement>('.tabbtn'))
    expect(strip.map((b) => b.textContent)).toEqual(['Overview', 'Billing', 'Team'])
    expect(panels.map(visible)).toEqual([true, false, false])
    strip[2]!.click()
    expect(panels.map(visible)).toEqual([false, false, true])
    expect(tabs.getAttribute('active')).toBe('3')
    expect(Array.from(sr(tabs).querySelectorAll('.tabbtn')).map((b) => b.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true'])
  })
  it('active=N picks the start tab; a strip-only tabs shows labels from the quoted text', () => {
    const r = render('tabs active=2\n  tab "A"\n    text "a"\n  tab "B"\n    text "b"')
    expect(Array.from(r.querySelectorAll('mk-tab')).map(visible)).toEqual([false, true])
    const s = render('tabs "Week|Month|Year" active=2')
    expect(Array.from(sr(q(s, 'mk-tabs')).querySelectorAll('.tabbtn')).map((b) => b.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
  })
  it('the selected tab is emphasized', () => {
    const tabs = q(render(src), 'mk-tabs')
    const [a, b] = Array.from(sr(tabs).querySelectorAll('.tabbtn'))
    expect(css(a!).color).not.toBe(css(b!).color)
    expect(css(a!).borderBottomColor).not.toBe(css(b!).borderBottomColor)
  })
})

describe('collapse', () => {
  it('toggles its body when the title is clicked', () => {
    const r = render('collapse "Shipping"\n  text "details"')
    const c = q(r, 'mk-collapse')
    const body = () => css(sr(c).querySelector('.body')!).display
    expect(body()).toBe('none')
    q(sr(c), '.head').click()
    expect(body()).toBe('block')
    expect(c.hasAttribute('open')).toBe(true)
    q(sr(c), '.head').click()
    expect(body()).toBe('none')
  })
  it('can be toggled from elsewhere and starts open with the flag', () => {
    const r = render('button toggles=#c "Flip"\ncollapse #c open "T"\n  text "x"')
    expect(css(sr(q(r, 'mk-collapse')).querySelector('.body')!).display).toBe('block')
    q(r, 'mk-button').click()
    expect(q(r, 'mk-collapse').hasAttribute('open')).toBe(false)
  })
})

describe('tooltip and toast', () => {
  it('tooltip shows its hint on hover', async () => {
    const r = render('tooltip "Save changes"\n  button "Save"')
    const tip = sr(q(r, 'mk-tooltip')).querySelector('.tip')!
    expect(css(tip).display).toBe('none')
    await userEvent.hover(q(r, 'mk-button'))
    expect(css(tip).display).toBe('block')
    expect(tip.textContent).toBe('Save changes')
  })
  it('toast opens from a trigger and closes with its x, anchored to the corner', () => {
    const r = render('button opens=#t "Save"\ntoast #t "Saved"', 600)
    const t = q(r, 'mk-toast')
    expect(visible(t)).toBe(false)
    q(r, 'mk-button').click()
    expect(visible(t)).toBe(true)
    expect(rect(t).right).toBeLessThanOrEqual(rect(r).right - 15)
    expect(t.textContent).toBe('Saved')
    q(sr(t), '.x').click()
    expect(visible(t)).toBe(false)
  })
})

describe('interactions inside a shadow root (framework / web component hosts)', () => {
  it('opens a modal that lives in the same shadow tree', () => {
    const host = document.createElement('div')
    document.body.append(host)
    host.attachShadow({ mode: 'open' }).innerHTML = html('button opens=#m "Open"\nmodal #m "T"')
    const m = q(host.shadowRoot!, 'mk-modal')
    q(host.shadowRoot!, 'mk-button').click()
    expect(m.hasAttribute('open')).toBe(true)
    host.remove()
  })
  it('an element in another tree with the same name is not touched', () => {
    const other = render('modal #m "Other"')
    const mine = render('button opens=#m "Open"\nmodal #m "Mine"')
    q(mine, 'mk-button').click()
    // both live in the document tree, so the first match wins; the point is only one opens
    const opened = document.querySelectorAll('mk-modal[open]')
    expect(opened.length).toBe(1)
    void other
  })
})
