import { scale, v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'

const flex = 'display:flex;'
const colRules = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [String(i + 1), `grid-template-columns:repeat(${i + 1},minmax(0,1fr))`]))
const layoutAttrs = { g: A.g, p: A.p, align: A.align, justify: A.justify, wrap: A.wrap, grow: A.grow, bottom: A.bottom, dir: A.dir, w: A.w, h: A.h }

/** Layout: containers, spacing, lines, scrolling and device frames. */
export const layout: TagSpec[] = inPack('core', [
  { tag: 'stack', doc: 'vertical flex container', css: `${flex}flex-direction:column`, attrs: layoutAttrs },
  { tag: 'row', doc: 'horizontal flex container', css: `${flex}flex-direction:row`, attrs: layoutAttrs },
  {
    tag: 'grid',
    doc: 'grid; cols=N fixed columns, or min=<width> to auto-reflow',
    css: 'display:grid;grid-template-columns:minmax(0,1fr)',
    attrs: {
      cols: { doc: 'fixed column count 1-6', responsive: true, bare: true, rules: colRules(6) },
      min: {
        doc: 'auto-reflow: columns at least this wide',
        rules: Object.fromEntries(
          Object.entries(scale.min).map(([k, val]) => [k, `grid-template-columns:repeat(auto-fit,minmax(var(--mk-m-${k},${val}),1fr))`]),
        ),
      },
      g: A.g, p: A.p, align: A.align, grow: A.grow, w: A.w, h: A.h,
    },
  },
  {
    tag: 'box',
    doc: 'bordered container',
    css: `${flex}flex-direction:column;border:${line};border-radius:${v('r')};background:${v('bg')}`,
    attrs: {
      g: A.g, p: A.p, align: A.align, justify: A.justify, dir: A.dir, grow: A.grow, w: A.w, h: A.h,
      fill: { doc: 'subtle background', flag: `background:${v('fill')}` },
      raised: { doc: 'soft shadow', flag: `box-shadow:${v('shadow')}` },
    },
  },
  { tag: 'spacer', doc: 'flexible empty space; pushes siblings apart', css: 'flex:1 1 0;min-width:0;min-height:0', attrs: {} },
  {
    tag: 'divider',
    doc: 'thin line',
    role: 'separator',
    text: 'label',
    css: `align-self:stretch;height:1px;background:${v('line')};flex:none`,
    attrs: {
      label: { doc: 'text in the middle of the line', free: true },
      vertical: { doc: 'vertical line', flag: 'width:1px;height:auto' },
      accent: { doc: 'thick accent line (active indicator)', flag: `height:2px;background:${v('accent')}` },
      grow: A.grow,
    },
    extra: `.l,.t{display:none}:host([label]){display:flex;align-items:center;gap:12px;height:auto;background:none;color:${v('muted')};font-size:var(--mk-f-sm,13px)}:host([label]) .l{display:block;flex:1;height:1px;background:${v('line')}}:host([label]) .t{display:block}`,
  },
  { tag: 'scroll', doc: 'scrollable region; set h', css: 'display:block;overflow:auto', attrs: { h: A.h, w: A.w, p: A.p, grow: A.grow } },
  {
    tag: 'frame',
    doc: 'device-width preview; also the query container for breakpoints',
    css: `display:flex;flex-direction:column;position:relative;container-type:inline-size;width:100%;margin-inline:auto;border:${line};border-radius:${v('r')};box-shadow:${v('shadow')};overflow:auto;background:${v('bg')}`,
    attrs: {
      device: { doc: 'preview width', bare: true, rules: { mobile: 'max-width:375px;min-height:640px', tablet: 'max-width:768px;min-height:520px', desktop: 'max-width:1280px' } },
    },
  },
])
