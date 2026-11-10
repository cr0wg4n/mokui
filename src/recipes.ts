import { A, type AttrDef, type RNode, type TagSpec } from './registry'

const n = (tag: string, attrs: Record<string, string> = {}, children: RNode[] = [], text?: string): RNode => {
  const node: RNode = { tag, attrs, children }
  if (text !== undefined) node.text = text
  return node
}
/** Attributes every recipe passes to its outer node. */
const carry = (a: Record<string, string>) =>
  Object.fromEntries(Object.entries(a).filter(([k]) => ['name', 'role', 'note', 'theme', 'opens', 'toggles', 'closes', 'w', 'h'].includes(k)))
const items = (s: string | undefined) => (s ? s.split('|').map((x) => x.trim()) : [])

const sp = { g: A.g, p: A.p }
const parts = (s: string | undefined) => (s ? s.split(':').map((x) => x.trim()) : [])
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const num = (xs: number[]) => Object.fromEntries(xs.map((x) => [String(x), '']))
const txt = (t: string, a: Record<string, string> = {}) => n('text', a, [], t)
const free = (doc: string, bare = false) => ({ doc, free: true as const, bare })

export const recipes: TagSpec[] = [
  {
    tag: 'card',
    doc: 'bordered group with optional title (quoted); children go inside',
    attrs: { ...sp, w: A.w },
    expand: (node) => [
      n(
        'box',
        { p: node.attrs.p ?? 'md', g: node.attrs.g ?? 'sm', raised: '', ...carry(node.attrs) },
        [...(node.text ? [n('text', { s: 'lg', bold: '' }, [], node.text)] : []), ...node.children],
      ),
    ],
  },
  {
    tag: 'navbar',
    doc: 'top bar: brand (quoted), then spacer, then children',
    attrs: { w: A.w },
    expand: (node) => [
      n('stack', carry(node.attrs), [
        n('row', { align: 'center', g: 'md', p: 'md' }, [
          ...(node.text ? [n('text', { s: 'lg', bold: '' }, [], node.text)] : []),
          n('spacer'),
          ...node.children,
        ]),
        n('divider'),
      ]),
    ],
  },
  {
    tag: 'list',
    doc: 'vertical list; quoted "A|B|C" or children; divided adds lines',
    attrs: { g: A.g, divided: { doc: 'lines between items', flag: '' } },
    expand: (node) => {
      const rows = [...items(node.text).map((t) => n('text', {}, [], t)), ...node.children]
      const body: RNode[] = []
      rows.forEach((r, i) => {
        if (i && 'divided' in node.attrs) body.push(n('divider'))
        body.push(r)
      })
      return [n('stack', { g: node.attrs.g ?? 'sm', ...carry(node.attrs) }, body)]
    },
  },
  {
    tag: 'tr',
    doc: 'table row; quoted "a|b|c"',
    attrs: { cols: { doc: 'column count (set by table)', bare: true, rules: Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [String(i), ''])) } },
    expand: (node) => {
      const cells = items(node.text)
      const cols = node.attrs.cols ?? String(Math.min(Math.max(cells.length, 1), 6))
      return [n('grid', { cols, g: 'md', p: 'sm', ...carry(node.attrs) }, cells.map((c) => n('text', {}, [], c)))]
    },
  },
  {
    tag: 'table',
    doc: 'table; quoted "A|B|C" is the header; children are tr',
    attrs: { w: A.w },
    expand: (node) => {
      const head = items(node.text)
      const cols = String(Math.min(Math.max(head.length, 1), 6))
      const body: RNode[] = []
      for (const c of node.children) {
        body.push(c.tag === 'tr' ? { ...c, attrs: { cols, ...c.attrs } } : c, n('divider'))
      }
      return [
        n('stack', { g: 'none', ...carry(node.attrs) }, [
          n('grid', { cols, g: 'md', p: 'sm' }, head.map((t) => n('text', { bold: '' }, [], t))),
          n('divider'),
          ...body,
        ]),
      ]
    },
  },
  {
    tag: 'breadcrumb',
    doc: 'path; quoted "Home|Projects|Settings"',
    attrs: {},
    expand: (node) => {
      const xs = items(node.text)
      return [
        n('row', { g: 'sm', align: 'center', ...carry(node.attrs) },
          xs.flatMap((t, i) => [
            ...(i ? [n('icon', { n: 'chevron-right', s: 'xs', muted: '' })] : []),
            txt(t, { s: 'sm', ...(i === xs.length - 1 ? { bold: '' } : { muted: '' }) }),
          ])),
      ]
    },
  },
  {
    tag: 'pagination',
    doc: 'page buttons; quoted "1|2|3|10"; active=N',
    attrs: { active: free('current page') },
    expand: (node) => {
      const cur = node.attrs.active ?? '1'
      const btn = (a: Record<string, string>, label?: string) => n('button', { s: 'sm', ...a }, [], label)
      return [
        n('row', { g: 'xs', align: 'center', ...carry(node.attrs) }, [
          btn({ variant: 'ghost', icon: 'chevron-left' }),
          ...items(node.text).map((t) => (t === '…' || t === '...' ? txt('…', { muted: '' }) : btn({ variant: t === cur ? 'primary' : 'ghost' }, t))),
          btn({ variant: 'ghost', icon: 'chevron-right' }),
        ]),
      ]
    },
  },
  {
    tag: 'steps',
    doc: 'progress steps; quoted "Account|Plan|Confirm"; active=N (1-based)',
    attrs: { active: free('current step') },
    expand: (node) => {
      const act = Number(node.attrs.active ?? 1)
      const xs = items(node.text)
      return [
        n('row', { g: 'sm', align: 'center', ...carry(node.attrs) },
          xs.flatMap((t, i) => [
            ...(i ? [n('divider', { grow: '' })] : []),
            n('row', { g: 'sm', align: 'center' }, [
              n('badge', i + 1 <= act ? { variant: 'primary' } : {}, [], i + 1 < act ? '✓' : String(i + 1)),
              txt(t, i + 1 === act ? { bold: '' } : { muted: '' }),
            ]),
          ])),
      ]
    },
  },
  {
    tag: 'tabbar',
    doc: 'mobile bottom bar; quoted "home|search|bell:Alerts|user"; active=N',
    attrs: { active: free('selected item') },
    expand: (node) => {
      const act = Number(node.attrs.active ?? 1)
      return [
        n('stack', { g: 'none', bottom: '', ...carry(node.attrs) }, [
          n('divider'),
          n('row', { justify: 'between', p: 'sm' },
            items(node.text).map((it, i) => {
              const [icon, label] = parts(it) as [string, string | undefined]
              return n('stack', { g: 'xs', align: 'center', grow: '' }, [
                n('icon', i + 1 === act ? { n: icon } : { n: icon, muted: '' }),
                txt(label ?? cap(icon), { s: 'xs', ...(i + 1 === act ? { bold: '' } : { muted: '' }) }),
              ])
            })),
        ]),
      ]
    },
  },
  {
    tag: 'toolbar',
    doc: 'row of actions on a subtle bar; children go inside',
    attrs: { w: A.w },
    expand: (node) => [n('box', { dir: 'row', align: 'center', g: 'sm', p: 'sm', fill: '', ...carry(node.attrs) }, node.children)],
  },
  {
    tag: 'command',
    doc: 'command palette (a modal); quoted "Placeholder|Item|Item"; open with opens=#name',
    stateful: true,
    attrs: {},
    expand: (node) => {
      const [ph, ...rest] = items(node.text)
      return [
        n('modal', { size: 'md', ...carry(node.attrs) }, [
          n('input', { type: 'search', ph: ph ?? 'Type a command' }),
          n('stack', { g: 'none' }, rest.map((t) => n('item', {}, [], t))),
        ]),
      ]
    },
  },
  {
    tag: 'hero',
    doc: 'page hero; quoted string is the headline; sub="..." subtitle; children are actions',
    attrs: { sub: free('subtitle') },
    expand: (node) => [
      n('stack', { g: 'md', p: 'xl', align: 'center', ...carry(node.attrs) }, [
        txt(node.text ?? '', { s: 'xl', bold: '', center: '' }),
        ...(node.attrs.sub ? [txt(node.attrs.sub, { muted: '', center: '' })] : []),
        ...(node.children.length ? [n('row', { g: 'sm', justify: 'center', wrap: '' }, node.children)] : []),
      ]),
    ],
  },
  {
    tag: 'footer',
    doc: 'page footer; quoted "Acme Inc|Privacy|Terms": first on the left, rest on the right',
    attrs: {},
    expand: (node) => {
      const [first, ...rest] = items(node.text)
      return [
        n('stack', { g: 'none', ...carry(node.attrs) }, [
          n('divider'),
          n('row', { justify: 'between', align: 'center', p: 'md', wrap: '' }, [
            txt(first ?? '', { s: 'sm', muted: '' }),
            n('row', { g: 'lg' }, rest.map((t) => txt(t, { s: 'sm', muted: '' }))),
          ]),
        ]),
      ]
    },
  },
  {
    tag: 'stat',
    doc: 'metric card; quoted string is the label; value="1,204" delta="+12%"',
    attrs: { value: free('the number'), delta: free('change, e.g. +12%'), w: A.w },
    expand: (node) => {
      const d = node.attrs.delta
      return [
        n('box', { p: 'md', g: 'xs', raised: '', ...carry(node.attrs) }, [
          txt(node.text ?? '', { s: 'sm', muted: '' }),
          n('row', { g: 'sm', align: 'center' }, [
            txt(node.attrs.value ?? '', { s: 'xl', bold: '' }),
            ...(d ? [n('badge', d.startsWith('+') ? { variant: 'success' } : d.startsWith('-') ? { variant: 'error' } : {}, [], d)] : []),
          ]),
        ]),
      ]
    },
  },
  {
    tag: 'empty',
    doc: 'empty state; quoted string is the title; sub="..." icon=name; children are actions',
    attrs: { sub: free('explanation'), icon: free('icon name') },
    expand: (node) => [
      n('stack', { g: 'sm', align: 'center', p: 'xl', ...carry(node.attrs) }, [
        n('icon', { n: node.attrs.icon ?? 'inbox', s: 'xl', muted: '' }),
        txt(node.text ?? '', { bold: '', center: '' }),
        ...(node.attrs.sub ? [txt(node.attrs.sub, { s: 'sm', muted: '', center: '' })] : []),
        ...node.children,
      ]),
    ],
  },
  {
    tag: 'timeline',
    doc: 'vertical steps; quoted "Created:Mar 3|Reviewed|Shipped"; active=N steps done',
    attrs: { active: free('steps completed') },
    expand: (node) => {
      const done = Number(node.attrs.active ?? 0)
      return [
        n('stack', { g: 'md', ...carry(node.attrs) },
          items(node.text).map((it, i) => {
            const [label, sub] = parts(it) as [string, string | undefined]
            return n('row', { g: 'md', align: 'center' }, [
              n('icon', i < done ? { n: 'circle-check' } : { n: 'circle', muted: '' }),
              n('stack', { g: 'none' }, [txt(label, i < done ? { bold: '' } : { muted: '' }), ...(sub ? [txt(sub, { s: 'sm', muted: '' })] : [])]),
            ])
          })),
      ]
    },
  },
  {
    tag: 'radios',
    doc: 'radio group; quoted "A|B|C"; value=B (text or 1-based number); inline for a row',
    attrs: { value: free('selected option'), inline: { doc: 'lay out in a row', flag: '' }, g: A.g },
    expand: (node) => {
      const xs = items(node.text)
      const v = node.attrs.value
      return [
        n(node.attrs.inline !== undefined ? 'row' : 'stack', { g: node.attrs.g ?? (node.attrs.inline !== undefined ? 'lg' : 'sm'), ...carry(node.attrs) },
          xs.map((t, i) => n('radio', v === t || v === String(i + 1) ? { checked: '' } : {}, [], t))),
      ]
    },
  },
  {
    tag: 'checkboxes',
    doc: 'checkbox group; quoted "A|B|C"; checked="1,3" (numbers or texts); inline for a row',
    attrs: { checked: free('checked options, comma-separated'), inline: { doc: 'lay out in a row', flag: '' }, g: A.g },
    expand: (node) => {
      const xs = items(node.text)
      const on = (node.attrs.checked ?? '').split(',').map((x) => x.trim()).filter(Boolean)
      return [
        n(node.attrs.inline !== undefined ? 'row' : 'stack', { g: node.attrs.g ?? (node.attrs.inline !== undefined ? 'lg' : 'sm'), ...carry(node.attrs) },
          xs.map((t, i) => n('checkbox', on.includes(t) || on.includes(String(i + 1)) ? { checked: '' } : {}, [], t))),
      ]
    },
  },
]

export type { AttrDef }
