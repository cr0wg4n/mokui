import { v } from '../../theme/scale'
import type { Token } from '../../theme/scale'
import { A, line, num, withBare } from '../shared'
import { inPack, type TagSpec } from '../types'

const icoBox = '.ico{display:inline-flex;width:1.2em;height:1.2em;flex:none}.ico svg{width:100%;height:100%}'
const alertTone = (t: Token) => `--mk-ac:${v(t)}`

/** Feedback: alerts, progress, loading placeholders, rating, chips. */
export const feedback: TagSpec[] = inPack('feedback', [
  {
    tag: 'alert',
    doc: 'message box; quoted string is the title, children the body; `x` makes it dismissible',
    role: 'alert',
    text: 'label',
    css: `--mk-ac:${v('info')};display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border:1px solid color-mix(in srgb,var(--mk-ac) 30%,${v('line')});border-radius:${v('r')};background:color-mix(in srgb,var(--mk-ac) 8%,${v('bg')});font-size:var(--mk-f-md,15px)`,
    attrs: {
      variant: {
        doc: 'meaning',
        bare: true,
        rules: { info: alertTone('info'), success: alertTone('success'), warning: alertTone('warning'), error: alertTone('danger') },
      },
      label: { doc: 'title', free: true },
      x: { doc: 'dismissible', flag: '' },
    },
    extra: `${icoBox}.ico{color:var(--mk-ac);margin-top:2px}.c{flex:1;display:flex;flex-direction:column;gap:2px}.t{font-weight:650}.t:empty{display:none}.xbtn{display:none;width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:${v('muted')};padding:0}.xbtn svg{width:14px;height:14px}:host([x]) .xbtn{display:inline-flex;align-items:center;justify-content:center}`,
  },
  {
    tag: 'progress',
    doc: 'progress bar; value 0-100',
    role: 'progressbar',
    css: `display:block;width:100%;height:8px;border-radius:999px;background:${v('line')};overflow:hidden`,
    attrs: { value: withBare({ doc: 'percent 0-100', free: true }), w: A.w },
    extra: `.bar{height:100%;border-radius:999px;background:${v('accent')}}`,
  },
  {
    tag: 'spinner',
    doc: 'loading indicator (drawn still)',
    role: 'status',
    css: `display:inline-block;flex:none;width:1.5em;height:1.5em;border:2px solid ${v('line')};border-top-color:${v('accent')};border-radius:50%`,
    attrs: { s: withBare(A.s) },
  },
  {
    tag: 'skeleton',
    doc: 'loading placeholder; lines=N text bars, or `circle`; w, h size it',
    css: 'display:flex;flex-direction:column;gap:8px',
    attrs: {
      lines: { doc: 'number of bars 1-5', bare: true, rules: num([1, 2, 3, 4, 5]) },
      circle: { doc: 'round avatar placeholder', flag: 'width:2.5em;height:2.5em' },
      w: A.w,
      h: A.h,
    },
    extra: `.bar{height:14px;border-radius:7px;background:${v('fill')};flex:1 1 auto;min-height:14px}.bar:last-child:not(:only-child){width:60%}:host([circle]) .bar{border-radius:50%;height:100%}`,
  },
  {
    tag: 'rating',
    doc: 'star rating; value 0-5',
    role: 'img',
    css: `display:inline-flex;gap:2px;color:${v('warning')};font-size:var(--mk-f-md,15px)`,
    attrs: { value: withBare({ doc: 'stars 0-5', free: true }), s: A.s },
    extra: 'svg{width:1.2em;height:1.2em}.off{color:var(--mk-line,#e4e4e7)}',
  },
  {
    tag: 'chip',
    doc: 'removable tag or filter; quoted string is the label; `x` shows a remove icon',
    css: `display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:4px 12px;border:${line};border-radius:999px;background:${v('bg')};font-size:var(--mk-f-sm,13px);font-weight:500`,
    attrs: {
      x: { doc: 'show remove icon', flag: '' },
      active: { doc: 'selected', flag: `background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')}` },
      icon: { doc: 'leading icon name', free: true },
    },
    extra: `.ico,.rm{display:inline-flex;width:1.1em;height:1.1em}.ico svg,.rm svg{width:100%;height:100%}.rm{opacity:.6}`,
  },
])
