import './elements/index'
import { html } from './dsl/compile'

export * from './core'
export { icons } from './icons/index'

/**
 * Render DSL source into a target element. The target becomes a query container so
 * breakpoint attributes (cols-md=3) respond to its width.
 */
export function mount(target: HTMLElement, src: string): void {
  target.style.containerType = 'inline-size'
  target.innerHTML = html(src)
}
