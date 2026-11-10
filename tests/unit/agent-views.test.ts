import { describe, expect, it } from 'vitest'
import { cheatsheet, outline } from '../../src/index'
import { all } from '../../src/tags'

describe('outline', () => {
  const src = [
    'stack #login',
    '  input email label="Email" #email "you@x.com"',
    '  button primary #submit note="calls POST /login" "Sign in"',
    '  card "Help"',
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
    expect(outline(src)).toContain('card "Help"')
    expect(outline(src, { expandRecipes: true })).not.toContain('card')
  })
})

describe('cheatsheet', () => {
  const sheet = cheatsheet({ packs: 'all' })
  it('documents every tag in the registry when all packs are requested', () => {
    for (const s of all) expect(sheet).toContain(`${s.tag}`)
  })
  it('mentions intent attrs and responsive syntax', () => {
    expect(sheet).toContain('note (')
    expect(sheet).toContain('cols-md=3')
  })
  it('is compact', () => {
    expect(sheet.length).toBeLessThan(9000)
  })
})
