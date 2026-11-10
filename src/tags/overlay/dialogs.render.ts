import { iconButton, put, q, title, type Renderer } from '../../runtime/dom'

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

export const dialogRenderers: Record<string, Renderer> = {
  modal: dialog,
  drawer: dialog,
  toast: {
    template: '<span class="msg"><slot></slot></span><button class="x" aria-label="Close"></button>',
    setup: (el, root) => iconButton(root, '.x', 'x', () => close(el)),
  },
}
