import { baseCss, cssFor } from '../css'
import { primitives } from '../registry'
import { renderers } from './render'

const sheet = (css: string) => {
  const s = new CSSStyleSheet()
  s.replaceSync(css)
  return s
}

/** Define one custom element per primitive in the registry (idempotent). */
export function defineAll(): void {
  const base = sheet(baseCss)
  for (const spec of primitives) {
    const name = `mk-${spec.tag}`
    if (customElements.get(name)) continue
    const own = sheet(cssFor(spec))
    const r = renderers[spec.tag]
    customElements.define(
      name,
      class extends HTMLElement {
        static observedAttributes = Object.keys(spec.attrs)
        constructor() {
          super()
          const root = this.attachShadow({ mode: 'open' })
          root.adoptedStyleSheets = [base, own]
          root.innerHTML = r ? r.template : '<slot></slot>'
        }
        connectedCallback() {
          if (spec.role && !this.hasAttribute('role')) this.setAttribute('role', spec.role)
          r?.update?.(this, this.shadowRoot!)
        }
        attributeChangedCallback() {
          r?.update?.(this, this.shadowRoot!)
        }
      },
    )
  }
}

defineAll()
