import { scale } from './scale'

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

export const A = {
  g: { doc: 'gap between children', responsive: true, rules: space('gap') },
  p: { doc: 'padding', responsive: true, rules: space('padding') },
  align: {
    doc: 'cross-axis alignment',
    rules: Object.fromEntries(
      Object.entries({ start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' }).map(([k, v]) => [k, `align-items:${v}`]),
    ),
  },
  justify: {
    doc: 'main-axis distribution',
    rules: Object.fromEntries(
      Object.entries({ start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }).map(([k, v]) => [k, `justify-content:${v}`]),
    ),
  },
  wrap: { doc: 'allow wrapping', flag: 'flex-wrap:wrap' },
  dir: {
    doc: 'direction (switch layout at a breakpoint)',
    responsive: true,
    rules: { row: 'flex-direction:row', col: 'flex-direction:column' },
  },
  w: { doc: 'width', responsive: true, rules: { ...rulesFrom(scale.size, 'width', 'z'), full: 'width:100%' } },
  h: { doc: 'height', rules: { ...rulesFrom(scale.size, 'height', 'z'), full: 'height:100%' } },
  s: { doc: 'font size', rules: rulesFrom(scale.font, 'font-size', 'f') },
} satisfies Record<string, AttrDef>

/** Intent attributes available on every tag. Never required, never affect rendering. */
export const INTENT: Record<string, AttrDef> = {
  name: { doc: 'identifier, e.g. #login-btn', free: true },
  role: { doc: 'semantic role, also the ARIA role', free: true },
  note: { doc: 'requirement note shown in the outline', free: true },
}

const flex = 'display:flex;'
const colRules = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [String(i + 1), `grid-template-columns:repeat(${i + 1},minmax(0,1fr))`]))

// ---------- layout ----------

const layout: TagSpec[] = [
  {
    tag: 'stack',
    doc: 'vertical flex container',
    css: `${flex}flex-direction:column`,
    attrs: { g: A.g, p: A.p, align: A.align, justify: A.justify, wrap: A.wrap, dir: A.dir, w: A.w, h: A.h },
  },
  {
    tag: 'row',
    doc: 'horizontal flex container',
    css: `${flex}flex-direction:row`,
    attrs: { g: A.g, p: A.p, align: A.align, justify: A.justify, wrap: A.wrap, dir: A.dir, w: A.w, h: A.h },
  },
  {
    tag: 'grid',
    doc: 'grid; cols=N fixed columns, or min=<width> to auto-reflow',
    css: 'display:grid;grid-template-columns:minmax(0,1fr)',
    attrs: {
      cols: { doc: 'fixed column count 1-6', responsive: true, bare: true, rules: colRules(6) },
      min: {
        doc: 'auto-reflow: columns at least this wide',
        rules: Object.fromEntries(
          Object.entries(scale.min).map(([k, v]) => [k, `grid-template-columns:repeat(auto-fit,minmax(var(--mk-m-${k},${v}),1fr))`]),
        ),
      },
      g: A.g,
      p: A.p,
      align: A.align,
      w: A.w,
      h: A.h,
    },
  },
  {
    tag: 'box',
    doc: 'bordered container',
    css: `${flex}flex-direction:column;border:1px solid var(--mk-line,#bbb);border-radius:var(--mk-r,6px)`,
    attrs: {
      g: A.g, p: A.p, align: A.align, justify: A.justify, dir: A.dir, w: A.w, h: A.h,
      fill: { doc: 'light background', flag: 'background:var(--mk-fill,#f2f2f2)' },
    },
  },
  {
    tag: 'spacer',
    doc: 'flexible empty space; pushes siblings apart',
    css: 'flex:1 1 0;min-width:0;min-height:0',
    attrs: {},
  },
  {
    tag: 'divider',
    doc: 'thin line',
    role: 'separator',
    css: 'align-self:stretch;height:1px;background:var(--mk-line,#ccc);flex:none',
    attrs: { vertical: { doc: 'vertical line', flag: 'width:1px;height:auto' } },
  },
  {
    tag: 'scroll',
    doc: 'scrollable region; set h',
    css: 'display:block;overflow:auto',
    attrs: { h: A.h, w: A.w, p: A.p },
  },
  {
    tag: 'frame',
    doc: 'device-width preview; also the query container for breakpoints',
    css: 'display:block;container-type:inline-size;width:100%;margin-inline:auto;border:1px dashed var(--mk-line,#bbb);overflow:auto',
    attrs: {
      device: {
        doc: 'preview width',
        bare: true,
        rules: { mobile: 'max-width:375px', tablet: 'max-width:768px', desktop: 'max-width:1280px' },
      },
    },
  },
]


// ---------- content ----------

const withBare = (d: AttrDef): AttrDef => ({ ...d, bare: true })
const sFont = withBare(A.s)
const variantBtn: AttrDef = {
  doc: 'visual weight',
  bare: true,
  rules: {
    primary: 'background:var(--mk-fg,#222);color:var(--mk-bg,#fff)',
    secondary: 'background:var(--mk-bg,#fff)',
    ghost: 'border-color:transparent;background:transparent',
  },
}

const content: TagSpec[] = [
  {
    tag: 'text',
    doc: 'text; quoted string is the content',
    css: 'display:block;font-size:var(--mk-f-md,15px);line-height:1.4',
    attrs: {
      s: sFont,
      bold: { doc: 'bold', flag: 'font-weight:700' },
      muted: { doc: 'secondary color', flag: 'color:var(--mk-muted,#777)' },
      center: { doc: 'center aligned', flag: 'text-align:center' },
    },
  },
  {
    tag: 'icon',
    doc: 'Lucide-named icon; first bare word is the name',
    css: 'display:inline-flex;width:1.5em;height:1.5em;flex:none',
    attrs: { n: { doc: 'icon name', free: true, bare: true, required: true }, s: A.s },
    extra: 'svg{width:100%;height:100%}',
  },
  {
    tag: 'image',
    doc: 'image placeholder; quoted string is the label',
    role: 'img',
    css: 'display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;width:var(--mk-z-lg,160px);max-width:100%;color:var(--mk-muted,#777);font-size:var(--mk-f-sm,13px);border:1px solid var(--mk-line,#bbb);background:linear-gradient(to top right,transparent calc(50% - .5px),var(--mk-line,#bbb) 50%,transparent calc(50% + .5px)),linear-gradient(to top left,transparent calc(50% - .5px),var(--mk-line,#bbb) 50%,transparent calc(50% + .5px)),var(--mk-fill,#f2f2f2)',
    attrs: {
      w: A.w,
      h: { ...A.h, rules: { ...A.h.rules } },
      ratio: {
        doc: 'aspect ratio',
        bare: true,
        rules: { '1:1': 'aspect-ratio:1/1', '4:3': 'aspect-ratio:4/3', '16:9': 'aspect-ratio:16/9', '3:4': 'aspect-ratio:3/4', '9:16': 'aspect-ratio:9/16' },
      },
    },
    extra: 'slot{background:var(--mk-fill,#f2f2f2);padding:0 6px}',
  },
  {
    tag: 'avatar',
    doc: 'circular avatar; quoted string is the initials',
    css: 'display:inline-flex;align-items:center;justify-content:center;width:2.5em;height:2.5em;flex:none;border-radius:50%;border:1px solid var(--mk-line,#bbb);background:var(--mk-fill,#f2f2f2);font-size:var(--mk-f-md,15px);overflow:hidden',
    attrs: { s: sFont },
  },
  {
    tag: 'badge',
    doc: 'small pill label; quoted string is the content',
    css: 'display:inline-flex;align-items:center;width:fit-content;padding:2px 8px;border-radius:999px;border:1px solid var(--mk-line,#bbb);background:var(--mk-fill,#f2f2f2);font-size:var(--mk-f-xs,11px)',
    attrs: { variant: { doc: 'style', bare: true, rules: { primary: 'background:var(--mk-fg,#222);color:var(--mk-bg,#fff);border-color:var(--mk-fg,#222)' } } },
  },
]

// ---------- controls ----------

const dis: AttrDef = { doc: 'disabled look', flag: 'opacity:.45' }
const lbl: AttrDef = { doc: 'label above the control', free: true }
const fieldBox = 'display:flex;flex-direction:column;gap:4px;min-width:min(160px,100%);font-size:var(--mk-f-md,15px)'
const fieldCss =
  '.label{font-size:var(--mk-f-sm,13px);color:var(--mk-muted,#555)}.field{display:flex;align-items:center;gap:8px;min-height:36px;padding:6px 10px;border:1px solid var(--mk-line,#bbb);border-radius:var(--mk-r,6px);background:var(--mk-bg,#fff)}.field .ico{display:inline-flex;width:1.2em;height:1.2em;color:var(--mk-muted,#777)}.field .ico svg{width:100%;height:100%}.val{flex:1;color:var(--mk-fg,#222)}.ph{flex:1;color:var(--mk-muted,#999)}'

const controls: TagSpec[] = [
  {
    tag: 'button',
    doc: 'button; quoted string is the label',
    role: 'button',
    css: 'display:inline-flex;align-items:center;justify-content:center;gap:6px;width:fit-content;padding:8px 16px;border:1px solid var(--mk-fg,#222);border-radius:var(--mk-r,6px);background:var(--mk-bg,#fff);color:var(--mk-fg,#222);font-size:var(--mk-f-md,15px)',
    attrs: {
      variant: variantBtn,
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
      disabled: dis,
    },
    extra: '.ico{display:inline-flex;width:1.2em;height:1.2em}.ico svg{width:100%;height:100%}',
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
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss + '.field{align-items:flex-start;min-height:calc(var(--mk-rows,3) * 1.4em + 14px)}',
  },
  {
    tag: 'select',
    doc: 'dropdown; quoted string is options "A|B|C"',
    role: 'combobox',
    text: 'opts',
    css: fieldBox,
    attrs: {
      label: lbl,
      opts: { doc: 'options separated by |', free: true },
      value: { doc: 'selected value (default first option)', free: true },
      open: { doc: 'show the option list', flag: '' },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss + '.list{border:1px solid var(--mk-line,#bbb);border-radius:var(--mk-r,6px);background:var(--mk-bg,#fff)}.list div{padding:6px 10px}.list div[data-sel]{background:var(--mk-fill,#f2f2f2)}',
  },
  {
    tag: 'checkbox',
    doc: 'checkbox; quoted string is the label',
    role: 'checkbox',
    css: 'display:inline-flex;align-items:center;gap:8px;font-size:var(--mk-f-md,15px)',
    attrs: { checked: { doc: 'checked', flag: '--mk-on:1' }, disabled: dis },
    extra: '.box{display:inline-block;width:16px;height:16px;border:1px solid var(--mk-fg,#222);border-radius:3px;flex:none;position:relative}:host([checked]) .box{background:var(--mk-fg,#222)}:host([checked]) .box::after{content:"";position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid var(--mk-bg,#fff);border-width:0 2px 2px 0;transform:rotate(45deg)}',
  },
  {
    tag: 'radio',
    doc: 'radio button; quoted string is the label',
    role: 'radio',
    css: 'display:inline-flex;align-items:center;gap:8px;font-size:var(--mk-f-md,15px)',
    attrs: { checked: { doc: 'selected', flag: '--mk-on:1' }, disabled: dis },
    extra: '.box{display:inline-block;width:16px;height:16px;border:1px solid var(--mk-fg,#222);border-radius:50%;flex:none;position:relative}:host([checked]) .box::after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--mk-fg,#222)}',
  },
  {
    tag: 'switch',
    doc: 'toggle; quoted string is the label',
    role: 'switch',
    css: 'display:inline-flex;align-items:center;gap:8px;font-size:var(--mk-f-md,15px)',
    attrs: { on: { doc: 'turned on', flag: '--mk-on:1' }, disabled: dis },
    extra: '.box{display:inline-block;width:32px;height:18px;border:1px solid var(--mk-fg,#222);border-radius:999px;flex:none;position:relative}.box::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:var(--mk-fg,#222)}:host([on]) .box{background:var(--mk-fg,#222)}:host([on]) .box::after{left:16px;background:var(--mk-bg,#fff)}',
  },
  {
    tag: 'slider',
    doc: 'range slider; value 0-100',
    role: 'slider',
    css: 'display:flex;flex-direction:column;gap:4px;min-width:min(160px,100%);font-size:var(--mk-f-sm,13px)',
    attrs: { label: lbl, value: { doc: 'position 0-100', bare: true, free: true }, w: A.w, disabled: dis },
    extra: '.label{color:var(--mk-muted,#555)}.track{position:relative;height:4px;margin:8px 0;border-radius:2px;background:var(--mk-line,#ccc)}.fillbar{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:var(--mk-fg,#222)}.thumb{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid var(--mk-fg,#222);background:var(--mk-bg,#fff)}',
  },
]

export const primitives: TagSpec[] = [...layout, ...content, ...controls]
