import { accents, fonts, loadTheme, mount, outline, radii, themeCssText, themeFromColor, themes, type ThemeOptions } from 'mokui'
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

// ---------- theme editor: controls <-> a theme file (JSON) ----------
const tbase = $<HTMLSelectElement>('tbase')
const tradius = $<HTMLSelectElement>('tradius')
const tfont = $<HTMLSelectElement>('tfont')
const tcolor = $<HTMLInputElement>('tcolor')
const tneutrals = $<HTMLInputElement>('tneutrals')
const tjson = $<HTMLTextAreaElement>('themejson')
const swatches = $('swatches')
const fill = (sel: HTMLSelectElement, values: string[], first?: string) =>
  sel.replaceChildren(...(first !== undefined ? [first] : []).concat(values).map((v) => Object.assign(document.createElement('option'), { value: v === first ? '' : v, textContent: v })))
fill(tbase, Object.keys(themes))
fill(tradius, Object.keys(radii), 'default')
fill(tfont, Object.keys(fonts), 'default')

let accent = '' // '' = the theme's own accent; a name from `accents`; or a #hex
const swatch = (name: string, color: string | null) => {
  const b = Object.assign(document.createElement('button'), { className: color ? 'sw' : 'sw none', title: name })
  if (color) b.style.background = color
  b.dataset.accent = name === 'default' ? '' : name
  b.addEventListener('click', () => ((accent = b.dataset.accent ?? ''), themeChanged()))
  return b
}
swatches.replaceChildren(swatch('default', null), ...Object.entries(accents).map(([n, [light]]) => swatch(n, light)))

const hexOf = (a: string, dark: boolean) => (a in accents ? accents[a]![dark ? 1 : 0] : a)

/** The theme file the controls describe. */
const fromControls = (): ThemeOptions => {
  const t: ThemeOptions = { base: tbase.value }
  if (accent) t.accent = accent
  if (tradius.value) t.radius = tradius.value as ThemeOptions['radius']
  if (tfont.value) t.font = tfont.value as ThemeOptions['font']
  if (tneutrals.checked && accent) t.tokens = themeFromColor(hexOf(accent, tbase.value === 'dark'), { mode: tbase.value === 'dark' ? 'dark' : 'light' })
  return t
}
const toControls = (t: ThemeOptions) => {
  tbase.value = t.base ?? 'modern'
  tradius.value = t.radius ?? ''
  tfont.value = t.font ?? ''
  accent = t.accent ?? ''
  tneutrals.checked = !!t.tokens && 'bg' in t.tokens
  if (accent.startsWith('#')) tcolor.value = accent
}
let theme: ThemeOptions = {}

const paintSwatches = () => swatches.querySelectorAll<HTMLElement>('.sw').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.accent ?? '') === accent)))
function themeChanged(fromJson = false) {
  if (!fromJson) {
    theme = fromControls()
    tjson.value = JSON.stringify(theme, null, 2)
    $('themeerr').textContent = ''
  }
  paintSwatches()
  store('mokui-v4-theme', JSON.stringify(theme))
  render()
}
for (const el of [tbase, tradius, tfont, tneutrals]) el.addEventListener('input', () => themeChanged())
tcolor.addEventListener('input', () => ((accent = tcolor.value), themeChanged()))
tjson.addEventListener('input', () => {
  try {
    const { name: _name, ...file } = loadTheme(JSON.parse(tjson.value))
    theme = file
    toControls(theme)
    $('themeerr').textContent = ''
    themeChanged(true)
  } catch (e) {
    $('themeerr').textContent = (e as Error).message
  }
})
const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {})
$('tcopyjson').addEventListener('click', () => copy(tjson.value))
$('tcopycss').addEventListener('click', () => copy(themeCssText(theme)))
$('treset').addEventListener('click', () => (toControls({}), themeChanged()))

// ---------- examples ----------
picker.replaceChildren(...examples.map((e) => Object.assign(document.createElement('option'), { value: e.id, textContent: e.label })))
const current = () => examples.find((e) => e.id === picker.value) ?? examples[0]!

function render() {
  app.style.width = `${w.value}px`
  $('wv').textContent = w.value
  try {
    mount(app, src.value, { theme })
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

try {
  theme = loadTheme(JSON.parse(store('mokui-v4-theme') ?? '{}'))
} catch {
  theme = {}
}
toControls(theme)
tjson.value = JSON.stringify(theme, null, 2)
paintSwatches()
load()
