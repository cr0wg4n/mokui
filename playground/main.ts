import { mount, outline, type ThemeName } from 'mokui'
import { examples } from './examples'

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const src = $<HTMLTextAreaElement>('src')
const app = $('app')
const err = $('err')
const w = $<HTMLInputElement>('w')
const picker = $<HTMLSelectElement>('example')
const store = (k: string, v?: string) => {
  try {
    return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v)
  } catch {
    return null
  }
}

picker.replaceChildren(...examples.map((e) => Object.assign(document.createElement('option'), { value: e.id, textContent: e.label })))
const current = () => examples.find((e) => e.id === picker.value) ?? examples[0]!

const render = () => {
  app.style.width = `${w.value}px`
  $('wv').textContent = w.value
  try {
    mount(app, src.value, { theme: $<HTMLSelectElement>('theme').value as ThemeName })
    $('outline').textContent = outline(src.value)
    err.textContent = ''
  } catch (e) {
    err.textContent = (e as Error).message
  }
  // edits are kept per example; picking an example again shows your last edit
  store(`mokui-v4-${current().id}`, src.value)
}

const load = () => {
  src.value = store(`mokui-v4-${current().id}`) ?? current().src
  app.style.minHeight = ''
  render()
}

picker.value = store('mokui-v4-example') ?? examples[0]!.id
if (!picker.value) picker.value = examples[0]!.id
picker.addEventListener('input', () => (store('mokui-v4-example', picker.value), load()))
src.addEventListener('input', render)
w.addEventListener('input', render)
$('theme').addEventListener('input', render)
load()
