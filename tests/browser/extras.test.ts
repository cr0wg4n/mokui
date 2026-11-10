import { describe, expect, it } from 'vitest'
import { css, rect, render } from './helpers'

const q = <T extends Element = HTMLElement>(r: ParentNode, sel: string) => r.querySelector(sel) as T
const qa = (r: ParentNode, sel: string) => Array.from(r.querySelectorAll(sel))
const sr = (el: Element) => el.shadowRoot!
const visible = (el: Element) => css(el).display !== 'none'

describe('feedback', () => {
  it('alert variants use different tones and show an icon, title and body', () => {
    const colors = ['info', 'success', 'warning', 'error'].map((v) => css(q(render(`alert ${v} "T"\n  text "body"`), 'mk-alert')).borderTopColor)
    expect(new Set(colors).size).toBe(4)
    const a = q(render('alert warning "Heads up"\n  text "Check this"'), 'mk-alert')
    expect(sr(a).querySelector('.ico svg')).not.toBeNull()
    expect(sr(a).querySelector('.t')!.textContent).toBe('Heads up')
    expect(a.textContent).toBe('Check this')
    expect(a.getAttribute('role')).toBe('alert')
  })
  it('alert x makes it dismissible', () => {
    const r = render('alert x "Bye"')
    const a = q(r, 'mk-alert')
    expect(css(q(sr(a), '.xbtn')).display).not.toBe('none')
    expect(css(q(render('alert "No x"'), 'mk-alert').shadowRoot!.querySelector('.xbtn')!).display).toBe('none')
    q(sr(a), '.xbtn').click()
    expect(visible(a)).toBe(false)
  })
  it('progress fills the requested share and clamps', () => {
    const p = q(render('progress 40', 500), 'mk-progress')
    expect(rect(q(sr(p), '.bar')).width / rect(p).width).toBeCloseTo(0.4, 2)
    expect(p.getAttribute('aria-valuenow')).toBe('40')
    expect(q(sr(q(render('progress 250'), 'mk-progress')), '.bar').style.width).toBe('100%')
  })
  it('spinner is a still ring with an accent arc', () => {
    const s = css(q(render('spinner lg'), 'mk-spinner'))
    expect(s.borderTopColor).toBe('rgb(24, 24, 27)')
    expect(s.borderRadius).toBe('50%')
  })
  it('skeleton draws N bars, the last shorter; circle is round', () => {
    const s = q(render('skeleton 3', 300), 'mk-skeleton')
    const bars = qa(sr(s), '.bar')
    expect(bars).toHaveLength(3)
    expect(rect(bars[2]!).width).toBeLessThan(rect(bars[0]!).width * 0.7)
    const c = q(render('skeleton circle'), 'mk-skeleton')
    expect(Math.round(rect(c).width)).toBe(Math.round(rect(c).height))
    expect(css(q(sr(c), '.bar')).borderRadius).toBe('50%')
  })
  it('rating fills value stars out of five', () => {
    const r = q(render('rating 3'), 'mk-rating')
    const stars = qa(sr(r), 'svg')
    expect(stars).toHaveLength(5)
    expect(stars.filter((s) => s.getAttribute('fill') === 'currentColor')).toHaveLength(3)
    expect(stars.filter((s) => s.classList.contains('off'))).toHaveLength(2)
  })
  it('chip shows an icon and a remove x on request, and active inverts', () => {
    const c = q(render('chip x icon=star "Design"'), 'mk-chip')
    expect(sr(c).querySelector('.ico svg')).not.toBeNull()
    expect(sr(c).querySelector('.rm svg')).not.toBeNull()
    expect(sr(q(render('chip "Plain"'), 'mk-chip')).querySelector('.rm svg')).toBeNull()
    expect(css(q(render('chip active "On"'), 'mk-chip')).backgroundColor).toBe('rgb(24, 24, 27)')
  })
})

describe('chart', () => {
  it('draws each kind from fake data', () => {
    const svg = (k: string) => sr(q(render(`chart ${k}`), 'mk-chart')).querySelector('svg')!
    expect(svg('line').querySelectorAll('polyline')).toHaveLength(1)
    expect(svg('line').querySelector('polyline')!.getAttribute('points')!.split(' ')).toHaveLength(7)
    expect(svg('area').querySelectorAll('polygon,polyline')).toHaveLength(2)
    expect(svg('bar').querySelectorAll('rect')).toHaveLength(7)
    expect(svg('donut').querySelectorAll('circle')).toHaveLength(4)
    expect(svg('pie').querySelectorAll('circle')).toHaveLength(4)
  })
  it('values override the data; labels render under the chart', () => {
    const c = q(render('chart bar values="3,5,2" labels="Mon|Tue|Wed"'), 'mk-chart')
    expect(sr(c).querySelectorAll('rect')).toHaveLength(3)
    expect(qa(sr(c), '.labs span').map((s) => s.textContent)).toEqual(['Mon', 'Tue', 'Wed'])
  })
  it('is deterministic: the same source always draws the same picture', () => {
    const html = () => sr(q(render('chart area'), 'mk-chart')).querySelector('svg')!.innerHTML
    expect(html()).toBe(html())
  })
  it('h sets the height', () => {
    const h = (s: string) => rect(sr(q(render(`chart line h=${s}`), 'mk-chart')).querySelector('svg')!).height
    expect(h('sm')).toBeCloseTo(96, 0)
    expect(h('lg')).toBeCloseTo(240, 0)
  })
  it('donut segments are drawn in the accent color', () => {
    expect(sr(q(render('chart donut'), 'mk-chart')).querySelector('circle')!.getAttribute('stroke')).toContain('--mk-accent')
  })
})

describe('calendar', () => {
  it('draws November 2026 by default (starts on a Sunday, 30 days, 5 weeks)', () => {
    const c = q(render('calendar'), 'mk-calendar')
    expect(sr(c).querySelector('.title')!.textContent).toBe('November 2026')
    const cells = qa(sr(c), '.g span')
    expect(cells).toHaveLength(7 + 35)
    expect(cells.slice(0, 7).map((x) => x.textContent)).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'])
    expect(cells[7]!.textContent).toBe('1')
    expect(cells[7]!.className).toBe('')
    expect(cells.filter((x) => x.className === '')).toHaveLength(30 + 0)
  })
  it('other months lead and trail with muted days', () => {
    const cells = qa(sr(q(render('calendar month="2026-05"'), 'mk-calendar')), '.g span')
    expect(sr(q(render('calendar month="2026-05"'), 'mk-calendar')).querySelector('.title')!.textContent).toBe('May 2026')
    expect(cells[7]!.className).toBe('out') // May 1, 2026 is a Friday: the first cells are April days
    expect(cells.some((x) => x.className === 'out' && x.textContent === '30')).toBe(true)
  })
  it('value marks a day, range highlights a span', () => {
    const c = q(render('calendar value=12 range="14-18"'), 'mk-calendar')
    const sel = qa(sr(c), '.sel')
    expect(sel).toHaveLength(1)
    expect(sel[0]!.textContent).toBe('12')
    expect(css(sel[0]!).backgroundColor).toBe('rgb(24, 24, 27)')
    expect(qa(sr(c), '.in').map((x) => x.textContent)).toEqual(['14', '15', '16', '17', '18'])
  })
  it('lays out seven columns', () => {
    const cells = qa(sr(q(render('calendar'), 'mk-calendar')), '.g span')
    expect(new Set(cells.slice(0, 7).map((x) => Math.round(rect(x).left))).size).toBe(7)
    expect(Math.round(rect(cells[0]!).left)).toBe(Math.round(rect(cells[7]!).left))
  })
})

describe('data helpers', () => {
  it('avatars overlap', () => {
    const [a, b] = qa(render('avatars\n  avatar "A"\n  avatar "B"\n  avatar "C"'), 'mk-avatar')
    expect(rect(b!).left).toBeLessThan(rect(a!).right)
    expect(rect(b!).left).toBeGreaterThan(rect(a!).left)
  })
  it('code is monospace; block is a multi-line box; kbd looks like a key', () => {
    const r = render('code "npm i"\ncode block "a\\nb"\nkbd "K"')
    const [inline, block] = qa(r, 'mk-code')
    expect(css(inline!).fontFamily).toContain('monospace')
    expect(css(block!).display).toBe('block')
    expect(css(block!).whiteSpace).toBe('pre-wrap')
    expect(block!.textContent).toBe('a\nb')
    expect(css(q(r, 'mk-kbd')).borderBottomWidth).toBe('2px')
  })
  it('video has a play button and the requested ratio', () => {
    const v = q(render('video 4:3 "Intro"', 400), 'mk-video')
    expect(sr(v).querySelector('.play svg')).not.toBeNull()
    expect(rect(v).width / rect(v).height).toBeCloseTo(4 / 3, 1)
    expect(v.textContent).toBe('Intro')
  })
})

describe('forms', () => {
  it('segmented shows options and switches on click', () => {
    const s = q(render('segmented "Day|Week|Month" active=2'), 'mk-segmented')
    const sel = () => qa(sr(s), '.sb').map((b) => b.getAttribute('aria-selected'))
    expect(sel()).toEqual(['false', 'true', 'false'])
    ;(qa(sr(s), '.sb')[2] as HTMLElement).click()
    expect(sel()).toEqual(['false', 'false', 'true'])
    expect(s.getAttribute('active')).toBe('3')
    const [first, , third] = qa(sr(s), '.sb')
    expect(css(third!).backgroundColor).not.toBe(css(first!).backgroundColor)
  })
  it('upload is a dashed drop zone with a prompt and an icon', () => {
    const u = q(render('upload "Drop your CV"'), 'mk-upload')
    expect(css(u).borderTopStyle).toBe('dashed')
    expect(sr(u).querySelector('.t')!.textContent).toBe('Drop your CV')
    expect(sr(u).querySelector('.ico svg')).not.toBeNull()
    expect(sr(q(render('upload'), 'mk-upload')).querySelector('.t')!.textContent).toBe('Drop files here')
  })
  it('otp draws N boxes and fills digits', () => {
    expect(qa(sr(q(render('otp 4'), 'mk-otp')), '.d')).toHaveLength(4)
    expect(qa(sr(q(render('otp'), 'mk-otp')), '.d')).toHaveLength(6)
    expect(qa(sr(q(render('otp 6 value=123'), 'mk-otp')), '.d').map((d) => d.textContent)).toEqual(['1', '2', '3', '', '', ''])
  })
  it('input help is muted text; error is red text and a red border', () => {
    const h = q(render('input help="We never share it" "x"'), 'mk-input')
    expect(sr(h).querySelector('.msg')!.textContent).toBe('We never share it')
    expect(sr(h).querySelector('.msg')!.classList.contains('err')).toBe(false)
    const e = q(render('input error="Required" label="Name" "x"'), 'mk-input')
    expect(sr(e).querySelector('.msg')!.textContent).toBe('Required')
    expect(css(q(sr(e), '.msg')).color).toBe('rgb(220, 38, 38)')
    expect(css(q(sr(e), '.field')).borderTopColor).toBe('rgb(220, 38, 38)')
    expect(css(q(sr(q(render('input "x"'), 'mk-input')), '.msg')).display).toBe('none')
  })
  it('help and error work on textarea and select too', () => {
    expect(sr(q(render('textarea error="Too short" "x"'), 'mk-textarea')).querySelector('.msg')!.textContent).toBe('Too short')
    expect(sr(q(render('select help="Pick one" "A|B"'), 'mk-select')).querySelector('.msg')!.textContent).toBe('Pick one')
  })
  it('link is underlined', () => {
    const l = css(q(render('link "Sign up"'), 'mk-link'))
    expect(l.textDecorationLine).toBe('underline')
    expect(css(q(render('link muted "Later"'), 'mk-link')).color).toBe('rgb(113, 113, 122)')
  })
})

describe('overlay extras', () => {
  const src = 'stack\n  popover #p\n    button "Filters"\n    stack g=sm p=sm\n      checkbox "Active"\n      button closes "Done"\n  text #out "elsewhere"'
  it('popover opens on trigger click, stays open for clicks inside its panel, closes outside and on closes', () => {
    const r = render(src)
    const pop = q(r, 'mk-popover')
    const panel = q(pop, 'mk-stack')
    expect(visible(panel)).toBe(false)
    q(pop, 'mk-button').click()
    expect(visible(panel)).toBe(true)
    expect(rect(panel).top).toBeGreaterThan(rect(q(pop, 'mk-button')).bottom)
    q(pop, 'mk-checkbox').click()
    expect(pop.hasAttribute('open')).toBe(true)
    q(r, '[name=out]').click()
    expect(pop.hasAttribute('open')).toBe(false)
    q(pop, 'mk-button').click()
    expect(pop.hasAttribute('open')).toBe(true)
    ;(qa(pop, 'mk-button')[1] as HTMLElement).click() // closes
    expect(pop.hasAttribute('open')).toBe(false)
  })
  it('popover can be opened from elsewhere by name', () => {
    const r = render('button opens=#p "Open"\npopover #p\n  button "Trigger"\n  text "Panel"')
    q(r, 'mk-button').click()
    expect(q(r, 'mk-popover').hasAttribute('open')).toBe(true)
  })
  it('drawer bottom is a sheet spanning the width and anchored to the bottom', () => {
    const d = q(render('drawer open bottom "Share"\n  text "x"', 500), 'mk-drawer')
    const panel = rect(sr(d).querySelector('.panel')!)
    expect(panel.width).toBeCloseTo(rect(d).width, 0)
    expect(panel.bottom).toBeCloseTo(rect(d).bottom, 0)
    expect(panel.top).toBeGreaterThan(rect(d).top + 50)
  })
  it('fab floats in the bottom-right corner of the container', () => {
    const r = render('stack h=lg\n  text "page"\nbutton fab icon=plus', 600)
    const f = rect(q(r, 'mk-button'))
    expect(f.width).toBeCloseTo(56, 0)
    expect(f.right).toBeCloseTo(rect(r).right - 16, 0)
    expect(f.bottom).toBeCloseTo(rect(r).bottom - 16, 0)
    expect(css(q(r, 'mk-button')).borderRadius).toBe('50%')
  })
  it('divider with a label draws a line, the text, then a line', () => {
    const d = q(render('stack\n  divider "OR"', 400), 'mk-divider')
    expect(sr(d).querySelector('.t')!.textContent).toBe('OR')
    const [l1, l2] = qa(sr(d), '.l').map(rect)
    expect(l1!.width).toBeGreaterThan(50)
    expect(l2!.width).toBeGreaterThan(50)
    expect(l1!.right).toBeLessThan(rect(q(sr(d), '.t')).left)
  })
  it('a plain divider is unchanged', () => {
    expect(rect(q(render('stack\n  divider'), 'mk-divider')).height).toBeCloseTo(1, 0)
  })
})

describe('status colors', () => {
  it('badge variants differ; icon muted dims', () => {
    const c = ['success', 'warning', 'error', 'info'].map((v) => css(q(render(`badge ${v} "x"`), 'mk-badge')).color)
    expect(new Set(c).size).toBe(4)
    expect(css(q(render('icon bell muted'), 'mk-icon')).color).toBe('rgb(113, 113, 122)')
  })
  it('themes remap status colors for dark', () => {
    expect(css(q(render('stack theme=dark\n  badge success "x"'), 'mk-badge')).color).toBe('rgb(74, 222, 128)')
  })
})

describe('new recipes render', () => {
  it('breadcrumb reads left to right with chevrons', () => {
    const r = render('breadcrumb "Home|Projects|Settings"')
    expect(qa(r, 'mk-icon')).toHaveLength(2)
    const t = qa(r, 'mk-text').map((e) => rect(e).left)
    expect(t).toEqual([...t].sort((a, b) => a - b))
    expect(css(qa(r, 'mk-text')[2]!).fontWeight).toBe('650')
  })
  it('pagination highlights the active page', () => {
    const r = render('pagination "1|2|3" active=2')
    const bs = qa(r, 'mk-button')
    expect(bs).toHaveLength(5)
    expect(css(bs[2]!).backgroundColor).toBe('rgb(24, 24, 27)')
    expect(css(bs[1]!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })
  it('steps connects the steps with lines that grow', () => {
    const r = render('steps "Account|Plan|Confirm" active=2', 600)
    const dividers = qa(r, 'mk-divider')
    expect(dividers).toHaveLength(2)
    for (const d of dividers) expect(rect(d).width).toBeGreaterThan(20)
    expect(qa(r, 'mk-badge')[0]!.textContent).toBe('✓')
  })
  it('tabbar spreads items across the full width, each an icon over a label', () => {
    const r = render('tabbar "home|search|bell|user" active=1', 400)
    const items = qa(r, 'mk-row > mk-stack')
    expect(items).toHaveLength(4)
    const widths = items.map((i) => Math.round(rect(i).width))
    expect(new Set(widths).size).toBe(1)
    expect(rect(q(items[0]!, 'mk-icon')).bottom).toBeLessThanOrEqual(rect(q(items[0]!, 'mk-text')).top + 1)
  })
  it('stat shows label, number and a delta badge', () => {
    const r = render('stat "Revenue" value="$12.4k" delta="+8%"')
    expect(qa(r, 'mk-text').map((t) => t.textContent)).toEqual(['Revenue', '$12.4k'])
    expect(q(r, 'mk-badge').textContent).toBe('+8%')
    expect(css(q(r, 'mk-box')).boxShadow).not.toBe('none')
  })
  it('hero centers its text; footer pushes links to the right', () => {
    const h = render('hero "Ship faster" sub="Mocks in seconds"\n  button primary "Start"', 600)
    expect(css(q(h, 'mk-text')).textAlign).toBe('center')
    const t = rect(q(h, 'mk-text'))
    expect(t.left + t.width / 2).toBeCloseTo(rect(h).left + rect(h).width / 2, -1)
    const f = render('footer "Acme|Privacy|Terms"', 600)
    const ts = qa(f, 'mk-text')
    expect(rect(ts[0]!).left).toBeLessThan(rect(f).left + 40)
    expect(rect(ts[2]!).right).toBeGreaterThan(rect(f).right - 40)
  })
  it('empty centers an icon, title and action', () => {
    const r = render('empty "No projects" sub="Create one"\n  button primary "New"', 500)
    expect(q(r, 'mk-icon')).not.toBeNull()
    const b = rect(q(r, 'mk-button'))
    expect(b.left + b.width / 2).toBeCloseTo(rect(r).left + rect(r).width / 2, -1)
  })
  it('timeline lists steps vertically with a done marker', () => {
    const r = render('timeline "Created:Mar 3|Reviewed|Shipped" active=1')
    const rows = qa(r, 'mk-stack > mk-row')
    expect(rows).toHaveLength(3)
    expect(rect(rows[1]!).top).toBeGreaterThan(rect(rows[0]!).bottom - 1)
    expect(css(qa(r, 'mk-icon')[1]!).color).toBe('rgb(113, 113, 122)')
  })
  it('radios and checkboxes lay out as a group, inline in a row', () => {
    const r = render('radios "A|B|C" value=B\ncheckboxes "X|Y" checked=1 inline', 500)
    const radios = qa(r, 'mk-radio')
    expect(radios.map((e) => e.hasAttribute('checked'))).toEqual([false, true, false])
    expect(rect(radios[1]!).top).toBeGreaterThan(rect(radios[0]!).top)
    const [x, y] = qa(r, 'mk-checkbox')
    expect(x!.hasAttribute('checked')).toBe(true)
    expect(Math.round(rect(y!).top)).toBe(Math.round(rect(x!).top))
  })
  it('command opens as a modal with a search field and items', () => {
    const r = render('button opens=#cmd "Search"\ncommand #cmd "Type a command|New file|Open project"')
    const m = q(r, 'mk-modal')
    expect(visible(m)).toBe(false)
    q(r, 'mk-button').click()
    expect(visible(m)).toBe(true)
    expect(sr(q(m, 'mk-input')).querySelector('.txt')!.textContent).toBe('Type a command')
    expect(qa(m, 'mk-item').map((i) => i.textContent)).toEqual(['New file', 'Open project'])
  })
  it('toolbar is a filled row of actions', () => {
    const r = render('toolbar\n  button "A"\n  button "B"')
    expect(css(q(r, 'mk-box')).flexDirection).toBe('row')
    expect(css(q(r, 'mk-box')).backgroundColor).toBe('rgb(244, 244, 245)')
  })
})
