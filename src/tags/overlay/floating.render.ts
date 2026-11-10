import { put, q, type Renderer } from '../../runtime/dom'

const withIcon: Renderer = {
  template: '<span class="ico"></span><slot></slot>',
  update: (el, root) => put(q(root, '.ico'), el.getAttribute('icon')),
}

export const floatingRenderers: Record<string, Renderer> = {
  item: withIcon,
  tooltip: {
    template: '<slot></slot><span class="tip"></span>',
    update: (el, root) => (q(root, '.tip').textContent = el.getAttribute('tip') ?? ''),
  },
}
