import { expect, it } from 'vitest'
import { mount } from '../../src/index'

it('mount renders registered custom elements with shadow roots', () => {
  const el = document.createElement('div')
  mount(el, 'row g=md\n  icon search')
  const icon = el.querySelector('mk-icon')!
  expect(icon.shadowRoot!.querySelector('svg')).not.toBeNull()
  expect(customElements.get('mk-row')).toBeDefined()
})
