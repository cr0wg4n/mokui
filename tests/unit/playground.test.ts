import { describe, expect, it } from 'vitest'
import { compile, outline } from '../../src/core'
import { examples } from '../../playground/examples'

describe('playground examples', () => {
  it('has unique ids and several examples', () => {
    expect(new Set(examples.map((e) => e.id)).size).toBe(examples.length)
    expect(examples.length).toBeGreaterThanOrEqual(6)
  })
  for (const e of examples) {
    it(`${e.id} compiles and has an outline`, () => {
      expect(compile(e.src).length).toBeGreaterThan(0)
      expect(outline(e.src)).toContain('outline (')
    })
  }
  it('together they use most of the vocabulary', async () => {
    const { PACKS } = await import('../../src/core')
    const all = examples.map((e) => e.src).join('\n')
    const tags = Object.values(PACKS).flat()
    const used = tags.filter((t) => new RegExp(`^\\s*${t}\\b`, 'm').test(all))
    expect(used.length / tags.length).toBeGreaterThan(0.85)
  })
})
