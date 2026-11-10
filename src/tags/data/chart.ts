import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'

const chartH = (sz: string, px: number) => [sz, `--mk-chart-h:${px}px`] as const

/** A chart drawn from fake, deterministic data. */
export const chartTag: TagSpec[] = inPack('data', [
  {
    tag: 'chart',
    doc: 'chart from fake data; kind line|bar|area|donut|pie; values="3,5,2" and labels="Mon|Tue" optional',
    role: 'img',
    css: `display:flex;flex-direction:column;gap:6px;width:100%;color:${v('muted')};font-size:var(--mk-f-xs,11px)`,
    attrs: {
      kind: { doc: 'chart type', bare: true, rules: { line: '', bar: '', area: '', donut: '', pie: '' } },
      values: { doc: 'comma-separated numbers', free: true },
      labels: { doc: 'x labels separated by |', free: true },
      h: { doc: 'height', rules: Object.fromEntries([chartH('sm', 96), chartH('md', 160), chartH('lg', 240)]) },
      w: A.w,
    },
    extra: `svg{display:block;width:100%;height:var(--mk-chart-h,160px)}.labs{display:flex;justify-content:space-between}`,
  },
])
