import { MkElement } from './base'

export class MkRow extends MkElement {
  static css = ':host{display:flex;flex-direction:row}'
}
customElements.get('mk-row') || customElements.define('mk-row', MkRow)
