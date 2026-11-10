import './runtime/define'
import { compile, hasOverlay } from './dsl/compile'
import { toHTML } from './dsl/parse'
import { themeStyle, type ThemeInput } from './theme/theme'

export * from './core'
export { icons } from './icons/index'

export interface MountOptions {
  /** Look for the whole mock: a theme name (modern, dark, wire or a registered one) or theme options. */
  theme?: ThemeInput
  /** Names of stateful elements (modal, drawer, dropdown, collapse, toast, sidebar) to draw open. */
  open?: string[]
}

/**
 * Render DSL source into a target element. The target becomes a positioned query container, so
 * breakpoint attributes (cols-md=3) respond to its width and overlays cover it. When the mock has a
 * modal or drawer, the target gets a minimum height so the overlay has room.
 */
const applied = new WeakMap<HTMLElement, string[]>()

export function mount(target: HTMLElement, src: string, opts: MountOptions = {}): void {
  const nodes = compile(src, { open: opts.open })
  target.style.containerType = 'inline-size'
  if (getComputedStyle(target).position === 'static') target.style.position = 'relative'
  if (hasOverlay(nodes) && !target.style.minHeight) target.style.minHeight = '520px'
  // Mounting again replaces the look: remove what the previous mount applied, then apply this theme.
  for (const k of applied.get(target) ?? []) {
    if (k.startsWith('--')) target.style.removeProperty(k)
    else (target.style as unknown as Record<string, string>)[k] = ''
  }
  applied.delete(target)
  if (opts.theme) {
    const style = themeStyle(opts.theme)
    for (const [k, val] of Object.entries(style)) {
      if (k.startsWith('--')) target.style.setProperty(k, val)
      else (target.style as unknown as Record<string, string>)[k] = val
    }
    applied.set(target, Object.keys(style))
  }
  target.innerHTML = toHTML(nodes)
}
