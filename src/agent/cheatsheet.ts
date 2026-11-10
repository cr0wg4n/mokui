import { scale } from '../theme/scale'
import { INTENT, INTERACT } from '../tags/shared'
import { all, DEFAULT_PACKS, PACKS } from '../tags'

const names = (o: object) => Object.keys(o).join('|')
// Named value sets, applied only to the attributes that really use that scale.
const sets: [string, string, string[]][] = [
  ['space', names(scale.space), ['g', 'p']],
  ['font', names(scale.font), ['s']],
  ['size', names(scale.size) + '|full', ['w', 'h']],
]

export interface CheatsheetOptions {
  /** Which packs to document. Default: core and overlay. `'all'` documents every tag. */
  packs?: string[] | 'all'
}

/**
 * Compact agent-facing reference, generated from the registry (cannot drift from the code).
 * Packs keep it cheap: the default covers `core` and `overlay`, and one line lists the rest.
 * The parser accepts every tag regardless of which packs were documented.
 */
export function cheatsheet(opts: CheatsheetOptions = {}): string {
  const shown = opts.packs === 'all' ? Object.keys(PACKS) : (opts.packs ?? DEFAULT_PACKS)
  const unknown = shown.filter((p) => !PACKS[p])
  if (unknown.length) throw new Error(`unknown pack "${unknown[0]}". Valid: ${Object.keys(PACKS).join(' ')} all`)
  const inShown = new Set(shown.flatMap((p) => PACKS[p]!))
  const lines = [
    'Mokui DSL: one element per line, 2-space indent = child. Line: tag [bare words] [key=value] ["text"] [#name]. "//" starts a comment line.',
    `Sets: ${sets.map(([n, v]) => `${n}=${v}`).join('  ')}`,
    `Any tag also takes: ${Object.entries({ ...INTENT, ...INTERACT }).map(([k, d]) => `${k}${d.rules ? '=' + Object.keys(d.rules).join('|') : ''} (${d.doc})`).join(', ')}.`,
    `Interactions: targets are #names of ${all.filter((t) => t.stateful).map((t) => t.tag).join(' ')}. They start closed (sidebar starts open); add the \`open\` flag (sidebar: \`closed\`) to choose the start state. dropdown, popover, collapse, tabs and segmented also react to clicks on their own. No logic: only open/close/select.`,
    'Attrs marked * can be a bare word (text lg, grid 3, input email, button primary). Flags are bare words too (bold, disabled).',
    'Responsive (container width, mobile-first): add -sm|-md|-lg to attrs marked ~, e.g. cols=1 cols-md=3. grid min=xs..xl (column width) reflows with no breakpoints.',
    '',
  ]
  for (const s of all) {
    if (!inShown.has(s.tag)) continue
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
  const rest = Object.keys(PACKS).filter((p) => !shown.includes(p))
  if (rest.length) {
    lines.push('', `More tags exist (accepted by the parser; load their reference with \`mokui cheatsheet <pack>\`): ${rest.map((p) => `${p}=${PACKS[p]!.join(',')}`).join('; ')}.`)
  }
  lines.push('', 'Unknown tags, attrs or values are errors with line numbers. Icons: Lucide names (unknown -> dashed placeholder).')
  return lines.join('\n')
}
