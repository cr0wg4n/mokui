import './elements/index'
import { compile, hasOverlay } from './dsl/compile'
import { toHTML } from './dsl/parse'
import { themeStyle, type ThemeName } from './scale'

export * from './core'
export { icons } from './icons/index'

export interface MountOptions {
  /** Look for the whole mock: modern (default), dark or wire. */
  theme?: ThemeName
  /** Names of stateful elements (modal, drawer, dropdown, collapse, toast, sidebar) to draw open. */
  open?: string[]
}

/**
 * Render DSL source into a target element. The target becomes a positioned query container, so
 * breakpoint attributes (cols-md=3) respond to its width and overlays cover it. When the mock has a
 * modal or drawer, the target gets a minimum height so the overlay has room.
 */
export function mount(target: HTMLElement, src: string, opts: MountOptions = {}): void {
  const nodes = compile(src, { open: opts.open })
  target.style.containerType = 'inline-size'
  if (getComputedStyle(target).position === 'static') target.style.position = 'relative'
  if (hasOverlay(nodes) && !target.style.minHeight) target.style.minHeight = '520px'
  if (opts.theme) {
    for (const [k, val] of Object.entries(themeStyle(opts.theme))) {
      if (k.startsWith('--')) target.style.setProperty(k, val)
      else (target.style as unknown as Record<string, string>)[k] = val
    }
  }
  target.innerHTML = toHTML(nodes)
}
