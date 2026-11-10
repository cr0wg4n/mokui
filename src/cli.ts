#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { cheatsheet } from './cheatsheet'
import { loadTheme, themeCssText, themeFile, type ThemeOptions } from './theme'
import { MkError } from './dsl/parse'
import { outline } from './outline'
import { renderPng } from './render-png'

const usage = `mokui <command>
  cheatsheet [pack...|all]         print the DSL reference for agents (default: core overlay;\n                                   other packs: forms feedback data nav)
  outline <file|->                 print the structural view (tree, interactive elements, notes)
  render <file|-> -o out.png [-w 600] [--open a,b] [--theme dark|wire]\n                                   render a PNG (needs optional playwright); --open draws those\n                                   modals/drawers/dropdowns open`

const [cmd, ...rest] = process.argv.slice(2)
const flag = (f: string, short: string) => {
  const i = rest.findIndex((a) => a === f || a === short)
  return i >= 0 ? rest[i + 1] : undefined
}
const read = (p: string | undefined) => readFileSync(!p || p === '-' ? 0 : p, 'utf8')

try {
  if (cmd === 'cheatsheet') console.log(cheatsheet({ packs: rest.length === 0 ? undefined : rest[0] === 'all' ? 'all' : rest }))
  else if (cmd === 'outline') console.log(outline(read(rest[0])))
  else if (cmd === 'render') {
    const out = flag('--out', '-o')
    if (!out) throw new Error('render needs -o <file.png>')
    const open = flag('--open', '--open')?.split(',').filter(Boolean)
    const theme: ThemeOptions = {}
    const file = flag('--theme-file', '--theme-file')
    if (file) {
      const { name: _name, ...loaded } = loadTheme(JSON.parse(readFileSync(file, 'utf8')))
      Object.assign(theme, loaded)
    }
    const base = flag('--theme', '--theme')
    const accent = flag('--accent', '--accent')
    const radius = flag('--radius', '--radius')
    const font = flag('--font', '--font')
    if (base) theme.base = base
    if (accent) theme.accent = accent
    if (radius) theme.radius = radius as ThemeOptions['radius']
    if (font) theme.font = font as ThemeOptions['font']
    await renderPng(read(rest[0]), { out, width: Number(flag('--width', '-w') ?? 600), open, theme: Object.keys(theme).length ? theme : undefined })
    console.log(out)
  } else if (cmd === 'theme') {
    const color = rest[0]
    if (!color || color.startsWith('-')) throw new Error('theme needs a color, e.g. mokui theme "#4f46e5" --mode dark')
    const mode = flag('--mode', '--mode')
    if (mode && mode !== 'light' && mode !== 'dark') throw new Error('--mode must be light or dark')
    const file = themeFile(color, {
      mode: mode as 'light' | 'dark' | undefined,
      name: flag('--name', '--name'),
      radius: flag('--radius', '--radius') as ThemeOptions['radius'],
      font: flag('--font', '--font') as ThemeOptions['font'],
    })
    console.log(rest.includes('--css') ? themeCssText(file) : JSON.stringify(file, null, 2))
  } else console.log(usage)
} catch (e) {
  console.error(e instanceof MkError ? e.message : (e as Error).message)
  process.exit(1)
}
