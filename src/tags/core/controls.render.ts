import { svgIcon, put, q, type Renderer } from '../../runtime/dom'

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

export const controlRenderers: Record<string, Renderer> = {
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
