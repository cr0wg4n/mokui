import { A } from '../shared'
import { inPack, type RNode, type TagSpec } from '../types'
import { cap, carry, free, items, n, parts, txt } from '../recipe-kit'

/** Timeline. */
export const dataRecipes: TagSpec[] = inPack('data', [
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
])
