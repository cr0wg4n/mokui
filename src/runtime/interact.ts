import { primitives } from '../tags'

const stateful = new Map(primitives.filter((s) => s.stateful).map((s) => [`mk-${s.tag}`, s]))
const OVERLAYS = 'mk-modal[open],mk-drawer[open]'
const FLOATING = 'mk-dropdown[open],mk-popover[open]'
const isFloating = (n: Element) => n.localName === 'mk-dropdown' || n.localName === 'mk-popover'

/** Is this stateful element currently open? (sidebar is open unless `closed`.) */
export function isOpen(el: Element): boolean {
  return stateful.get(el.localName)?.stateAttr === 'closed' ? !el.hasAttribute('closed') : el.hasAttribute('open')
}

export function setOpen(el: Element, on: boolean): void {
  if (stateful.get(el.localName)?.stateAttr === 'closed') el.toggleAttribute('closed', !on)
  else el.toggleAttribute('open', on)
}

/** Find an element by `name` in the same tree (document or shadow root) as `from`. */
const find = (from: Element, name: string) =>
  (from.getRootNode() as Document | ShadowRoot).querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`)

const enclosing = (el: Element): Element | null => {
  for (let p = el.parentElement; p; p = p.parentElement) if (stateful.has(p.localName)) return p
  return null
}

function act(el: HTMLElement): boolean {
  let handled = false
  const closes = el.getAttribute('closes')
  if (closes !== null) {
    const t = closes ? find(el, closes) : enclosing(el)
    if (t) (setOpen(t, false), (handled = true))
  }
  const opens = el.getAttribute('opens')
  if (opens) {
    const t = find(el, opens)
    if (t) (setOpen(t, true), (handled = true))
  }
  const toggles = el.getAttribute('toggles')
  if (toggles) {
    const t = find(el, toggles)
    if (t) (setOpen(t, !isOpen(t)), (handled = true))
  }
  return handled
}

function onClick(e: MouseEvent) {
  const path = e.composedPath()
  const els = path.filter((n): n is HTMLElement => n instanceof HTMLElement)

  // dropdown / popover: the first child is the trigger and toggles; the rest is the panel.
  // An item click closes it; clicks elsewhere close it.
  const dd = els.find(isFloating)
  if (dd) {
    const inPanel = els.some((n) => n.parentElement === dd && n !== dd.firstElementChild)
    if (!inPanel) dd.toggleAttribute('open')
    else if (els.some((n) => n.localName === 'mk-item')) dd.removeAttribute('open')
  }
  const roots: (Document | ShadowRoot)[] = [document, ...path.filter((n): n is ShadowRoot => n instanceof ShadowRoot)]
  for (const root of roots) {
    root.querySelectorAll(FLOATING).forEach((d) => d !== dd && d.removeAttribute('open'))
  }

  // declared interactions: the innermost element that has one wins
  for (const el of els) {
    if (el.hasAttribute('opens') || el.hasAttribute('toggles') || el.hasAttribute('closes')) {
      if (act(el)) break
    }
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  const open = document.querySelectorAll(OVERLAYS)
  open[open.length - 1]?.removeAttribute('open')
  document.querySelectorAll(FLOATING).forEach((d) => d.removeAttribute('open'))
}

let installed = false
/** One delegated listener for the whole page; works inside framework apps and shadow roots. */
export function installInteractions(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKey)
}
