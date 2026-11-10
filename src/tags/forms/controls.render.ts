import { put, q, type Renderer } from '../../runtime/dom'

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

export const formRenderers: Record<string, Renderer> = {
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
}
