import { MkElement } from './base'

export class MkText extends MkElement {
  static css = ':host{display:block;font-size:var(--mk-f-md,15px)}'
}
customElements.get('mk-text') || customElements.define('mk-text', MkText)
