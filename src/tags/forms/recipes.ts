import { A } from '../shared'
import { inPack, type RNode, type TagSpec } from '../types'
import { cap, carry, free, items, n, parts, txt } from '../recipe-kit'

/** Radio and checkbox groups. */
export const formRecipes: TagSpec[] = inPack('forms', [
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
])
