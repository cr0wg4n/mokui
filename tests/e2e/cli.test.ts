import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs'
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
  it('--open draws a modal that is hidden by default', () => {
    const src = 'button opens=#m "Open"\nmodal #m sm "Hello"\n  text "Body"'
    const size = (...extra: string[]) => {
      const out = join(dir, `s${extra.join('')}.png`)
      execFileSync('node', ['dist/cli.js', 'render', '-', '-o', out, '-w', '500', ...extra], { input: src, stdio: ['pipe', 'pipe', 'pipe'] })
      return readFileSync(out)
    }
    const closed = size()
    const open = size('--open', 'm')
    expect(Buffer.compare(closed, open)).not.toBe(0)
    expect(open.length).toBeGreaterThan(closed.length) // dialog + backdrop add detail
  })
  it('--open with an unknown name fails with a clear message', () => {
    expect(() => execFileSync('node', ['dist/cli.js', 'render', '-', '-o', join(dir, 'y.png'), '--open', 'zzz'], { input: 'text "x"', stdio: ['pipe', 'pipe', 'pipe'] })).toThrow(/no element named #zzz/)
  })
  it('--theme changes the picture', () => {
    const out = (t: string) => {
      const f = join(dir, `t-${t}.png`)
      execFileSync('node', ['dist/cli.js', 'render', '-', '-o', f, '-w', '300', '--theme', t], { input: 'stack p=md\n  text "Hi"\n  button primary "Go"', stdio: ['pipe', 'pipe', 'pipe'] })
      return readFileSync(f)
    }
    expect(Buffer.compare(out('modern'), out('dark'))).not.toBe(0)
    expect(Buffer.compare(out('modern'), out('wire'))).not.toBe(0)
  })
  it('outline shows interactions and states', () => {
    const o = execFileSync('node', ['dist/cli.js', 'outline', '-'], { input: 'button #b opens=#m "Open"\nmodal #m "T"', encoding: 'utf8' })
    expect(o).toContain('button "Open" #b -> opens #m')
    expect(o).toContain('modal "T" #m (starts closed)')
  })
  describe('themes', () => {
    const run = (...a: string[]) => execFileSync('node', ['dist/cli.js', ...a], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
    const fails = (...a: string[]) => {
      try {
        run(...a)
      } catch (e) {
        return String((e as { stderr?: string }).stderr)
      }
      return ''
    }
    it('theme <color> prints a theme file from one color', () => {
      const f = JSON.parse(run('theme', '#4f46e5'))
      expect(f.base).toBe('modern')
      expect(f.tokens.accent).toBe('#4f46e5')
      expect(f.tokens['on-accent']).toBe('#ffffff')
      expect(f.tokens.bg).toBe('#ffffff')
    })
    it('theme takes a mode, a name, a radius and a font; --css prints variables', () => {
      const f = JSON.parse(run('theme', '#e11d48', '--mode', 'dark', '--name', 'brand', '--radius', 'round', '--font', 'serif'))
      expect(f).toMatchObject({ name: 'brand', base: 'dark', radius: 'round', font: 'serif' })
      const css = run('theme', '#e11d48', '--css')
      expect(css.startsWith(':root{--mk-')).toBe(true)
      expect(css).toContain('--mk-accent:var(--mk-u-accent,#e11d48)')
    })
    it('theme explains bad input', () => {
      expect(fails('theme')).toContain('theme needs a color')
      expect(fails('theme', 'indigo')).toContain('"indigo" is not a hex color')
      expect(fails('theme', '#fff', '--mode', 'sepia')).toContain('--mode must be light or dark')
    })
    const draw = (extra: string[], src = 'stack g=md p=md\n  button primary "Go"\n  switch on "On"') => {
      const out = join(dir, `th-${extra.join('').replace(/[^a-z0-9]/gi, '')}.png`)
      execFileSync('node', ['dist/cli.js', 'render', '-', '-o', out, '-w', '300', ...extra], { input: src.replace(/\\n/g, '\n'), stdio: ['pipe', 'pipe', 'pipe'] })
      return readFileSync(out)
    }
    it('render takes --accent, --radius and --font, each changing the picture', () => {
      const plain = draw([])
      for (const flags of [['--accent', 'indigo'], ['--accent', '#ff6600'], ['--radius', 'round'], ['--font', 'serif'], ['--theme', 'dark', '--accent', 'teal']]) {
        expect(Buffer.compare(plain, draw(flags)), flags.join(' ')).not.toBe(0)
      }
    })
    it('render --theme-file applies a generated theme, and flags override the file', () => {
      const file = join(dir, 'brand.json')
      writeFileSync(file, run('theme', '#e11d48', '--name', 'brand'))
      const fromFile = draw(['--theme-file', file])
      expect(Buffer.compare(draw([]), fromFile)).not.toBe(0)
      expect(Buffer.compare(fromFile, draw(['--theme-file', file, '--accent', 'blue']))).not.toBe(0)
    })
    it('render rejects a bad theme file or accent before starting a browser', () => {
      const bad = join(dir, 'bad.json')
      writeFileSync(bad, JSON.stringify({ accent: 'chartreuse', tokens: { colour: '#fff' } }))
      const e = fails('render', '-', '-o', join(dir, 'x.png'), '--theme-file', bad)
      expect(e).toContain('invalid theme file')
      expect(e).toContain('unknown accent "chartreuse"')
      expect(e).toContain('unknown token "colour"')
      expect(fails('render', '-', '-o', join(dir, 'y.png'), '--radius', 'blobby')).toContain('unknown radius "blobby"')
    })
  })
  it('reports DSL errors with line numbers and exits non-zero', () => {
    expect(() => execFileSync('node', ['dist/cli.js', 'render', '-', '-o', join(dir, 'x.png')], { input: 'row\n  nope', stdio: ['pipe', 'pipe', 'pipe'] })).toThrow(/line 2: unknown tag/)
  })
})
