import { q, type Renderer } from '../../runtime/dom'


export const layoutRenderers: Record<string, Renderer> = {
  divider: {
    template: '<i class="l"></i><span class="t"></span><i class="l"></i>',
    update: (el, root) => (q(root, '.t').textContent = el.getAttribute('label') ?? ''),
  },
}
