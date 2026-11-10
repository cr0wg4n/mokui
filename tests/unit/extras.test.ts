import { describe, expect, it } from 'vitest'
import { cheatsheet, compile, MkError, PACKS, parse, print } from '../../src/core'
import { all, packOf } from '../../src/tags'

const err = (src: string) => {
  try {
    parse(src)
  } catch (e) {
    return (e as MkError).message
  }
  return ''
}
const flat = (src: string) => print(compile(src))

describe('packs', () => {
  it('every tag belongs to exactly one pack, and every pack entry is a real tag', () => {
    for (const s of all) expect(packOf(s.tag), s.tag).toBeDefined()
    const listed = Object.values(PACKS).flat()
    expect(new Set(listed).size).toBe(listed.length)
    for (const t of listed) expect(all.some((s) => s.tag === t), t).toBe(true)
  })
  it('the default cheat sheet covers core and overlay and indexes the rest; all covers everything', () => {
    const d = cheatsheet()
    expect(d).toContain('stack: ')
    expect(d).toContain('modal')
    expect(d).not.toContain('chart "')
    expect(d).toContain('More tags exist')
    expect(d).toContain('feedback=alert,progress')
    expect(cheatsheet({ packs: ['data'] })).toContain('chart: ')
    expect(cheatsheet({ packs: 'all' })).not.toContain('More tags exist')
    expect(() => cheatsheet({ packs: ['nope'] })).toThrow('unknown pack "nope"')
  })
  it('the parser accepts every tag even when its pack was not documented', () => {
    expect(() => parse('chart donut\nalert warning "Heads up"\nbreadcrumb "A|B"')).not.toThrow()
  })
})

describe('new primitives parse and validate', () => {
  it('feedback', () => {
    expect(() => parse('alert success x "Saved"\n  text "body"\nprogress 40\nspinner lg\nskeleton 3\nskeleton circle\nrating 4\nchip x icon=star "Design"')).not.toThrow()
    expect(err('alert variant=fatal "x"')).toContain('variant="fatal" invalid. Valid: info success warning error')
    expect(err('alert fatal "x"')).toContain('unexpected "fatal"')
    expect(err('skeleton lines=9')).toContain('invalid')
  })
  it('data', () => {
    expect(() => parse('chart line values="3,5,2" labels="Mon|Tue|Wed" h=lg\ncalendar month="2026-11" value=12 range="14-18"\navatars\n  avatar "A"\ncode "npm i"\nkbd "K"\nvideo 4:3 "Intro"')).not.toThrow()
    expect(err('chart radar')).toContain('unexpected "radar"')
    expect(err('chart kind=radar')).toContain('invalid. Valid: line bar area donut pie')
  })
  it('forms', () => {
    expect(() => parse('segmented "Day|Week" active=2\nupload "Drop"\notp 4 value=12\ninput email help="We never share it" "x"\ninput error="Required" "x"\nlink muted "Forgot?"')).not.toThrow()
    expect(err('otp 7')).toContain('unexpected "7"')
  })
  it('overlay extras', () => {
    expect(() => parse('popover\n  button "Filters"\n  stack\n    text "x"\ndrawer bottom "Sheet"\nbutton fab icon=plus\ndivider "OR"')).not.toThrow()
    expect(err('drawer middle')).toContain('unexpected "middle"')
  })
  it('badge status variants', () => {
    expect(() => parse('badge success "ok"\nbadge warning "w"\nbadge error "e"\nbadge info "i"')).not.toThrow()
  })
  it('newline escape in quoted text round-trips', () => {
    const [n] = parse('code block "a\\nb"')
    expect(n!.text).toBe('a\nb')
    expect(print([n!])).toBe('code block "a\\nb"')
  })
})

describe('new recipes expand to primitives', () => {
  it('breadcrumb: chevrons between items, last bold', () => {
    const o = flat('breadcrumb "Home|Projects|Settings"')
    expect(o.match(/icon chevron-right/g)).toHaveLength(2)
    expect(o).toContain('text sm bold "Settings"')
    expect(o).toContain('text sm muted "Home"')
  })
  it('pagination: prev, items, next; the active page is primary; ellipsis is text', () => {
    const o = flat('pagination "1|2|3|…|10" active=2')
    expect(o).toContain('button sm primary "2"')
    expect(o).toContain('button sm ghost "1"')
    expect(o).toContain('text muted "…"')
    expect(o.match(/icon=chevron-/g)).toHaveLength(2)
  })
  it('steps: done steps get a check, the current one is primary and bold, dividers between', () => {
    const o = flat('steps "Account|Plan|Confirm" active=2')
    expect(o).toContain('badge primary "✓"')
    expect(o).toContain('badge primary "2"')
    expect(o).toContain('badge "3"')
    expect(o).toContain('text bold "Plan"')
    expect(o.match(/divider grow/g)).toHaveLength(2)
  })
  it('tabbar: icon + label, active bold, label override with :', () => {
    const o = flat('tabbar "home|search|bell:Alerts" active=3')
    expect(o).toContain('icon home muted')
    expect(o).toContain('text xs bold "Alerts"')
    expect(o).toContain('text xs muted "Home"')
  })
  it('stat: badge is success for +, error for -', () => {
    expect(flat('stat "Revenue" value="$12k" delta="+8%"')).toContain('badge success "+8%"')
    expect(flat('stat "Churn" value="3%" delta="-1%"')).toContain('badge error "-1%"')
    expect(flat('stat "Plain" value="1"')).not.toContain('badge')
  })
  it('empty, hero, footer, toolbar', () => {
    expect(flat('empty "No projects" sub="Create one" icon=folder\n  button primary "New"')).toContain('icon folder xl muted')
    expect(flat('hero "Ship faster" sub="Mocks in seconds"\n  button primary "Start"')).toContain('text xl bold center "Ship faster"')
    expect(flat('footer "Acme|Privacy|Terms"')).toContain('text sm muted "Acme"')
    expect(flat('toolbar\n  button "A"')).toContain('box dir=row align=center g=sm p=sm fill')
  })
  it('timeline: done steps checked, descriptions after a colon', () => {
    const o = flat('timeline "Created:Mar 3|Reviewed|Shipped" active=2')
    expect(o.match(/icon circle-check/g)).toHaveLength(2)
    expect(o).toContain('icon circle muted')
    expect(o).toContain('text sm muted "Mar 3"')
  })
  it('radios and checkboxes: select by text or 1-based number', () => {
    expect(flat('radios "A|B|C" value=B')).toContain('radio checked "B"')
    expect(flat('radios "A|B|C" value=3')).toContain('radio checked "C"')
    const c = flat('checkboxes "A|B|C" checked="1,C" inline')
    expect(c).toContain('checkbox checked "A"')
    expect(c).toContain('checkbox checked "C"')
    expect(c).not.toContain('checked "B"')
    expect(c.startsWith('row')).toBe(true)
  })
  it('command expands to a modal that opens by name', () => {
    expect(() => compile('button opens=#cmd "Search"\ncommand #cmd "Type a command|New file|Open"', { open: ['cmd'] })).not.toThrow()
    const nodes = compile('command #cmd "Type a command|New file|Open"')
    expect(nodes[0]!.tag).toBe('modal')
    expect(nodes[0]!.attrs.name).toBe('cmd')
    expect(print(nodes)).toContain('item "New file"')
    expect(() => parse('button opens=#cmd "S"\ncommand #cmd "Type|A"')).not.toThrow()
  })
})
