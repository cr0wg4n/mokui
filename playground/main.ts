import { mount, outline } from 'mokui'

const sample = `// Try: change widths with the slider, edit values, break the syntax.
stack g=lg p=lg
  navbar "Acme"
    icon bell
    avatar "AM"
  row g=md dir=col dir-md=row
    card "Sign in" w=lg #login
      input email label="Email" "you@x.com"
      input password label="Password" "Password"
      checkbox checked "Remember me"
      button primary full #submit note="POST /login" "Sign in"
    card "Overview"
      tabs "Week|Month|Year" active=2
      grid cols=1 cols-md=3 g=md
        box p=md
          text sm muted "Visits"
          text xl bold "1,204"
        box p=md
          text sm muted "Users"
          text xl bold "320"
        box p=md
          text sm muted "Tasks"
          text xl bold "48"
      table "Name|Role|Status"
        tr "Ana|Admin|Active"
        tr "Bo|Viewer|Away"
  row g=md align=center
    select label="Plan" "Free|Pro|Team"
    slider 60
    switch on "Beta"
    badge primary "New"
`
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const src = $<HTMLTextAreaElement>('src')
const app = $('app')
const err = $('err')
const w = $<HTMLInputElement>('w')
const store = (k: string, v?: string) => {
  try {
    return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v)
  } catch {
    return null
  }
}

const render = () => {
  app.style.width = `${w.value}px`
  $('wv').textContent = w.value
  try {
    mount(app, src.value)
    $('outline').textContent = outline(src.value)
    err.textContent = ''
  } catch (e) {
    err.textContent = (e as Error).message
  }
  store('mokui-src-v2', src.value)
}
src.value = store('mokui-src-v2') ?? sample
src.addEventListener('input', render)
w.addEventListener('input', render)
render()
