import { baseCss, cssFor, themeRule } from '../css'
import { themeListeners } from '../scale'
import { primitives } from '../specs'
import { installInteractions } from './interact'
import { renderers } from './render'

const sheet = (css: string) => {
  const s = new CSSStyleSheet()
  s.replaceSync(css)
  return s
}

/** Define one custom element per primitive in the registry (idempotent). */
export function defineAll(): void {
  installInteractions()
  const base = sheet(baseCss())
  // themes registered later get their rule inserted into the shared base sheet
  themeListeners.add((name) => base.insertRule(themeRule(name), base.cssRules.length))
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
          r?.setup?.(this, root)
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
