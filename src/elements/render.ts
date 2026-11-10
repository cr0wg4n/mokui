import { icons } from '../icons/index'

const SVG = 'http://www.w3.org/2000/svg'
const PLACEHOLDER = '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/>'

/** Build an icon <svg>. Unknown names warn and return a dashed placeholder. */
export function svgIcon(name: string): SVGSVGElement {
  const body = icons[name]
  if (!body) console.warn(`[mokui] unknown icon "${name}". Valid: ${Object.keys(icons).join(' ')}`)
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.innerHTML = body ?? PLACEHOLDER
  return svg
}

interface Renderer {
  template: string
  /** Once, after the template is in place: wire internal events. */
  setup?: (el: HTMLElement, root: ShadowRoot) => void
  update?: (el: HTMLElement, root: ShadowRoot) => void
}

const q = (root: ShadowRoot, sel: string) => root.querySelector<HTMLElement>(sel)!
const put = (host: HTMLElement | null, name: string | null) => {
  if (!host) return
  host.replaceChildren()
  if (name) host.append(svgIcon(name))
  host.style.display = name ? '' : 'none'
}
const label = (el: HTMLElement, root: ShadowRoot) => {
  const l = q(root, '.label')
  l.textContent = el.getAttribute('label') ?? ''
  l.style.display = l.textContent ? '' : 'none'
}
const fieldText = (el: HTMLElement, root: ShadowRoot, fallback = '') => {
  const t = q(root, '.txt')
  const value = el.getAttribute('value') ?? fallback
  t.textContent = value || el.getAttribute('ph') || ''
  t.className = value ? 'txt val' : 'txt ph'
}
const box: Renderer = { template: '<span class="box"></span><slot></slot>' }
const fieldTpl = '<div class="label"></div><div class="field"><span class="ico pre"></span><span class="txt"></span><span class="ico post"></span></div>'

const iconButton = (root: ShadowRoot, sel: string, name: string, onClick: () => void) => {
  const b = q(root, sel)
  b.append(svgIcon(name))
  b.addEventListener('click', (e) => (e.stopPropagation(), onClick()))
}
const title = (el: HTMLElement, root: ShadowRoot) => {
  const t = q(root, '.title')
  t.textContent = el.getAttribute('label') ?? ''
}
const close = (el: HTMLElement) => el.removeAttribute('open')
const dialog: Renderer = {
  template: '<div class="panel"><div class="head"><span class="title"></span><button class="x" aria-label="Close"></button></div><div class="body"><slot></slot></div></div>',
  setup(el, root) {
    iconButton(root, '.x', 'x', () => close(el))
    // a click on the backdrop itself (not the panel) closes
    el.addEventListener('click', (e) => e.composedPath()[0] === el && close(el))
  },
  update: title,
}
const withIcon: Renderer = {
  template: '<span class="ico"></span><slot></slot>',
  update: (el, root) => put(q(root, '.ico'), el.getAttribute('icon')),
}

export const renderers: Record<string, Renderer> = {
  modal: dialog,
  drawer: dialog,
  item: withIcon,
  toast: {
    template: '<span class="msg"><slot></slot></span><button class="x" aria-label="Close"></button>',
    setup: (el, root) => iconButton(root, '.x', 'x', () => close(el)),
  },
  tooltip: {
    template: '<slot></slot><span class="tip"></span>',
    update: (el, root) => (q(root, '.tip').textContent = el.getAttribute('tip') ?? ''),
  },
  collapse: {
    template: '<div class="head"><span class="title"></span><span class="chev"></span></div><div class="body"><slot></slot></div>',
    setup: (el, root) => q(root, '.head').addEventListener('click', () => el.toggleAttribute('open')),
    update(el, root) {
      title(el, root)
      put(q(root, '.chev'), el.hasAttribute('open') ? 'chevron-up' : 'chevron-down')
    },
  },
  tabs: {
    template: '<div class="strip" role="tablist"></div><slot></slot>',
    setup(el, root) {
      root.querySelector('slot')!.addEventListener('slotchange', () => renderers.tabs!.update!(el, root))
      q(root, '.strip').addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
        if (b) el.setAttribute('active', String(Number(b.dataset.i) + 1))
      })
    },
    update(el, root) {
      const panels = Array.from(el.children).filter((c) => c.localName === 'mk-tab') as HTMLElement[]
      const labels = panels.length ? panels.map((p) => p.getAttribute('label') ?? '') : (el.getAttribute('opts') ?? '').split('|').map((t) => t.trim()).filter(Boolean)
      const idx = Math.min(Math.max((Number(el.getAttribute('active')) || 1) - 1, 0), Math.max(labels.length - 1, 0))
      panels.forEach((p, i) => (p.hidden = i !== idx))
      q(root, '.strip').replaceChildren(
        ...labels.map((l, i) => {
          const b = document.createElement('button')
          b.className = 'tabbtn'
          b.setAttribute('role', 'tab')
          b.setAttribute('aria-selected', String(i === idx))
          b.dataset.i = String(i)
          b.textContent = l
          return b
        }),
      )
    },
  },
  icon: {
    template: '',
    update(el, root) {
      root.replaceChildren(svgIcon(el.getAttribute('n') ?? ''))
    },
  },
  button: {
    template: '<span class="ico"></span><slot></slot>',
    update: (el, root) => put(q(root, '.ico'), el.getAttribute('icon')),
  },
  input: {
    template: fieldTpl,
    update(el, root) {
      label(el, root)
      fieldText(el, root)
      const type = el.getAttribute('type')
      put(q(root, '.pre'), type === 'search' ? 'search' : null)
      put(q(root, '.post'), type === 'date' ? 'calendar' : type === 'password' ? 'eye' : null)
    },
  },
  textarea: {
    template: fieldTpl,
    update(el, root) {
      label(el, root)
      fieldText(el, root)
      put(q(root, '.pre'), null)
      put(q(root, '.post'), null)
    },
  },
  select: {
    template: fieldTpl + '<div class="list"></div>',
    update(el, root) {
      label(el, root)
      const opts = (el.getAttribute('opts') ?? '').split('|').map((s) => s.trim()).filter(Boolean)
      const cur = el.getAttribute('value') ?? opts[0] ?? ''
      fieldText(el, root, cur)
      put(q(root, '.pre'), null)
      put(q(root, '.post'), 'chevron-down')
      const list = q(root, '.list')
      list.style.display = el.hasAttribute('open') ? '' : 'none'
      list.replaceChildren(
        ...opts.map((o) => {
          const d = document.createElement('div')
          d.textContent = o
          if (o === cur) d.dataset.sel = ''
          return d
        }),
      )
    },
  },
  checkbox: box,
  radio: box,
  switch: box,
  slider: {
    template: '<div class="label"></div><div class="track"><div class="fillbar"></div><div class="thumb"></div></div>',
    update(el, root) {
      label(el, root)
      const v = Math.min(100, Math.max(0, Number(el.getAttribute('value') ?? 50) || 0))
      q(root, '.fillbar').style.width = `${v}%`
      q(root, '.thumb').style.left = `${v}%`
    },
  },
}
