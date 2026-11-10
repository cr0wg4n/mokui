import { A } from '../shared'
import { inPack, type RNode, type TagSpec } from '../types'
import { cap, carry, free, items, n, parts, txt } from '../recipe-kit'

const sp = { g: A.g, p: A.p }

/** Recipes that expand into primitives: card, navbar, list, table. */
export const coreRecipes: TagSpec[] = inPack('core', [
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
])
