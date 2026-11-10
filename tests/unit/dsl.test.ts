import { describe, expect, it } from 'vitest'
import { parse, toHTML } from '../../src/dsl/parse'

describe('dsl', () => {
  it('parses nesting, attrs, positionals and text', () => {
    const html = toHTML(parse('row g=md\n  icon search\n  text lg "Hi"'))
    expect(html).toBe(
      '<mk-row g="md"><mk-icon n="search"></mk-icon><mk-text s="lg">Hi</mk-text></mk-row>',
    )
  })
  it('errors with line numbers', () => {
    expect(() => parse('row\n   icon x')).toThrow('line 2')
    expect(() => parse('row\n    icon x')).toThrow('line 2')
  })
})
