import { svgIcon, type Renderer } from '../../runtime/dom'


export const contentRenderers: Record<string, Renderer> = {
  icon: {
    template: '',
    update(el, root) {
      root.replaceChildren(svgIcon(el.getAttribute('n') ?? ''))
    },
  },
}
