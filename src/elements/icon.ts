import { icons } from '../icons/index'
import { MkElement } from './base'

const PLACEHOLDER = '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/>'

export class MkIcon extends MkElement {
  static css = ':host{display:inline-block;width:1.5em;height:1.5em}svg{width:100%;height:100%}'
  static observedAttributes = ['n']

  connectedCallback() { this.draw() }
  attributeChangedCallback() { this.draw() }

  private draw() {
    const name = this.getAttribute('n') ?? ''
    const body = icons[name]
    if (!body) console.warn(`[mokui] unknown icon "${name}". Valid: ${Object.keys(icons).join(', ')}`)
    const root = this.shadowRoot!
    root.querySelector('svg')?.remove()
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.innerHTML = body ?? PLACEHOLDER
    root.append(svg)
  }
}
customElements.get('mk-icon') || customElements.define('mk-icon', MkIcon)
