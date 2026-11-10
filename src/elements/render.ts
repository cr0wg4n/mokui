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

export const renderers: Record<string, Renderer> = {
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
