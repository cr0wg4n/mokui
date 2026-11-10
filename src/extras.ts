import { A, type AttrDef, type TagSpec } from './registry'
import { v, type Token } from './scale'

const line = `1px solid ${v('line')}`
const mono = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'
const icoBox = '.ico{display:inline-flex;width:1.2em;height:1.2em;flex:none}.ico svg{width:100%;height:100%}'
const withBare = (d: AttrDef): AttrDef => ({ ...d, bare: true })
const num = (xs: number[]) => Object.fromEntries(xs.map((n) => [String(n), '']))
const tint = (t: Token, pct = 10) => `color-mix(in srgb,${v(t)} ${pct}%,${v('bg')})`
const alertTone = (t: Token) => `--mk-ac:${v(t)}`

// ---------- feedback ----------

export const feedback: TagSpec[] = [
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
]

// ---------- data ----------

const chartH = (sz: string, px: number) => [sz, `--mk-chart-h:${px}px`] as const

export const data: TagSpec[] = [
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
  {
    tag: 'calendar',
    doc: 'month grid; month="2026-11" (default), value=day, range="12-18"',
    css: `display:block;width:fit-content;padding:12px;border:${line};border-radius:${v('r')};background:${v('bg')};box-shadow:${v('shadow')};font-size:var(--mk-f-sm,13px)`,
    attrs: {
      month: { doc: 'YYYY-MM', free: true },
      value: { doc: 'selected day', free: true },
      range: { doc: 'highlighted days, e.g. 12-18', free: true },
    },
    extra: `.head{display:flex;align-items:center;justify-content:space-between;padding:4px 4px 8px;font-weight:650;font-size:var(--mk-f-md,15px)}.g{display:grid;grid-template-columns:repeat(7,36px);gap:2px}.g span{display:flex;align-items:center;justify-content:center;height:36px;border-radius:8px}.g .dow{height:28px;color:${v('muted')};font-weight:500}.g .out{color:${v('muted')};opacity:.5}.g .in{background:${v('fill')};border-radius:0}.g .sel{background:${v('accent')};color:${v('on-accent')};font-weight:650}`,
  },
  {
    tag: 'avatars',
    doc: 'overlapping avatar group; children are avatars',
    css: 'display:inline-flex;align-items:center;width:fit-content',
    attrs: {},
    extra: `::slotted(mk-avatar){border:2px solid ${v('bg')}}::slotted(mk-avatar:not(:first-child)){margin-left:-8px}`,
  },
  {
    tag: 'code',
    doc: 'inline code, or a block with `block`; quoted string is the code (\\n for a new line)',
    css: `display:inline;padding:2px 6px;border:${line};border-radius:6px;background:${v('fill')};font-family:${mono};font-size:.9em`,
    attrs: { block: { doc: 'multi-line block', flag: `display:block;padding:12px 16px;border-radius:${v('r-sm')};white-space:pre-wrap;line-height:1.6` } },
  },
  {
    tag: 'kbd',
    doc: 'keyboard key; quoted string is the key',
    css: `display:inline-flex;align-items:center;padding:1px 7px;border:${line};border-bottom-width:2px;border-radius:6px;background:${v('bg')};font-family:${mono};font-size:.85em;line-height:1.5`,
    attrs: {},
  },
  {
    tag: 'video',
    doc: 'video placeholder with a play button; quoted string is the caption',
    role: 'img',
    css: `display:flex;align-items:flex-end;position:relative;aspect-ratio:16/9;width:100%;max-width:100%;overflow:hidden;border-radius:${v('r')};background:${v('fill')};border:${line};color:${v('muted')};font-size:var(--mk-f-sm,13px)`,
    attrs: {
      ratio: { doc: 'aspect ratio', bare: true, rules: { '16:9': 'aspect-ratio:16/9', '4:3': 'aspect-ratio:4/3', '1:1': 'aspect-ratio:1/1', '9:16': 'aspect-ratio:9/16' } },
      w: A.w,
    },
    extra: `.play{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${v('bg')};color:${v('fg')};box-shadow:${v('shadow-lg')}}.play svg{width:24px;height:24px;margin-left:3px}slot{display:block;padding:8px 12px}`,
  },
]

// ---------- forms ----------

const lblAttr: AttrDef = { doc: 'label above the control', free: true }

export const forms: TagSpec[] = [
  {
    tag: 'segmented',
    doc: 'segmented control; quoted "A|B|C"; active=N (1-based); click to switch',
    role: 'tablist',
    text: 'opts',
    css: 'display:inline-block;width:fit-content',
    attrs: { opts: { doc: 'options separated by |', free: true }, active: { doc: 'selected option, 1-based', free: true } },
    extra: `.seg{display:inline-flex;gap:2px;padding:3px;border-radius:${v('r-sm')};background:${v('fill')}}.sb{padding:6px 14px;border:0;border-radius:6px;background:transparent;color:${v('muted')};font:inherit;font-size:var(--mk-f-md,15px);font-weight:500;cursor:pointer;white-space:nowrap}.sb[aria-selected=true]{background:${v('bg')};color:${v('fg')};box-shadow:${v('shadow')}}`,
  },
  {
    tag: 'upload',
    doc: 'file drop zone; quoted string is the prompt',
    text: 'label',
    css: `display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:24px;border:2px dashed ${v('line')};border-radius:${v('r')};background:${v('bg')};text-align:center;color:${v('muted')};font-size:var(--mk-f-md,15px)`,
    attrs: { label: { doc: 'prompt', free: true }, w: A.w },
    extra: `.ico{display:inline-flex;width:28px;height:28px}.ico svg{width:100%;height:100%}.t{color:${v('fg')};font-weight:500}.s{font-size:var(--mk-f-sm,13px)}`,
  },
  {
    tag: 'otp',
    doc: 'one-time code boxes; otp 4|6; value="123"',
    css: 'display:inline-flex;gap:8px',
    attrs: { n: { doc: 'number of boxes', bare: true, rules: num([4, 5, 6]) }, value: { doc: 'digits typed so far', free: true } },
    extra: `.d{display:flex;align-items:center;justify-content:center;width:40px;height:48px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};box-shadow:${v('shadow')};font-size:var(--mk-f-lg,18px);font-weight:600}`,
  },
]

export { lblAttr }
export const extras: TagSpec[] = [...feedback, ...data, ...forms]
