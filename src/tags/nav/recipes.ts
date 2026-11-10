import { A } from '../shared'
import { inPack, type RNode, type TagSpec } from '../types'
import { cap, carry, free, items, n, parts, txt } from '../recipe-kit'

/** Navigation and page recipes. */
export const navRecipes: TagSpec[] = inPack('nav', [
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
])
