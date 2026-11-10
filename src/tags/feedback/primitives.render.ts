import { iconButton, put, q, svgIcon, type Renderer } from '../../runtime/dom'

const alertIcon: Record<string, string> = { info: 'info', success: 'circle-check', warning: 'alert-triangle', error: 'circle-x' }

export const feedbackRenderers: Record<string, Renderer> = {
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
}
