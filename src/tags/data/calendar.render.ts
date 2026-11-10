import { q, type Renderer } from '../../runtime/dom'

const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

export const calendarRenderers: Record<string, Renderer> = {
  calendar: {
    template: '<div class="head"><span class="title"></span><span class="nav"></span></div><div class="g"></div>',
    update: drawCalendar,
  },
}
