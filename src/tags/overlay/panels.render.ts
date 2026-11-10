import { put, q, title, type Renderer } from '../../runtime/dom'


export const panelRenderers: Record<string, Renderer> = {
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
      root.querySelector('slot')!.addEventListener('slotchange', () => this.update!(el, root))
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
}
