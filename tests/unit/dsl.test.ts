import { describe, expect, it } from 'vitest'
import { MkError, parse, print, html, compile } from '../../src/index'

describe('parse', () => {
  it('parses nesting, attrs, bare words and quoted text', () => {
    expect(html('row g=md\n  icon search\n  text lg "Hi"')).toBe(
      '<mk-row g="md"><mk-icon n="search"></mk-icon><mk-text s="lg">Hi</mk-text></mk-row>',
    )
  })
  it('quoted attribute values and flags', () => {
    expect(html('button primary disabled icon=plus "Add"')).toBe(
      '<mk-button variant="primary" disabled icon="plus">Add</mk-button>',
    )
    expect(html('input label="Full name" "Your name"')).toBe('<mk-input label="Full name" ph="Your name"></mk-input>')
  })
  it('#name shorthand and intent attrs', () => {
    const [n] = parse('button #save note="calls the API" "Save"')
    expect(n!.attrs).toEqual({ name: 'save', note: 'calls the API' })
  })
  it('bare words resolve per tag (3 -> cols, mobile -> device, email -> type)', () => {
    expect(html('grid 3')).toContain('cols="3"')
    expect(html('frame mobile')).toContain('device="mobile"')
    expect(html('input email "x"')).toContain('type="email"')
  })
  it('does not treat prototype names as tags or values', () => {
    expect(() => parse('constructor')).toThrow('unknown tag')
    expect(() => parse('row g=constructor')).toThrow('invalid')
  })
})

describe('validation', () => {
  it('reports every error with line numbers', () => {
    try {
      parse('row g=huge\n  nope\n  icon\n   text')
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(MkError)
      const m = (e as MkError).message
      expect(m).toContain('line 1: <row> g="huge" invalid. Valid: none xs sm md lg xl')
      expect(m).toContain('line 2: unknown tag "nope"')
      expect(m).toContain('line 3: <icon> needs n')
      expect(m).toContain('line 4: indent must be a multiple of 2 spaces')
    }
  })
  it('rejects unknown attributes with the valid list', () => {
    expect(() => parse('row colour=red')).toThrow('<row> has no attribute "colour". Valid: g p')
  })
  it('accepts breakpoint variants only on responsive attrs', () => {
    expect(() => parse('grid cols=1 cols-md=3 g-lg=xl')).not.toThrow()
    expect(() => parse('row align-md=center')).toThrow('no attribute')
    expect(() => parse('grid cols-xl=3')).toThrow('no attribute')
  })
  it('rejects indent jumps and double text', () => {
    expect(() => parse('row\n    icon x')).toThrow('line 2: indent jumps')
    expect(() => parse('text "a" "b"')).toThrow('more than one quoted text')
  })
})

describe('print', () => {
  it('uses bare words where the parser resolves them back identically', () => {
    expect(print(parse('icon bell\ninput email label="E" "x"\ngrid 3\nslider 40'))).toBe('icon bell\ninput email label=E "x"\ngrid 3\nslider 40')
  })
  it('round-trips through parse', () => {
    const src = 'stack g=lg #root\n  input email label="Work email" "you@x.com"\n  button primary "Go"'
    const once = print(parse(src))
    expect(print(parse(once))).toBe(once)
  })
})

describe('recipes', () => {
  const tags = (src: string) => print(compile(src))
  it('card expands to a titled box', () => {
    expect(tags('card "Plan"\n  text "x"')).toBe('box p=md g=sm raised\n  text lg bold "Plan"\n  text "x"')
  })
  it('navbar expands to brand, spacer, children and a divider', () => {
    expect(tags('navbar "Acme"\n  icon user')).toBe(
      'stack\n  row align=center g=md p=md\n    text lg bold "Acme"\n    spacer\n    icon user\n  divider',
    )
  })
  it('table sizes grid columns from the header and wraps rows', () => {
    const out = tags('table "Name|Email"\n  tr "Ana|a@x.io"')
    expect(out).toContain('grid 2 g=md p=sm')
    expect(out.match(/grid 2/g)).toHaveLength(2)
  })
  it('list with divided inserts dividers', () => {
    expect(tags('list "a|b|c" divided').match(/divider/g)).toHaveLength(2)
  })
  it('compiled output contains only primitives', () => {
    const n = compile('card "T"\n  table "A|B"\n    tr "1|2"')
    const seen: string[] = []
    const walk = (xs: typeof n) => xs.forEach((x) => (seen.push(x.tag), walk(x.children)))
    walk(n)
    expect(seen.filter((t) => ['card', 'table', 'tr', 'navbar', 'list'].includes(t))).toEqual([])
  })
})
