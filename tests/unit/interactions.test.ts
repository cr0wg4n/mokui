import { describe, expect, it } from 'vitest'
import { cheatsheet, compile, MkError, outline, parse, print } from '../../src/core'

const errors = (src: string) => {
  try {
    parse(src)
  } catch (e) {
    return (e as MkError).errors
  }
  return []
}

describe('interaction attributes', () => {
  it('opens/toggles/closes parse, normalizing a leading #', () => {
    const [b, m] = parse('button opens=#m "Go"\nmodal #m "T"\n  button closes "No"')
    expect(b!.attrs.opens).toBe('m')
    expect(m!.children[0]!.attrs.closes).toBe('')
    expect(parse('button toggles=nav\nsidebar #nav')[0]!.attrs.toggles).toBe('nav')
  })
  it('round-trips through print', () => {
    const src = 'button opens=#m "Go"\nmodal #m "T"\n  button closes "No"\n  button closes=#m "Also"'
    const once = print(parse(src))
    expect(once).toContain('button opens=#m "Go"')
    expect(once).toContain('button closes "No"')
    expect(print(parse(once))).toBe(once)
  })
})

describe('reference validation', () => {
  it('missing target lists the names that exist', () => {
    expect(errors('button opens=#nope "x"\nmodal #m "T"')[0]).toBe('line 1: opens=#nope has no target. Names: m')
    expect(errors('button opens=#nope "x"')[0]).toContain('add #name')
  })
  it('duplicate names', () => {
    expect(errors('text #a "x"\ntext #a "y"')[0]).toBe('line 2: duplicate name #a (first used on line 1)')
  })
  it('target must be able to open and close', () => {
    const e = errors('button opens=#b "x"\nbox #b')[0]!
    expect(e).toContain('targets <box>')
    for (const t of ['modal', 'drawer', 'sidebar', 'dropdown', 'popover', 'toast', 'collapse']) expect(e, t).toContain(t)
  })
  it('closes needs an overlay or a target; opens/toggles need a target', () => {
    expect(errors('button closes "x"')[0]).toContain('closes needs an enclosing overlay')
    expect(errors('button opens "x"')[0]).toContain('opens needs a target')
    expect(errors('modal #m "T"\n  button closes "x"')).toEqual([])
    expect(errors('button closes=#m "x"\nmodal #m "T"')).toEqual([])
  })
  it('menu must be inside dropdown, tab inside tabs', () => {
    expect(errors('menu')[0]).toContain('<menu> must be directly inside <dropdown>')
    expect(errors('tab "A"')[0]).toContain('<tab> must be directly inside <tabs>')
    expect(errors('dropdown\n  button "x"\n  menu\n    item "A"')).toEqual([])
    expect(errors('tabs\n  tab "A"\n    text "x"')).toEqual([])
  })
})

describe('compile with open states', () => {
  it('draws the named element open', () => {
    const [m] = compile('modal #m "T"', { open: ['m'] })
    expect(m!.attrs.open).toBe('')
  })
  it('sidebar is visible unless closed; open removes closed', () => {
    const [s] = compile('sidebar #s closed', { open: ['s'] })
    expect('closed' in s!.attrs).toBe(false)
  })
  it('reports unknown names and elements without an open state', () => {
    expect(() => compile('modal #m "T"', { open: ['x'] })).toThrow('open: no element named #x')
    expect(() => compile('box #b', { open: ['b'] })).toThrow('has no open state')
  })
  it('works through recipes that carry the name', () => {
    expect(() => compile('card #c "T"', { open: ['c'] })).toThrow('has no open state')
  })
})

describe('outline shows flows and states', () => {
  const src = [
    'button #edit opens=#m "Edit"',
    'button #menu toggles=#nav "Menu"',
    'sidebar #nav',
    'modal #m "Edit profile"',
    '  button closes "Cancel"',
    '  button closes=#nav "Also"',
  ].join('\n')
  const o = outline(src)
  it('lists interactions', () => {
    expect(o).toContain('interactions (4):')
    expect(o).toContain('button "Edit" #edit -> opens #m')
    expect(o).toContain('button "Menu" #menu -> toggles #nav')
    expect(o).toContain('button "Cancel" -> closes its overlay')
    expect(o).toContain('button "Also" -> closes #nav')
  })
  it('lists states with how to draw them open', () => {
    expect(o).toContain('states (draw one open with: mokui render --open <name>):')
    expect(o).toContain('sidebar #nav (starts open)')
    expect(o).toContain('modal "Edit profile" #m (starts closed)')
  })
})

describe('cheat sheet', () => {
  const sheet = cheatsheet()
  it('documents interactions, themes and the new tags', () => {
    const line = sheet.split('\n').find((l) => l.startsWith('Interactions: targets are #names of'))!
    for (const t of ['modal', 'drawer', 'sidebar', 'dropdown', 'popover', 'toast', 'collapse']) expect(line, t).toContain(t)
    expect(sheet).toContain('theme=modern|dark|wire')
    for (const t of ['modal', 'drawer', 'sidebar', 'dropdown', 'popover', 'menu', 'item', 'tooltip', 'toast', 'collapse', 'tabs', 'tab']) expect(sheet.split('\n').some((l) => l.startsWith(`${t}:`) || l.startsWith(`${t} `)), t).toBe(true)
  })
  it('stays compact', () => {
    expect(sheet.length).toBeLessThan(6500)
  })
})
