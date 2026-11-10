import { accents, scale, themes, v } from './scale'

/** One attribute of a tag. */
export interface AttrDef {
  doc: string
  /** Closed value set: value -> CSS declarations. Invalid values are rejected. */
  rules?: Record<string, string>
  /** Boolean flag (`bold`, `disabled`): present or absent. CSS applied when present. */
  flag?: string
  /** Free-text value (no CSS), e.g. label, placeholder, icon name. */
  free?: boolean
  /** A bare word that fits no closed set lands here (first free+bare attr wins). */
  bare?: boolean
  /** Also accepts `<attr>-sm|md|lg` container-query variants (mobile-first). */
  responsive?: boolean
  /** Required attribute: validation fails when missing. */
  required?: boolean
}

export interface TagSpec {
  tag: string
  doc: string
  /** Declarations for :host (primitives only). */
  css?: string
  /** Extra raw CSS appended to the generated sheet (shadow parts etc.). */
  extra?: string
  attrs: Record<string, AttrDef>
  /** Where quoted text goes: child text (default), or an attribute name. */
  text?: 'content' | string
  /** Default ARIA role set on the host. */
  role?: string
  /** Can be opened, closed or toggled by `opens` / `closes` / `toggles`. */
  stateful?: boolean
  /** Which attribute holds the state: `open` (default) or `closed` (visible unless `closed`). */
  stateAttr?: 'open' | 'closed'
  /** Covers the mount container (modal, drawer): the container needs room. */
  overlay?: boolean
  /** Only valid as a direct child of this tag (e.g. `menu` in `dropdown`). */
  within?: string
  /** Recipe: expand into other nodes. Recipes have no element. */
  expand?: (node: RNode) => RNode[]
}

/** Minimal node shape shared with the parser (avoids a circular import). */
export interface RNode {
  tag: string
  attrs: Record<string, string>
  text?: string
  children: RNode[]
  line?: number
}

// ---------- shared attribute definitions ----------

const rulesFrom = (map: Record<string, string>, prop: string, token: string) =>
  Object.fromEntries(Object.entries(map).map(([k, val]) => [k, `${prop}:var(--mk-${token}-${k},${val})`]))

const space = (prop: string) => rulesFrom(scale.space, prop, 's')
const decl = (prop: string, m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, val]) => [k, `${prop}:${val}`]))

export const A = {
  g: { doc: 'gap between children', responsive: true, rules: space('gap') },
  p: { doc: 'padding', responsive: true, rules: space('padding') },
  align: { doc: 'cross-axis alignment', rules: decl('align-items', { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' }) },
  justify: { doc: 'main-axis distribution', rules: decl('justify-content', { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }) },
  wrap: { doc: 'allow wrapping', flag: 'flex-wrap:wrap' },
  grow: { doc: 'take remaining space', flag: 'flex:1 1 0;min-width:0' },
  bottom: { doc: 'push to the bottom edge of a column or frame', flag: 'margin-top:auto' },
  dir: { doc: 'direction (switch layout at a breakpoint)', responsive: true, rules: { row: 'flex-direction:row', col: 'flex-direction:column' } },
  w: { doc: 'width', responsive: true, rules: { ...rulesFrom(scale.size, 'width', 'z'), full: 'width:100%' } },
  h: { doc: 'height', rules: { ...rulesFrom(scale.size, 'height', 'z'), full: 'height:100%' } },
  s: { doc: 'font size', rules: rulesFrom(scale.font, 'font-size', 'f') },
} satisfies Record<string, AttrDef>

/** Intent and look attributes available on every tag. They never affect structure. */
export const INTENT: Record<string, AttrDef> = {
  name: { doc: 'identifier, e.g. #login-btn', free: true },
  role: { doc: 'semantic role, also the ARIA role', free: true },
  note: { doc: 'requirement note shown in the outline', free: true },
  theme: { doc: 'look for this subtree', rules: Object.fromEntries(Object.keys(themes).map((k) => [k, ''])) },
  accent: { doc: 'accent color for this subtree', rules: Object.fromEntries(Object.keys(accents).map((k) => [k, ''])) },
  radius: { doc: 'corner roundness', rules: { sharp: '', soft: '', round: '' } },
  font: { doc: 'typeface', rules: { sans: '', serif: '', mono: '' } },
}

/** Declared interactions, available on every tag. Targets are `#name` of a stateful element. */
export const INTERACT: Record<string, AttrDef> = {
  opens: { doc: 'click opens #name', free: true },
  toggles: { doc: 'click toggles #name', free: true },
  closes: { doc: 'click closes the enclosing overlay (flag) or #name', free: true },
}

const withBare = (d: AttrDef): AttrDef => ({ ...d, bare: true })
const flex = 'display:flex;'
const colRules = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [String(i + 1), `grid-template-columns:repeat(${i + 1},minmax(0,1fr))`]))
const line = `1px solid ${v('line')}`
const tone = (t: 'success' | 'warning' | 'danger' | 'info') =>
  `background:color-mix(in srgb,${v(t)} 12%,${v('bg')});color:${v(t)};border-color:color-mix(in srgb,${v(t)} 35%,${v('line')})`

// ---------- layout ----------

const layoutAttrs = { g: A.g, p: A.p, align: A.align, justify: A.justify, wrap: A.wrap, grow: A.grow, bottom: A.bottom, dir: A.dir, w: A.w, h: A.h }

const layout: TagSpec[] = [
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
]

// ---------- content ----------

const sFont = withBare(A.s)

const content: TagSpec[] = [
  {
    tag: 'text',
    doc: 'text; quoted string is the content',
    css: `display:block;font-size:var(--mk-f-md,15px);line-height:1.5`,
    attrs: {
      s: sFont,
      bold: { doc: 'bold', flag: 'font-weight:650' },
      muted: { doc: 'secondary color', flag: `color:${v('muted')}` },
      center: { doc: 'center aligned', flag: 'text-align:center' },
    },
  },
  {
    tag: 'link',
    doc: 'inline link; quoted string is the text',
    role: 'link',
    css: `display:inline;color:${v('fg')};text-decoration:underline;text-decoration-color:${v('muted')};text-underline-offset:3px;font-size:var(--mk-f-md,15px)`,
    attrs: { s: sFont, muted: { doc: 'secondary color', flag: `color:${v('muted')}` } },
  },
  {
    tag: 'icon',
    doc: 'Lucide-named icon; first bare word is the name',
    css: 'display:inline-flex;width:1.5em;height:1.5em;flex:none',
    attrs: { n: { doc: 'icon name', free: true, bare: true, required: true }, s: sFont, muted: { doc: 'secondary color', flag: `color:${v('muted')}` } },
    extra: 'svg{width:100%;height:100%}',
  },
  {
    tag: 'image',
    doc: 'image placeholder; quoted string is the label',
    role: 'img',
    css: `display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;width:var(--mk-z-lg,160px);max-width:100%;color:${v('muted')};font-size:var(--mk-f-sm,13px);border:${line};border-radius:${v('r')};overflow:hidden;background:linear-gradient(to top right,transparent calc(50% - .5px),${v('line')} 50%,transparent calc(50% + .5px)),linear-gradient(to top left,transparent calc(50% - .5px),${v('line')} 50%,transparent calc(50% + .5px)),${v('fill')}`,
    attrs: {
      w: A.w,
      h: A.h,
      ratio: {
        doc: 'aspect ratio',
        bare: true,
        rules: { '1:1': 'aspect-ratio:1/1', '4:3': 'aspect-ratio:4/3', '16:9': 'aspect-ratio:16/9', '3:4': 'aspect-ratio:3/4', '9:16': 'aspect-ratio:9/16' },
      },
    },
    extra: `slot{background:${v('fill')};padding:2px 8px;border-radius:999px}`,
  },
  {
    tag: 'avatar',
    doc: 'circular avatar; quoted string is the initials',
    css: `display:inline-flex;align-items:center;justify-content:center;width:2.5em;height:2.5em;flex:none;border-radius:50%;background:${v('fill')};color:${v('muted')};font-weight:600;font-size:var(--mk-f-sm,13px);overflow:hidden`,
    attrs: { s: sFont },
  },
  {
    tag: 'badge',
    doc: 'small pill label; quoted string is the content',
    css: `display:inline-flex;align-items:center;width:fit-content;padding:2px 10px;border-radius:999px;border:${line};background:${v('fill')};font-size:var(--mk-f-xs,11px);font-weight:600;letter-spacing:.01em`,
    attrs: {
      variant: {
        doc: 'style',
        bare: true,
        rules: {
          primary: `background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')}`,
          success: tone('success'),
          warning: tone('warning'),
          error: tone('danger'),
          info: tone('info'),
        },
      },
    },
  },
]

// ---------- controls ----------

const dis: AttrDef = { doc: 'disabled look', flag: 'opacity:.45' }
const lbl: AttrDef = { doc: 'label above the control', free: true }
const fieldBox = 'display:flex;flex-direction:column;gap:6px;min-width:min(160px,100%);font-size:var(--mk-f-md,15px)'
const fieldCss =
  `.label{font-size:var(--mk-f-sm,13px);font-weight:500;color:${v('fg')}}` +
  `.field{display:flex;align-items:center;gap:8px;min-height:40px;padding:8px 12px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};box-shadow:${v('shadow')}}` +
  `.field .ico{display:inline-flex;width:1.2em;height:1.2em;color:${v('muted')}}.field .ico svg{width:100%;height:100%}` +
  `.val{flex:1;color:${v('fg')}}.ph{flex:1;color:${v('muted')}}` +
  `.msg{font-size:var(--mk-f-sm,13px);color:${v('muted')}}.msg:empty{display:none}.msg.err{color:${v('danger')}}.field.err{border-color:${v('danger')}}`
const checkBox = `display:inline-block;width:16px;height:16px;border:1px solid ${v('muted')};background:${v('bg')};flex:none;position:relative`
const choice = 'display:inline-flex;align-items:center;gap:8px;font-size:var(--mk-f-md,15px)'

const controls: TagSpec[] = [
  {
    tag: 'button',
    doc: 'button; quoted string is the label',
    role: 'button',
    css: `display:inline-flex;align-items:center;justify-content:center;gap:8px;width:fit-content;padding:8px 16px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};color:${v('fg')};box-shadow:${v('shadow')};font-size:var(--mk-f-md,15px);font-weight:500;line-height:1.4`,
    attrs: {
      variant: {
        doc: 'visual weight',
        bare: true,
        rules: {
          primary: `background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')};box-shadow:none`,
          secondary: '',
          ghost: 'border-color:transparent;background:transparent;box-shadow:none',
          danger: `background:${v('danger')};color:#fff;border-color:${v('danger')};box-shadow:none`,
        },
      },
      s: {
        doc: 'size',
        bare: true,
        rules: {
          sm: 'padding:4px 10px;font-size:var(--mk-f-sm,13px)',
          md: 'padding:8px 16px;font-size:var(--mk-f-md,15px)',
          lg: 'padding:12px 24px;font-size:var(--mk-f-lg,18px)',
        },
      },
      icon: { doc: 'leading icon name', free: true },
      full: { doc: 'full width', flag: 'width:100%' },
      fab: { doc: 'floating round button in the bottom-right corner of the container', flag: `position:absolute;right:16px;bottom:16px;z-index:30;width:56px;height:56px;padding:0;border-radius:50%;background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')};box-shadow:${v('shadow-lg')}` },
      disabled: dis,
    },
    extra: `.ico{display:inline-flex;width:1.2em;height:1.2em}.ico svg{width:100%;height:100%}:host(:hover){filter:brightness(.97)}`,
  },
  {
    tag: 'input',
    doc: 'text field; quoted string is the placeholder',
    role: 'textbox',
    text: 'ph',
    css: fieldBox,
    attrs: {
      type: { doc: 'input kind', bare: true, rules: { text: '', email: '', password: '', number: '', search: '', date: '' } },
      label: lbl,
      ph: { doc: 'placeholder', free: true },
      value: { doc: 'filled value', free: true },
      help: { doc: 'helper text under the field', free: true },
      error: { doc: 'error text under the field (red border)', free: true },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss,
  },
  {
    tag: 'textarea',
    doc: 'multi-line field; quoted string is the placeholder',
    role: 'textbox',
    text: 'ph',
    css: fieldBox,
    attrs: {
      label: lbl,
      ph: { doc: 'placeholder', free: true },
      value: { doc: 'filled value', free: true },
      rows: { doc: 'height in lines 2-8', bare: true, rules: Object.fromEntries([2, 3, 4, 5, 6, 8].map((n) => [String(n), `--mk-rows:${n}`])) },
      help: { doc: 'helper text under the field', free: true },
      error: { doc: 'error text under the field (red border)', free: true },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss + '.field{align-items:flex-start;min-height:calc(var(--mk-rows,3) * 1.5em + 18px)}',
  },
  {
    tag: 'select',
    doc: 'dropdown field; quoted string is options "A|B|C"',
    role: 'combobox',
    text: 'opts',
    css: fieldBox,
    attrs: {
      label: lbl,
      opts: { doc: 'options separated by |', free: true },
      value: { doc: 'selected value (default first option)', free: true },
      open: { doc: 'show the option list', flag: '' },
      help: { doc: 'helper text under the field', free: true },
      error: { doc: 'error text under the field (red border)', free: true },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss + `.list{padding:4px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};box-shadow:${v('shadow-lg')}}.list div{padding:8px 10px;border-radius:6px}.list div[data-sel]{background:${v('fill')};font-weight:500}`,
  },
  {
    tag: 'checkbox',
    doc: 'checkbox; quoted string is the label',
    role: 'checkbox',
    css: choice,
    attrs: { checked: { doc: 'checked', flag: '--mk-on:1' }, disabled: dis },
    extra: `.box{${checkBox};border-radius:5px}:host([checked]) .box{background:${v('accent')};border-color:${v('accent')}}:host([checked]) .box::after{content:"";position:absolute;left:4.5px;top:1.5px;width:4px;height:8px;border:solid ${v('on-accent')};border-width:0 2px 2px 0;transform:rotate(45deg)}`,
  },
  {
    tag: 'radio',
    doc: 'radio button; quoted string is the label',
    role: 'radio',
    css: choice,
    attrs: { checked: { doc: 'selected', flag: '--mk-on:1' }, disabled: dis },
    extra: `.box{${checkBox};border-radius:50%}:host([checked]) .box{border-color:${v('accent')};border-width:5px}`,
  },
  {
    tag: 'switch',
    doc: 'toggle; quoted string is the label',
    role: 'switch',
    css: choice,
    attrs: { on: { doc: 'turned on', flag: '--mk-on:1' }, disabled: dis },
    extra: `.box{display:inline-block;width:36px;height:20px;border-radius:999px;background:${v('line')};flex:none;position:relative}.box::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3)}:host([on]) .box{background:${v('accent')}}:host([on]) .box::after{left:18px}`,
  },
  {
    tag: 'slider',
    doc: 'range slider; value 0-100',
    role: 'slider',
    css: 'display:flex;flex-direction:column;gap:6px;min-width:min(160px,100%);font-size:var(--mk-f-sm,13px)',
    attrs: { label: lbl, value: { doc: 'position 0-100', bare: true, free: true }, w: A.w, disabled: dis },
    extra: `.label{font-weight:500}.track{position:relative;height:6px;margin:8px 0;border-radius:3px;background:${v('line')}}.fillbar{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:${v('accent')}}.thumb{position:absolute;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid ${v('accent')};background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25)}`,
  },
]

export { layout, content, controls }
