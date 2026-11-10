import { afterEach } from 'vitest'
import { mount } from '../../src/index'

let hosts: HTMLElement[] = []
afterEach(() => {
  hosts.forEach((h) => h.remove())
  hosts = []
})

/** Mount DSL in a container of a given pixel width. */
export function render(src: string, width = 600): HTMLElement {
  const host = document.createElement('div')
  host.style.width = `${width}px`
  document.body.append(host)
  hosts.push(host)
  mount(host, src)
  return host
}
export const css = (el: Element) => getComputedStyle(el)
export const rect = (el: Element) => el.getBoundingClientRect()
export const tracks = (el: Element) => css(el).gridTemplateColumns.split(' ').filter(Boolean)
