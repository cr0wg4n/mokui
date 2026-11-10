import { MkElement } from './base'

export class MkStack extends MkElement {
  static css = ':host{display:flex;flex-direction:column}'
}
customElements.get('mk-stack') || customElements.define('mk-stack', MkStack)
