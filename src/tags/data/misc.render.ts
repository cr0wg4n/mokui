import { put, q, type Renderer } from '../../runtime/dom'


export const dataMiscRenderers: Record<string, Renderer> = {
  video: {
    template: '<span class="play"></span><slot></slot>',
    update: (_el, root) => put(q(root, '.play'), 'play'),
  },
}
