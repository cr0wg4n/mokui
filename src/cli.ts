#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { cheatsheet } from './cheatsheet'
import { MkError } from './dsl/parse'
import { outline } from './outline'
import { renderPng } from './render-png'

const usage = `mokui <command>
  cheatsheet                       print the DSL reference for agents
  outline <file|->                 print the structural view (tree, interactive elements, notes)
  render <file|-> -o out.png [-w 600]   render a PNG (needs optional playwright)`

const [cmd, ...rest] = process.argv.slice(2)
const flag = (f: string, short: string) => {
  const i = rest.findIndex((a) => a === f || a === short)
  return i >= 0 ? rest[i + 1] : undefined
}
const read = (p: string | undefined) => readFileSync(!p || p === '-' ? 0 : p, 'utf8')

try {
  if (cmd === 'cheatsheet') console.log(cheatsheet())
  else if (cmd === 'outline') console.log(outline(read(rest[0])))
  else if (cmd === 'render') {
    const out = flag('--out', '-o')
    if (!out) throw new Error('render needs -o <file.png>')
    await renderPng(read(rest[0]), { out, width: Number(flag('--width', '-w') ?? 600) })
    console.log(out)
  } else console.log(usage)
} catch (e) {
  console.error(e instanceof MkError ? e.message : (e as Error).message)
  process.exit(1)
}
