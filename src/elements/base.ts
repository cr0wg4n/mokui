import { adopt } from '../styles'

/** Base for all primitives: open shadow root, shared styles, default slot. */
export class MkElement extends HTMLElement {
  static css = ''
  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    adopt(root, (this.constructor as typeof MkElement).css)
    root.append(document.createElement('slot'))
  }
}
