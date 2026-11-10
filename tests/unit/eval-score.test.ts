import { describe, expect, it } from 'vitest'
import { extractDsl, score, type Expect } from '../../eval/score'
import raw from '../../eval/prompts.json'

const prompts = raw as unknown as { id: string; prompt: string; expect: Expect }[]

describe('eval scoring (offline)', () => {
  const login = prompts.find((p) => p.id === 'login')!.expect
  it('passes a complete, valid mock', () => {
    const dsl = 'stack g=lg\n  icon user\n  input email "Email"\n  input password "Password"\n  checkbox "Remember me"\n  button primary "Sign in"'
    expect(score(dsl, login)).toMatchObject({ parses: true, ok: true, missing: [] })
  })
  it('reports what is missing', () => {
    const r = score('stack\n  icon user\n  input "Email"', login)
    expect(r.parses).toBe(true)
    expect(r.ok).toBe(false)
    expect(r.missing).toEqual(expect.arrayContaining(['input x2 (found 1)', 'button x1 (found 0)', 'checkbox x1 (found 0)']))
  })
  it('reports DSL errors with line numbers', () => {
    const r = score('stack\n  btn "x"', login)
    expect(r.parses).toBe(false)
    expect(r.errors[0]).toContain('line 2: unknown tag "btn"')
  })
  it('extracts DSL from a markdown fence', () => {
    expect(extractDsl('Here:\n```\nrow\n  icon x\n```\nDone')).toBe('row\n  icon x')
    expect(extractDsl('row')).toBe('row')
  })
  it('counts recipe output as primitives when the recipe is not written', () => {
    const t = score('table "A|B"\n  tr "1|2"', { tags: { table: 1, grid: 2 } })
    expect(t.ok).toBe(true)
  })
  it('every prompt has expectations and is satisfiable by some valid mock shape', () => {
    expect(prompts).toHaveLength(12)
    for (const p of prompts) expect(Object.keys(p.expect).length, p.id).toBeGreaterThan(0)
  })
})
