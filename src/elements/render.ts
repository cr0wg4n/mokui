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
const fieldTpl = '<div class="label"></div><div class="field"><span class="ico pre"></span><span class="txt"></span><span class="ico post"></span></div><div class="msg"></div>'
/** helper / error text under a field; an error also turns the border red */
const msg = (el: HTMLElement, root: ShadowRoot) => {
  const err = el.getAttribute('error')
  const m = q(root, '.msg')
  m.textContent = err ?? el.getAttribute('help') ?? ''
  m.classList.toggle('err', !!err)
  q(root, '.field').classList.toggle('err', !!err)
}

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
      msg(el, root)
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
      msg(el, root)
      fieldText(el, root)
      put(q(root, '.pre'), null)
      put(q(root, '.post'), null)
    },
  },
  select: {
    template: fieldTpl + '<div class="list"></div>',
    update(el, root) {
      label(el, root)
      msg(el, root)
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

const NS = 'http://www.w3.org/2000/svg'
const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const sample: Record<string, number[]> = {
  line: [30, 45, 28, 60, 52, 75, 68],
  area: [30, 45, 28, 60, 52, 75, 68],
  bar: [40, 65, 30, 80, 55, 70, 48],
  donut: [40, 25, 20, 15],
  pie: [45, 30, 15, 10],
}
const el = (tag: string, attrs: Record<string, string | number>) => {
  const e = document.createElementNS(NS, tag)
  for (const [k, val] of Object.entries(attrs)) e.setAttribute(k, String(val))
  return e
}
const accent = 'var(--mk-accent,#18181b)'

/** Deterministic chart: fake data by default, `values` overrides. Never random. */
function drawChart(host: HTMLElement, root: ShadowRoot) {
  const kind = host.getAttribute('kind') ?? 'line'
  const given = (host.getAttribute('values') ?? '').split(',').map((x) => x.trim()).filter(Boolean).map(Number).filter((x) => !Number.isNaN(x) && x >= 0)
  const vals = given.length ? given : sample[kind]!
  const svg = root.querySelector('svg')!
  svg.replaceChildren()
  const round = kind === 'donut' || kind === 'pie'
  svg.setAttribute('viewBox', round ? '0 0 120 120' : '0 0 300 160')
  svg.setAttribute('preserveAspectRatio', round ? 'xMidYMid meet' : 'none')
  if (round) {
    const r = kind === 'donut' ? 40 : 25
    const w = kind === 'donut' ? 18 : 50
    const c = 2 * Math.PI * r
    const total = vals.reduce((a, b) => a + b, 0) || 1
    let acc = 0
    vals.forEach((val, i) => {
      const len = (val / total) * c
      svg.append(el('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: accent, 'stroke-opacity': Math.max(1 - i * 0.28, 0.12), 'stroke-width': w, 'stroke-dasharray': `${Math.max(len - 1, 0)} ${c - Math.max(len - 1, 0)}`, 'stroke-dashoffset': -acc, transform: 'rotate(-90 60 60)' }))
      acc += len
    })
    return
  }
  const max = Math.max(...vals, 1) * 1.1
  for (const y of [30, 70, 110, 150]) svg.append(el('line', { x1: 0, x2: 300, y1: y, y2: y, stroke: 'var(--mk-line,#e4e4e7)', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }))
  const n = vals.length
  if (kind === 'bar') {
    const bw = 300 / n
    vals.forEach((val, i) => {
      const h = (val / max) * 130
      svg.append(el('rect', { x: i * bw + bw * 0.2, y: 150 - h, width: bw * 0.6, height: h, rx: 3, fill: accent, 'fill-opacity': i === n - 1 ? 1 : 0.8 }))
    })
    return
  }
  const pts = vals.map((val, i) => [(n === 1 ? 150 : (i * 300) / (n - 1)), 150 - (val / max) * 130] as const)
  const list = pts.map(([x, y]) => `${x},${y}`).join(' ')
  if (kind === 'area') svg.append(el('polygon', { points: `0,150 ${list} 300,150`, fill: accent, 'fill-opacity': 0.12 }))
  svg.append(el('polyline', { points: list, fill: 'none', stroke: accent, 'stroke-width': 2, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }))
}

/** Month grid from a fixed month (default 2026-11): never reads the current date. */
function drawCalendar(host: HTMLElement, root: ShadowRoot) {
  const [y, m] = (host.getAttribute('month') ?? '2026-11').split('-').map(Number) as [number, number]
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const prev = new Date(Date.UTC(y, m - 1, 0)).getUTCDate()
  const sel = Number(host.getAttribute('value')) || 0
  const [from, to] = (host.getAttribute('range') ?? '').split('-').map(Number)
  const cells: HTMLElement[] = days.map((d) => Object.assign(document.createElement('span'), { className: 'dow', textContent: d }))
  const add = (n: number, cls: string) => cells.push(Object.assign(document.createElement('span'), { className: cls, textContent: String(n) }))
  for (let i = lead - 1; i >= 0; i--) add(prev - i, 'out')
  for (let d = 1; d <= dim; d++) add(d, d === sel ? 'sel' : from && to && d >= from && d <= to ? 'in' : '')
  for (let d = 1; cells.length % 7 !== 0; d++) add(d, 'out')
  q(root, '.title').textContent = `${months[m - 1]} ${y}`
  q(root, '.g').replaceChildren(...cells)
}

const tabLike = (cls: string, host: HTMLElement, root: ShadowRoot, labels: string[], idx: number) => {
  q(root, `.${cls}`).replaceChildren(
    ...labels.map((l, i) => {
      const b = document.createElement('button')
      b.className = cls === 'seg' ? 'sb' : 'tabbtn'
      b.setAttribute('role', 'tab')
      b.setAttribute('aria-selected', String(i === idx))
      b.dataset.i = String(i)
      b.textContent = l
      return b
    }),
  )
  void host
}

const alertIcon: Record<string, string> = { info: 'info', success: 'circle-check', warning: 'alert-triangle', error: 'circle-x' }

Object.assign(renderers, {
  divider: {
    template: '<i class="l"></i><span class="t"></span><i class="l"></i>',
    update: (el, root) => (q(root, '.t').textContent = el.getAttribute('label') ?? ''),
  },
  alert: {
    template: '<span class="ico"></span><div class="c"><div class="t"></div><slot></slot></div><button class="xbtn" aria-label="Dismiss"></button>',
    setup: (el, root) => iconButton(root, '.xbtn', 'x', () => (el.hidden = true)),
    update(el, root) {
      put(q(root, '.ico'), alertIcon[el.getAttribute('variant') ?? 'info'] ?? 'info')
      q(root, '.t').textContent = el.getAttribute('label') ?? ''
    },
  },
  progress: {
    template: '<div class="bar"></div>',
    update(el, root) {
      const val = Math.min(100, Math.max(0, Number(el.getAttribute('value') ?? 50) || 0))
      q(root, '.bar').style.width = `${val}%`
      el.setAttribute('aria-valuenow', String(val))
    },
  },
  skeleton: {
    template: '',
    update(el, root) {
      const n = Math.min(5, Math.max(1, Number(el.getAttribute('lines')) || 1))
      root.replaceChildren(...Array.from({ length: n }, () => Object.assign(document.createElement('div'), { className: 'bar' })))
    },
  },
  rating: {
    template: '',
    update(el, root) {
      const val = Math.round(Math.min(5, Math.max(0, Number(el.getAttribute('value') ?? 0) || 0)))
      root.replaceChildren(
        ...Array.from({ length: 5 }, (_, i) => {
          const s = svgIcon('star')
          if (i < val) s.setAttribute('fill', 'currentColor')
          else s.classList.add('off')
          return s
        }),
      )
    },
  },
  chip: {
    template: '<span class="ico"></span><slot></slot><span class="rm"></span>',
    update(el, root) {
      put(q(root, '.ico'), el.getAttribute('icon'))
      put(q(root, '.rm'), el.hasAttribute('x') ? 'x' : null)
    },
  },
  chart: { template: '<svg viewBox="0 0 300 160" preserveAspectRatio="none"></svg><div class="labs"></div>', update(el, root) {
    drawChart(el, root)
    q(root, '.labs').replaceChildren(...(el.getAttribute('labels') ?? '').split('|').filter(Boolean).map((l) => Object.assign(document.createElement('span'), { textContent: l.trim() })))
  } },
  calendar: {
    template: '<div class="head"><span class="title"></span><span class="nav"></span></div><div class="g"></div>',
    update: drawCalendar,
  },
  video: {
    template: '<span class="play"></span><slot></slot>',
    update: (_el, root) => put(q(root, '.play'), 'play'),
  },
  segmented: {
    template: '<div class="seg" role="tablist"></div>',
    setup(el, root) {
      q(root, '.seg').addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
        if (b) el.setAttribute('active', String(Number(b.dataset.i) + 1))
      })
    },
    update(el, root) {
      const labels = (el.getAttribute('opts') ?? '').split('|').map((t) => t.trim()).filter(Boolean)
      tabLike('seg', el, root, labels, Math.min(Math.max((Number(el.getAttribute('active')) || 1) - 1, 0), Math.max(labels.length - 1, 0)))
    },
  },
  upload: {
    template: '<span class="ico"></span><div class="t"></div><div class="s">or click to browse</div>',
    update(el, root) {
      put(q(root, '.ico'), 'cloud-upload')
      q(root, '.t').textContent = el.getAttribute('label') ?? 'Drop files here'
    },
  },
  otp: {
    template: '',
    update(el, root) {
      const n = Number(el.getAttribute('n')) || 6
      const val = el.getAttribute('value') ?? ''
      root.replaceChildren(...Array.from({ length: n }, (_, i) => Object.assign(document.createElement('span'), { className: 'd', textContent: val[i] ?? '' })))
    },
  },
} satisfies Record<string, Renderer>)
