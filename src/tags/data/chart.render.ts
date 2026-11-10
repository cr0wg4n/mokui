import { v } from '../../theme/scale'
import { q, type Renderer } from '../../runtime/dom'

const NS = 'http://www.w3.org/2000/svg'
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
const accent = v('accent')

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

export const chartRenderers: Record<string, Renderer> = {
  chart: { template: '<svg viewBox="0 0 300 160" preserveAspectRatio="none"></svg><div class="labs"></div>', update(el, root) {
    drawChart(el, root)
    q(root, '.labs').replaceChildren(...(el.getAttribute('labels') ?? '').split('|').filter(Boolean).map((l) => Object.assign(document.createElement('span'), { textContent: l.trim() })))
  } },
}
