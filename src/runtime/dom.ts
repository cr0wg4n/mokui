import { icons } from '../icons/index'

/** Helpers every renderer uses: SVG icons, shadow-root queries, icon buttons. */
const SVG = 'http://www.w3.org/2000/svg'
const PLACEHOLDER = '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/>'

/** Build an icon <svg>. Unknown names warn and return a dashed placeholder. */
export function svgIcon(name: string): SVGSVGElement {
  const body = icons[name]
  if (!body) console.warn(`[mokui] unknown icon "${name}". Valid: ${Object.keys(icons).join(' ')}`)
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.innerHTML = body ?? PLACEHOLDER
  return svg
}

export interface Renderer {
  template: string
  /** Once, after the template is in place: wire internal events. */
  setup?: (el: HTMLElement, root: ShadowRoot) => void
  update?: (el: HTMLElement, root: ShadowRoot) => void
}

export const q = (root: ShadowRoot, sel: string) => root.querySelector<HTMLElement>(sel)!
export const put = (host: HTMLElement | null, name: string | null) => {
  if (!host) return
  host.replaceChildren()
  if (name) host.append(svgIcon(name))
  host.style.display = name ? '' : 'none'
}

export const iconButton = (root: ShadowRoot, sel: string, name: string, onClick: () => void) => {
  const b = q(root, sel)
  b.append(svgIcon(name))
  b.addEventListener('click', (e) => (e.stopPropagation(), onClick()))
}
export const title = (el: HTMLElement, root: ShadowRoot) => {
  const t = q(root, '.title')
  t.textContent = el.getAttribute('label') ?? ''
}
