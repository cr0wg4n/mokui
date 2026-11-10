import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { all, PACK_ORDER, PACKS, primitives, recipes } from '../../src/tags'
import { renderers } from '../../src/tags/renderers'

// Guards the source layout (src/tags/<pack>/...) so it cannot quietly decay.
const files = import.meta.glob('../../src/tags/*/*.ts', { eager: true }) as Record<string, Record<string, unknown>>
const specFiles = Object.entries(files).filter(([p]) => !p.endsWith('.render.ts') && !p.endsWith('/kit.ts'))
const folderOf = (p: string) => /\/tags\/([^/]+)\//.exec(p)![1]!
const specsIn = (mod: Record<string, unknown>) =>
  Object.values(mod).filter((x): x is { tag: string; pack: string }[] => Array.isArray(x) && x.every((s) => typeof s === 'object' && s !== null && 'tag' in s)).flat()

describe('tags layout', () => {
  it('every spec file lives in the folder of its pack', () => {
    for (const [path, mod] of specFiles) {
      for (const s of specsIn(mod)) expect(s.pack, `${s.tag} in ${path}`).toBe(folderOf(path))
    }
  })
  it('the pack folders are exactly the packs', () => {
    expect([...new Set(specFiles.map(([p]) => folderOf(p)))].sort()).toEqual([...PACK_ORDER].sort())
  })
  it('every tag defined in a spec file is registered in the index, and nothing else is', () => {
    const inFiles = specFiles.flatMap(([, mod]) => specsIn(mod).map((s) => s.tag)).sort()
    expect(inFiles).toEqual(all.map((s) => s.tag).sort())
    expect(new Set(inFiles).size).toBe(inFiles.length) // no duplicate tag names
  })
  it('packs are derived from the specs and cover every tag once', () => {
    expect(Object.values(PACKS).flat().sort()).toEqual(all.map((s) => s.tag).sort())
  })
})

describe('renderers', () => {
  it('only primitives have a renderer; recipes never do', () => {
    const prim = new Set(primitives.map((s) => s.tag))
    for (const tag of Object.keys(renderers)) expect(prim.has(tag), `${tag} has a renderer but is not a primitive`).toBe(true)
    for (const r of recipes) expect(renderers[r.tag], r.tag).toBeUndefined()
  })
  it('every renderer file sits next to the spec file it draws', () => {
    for (const path of Object.keys(files).filter((p) => p.endsWith('.render.ts'))) {
      const spec = path.replace('.render.ts', '.ts')
      expect(Object.keys(files), `${path} has no ${spec.split('/').pop()}`).toContain(spec)
    }
  })
  it('a renderer is declared in the same pack folder as its tag', () => {
    const packOfTag = Object.fromEntries(all.map((s) => [s.tag, s.pack]))
    for (const [path, mod] of Object.entries(files).filter(([p]) => p.endsWith('.render.ts'))) {
      for (const record of Object.values(mod)) {
        if (typeof record !== 'object' || record === null) continue
        for (const tag of Object.keys(record)) expect(packOfTag[tag], `${tag} in ${path}`).toBe(folderOf(path))
      }
    }
  })
})

describe('mokui/core stays free of DOM code', () => {
  // follow every relative import from src/core.ts: nothing under runtime/ or any *.render file may be reachable
  const src = resolve(__dirname, '../../src')
  const resolveImport = (from: string, spec: string) => {
    const base = resolve(dirname(from), spec)
    return [`${base}.ts`, join(base, 'index.ts')].find(existsSync)
  }
  it('does not reach runtime/, renderers or the icon set', () => {
    const seen = new Set<string>()
    const walk = (file: string) => {
      if (seen.has(file)) return
      seen.add(file)
      const code = readFileSync(file, 'utf8')
      for (const m of code.matchAll(/(?:from|import)\s+'(\.[^']*)'/g)) {
        const next = resolveImport(file, m[1]!)
        if (next) walk(next)
      }
    }
    walk(join(src, 'core.ts'))
    const reached = [...seen].map((f) => f.slice(src.length + 1))
    expect(reached.length).toBeGreaterThan(20)
    for (const f of reached) {
      expect(f, f).not.toMatch(/^runtime\//)
      expect(f, f).not.toMatch(/\.render\.ts$/)
      expect(f, f).not.toMatch(/^icons\//)
      expect(f, f).not.toBe('tags/renderers.ts')
    }
  })
})
