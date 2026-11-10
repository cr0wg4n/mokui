import './elements/row'
import './elements/stack'
import './elements/text'
import './elements/icon'
import { parse, toHTML } from './dsl/parse'

export { parse, toHTML } from './dsl/parse'
export type { MkNode } from './dsl/parse'
export { scale } from './styles'

/** Render DSL source into a target element. */
export function mount(target: Element, src: string): void {
  target.innerHTML = toHTML(parse(src))
}
