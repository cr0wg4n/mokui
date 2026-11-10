import { A } from '../shared'
import { inPack, type RNode, type TagSpec } from '../types'
import { cap, carry, free, items, n, parts, txt } from '../recipe-kit'

/** Empty state and metric card. */
export const feedbackRecipes: TagSpec[] = inPack('feedback', [
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
])
