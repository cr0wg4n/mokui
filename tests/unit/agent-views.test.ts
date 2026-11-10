import { describe, expect, it } from 'vitest'
import { cheatsheet, outline } from '../../src/index'
import { all } from '../../src/specs'

describe('outline', () => {
  const src = [
    'stack #login',
    '  input email label="Email" #email "you@x.com"',
    '  button primary #submit note="calls POST /login" "Sign in"',
    '  tabs "A|B"',
  ].join('\n')
  it('lists canonical tree, interactive inventory and notes', () => {
    const o = outline(src)
    expect(o).toContain('outline (4 elements)')
    expect(o).toContain('interactive (2):')
    expect(o).toContain('input:email "Email" #email')
    expect(o).toContain('button "Sign in" #submit')
    expect(o).toContain('submit: calls POST /login')
  })
  it('keeps recipes as written, expands on request', () => {
    expect(outline(src)).toContain('tabs "A|B"')
    expect(outline(src, { expandRecipes: true })).not.toContain('tabs')
  })
})

describe('cheatsheet', () => {
  const sheet = cheatsheet()
  it('documents every tag in the registry', () => {
    for (const s of all) expect(sheet).toContain(`${s.tag}`)
  })
  it('mentions intent attrs and responsive syntax', () => {
    expect(sheet).toContain('note (')
    expect(sheet).toContain('cols-md=3')
  })
  it('is compact', () => {
    expect(sheet.length).toBeLessThan(5000)
  })
})
