import { scale } from './scale'
import { INTENT } from './registry'
import { all } from './specs'

const names = (o: object) => Object.keys(o).join('|')
// Named value sets, applied only to the attributes that really use that scale.
const sets: [string, string, string[]][] = [
  ['space', names(scale.space), ['g', 'p']],
  ['font', names(scale.font), ['s']],
  ['size', names(scale.size) + '|full', ['w', 'h']],
]

/** Compact agent-facing reference, generated from the registry (cannot drift from the code). */
export function cheatsheet(): string {
  const lines = [
    'Mokui DSL: one element per line, 2-space indent = child. Line: tag [bare words] [key=value] ["text"] [#name]. "//" starts a comment line.',
    `Sets: ${sets.map(([n, v]) => `${n}=${v}`).join('  ')}`,
    `Any tag also takes: ${Object.entries(INTENT).map(([k, d]) => `${k} (${d.doc})`).join(', ')}.`,
    'Attrs marked * can be a bare word (text lg, grid 3, input email, button primary). Flags are bare words too (bold, disabled).',
    'Responsive (container width, mobile-first): add -sm|-md|-lg to attrs marked ~, e.g. cols=1 cols-md=3. grid min=xs..xl (column width) reflows with no breakpoints.',
    '',
  ]
  for (const s of all) {
    const attrs = Object.entries(s.attrs).map(([k, d]) => {
      let v = ''
      if (d.rules) {
        const joined = Object.keys(d.rules).join('|')
        v = '=' + (sets.find(([, set, on]) => set === joined && on.includes(k))?.[0] ?? joined)
      } else if (d.flag !== undefined) v = '(flag)'
      else if (d.free) v = '=text'
      return `${k}${d.bare ? '*' : ''}${d.responsive ? '~' : ''}${v}`
    })
    const text = s.text === 'ph' ? ' "placeholder"' : s.text === 'opts' ? ' "A|B|C"' : ''
    lines.push(`${s.tag}${text}${s.expand ? ' (recipe)' : ''}: ${s.doc}${attrs.length ? '. ' + attrs.join(' ') : ''}`)
  }
  lines.push('', 'Unknown tags, attrs or values are errors with line numbers. Icons: Lucide names (unknown -> dashed placeholder).')
  return lines.join('\n')
}
