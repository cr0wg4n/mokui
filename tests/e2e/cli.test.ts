import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const cli = (...a: string[]) => execFileSync('node', ['dist/cli.js', ...a], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
const dir = mkdtempSync(join(tmpdir(), 'mokui-'))

describe('cli', () => {
  it('cheatsheet prints the reference', () => {
    expect(cli('cheatsheet')).toContain('Mokui DSL')
  })
  it('outline reads stdin', () => {
    const out = execFileSync('node', ['dist/cli.js', 'outline', '-'], { input: 'button #go "Go"', encoding: 'utf8' })
    expect(out).toContain('interactive (1)')
  })
  it('render writes a real PNG', () => {
    const out = join(dir, 'a.png')
    execFileSync('node', ['dist/cli.js', 'render', '-', '-o', out, '-w', '400'], { input: 'stack g=md p=md\n  text xl "Hi"\n  button primary "Go"', stdio: ['pipe', 'pipe', 'pipe'] })
    const png = readFileSync(out)
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(800) // width at 2x
    expect(statSync(out).size).toBeGreaterThan(1000)
  })
  it('breakpoints change the picture with the width', () => {
    const src = 'grid cols=1 cols-md=3 g=md\n  box p=lg\n  box p=lg\n  box p=lg'
    const dims = (w: number) => {
      const out = join(dir, `w${w}.png`)
      execFileSync('node', ['dist/cli.js', 'render', '-', '-o', out, '-w', String(w)], { input: src, stdio: ['pipe', 'pipe', 'pipe'] })
      return readFileSync(out).readUInt32BE(20) // height
    }
    expect(dims(400)).toBeGreaterThan(dims(900))
  })
  it('reports DSL errors with line numbers and exits non-zero', () => {
    expect(() => execFileSync('node', ['dist/cli.js', 'render', '-', '-o', join(dir, 'x.png')], { input: 'row\n  nope', stdio: ['pipe', 'pipe', 'pipe'] })).toThrow(/line 2: unknown tag/)
  })
})
